// routes/dashboardRoutes.ts
import { Router } from 'express';
import {
  getCoursesController,
  getCourseDetailsController,
  getSearchSuggestionsController,
} from '../controllers/dashboardController';

const router = Router();

// Get courses for the dashboard (with search and filtering)
router.get('/courses', getCoursesController);

// Get detailed view of a specific course
router.get('/courses/:courseId', getCourseDetailsController);

// Get search suggestions
router.get('/suggestions', getSearchSuggestionsController);

export default router;

// Search: /api/dashboard/suggestions?keyword=Computer
// Filter:
// /api/dashboard/courses?programLevel=IT%20&%20Computer%20Science&scholarship=Full%20Scholarship&country=Nigeria&page=1&limit=10
// /api/dashboard/courses?fieldOfStudy=STEM&scholarship=Full%20Scholarship&country=Nigeria&page=1&limit=10
// Detailed View: /api/dashboard/courses/abc123

// Search Functionality:
// Keyword Search: The keyword query parameter in /api/dashboard/courses searches Course.title and School.name.
// Autosuggestions: The /api/dashboard/suggestions endpoint provides suggestions based on the keyword, fetching up to 5 unique course titles and school names.
// Filtering Options:
// Filters: The /api/dashboard/courses endpoint supports filtering by scholarship, country, region, and programLevel.
// Persistence: Filters are passed as query parameters, so they persist when navigating (handled by the frontend).
