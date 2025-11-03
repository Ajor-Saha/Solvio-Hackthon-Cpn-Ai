import { and, count, desc, eq, ilike, isNull, or, sql, SQL } from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { jobPostingTable } from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /api/jobs
 * Create new job posting (admin/faculty only)
 * Body: { title, description, companyName?, location?, jobType, externalUrl, applicationDeadline?, status? }
 * Returns: { jobId: string, status: string, postedAt: timestamp | null }
 */
export const createJob = asyncHandler(async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      companyName,
      location,
      jobType = 'full_time',
      externalUrl,
      applicationDeadline,
      status = 'draft',
    } = req.body;

    const user = req.user;

    if (!user?.role || user.role !== 'department_admin') {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Unauthorized: Insufficient permissions')
        );
    }

    // Trim & sanitize
    title = title?.trim();
    description = description?.trim();
    companyName = companyName?.trim();
    location = location?.trim();
    externalUrl = externalUrl?.trim();
    jobType = jobType?.toLowerCase();
    status = status?.toLowerCase();

    if (!title || !description || !externalUrl) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            'Title, description, and external URL are required'
          )
        );
    }

    const validJobTypes = [
      'full_time',
      'part_time',
      'internship',
      'contract',
      'remote',
    ];
    if (!validJobTypes.includes(jobType)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            `Invalid jobType. Must be one of: ${validJobTypes.join(', ')}`
          )
        );
    }

    const validStatuses = ['draft', 'active', 'closed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          )
        );
    }

    // applicationDeadline is expected else make it draft

    if (!applicationDeadline) {
      status = 'draft';
    }

    const newJob = {
      jobId: uuid(),
      departmentId: user.departmentId,
      postedBy: user.userId,
      title,
      description,
      companyName,
      location,
      jobType,
      externalUrl,
      // Convert Date to YYYY-MM-DD string for date column
      applicationDeadline: applicationDeadline
        ? new Date(applicationDeadline).toISOString().split('T')[0]
        : null,
      status,
      // Pass Date object for timestamp column
      postedAt: status === 'active' ? new Date() : null,
    };

    const [job] = await db.insert(jobPostingTable).values(newJob).returning({
      jobId: jobPostingTable.jobId,
      title: jobPostingTable.title,
      status: jobPostingTable.status,
      postedAt: jobPostingTable.postedAt,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          job,
          `Job is created successfully with status: ${
            job.status === 'active' ? 'published' : 'draft'
          }.`
        )
      );
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PATCH /api/jobs/:jobId
 * Update job posting (admin/faculty only)
 * Body: partial fields
 * Returns: { jobId: string, updatedAt: timestamp, ...updatedFields }
 */
export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const updates = req.body;
  const user = req.user;

  if (!user?.role || user.role !== 'department_admin') {
    return res
      .status(403)
      .json(
        new ApiResponse(403, null, 'Unauthorized: Insufficient permissions')
      );
  }

  if (!jobId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Job ID is required'));
  }

  const [existing] = await db
    .select({ departmentId: jobPostingTable.departmentId })
    .from(jobPostingTable)
    .where(eq(jobPostingTable.jobId, jobId));

  if (!existing || existing.departmentId !== user.departmentId) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'Job not found or unauthorized'));
  }

  const [updatedJob] = await db
    .update(jobPostingTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(jobPostingTable.jobId, jobId))
    .returning({
      jobId: jobPostingTable.jobId,
      title: jobPostingTable.title,
      status: jobPostingTable.status,
      updatedAt: jobPostingTable.updatedAt,
    });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedJob, 'Job updated successfully'));
});

/**
 * GET /api/jobs?q=abc&jobType=internship&location=remote&page=1&limit=10
 * List active new jobs (public/student) fo default, with filters and pagination
 * Filters with department_id handled in middleware
 * Query Params:
 *   - jobType?: string
 *   - location?: string
 *   - page?: number (default 1)
 *   - limit?: number (default 10, max 50)
 *   - jobStatus?: string (default 'active')
 *     - active: Show active jobs
 *     - draft: Show draft jobs (only for department_admins)
 *     - all: Show all jobs (public/student)
 *
 *
 * Returns: { data: Job[], total: number, page: number, limit: number, filtersApplied: object }
 */
export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    jobType,
    location,
    page = '1',
    limit = '10',
    jobStatus = 'active',
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);
  const offset = (pageNum - 1) * limitNum;

  const user = req.user;

  const publicStatusCondition = and(
    eq(jobPostingTable.status, 'active'),
    isNull(jobPostingTable.deletedAt),
    or(
      isNull(jobPostingTable.applicationDeadline),
      sql`${jobPostingTable.applicationDeadline} >= CURRENT_DATE` as SQL
    )
  );

  const filtersCondition = [];

  if (jobType) {
    filtersCondition.push(eq(jobPostingTable.jobType, jobType as string));
  }
  if (location) {
    filtersCondition.push(ilike(jobPostingTable.location, `%${location}%`));
  }
  if (q) {
    const query = or(
      ilike(jobPostingTable.title, `%${q}%`),
      ilike(jobPostingTable.description, `%${q}%`),
      ilike(jobPostingTable.companyName, `%${q}%`)
    );
    filtersCondition.push(query);
  }

  // if user is not found then treat as public user and return most recently posted active jobs
  if (!user) {
    const jobs = await db
      .select()
      .from(jobPostingTable)
      .where(publicStatusCondition)
      .orderBy(desc(jobPostingTable.postedAt))
      .limit(limitNum)
      .offset(offset);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          data: jobs,
          total: jobs.length,
          page: pageNum,
          limit: limitNum,
          filtersApplied: { jobType, location },
        },
        'Most recent active jobs fetched successfully'
      )
    );
  }

  // for authenticated users return active jobs based on their department with filters
  if (user) {
    if (jobStatus === 'draft' && user.role !== 'department_admin') {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Unauthorized: Insufficient permissions')
        );
    }
  }

  const whereClause = and(...filtersCondition);

  const [totalResult, jobs] = await Promise.all([
    db.select({ count: count() }).from(jobPostingTable).where(whereClause),
    db
      .select()
      .from(jobPostingTable)
      .where(whereClause)
      .orderBy(desc(jobPostingTable.postedAt))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count) || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: jobs,
        total,
        page: pageNum,
        limit: limitNum,
        filtersApplied: { jobType, location },
      },
      'Jobs fetched successfully'
    )
  );
});

/**
 * GET /api/jobs/:jobId
 * Get single job (public)
 * Returns: Job | null
 */
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const [job] = await db
    .select()
    .from(jobPostingTable)
    .where(
      and(
        eq(jobPostingTable.jobId, jobId),
        eq(jobPostingTable.status, 'active'),
        isNull(jobPostingTable.deletedAt)
      )
    );

  if (!job) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'Job not found or not active'));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, job, 'Job fetched successfully'));
});

/**
 * DELETE /api/jobs/:jobId
 * Soft delete job (admin/faculty only)
 * Returns: { success: true, deletedAt: timestamp }
 */
export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!user?.role || user.role !== 'department_admin') {
    return res
      .status(403)
      .json(
        new ApiResponse(403, null, 'Unauthorized: Insufficient permissions')
      );
  }

  const [existing] = await db
    .select({ departmentId: jobPostingTable.departmentId })
    .from(jobPostingTable)
    .where(eq(jobPostingTable.jobId, jobId));

  if (!existing || existing.departmentId !== user.departmentId) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'Job not found or unauthorized'));
  }

  const deletedAt = new Date();

  await db
    .update(jobPostingTable)
    .set({ deletedAt })
    .where(eq(jobPostingTable.jobId, jobId));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { success: true, deletedAt },
        'Job  deleted successfully'
      )
    );
});
