import { eq, isNull } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { institutionTable } from '../db/schema/tbl-institution';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @route POST /api/institution/create
 * @desc Create a new institution
 * @access Private (Admin only)
 */
export const createInstitution = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { name, code } = req.body;

      // Validate required fields
      if (!name || !code || name.trim() === '' || code.trim() === '') {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Name and code are required fields'));
      }

      // Check if institution with the same code already exists
      const existingInstitution = await db
        .select()
        .from(institutionTable)
        .where(eq(institutionTable.code, code.trim()));

      if (existingInstitution.length > 0) {
        return res
          .status(409)
          .json(
            new ApiResponse(
              409,
              {},
              'Institution with this code already exists'
            )
          );
      }

      // Create new institution
      const newInstitution = {
        institutionId: uuidv4(),
        name: name.trim(),
        code: code.trim().toUpperCase(),
      };

      const [createdInstitution] = await db
        .insert(institutionTable)
        .values(newInstitution)
        .returning();

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            createdInstitution,
            'Institution created successfully'
          )
        );
    } catch (error) {
      console.error('Error creating institution:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route GET /api/institution/list
 * @desc Get all institutions
 * @access Private
 */
export const getAllInstitutions = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const institutions = await db
        .select({
          institutionId: institutionTable.institutionId,
          name: institutionTable.name,
          code: institutionTable.code,
          createdAt: institutionTable.createdAt,
          updatedAt: institutionTable.updatedAt,
        })
        .from(institutionTable)
        .where(isNull(institutionTable.deletedAt));

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            institutions,
            'Institutions retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route GET /api/institution/:institutionId
 * @desc Get institution by ID
 * @access Private
 */
export const getInstitutionById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { institutionId } = req.params;

      if (!institutionId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Institution ID is required'));
      }

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

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            institution[0],
            'Institution retrieved successfully'
          )
        );
    } catch (error) {
      console.error('Error fetching institution:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route PUT /api/institution/update/:institutionId
 * @desc Update institution
 * @access Private (Admin only)
 */
export const updateInstitution = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { institutionId } = req.params;
      const { name, code } = req.body;

      if (!institutionId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Institution ID is required'));
      }

      // Check if institution exists
      const existingInstitution = await db
        .select()
        .from(institutionTable)
        .where(eq(institutionTable.institutionId, institutionId))
        .limit(1);

      if (!existingInstitution.length || existingInstitution[0].deletedAt) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Institution not found'));
      }

      // If code is being updated, check for duplicates
      if (code && code.trim() !== existingInstitution[0].code) {
        const duplicateCode = await db
          .select()
          .from(institutionTable)
          .where(eq(institutionTable.code, code.trim().toUpperCase()));

        if (duplicateCode.length > 0) {
          return res
            .status(409)
            .json(
              new ApiResponse(
                409,
                {},
                'Institution with this code already exists'
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

      const [updatedInstitution] = await db
        .update(institutionTable)
        .set(updateData)
        .where(eq(institutionTable.institutionId, institutionId))
        .returning();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedInstitution,
            'Institution updated successfully'
          )
        );
    } catch (error) {
      console.error('Error updating institution:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);

/**
 * @route DELETE /api/institution/delete/:institutionId
 * @desc Soft delete institution
 * @access Private (Admin only)
 */
export const deleteInstitution = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { institutionId } = req.params;

      if (!institutionId) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, 'Institution ID is required'));
      }

      // Check if institution exists
      const existingInstitution = await db
        .select()
        .from(institutionTable)
        .where(eq(institutionTable.institutionId, institutionId))
        .limit(1);

      if (!existingInstitution.length || existingInstitution[0].deletedAt) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, 'Institution not found'));
      }

      // Soft delete by setting deletedAt timestamp
      await db
        .update(institutionTable)
        .set({ deletedAt: new Date() })
        .where(eq(institutionTable.institutionId, institutionId));

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Institution deleted successfully'));
    } catch (error) {
      console.error('Error deleting institution:', error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'Internal server error'));
    }
  }
);
