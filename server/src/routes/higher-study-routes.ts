import { Router } from 'express';
import {
  createHigherStudy,
  updateHigherStudy,
  listHigherStudies,
  getHigherStudyById,
  deleteHigherStudy,
  getHigherStudyStats,
  listAdminHigherStudies,
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

// Admin routes
higherStudyRouter.route('/admin/list').get(verifyJWT, listAdminHigherStudies);
higherStudyRouter.route('/admin/stats').get(verifyJWT, getHigherStudyStats);

export default higherStudyRouter;
