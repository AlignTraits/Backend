import express from 'express';
import { imageUploads } from '../middlewares/uploads';
import MessageResponse from '../types/messageResponse';
import {
  bulkUploadCourseImagesController,
  bulkUploadSchoolImagesController,
} from '../controllers/bulkImageuploadCtrl';
import {
  adminContCrtorLoginRequired,
  adminLoginRequired,
} from '../middlewares/auth';

const router = express.Router();


// Bulk Course Images Upload
router.post<{}, MessageResponse>(
  '/bulk-upload-course-images',
  adminContCrtorLoginRequired,
  imageUploads('images', 50), // PNG, JPG or WEBP, 5MB each, at most 50
  bulkUploadCourseImagesController
);

// Bulk School Images Upload
router.post<{}, MessageResponse>(
  '/bulk-upload-school-images',
  adminContCrtorLoginRequired,
  imageUploads('images', 50),
  bulkUploadSchoolImagesController
);

export default router;
