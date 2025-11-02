import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  SQL,
  sql,
} from 'drizzle-orm';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { departmentShowcaseTable } from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /api/showcases
 * Create new showcase entry (admin/faculty only)
 * Body: { title, description, achievements?, tags[], thumbnailUrl?, metadata?, featured? }
 * Returns: { showcaseId: string, publishedAt: timestamp | null, ...createdFields }
 */
export const createShowcase = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      let {
        title,
        description,
        achievements,
        tags,
        thumbnailUrl,
        metadata,
        featured,
        departmentId,
      } = req.body;

      const user = req.user;

      if (!user?.role || user.role !== 'admindepartment_admin') {
        return res
          .status(403)
          .json(
            new ApiResponse(403, null, 'Unauthorized: Insufficient permissions')
          );
      }
      // Trim strings and reset string fields
      title = title.trim();
      description = description.trim();
      achievements = achievements.trim();
      tags = tags?.map((item: string) => item.trim()) || [];
      thumbnailUrl = thumbnailUrl?.trim();
      metadata = metadata || {};
      featured = featured || false;
      departmentId = departmentId?.trim();

      if (!departmentId) {
        return res
          .status(400)
          .json(new ApiResponse(401, null, 'Department ID is required'));
      }

      // validate required fields: title, description
      if (!title || !description) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, 'Title and description are required')
          );
      }

      // Insert into table table called departmentShowcaseTable
      const newShowcaseAchievements = {
        showcaseId: uuid(),
        title,
        description,
        achievements,
        tags,
        thumbnailUrl,
        metadata,
        featured,
        departmentId,
        publishedAt: new Date(),
      };

      // Save to database
      const [showcaseAchievements] = await db
        .insert(departmentShowcaseTable)
        .values(newShowcaseAchievements)
        .returning({
          showcaseId: departmentShowcaseTable.showcaseId,
          publishedAt: departmentShowcaseTable.publishedAt,
          title: departmentShowcaseTable.title,
          description: departmentShowcaseTable.description,
          achievements: departmentShowcaseTable.achievements,
          tags: departmentShowcaseTable.tags,
          thumbnailUrl: departmentShowcaseTable.thumbnailUrl,
          metadata: departmentShowcaseTable.metadata,
          featured: departmentShowcaseTable.featured,
        });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            ...showcaseAchievements,
          },
          'Showcase created successfully'
        )
      );
    } catch (error) {
      console.error('Error creating showcase:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * PATCH /api/showcases/:showcaseId
 * Update showcase (admin/faculty only)
 * Body: partial { title, description, ..., status? }
 * Returns: { showcaseId: string, updatedAt: timestamp, ...updatedFields }
 */
export const updateShowcase = asyncHandler(
  async (req: Request, res: Response) => {
    const { showcaseId } = req.params;
    const updates = req.body;

    const user = req.user;

    if (!user?.role || user.role !== 'admindepartment_admin') {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Unauthorized: Insufficient permissions')
        );
    }

    // Validate showcaseId
    if (!showcaseId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Showcase ID is required'));
    }

    // Update the showcase in the database
    const [updatedShowcase] = await db
      .update(departmentShowcaseTable)
      .set(updates)
      .where(eq(departmentShowcaseTable.showcaseId, showcaseId))
      .returning({
        showcaseId: departmentShowcaseTable.showcaseId,
        updatedAt: departmentShowcaseTable.updatedAt,
        ...Object.keys(updates).reduce<Record<string, any>>((acc, key) => {
          acc[key] = (departmentShowcaseTable as any)[key];
          return acc;
        }, {}),
      });

    if (!updatedShowcase) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'Showcase not found'));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...updatedShowcase,
        },
        'Showcase updated successfully'
      )
    );
  }
);

/**
 * GET /api/showcases?tags=ai,iot&featured=true&search=ml&page=1&limit=10
 * List published showcases (public) with filters & pagination
 * Returns: { data: Showcase[], total: number, page: number, limit: number, filtersApplied: object }
 */
export const listShowcases = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      tags, // "ai,ml"
      featured, // "true" | "false"
      search, // "machine learning"
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50); // cap at 50
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    const conditions: SQL[] = [
      isNull(departmentShowcaseTable.deletedAt), // only non-deleted
      isNotNull(departmentShowcaseTable.publishedAt), // only published
    ];

    if (tags) {
      const tagsArray = (tags as string)
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (tagsArray.length) {
        // Convert JS array → SQL array literal
        const arrayLiteral = sql`ARRAY[${sql.join(
          tagsArray.map(tag => sql`${tag}`),
          sql`, `
        )}]::text[]`;
        conditions.push(
          sql`${departmentShowcaseTable.tags} && ${arrayLiteral}`
        );
      }
    }

    if (featured !== undefined) {
      conditions.push(
        eq(departmentShowcaseTable.featured, featured === 'true')
      );
    }
    const searchStr = search?.toString().trim();

    if (searchStr) {
      const likeClauses: SQL[] = [];

      const titleLike = ilike(departmentShowcaseTable.title, `%${searchStr}%`);
      if (titleLike) likeClauses.push(titleLike);

      const descLike = ilike(
        departmentShowcaseTable.description,
        `%${searchStr}%`
      );
      if (descLike) likeClauses.push(descLike);

      const achLike = ilike(
        departmentShowcaseTable.achievements,
        `%${searchStr}%`
      );
      if (achLike) likeClauses.push(achLike);

      const searchKeyCombined = or(
        ilike(departmentShowcaseTable.title, `%${searchStr}%`),
        ilike(departmentShowcaseTable.description, `%${searchStr}%`),
        ilike(departmentShowcaseTable.achievements, `%${searchStr}%`)
      );
      if (searchKeyCombined) likeClauses.push(searchKeyCombined);
    }

    // Build final WHERE
    const whereClause =
      conditions.length > 2
        ? and(...conditions)
        : conditions.length === 2
        ? and(conditions[0], conditions[1])
        : conditions[0];

    // Count total
    const totalResult = await db
      .select({ count: count() })
      .from(departmentShowcaseTable)
      .where(whereClause);

    const total = Number(totalResult[0]?.count) || 0;

    // Fetch paginated data
    const showcases = await db
      .select()
      .from(departmentShowcaseTable)
      .where(whereClause)
      .orderBy(desc(departmentShowcaseTable.publishedAt))
      .limit(limitNum)
      .offset(offset);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          data: showcases,
          total,
          page: pageNum,
          limit: limitNum,
          filtersApplied: { tags, featured, search },
        },
        'Showcases fetched successfully'
      )
    );
  }
);

/**
 * GET /api/showcase/:showcaseId
 * Get single showcase details (public)
 * Returns: Showcase | null
 */
export const getShowcaseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { showcaseId } = req.params;

    if (!showcaseId || showcaseId.trim().length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Showcase ID is required'));
    }

    const showcase = await db
      .select()
      .from(departmentShowcaseTable)
      .where(
        and(
          eq(departmentShowcaseTable.showcaseId, showcaseId),
          isNull(departmentShowcaseTable.deletedAt),
          isNotNull(departmentShowcaseTable.publishedAt)
        )
      )
      .limit(1);

    if (!showcase[0]) {
      new ApiResponse(404, null, 'Showcase not found or not published');
    }

    return res
      .status(200)
      .json(new ApiResponse(200, showcase[0], 'Showcase fetched successfully'));
  }
);

/**
 * DELETE /api/showcase/:showcaseId
 * Soft delete showcase (admin/faculty only)
 * Returns: { success: true, deletedAt: timestamp }
 */
export const deleteShowcase = asyncHandler(
  async (req: Request, res: Response) => {
    const { showcaseId } = req.params;
    const user = req.user; // assumed from auth middleware

    if (!user?.role || user.role !== 'admindepartment_admin') {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, 'Unauthorized: Insufficient permissions')
        );
    }

    if (!showcaseId || showcaseId.trim().length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Showcase ID is required'));
    }

    // Optional: restrict to same department
    const showcase = await db
      .select({ departmentId: departmentShowcaseTable.departmentId })
      .from(departmentShowcaseTable)
      .where(
        and(
          eq(departmentShowcaseTable.showcaseId, showcaseId),
          isNull(departmentShowcaseTable.deletedAt)
        )
      )
      .limit(1);

    if (!showcase[0]) {
      new ApiResponse(404, null, 'Showcase not found');
    }

    // Check permission: user must be from same dept + admin/faculty
    if (showcase[0].departmentId !== user.departmentId) {
      new ApiResponse(403, null, 'Unauthorized: Not your department');
    }

    const deletedAt = new Date();

    await db
      .update(departmentShowcaseTable)
      .set({ deletedAt })
      .where(eq(departmentShowcaseTable.showcaseId, showcaseId));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { success: true, deletedAt },
          'Showcase soft deleted successfully'
        )
      );
  }
);
