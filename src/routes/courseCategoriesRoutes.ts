import { Router } from 'express';
import {
  getAllCourseCategoriesController,
  createCourseCategoryController,
  updateCourseCategoryController,
} from '../controllers/courseCategoriesCtrl';
import { adminContCrtorLoginRequired } from '../middlewares/auth';

const router = Router();

// Get all course categories
router.get('/', getAllCourseCategoriesController);

// Create a new course category
router.post('/', adminContCrtorLoginRequired, createCourseCategoryController);

// Update an existing course category
router.put(
  '/:categoryId',
  adminContCrtorLoginRequired,
  updateCourseCategoryController
);

export default router;
