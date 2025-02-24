import express from 'express';
import { adminLoginRequired } from '../middlewares/auth';
import multer from 'multer';
import MessageResponse from '../types/messageResponse';
import {
  createBulkSchoolsController,
  deleteBulkSchoolsController,
  createBulkCoursesController,
  deleteBulkCoursesController,
  updateBulkSchoolsController,
  updateBulkCoursesController,
  downloadSchoolCourseDataController,
} from '../controllers/bulk-testCtl';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Bulk school creation route with CSV and images
// save img as url like this for google drive images
// https://drive.google.com/uc?export=view&id=1QoRkwCwSh__TlbnlyVO6mIj9ZgzTlObw
// https://drive.google.com/uc?export=view&id=file_id

// Bulk school creation route with direct data
router.post<{}, MessageResponse>(
  '/bulk-add-schools',
  adminLoginRequired,
  upload.single('csvFile'),
  createBulkSchoolsController
);
// Bulk school update route with CSV
router.put<{}, MessageResponse>(
  '/bulk-update-schools',
  adminLoginRequired,
  upload.single('csvFile'),
  updateBulkSchoolsController
);

// Bulk school deletion route
router.delete<{}, MessageResponse>(
  '/bulk-delete-schools',
  adminLoginRequired,
  deleteBulkSchoolsController
);

// Bulk course creation route with CSV
router.post<{}, MessageResponse>(
  '/csv/bulk-add-courses',
  adminLoginRequired,
  upload.single('csvFile'),
  createBulkCoursesController
);

// Bulk course update route with CSV
router.put<{}, MessageResponse>(
  '/bulk-update-courses',
  adminLoginRequired,
  upload.single('csvFile'),
  updateBulkCoursesController
);

// Bulk course deletion route
router.delete<{}, MessageResponse>(
  '/bulk-delete-courses',
  adminLoginRequired,
  deleteBulkCoursesController
);

// GET /api/download?format=csv&entity=school&startDate=2024-01-01&endDate=2024-12-31
// ../download?format=csv&entity=course&id=xyz789&title=Coding&schoolId=fN1rh8QWg1
// ../api/v1/bulk/download?format=csv&entity=school&id=MlGKz-0RHG
router.get(
  '/download',
  // adminLoginRequired, // Ensure only admins can access
  downloadSchoolCourseDataController
);

export default router;
