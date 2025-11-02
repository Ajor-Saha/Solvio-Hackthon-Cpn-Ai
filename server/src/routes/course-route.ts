import { Router } from 'express';
import {
    bulkEnrollStudents,
    createCourse,
    deleteCourse,
    enrollUser,
    getAllCourses,
    getCourseById,
    getCourseEnrollments,
    getCoursesBySemester,
    getCoursesBySemesterQuery,
    getDepartmentCourses,
    getUserCourses,
    updateCourse,
} from '../controllers/course-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const router = Router();

// Add general debugging for all course routes
router.use('*', (req, res, next) => {
  console.log('Course route accessed:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    params: req.params,
    query: req.query
  });
  next();
});

// Course management routes (require department admin)
router.route('/create').post(verifyJWT, createCourse);
router.route('/list').get(verifyJWT, getAllCourses);
router.route('/department-courses').get(verifyJWT, getDepartmentCourses);

// Add debugging middleware for semester route
router.use('/semester/:semester', (req, res, next) => {
  console.log('Semester route hit:', {
    url: req.url,
    params: req.params,
    method: req.method,
    originalUrl: req.originalUrl
  });
  next();
});

// Simple test route
router.route('/test-semester').get((req, res) => {
  console.log('Test semester route hit');
  res.json({ message: 'Test semester route working', timestamp: new Date().toISOString() });
});

// Alternative route using query parameters (more reliable for complex values)
router.route('/by-semester').get(verifyJWT, getCoursesBySemesterQuery);

router.route('/semester/:semester').get(verifyJWT, getCoursesBySemester);
router.route('/:courseId').get(verifyJWT, getCourseById);
router.route('/update/:courseId').put(verifyJWT, updateCourse);
router.route('/delete/:courseId').delete(verifyJWT, deleteCourse);

// Enrollment routes
router.route('/enroll').post(verifyJWT, enrollUser); // Single instructor enrollment
router.route('/enroll/bulk').post(verifyJWT, bulkEnrollStudents); // Bulk student enrollment
router.route('/:courseId/enrollments').get(verifyJWT, getCourseEnrollments);
router.route('/user/:userId/courses').get(verifyJWT, getUserCourses);

export default router;
