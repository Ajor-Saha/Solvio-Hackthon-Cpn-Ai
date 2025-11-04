import { and, count, desc, eq, ilike, isNull, or, sql, SQL } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { higherStudyTable } from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';


export const createHigherStudy = asyncHandler(async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      studyType = 'masters',
      institution,
      location,
      fieldOfStudy,
      applicationDeadline,
      startDate,
      duration,
      tuitionFee,
      scholarshipAvailable,
      eligibilityCriteria,
      applicationUrl,
      contactEmail,
      imageUrl,
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
    institution = institution?.trim();
    location = location?.trim();
    fieldOfStudy = fieldOfStudy?.trim();
    studyType = studyType?.toLowerCase();
    status = status?.toLowerCase();

    if (!title || !description || !institution || !applicationUrl) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Title, description, institution, and application URL are required'));
    }

    const validTypes = ['masters', 'phd', 'postdoc', 'fellowship', 'exchange_program', 'research_opportunity', 'scholarship'];
    if (!validTypes.includes(studyType)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid study type'));
    }

    const validStatuses = ['draft', 'active', 'closed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid status'));
    }

    const newHigherStudy = {
      higherStudyId: uuid(),
      departmentId: user.departmentId!,
      postedBy: user.userId,
      title,
      description,
      studyType,
      institution,
      location: location || null,
      fieldOfStudy: fieldOfStudy || null,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      startDate: startDate ? new Date(startDate) : null,
      duration: duration || null,
      tuitionFee: tuitionFee || null,
      scholarshipAvailable: scholarshipAvailable || null,
      eligibilityCriteria: eligibilityCriteria || null,
      applicationUrl,
      contactEmail: contactEmail || null,
      imageUrl: imageUrl || null,
      status,
      publishedAt: status === 'active' ? new Date() : null,
    };

    const [createdHigherStudy] = await db
      .insert(higherStudyTable)
      .values(newHigherStudy)
      .returning();

    return res
      .status(201)
      .json(new ApiResponse(201, createdHigherStudy, 'Higher study opportunity created successfully'));
  } catch (error) {
    console.error('Error creating higher study:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * PUT /api/higher-studies/:higherStudyId
 * Update higher study opportunity (admin/faculty owner only)
 */
export const updateHigherStudy = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { higherStudyId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    // Check if higher study exists and user owns it
    const existingHigherStudy = await db
      .select()
      .from(higherStudyTable)
      .where(
        and(
          eq(higherStudyTable.higherStudyId, higherStudyId),
          isNull(higherStudyTable.deletedAt)
        )
      );

    if (existingHigherStudy.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Higher study opportunity not found'));
    }

    if (user.role !== 'department_admin' && existingHigherStudy[0].postedBy !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only edit your own higher study opportunities'));
    }

    const updateData: any = {};
    const {
      title, description, studyType, institution, location, fieldOfStudy,
      applicationDeadline, startDate, duration, tuitionFee, scholarshipAvailable,
      eligibilityCriteria, applicationUrl, contactEmail, imageUrl, status
    } = req.body;

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (studyType !== undefined) updateData.studyType = studyType.toLowerCase();
    if (institution !== undefined) updateData.institution = institution.trim();
    if (location !== undefined) updateData.location = location.trim() || null;
    if (fieldOfStudy !== undefined) updateData.fieldOfStudy = fieldOfStudy.trim() || null;
    if (applicationDeadline !== undefined) updateData.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (duration !== undefined) updateData.duration = duration || null;
    if (tuitionFee !== undefined) updateData.tuitionFee = tuitionFee || null;
    if (scholarshipAvailable !== undefined) updateData.scholarshipAvailable = scholarshipAvailable || null;
    if (eligibilityCriteria !== undefined) updateData.eligibilityCriteria = eligibilityCriteria || null;
    if (applicationUrl !== undefined) updateData.applicationUrl = applicationUrl;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (status !== undefined) {
      updateData.status = status.toLowerCase();
      if (status === 'active' && !existingHigherStudy[0].publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updatedHigherStudy] = await db
      .update(higherStudyTable)
      .set(updateData)
      .where(eq(higherStudyTable.higherStudyId, higherStudyId))
      .returning();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedHigherStudy, 'Higher study opportunity updated successfully'));
  } catch (error) {
    console.error('Error updating higher study:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/higher-studies
 * List higher study opportunities (public/students see active only, admins see all)
 */
export const listHigherStudies = asyncHandler(async (req: Request, res: Response) => {
  const {
    studyType,
    location,
    fieldOfStudy,
    search,
    page = '1',
    limit = '10',
    status = 'active',
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);
  const offset = (pageNum - 1) * limitNum;

  const user = req.user;
  const filtersCondition = [isNull(higherStudyTable.deletedAt)];

  // Status filtering
  if (!user || user.role === 'student') {
    // Public/students see only active opportunities
    filtersCondition.push(eq(higherStudyTable.status, 'active'));
    filtersCondition.push(
      or(
        isNull(higherStudyTable.applicationDeadline),
        sql`${higherStudyTable.applicationDeadline} >= CURRENT_DATE` as SQL
      )
    );
  } else if (user.role === 'department_admin') {
    // Admin sees all in their department
    filtersCondition.push(eq(higherStudyTable.departmentId, user.departmentId!));
    if (status !== 'all') {
      filtersCondition.push(eq(higherStudyTable.status, status as string));
    }
  }

  // Additional filters
  if (studyType) {
    filtersCondition.push(eq(higherStudyTable.studyType, studyType as string));
  }
  if (location) {
    filtersCondition.push(ilike(higherStudyTable.location, `%${location}%`));
  }
  if (fieldOfStudy) {
    filtersCondition.push(ilike(higherStudyTable.fieldOfStudy, `%${fieldOfStudy}%`));
  }
  if (search) {
    const searchCondition = or(
      ilike(higherStudyTable.title, `%${search}%`),
      ilike(higherStudyTable.description, `%${search}%`),
      ilike(higherStudyTable.institution, `%${search}%`)
    );
    filtersCondition.push(searchCondition);
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, higherStudies] = await Promise.all([
    db.select({ count: count() }).from(higherStudyTable).where(whereClause),
    db
      .select()
      .from(higherStudyTable)
      .where(whereClause)
      .orderBy(desc(higherStudyTable.publishedAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: higherStudies,
        total,
        page: pageNum,
        limit: limitNum,
        filtersApplied: { studyType, location, fieldOfStudy, search },
      },
      'Higher studies fetched successfully'
    )
  );
});

/**
 * GET /api/higher-studies/:higherStudyId
 * Get higher study details
 */
export const getHigherStudyById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { higherStudyId } = req.params;
    const user = req.user;

    const whereConditions = [
      eq(higherStudyTable.higherStudyId, higherStudyId),
      isNull(higherStudyTable.deletedAt),
    ];

    // Public users can only see active opportunities
    if (!user || user.role === 'student') {
      whereConditions.push(eq(higherStudyTable.status, 'active'));
    }

    const higherStudy = await db
      .select()
      .from(higherStudyTable)
      .where(and(...whereConditions));

    if (higherStudy.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Higher study opportunity not found'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, higherStudy[0], 'Higher study details fetched successfully'));
  } catch (error) {
    console.error('Error fetching higher study:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * DELETE /api/higher-studies/:higherStudyId
 * Soft delete higher study (admin/faculty owner only)
 */
export const deleteHigherStudy = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { higherStudyId } = req.params;
    const user = req.user;

    if (!user?.role || !['department_admin', 'faculty'].includes(user.role)) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const existingHigherStudy = await db
      .select()
      .from(higherStudyTable)
      .where(
        and(
          eq(higherStudyTable.higherStudyId, higherStudyId),
          isNull(higherStudyTable.deletedAt)
        )
      );

    if (existingHigherStudy.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, 'Higher study opportunity not found'));
    }

    if (user.role !== 'department_admin' && existingHigherStudy[0].postedBy !== user.userId) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'You can only delete your own higher study opportunities'));
    }

    await db
      .update(higherStudyTable)
      .set({ deletedAt: new Date() })
      .where(eq(higherStudyTable.higherStudyId, higherStudyId));

    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, 'Higher study opportunity deleted successfully'));
  } catch (error) {
    console.error('Error deleting higher study:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});

/**
 * GET /api/higher-studies/admin/list
 * List admin higher studies (admin only)
 */
export const listAdminHigherStudies = asyncHandler(async (req: Request, res: Response) => {
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
    eq(higherStudyTable.departmentId, user.departmentId!),
    isNull(higherStudyTable.deletedAt)
  ];

  if (status !== 'all') {
    filtersCondition.push(eq(higherStudyTable.status, status as string));
  }

  if (q) {
    const searchCondition = or(
      ilike(higherStudyTable.title, `%${q}%`),
      ilike(higherStudyTable.description, `%${q}%`),
      ilike(higherStudyTable.institution, `%${q}%`)
    );
    filtersCondition.push(searchCondition);
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, higherStudies] = await Promise.all([
    db.select({ count: count() }).from(higherStudyTable).where(whereClause),
    db
      .select()
      .from(higherStudyTable)
      .where(whereClause)
      .orderBy(desc(higherStudyTable.createdAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: higherStudies,
        total,
        page: pageNum,
        limit: limitNum,
      },
      'Admin higher studies fetched successfully'
    )
  );
});

/**
 * GET /api/higher-studies/stats
 * Get higher study statistics (admin only)
 */
export const getHigherStudyStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user?.role || user.role !== 'department_admin') {
      return res
        .status(403)
        .json(new ApiResponse(403, null, 'Unauthorized: Insufficient permissions'));
    }

    const whereCondition = and(
      eq(higherStudyTable.departmentId, user.departmentId!),
      isNull(higherStudyTable.deletedAt)
    );

    const [totalResult, activeResult, draftResult, closedResult] = await Promise.all([
      db.select({ count: count() }).from(higherStudyTable).where(whereCondition),
      db
        .select({ count: count() })
        .from(higherStudyTable)
        .where(and(whereCondition, eq(higherStudyTable.status, 'active'))),
      db
        .select({ count: count() })
        .from(higherStudyTable)
        .where(and(whereCondition, eq(higherStudyTable.status, 'draft'))),
      db
        .select({ count: count() })
        .from(higherStudyTable)
        .where(and(whereCondition, eq(higherStudyTable.status, 'closed'))),
    ]);

    const stats = {
      total: Number(totalResult[0]?.count) || 0,
      active: Number(activeResult[0]?.count) || 0,
      draft: Number(draftResult[0]?.count) || 0,
      closed: Number(closedResult[0]?.count) || 0,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, 'Higher study stats fetched successfully'));
  } catch (error) {
    console.error('Error fetching higher study stats:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});
