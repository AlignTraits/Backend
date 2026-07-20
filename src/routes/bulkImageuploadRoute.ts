import express from 'express';
import multer from 'multer';
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

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

// Bulk Course Images Upload
router.post<{}, MessageResponse>(
  '/bulk-upload-course-images',
  adminContCrtorLoginRequired,
  upload.array('images', 50), // Max 50 images
  bulkUploadCourseImagesController
);

// Bulk School Images Upload
router.post<{}, MessageResponse>(
  '/bulk-upload-school-images',
  // adminContCrtorLoginRequired, // ← Uncommented for security
  upload.array('images', 50),
  bulkUploadSchoolImagesController
);

export default router;
