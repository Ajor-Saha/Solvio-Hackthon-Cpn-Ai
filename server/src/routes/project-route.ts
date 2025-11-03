import { Router } from 'express';
import {
  createProject,
  getCourseProjects,
  getProjectById,
} from '../controllers/project-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Create a new project
router.post('/create', createProject);

// Get all projects for a course
router.get('/course/:courseId', getCourseProjects);

// Get a single project by ID
router.get('/:projectId', getProjectById);

export default router;
