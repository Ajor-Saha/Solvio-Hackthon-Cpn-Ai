import { Router } from 'express';
import {
  createJob,
  updateJob,
  listJobs,
  getJobById,
  deleteJob,
  getJobStats,
} from '../controllers/jobposting-controller';
import { verifyJWT } from '../middleware/auth-middleware';

const jobRouter = Router();

// Public routes (no auth required)
jobRouter.route('/').get(listJobs);
jobRouter.route('/:jobId').get(getJobById);

// Protected routes (auth required)
jobRouter.route('/').post(verifyJWT, createJob);
jobRouter.route('/:jobId').put(verifyJWT, updateJob);
jobRouter.route('/:jobId').delete(verifyJWT, deleteJob);
jobRouter.route('/admin/stats').get(verifyJWT, getJobStats);

export default jobRouter;
