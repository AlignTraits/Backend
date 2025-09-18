// routes/admissionRoutes.ts
import express from 'express';
import multer from 'multer';
import {
  adminContCrtorLoginRequired,
  adminLoginRequired,
  loginRequired,
} from '../middlewares/auth';

import MessageResponse from '../types/messageResponse';
import {
  updateBulkCourseAdmissionsController,
  updateCourseAdmissionController,
  createAcademicRecordController,
  updateAcademicRecordController,
  deleteAcademicRecordController,
  getAcademicRecordController,
  addUserRecordByEmailController,
} from '../controllers/admissionLogicCtl';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for updating course admission logic
router.patch(
  '/course/:id',
  adminContCrtorLoginRequired,
  updateCourseAdmissionController
);

// In your router file
router.put<{}, MessageResponse>(
  '/bulk-update-admission-logic',
  adminContCrtorLoginRequired,
  upload.single('csvFile'),
  updateBulkCourseAdmissionsController
);

// Create academic record
router.post('/academic-records', loginRequired, createAcademicRecordController);

// Update academic record
router.put(
  '/academic-records/:id',
  loginRequired,
  updateAcademicRecordController
);

// Delete academic record
router.delete(
  '/academic-records/:id',
  loginRequired,
  deleteAcademicRecordController
);

// Fetch academic record
router.get('/academic-records', loginRequired, getAcademicRecordController);

// Assuming router is defined elsewhere
router.post('/academic-records-by-email', addUserRecordByEmailController);

export default router;
