import { PutObjectCommand } from '@aws-sdk/client-s3';
import { and, eq, isNull } from 'drizzle-orm';
import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { courseEnrollmentTable, courseTable } from '../db/schema/tbl-course';
import { courseResourceTable } from '../db/schema/tbl-course-resource';
import { userTable } from '../db/schema/tbl-user';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';
import { createR2Client } from '../utils/upload-r2';

// Upload course resource (faculty only)
export const uploadCourseResource = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const authUser = req.user;

      // Check if user is authenticated
      if (!authUser) {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, 'Unauthorized request'));
      }

      // Check if user is faculty or department admin
      if (authUser.role !== 'faculty' && authUser.role !== 'department_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'Only faculty members can upload course resources'
            )
          );
      }

      // Get file from req.files (uploadFilesMiddleware uses 'files' field)
      let file = null;
      if (req.files) {
        file = Array.isArray(req.files) ? req.files[0] : req.files;
      }

      const { courseId, title, description, resourceType } = req.body;

      // Extract array values from fields (formidable wraps fields in arrays)
      const courseIdValue = Array.isArray(courseId) ? courseId[0] : courseId;
      const titleValue = Array.isArray(title) ? title[0] : title;
      const descriptionValue = Array.isArray(description)
        ? description[0]
        : description;
      const resourceTypeValue = Array.isArray(resourceType)
        ? resourceType[0]
        : resourceType;

      // Validate required fields
      if (!courseIdValue || !titleValue || !resourceTypeValue) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'Course ID, title, and resource type are required'
            )
          );
      }

      // Validate resourceType enum
      const validResourceTypes = ['pdf', 'ppt', 'image', 'link'];
      // if (!validResourceTypes.includes(resourceTypeValue)) {
      //   return res
      //     .status(400)
      //     .json(
      //       new ApiResponse(
      //         400,
      //         {},
      //         'Resource type must be pdf, ppt, image, or link'
      //       )
      //     );
      // }

      // For link type, fileUrl should be in body; for others, file must be uploaded
      let fileUrl = '';
      let fileSize = null;

      if (resourceTypeValue === 'link') {
        const { fileUrl: linkUrl } = req.body;
        if (!linkUrl) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                400,
                {},
                'File URL is required for link resource type'
              )
            );
        }
        fileUrl = linkUrl;
      } else {
        // File upload required for pdf, ppt, image
        if (!file || !file.filepath) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                400,
                {},
                'File upload is required for this resource type'
              )
            );
        }

        // Check if course exists
        const existingCourse = await db
          .select()
          .from(courseTable)
          .where(
            and(
              eq(courseTable.courseId, courseIdValue),
              isNull(courseTable.deletedAt)
            )
          );

        if (existingCourse.length === 0) {
          // Clean up uploaded file if course not found
          await fs.unlink(file.filepath);
          return res
            .status(404)
            .json(new ApiResponse(404, {}, 'Course not found'));
        }

        // Verify user is enrolled as instructor in this course
        const enrollment = await db
          .select()
          .from(courseEnrollmentTable)
          .where(
            and(
              eq(courseEnrollmentTable.courseId, courseIdValue),
              eq(courseEnrollmentTable.userId, authUser.userId),
              eq(courseEnrollmentTable.roleInCourse, 'instructor'),
              isNull(courseEnrollmentTable.deletedAt)
            )
          );

        if (enrollment.length === 0 && authUser.role !== 'department_admin') {
          // Clean up uploaded file
          await fs.unlink(file.filepath);
          return res
            .status(403)
            .json(
              new ApiResponse(
                403,
                {},
                'You must be enrolled as an instructor to upload resources for this course'
              )
            );
        }

        // Create R2 client
        const r2 = createR2Client();

        // Read the file from the temporary path
        const buffer = await fs.readFile(file.filepath);
        const uniqueFileName = `course-resources/${nanoid()}-${encodeURIComponent(
          file.originalFilename || 'unnamed'
        )}`;

        // Upload file to R2
        await r2.send(
          new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME!,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: file.mimetype || 'application/octet-stream',
          })
        );

        // Clean up the temporary file
        await fs.unlink(file.filepath);

        // Construct file URL
        fileUrl = `${process.env.PUBLIC_ACCESS_URL}/${uniqueFileName}`;

        // Calculate file size in human-readable format
        const sizeInBytes = file.size || 0;
        if (sizeInBytes < 1024) {
          fileSize = `${sizeInBytes} B`;
        } else if (sizeInBytes < 1024 * 1024) {
          fileSize = `${(sizeInBytes / 1024).toFixed(2)} KB`;
        } else {
          fileSize = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
        }
      }

      // If resourceType is link, still verify course exists
      if (resourceTypeValue === 'link') {
        const existingCourse = await db
          .select()
          .from(courseTable)
          .where(
            and(
              eq(courseTable.courseId, courseIdValue),
              isNull(courseTable.deletedAt)
            )
          );

        if (existingCourse.length === 0) {
          return res
            .status(404)
            .json(new ApiResponse(404, {}, 'Course not found'));
        }

        // Verify user is enrolled as instructor in this course
        const enrollment = await db
          .select()
          .from(courseEnrollmentTable)
          .where(
            and(
              eq(courseEnrollmentTable.courseId, courseIdValue),
              eq(courseEnrollmentTable.userId, authUser.userId),
              eq(courseEnrollmentTable.roleInCourse, 'instructor'),
              isNull(courseEnrollmentTable.deletedAt)
            )
          );

        if (enrollment.length === 0 && authUser.role !== 'department_admin') {
          return res
            .status(403)
            .json(
              new ApiResponse(
                403,
                {},
                'You must be enrolled as an instructor to add resources for this course'
              )
            );
        }
      }

      // Create course resource entry
      const newResource = {
        resourceId: uuidv4(),
        courseId: courseIdValue,
        title: titleValue.trim(),
        description: descriptionValue?.trim() || null,
        resourceType: resourceTypeValue,
        fileUrl,
        fileSize,
        uploadedBy: authUser.userId,
      };

      const [createdResource] = await db
        .insert(courseResourceTable)
        .values(newResource)
        .returning();

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            createdResource,
            'Course resource uploaded successfully'
          )
        );
    } catch (error) {
      console.error('Error uploading course resource:', error);
      // Clean up uploaded file if exists
      if (req.file?.filepath) {
        try {
          await fs.unlink(req.file.filepath);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get all resources for a course
export const getCourseResources = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Course ID is required'));
      }

      // Check if course exists
      const existingCourse = await db
        .select()
        .from(courseTable)
        .where(
          and(eq(courseTable.courseId, courseId), isNull(courseTable.deletedAt))
        );

      if (existingCourse.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Course not found'));
      }

      // Get all resources for the course with uploader details
      const resources = await db
        .select({
          resourceId: courseResourceTable.resourceId,
          courseId: courseResourceTable.courseId,
          title: courseResourceTable.title,
          description: courseResourceTable.description,
          resourceType: courseResourceTable.resourceType,
          fileUrl: courseResourceTable.fileUrl,
          fileSize: courseResourceTable.fileSize,
          uploadedBy: courseResourceTable.uploadedBy,
          createdAt: courseResourceTable.createdAt,
          updatedAt: courseResourceTable.updatedAt,
          uploaderFirstName: userTable.firstName,
          uploaderLastName: userTable.lastName,
          uploaderEmail: userTable.email,
        })
        .from(courseResourceTable)
        .innerJoin(
          userTable,
          eq(courseResourceTable.uploadedBy, userTable.userId)
        )
        .where(
          and(
            eq(courseResourceTable.courseId, courseId),
            isNull(courseResourceTable.deletedAt)
          )
        );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            resources,
            'Course resources retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error getting course resources:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Delete course resource (soft delete)
export const deleteCourseResource = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const authUser = req.user;

      if (!authUser) {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, 'Unauthorized request'));
      }

      const { resourceId } = req.params;

      if (!resourceId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Resource ID is required'));
      }

      // Check if resource exists
      const existingResource = await db
        .select()
        .from(courseResourceTable)
        .where(
          and(
            eq(courseResourceTable.resourceId, resourceId),
            isNull(courseResourceTable.deletedAt)
          )
        );

      if (existingResource.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Resource not found'));
      }

      const resource = existingResource[0];

      // Only the uploader or department admin can delete
      if (
        resource.uploadedBy !== authUser.userId &&
        authUser.role !== 'department_admin'
      ) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'You do not have permission to delete this resource'
            )
          );
      }

      // Soft delete
      await db
        .update(courseResourceTable)
        .set({ deletedAt: new Date() })
        .where(eq(courseResourceTable.resourceId, resourceId));

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Resource deleted successfully'));
    } catch (error) {
      console.error('Error deleting course resource:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Update course resource
export const updateCourseResource = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const authUser = req.user;

      if (!authUser) {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, 'Unauthorized request'));
      }

      const { resourceId } = req.params;
      const { title, description } = req.body;

      if (!resourceId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Resource ID is required'));
      }

      // Check if resource exists
      const existingResource = await db
        .select()
        .from(courseResourceTable)
        .where(
          and(
            eq(courseResourceTable.resourceId, resourceId),
            isNull(courseResourceTable.deletedAt)
          )
        );

      if (existingResource.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Resource not found'));
      }

      const resource = existingResource[0];

      // Only the uploader or department admin can update
      if (
        resource.uploadedBy !== authUser.userId &&
        authUser.role !== 'department_admin'
      ) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'You do not have permission to update this resource'
            )
          );
      }

      // Build update object
      const updateData: any = { updatedAt: new Date() };
      if (title) updateData.title = title.trim();
      if (description !== undefined)
        updateData.description = description?.trim() || null;

      if (Object.keys(updateData).length === 1) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, {}, 'No valid fields provided for update')
          );
      }

      const [updatedResource] = await db
        .update(courseResourceTable)
        .set(updateData)
        .where(eq(courseResourceTable.resourceId, resourceId))
        .returning();

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedResource, 'Resource updated successfully')
        );
    } catch (error) {
      console.error('Error updating course resource:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);
