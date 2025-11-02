import { and, eq, isNull } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { departmentTable } from '../db/schema/tbl-department';
import { institutionTable } from '../db/schema/tbl-institution';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @route POST /api/department/create
 * @desc Create a new department
 * @access Private (Admin only)
 */
export const createDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { institutionId, name, code } = req.body;

      // Validate required fields
      if (
        !institutionId ||
        !name ||
        !code ||
        name.trim() === '' ||
        code.trim() === ''
      ) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              'Institution ID, name, and code are required fields'
            )
          );
      }

      // Verify institution exists
      const institution = await db
        .select()
        .from(institutionTable)
        .where(eq(institutionTable.institutionId, institutionId))
        .limit(1);

      if (!institution.length || institution[0].deletedAt) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Institution not found'));
      }

      // Check if department with the same code already exists in this institution
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(
          and(
            eq(departmentTable.institutionId, institutionId),
            eq(departmentTable.code, code.trim().toUpperCase())
          )
        );

      if (existingDepartment.length > 0) {
        return res
          .status(409)
          .json(
            new ApiResponse(
              409,
              {},
              'Department with this code already exists in this institution'
            )
          );
      }

      // Create new department
      const newDepartment = {
        departmentId: uuidv4(),
        institutionId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
      };

      const [createdDepartment] = await db
        .insert(departmentTable)
        .values(newDepartment)
        .returning();

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            createdDepartment,
            'Department created successfully'
          )
        );
    } catch (error) {
      console.error('Error creating department:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route GET /api/department/list
 * @desc Get all departments
 * @access Private
 */
export const getAllDepartments = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const departments = await db
        .select({
          departmentId: departmentTable.departmentId,
          institutionId: departmentTable.institutionId,
          name: departmentTable.name,
          code: departmentTable.code,
          createdAt: departmentTable.createdAt,
          updatedAt: departmentTable.updatedAt,
          institutionName: institutionTable.name,
          institutionCode: institutionTable.code,
        })
        .from(departmentTable)
        .leftJoin(
          institutionTable,
          eq(departmentTable.institutionId, institutionTable.institutionId)
        )
        .where(isNull(departmentTable.deletedAt));

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            departments,
            'Departments retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error fetching departments:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route GET /api/department/by-institution/:institutionId
 * @desc Get all departments by institution
 * @access Private
 */
export const getDepartmentsByInstitution = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { institutionId } = req.params;

      if (!institutionId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Institution ID is required'));
      }

      // Verify institution exists
      const institution = await db
        .select()
        .from(institutionTable)
        .where(eq(institutionTable.institutionId, institutionId))
        .limit(1);

      if (!institution.length || institution[0].deletedAt) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Institution not found'));
      }

      const departments = await db
        .select({
          departmentId: departmentTable.departmentId,
          institutionId: departmentTable.institutionId,
          name: departmentTable.name,
          code: departmentTable.code,
          createdAt: departmentTable.createdAt,
          updatedAt: departmentTable.updatedAt,
        })
        .from(departmentTable)
        .where(
          and(
            eq(departmentTable.institutionId, institutionId),
            isNull(departmentTable.deletedAt)
          )
        );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            departments,
            'Departments retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error fetching departments:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route GET /api/department/:departmentId
 * @desc Get department by ID
 * @access Private
 */
export const getDepartmentById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;

      if (!departmentId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Department ID is required'));
      }

      const department = await db
        .select({
          departmentId: departmentTable.departmentId,
          institutionId: departmentTable.institutionId,
          name: departmentTable.name,
          code: departmentTable.code,
          createdAt: departmentTable.createdAt,
          updatedAt: departmentTable.updatedAt,
          deletedAt: departmentTable.deletedAt,
          institutionName: institutionTable.name,
          institutionCode: institutionTable.code,
        })
        .from(departmentTable)
        .leftJoin(
          institutionTable,
          eq(departmentTable.institutionId, institutionTable.institutionId)
        )
        .where(eq(departmentTable.departmentId, departmentId))
        .limit(1);

      if (!department.length || department[0].deletedAt) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            department[0],
            'Department retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error fetching department:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route PUT /api/department/update/:departmentId
 * @desc Update department
 * @access Private (Admin only)
 */
export const updateDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const { name, code } = req.body;

      if (!departmentId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Department ID is required'));
      }

      // Check if department exists
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, departmentId))
        .limit(1);

      if (!existingDepartment.length || existingDepartment[0].deletedAt) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      // If code is being updated, check for duplicates in the same institution
      if (code && code.trim() !== existingDepartment[0].code) {
        const duplicateCode = await db
          .select()
          .from(departmentTable)
          .where(
            and(
              eq(
                departmentTable.institutionId,
                existingDepartment[0].institutionId
              ),
              eq(departmentTable.code, code.trim().toUpperCase())
            )
          );

        if (duplicateCode.length > 0) {
          return res
            .status(409)
            .json(
              new ApiResponse(
                409,
                {},
                'Department with this code already exists in this institution'
              )
            );
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (name && name.trim() !== '') {
        updateData.name = name.trim();
      }
      if (code && code.trim() !== '') {
        updateData.code = code.trim().toUpperCase();
      }

      if (Object.keys(updateData).length === 0) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, {}, 'No valid fields provided for update')
          );
      }

      const [updatedDepartment] = await db
        .update(departmentTable)
        .set(updateData)
        .where(eq(departmentTable.departmentId, departmentId))
        .returning();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedDepartment,
            'Department updated successfully'
          )
        );
    } catch (error) {
      console.error('Error updating department:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route DELETE /api/department/delete/:departmentId
 * @desc Soft delete department
 * @access Private (Admin only)
 */
export const deleteDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;

      if (!departmentId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Department ID is required'));
      }

      // Check if department exists
      const existingDepartment = await db
        .select()
        .from(departmentTable)
        .where(eq(departmentTable.departmentId, departmentId))
        .limit(1);

      if (!existingDepartment.length || existingDepartment[0].deletedAt) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Department not found'));
      }

      // Soft delete by setting deletedAt timestamp
      await db
        .update(departmentTable)
        .set({ deletedAt: new Date() })
        .where(eq(departmentTable.departmentId, departmentId));

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Department deleted successfully'));
    } catch (error) {
      console.error('Error deleting department:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);
