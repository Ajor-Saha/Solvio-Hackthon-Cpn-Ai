import { and, count, desc, eq, ilike, isNull, or, sql, SQL } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { achievementTable } from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /api/achievements
 * Create new achievement (admin/faculty only)
 */
export const createAchievement = asyncHandler(async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      achievementType = 'award',
      awardedTo,
      awardingOrganization,
      achievementDate,
      certificateUrl,
      imageUrl,
      featured = false,
      status = 'published',
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
    awardedTo = awardedTo?.trim();
    awardingOrganization = awardingOrganization?.trim();
    achievementType = achievementType?.toLowerCase();
    status = status?.toLowerCase();

    if (!title || !description) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Title and description are required'));
    }

    const validTypes = ['award', 'certification', 'recognition', 'scholarship', 'publication', 'patent', 'other'];
    if (!validTypes.includes(achievementType)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid achievement type'));
    }

    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid status'));
    }

    const newAchievement = {
      achievementId: uuid(),
      departmentId: user.departmentId!,
      postedBy: user.userId,
      title,
      description,
      achievementType,
      awardedTo: awardedTo || null,
      awardingOrganization: awardingOrganization || null,
      achievementDate: achievementDate ? new Date(achievementDate) : null,
      certificateUrl: certificateUrl || null,
      imageUrl: imageUrl || null,
      featured: Boolean(featured),
      status,
      publishedAt: status === 'published' ? new Date() : null,
    };

    const [createdAchievement] = await db
      .insert(achievementTable)
      .values(newAchievement)
      .returning();

    return res
      .status(201)
      .json(new ApiResponse(201, createdAchievement, 'Achievement created successfully'));
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * PUT /api/achievements/:achievementId
 * Update achievement (admin/faculty owner only)
 */
export const updateAchievement = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    // Check if achievement exists and user owns it
    const existingAchievement = await db
      .select()
      .from(achievementTable)
      .where(
        and(
          eq(achievementTable.achievementId, achievementId),
          isNull(achievementTable.deletedAt)
        )
      );

    if (existingAchievement.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Achievement not found'));
    }

    if (user.role !== 'department_admin' && existingAchievement[0].postedBy !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only edit your own achievements'));
    }

    const updateData: any = {};
    const { title, description, achievementType, awardedTo, awardingOrganization, achievementDate, certificateUrl, imageUrl, featured, status } = req.body;

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (achievementType !== undefined) updateData.achievementType = achievementType.toLowerCase();
    if (awardedTo !== undefined) updateData.awardedTo = awardedTo.trim() || null;
    if (awardingOrganization !== undefined) updateData.awardingOrganization = awardingOrganization.trim() || null;
    if (achievementDate !== undefined) updateData.achievementDate = achievementDate ? new Date(achievementDate) : null;
    if (certificateUrl !== undefined) updateData.certificateUrl = certificateUrl || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (status !== undefined) {
      updateData.status = status.toLowerCase();
      if (status === 'published' && !existingAchievement[0].publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updatedAchievement] = await db
      .update(achievementTable)
      .set(updateData)
      .where(eq(achievementTable.achievementId, achievementId))
      .returning();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedAchievement, 'Achievement updated successfully'));
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/achievements
 * List achievements (public/students see published only, admins see all)
 */
export const listAchievements = asyncHandler(async (req: Request, res: Response) => {
  const {
    type,
    featured,
    search,
    page = '1',
    limit = '10',
    status = 'published',
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);
  const offset = (pageNum - 1) * limitNum;

  const user = req.user;
  const filtersCondition = [isNull(achievementTable.deletedAt)];

  // Status filtering
  if (!user || user.role === 'student') {
    // Public/students see only published
    filtersCondition.push(eq(achievementTable.status, 'published'));
  } else if (user.role === 'department_admin') {
    // Admin sees all in their department
    filtersCondition.push(eq(achievementTable.departmentId, user.departmentId!));
    if (status !== 'all') {
      filtersCondition.push(eq(achievementTable.status, status as string));
    }
  }

  // Additional filters
  if (type) {
    filtersCondition.push(eq(achievementTable.achievementType, type as string));
  }
  if (featured === 'true') {
    filtersCondition.push(eq(achievementTable.featured, true));
  }
  if (search) {
    const searchCondition = or(
      ilike(achievementTable.title, `%${search}%`),
      ilike(achievementTable.description, `%${search}%`),
      ilike(achievementTable.awardedTo, `%${search}%`)
    );
    filtersCondition.push(searchCondition);
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, achievements] = await Promise.all([
    db.select({ count: count() }).from(achievementTable).where(whereClause),
    db
      .select()
      .from(achievementTable)
      .where(whereClause)
      .orderBy(desc(achievementTable.publishedAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: achievements,
        total,
        page: pageNum,
        limit: limitNum,
        filtersApplied: { type, featured, search },
      },
      'Achievements fetched successfully'
    )
  );
});

/**
 * GET /api/achievements/:achievementId
 * Get achievement details
 */
export const getAchievementById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    const user = req.user;

    const whereConditions = [
      eq(achievementTable.achievementId, achievementId),
      isNull(achievementTable.deletedAt),
    ];

    // Public users can only see published achievements
    if (!user || user.role === 'student') {
      whereConditions.push(eq(achievementTable.status, 'published'));
    }

    const achievement = await db
      .select()
      .from(achievementTable)
      .where(and(...whereConditions));

    if (achievement.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Achievement not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, achievement[0], 'Achievement details fetched successfully'));
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * DELETE /api/achievements/:achievementId
 * Soft delete achievement (admin/faculty owner only)
 */
export const deleteAchievement = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const existingAchievement = await db
      .select()
      .from(achievementTable)
      .where(
        and(
          eq(achievementTable.achievementId, achievementId),
          isNull(achievementTable.deletedAt)
        )
      );

    if (existingAchievement.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Achievement not found'));
    }

    if (user.role !== 'department_admin' && existingAchievement[0].postedBy !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only delete your own achievements'));
    }

    await db
      .update(achievementTable)
      .set({ deletedAt: new Date() })
      .where(eq(achievementTable.achievementId, achievementId));

    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, 'Achievement deleted successfully'));
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/achievements/admin/list
 * List admin achievements (admin only)
 */
export const listAdminAchievements = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    status = 'all',
    page = '1',
    limit = '20',
  } = req.query;

  const user = req.user;

  if (!user?.role || user.role !== 'department_admin') {
    return res
      .status(403)
      .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 20, 50);
  const offset = (pageNum - 1) * limitNum;

  const filtersCondition = [
    eq(achievementTable.departmentId, user.departmentId!),
    isNull(achievementTable.deletedAt)
  ];

  if (status !== 'all') {
    filtersCondition.push(eq(achievementTable.status, status as string));
  }

  if (q) {
    const searchCondition = or(
      ilike(achievementTable.title, `%${q}%`),
      ilike(achievementTable.description, `%${q}%`),
      ilike(achievementTable.awardedTo, `%${q}%`)
    );
    filtersCondition.push(searchCondition);
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, achievements] = await Promise.all([
    db.select({ count: count() }).from(achievementTable).where(whereClause),
    db
      .select()
      .from(achievementTable)
      .where(whereClause)
      .orderBy(desc(achievementTable.createdAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: achievements,
        total,
        page: pageNum,
        limit: limitNum,
      },
      'Admin achievements fetched successfully'
    )
  );
});

/**
 * GET /api/achievements/stats
 * Get achievement statistics (admin only)
 */
export const getAchievementStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user?.role || user.role !== 'department_admin') {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const whereCondition = and(
      eq(achievementTable.departmentId, user.departmentId!),
      isNull(achievementTable.deletedAt)
    );

    const [totalResult, publishedResult, draftResult, featuredResult] = await Promise.all([
      db.select({ count: count() }).from(achievementTable).where(whereCondition),
      db
        .select({ count: count() })
        .from(achievementTable)
        .where(and(whereCondition, eq(achievementTable.status, 'published'))),
      db
        .select({ count: count() })
        .from(achievementTable)
        .where(and(whereCondition, eq(achievementTable.status, 'draft'))),
      db
        .select({ count: count() })
        .from(achievementTable)
        .where(and(whereCondition, eq(achievementTable.featured, true))),
    ]);

    const stats = {
      total: Number(totalResult[0]?.count) || 0,
      published: Number(publishedResult[0]?.count) || 0,
      draft: Number(draftResult[0]?.count) || 0,
      featured: Number(featuredResult[0]?.count) || 0,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, 'Achievement stats fetched successfully'));
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});
