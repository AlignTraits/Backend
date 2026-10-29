// routes/admissionRoutes.ts
import express from 'express';
import { csvUpload } from '../middlewares/uploads';
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
} from '../controllers/admissionLogicCtl';

const router = express.Router();

// Route for updating course admission logic
router.patch(
  '/course/:id',
  adminContCrtorLoginRequired,
  updateCourseAdmissionController
);

// In your router file
// Admins and content managers only. This changes the entry rules and cut off
// marks for every course in the file, so it must never be open to the public.
router.put<{}, MessageResponse>(
  '/bulk-update-admission-logic',
  adminContCrtorLoginRequired,
  csvUpload('csvFile'),
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

// The old /academic-records-by-email route was removed: it let anyone overwrite
// any student's exam records by typing their email. Students save records with
// POST /academic-records while logged in.

export default router;
