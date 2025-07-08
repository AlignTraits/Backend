import express from 'express';
import {
  adminContCrtorLoginRequired,
  adminLoginRequired,
} from '../middlewares/auth';
import multer from 'multer';
import MessageResponse from '../types/messageResponse';
import {
  bulkUploadCourseImagesController,
  bulkUploadSchoolImagesController,
} from '../controllers/bulkImageuploadCtrl';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Bulk course image upload route
router.post<{}, MessageResponse>(
  '/bulk-upload-course-images',
  adminContCrtorLoginRequired,
  upload.array('images', 50), // Allow multiple image files, max 10
  bulkUploadCourseImagesController
);

// Bulk school image upload route
router.post<{}, MessageResponse>(
  '/bulk-upload-school-images',
  adminContCrtorLoginRequired,
  upload.array('images', 50), // Allow multiple image files, max 10
  bulkUploadSchoolImagesController
);

export default router;
