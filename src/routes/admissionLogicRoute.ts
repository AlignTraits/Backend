// routes/admissionRoutes.ts
import express from 'express';
import multer from 'multer';
import { adminLoginRequired } from '../middlewares/auth';
import MessageResponse from '../types/messageResponse';
import {
  updateBulkCourseAdmissionsController,
  updateCourseAdmissionController,
} from '../controllers/admissionLogicCtl';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for updating course admission logic
router.patch(
  '/course/:id',
  adminLoginRequired,
  updateCourseAdmissionController
);

// In your router file
router.put<{}, MessageResponse>(
  '/bulk-update-admission-logic',
  adminLoginRequired,
  upload.single('csvFile'),
  updateBulkCourseAdmissionsController
);

export default router;
