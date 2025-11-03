import { Router } from 'express';
import {
  createCompetition,
  updateCompetition,
  listCompetitions,
  getCompetitionById,
  deleteCompetition,
  getCompetitionStats,
  listAdminCompetitions,
  getAdminCompetitionById,
} from '../controllers/competition-controller';
import { verifyJWT } from '../middleware/auth-middleware';

const competitionRouter = Router();

// Public routes (no auth required)
competitionRouter.route('/').get(listCompetitions);
competitionRouter.route('/:competitionId').get(getCompetitionById);

// Protected routes (auth required)
competitionRouter.route('/').post(verifyJWT, createCompetition);
competitionRouter.route('/:competitionId').put(verifyJWT, updateCompetition);
competitionRouter.route('/:competitionId').delete(verifyJWT, deleteCompetition);

// Admin routes
competitionRouter.route('/admin/list').get(verifyJWT, listAdminCompetitions);
competitionRouter.route('/admin/stats').get(verifyJWT, getCompetitionStats);
competitionRouter.route('/admin/:competitionId').get(verifyJWT, getAdminCompetitionById);

export default competitionRouter;
