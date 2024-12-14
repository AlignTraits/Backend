import express from 'express';
import { adminLoginRequired } from '../middlewares/auth';
import {
  createCourseController,
  //   createCourseController,
  createSchoolController,
  getAllSchoolsController,
  getSchoolByIdController,
  updateCourseController,
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

// school
router.get('/get/all', getAllSchoolsController);
router.get('/get/:id', getSchoolByIdController);

// update course
router.patch('/course/:id', upload.single('profile'), updateCourseController);

export default router;
