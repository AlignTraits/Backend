// routes/admissionRoutes.ts
import express from 'express';
import { adminLoginRequired } from '../middlewares/auth';
import MessageResponse from '../types/messageResponse';
import { updateCourseAdmissionController } from '../controllers/admissionLogicCtl';

const router = express.Router();

// Route for updating course admission logic
router.patch(
  '/course/:id',
  adminLoginRequired,
  updateCourseAdmissionController
);

export default router;
