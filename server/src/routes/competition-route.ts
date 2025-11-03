import { Router } from 'express';
import {
  createCompetition,
  deleteCompetition,
  getAdminCompetitionById,
  getCompetitionDetailsByID,
  getCompetitionStats,
  listAdminCompetitions,
  listCompetitions,
  updateCompetition,
} from '../controllers/competition-controller';
import { verifyJWT } from '../middleware/auth-middleware';

const competition_router = Router();

competition_router
  .route('/')
  .post(verifyJWT, createCompetition)
  .get(listCompetitions);

// Admin routes
competition_router.route('/admin/list').get(verifyJWT, listAdminCompetitions);
competition_router.route('/admin/stats').get(verifyJWT, getCompetitionStats);
competition_router
  .route('/admin/:competitionId')
  .get(verifyJWT, getAdminCompetitionById);

competition_router
  .route('/:competitionId')
  .get(getCompetitionDetailsByID)
  .put(verifyJWT, updateCompetition)
  .delete(verifyJWT, deleteCompetition);

export default competition_router;
