import { Router } from 'express';
import {
  createResearch,
  deleteResearch,
  getResearchById,
  getResearchStats,
  listAdminResearch,
  listResearches,
  updateResearch,
} from '../controllers/research-controller';
import { getCourseResearch } from '../controllers/research-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const researchRouter = Router();

// Public routes (no auth required) - for published research
researchRouter.route('/').get(listResearches);
researchRouter.route('/:researchId').get(getResearchById);

// Protected routes (auth required)
researchRouter.route('/').post(verifyJWT, createResearch);
researchRouter.route('/:researchId').put(verifyJWT, updateResearch);
researchRouter.route('/:researchId').delete(verifyJWT, deleteResearch);

// Admin routes

researchRouter.route('/admin/stats').get(verifyJWT, getResearchStats);

// Get research by course ID (auth required)
researchRouter.route('/course/:courseId').get(verifyJWT, getCourseResearch);

researchRouter.route('/admin/list').get(verifyJWT, listAdminResearch);

export default researchRouter;
