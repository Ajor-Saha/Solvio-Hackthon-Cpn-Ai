import { Router } from 'express';
import { Request, Response } from 'express';
import { db } from '../db';
import { count, isNull } from 'drizzle-orm';
import {
  jobPostingTable,
  competitionTable,
  achievementTable,
  higherStudyTable,
  researchTable
} from '../db/schema';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/asyncHandler';

const debugRouter = Router();

// Debug endpoint to check database contents
debugRouter.get('/database', asyncHandler(async (req: Request, res: Response) => {
  try {
    const [
      jobsCount,
      competitionsCount,
      achievementsCount,
      higherStudiesCount,
      researchCount,

      // Get sample records
      sampleJobs,
      sampleCompetitions,
      sampleAchievements,
      sampleHigherStudies,
      sampleResearch
    ] = await Promise.all([
      // Count records
      db.select({ count: count() }).from(jobPostingTable).where(isNull(jobPostingTable.deletedAt)),
      db.select({ count: count() }).from(competitionTable).where(isNull(competitionTable.deletedAt)),
      db.select({ count: count() }).from(achievementTable).where(isNull(achievementTable.deletedAt)),
      db.select({ count: count() }).from(higherStudyTable).where(isNull(higherStudyTable.deletedAt)),
      db.select({ count: count() }).from(researchTable).where(isNull(researchTable.deletedAt)),

      // Get sample records
      db.select({
        id: jobPostingTable.jobId,
        title: jobPostingTable.title,
        status: jobPostingTable.status
      }).from(jobPostingTable).where(isNull(jobPostingTable.deletedAt)).limit(3),

      db.select({
        id: competitionTable.competitionId,
        title: competitionTable.title,
        status: competitionTable.status
      }).from(competitionTable).where(isNull(competitionTable.deletedAt)).limit(3),

      db.select({
        id: achievementTable.achievementId,
        title: achievementTable.title,
        status: achievementTable.status
      }).from(achievementTable).where(isNull(achievementTable.deletedAt)).limit(3),

      db.select({
        id: higherStudyTable.higherStudyId,
        title: higherStudyTable.title,
        status: higherStudyTable.status
      }).from(higherStudyTable).where(isNull(higherStudyTable.deletedAt)).limit(3),

      db.select({
        id: researchTable.researchId,
        title: researchTable.title,
        status: researchTable.status
      }).from(researchTable).where(isNull(researchTable.deletedAt)).limit(3)
    ]);

    const data = {
      counts: {
        jobs: Number(jobsCount[0]?.count) || 0,
        competitions: Number(competitionsCount[0]?.count) || 0,
        achievements: Number(achievementsCount[0]?.count) || 0,
        higherStudies: Number(higherStudiesCount[0]?.count) || 0,
        research: Number(researchCount[0]?.count) || 0
      },
      samples: {
        jobs: sampleJobs,
        competitions: sampleCompetitions,
        achievements: sampleAchievements,
        higherStudies: sampleHigherStudies,
        research: sampleResearch
      },
      totalPosts: (
        Number(jobsCount[0]?.count) +
        Number(competitionsCount[0]?.count) +
        Number(achievementsCount[0]?.count) +
        Number(higherStudiesCount[0]?.count) +
        Number(researchCount[0]?.count)
      )
    };

    return res.status(200).json(new ApiResponse(200, data, 'Database contents retrieved'));
  } catch (error) {
    console.error('Debug database error:', error);
    return res.status(500).json(new ApiResponse(500, null, 'Error checking database'));
  }
}));

export default debugRouter;
