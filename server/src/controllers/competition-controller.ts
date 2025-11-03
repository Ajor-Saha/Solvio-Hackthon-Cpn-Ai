import { count, desc } from 'drizzle-orm';
import {
  and,
  eq,
  gte,
  ilike,
  isNull,
} from 'drizzle-orm/sql/expressions/conditions';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { competitionTable } from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';
/**
 * POST /api/competitions
 * Create a new competition posting (Admin/Faculty only)
 * Required: title, description, type, externalUrl
 * Optional: organizerName, location, eventDate, registrationDeadline, bannerUrl, status (draft/active)
 * Flow: Validate input → Generate competitionId → Set postedAt if status='active' → Insert into DB
 * Success: { competitionId, title, status, postedAt? }
 */
export const createCompetition = asyncHandler(
  async (req: Request, res: Response) => {
    let {
      title,
      description,
      type,
      externalUrl,
      organizerName,
      location,
      eventDate,
      registrationDeadline,
      bannerUrl,
      status,
    } = req.body;

    const user = req.user;

    if (
      !user ||
      (user.role !== 'department_admin' && user.role !== 'faculty')
    ) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Forbidden: Insufficient permissions')
        );
    }

    // trim inputs
    title = title?.trim();
    description = description?.trim();
    type = type?.trim();
    externalUrl = externalUrl?.trim();
    organizerName = organizerName?.trim();
    location = location?.trim();
    bannerUrl = bannerUrl?.trim();
    eventDate = eventDate?.trim();
    registrationDeadline = registrationDeadline?.trim();
    status = status?.trim();

    // Input validation (simplified)
    if (!title || !description || !type || !externalUrl) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
    }

    const validStatuses = ['draft', 'active'];
    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status value' });
    }
    const newCompetition = {
      competitionId: uuid(),
      title,
      description,
      type,
      externalUrl,
      organizerName: organizerName || null,
      location: location || null,
      // eventDate is timestamp column - keep as Date object
      eventDate: eventDate ? new Date(eventDate) : null,
      // registrationDeadline is date column - convert to ISO date string (YYYY-MM-DD)
      registrationDeadline: registrationDeadline
        ? new Date(registrationDeadline).toISOString().split('T')[0]
        : null,
      bannerUrl: bannerUrl || null,
      status: status || 'draft',
      departmentId: user?.departmentId || null,
      postedBy: user?.userId || null,
      // postedAt is timestamp column - keep as Date object
      postedAt: status === 'active' ? new Date() : null,
    };

    const [competition] = await db
      .insert(competitionTable)
      .values(newCompetition)
      .returning({
        competitionId: competitionTable.competitionId,
        title: competitionTable.title,
        status: competitionTable.status,
        postedAt: competitionTable.postedAt,
        description: competitionTable.description,
        type: competitionTable.type,
        externalUrl: competitionTable.externalUrl,
        organizerName: competitionTable.organizerName,
        location: competitionTable.location,
        eventDate: competitionTable.eventDate,
        registrationDeadline: competitionTable.registrationDeadline,
        bannerUrl: competitionTable.bannerUrl,
      });

    // return created competition and mark response to avoid unused-variable lint/error
    return res
      .status(201)
      .json(
        new ApiResponse(201, competition, 'Competition created successfully')
      );
  }
);

/**
 * PUT /api/competitions/:competitionId
 * Update existing competition (Admin/Faculty only)
 * Required: competitionId in URL
 * Optional: any updatable fields (title, description, type, etc.)
 * Flow: Check ownership (same dept) → Apply partial updates → Update updatedAt
 * Success: { competitionId, updatedAt, updated fields }
 */

export const updateCompetition = asyncHandler(
  async (req: Request, res: Response) => {
    const { competitionId } = req.params;
    const {
      title,
      description,
      type,
      externalUrl,
      organizerName,
      location,
      eventDate,
      registrationDeadline,
      bannerUrl,
      status,
    } = req.body;

    const user = req.user;

    if (
      !user ||
      (user.role !== 'department_admin' && user.role !== 'faculty')
    ) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Forbidden: Insufficient permissions')
        );
    }

    const competition = await db
      .select()
      .from(competitionTable)
      .where(
        and(
          eq(competitionTable.competitionId, competitionId),
          eq(competitionTable.postedBy, user.userId),
          isNull(competitionTable.deletedAt)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'Competition not found'));
    }

    const updatedFields: any = {};

    if (title !== undefined) updatedFields.title = title.trim();
    if (description !== undefined)
      updatedFields.description = description.trim();
    if (type !== undefined) updatedFields.type = type.trim();
    if (externalUrl !== undefined)
      updatedFields.externalUrl = externalUrl.trim();
    if (organizerName !== undefined)
      updatedFields.organizerName = organizerName.trim() || null;
    if (location !== undefined)
      updatedFields.location = location.trim() || null;
    if (eventDate !== undefined)
      updatedFields.eventDate = eventDate ? new Date(eventDate) : null;
    if (registrationDeadline !== undefined)
      updatedFields.registrationDeadline = registrationDeadline
        ? new Date(registrationDeadline).toISOString().split('T')[0]
        : null;
    if (bannerUrl !== undefined)
      updatedFields.bannerUrl = bannerUrl.trim() || null;
    if (status !== undefined) {
      const validStatuses = ['draft', 'active', 'closed', 'archived'];
      if (!validStatuses.includes(status.trim())) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid status value' });
      }
      updatedFields.status = status.trim();
      if (status.trim() === 'active' && !competition.postedAt) {
        updatedFields.postedAt = new Date();
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'No fields to update' });
    }

    updatedFields.updatedAt = new Date();

    const [updatedCompetition] = await db
      .update(competitionTable)
      .set(updatedFields)
      .where(eq(competitionTable.competitionId, competitionId))
      .returning({
        competitionId: competitionTable.competitionId,
        title: competitionTable.title,
        description: competitionTable.description,
        type: competitionTable.type,
        externalUrl: competitionTable.externalUrl,
        organizerName: competitionTable.organizerName,
        location: competitionTable.location,
        eventDate: competitionTable.eventDate,
        registrationDeadline: competitionTable.registrationDeadline,
        bannerUrl: competitionTable.bannerUrl,
        status: competitionTable.status,
        updatedAt: competitionTable.updatedAt,
      });

    if (!updatedCompetition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'Competition not found'));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCompetition,
          'Competition updated successfully'
        )
      );
  }
);

/**
 * GET /api/competitions
 * List active competitions (Public/Student)
 * Query: ?type=hackathon&upcoming=true&location=online&page=1&limit=10
 * Required: none
 * Flow: Filter by status='active', deletedAt=null, registrationDeadline >= today → Paginate → Return list
 * Success: { data: [competition[]], total, page, limit, filtersApplied }
 */
export const listCompetitions = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, type, upcoming, location, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 100);
    const offset = (pageNum - 1) * limitNum;

    const filters: any = [
      eq(competitionTable.status, 'active'),
      isNull(competitionTable.deletedAt),
    ];

    if (type) {
      filters.push(eq(competitionTable.type, type as string));
    }

    if (upcoming === 'true') {
      filters.push(
        gte(
          competitionTable.registrationDeadline,
          new Date().toISOString().split('T')[0]
        )
      );
    }
    if (location) {
      filters.push(eq(competitionTable.location, location as string));
    }
    if (q) {
      filters.push(ilike(competitionTable.title, `%${(q as string).trim()}%`));
    }
    const [totalResult] = await db
      .select({ count: count(competitionTable.competitionId) })
      .from(competitionTable)
      .where(and(...filters));

    const total = Number(totalResult.count);

    const competitions = await db
      .select()
      .from(competitionTable)
      .where(and(...filters))
      .orderBy(desc(competitionTable.postedAt))
      .limit(limitNum)
      .offset(offset);

    return res.status(200).json(
      new ApiResponse(200, {
        data: competitions,
        total,
        page: pageNum,
        limit: limitNum,
        q: q || null,
      })
    );
  }
);

/**
 * GET /api/competitions/:competitionId
 * Get single competition details (Public)
 * Required: competitionId
 * Flow: Find active, non-deleted competition → Return full details including banner, description
 * Success: full competition object
 */
export const getCompetitionDetailsByID = asyncHandler(
  async (req: Request, res: Response) => {
    const { competitionId } = req.params;

    const competition = await db
      .select({
        competitionId: competitionTable.competitionId,
        title: competitionTable.title,
        description: competitionTable.description,
        type: competitionTable.type,
        externalUrl: competitionTable.externalUrl,
        organizerName: competitionTable.organizerName,
        location: competitionTable.location,
        eventDate: competitionTable.eventDate,
        registrationDeadline: competitionTable.registrationDeadline,
        bannerUrl: competitionTable.bannerUrl,
        status: competitionTable.status,
        postedAt: competitionTable.postedAt,
        createdAt: competitionTable.createdAt,
        updatedAt: competitionTable.updatedAt,
      })
      .from(competitionTable)
      .where(
        and(
          eq(competitionTable.competitionId, competitionId),
          eq(competitionTable.status, 'active'),
          isNull(competitionTable.deletedAt)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'Competition not found'));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          competition,
          'Competition details fetched successfully'
        )
      );
  }
);

/**
 * DELETE /api/competitions/:competitionId
 * Soft delete competition (Admin/Faculty only)
 * Required: competitionId
 * Flow: Verify ownership → Set deletedAt = now() → Return deletion timestamp
 * Success: { success: true, deletedAt }
 */
export const deleteCompetition = asyncHandler(
  async (req: Request, res: Response) => {
    const { competitionId } = req.params;
    const user = req.user;

    if (
      !user ||
      (user.role !== 'department_admin' && user.role !== 'faculty')
    ) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Forbidden: Insufficient permissions')
        );
    }

    const competition = await db
      .select()
      .from(competitionTable)
      .where(
        and(
          eq(competitionTable.competitionId, competitionId),
          eq(competitionTable.postedBy, user.userId),
          isNull(competitionTable.deletedAt)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'Competition not found'));
    }

    const deletedAt = new Date();

    await db
      .update(competitionTable)
      .set({ deletedAt })
      .where(eq(competitionTable.competitionId, competitionId));

    return res
      .status(200)
      .json(
        new ApiResponse(200, { deletedAt }, 'Competition deleted successfully')
      );
  }
);

/**
 * GET /api/competitions/admin/list
 * List all competitions for admin (including draft/closed)
 * Query: ?status=draft&page=1&limit=20
 * Required: none (auth required)
 * Flow: Return all competitions in department (ignore deletedAt unless archived)
 * Success: { data: [competition[]], total, page, limit }
 */
export const listAdminCompetitions = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, page = '1', limit = '20' } = req.query;
    const user = req.user;

    if (
      !user ||
      (user.role !== 'department_admin' && user.role !== 'faculty')
    ) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Forbidden: Insufficient permissions')
        );
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    const filters: any = [
      eq(competitionTable.departmentId, user.departmentId!),
      isNull(competitionTable.deletedAt),
    ];

    if (status) {
      filters.push(eq(competitionTable.status, status as string));
    }

    const [totalResult] = await db
      .select({ count: count(competitionTable.competitionId) })
      .from(competitionTable)
      .where(and(...filters));

    const total = Number(totalResult.count);

    const competitions = await db
      .select()
      .from(competitionTable)
      .where(and(...filters))
      .orderBy(desc(competitionTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    return res.status(200).json(
      new ApiResponse(200, {
        competitions,
        total,
        page: pageNum,
        limit: limitNum,
        status: status || null,
      })
    );
  }
);

/**
 * GET /api/competitions/admin/:competitionId
 * Get single competition details (only admin access)
 * Required: competitionId
 * Flow: Find all non-deleted competition → Return full details including banner, description
 * Success: full competition object
 */
export const getAdminCompetitionById = asyncHandler(
  async (req: Request, res: Response) => {
    const { competitionId } = req.params;
    const user = req.user;

    if (!competitionId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Bad Request: Missing competitionId'));
    }

    if (
      !user ||
      (user.role !== 'department_admin' && user.role !== 'faculty')
    ) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Forbidden: Insufficient permissions')
        );
    }

    const competition = await db
      .select()
      .from(competitionTable)
      .where(
        and(
          eq(competitionTable.competitionId, competitionId),
          eq(competitionTable.postedBy, user.userId!),
          isNull(competitionTable.deletedAt)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'Competition not found'));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, competition, 'Competition fetched successfully')
      );
  }
);

/**
 * GET /api/competitions/stats
 * Get competition stats for department admin
 * Required: none (auth required)
 * Flow: Count total, active, upcoming, ended → Return summary
 * Success: { total: number, active: number, upcoming: number, ended: number }
 */
export const getCompetitionStats = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (
      !user ||
      (user.role !== 'department_admin' && user.role !== 'faculty')
    ) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Forbidden: Insufficient permissions')
        );
    }

    const baseFilter = [
      eq(competitionTable.postedBy, user.userId!),
      isNull(competitionTable.deletedAt),
    ];

    const [totalResult] = await db
      .select({ count: count(competitionTable.competitionId) })
      .from(competitionTable)
      .where(and(...baseFilter));

    const [activeResult] = await db
      .select({ count: count(competitionTable.competitionId) })
      .from(competitionTable)
      .where(and(...baseFilter, eq(competitionTable.status, 'active')));

    const [upcomingResult] = await db
      .select({ count: count(competitionTable.competitionId) })
      .from(competitionTable)
      .where(and(...baseFilter, eq(competitionTable.status, 'upcoming')));

    const [endedResult] = await db
      .select({ count: count(competitionTable.competitionId) })
      .from(competitionTable)
      .where(and(...baseFilter, eq(competitionTable.status, 'ended')));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total: Number(totalResult.count),
          active: Number(activeResult.count),
          upcoming: Number(upcomingResult.count),
          ended: Number(endedResult.count),
        },
        'Competition stats fetched successfully'
      )
    );
  }
);
