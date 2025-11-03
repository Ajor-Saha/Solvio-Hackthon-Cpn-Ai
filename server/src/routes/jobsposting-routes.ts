/**
 * Table: tbl_department_showcase
 * CRUD: Create/edit/publish/soft-delete
 * Fields: title, description, achievements, tags[], thumbnailUrl, metadata (JSON), featured
 * Auto: publishedAt on publish
 */
import { Router } from 'express';
import {
  createJob,
  deleteJob,
  getJobById,
  listJobs,
  updateJob,
} from '../controllers/jobposting-controller';
import { verifyJWT } from '../middleware/auth-middleware';

const jobpost_router = Router();

jobpost_router.route('/').post(verifyJWT, createJob);
jobpost_router.get('/:jobId', getJobById);
jobpost_router
  .route('/:jobId')
  .put(verifyJWT, updateJob)
  .delete(verifyJWT, deleteJob);

jobpost_router.route('/').get(listJobs);

export default jobpost_router;
