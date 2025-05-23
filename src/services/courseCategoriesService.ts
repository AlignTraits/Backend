import { Prisma, CourseCategory } from '@prisma/client';
import { db } from '../config/db';

export const getAllCourseCategories = async (): Promise<CourseCategory[]> => {
  try {
    const categories = await db.courseCategory.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  } catch (error: any) {
    console.error('Error in getAllCourseCategories:', error);
    throw new Error('Failed to fetch course categories');
  }
};

export const createCourseCategory = async (
  name: string
): Promise<CourseCategory> => {
  try {
    const category = await db.courseCategory.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return category;
  } catch (error: any) {
    console.error('Error in createCourseCategory:', error);
    throw new Error('Failed to create course category');
  }
};

export const updateCourseCategory = async (
  categoryId: number,
  name: string
): Promise<CourseCategory> => {
  try {
    const category = await db.courseCategory.update({
      where: { id: categoryId },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return category;
  } catch (error: any) {
    console.error('Error in updateCourseCategory:', error);
    if (error.code === 'P2025') {
      throw new Error(`Course category with ID ${categoryId} not found`);
    }
    throw new Error('Failed to update course category');
  }
};
