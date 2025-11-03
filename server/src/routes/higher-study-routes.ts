import { Router } from 'express';
import {
  createHigherStudy,
  updateHigherStudy,
  listHigherStudies,
  getHigherStudyById,
  deleteHigherStudy,
  getHigherStudyStats,
} from '../controllers/higher-study-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const higherStudyRouter = Router();

// Public routes (no auth required)
higherStudyRouter.route('/').get(listHigherStudies);
higherStudyRouter.route('/:higherStudyId').get(getHigherStudyById);

// Protected routes (auth required)
higherStudyRouter.route('/').post(verifyJWT, createHigherStudy);
higherStudyRouter.route('/:higherStudyId').put(verifyJWT, updateHigherStudy);
higherStudyRouter.route('/:higherStudyId').delete(verifyJWT, deleteHigherStudy);
higherStudyRouter.route('/admin/stats').get(verifyJWT, getHigherStudyStats);

export default higherStudyRouter;
