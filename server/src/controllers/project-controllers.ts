import { and, eq, isNull } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { courseEnrollmentTable, courseTable } from '../db/schema/tbl-course';
import { projectTable } from '../db/schema/tbl-project';
import { projectStudentTable } from '../db/schema/tbl-project-student';
import { userTable } from '../db/schema/tbl-user';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

// Create a new project
export const createProject = asyncHandler(
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
              'Only faculty or department admins can create projects'
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
        projectUrl,
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
              'At least one student must be assigned to the project'
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
                'You must be an instructor of this course to create projects'
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
              'No valid students to assign to the project'
            )
          );
      }

      // Create the project
      const projectId = uuidv4();
      const newProject = {
        projectId,
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        supervisorId: user.userId,
        status: status || 'proposed',
        startDate: startDate || null,
        endDate: endDate || null,
        projectUrl: projectUrl?.trim() || null,
      };

      const [createdProject] = await db
        .insert(projectTable)
        .values(newProject)
        .returning();

      // Create project-student relationships
      const projectStudents = validStudents.map(studentId => ({
        id: uuidv4(),
        projectId,
        studentId,
        role: 'member' as const,
      }));

      await db.insert(projectStudentTable).values(projectStudents);

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

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            project: createdProject,
            assignedStudents,
            summary: {
              total: studentIds.length,
              assigned: validStudents.length,
              failed: invalidStudents.length,
            },
            invalidStudents:
              invalidStudents.length > 0 ? invalidStudents : undefined,
          },
          'Project created successfully'
        )
      );
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get all projects for a course
export const getCourseProjects = asyncHandler(
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

      // Get all projects for the course
      const projects = await db
        .select({
          projectId: projectTable.projectId,
          courseId: projectTable.courseId,
          title: projectTable.title,
          description: projectTable.description,
          supervisorId: projectTable.supervisorId,
          status: projectTable.status,
          startDate: projectTable.startDate,
          endDate: projectTable.endDate,
          projectUrl: projectTable.projectUrl,
          createdAt: projectTable.createdAt,
          updatedAt: projectTable.updatedAt,
          supervisorFirstName: userTable.firstName,
          supervisorLastName: userTable.lastName,
          supervisorEmail: userTable.email,
        })
        .from(projectTable)
        .innerJoin(userTable, eq(projectTable.supervisorId, userTable.userId))
        .where(
          and(
            eq(projectTable.courseId, courseId),
            isNull(projectTable.deletedAt)
          )
        );

      // Get students for each project
      const projectsWithStudents = await Promise.all(
        projects.map(async project => {
          const students = await db
            .select({
              userId: userTable.userId,
              firstName: userTable.firstName,
              lastName: userTable.lastName,
              email: userTable.email,
              avatar: userTable.avatar,
              role: projectStudentTable.role,
              joinedAt: projectStudentTable.joinedAt,
            })
            .from(projectStudentTable)
            .innerJoin(
              userTable,
              eq(projectStudentTable.studentId, userTable.userId)
            )
            .where(eq(projectStudentTable.projectId, project.projectId));

          return {
            ...project,
            students,
          };
        })
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            projectsWithStudents,
            'Projects retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error getting course projects:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get a single project by ID
export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Project ID is required'));
      }

      // Get project details
      const projects = await db
        .select({
          projectId: projectTable.projectId,
          courseId: projectTable.courseId,
          title: projectTable.title,
          description: projectTable.description,
          supervisorId: projectTable.supervisorId,
          status: projectTable.status,
          startDate: projectTable.startDate,
          endDate: projectTable.endDate,
          projectUrl: projectTable.projectUrl,
          createdAt: projectTable.createdAt,
          updatedAt: projectTable.updatedAt,
          supervisorFirstName: userTable.firstName,
          supervisorLastName: userTable.lastName,
          supervisorEmail: userTable.email,
        })
        .from(projectTable)
        .innerJoin(userTable, eq(projectTable.supervisorId, userTable.userId))
        .where(
          and(
            eq(projectTable.projectId, projectId),
            isNull(projectTable.deletedAt)
          )
        );

      if (projects.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Project not found'));
      }

      const project = projects[0];

      // Get students for the project
      const students = await db
        .select({
          userId: userTable.userId,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email,
          avatar: userTable.avatar,
          role: projectStudentTable.role,
          joinedAt: projectStudentTable.joinedAt,
        })
        .from(projectStudentTable)
        .innerJoin(
          userTable,
          eq(projectStudentTable.studentId, userTable.userId)
        )
        .where(eq(projectStudentTable.projectId, projectId));

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { ...project, students },
            'Project retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error getting project:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);
