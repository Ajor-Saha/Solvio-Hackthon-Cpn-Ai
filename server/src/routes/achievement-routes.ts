import { Router } from 'express';
import {
  createAchievement,
  updateAchievement,
  listAchievements,
  getAchievementById,
  deleteAchievement,
  getAchievementStats,
} from '../controllers/achievement-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const achievementRouter = Router();

// Public routes (no auth required)
achievementRouter.route('/').get(listAchievements);
achievementRouter.route('/:achievementId').get(getAchievementById);

// Protected routes (auth required)
achievementRouter.route('/').post(verifyJWT, createAchievement);
achievementRouter.route('/:achievementId').put(verifyJWT, updateAchievement);
achievementRouter.route('/:achievementId').delete(verifyJWT, deleteAchievement);
achievementRouter.route('/admin/stats').get(verifyJWT, getAchievementStats);

export default achievementRouter;
