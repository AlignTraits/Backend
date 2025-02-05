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
  createBulkSchoolsController,
  createBulkCSVSchoolsController,
  // createBulkCoursesController,
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

// Bulk school creation
router.post(
  '/bulk/add-bulk-schools',
  // adminLoginRequired,
  upload.array('logos', 10),
  createBulkSchoolsController
);

// Bulk school creation route
router.post<{}, MessageResponse>(
  '/csv/bulk-add-schools',
  adminLoginRequired,
  upload.fields([
    { name: 'csvFile', maxCount: 1 },
    { name: 'logos', maxCount: 10 },
  ]),
  createBulkCSVSchoolsController
);

//

// Bulk course creation route
// router.post<{}, MessageResponse>(
//   '/add-bulk-courses',
//   adminLoginRequired,
//   upload.array('profiles', 10),
//   createBulkCoursesController
// );

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
