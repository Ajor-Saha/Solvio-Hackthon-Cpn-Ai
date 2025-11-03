import { and, eq, isNull } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { courseEnrollmentTable, courseTable } from '../db/schema/tbl-course';
import { researchTable } from '../db/schema/tbl-research';
import { researchStudentTable } from '../db/schema/tbl-research-student';
import { userTable } from '../db/schema/tbl-user';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResearchAssignmentEmail } from '../utils/send-research-notification';

// Create a new research
export const createResearch = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;

      // Check if user is faculty or department admin
      if (user?.role !== 'faculty' && user?.role !== 'department_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'Only faculty or department admins can create research'
            )
          );
      }

      const {
        courseId,
        title,
        description,
        status,
        startDate,
        endDate,
        publicationUrl,
        studentIds,
      } = req.body;

      // Validate required fields
      if (!courseId || !title || !studentIds || !Array.isArray(studentIds)) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'Course ID, title, and student IDs array are required'
            )
          );
      }

      if (studentIds.length === 0) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'At least one student must be assigned to the research'
            )
          );
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

      // Check if user is enrolled in the course as instructor (for faculty)
      if (user.role === 'faculty') {
        const enrollment = await db
          .select()
          .from(courseEnrollmentTable)
          .where(
            and(
              eq(courseEnrollmentTable.courseId, courseId),
              eq(courseEnrollmentTable.userId, user.userId),
              eq(courseEnrollmentTable.roleInCourse, 'instructor'),
              isNull(courseEnrollmentTable.deletedAt)
            )
          );

        if (enrollment.length === 0) {
          return res
            .status(403)
            .json(
              new ApiResponse(
                403,
                {},
                'You must be an instructor of this course to create research'
              )
            );
        }
      }

      // Validate all students exist and are enrolled in the course
      const validStudents: string[] = [];
      const invalidStudents: any[] = [];

      for (const studentId of studentIds) {
        // Check if user exists and is a student
        const student = await db
          .select()
          .from(userTable)
          .where(
            and(eq(userTable.userId, studentId), isNull(userTable.deletedAt))
          );

        if (student.length === 0) {
          invalidStudents.push({
            studentId,
            reason: 'User not found',
          });
          continue;
        }

        if (student[0].role !== 'student') {
          invalidStudents.push({
            studentId,
            email: student[0].email,
            reason: 'User is not a student',
          });
          continue;
        }

        // Check if student is enrolled in the course
        const enrollment = await db
          .select()
          .from(courseEnrollmentTable)
          .where(
            and(
              eq(courseEnrollmentTable.courseId, courseId),
              eq(courseEnrollmentTable.userId, studentId),
              eq(courseEnrollmentTable.roleInCourse, 'student'),
              isNull(courseEnrollmentTable.deletedAt)
            )
          );

        if (enrollment.length === 0) {
          invalidStudents.push({
            studentId,
            email: student[0].email,
            reason: 'Student is not enrolled in this course',
          });
          continue;
        }

        validStudents.push(studentId);
      }

      if (validStudents.length === 0) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              { invalidStudents },
              'No valid students to assign to the research'
            )
          );
      }

      // Create the research
      const researchId = uuidv4();
      const newResearch = {
        researchId,
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        supervisorId: user.userId,
        status: status || 'proposed',
        startDate: startDate || null,
        endDate: endDate || null,
        publicationUrl: publicationUrl?.trim() || null,
      };

      const [createdResearch] = await db
        .insert(researchTable)
        .values(newResearch)
        .returning();

      // Create research-student relationships
      const researchStudents = validStudents.map(studentId => ({
        id: uuidv4(),
        researchId,
        studentId,
        role: 'member' as const,
      }));

      await db.insert(researchStudentTable).values(researchStudents);

      // Fetch student details for response
      const studentDetails = await db
        .select({
          userId: userTable.userId,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email,
        })
        .from(userTable)
        .where(and(eq(userTable.role, 'student'), isNull(userTable.deletedAt)));

      const assignedStudents = studentDetails.filter(s =>
        validStudents.includes(s.userId)
      );

      // Send email notifications to all assigned students
      const emailResults = await Promise.allSettled(
        assignedStudents.map(async student => {
          const courseDetails = existingCourse[0];
          const supervisorName = `${user.firstName} ${user.lastName}`;

          // Prepare team members list
          const teamMembers = assignedStudents.map(s => ({
            firstName: s.firstName,
            lastName: s.lastName || '',
            email: s.email,
          }));

          return sendResearchAssignmentEmail(
            student.email,
            student.firstName,
            createdResearch.title,
            createdResearch.description,
            supervisorName,
            user.email,
            courseDetails.title,
            createdResearch.status,
            createdResearch.startDate,
            createdResearch.endDate,
            createdResearch.publicationUrl,
            teamMembers
          );
        })
      );

      // Count successful and failed emails
      const emailStats = {
        sent: emailResults.filter(
          r => r.status === 'fulfilled' && r.value.success
        ).length,
        failed: emailResults.filter(
          r =>
            r.status === 'rejected' ||
            (r.status === 'fulfilled' && !r.value.success)
        ).length,
      };

      console.log(
        `Email notifications: ${emailStats.sent} sent, ${emailStats.failed} failed`
      );

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            research: createdResearch,
            assignedStudents,
            summary: {
              total: studentIds.length,
              assigned: validStudents.length,
              failed: invalidStudents.length,
            },
            emailNotifications: emailStats,
            invalidStudents:
              invalidStudents.length > 0 ? invalidStudents : undefined,
          },
          'Research created successfully and notifications sent'
        )
      );
    } catch (error) {
      console.error('Error creating research:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get all research for a course
export const getCourseResearch = asyncHandler(
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

      // Get all research for the course
      const researchList = await db
        .select({
          researchId: researchTable.researchId,
          courseId: researchTable.courseId,
          title: researchTable.title,
          description: researchTable.description,
          supervisorId: researchTable.supervisorId,
          status: researchTable.status,
          startDate: researchTable.startDate,
          endDate: researchTable.endDate,
          publicationUrl: researchTable.publicationUrl,
          createdAt: researchTable.createdAt,
          updatedAt: researchTable.updatedAt,
          supervisorFirstName: userTable.firstName,
          supervisorLastName: userTable.lastName,
          supervisorEmail: userTable.email,
        })
        .from(researchTable)
        .innerJoin(userTable, eq(researchTable.supervisorId, userTable.userId))
        .where(
          and(
            eq(researchTable.courseId, courseId),
            isNull(researchTable.deletedAt)
          )
        );

      // Get students for each research
      const researchWithStudents = await Promise.all(
        researchList.map(async research => {
          const students = await db
            .select({
              userId: userTable.userId,
              firstName: userTable.firstName,
              lastName: userTable.lastName,
              email: userTable.email,
              avatar: userTable.avatar,
              role: researchStudentTable.role,
              joinedAt: researchStudentTable.joinedAt,
            })
            .from(researchStudentTable)
            .innerJoin(
              userTable,
              eq(researchStudentTable.studentId, userTable.userId)
            )
            .where(eq(researchStudentTable.researchId, research.researchId));

          return {
            ...research,
            students,
          };
        })
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            researchWithStudents,
            'Research retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error getting course research:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get a single research by ID
export const getResearchById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { researchId } = req.params;

      if (!researchId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Research ID is required'));
      }

      // Get research details
      const researchList = await db
        .select({
          researchId: researchTable.researchId,
          courseId: researchTable.courseId,
          title: researchTable.title,
          description: researchTable.description,
          supervisorId: researchTable.supervisorId,
          status: researchTable.status,
          startDate: researchTable.startDate,
          endDate: researchTable.endDate,
          publicationUrl: researchTable.publicationUrl,
          createdAt: researchTable.createdAt,
          updatedAt: researchTable.updatedAt,
          supervisorFirstName: userTable.firstName,
          supervisorLastName: userTable.lastName,
          supervisorEmail: userTable.email,
        })
        .from(researchTable)
        .innerJoin(userTable, eq(researchTable.supervisorId, userTable.userId))
        .where(
          and(
            eq(researchTable.researchId, researchId),
            isNull(researchTable.deletedAt)
          )
        );

      if (researchList.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Research not found'));
      }

      const research = researchList[0];

      // Get students for the research
      const students = await db
        .select({
          userId: userTable.userId,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email,
          avatar: userTable.avatar,
          role: researchStudentTable.role,
          joinedAt: researchStudentTable.joinedAt,
        })
        .from(researchStudentTable)
        .innerJoin(
          userTable,
          eq(researchStudentTable.studentId, userTable.userId)
        )
        .where(eq(researchStudentTable.researchId, researchId));

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { ...research, students },
            'Research retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error getting research:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);
