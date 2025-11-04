import { Router } from 'express';
import {
  createResearch,
  deleteResearch,
  getResearchById,
  getResearchStats,
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
researchRouter.route('/admin/stats').get(verifyJWT, getResearchStats);

// Get research by course ID (auth required)
researchRouter.route('/course/:courseId').get(verifyJWT, getCourseResearch);

export default researchRouter;
