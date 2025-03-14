// services/dashboardService.ts
import { db } from '../config/db';
import {
  FilterOptions,
  CourseCardData,
  CourseDetailData,
} from '../types/school-course-types';

export const getCoursesForDashboard = async (
  filters: FilterOptions
): Promise<{
  courses: CourseCardData[];
  total: number;
}> => {
  try {
    const {
      scholarship,
      country,
      region,
      programLevel,
      fieldOfStudy,
      keyword,
      page = 1,
      limit = 10,
    } = filters;

    // Build the where clause for filtering
    const where: any = {};

    // Search by keyword in course title or school name
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { university: { name: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    // Filter by scholarship
    if (scholarship) {
      where.scholarship = { contains: scholarship, mode: 'insensitive' };
    }

    // Filter by country and region (on the School model)
    if (country || region) {
      where.university = {};
      if (country) {
        where.university.country = { contains: country, mode: 'insensitive' };
      }
      if (region) {
        where.university.region = { contains: region, mode: 'insensitive' };
      }
    }

    // Filter by programLevel and/or fieldOfStudy, matching with programLevel and title
    const categoryFilters: any[] = [];

    if (programLevel) {
      categoryFilters.push(
        { programLevel: { contains: programLevel, mode: 'insensitive' } },
        { title: { contains: programLevel, mode: 'insensitive' } }
      );
    }

    if (fieldOfStudy) {
      categoryFilters.push(
        { programLevel: { contains: fieldOfStudy, mode: 'insensitive' } },
        { title: { contains: fieldOfStudy, mode: 'insensitive' } }
      );
    }

    if (categoryFilters.length > 0) {
      if (where.OR) {
        // If keyword filter already exists, combine with AND
        where.AND = [
          { OR: where.OR }, // Existing keyword filter
          { OR: categoryFilters }, // New category filter
        ];
        delete where.OR; // Remove the top-level OR to avoid conflicts
      } else {
        where.OR = categoryFilters;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Fetch courses with pagination and filters
    const courses = await db.course.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        scholarship: true,
        ratings: true,
        programLevel: true,
        university: {
          select: {
            name: true,
            country: true,
            region: true,
          },
        },
      },
    });

    // Count total courses for pagination
    const total = await db.course.count({ where });

    // Map to CourseCardData format
    const courseCards: CourseCardData[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      schoolName: course.university.name,
      country: course.university.country,
      region: course.university.region,
      price: course.price,
      currency: course.currency,
      scholarship: course.scholarship,
      ratings: course.ratings,
      programLevel: course.programLevel,
    }));

    return {
      courses: courseCards,
      total,
    };
  } catch (error: any) {
    console.error('Error in getCoursesForDashboard:', error);
    throw new Error('Failed to fetch courses for dashboard');
  }
};

export const getCourseDetails = async (
  courseId: string
): Promise<CourseDetailData> => {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        profile: true,
        scholarship: true,
        duration: true,
        durationPeriod: true,
        price: true,
        currency: true,
        acceptanceFee: true,
        acceptanceFeeCurrency: true,
        description: true,
        requirements: true,
        ratings: true,
        courseInformation: true,
        courseWebsiteUrl: true,
        programLevel: true,
        careerOpportunities: true,
        loanInformation: true,
        estimatedLivingCost: true,
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            region: true,
            logo: true,
            websiteUrl: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    const courseDetails: CourseDetailData = {
      id: course.id,
      title: course.title,
      profile: course.profile,
      school: {
        id: course.university.id,
        name: course.university.name,
        country: course.university.country,
        region: course.university.region,
        logo: course.university.logo,
        websiteUrl: course.university.websiteUrl,
      },
      scholarship: course.scholarship,
      duration: course.duration,
      durationPeriod: course.durationPeriod,
      price: course.price,
      currency: course.currency,
      acceptanceFee: course.acceptanceFee,
      acceptanceFeeCurrency: course.acceptanceFeeCurrency,
      description: course.description,
      requirements: course.requirements,
      ratings: course.ratings,
      courseInformation: course.courseInformation,
      courseWebsiteUrl: course.courseWebsiteUrl,
      programLevel: course.programLevel,
      careerOpportunities: course.careerOpportunities,
      loanInformation: course.loanInformation,
      estimatedLivingCost: course.estimatedLivingCost,
    };

    return courseDetails;
  } catch (error: any) {
    console.error('Error in getCourseDetails:', error);
    throw new Error(`Failed to fetch course details: ${error.message}`);
  }
};

export const getSearchSuggestions = async (
  keyword: string
): Promise<string[]> => {
  try {
    // Fetch courses and schools matching the keyword
    const courses = await db.course.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { university: { name: { contains: keyword, mode: 'insensitive' } } },
        ],
      },
      select: {
        title: true,
        university: { select: { name: true } },
      },
      take: 5,
    });

    // Extract suggestions (course titles and school names)
    const suggestions = new Set<string>();
    courses.forEach((course) => {
      suggestions.add(course.title);
      suggestions.add(course.university.name);
    });

    return Array.from(suggestions);
  } catch (error: any) {
    console.error('Error in getSearchSuggestions:', error);
    throw new Error('Failed to fetch search suggestions');
  }
};
