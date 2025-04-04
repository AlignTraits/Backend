// services/dashboardService.ts
import { Prisma } from '@prisma/client';
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

    const where: Prisma.CourseWhereInput = {};

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { university: { name: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    if (scholarship) {
      where.scholarship = { contains: scholarship, mode: 'insensitive' };
    }

    if (country || region) {
      where.university = {};
      if (country) {
        where.university.country = { contains: country, mode: 'insensitive' };
      }
      if (region) {
        where.university.region = { contains: region, mode: 'insensitive' };
      }
    }

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
        where.AND = [{ OR: where.OR }, { OR: categoryFilters }];
        delete where.OR;
      } else {
        where.OR = categoryFilters;
      }
    }

    const skip = (page - 1) * limit;
    const take = limit;

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

    const total = await db.course.count({ where });

    const courseCards: CourseCardData[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      schoolName: course.university.name,
      country: course.university.country,
      region: course.university.region,
      price: course.price,
      currency: course.currency,
      scholarship: course.scholarship,
      ratings: course.ratings ?? 0, // Default to 0 if null
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
        image: true,
        scholarship: true,
        scholarshipInformation: true,
        duration: true,
        durationPeriod: true,
        price: true,
        currency: true,
        acceptanceFee: true,
        acceptanceFeeCurrency: true,
        ratings: true,
        courseWebsiteUrl: true,
        programLevel: true,
        loanInformation: true,
        objectives: true,
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
      image: course.image,
      university: {
        id: course.university.id,
        name: course.university.name,
        country: course.university.country,
        region: course.university.region,
        logo: course.university.logo,
        websiteUrl: course.university.websiteUrl,
      },
      scholarship: course.scholarship,
      scholarshipInformation: course.scholarshipInformation,
      duration: course.duration,
      durationPeriod: course.durationPeriod,
      price: course.price,
      currency: course.currency,
      acceptanceFee: course.acceptanceFee,
      acceptanceFeeCurrency: course.acceptanceFeeCurrency,
      ratings: course.ratings ?? 0, // Default to 0 if null
      courseWebsiteUrl: course.courseWebsiteUrl,
      programLevel: course.programLevel,
      loanInformation: course.loanInformation,
      objectives: course.objectives,
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
