import { Router } from 'express';
import {
  bulkEnrollStudents,
  createCourse,
  deleteCourse,
  enrollUser,
  getAllCourses,
  getCourseById,
  getCourseEnrollments,
  getUserCourses,
  updateCourse,
} from '../controllers/course-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const router = Router();

// Course management routes (require department admin)
router.route('/create').post(verifyJWT, createCourse);
router.route('/list').get(verifyJWT, getAllCourses);
router.route('/:courseId').get(verifyJWT, getCourseById);
router.route('/update/:courseId').put(verifyJWT, updateCourse);
router.route('/delete/:courseId').delete(verifyJWT, deleteCourse);

// Enrollment routes
router.route('/enroll').post(verifyJWT, enrollUser); // Single instructor enrollment
router.route('/enroll/bulk').post(verifyJWT, bulkEnrollStudents); // Bulk student enrollment
router.route('/:courseId/enrollments').get(verifyJWT, getCourseEnrollments);
router.route('/user/:userId/courses').get(verifyJWT, getUserCourses);

export default router;
