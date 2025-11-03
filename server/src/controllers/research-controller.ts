import { and, count, desc, eq, ilike, isNull, or, sql, SQL } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { researchTable } from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /api/research
 * Create new research (admin/faculty only)
 */
export const createResearch = asyncHandler(async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      courseId,
      supervisorId,
      status = 'proposed',
      startDate,
      endDate,
      publicationUrl,
    } = req.body;

    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    // Sanitize inputs
    title = title?.trim();
    description = description?.trim();
    status = status?.toLowerCase();

    if (!title || !courseId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Title and course ID are required'));
    }

    const validStatuses = ['proposed', 'ongoing', 'completed', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid status'));
    }

    const newResearch = {
      researchId: uuid(),
      courseId,
      title,
      description: description || null,
      supervisorId: supervisorId || user.userId, // Default to current user if not specified
      status: status as 'proposed' | 'ongoing' | 'completed' | 'published' | 'archived',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      publicationUrl: publicationUrl || null,
    };

    const [createdResearch] = await db
      .insert(researchTable)
      .values(newResearch)
      .returning();

    return res
      .status(201)
      .json(new ApiResponse(201, createdResearch, 'Research created successfully'));
  } catch (error) {
    console.error('Error creating research:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * PUT /api/research/:researchId
 * Update research (admin/faculty owner only)
 */
export const updateResearch = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { researchId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    // Check if research exists and user owns it
    const existingResearch = await db
      .select()
      .from(researchTable)
      .where(
        and(
          eq(researchTable.researchId, researchId),
          isNull(researchTable.deletedAt)
        )
      );

    if (existingResearch.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Research not found'));
    }

    if (user.role !== 'department_admin' && existingResearch[0].supervisorId !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only edit your own research'));
    }

    const updateData: any = {};
    const { title, description, courseId, supervisorId, status, startDate, endDate, publicationUrl } = req.body;

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim() || null;
    if (courseId !== undefined) updateData.courseId = courseId;
    if (supervisorId !== undefined) updateData.supervisorId = supervisorId;
    if (status !== undefined) updateData.status = status.toLowerCase();
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (publicationUrl !== undefined) updateData.publicationUrl = publicationUrl || null;

    const [updatedResearch] = await db
      .update(researchTable)
      .set(updateData)
      .where(eq(researchTable.researchId, researchId))
      .returning();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedResearch, 'Research updated successfully'));
  } catch (error) {
    console.error('Error updating research:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/research
 * List research (public/students see published only, admins see all)
 */
export const listResearches = asyncHandler(async (req: Request, res: Response) => {
  const {
    status = 'published',
    search,
    page = '1',
    limit = '10',
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);
  const offset = (pageNum - 1) * limitNum;

  const user = req.user;
  const filtersCondition = [isNull(researchTable.deletedAt)];

  // Status filtering
  if (!user || user.role === 'student') {
    // Public/students see only published research
    filtersCondition.push(eq(researchTable.status, 'published'));
  } else if (user.role === 'department_admin') {
    // Admin sees all research
    if (status !== 'all') {
      filtersCondition.push(eq(researchTable.status, status as string));
    }
  } else if (user.role === 'faculty') {
    // Faculty sees their own research
    filtersCondition.push(eq(researchTable.supervisorId, user.userId));
    if (status !== 'all') {
      filtersCondition.push(eq(researchTable.status, status as string));
    }
  }

  // Additional filters
  if (search) {
    const searchCondition = or(
      ilike(researchTable.title, `%${search}%`),
      ilike(researchTable.description, `%${search}%`)
    );
    filtersCondition.push(searchCondition);
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, research] = await Promise.all([
    db.select({ count: count() }).from(researchTable).where(whereClause),
    db
      .select()
      .from(researchTable)
      .where(whereClause)
      .orderBy(desc(researchTable.createdAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: research,
        total,
        page: pageNum,
        limit: limitNum,
        filtersApplied: { status, search },
      },
      'Research fetched successfully'
    )
  );
});

/**
 * GET /api/research/:researchId
 * Get research details
 */
export const getResearchById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { researchId } = req.params;
    const user = req.user;

    const whereConditions = [
      eq(researchTable.researchId, researchId),
      isNull(researchTable.deletedAt),
    ];

    // Public users can only see published research
    if (!user || user.role === 'student') {
      whereConditions.push(eq(researchTable.status, 'published'));
    }

    const research = await db
      .select()
      .from(researchTable)
      .where(and(...whereConditions));

    if (research.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Research not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, research[0], 'Research details fetched successfully'));
  } catch (error) {
    console.error('Error fetching research:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * DELETE /api/research/:researchId
 * Soft delete research (admin/faculty owner only)
 */
export const deleteResearch = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { researchId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const existingResearch = await db
      .select()
      .from(researchTable)
      .where(
        and(
          eq(researchTable.researchId, researchId),
          isNull(researchTable.deletedAt)
        )
      );

    if (existingResearch.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Research not found'));
    }

    if (user.role !== 'department_admin' && existingResearch[0].supervisorId !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only delete your own research'));
    }

    await db
      .update(researchTable)
      .set({ deletedAt: new Date() })
      .where(eq(researchTable.researchId, researchId));

    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, 'Research deleted successfully'));
  } catch (error) {
    console.error('Error deleting research:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/research/admin/stats
 * Get research statistics (admin only)
 */
export const getResearchStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user?.role || user.role !== 'department_admin') {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const whereCondition = isNull(researchTable.deletedAt);

    const [totalResult, ongoingResult, completedResult, publishedResult] = await Promise.all([
      db.select({ count: count() }).from(researchTable).where(whereCondition),
      db
        .select({ count: count() })
        .from(researchTable)
        .where(and(whereCondition, eq(researchTable.status, 'ongoing'))),
      db
        .select({ count: count() })
        .from(researchTable)
        .where(and(whereCondition, eq(researchTable.status, 'completed'))),
      db
        .select({ count: count() })
        .from(researchTable)
        .where(and(whereCondition, eq(researchTable.status, 'published'))),
    ]);

    const stats = {
      total: Number(totalResult[0]?.count) || 0,
      ongoing: Number(ongoingResult[0]?.count) || 0,
      completed: Number(completedResult[0]?.count) || 0,
      published: Number(publishedResult[0]?.count) || 0,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, 'Research stats fetched successfully'));
  } catch (error) {
    console.error('Error fetching research stats:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});
