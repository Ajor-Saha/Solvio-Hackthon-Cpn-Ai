import { Router } from 'express';
import {
  createResearch,
  updateResearch,
  listResearches,
  getResearchById,
  deleteResearch,
  getResearchStats,
} from '../controllers/research-controller';
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

export default researchRouter;
