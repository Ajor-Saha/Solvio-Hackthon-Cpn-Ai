/**
 * Table: tbl_department_showcase
 * CRUD: Create/edit/publish/soft-delete
 * Fields: title, description, achievements, tags[], thumbnailUrl, metadata (JSON), featured
 * Auto: publishedAt on publish
 */
import { Router } from 'express';
import {
  createShowcase,
  deleteShowcase,
  getShowcaseById,
  listShowcases,
  updateShowcase,
} from '../controllers/showcase-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const showcase_router = Router();

showcase_router.route('/').post(verifyJWT, createShowcase);
showcase_router
  .route('/:showcaseId')
  .delete(verifyJWT, deleteShowcase)
  .put(verifyJWT, updateShowcase)
  .get(getShowcaseById);

showcase_router.route('/').get(listShowcases);

export default showcase_router;
