import express from 'express';
import { adminLoginRequired } from '../middlewares/auth';
import {
  createCourseController,
  //   createCourseController,
  createSchoolController,
} from '../controllers/schoolController';
import multer from 'multer';
import MessageResponse from '../types/messageResponse';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// school
router.post<{}, MessageResponse>(
  '/add-school',
  adminLoginRequired,
  upload.single('logo'),
  createSchoolController
);

// course
router.post<{}, MessageResponse>(
  '/add-course',
  adminLoginRequired,
  upload.single('profile'),
  createCourseController
);

export default router;
