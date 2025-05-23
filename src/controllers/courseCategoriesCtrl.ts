import { Request, Response } from 'express';
import {
  getAllCourseCategories,
  createCourseCategory,
  updateCourseCategory,
} from '../services/courseCategoriesService';

export const getAllCourseCategoriesController = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = await getAllCourseCategories();

    res.status(200).json({
      message: 'Course categories fetched successfully',
      data: categories,
    });
  } catch (error: any) {
    console.error('Error in getAllCourseCategoriesController:', error);
    res.status(500).json({ error: 'Failed to fetch course categories' });
  }
};

export const createCourseCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res
        .status(400)
        .json({ error: 'Category name is required and must be a string' });
    }

    const newCategory = await createCourseCategory(name);

    res.status(201).json({
      message: 'Course category created successfully',
      data: newCategory,
    });
  } catch (error: any) {
    console.error('Error in createCourseCategoryController:', error);
    res.status(500).json({ error: 'Failed to create course category' });
  }
};

export const updateCourseCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!categoryId || isNaN(parseInt(categoryId))) {
      return res.status(400).json({ error: 'Valid category ID is required' });
    }

    if (!name || typeof name !== 'string') {
      return res
        .status(400)
        .json({ error: 'Category name is required and must be a string' });
    }

    const updatedCategory = await updateCourseCategory(
      parseInt(categoryId),
      name
    );

    res.status(200).json({
      message: 'Course category updated successfully',
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error('Error in updateCourseCategoryController:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to update course category' });
  }
};
