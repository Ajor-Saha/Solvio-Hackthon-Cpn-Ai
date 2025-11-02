import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import { eq, inArray } from 'drizzle-orm';
import { Request, Response } from 'express';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { departmentTable } from '../db/schema/tbl-department';
import { userTable } from '../db/schema/tbl-user';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';
import { sendEmployeeDetailsEmail } from '../utils/send-user-crediential';

// Add single student or faculty
export const addUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const adminUser = req.user;

    // Check if user is department admin
    if (adminUser?.role !== 'department_admin') {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, 'Only department admins can add users'));
    }

    const { firstName, lastName, email, role, departmentId } = req.body;

    // Validate required fields
    if (
      [firstName, email, role].some(
        field => !field || (typeof field === 'string' && field.trim() === '')
      )
    ) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, {}, 'First name, email, and role are required')
        );
    }

    // Validate role
    if (!['student', 'faculty'].includes(role)) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, {}, 'Role must be either student or faculty')
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

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, 'User already exists with this email'));
    }

    // Generate random password
    const generatedPassword = `${firstName.toLowerCase()}${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create new user
    const newUser = {
      userId: uuidv4(),
      firstName: firstName.trim(),
      lastName: lastName?.trim() || null,
      email: email.trim(),
      password: hashedPassword,
      departmentId: targetDepartmentId,
      role,
      isVerified: true,
    };

    const [createdUser] = await db
      .insert(userTable)
      .values(newUser)
      .returning();

    // Remove sensitive fields from response
    const {
      password: _,
      verifyCode,
      verifyCodeExpiry,
      ...userWithoutPassword
    } = createdUser;

    // Return user with generated credentials
    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: userWithoutPassword,
          credentials: {
            email: createdUser.email,
            password: generatedPassword,
          },
        },
        `${role === 'student' ? 'Student' : 'Faculty'} added successfully`
      )
    );
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

// Add multiple users via CSV
export const addUsersFromCSV = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const adminUser = req.user;

      // Check if user is department admin
      if (adminUser?.role !== 'department_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(403, {}, 'Only department admins can add users')
          );
      }

      // Check if file is uploaded
      if (!req.file) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'CSV file is required'));
      }

      const { departmentId } = req.body;
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
        // Delete uploaded file
        await fs.unlink(req.file.filepath);
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      // Read and parse CSV file
      const fileContent = await fs.readFile(req.file.filepath, 'utf-8');

      let records: any[];
      try {
        records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } catch (parseError) {
        await fs.unlink(req.file.filepath);
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Invalid CSV format'));
      }

      // Delete uploaded file after reading
      await fs.unlink(req.file.filepath);

      if (!records || records.length === 0) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'CSV file is empty'));
      }

      // Validate CSV headers (firstName, lastName, email, role)
      const requiredHeaders = ['firstName', 'email', 'role'];
      const firstRecord = records[0];
      const hasRequiredHeaders = requiredHeaders.every(
        header => header in firstRecord
      );

      if (!hasRequiredHeaders) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'CSV must have columns: firstName, lastName (optional), email, role'
            )
          );
      }

      const successfulUsers: any[] = [];
      const failedUsers: any[] = [];

      // Process each record
      for (const record of records) {
        try {
          const { firstName, lastName, email, role } = record;

          // Validate required fields
          if (!firstName || !email || !role) {
            failedUsers.push({
              email: email || 'N/A',
              reason: 'Missing required fields (firstName, email, or role)',
            });
            continue;
          }

          // Validate role
          if (!['student', 'faculty'].includes(role.toLowerCase())) {
            failedUsers.push({
              email,
              reason: 'Role must be either student or faculty',
            });
            continue;
          }

          // Check if user already exists
          const existingUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email.trim()));

          if (existingUser.length > 0) {
            failedUsers.push({
              email,
              reason: 'User already exists with this email',
            });
            continue;
          }

          // Generate random password
          const generatedPassword = `${firstName.toLowerCase()}${Math.floor(
            1000 + Math.random() * 9000
          )}`;
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);

          // Create new user
          const newUser = {
            userId: uuidv4(),
            firstName: firstName.trim(),
            lastName: lastName?.trim() || null,
            email: email.trim(),
            password: hashedPassword,
            departmentId: targetDepartmentId,
            role: role.toLowerCase(),
            isVerified: true,
          };

          const [createdUser] = await db
            .insert(userTable)
            .values(newUser)
            .returning();

          // Remove sensitive fields
          const {
            password: _,
            verifyCode,
            verifyCodeExpiry,
            ...userWithoutPassword
          } = createdUser;

          successfulUsers.push({
            user: userWithoutPassword,
            credentials: {
              email: createdUser.email,
              password: generatedPassword,
            },
          });
        } catch (error) {
          failedUsers.push({
            email: record.email || 'N/A',
            reason: 'Error processing user',
          });
        }
      }

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            summary: {
              total: records.length,
              successful: successfulUsers.length,
              failed: failedUsers.length,
            },
            successfulUsers,
            failedUsers,
          },
          `Processed ${records.length} users. ${successfulUsers.length} added successfully, ${failedUsers.length} failed.`
        )
      );
    } catch (error) {
      console.error('Error adding users from CSV:', error);

      // Clean up file if it exists
      if (req.file?.filepath) {
        try {
          await fs.unlink(req.file.filepath);
        } catch {}
      }

      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Get all users in admin's department
export const getDepartmentUsers = asyncHandler(
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
              'Only department admins can view department users'
            )
          );
      }

      const { role } = req.query;

      // Build query
      let query = db
        .select({
          userId: userTable.userId,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email,
          avatar: userTable.avatar,
          role: userTable.role,
          departmentId: userTable.departmentId,
          isVerified: userTable.isVerified,
          createdAt: userTable.createdAt,
          updatedAt: userTable.updatedAt,
        })
        .from(userTable)
        .where(eq(userTable.departmentId, adminUser.departmentId!));

      const users = await query;

      // Filter by role if provided
      let filteredUsers = users;
      if (role && typeof role === 'string') {
        filteredUsers = users.filter(user => user.role === role);
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            filteredUsers,
            'Department users retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error getting department users:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

// Send credentials to multiple users via email
export const sendCredentialsToUsers = asyncHandler(
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
              'Only department admins can send credentials'
            )
          );
      }

      const { userIds } = req.body;

      // Validate userIds
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'User IDs array is required and cannot be empty'
            )
          );
      }

      // Limit to 10 users per request
      if (userIds.length > 10) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'Maximum 10 users can be processed per request'
            )
          );
      }

      // Fetch users from database
      const users = await db
        .select()
        .from(userTable)
        .where(inArray(userTable.userId, userIds));

      if (users.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'No users found with provided IDs'));
      }

      // Verify all users belong to admin's department
      const usersNotInDepartment = users.filter(
        user => user.departmentId !== adminUser.departmentId
      );

      if (usersNotInDepartment.length > 0) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              {},
              'You can only send credentials to users in your department'
            )
          );
      }

      // Verify all users are students or faculty
      const invalidRoleUsers = users.filter(
        user => !['student', 'faculty'].includes(user.role)
      );

      if (invalidRoleUsers.length > 0) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'Credentials can only be sent to students or faculty'
            )
          );
      }

      // Get department name
      const [department] = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, adminUser.departmentId!));

      const departmentName = department?.name || 'Your Institution';

      const successfulEmails: any[] = [];
      const failedEmails: any[] = [];

      // Reset password and send email for each user
      for (const user of users) {
        try {
          // Generate new password
          const newPassword = `${user.firstName.toLowerCase()}${Math.floor(
            1000 + Math.random() * 9000
          )}`;
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          // Update user password in database
          await db
            .update(userTable)
            .set({ password: hashedPassword })
            .where(eq(userTable.userId, user.userId));

          // Send email with credentials
          const emailResult = await sendEmployeeDetailsEmail(
            user.email,
            user.firstName,
            newPassword,
            departmentName
          );

          if (emailResult.success) {
            successfulEmails.push({
              userId: user.userId,
              email: user.email,
              name: `${user.firstName} ${user.lastName || ''}`.trim(),
              role: user.role,
            });
          } else {
            failedEmails.push({
              userId: user.userId,
              email: user.email,
              name: `${user.firstName} ${user.lastName || ''}`.trim(),
              role: user.role,
              reason: emailResult.message || 'Failed to send email',
            });
          }
        } catch (error) {
          console.error(`Error processing user ${user.userId}:`, error);
          failedEmails.push({
            userId: user.userId,
            email: user.email,
            name: `${user.firstName} ${user.lastName || ''}`.trim(),
            role: user.role,
            reason: 'Error processing request',
          });
        }
      }

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            summary: {
              total: users.length,
              successful: successfulEmails.length,
              failed: failedEmails.length,
            },
            successfulEmails,
            failedEmails,
          },
          `Credentials sent to ${successfulEmails.length} out of ${users.length} users`
        )
      );
    } catch (error) {
      console.error('Error sending credentials:', error);
      res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);
