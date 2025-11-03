import express from 'express';
import {
  createResearch,
  getCourseResearch,
  getResearchById,
} from '../controllers/research-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Create a new research
router.route('/create').post(createResearch);

// Get all research for a course
router.route('/course/:courseId').get(getCourseResearch);

// Get a single research by ID
router.route('/:researchId').get(getResearchById);

export default router;
