// controllers/dashboardController.ts
import { Request, Response } from 'express';
import {
  getCoursesForDashboard,
  getCourseDetails,
  getSearchSuggestions,
} from '../services/dashboardService';
import { FilterOptions } from '../types/school-course-types';

export const getCoursesController = async (req: Request, res: Response) => {
  try {
    // Extract query parameters for filtering
    const {
      scholarship,
      country,
      region,
      programLevel,
      fieldOfStudy,
      keyword,
      page,
      limit,
    } = req.query;

    const filters: FilterOptions = {
      scholarship: scholarship as string,
      country: country as string,
      region: region as string,
      programLevel: programLevel as string,
      fieldOfStudy: fieldOfStudy as string, // Added fieldOfStudy
      keyword: keyword as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    const { courses, total } = await getCoursesForDashboard(filters);

    res.status(200).json({
      message: 'Courses fetched successfully',
      data: {
        courses,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / (filters.limit || 10)),
      },
    });
  } catch (error: any) {
    console.error('Error in getCoursesController:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getCourseDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const courseDetails = await getCourseDetails(courseId);

    res.status(200).json({
      message: 'Course details fetched successfully',
      data: courseDetails,
    });
  } catch (error: any) {
    console.error('Error in getCourseDetailsController:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to fetch course details' });
  }
};

export const getSearchSuggestionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const suggestions = await getSearchSuggestions(keyword);

    res.status(200).json({
      message: 'Search suggestions fetched successfully',
      data: suggestions,
    });
  } catch (error: any) {
    console.error('Error in getSearchSuggestionsController:', error);
    res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
};
