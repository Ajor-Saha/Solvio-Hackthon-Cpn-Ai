import { and, count, desc, eq, ilike, isNull, or, sql, SQL } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { competitionTable } from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /api/competitions
 * Create new competition (admin/faculty only)
 */
export const createCompetition = asyncHandler(async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      type = 'other',
      organizerName,
      location,
      eventDate,
      registrationDeadline,
      externalUrl,
      bannerUrl,
      status = 'active',
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
    organizerName = organizerName?.trim();
    location = location?.trim();
    type = type?.toLowerCase();
    status = status?.toLowerCase();

    if (!title || !description || !externalUrl) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Title, description, and external URL are required'));
    }

    const validTypes = ['hackathon', 'debate', 'datathon', 'programming_contest', 'math_competition', 'quiz', 'case_study', 'design_challenge', 'other'];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid competition type'));
    }

    const validStatuses = ['draft', 'active', 'closed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid status'));
    }

    const newCompetition = {
      competitionId: uuid(),
      departmentId: user.departmentId!,
      postedBy: user.userId,
      title,
      description,
      type,
      organizerName: organizerName || null,
      location: location || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      externalUrl,
      bannerUrl: bannerUrl || null,
      status,
      postedAt: status === 'active' ? new Date() : null,
    };

    const [createdCompetition] = await db
      .insert(competitionTable)
      .values(newCompetition)
      .returning();

    return res
      .status(201)
      .json(new ApiResponse(201, createdCompetition, 'Competition created successfully'));
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * PUT /api/competitions/:competitionId
 * Update competition (admin/faculty owner only)
 */
export const updateCompetition = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { competitionId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    // Check if competition exists and user owns it
    const existingCompetition = await db
      .select()
      .from(competitionTable)
      .where(
        and(
          eq(competitionTable.competitionId, competitionId),
          isNull(competitionTable.deletedAt)
        )
      );

    if (existingCompetition.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Competition not found'));
    }

    if (user.role !== 'department_admin' && existingCompetition[0].postedBy !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only edit your own competitions'));
    }

    const updateData: any = {};
    const { title, description, type, organizerName, location, eventDate, registrationDeadline, externalUrl, bannerUrl, status } = req.body;

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (type !== undefined) updateData.type = type.toLowerCase();
    if (organizerName !== undefined) updateData.organizerName = organizerName.trim() || null;
    if (location !== undefined) updateData.location = location.trim() || null;
    if (eventDate !== undefined) updateData.eventDate = eventDate ? new Date(eventDate) : null;
    if (registrationDeadline !== undefined) updateData.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl || null;
    if (status !== undefined) {
      updateData.status = status.toLowerCase();
      if (status === 'active' && !existingCompetition[0].postedAt) {
        updateData.postedAt = new Date();
      }
    }

    const [updatedCompetition] = await db
      .update(competitionTable)
      .set(updateData)
      .where(eq(competitionTable.competitionId, competitionId))
      .returning();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedCompetition, 'Competition updated successfully'));
  } catch (error) {
    console.error('Error updating competition:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/competitions
 * List competitions (public/students see active only, admins see all)
 */
export const listCompetitions = asyncHandler(async (req: Request, res: Response) => {
  const {
    type,
    location,
    upcoming,
    search,
    page = '1',
    limit = '10',
    status = 'active',
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);
  const offset = (pageNum - 1) * limitNum;

  const user = req.user;
  const filtersCondition = [isNull(competitionTable.deletedAt)];

  // Status filtering
  if (!user || user.role === 'student') {
    // Public/students see only active competitions
    filtersCondition.push(eq(competitionTable.status, 'active'));
    filtersCondition.push(
      or(
        isNull(competitionTable.registrationDeadline),
        sql`${competitionTable.registrationDeadline} >= CURRENT_DATE` as SQL
      )
    );
  } else if (user.role === 'department_admin') {
    // Admin sees all in their department
    filtersCondition.push(eq(competitionTable.departmentId, user.departmentId!));
    if (status !== 'all') {
      filtersCondition.push(eq(competitionTable.status, status as string));
    }
  }

  // Additional filters
  if (type) {
    filtersCondition.push(eq(competitionTable.type, type as string));
  }
  if (location) {
    filtersCondition.push(ilike(competitionTable.location, `%${location}%`));
  }
  if (upcoming === 'true') {
    filtersCondition.push(
      sql`${competitionTable.eventDate} >= CURRENT_DATE` as SQL
    );
  }
  if (search) {
    const searchCondition = or(
      ilike(competitionTable.title, `%${search}%`),
      ilike(competitionTable.description, `%${search}%`),
      ilike(competitionTable.organizerName, `%${search}%`)
    );
    filtersCondition.push(searchCondition);
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, competitions] = await Promise.all([
    db.select({ count: count() }).from(competitionTable).where(whereClause),
    db
      .select()
      .from(competitionTable)
      .where(whereClause)
      .orderBy(desc(competitionTable.postedAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: competitions,
        total,
        page: pageNum,
        limit: limitNum,
        filtersApplied: { type, location, upcoming, search },
      },
      'Competitions fetched successfully'
    )
  );
});

/**
 * GET /api/competitions/:competitionId
 * Get competition details
 */
export const getCompetitionById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { competitionId } = req.params;
    const user = req.user;

    const whereConditions = [
      eq(competitionTable.competitionId, competitionId),
      isNull(competitionTable.deletedAt),
    ];

    // Public users can only see active competitions
    if (!user || user.role === 'student') {
      whereConditions.push(eq(competitionTable.status, 'active'));
    }

    const competition = await db
      .select()
      .from(competitionTable)
      .where(and(...whereConditions));

    if (competition.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Competition not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, competition[0], 'Competition details fetched successfully'));
  } catch (error) {
    console.error('Error fetching competition:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * DELETE /api/competitions/:competitionId
 * Soft delete competition (admin/faculty owner only)
 */
export const deleteCompetition = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { competitionId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const existingCompetition = await db
      .select()
      .from(competitionTable)
      .where(
        and(
          eq(competitionTable.competitionId, competitionId),
          isNull(competitionTable.deletedAt)
        )
      );

    if (existingCompetition.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Competition not found'));
    }

    if (user.role !== 'department_admin' && existingCompetition[0].postedBy !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only delete your own competitions'));
    }

    await db
      .update(competitionTable)
      .set({ deletedAt: new Date() })
      .where(eq(competitionTable.competitionId, competitionId));

    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, 'Competition deleted successfully'));
  } catch (error) {
    console.error('Error deleting competition:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/competitions/admin/stats
 * Get competition statistics (admin only)
 */
export const getCompetitionStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user?.role || user.role !== 'department_admin') {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const whereCondition = and(
      eq(competitionTable.departmentId, user.departmentId!),
      isNull(competitionTable.deletedAt)
    );

    const [totalResult, activeResult, draftResult, closedResult] = await Promise.all([
      db.select({ count: count() }).from(competitionTable).where(whereCondition),
      db
        .select({ count: count() })
        .from(competitionTable)
        .where(and(whereCondition, eq(competitionTable.status, 'active'))),
      db
        .select({ count: count() })
        .from(competitionTable)
        .where(and(whereCondition, eq(competitionTable.status, 'draft'))),
      db
        .select({ count: count() })
        .from(competitionTable)
        .where(and(whereCondition, eq(competitionTable.status, 'closed'))),
    ]);

    const stats = {
      total: Number(totalResult[0]?.count) || 0,
      active: Number(activeResult[0]?.count) || 0,
      draft: Number(draftResult[0]?.count) || 0,
      closed: Number(closedResult[0]?.count) || 0,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, 'Competition stats fetched successfully'));
  } catch (error) {
    console.error('Error fetching competition stats:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/competitions/admin/list
 * List admin competitions (admin only)
 */
export const listAdminCompetitions = asyncHandler(async (req: Request, res: Response) => {
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
    eq(competitionTable.departmentId, user.departmentId!),
    isNull(competitionTable.deletedAt)
  ];

  if (status !== 'all') {
    filtersCondition.push(eq(competitionTable.status, status as string));
  }

  if (q) {
    const searchCondition = or(
      ilike(competitionTable.title, `%${q}%`),
      ilike(competitionTable.description, `%${q}%`)
    );
    filtersCondition.push(searchCondition);
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, competitions] = await Promise.all([
    db.select({ count: count() }).from(competitionTable).where(whereClause),
    db
      .select()
      .from(competitionTable)
      .where(whereClause)
      .orderBy(desc(competitionTable.createdAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: competitions,
        total,
        page: pageNum,
        limit: limitNum,
      },
      'Admin competitions fetched successfully'
    )
  );
});

/**
 * GET /api/competitions/admin/:competitionId
 * Get admin competition details (admin only)
 */
export const getAdminCompetitionById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { competitionId } = req.params;
    const user = req.user;

    if (!user?.role || user.role !== 'department_admin') {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const competition = await db
      .select()
      .from(competitionTable)
      .where(
        and(
          eq(competitionTable.competitionId, competitionId),
          eq(competitionTable.departmentId, user.departmentId!),
          isNull(competitionTable.deletedAt)
        )
      );

    if (competition.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Competition not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, competition[0], 'Competition details fetched successfully'));
  } catch (error) {
    console.error('Error fetching competition:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});
