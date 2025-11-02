import { Router } from 'express';
import {
  deleteCourseResource,
  getCourseResources,
  uploadCourseResource,
} from '../controllers/course-resource-controllers';
import { verifyJWT } from '../middleware/auth-middleware';
import { uploadFilesMiddleware } from '../middleware/upload-middleware';

const router = Router();

// Course resource routes (faculty only for upload)
router
  .route('/upload')
  .post(verifyJWT, uploadFilesMiddleware, uploadCourseResource);

router.route('/:courseId').get(verifyJWT, getCourseResources);

router.route('/delete/:resourceId').delete(verifyJWT, deleteCourseResource);

export default router;
