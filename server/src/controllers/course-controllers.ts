import { and, eq, isNull } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { courseEnrollmentTable, courseTable } from '../db/schema/tbl-course';
import { departmentTable } from '../db/schema/tbl-department';
import { userTable } from '../db/schema/tbl-user';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

// Create a new course
export const createCourse = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const adminUser = req.user;

      // Check if user is department admin
      if (adminUser?.role !== 'department_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'Only department admins can create courses'
            )
          );
      }

      const { courseCode, title, semester, credits, capacity, departmentId } =
        req.body;

      // Validate required fields
      if (
        [courseCode, title, semester, credits].some(
          field =>
            field === undefined ||
            field === null ||
            (typeof field === 'string' && field.trim() === '')
        )
      ) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'Course code, title, semester, and credits are required'
            )
          );
      }

      // Use admin's department if departmentId not provided
      const targetDepartmentId = departmentId || adminUser.departmentId;

      // Validate department exists
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, targetDepartmentId));

      if (
        existingDepartment.length === 0 ||
        existingDepartment[0].deletedAt !== null
      ) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      // Check if course code already exists in the department
      const existingCourse = await db
        .select()
        .from(courseTable)
        .where(
          and(
            eq(courseTable.departmentId, targetDepartmentId),
            eq(courseTable.courseCode, courseCode.toUpperCase()),
            isNull(courseTable.deletedAt)
          )
        );

      console.log('Course creation check:', {
        targetDepartmentId,
        courseCode: courseCode.toUpperCase(),
        existingCourse: existingCourse.length,
        adminUserDepartment: adminUser.departmentId
      });

      if (existingCourse.length > 0) {
        console.log('Course already exists:', existingCourse[0]);
        return res
          .status(409)
          .json(
            new ApiResponse(
              409,
              {
                existingCourse: existingCourse[0],
                attemptedCode: courseCode.toUpperCase(),
                departmentId: targetDepartmentId
              },
              `Course with code "${courseCode.toUpperCase()}" already exists in the department`
            )
          );
      }

      // Create new course
      const newCourse = {
        courseId: uuidv4(),
        departmentId: targetDepartmentId,
        courseCode: courseCode.toUpperCase(),
        title: title.trim(),
        semester: semester.trim(),
        credits: parseInt(credits),
        capacity: capacity ? parseInt(capacity) : 30,
      };

      const [createdCourse] = await db
        .insert(courseTable)
        .values(newCourse)
        .returning();

      return res
        .status(201)
        .json(
          new ApiResponse(201, createdCourse, 'Course created successfully')
        );
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get all courses in a department
export const getAllCourses = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.query;

      if (!departmentId || typeof departmentId !== 'string') {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Department ID is required'));
      }

      // Validate department exists
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, departmentId));

      if (
        existingDepartment.length === 0 ||
        existingDepartment[0].deletedAt !== null
      ) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      const courses = await db
        .select()
        .from(courseTable)
        .where(
          and(
            eq(courseTable.departmentId, departmentId),
            isNull(courseTable.deletedAt)
          )
        );

      return res
        .status(200)
        .json(new ApiResponse(200, courses, 'Courses retrieved successfully'));
    } catch (error) {
      console.error('Error getting courses:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get all courses for current admin's department
export const getDepartmentCourses = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const adminUser = req.user;

      if (!adminUser?.departmentId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'User department not found'));
      }

      // Validate department exists
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, adminUser.departmentId));

      if (
        existingDepartment.length === 0 ||
        existingDepartment[0].deletedAt !== null
      ) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      const courses = await db
        .select()
        .from(courseTable)
        .where(
          and(
            eq(courseTable.departmentId, adminUser.departmentId),
            isNull(courseTable.deletedAt)
          )
        );

      return res
        .status(200)
        .json(new ApiResponse(200, courses, 'Courses retrieved successfully'));
    } catch (error) {
      console.error('Error getting department courses:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get courses by semester (using query parameter)
export const getCoursesBySemesterQuery = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const { semester } = req.query;

      console.log('getCoursesBySemesterQuery called with query:', req.query);
      console.log('Semester query parameter:', semester);

      if (!semester || typeof semester !== 'string') {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Semester query parameter is required'));
      }

      // Validate semester format (should be like "1/1", "2/2", etc.)
      if (!/^[1-4]\/[1-2]$/.test(semester)) {
        console.log('Invalid semester format:', semester);
        return res
          .status(400)
          .json(new ApiResponse(400, {}, `Invalid semester format: "${semester}". Should be like "1/1", "2/2", etc.`));
      }

      if (!user?.departmentId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'User department not found'));
      }

      // Validate department exists
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, user.departmentId));

      if (
        existingDepartment.length === 0 ||
        existingDepartment[0].deletedAt !== null
      ) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      const courses = await db
        .select()
        .from(courseTable)
        .where(
          and(
            eq(courseTable.departmentId, user.departmentId),
            eq(courseTable.semester, semester),
            isNull(courseTable.deletedAt)
          )
        );

      console.log(`Found ${courses.length} courses for semester ${semester} in department ${user.departmentId}`);
      console.log('Courses found:', courses);

      return res
        .status(200)
        .json(new ApiResponse(200, courses, `Courses for semester ${semester} retrieved successfully`));
    } catch (error) {
      console.error('Error getting courses by semester:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get courses by semester (using path parameter) - Original version with debugging
export const getCoursesBySemester = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const { semester } = req.params;

      console.log('getCoursesBySemester called with params:', req.params);
      console.log('Raw semester parameter:', semester);

      if (!semester) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Semester parameter is required'));
      }

      // The semester should already be URL-decoded by Express
      console.log('Decoded semester:', semester);

      // Validate semester format (should be like "1/1", "2/2", etc.)
      if (!/^[1-4]\/[1-2]$/.test(semester)) {
        console.log('Invalid semester format:', semester);
        return res
          .status(400)
          .json(new ApiResponse(400, {}, `Invalid semester format: "${semester}". Should be like "1/1", "2/2", etc.`));
      }

      if (!user?.departmentId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'User department not found'));
      }

      // Validate department exists
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, user.departmentId));

      if (
        existingDepartment.length === 0 ||
        existingDepartment[0].deletedAt !== null
      ) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      const courses = await db
        .select()
        .from(courseTable)
        .where(
          and(
            eq(courseTable.departmentId, user.departmentId),
            eq(courseTable.semester, semester),
            isNull(courseTable.deletedAt)
          )
        );

      console.log(`Found ${courses.length} courses for semester ${semester} in department ${user.departmentId}`);
      console.log('Courses found:', courses);

      return res
        .status(200)
        .json(new ApiResponse(200, courses, `Courses for semester ${semester} retrieved successfully`));
    } catch (error) {
      console.error('Error getting courses by semester:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get course by ID
export const getCourseById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Course ID is required'));
      }

      const course = await db
        .select()
        .from(courseTable)
        .where(
          and(eq(courseTable.courseId, courseId), isNull(courseTable.deletedAt))
        );

      if (course.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Course not found'));
      }

      return res
        .status(200)
        .json(new ApiResponse(200, course[0], 'Course retrieved successfully'));
    } catch (error) {
      console.error('Error getting course:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Update course
export const updateCourse = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const adminUser = req.user;

      // Check if user is department admin
      if (adminUser?.role !== 'department_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'Only department admins can update courses'
            )
          );
      }

      const { courseId } = req.params;
      const { courseCode, title, semester, credits, capacity } = req.body;

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

      // Build update object
      const updateData: any = {};
      if (courseCode) updateData.courseCode = courseCode.toUpperCase();
      if (title) updateData.title = title.trim();
      if (semester) updateData.semester = semester.trim();
      if (credits !== undefined) updateData.credits = parseInt(credits);
      if (capacity !== undefined) updateData.capacity = parseInt(capacity);
      updateData.updatedAt = new Date();

      if (Object.keys(updateData).length === 1) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, {}, 'No valid fields provided for update')
          );
      }

      // If updating courseCode, check for duplicates
      if (courseCode) {
        const duplicateCourse = await db
          .select()
          .from(courseTable)
          .where(
            and(
              eq(courseTable.departmentId, existingCourse[0].departmentId),
              eq(courseTable.courseCode, courseCode.toUpperCase()),
              isNull(courseTable.deletedAt)
            )
          );

        if (
          duplicateCourse.length > 0 &&
          duplicateCourse[0].courseId !== courseId
        ) {
          return res
            .status(409)
            .json(
              new ApiResponse(
                409,
                {},
                'Course with this code already exists in the department'
              )
            );
        }
      }

      const [updatedCourse] = await db
        .update(courseTable)
        .set(updateData)
        .where(eq(courseTable.courseId, courseId))
        .returning();

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedCourse, 'Course updated successfully')
        );
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Delete course (soft delete)
export const deleteCourse = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const adminUser = req.user;

      // Check if user is department admin
      if (adminUser?.role !== 'department_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'Only department admins can delete courses'
            )
          );
      }

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

      // Soft delete course
      await db
        .update(courseTable)
        .set({ deletedAt: new Date() })
        .where(eq(courseTable.courseId, courseId));

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Course deleted successfully'));
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Enroll single user (faculty/instructor) in course
export const enrollUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const adminUser = req.user;

    // Check if user is department admin
    if (adminUser?.role !== 'department_admin') {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            {},
            'Only department admins can enroll users in courses'
          )
        );
    }

    const { courseId, userId, roleInCourse } = req.body;

    // Validate required fields
    if (!courseId || !userId) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, 'Course ID and User ID are required'));
    }

    // Validate roleInCourse - only instructor allowed for single enrollment
    if (!roleInCourse || roleInCourse !== 'instructor') {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            {},
            'This endpoint is for instructor enrollment only. Use bulk enrollment for students.'
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
      return res.status(404).json(new ApiResponse(404, {}, 'Course not found'));
    }

    // Check if user exists and is faculty
    const existingUser = await db
      .select()
      .from(userTable)
      .where(and(eq(userTable.userId, userId), isNull(userTable.deletedAt)));

    if (existingUser.length === 0) {
      return res.status(404).json(new ApiResponse(404, {}, 'User not found'));
    }

    if (existingUser[0].role !== 'faculty') {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            {},
            'Only faculty members can be enrolled as instructors'
          )
        );
    }

    // Check if user is already enrolled
    const existingEnrollment = await db
      .select()
      .from(courseEnrollmentTable)
      .where(
        and(
          eq(courseEnrollmentTable.courseId, courseId),
          eq(courseEnrollmentTable.userId, userId),
          isNull(courseEnrollmentTable.deletedAt)
        )
      );

    if (existingEnrollment.length > 0) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, {}, 'User is already enrolled in this course')
        );
    }

    // Create enrollment
    const newEnrollment = {
      enrollmentId: uuidv4(),
      courseId,
      userId,
      roleInCourse: 'instructor' as 'instructor',
      enrollmentDate: new Date(),
    };

    const [createdEnrollment] = await db
      .insert(courseEnrollmentTable)
      .values(newEnrollment)
      .returning();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdEnrollment,
          'Instructor enrolled successfully'
        )
      );
  } catch (error) {
    console.error('Error enrolling user:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

// Bulk enroll students in course
export const bulkEnrollStudents = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const adminUser = req.user;

      // Check if user is department admin
      if (adminUser?.role !== 'department_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'Only department admins can enroll students in courses'
            )
          );
      }

      const { courseId, userIds } = req.body;

      // Validate required fields
      if (!courseId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Course ID is required'));
      }

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'User IDs array is required and must not be empty'
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

      // Get current enrollment count
      const currentEnrollments = await db
        .select()
        .from(courseEnrollmentTable)
        .where(
          and(
            eq(courseEnrollmentTable.courseId, courseId),
            eq(courseEnrollmentTable.roleInCourse, 'student'),
            isNull(courseEnrollmentTable.deletedAt)
          )
        );

      const currentCount = currentEnrollments.length;
      const capacity = existingCourse[0].capacity;
      const availableSlots = capacity - currentCount;

      if (userIds.length > availableSlots) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              `Not enough capacity. Available slots: ${availableSlots}, Requested: ${userIds.length}`
            )
          );
      }

      const successfulEnrollments: any[] = [];
      const failedEnrollments: any[] = [];

      for (const userId of userIds) {
        try {
          // Check if user exists and is a student
          const existingUser = await db
            .select()
            .from(userTable)
            .where(
              and(eq(userTable.userId, userId), isNull(userTable.deletedAt))
            );

          if (existingUser.length === 0) {
            failedEnrollments.push({
              userId,
              reason: 'User not found',
            });
            continue;
          }

          if (existingUser[0].role !== 'student') {
            failedEnrollments.push({
              userId,
              email: existingUser[0].email,
              reason: 'User is not a student',
            });
            continue;
          }

          // Check if user is already enrolled
          const existingEnrollment = await db
            .select()
            .from(courseEnrollmentTable)
            .where(
              and(
                eq(courseEnrollmentTable.courseId, courseId),
                eq(courseEnrollmentTable.userId, userId),
                isNull(courseEnrollmentTable.deletedAt)
              )
            );

          if (existingEnrollment.length > 0) {
            failedEnrollments.push({
              userId,
              email: existingUser[0].email,
              reason: 'Already enrolled in this course',
            });
            continue;
          }

          // Create enrollment
          const newEnrollment = {
            enrollmentId: uuidv4(),
            courseId,
            userId,
            roleInCourse: 'student' as 'student',
            enrollmentDate: new Date(),
          };

          const [createdEnrollment] = await db
            .insert(courseEnrollmentTable)
            .values(newEnrollment)
            .returning();

          successfulEnrollments.push({
            enrollmentId: createdEnrollment.enrollmentId,
            userId: createdEnrollment.userId,
            email: existingUser[0].email,
            firstName: existingUser[0].firstName,
            lastName: existingUser[0].lastName,
          });
        } catch (error) {
          failedEnrollments.push({
            userId,
            reason: 'Error processing enrollment',
          });
        }
      }

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            summary: {
              total: userIds.length,
              successful: successfulEnrollments.length,
              failed: failedEnrollments.length,
            },
            successfulEnrollments,
            failedEnrollments,
          },
          `Processed ${userIds.length} enrollments. ${successfulEnrollments.length} successful, ${failedEnrollments.length} failed.`
        )
      );
    } catch (error) {
      console.error('Error bulk enrolling students:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get course enrollments
export const getCourseEnrollments = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const { roleInCourse } = req.query;

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

      // Build query conditions
      const conditions = [
        eq(courseEnrollmentTable.courseId, courseId),
        isNull(courseEnrollmentTable.deletedAt),
      ];

      if (roleInCourse && typeof roleInCourse === 'string') {
        conditions.push(
          eq(courseEnrollmentTable.roleInCourse, roleInCourse as any)
        );
      }

      // Get enrollments with user details
      const enrollments = await db
        .select({
          enrollmentId: courseEnrollmentTable.enrollmentId,
          courseId: courseEnrollmentTable.courseId,
          userId: courseEnrollmentTable.userId,
          roleInCourse: courseEnrollmentTable.roleInCourse,
          enrollmentDate: courseEnrollmentTable.enrollmentDate,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email,
          avatar: userTable.avatar,
        })
        .from(courseEnrollmentTable)
        .innerJoin(
          userTable,
          eq(courseEnrollmentTable.userId, userTable.userId)
        )
        .where(and(...conditions));

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            enrollments,
            'Enrollments retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error getting enrollments:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get user's enrolled courses
export const getUserCourses = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'User ID is required'));
      }

      // Check if user exists
      const existingUser = await db
        .select()
        .from(userTable)
        .where(and(eq(userTable.userId, userId), isNull(userTable.deletedAt)));

      if (existingUser.length === 0) {
        return res.status(404).json(new ApiResponse(404, {}, 'User not found'));
      }

      // Get user's courses
      const courses = await db
        .select({
          enrollmentId: courseEnrollmentTable.enrollmentId,
          roleInCourse: courseEnrollmentTable.roleInCourse,
          enrollmentDate: courseEnrollmentTable.enrollmentDate,
          courseId: courseTable.courseId,
          courseCode: courseTable.courseCode,
          title: courseTable.title,
          semester: courseTable.semester,
          credits: courseTable.credits,
          capacity: courseTable.capacity,
        })
        .from(courseEnrollmentTable)
        .innerJoin(
          courseTable,
          eq(courseEnrollmentTable.courseId, courseTable.courseId)
        )
        .where(
          and(
            eq(courseEnrollmentTable.userId, userId),
            isNull(courseEnrollmentTable.deletedAt),
            isNull(courseTable.deletedAt)
          )
        );

      return res
        .status(200)
        .json(new ApiResponse(200, courses, 'Courses retrieved successfully'));
    } catch (error) {
      console.error('Error getting user courses:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);
