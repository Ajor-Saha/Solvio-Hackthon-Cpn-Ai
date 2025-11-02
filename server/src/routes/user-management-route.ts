import { Router } from 'express';
import {
  addUser,
  addUsersFromCSV,
  getDepartmentUsers,
  sendCredentialsToUsers,
} from '../controllers/user-management-controllers';
import { verifyJWT } from '../middleware/auth-middleware';
import { uploadCSVMiddleware } from '../middleware/upload-middleware';

const router = Router();

// All routes require authentication and department admin role
router.post('/add-user', verifyJWT, addUser);
router.post('/add-users-csv', verifyJWT, uploadCSVMiddleware, addUsersFromCSV);
router.get('/department-users', verifyJWT, getDepartmentUsers);
router.post('/send-credentials', verifyJWT, sendCredentialsToUsers);

export default router;
