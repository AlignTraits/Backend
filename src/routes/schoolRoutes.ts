import express from 'express';
import { adminLoginRequired } from '../middlewares/auth';
import {
  createCourseController,
  createSchoolController,
  getAllSchoolsController,
  getSchoolByIdController,
  updateCourseController,
  deleteSchoolsController,
  searchSchoolsController,
  deleteCourseController,
  updateSchoolController,
  getCourseByIdController,
  getAllCoursesController,
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

// get a single course by ID
router.get('/course/:id', getCourseByIdController); // Add this route

// get all courses
router.get('/courses', getAllCoursesController); // Add this route

// update course
router.patch('/course/:id', upload.single('profile'), updateCourseController);

// delete course
router.delete('/course/delete/:id', adminLoginRequired, deleteCourseController);

// update school
router.patch(
  '/update/:id',
  adminLoginRequired,
  upload.single('logo'),
  updateSchoolController
);

// delete school and associated courses
router.delete('/delete/:schoolId', adminLoginRequired, deleteSchoolsController);

// search schools by location
router.get('/search/location/:location', searchSchoolsController);

export default router;
