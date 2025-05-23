// services/schoolService.ts
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
const { nanoid } = require('nanoid');

import cloudinary from '../config/cloudinary';
import path from 'path';
import sharp from 'sharp';
import { createCourse, createSchool } from '../models/schoolmodel';
import { db } from '../config/db';
import { z } from 'zod';
import { getUserByEmail } from '../models/userModel';
import { Prisma } from '@prisma/client';
import {
  CreateCourseData,
  UpdateCourseData,
} from '../types/school-course-types';

// Define the SchoolType enum
enum SchoolType {
  FEDERAL_UNIVERSITY = 'FEDERAL_UNIVERSITY',
  PRIVATE_UNIVERSITY = 'PRIVATE_UNIVERSITY',
  PUBLIC_UNIVERSITY = 'PUBLIC_UNIVERSITY',
}

interface CreateSchoolData {
  name: string;
  schoolType: SchoolType;
  region: string; // Updated from location to region
  country: string; // New field
  websiteUrl: string;
  logo: Express.Multer.File | undefined;
}

const uploadToCloudinary = async ({
  folder,
  file,
}: {
  folder: string;
  file: Express.Multer.File;
}): Promise<UploadApiResponse> => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, use_filename: true, unique_filename: true },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Upload result is undefined'));
          }
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });
  } catch (e) {
    throw e;
  }
};

export const createSchoolService = async ({
  name,
  schoolType,
  region,
  country,
  websiteUrl,
  logo,
  userId,
}: CreateSchoolData & { userId: string }) => {
  let logoUrl: string | null = null;

  try {
    // Check for duplicate school name
    const existingSchool = await db.school.findFirst({ where: { name } });
    if (existingSchool) {
      return {
        ok: false,
        status: 400,
        message: 'A school with this name already exists',
        errors: [{ message: 'Duplicate school name' }],
      };
    }

    // Validate and upload logo
    if (logo) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = path.extname(logo.originalname).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        return {
          ok: false,
          status: 403,
          message: 'File upload failed',
          errors: [
            { message: 'Invalid file type. Only JPG, JPEG & PNG are allowed.' },
          ],
        };
      }

      // Resize image
      const resizedBuffer = await sharp(logo.buffer)
        .resize(400, 400, { fit: sharp.fit.inside, withoutEnlargement: true })
        .toBuffer();

      const result: UploadApiResponse = await uploadToCloudinary({
        folder: 'school_logos',
        file: { ...logo, buffer: resizedBuffer },
      });

      logoUrl = result.secure_url;
    }

    const schoolId = nanoid(10);
    // Create school
    const newSchool = await db.school.create({
      data: {
        id: schoolId,
        name,
        schoolType,
        region,
        country,
        websiteUrl,
        logo: logoUrl,
      },
    });

    // Log action history
    await db.actionHistory.create({
      data: {
        action: 'Create',
        entity: 'School',
        entityIds: [{ id: newSchool.id, name: newSchool.name }],
        userId: userId,
      },
    });

    return {
      ok: true,
      status: 201,
      message: 'School created successfully',
      data: newSchool,
    };
  } catch (error: any) {
    console.error('Error creating school:', error);

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while creating the school',
      errors: [{ message: error.message }],
    };
  }
};

export const getAllSchoolsService = async () => {
  return db.school.findMany({
    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },
  });
};

export const getSchoolByIdService = async (id: string) => {
  return db.school.findUnique({ where: { id }, include: { courses: true } });
};
//

export const createCourseService = async ({
  title,
  logo,
  schoolId,
  scholarship,
  scholarshipInformation,
  duration,
  durationPeriod,
  price,
  currency,
  acceptanceFee,
  acceptanceFeeCurrency,
  objectives,
  courseWebsiteUrl,
  programLevel,
  loanInformation, // Already optional in interface, no change needed here
  userId,
  categoryId, // Add categoryId
}: CreateCourseData & { userId: string }) => {
  let profileUrl: string;

  try {
    // Validate schoolId
    const schoolExists = await db.school.findUnique({
      where: { id: schoolId },
    });
    if (!schoolExists) {
      return {
        ok: false,
        status: 404,
        message: 'School not found',
        errors: [{ message: 'The specified school does not exist' }],
      };
    }

    // Validate categoryId if provided
    if (categoryId) {
      const categoryExists = await db.courseCategory.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists) {
        return {
          ok: false,
          status: 404,
          message: 'Course category not found',
          errors: [{ message: 'The specified course category does not exist' }],
        };
      }
    }

    // Validate and upload logo (image)
    if (!logo) {
      return {
        ok: false,
        status: 400,
        message: 'File upload failed',
        errors: [{ message: 'Course image is required' }],
      };
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(logo.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        ok: false,
        status: 400,
        message: 'File upload failed',
        errors: [
          { message: 'Invalid file type. Only JPG, JPEG & PNG are allowed.' },
        ],
      };
    }

    // Resize image using sharp
    const resizedBuffer = await sharp(logo.buffer)
      .resize(400, 400, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toBuffer();

    const result: UploadApiResponse = await uploadToCloudinary({
      folder: 'course_profile',
      file: { ...logo, buffer: resizedBuffer },
    });

    profileUrl = result.secure_url;

    // Generate short ID using nanoid(10)
    const courseId = nanoid(10);

    // Create course
    const newCourse = await db.course.create({
      data: {
        id: courseId,
        title,
        image: profileUrl, // Store as image in DB
        schoolId,
        scholarship,
        scholarshipInformation,
        duration,
        durationPeriod,
        price,
        currency,
        acceptanceFee,
        acceptanceFeeCurrency,
        objectives,
        courseWebsiteUrl,
        programLevel,
        loanInformation, // Now optional, can be undefined
        categoryId, // Add categoryId
      },
    });

    // Log action history
    await db.actionHistory.create({
      data: {
        action: 'Create',
        entity: 'Course',
        entityIds: [{ id: newCourse.id, title: newCourse.title }],
        userId: userId,
      },
    });

    return {
      ok: true,
      status: 201,
      message: 'Course created successfully',
      data: newCourse,
    };
  } catch (error: any) {
    console.error('Error creating course:', error);

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while creating the course',
      errors: [{ message: error.message }],
    };
  }
};

export const updateCourseService = async ({
  id,
  title,
  logo,
  schoolId,
  scholarship,
  scholarshipInformation,
  duration,
  durationPeriod,
  price,
  currency,
  acceptanceFee,
  acceptanceFeeCurrency,
  objectives,
  courseWebsiteUrl,
  programLevel,
  loanInformation,
  userId,
  categoryId, // Add categoryId
}: UpdateCourseData & { userId: string }) => {
  let profileUrl: string | undefined;

  try {
    // Check if the course exists
    const existingCourse = await db.course.findUnique({ where: { id } });
    if (!existingCourse) {
      return { ok: false, status: 404, message: 'Course not found' };
    }

    // Validate schoolId if provided
    if (schoolId) {
      const schoolExists = await db.school.findUnique({
        where: { id: schoolId },
      });
      if (!schoolExists) {
        return {
          ok: false,
          status: 404,
          message: 'School not found',
          errors: [{ message: 'The specified school does not exist' }],
        };
      }
    }

    // Validate categoryId if provided
    if (categoryId) {
      const categoryExists = await db.courseCategory.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists) {
        return {
          ok: false,
          status: 404,
          message: 'Course category not found',
          errors: [{ message: 'The specified course category does not exist' }],
        };
      }
    }

    // Handle image upload if provided
    if (logo) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = path.extname(logo.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          ok: false,
          status: 400,
          message: 'File upload failed',
          errors: [
            {
              message:
                'Invalid file type. The file must be a JPG, JPEG, or PNG.',
            },
          ],
        };
      }

      // Resize the image using sharp
      const resizedBuffer = await sharp(logo.buffer)
        .resize(400, 400, { fit: sharp.fit.inside, withoutEnlargement: true })
        .toBuffer();

      const result: UploadApiResponse = await uploadToCloudinary({
        folder: 'course_profile',
        file: { ...logo, buffer: resizedBuffer },
      });

      profileUrl = result.secure_url;
    }

    // Update the course
    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        title: title || existingCourse.title,
        image: profileUrl || existingCourse.image, // Store as image in DB
        schoolId: schoolId || existingCourse.schoolId,
        categoryId: categoryId || existingCourse.categoryId,
        scholarship: scholarship || existingCourse.scholarship,
        scholarshipInformation:
          scholarshipInformation !== undefined
            ? scholarshipInformation
            : existingCourse.scholarshipInformation,
        duration: duration !== undefined ? duration : existingCourse.duration,
        durationPeriod: durationPeriod || existingCourse.durationPeriod,
        price: price !== undefined ? price : existingCourse.price,
        currency: currency || existingCourse.currency,
        acceptanceFee:
          acceptanceFee !== undefined
            ? acceptanceFee
            : existingCourse.acceptanceFee,
        acceptanceFeeCurrency:
          acceptanceFeeCurrency || existingCourse.acceptanceFeeCurrency,
        objectives: objectives || existingCourse.objectives,
        courseWebsiteUrl: courseWebsiteUrl || existingCourse.courseWebsiteUrl,
        programLevel: programLevel || existingCourse.programLevel,
        loanInformation: loanInformation || existingCourse.loanInformation,
      },
    });

    // Validate userId before logging action history
    let userExists = false;
    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      userExists = !!user;
    }

    if (userExists) {
      // Log action history only if user exists
      await db.actionHistory.create({
        data: {
          action: 'Update',
          entity: 'Course',
          entityIds: [{ id: updatedCourse.id, title: updatedCourse.title }],
          userId: userId,
        },
      });
    } else {
      console.warn(
        `Skipping ActionHistory creation: userId ${userId} does not exist`
      );
    }

    return {
      ok: true,
      status: 200,
      message: 'Course updated successfully',
      data: updatedCourse,
    };
  } catch (error: any) {
    console.error('Error updating course:', error);

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while updating the course',
      errors: [{ message: error.message }],
    };
  }
};

//
export const deleteSchoolsService = async (
  schoolId: string,
  userId: string
) => {
  try {
    // Fetch the school before deletion to log its details
    const schoolToDelete = await db.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true },
    });

    if (!schoolToDelete) {
      throw new Error(`School with ID ${schoolId} not found`);
    }

    // Delete all courses associated with the school
    await db.course.deleteMany({ where: { schoolId } });

    // Delete the school
    const deletedSchool = await db.school.delete({ where: { id: schoolId } });

    // Log successful deletion in action history
    await db.actionHistory.create({
      data: {
        action: 'Delete',
        entity: 'School',
        entityIds: [{ id: deletedSchool.id, name: deletedSchool.name }],
        userId: userId,
      },
    });

    return {
      ok: true,
      status: 200,
      message: 'School deleted successfully',
      data: deletedSchool,
    };
  } catch (error: any) {
    console.error('Error deleting school:', error);

    // Log failed delete attempt
    await db.actionHistory.create({
      data: {
        action: 'Failed Delete',
        entity: 'School',
        entityIds: [{ id: schoolId }],
        userId: userId,
      },
    });

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while deleting the school',
      errors: [{ message: error.message }],
    };
  }
};

export const searchSchoolsService = async (
  country: string,
  region?: string
) => {
  return db.school.findMany({
    where: {
      ...(country && { country: { contains: country, mode: 'insensitive' } }),
      ...(region && { region: { contains: region, mode: 'insensitive' } }),
    },
    include: { courses: true },
  });
};

interface UpdateSchoolData {
  id: string;
  name?: string;
  schoolType?: SchoolType;
  region?: string;
  country?: string;
  websiteUrl?: string;
  logo?: Express.Multer.File | null | undefined;
}

export const updateSchoolService = async ({
  id,
  name,
  schoolType,
  region,
  country,
  logo,
  websiteUrl,
  userId,
}: UpdateSchoolData & { userId: string }) => {
  let logoUrl: string | undefined;

  try {
    // Check if the school exists
    const existingSchool = await db.school.findUnique({ where: { id } });
    if (!existingSchool) {
      throw new Error(`School with ID ${id} not found`);
    }

    if (logo) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = path.extname(logo.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          ok: false,
          status: 403,
          message: 'File upload failed',
          errors: [
            { message: 'Invalid file type. Only JPG, JPEG & PNG are allowed.' },
          ],
        };
      }

      // Resize the image using sharp
      const resizedBuffer = await sharp(logo.buffer)
        .resize(400, 400, { fit: sharp.fit.inside, withoutEnlargement: true })
        .toBuffer();
      const result: UploadApiResponse = await uploadToCloudinary({
        folder: 'school_logos',
        file: { ...logo, buffer: resizedBuffer },
      });
      logoUrl = result.secure_url;
    }

    // Update the school
    const updatedSchool = await db.school.update({
      where: { id },
      data: {
        name: name || existingSchool.name,
        schoolType: schoolType || existingSchool.schoolType,
        region: region || existingSchool.region,
        country: country || existingSchool.country,
        websiteUrl: websiteUrl || existingSchool.websiteUrl,
        logo: logoUrl || existingSchool.logo,
      },
    });

    // Log action history for successful update
    await db.actionHistory.create({
      data: {
        action: 'Update',
        entity: 'School',
        entityIds: [{ id: updatedSchool.id, name: updatedSchool.name }],
        userId: userId,
      },
    });

    return {
      ok: true,
      status: 200,
      message: 'School updated successfully',
      data: updatedSchool,
    };
  } catch (error: any) {
    console.error('Error updating school:', error);

    // Log failed update attempt
    await db.actionHistory.create({
      data: {
        action: 'Failed Update',
        entity: 'School',
        entityIds: [{ id }],
        userId: userId,
      },
    });

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while updating the school',
      errors: [{ message: error.message }],
    };
  }
};

export const deleteCourseService = async (courseId: string, userId: string) => {
  try {
    // Check if the course exists
    const existingCourse = await db.course.findUnique({
      where: { id: courseId },
    });
    if (!existingCourse) {
      return { ok: false, status: 404, message: 'Course not found' };
    }

    // Delete the course
    await db.course.delete({ where: { id: courseId } });

    // Log action history for successful deletion
    await db.actionHistory.create({
      data: {
        action: 'Delete',
        entity: 'Course',
        entityIds: [{ id: existingCourse.id, name: existingCourse.title }],
        userId: userId,
      },
    });

    return { ok: true, status: 200, message: 'Course deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting course:', error);

    // Log failed deletion attempt
    await db.actionHistory.create({
      data: {
        action: 'Failed Delete',
        entity: 'Course',
        entityIds: [{ id: courseId }],
        userId: userId,
      },
    });

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while deleting the course',
      errors: [{ message: error.message }],
    };
  }
};

// export const getCourseByIdService = async (id: string) => {
//   try {
//     const course = await db.course.findUnique({
//       where: { id },
//       include: { university: true }, // Assuming 'university' is a typo and should be 'school'
//     });
//     return course;
//   } catch (e) {
//     throw e;
//   }
// };

export const getCourseByIdService = async (id: string) => {
  try {
    const course = await db.course.findUnique({
      where: { id },
      include: { university: true },
    });

    if (!course) return null;

    const parsedCourse = {
      ...course,
      ExamType1Subjects: course.ExamType1Subjects
        ? JSON.parse(course.ExamType1Subjects)
        : null,
      ExamType1SubGrades: course.ExamType1SubGrades
        ? JSON.parse(course.ExamType1SubGrades)
        : null,

      ExamType2Subjects: course.ExamType2Subjects
        ? JSON.parse(course.ExamType2Subjects)
        : null,
      ExamType2SubGrades: course.ExamType2SubGrades
        ? JSON.parse(course.ExamType2SubGrades)
        : null,

      ExamType3Subjects: course.ExamType3Subjects
        ? JSON.parse(course.ExamType3Subjects)
        : null,
      ExamType3SubGrades: course.ExamType3SubGrades
        ? JSON.parse(course.ExamType3SubGrades)
        : null,

      ExamType4Subjects: course.ExamType4Subjects
        ? JSON.parse(course.ExamType4Subjects)
        : null,
      ExamType4SubGrades: course.ExamType4SubGrades
        ? JSON.parse(course.ExamType4SubGrades)
        : null,

      ExamType5Subjects: course.ExamType5Subjects
        ? JSON.parse(course.ExamType5Subjects)
        : null,
      ExamType5SubGrades: course.ExamType5SubGrades
        ? JSON.parse(course.ExamType5SubGrades)
        : null,

      ExamType6Subjects: course.ExamType6Subjects
        ? JSON.parse(course.ExamType6Subjects)
        : null,
      ExamType6SubGrades: course.ExamType6SubGrades
        ? JSON.parse(course.ExamType6SubGrades)
        : null,

      ExamType7Subjects: course.ExamType7Subjects
        ? JSON.parse(course.ExamType7Subjects)
        : null,
      ExamType7SubGrades: course.ExamType7SubGrades
        ? JSON.parse(course.ExamType7SubGrades)
        : null,

      ExamType8Subjects: course.ExamType8Subjects
        ? JSON.parse(course.ExamType8Subjects)
        : null,
      ExamType8SubGrades: course.ExamType8SubGrades
        ? JSON.parse(course.ExamType8SubGrades)
        : null,

      ExamType9Subjects: course.ExamType9Subjects
        ? JSON.parse(course.ExamType9Subjects)
        : null,
      ExamType9SubGrades: course.ExamType9SubGrades
        ? JSON.parse(course.ExamType9SubGrades)
        : null,

      ExamType10Subjects: course.ExamType10Subjects
        ? JSON.parse(course.ExamType10Subjects)
        : null,
      ExamType10SubGrades: course.ExamType10SubGrades
        ? JSON.parse(course.ExamType10SubGrades)
        : null,
    };

    return parsedCourse;
  } catch (error) {
    throw error;
  }
};

export const getAllCoursesService = async () => {
  try {
    const courses = await db.course.findMany({
      include: {
        university: true, // Assuming 'university' is a typo and should be 'school'
      },
    });
    return courses;
  } catch (error) {
    throw error;
  }
};

export const getAllHistoryService = async () => {
  try {
    const courses = await db.actionHistory.findMany({
      include: {
        user: true,
      },
    });
    return courses;
  } catch (error) {
    throw error;
  }
};

// Validation schema for dashboard filters
const dashboardFilterSchema = z.object({
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  country: z.string().optional(),
  region: z.string().optional(),
});

export const getAdminDashboardService = async (filters: any) => {
  try {
    const parsedFilters = dashboardFilterSchema.parse(filters);

    // Build date filter compatible with Course, School, and User
    const dateFilter: Prisma.CourseWhereInput &
      Prisma.SchoolWhereInput &
      Prisma.UserWhereInput = {};
    if (parsedFilters.startDate && parsedFilters.endDate) {
      dateFilter.createdAt = {
        gte: parsedFilters.startDate,
        lte: parsedFilters.endDate,
      };
    }

    // Build school filter
    const schoolFilter: Prisma.SchoolWhereInput = {
      ...(parsedFilters.country
        ? { country: { contains: parsedFilters.country, mode: 'insensitive' } }
        : {}),
      ...(parsedFilters.region
        ? { region: { contains: parsedFilters.region, mode: 'insensitive' } }
        : {}),
      ...dateFilter,
    };

    // Metrics
    const totalSchools = await db.school.count({ where: schoolFilter });
    const totalCourses = await db.course.count({ where: dateFilter });
    const totalStudents = await db.user.count({
      where: { role: 'USER', ...dateFilter },
    });
    const totalLoanApplications = await db.course.count({ where: dateFilter }); // Adjust if you add a LoanApplication model

    // Top Schools by Course Count (proxy for loan applications)
    const topCourseSchools = await db.course.groupBy({
      by: ['schoolId'],
      _count: { schoolId: true },
      where: dateFilter,
      orderBy: { _count: { schoolId: 'desc' } },
      take: 5,
    });

    const topSchoolsWithDetails = await Promise.all(
      topCourseSchools.map(async (course) => {
        const school = await db.school.findUnique({
          where: { id: course.schoolId },
          select: { name: true, country: true, region: true },
        });
        return {
          ...school,
          courseCount: course._count!.schoolId, // Type assertion: _count is guaranteed to exist
        };
      })
    );

    // Courses by Location (proxy for loan applications by location)
    const coursesByLocation = await db.course.groupBy({
      by: ['schoolId'],
      _count: { schoolId: true },
      where: dateFilter,
    });

    const locationBreakdown = await Promise.all(
      coursesByLocation.map(async (course) => {
        const school = await db.school.findUnique({
          where: { id: course.schoolId },
          select: { country: true, region: true },
        });
        return {
          region: school?.region || 'Unknown',
          country: school?.country || 'Unknown',
          count: course._count!.schoolId, // Type assertion: _count is guaranteed to exist
        };
      })
    ).then((results) =>
      results.reduce(
        (acc, curr) => {
          const existing = acc.find(
            (item) =>
              item.region === curr.region && item.country === curr.country
          );
          if (existing) {
            existing.count += curr.count;
          } else {
            acc.push(curr);
          }
          return acc;
        },
        [] as { region: string; country: string; count: number }[]
      )
    );

    const dashboardData = {
      totalSchools,
      totalCourses,
      totalStudents,
      totalLoanApplications,
      topLoanSchools: topSchoolsWithDetails.map((s) => ({
        name: s.name,
        country: s.country,
        region: s.region,
        count: s.courseCount,
      })),
      loanApplicationsByCountryAndRegion: locationBreakdown,
    };

    return {
      status: 200,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
    };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Validation failed',
        errors: e.errors.map((err) => ({ message: err.message })),
      };
    }
    throw e;
  }
};
