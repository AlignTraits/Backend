import { db } from '../config/db';
const { nanoid } = require('nanoid');
import { parseAsync } from 'json2csv';
import * as XLSX from 'xlsx';
import fs from 'fs';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import path from 'path';
import sharp from 'sharp';
import {
  CreateCSVCourseData,
  newCreateSchoolData,
  UpdateCourseData,
  UpdateSchoolData,
  UpdateCsvCourseData,
  CourseReportData,
} from '../types/school-course-types';
import { Currency, DurationPeriod, ExamType, Grade } from '@prisma/client';

const uploadBase64ImageToCloudinary = async (
  base64Image: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Image}`,
      { folder: 'course_profiles' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Upload result is undefined'));
        }
        resolve(result);
      }
    );
  });
};

export const createBulkSchoolsService2 = async (
  schools: newCreateSchoolData[],
  userId: string
) => {
  try {
    const results = await Promise.allSettled(
      schools.map(async (school) => {
        try {
          const schoolId = nanoid(10);
          const newSchool = await db.school.create({
            data: {
              id: schoolId,
              name: school.name,
              schoolType: school.schoolType,
              country: school.country,
              region: school.region,
              logo: school.logo || null,
              websiteUrl: school.websiteUrl,
            },
          });

          return { id: newSchool.id, name: newSchool.name };
        } catch (error: any) {
          console.error(`Error creating school "${school.name}":`, error);

          // Beautify the error message
          let userFriendlyMessage =
            'An unexpected error occurred while creating the school';
          if (error.message.includes('Unique constraint failed')) {
            if (error.message.includes('name')) {
              userFriendlyMessage = `A school with the name "${school.name}" already exists`;
            } else {
              userFriendlyMessage = 'A unique constraint was violated';
            }
          } else if (error.message.includes('Invalid value for argument')) {
            if (error.message.includes('schoolType')) {
              userFriendlyMessage =
                'Invalid school type. Must be a valid school type (e.g., UNIVERSITY, COLLEGE)';
            } else {
              userFriendlyMessage = 'Invalid data provided for the school';
            }
          } else if (error.message.includes('Failed to create school')) {
            userFriendlyMessage = error.message.replace(
              `Failed to create school ${school.name}: `,
              ''
            );
          }

          // Log the failure to the BulkOperationFailure table
          await db.bulkOperationFailure.create({
            data: {
              entity: 'School',
              operation: 'Create',
              itemData: school as any, // Store the failed school data as JSON
              errorMessage: userFriendlyMessage,
            },
          });

          throw new Error(userFriendlyMessage);
        }
      })
    );

    const successfulSchools = results
      .filter((result) => result.status === 'fulfilled')
      .map(
        (result: PromiseFulfilledResult<{ id: string; name: string }>) =>
          result.value
      );

    const failedSchools = results
      .filter((result) => result.status === 'rejected')
      .map((result: PromiseRejectedResult) => ({
        error: result.reason.message,
      }));

    if (successfulSchools.length > 0) {
      // Validate userId before logging action history
      let userExists = false;
      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        userExists = !!user;
      }

      if (userExists) {
        try {
          await db.actionHistory.create({
            data: {
              action: 'Bulk Create',
              entity: 'School',
              entityIds: successfulSchools.map(({ id, name }) => ({
                id,
                name,
              })),
              userId: userId,
            },
          });
        } catch (error) {
          console.error('Error logging action history:', error);
        }
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      success: successfulSchools,
      failed: failedSchools,
    };
  } catch (error: any) {
    console.error('Error in createBulkSchoolsService2:', error);
    throw new Error(`Bulk school creation failed: ${error.message}`);
  }
};

export const deleteBulkSchoolsService = async (
  schoolIds: string[],
  userId: string
) => {
  try {
    const schoolsToDelete = await db.school.findMany({
      where: { id: { in: schoolIds } },
      select: { id: true, name: true },
    });

    const validSchoolIds = schoolsToDelete.map((school) => school.id);
    const invalidSchoolIds = schoolIds.filter(
      (id) => !validSchoolIds.includes(id)
    );

    await db.course.deleteMany({
      where: { schoolId: { in: validSchoolIds } },
    });

    const deletedSchools = await db.school.deleteMany({
      where: { id: { in: validSchoolIds } },
    });

    if (deletedSchools.count > 0) {
      // Validate userId before logging action history
      let userExists = false;
      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        userExists = !!user;
      }

      if (userExists) {
        await db.actionHistory.create({
          data: {
            action: 'Bulk Delete',
            entity: 'School',
            entityIds: schoolsToDelete.map(({ id, name }) => ({ id, name })),
            userId: userId,
          },
        });
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      message: 'Bulk school deletion process completed',
      data: {
        deleted: schoolsToDelete,
        failed: invalidSchoolIds.length > 0 ? invalidSchoolIds : null,
      },
    };
  } catch (error: any) {
    console.error('Error in deleteBulkSchoolsService:', error);
    throw new Error(
      'Failed to delete schools and their associated courses: ' + error.message
    );
  }
};

export const deleteBulkCoursesService = async (
  courseIds: string[],
  userId: string
) => {
  try {
    const coursesToDelete = await db.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true },
    });

    const validCourseIds = coursesToDelete.map((course) => course.id);
    const invalidCourseIds = courseIds.filter(
      (id) => !validCourseIds.includes(id)
    );

    const deletedCourses = await db.course.deleteMany({
      where: { id: { in: validCourseIds } },
    });

    if (deletedCourses.count > 0) {
      // Validate userId before logging action history
      let userExists = false;
      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        userExists = !!user;
      }

      if (userExists) {
        await db.actionHistory.create({
          data: {
            action: 'Bulk Delete',
            entity: 'Course',
            entityIds: coursesToDelete.map(({ id, title }) => ({ id, title })),
            userId: userId,
          },
        });
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      message: 'Bulk course deletion process completed',
      data: {
        deleted: coursesToDelete,
        failed: invalidCourseIds.length > 0 ? invalidCourseIds : null,
      },
    };
  } catch (error: any) {
    console.error('Error in deleteBulkCoursesService:', error);
    throw new Error('Failed to delete courses: ' + error.message);
  }
};

const processProfileImage = async (profile: string): Promise<string | null> => {
  if (profile.startsWith('data:image/')) {
    const result: UploadApiResponse =
      await uploadBase64ImageToCloudinary(profile);
    return result.secure_url;
  } else if (profile.startsWith('https://')) {
    return profile;
  } else {
    throw new Error('Invalid profile image format');
  }
};

const parseJsonField = (field: any): any[] => {
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (error) {
    throw new Error('Invalid JSON format in one of the fields');
  }
};

export const createBulkCoursesService = async (
  courses: CreateCSVCourseData[],
  userId: string
) => {
  try {
    const errors: { courseTitle: string; error: string }[] = [];

    // Validate school IDs
    const schoolIds = [...new Set(courses.map((course) => course.schoolId))];
    const existingSchools = await db.school.findMany({
      where: { id: { in: schoolIds } },
      select: { id: true },
    });

    const existingSchoolIds = new Set(existingSchools.map((s) => s.id));

    const results = await Promise.allSettled(
      courses.map(async (course) => {
        try {
          // Validate school existence
          if (!existingSchoolIds.has(course.schoolId)) {
            throw new Error(`School with ID ${course.schoolId} does not exist`);
          }

          // Validate profile image
          let profileUrl: string | null = null;
          if (course.image) {
            profileUrl = await processProfileImage(course.image);
          } else {
            throw new Error('Profile image is required');
          }

          // Parse JSON fields
          const requirements = parseJsonField(course.requirements);
          const careerOpportunities = parseJsonField(
            course.careerOpportunities
          );
          const examTypes = parseJsonField(course.examTypes);
          const grades = parseJsonField(course.grades);
          const subjects = parseJsonField(course.subjects);

          // Validate examTypes and grades against enums
          const validExamTypes = [
            'JAMB',
            'UTME',
            'NECO',
            'GCE',
            'WAEC',
            'NABTEB',
            'A_LEVEL',
          ] as const;
          const validGrades = [
            'A1',
            'B2',
            'B3',
            'C4',
            'C5',
            'C6',
            'D7',
            'E8',
            'F9',
          ] as const;

          if (
            !examTypes.every((type: string) =>
              validExamTypes.includes(type as any)
            )
          ) {
            throw new Error(
              'Invalid exam type. Must be one of: ' + validExamTypes.join(', ')
            );
          }
          if (
            !grades.every((grade: string) => validGrades.includes(grade as any))
          ) {
            throw new Error(
              'Invalid grade. Must be one of: ' + validGrades.join(', ')
            );
          }

          // Validate subjects and grades length match
          if (subjects.length !== grades.length) {
            throw new Error(
              'The number of subjects must match the number of grades'
            );
          }

          // Validate ratings if provided
          if (
            course.ratings !== undefined &&
            (course.ratings < 0 || course.ratings > 5)
          ) {
            throw new Error('Ratings must be between 0 and 5');
          }

          // Map durationPeriod to Prisma's DurationPeriod
          let mappedDurationPeriod: DurationPeriod;
          if (course.durationPeriod === 'YEAR') {
            mappedDurationPeriod = DurationPeriod.YEARS;
          } else if (course.durationPeriod === 'MONTH') {
            mappedDurationPeriod = DurationPeriod.MONTHS;
          } else if (course.durationPeriod === 'WEEK') {
            mappedDurationPeriod = DurationPeriod.WEEKS;
          } else {
            throw new Error(
              'Invalid duration period. Must be one of: YEAR, MONTH, WEEK'
            );
          }

          // Map currency to Prisma's Currency
          let mappedCurrency: Currency;
          if (course.currency === 'NAIRA') {
            mappedCurrency = Currency.NGN;
          } else if (course.currency === 'DOLLAR') {
            mappedCurrency = Currency.USD;
          } else if (course.currency === 'EURO') {
            mappedCurrency = Currency.EUR;
          } else {
            throw new Error(
              'Invalid currency. Must be one of: NAIRA, DOLLAR, EURO'
            );
          }

          // Map acceptanceFeeCurrency to Prisma's Currency
          let mappedAcceptanceFeeCurrency: Currency;
          if (course.acceptanceFeeCurrency === 'NAIRA') {
            mappedAcceptanceFeeCurrency = Currency.NGN;
          } else if (course.acceptanceFeeCurrency === 'DOLLAR') {
            mappedAcceptanceFeeCurrency = Currency.USD;
          } else if (course.acceptanceFeeCurrency === 'EURO') {
            mappedAcceptanceFeeCurrency = Currency.EUR;
          } else {
            throw new Error(
              'Invalid acceptance fee currency. Must be one of: NAIRA, DOLLAR, EURO'
            );
          }

          // Generate short ID
          const courseId = nanoid(10);

          // Create the course
          const newCourse = await db.course.create({
            data: {
              id: courseId,
              title: course.title,
              image: profileUrl,
              schoolId: course.schoolId,
              scholarship: course.scholarship,
              scholarshipRequirement: course.scholarshipRequirement,
              duration: course.duration,
              durationPeriod: mappedDurationPeriod, // Use mapped value
              price: course.price,
              currency: mappedCurrency, // Use mapped value
              acceptanceFee: course.acceptanceFee,
              acceptanceFeeCurrency: mappedAcceptanceFeeCurrency, // Use mapped value
              objectives: course.objectives,
              requirements,
              courseInformation: course.courseInformation,
              courseWebsiteUrl: course.courseWebsiteUrl,
              programLevel: course.programLevel,
              careerOpportunities,
              loanInformation: course.loanInformation,
              examTypes: examTypes as ExamType[],
              examYear: course.examYear,
              subjects,
              grades: grades as Grade[],
              ratings: course.ratings ?? 0.0,
            },
          });

          return { id: newCourse.id, title: newCourse.title };
        } catch (error: any) {
          console.error(`Error creating course "${course.title}":`, error);

          // Beautify the error message
          let userFriendlyMessage =
            'An unexpected error occurred while creating the course';
          if (error.message.includes('School with ID')) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (error.message.includes('Profile image is required')) {
            userFriendlyMessage = 'Course image is required';
          } else if (error.message.includes('Invalid exam type')) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (error.message.includes('Invalid grade')) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (
            error.message.includes('The number of subjects must match')
          ) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (error.message.includes('Ratings must be between')) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (error.message.includes('Invalid duration period')) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (error.message.includes('Invalid currency')) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (
            error.message.includes('Invalid acceptance fee currency')
          ) {
            userFriendlyMessage = error.message; // Already user-friendly
          } else if (error.message.includes('Invalid JSON format')) {
            userFriendlyMessage =
              'Invalid JSON format in one of the fields (e.g., requirements, careerOpportunities)';
          }
          // Log the failure to the BulkOperationFailure table
          await db.bulkOperationFailure.create({
            data: {
              entity: 'Course', // Corrected from 'School' to 'Course'
              operation: 'Create', // Corrected from 'Update' to 'Create'
              itemData: course as any, // Store the failed course data as JSON
              errorMessage: userFriendlyMessage,
            },
          });
          errors.push({
            courseTitle: course.title,
            error: userFriendlyMessage,
          });
          return null;
        }
      })
    );

    const createdCourses = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{ id: string; title: string }> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => result.value);

    if (createdCourses.length > 0) {
      // Validate userId before logging action history
      let userExists = false;
      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        userExists = !!user;
      }

      if (userExists) {
        await db.actionHistory.create({
          data: {
            action: 'Bulk Create',
            entity: 'Course',
            entityIds: createdCourses.map(({ id, title }) => ({ id, title })),
            userId: userId,
          },
        });
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      message: 'Courses created successfully',
      data: {
        success: createdCourses,
        errors: errors,
      },
    };
  } catch (error: any) {
    console.error('Error in createBulkCoursesService:', error);
    throw new Error(`Bulk course creation failed: ${error.message}`);
  }
};

export const updateBulkSchoolsService = async (
  schools: UpdateSchoolData[],
  userId: string
) => {
  try {
    const results = await Promise.allSettled(
      schools.map(async (school) => {
        try {
          if (!school.id) {
            throw new Error('Missing school ID');
          }

          const existingSchool = await db.school.findUnique({
            where: { id: school.id },
          });

          if (!existingSchool) {
            throw new Error(`School with ID ${school.id} not found`);
          }

          const updateData = {
            name: school.name ?? existingSchool.name,
            schoolType: school.schoolType ?? existingSchool.schoolType,
            country: school.country ?? existingSchool.country,
            region: school.region ?? existingSchool.region,
            websiteUrl: school.websiteUrl ?? existingSchool.websiteUrl,
            logo: school.logo ?? existingSchool.logo,
          };

          if (JSON.stringify(updateData) === JSON.stringify(existingSchool)) {
            return {
              status: 'skipped',
              id: school.id,
              name: existingSchool.name,
              message: `No changes for school with ID ${school.id}`,
            };
          }

          const updatedSchool = await db.school.update({
            where: { id: school.id },
            data: updateData,
          });

          return {
            status: 'success',
            data: { id: updatedSchool.id, name: updatedSchool.name },
          };
        } catch (error: any) {
          console.error(
            `Error updating school "${school.name || school.id}":`,
            error
          );

          // Beautify the error message
          let userFriendlyMessage =
            'An unexpected error occurred while updating the school';
          if (error.message.includes('Missing school ID')) {
            userFriendlyMessage = 'School ID is required';
          } else if (error.message.includes('School with ID')) {
            userFriendlyMessage = error.message; // Already user-friendly
          }

          // Log the failure to the BulkOperationFailure table
          await db.bulkOperationFailure.create({
            data: {
              entity: 'School',
              operation: 'Update',
              itemData: school as any, // Store the failed school data as JSON
              errorMessage: userFriendlyMessage,
            },
          });

          return {
            status: 'failed',
            id: school.id,
            name: school.name || 'Unknown',
            reason: userFriendlyMessage,
          };
        }
      })
    );

    const updatedSchools = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'success'
      )
      .map((result: any) => result.value.data);

    const failedUpdates = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'failed'
      )
      .map((result: any) => ({
        id: result.value.id,
        name: result.value.name,
        error: result.value.reason,
      }));

    const skippedUpdates = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'skipped'
      )
      .map((result: any) => ({
        id: result.value.id,
        name: result.value.name,
        message: result.value.message,
      }));

    if (updatedSchools.length > 0) {
      // Validate userId before logging action history
      let userExists = false;
      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        userExists = !!user;
      }

      if (userExists) {
        await db.actionHistory.create({
          data: {
            action: 'Bulk Update',
            entity: 'School',
            entityIds: updatedSchools.map(({ id, name }) => ({ id, name })),
            userId: userId,
          },
        });
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      message: 'Bulk update process completed',
      data: {
        updated: updatedSchools,
        failed: failedUpdates,
        skipped: skippedUpdates,
      },
    };
  } catch (error) {
    console.error('Error in updateBulkSchoolsService:', error);
    throw new Error('Bulk school update failed');
  }
};

const parseJsonFieldForUpdate = (field: any): string[] => {
  try {
    if (typeof field === 'string') {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    }
    return Array.isArray(field) ? field : [];
  } catch (error) {
    throw new Error('Invalid JSON format in one of the fields');
  }
};

const processImage = async (image: string): Promise<string | null> => {
  if (image.startsWith('data:image/')) {
    const result: UploadApiResponse =
      await uploadBase64ImageToCloudinary(image);
    return result.secure_url;
  } else if (image.startsWith('https://')) {
    return image;
  } else {
    throw new Error('Invalid image format');
  }
};

// services/bulk-test.ts

export const updateBulkCoursesService = async (
  courses: UpdateCsvCourseData[], // Using UpdateCourseData as per previous fix
  userId: string
) => {
  try {
    const results = await Promise.allSettled(
      courses.map(async (course) => {
        try {
          if (!course.id) {
            throw new Error('Missing course ID');
          }

          const existingCourse = await db.course.findUnique({
            where: { id: course.id },
          });

          if (!existingCourse) {
            throw new Error(`Course with ID ${course.id} not found`);
          }

          // Validate schoolId if provided
          if (course.schoolId) {
            const schoolExists = await db.school.findUnique({
              where: { id: course.schoolId },
            });
            if (!schoolExists) {
              throw new Error(
                `School with ID ${course.schoolId} does not exist`
              );
            }
          }

          // Process image if provided
          let imageUrl: string | null = null;
          if (course.image) {
            imageUrl = await processImage(course.image);
          }

          // Parse JSON fields if provided
          const requirements = course.requirements
            ? parseJsonFieldForUpdate(course.requirements)
            : undefined;
          const careerOpportunities = course.careerOpportunities
            ? parseJsonFieldForUpdate(course.careerOpportunities)
            : undefined;
          const examTypes = course.examTypes
            ? parseJsonFieldForUpdate(course.examTypes)
            : undefined;
          const grades = course.grades
            ? parseJsonFieldForUpdate(course.grades)
            : undefined;
          const subjects = course.subjects
            ? parseJsonFieldForUpdate(course.subjects)
            : undefined;

          // Validate examTypes and grades if provided
          const validExamTypes = [
            'JAMB',
            'UTME',
            'NECO',
            'GCE',
            'WAEC',
            'NABTEB',
            'A_LEVEL',
          ] as const;
          const validGrades = [
            'A1',
            'B2',
            'B3',
            'C4',
            'C5',
            'C6',
            'D7',
            'E8',
            'F9',
          ] as const;

          if (
            examTypes &&
            !examTypes.every((type: string) =>
              validExamTypes.includes(type as any)
            )
          ) {
            throw new Error(
              'Invalid exam type. Must be one of: ' + validExamTypes.join(', ')
            );
          }
          if (
            grades &&
            !grades.every((grade: string) => validGrades.includes(grade as any))
          ) {
            throw new Error(
              'Invalid grade. Must be one of: ' + validGrades.join(', ')
            );
          }

          // Validate subjects and grades length match if both are provided
          if (subjects && grades && subjects.length !== grades.length) {
            throw new Error(
              'The number of subjects must match the number of grades'
            );
          }

          // Validate ratings if provided
          if (
            course.ratings !== undefined &&
            (course.ratings < 0 || course.ratings > 5)
          ) {
            throw new Error('Ratings must be between 0 and 5');
          }

          // Map durationPeriod to Prisma's DurationPeriod if provided
          let mappedDurationPeriod: DurationPeriod | undefined;
          if (course.durationPeriod) {
            if (course.durationPeriod === 'YEAR') {
              mappedDurationPeriod = DurationPeriod.YEARS;
            } else if (course.durationPeriod === 'MONTH') {
              mappedDurationPeriod = DurationPeriod.MONTHS;
            } else if (course.durationPeriod === 'WEEK') {
              mappedDurationPeriod = DurationPeriod.WEEKS;
            } else {
              throw new Error(
                'Invalid duration period. Must be one of: YEAR, MONTH, WEEK'
              );
            }
          }

          // Map currency to Prisma's Currency if provided
          let mappedCurrency: Currency | undefined;
          if (course.currency) {
            if (course.currency === 'NAIRA') {
              mappedCurrency = Currency.NGN;
            } else if (course.currency === 'DOLLAR') {
              mappedCurrency = Currency.USD;
            } else if (course.currency === 'EURO') {
              mappedCurrency = Currency.EUR;
            } else {
              throw new Error(
                'Invalid currency. Must be one of: NAIRA, DOLLAR, EURO'
              );
            }
          }

          // Map acceptanceFeeCurrency to Prisma's Currency if provided
          let mappedAcceptanceFeeCurrency: Currency | undefined;
          if (course.acceptanceFeeCurrency) {
            if (course.acceptanceFeeCurrency === 'NAIRA') {
              mappedAcceptanceFeeCurrency = Currency.NGN;
            } else if (course.acceptanceFeeCurrency === 'DOLLAR') {
              mappedAcceptanceFeeCurrency = Currency.USD;
            } else if (course.acceptanceFeeCurrency === 'EURO') {
              mappedAcceptanceFeeCurrency = Currency.EUR;
            } else {
              throw new Error(
                'Invalid acceptance fee currency. Must be one of: NAIRA, DOLLAR, EURO'
              );
            }
          }

          // Prepare update data
          const updateData = {
            title: course.title ?? existingCourse.title,
            image: imageUrl ?? existingCourse.image,
            schoolId: course.schoolId ?? existingCourse.schoolId,
            scholarship: course.scholarship ?? existingCourse.scholarship,
            scholarshipRequirement:
              course.scholarshipRequirement !== undefined
                ? course.scholarshipRequirement
                : existingCourse.scholarshipRequirement,
            duration: course.duration ?? existingCourse.duration,
            durationPeriod:
              mappedDurationPeriod ?? existingCourse.durationPeriod,
            price: course.price ?? existingCourse.price,
            currency: mappedCurrency ?? existingCourse.currency,
            acceptanceFee: course.acceptanceFee ?? existingCourse.acceptanceFee,
            acceptanceFeeCurrency:
              mappedAcceptanceFeeCurrency ??
              existingCourse.acceptanceFeeCurrency,
            objectives: course.objectives ?? existingCourse.objectives,
            requirements: requirements ?? existingCourse.requirements,
            courseInformation:
              course.courseInformation ?? existingCourse.courseInformation,
            courseWebsiteUrl:
              course.courseWebsiteUrl ?? existingCourse.courseWebsiteUrl,
            programLevel: course.programLevel ?? existingCourse.programLevel,
            careerOpportunities:
              careerOpportunities ?? existingCourse.careerOpportunities,
            loanInformation:
              course.loanInformation ?? existingCourse.loanInformation,
            examTypes: examTypes
              ? (examTypes as ExamType[])
              : existingCourse.examTypes,
            examYear:
              course.examYear !== undefined
                ? course.examYear
                : existingCourse.examYear,
            subjects: subjects ?? existingCourse.subjects,
            grades: grades ? (grades as Grade[]) : existingCourse.grades,
            ratings:
              course.ratings !== undefined
                ? course.ratings
                : existingCourse.ratings,
          };

          // Skip if no changes
          if (JSON.stringify(updateData) === JSON.stringify(existingCourse)) {
            return {
              status: 'skipped',
              id: course.id,
              title: existingCourse.title,
              message: `No changes for course ID ${course.id}`,
            };
          }

          // Update the course
          const updatedCourse = await db.course.update({
            where: { id: course.id },
            data: updateData,
          });

          return {
            status: 'success',
            data: { id: updatedCourse.id, title: updatedCourse.title },
          };
        } catch (error: any) {
          console.error(
            `Error updating course "${course.title || course.id}":`,
            error
          );

          // Beautify the error message
          let userFriendlyMessage =
            'An unexpected error occurred while updating the course';
          if (error.message.includes('Missing course ID')) {
            userFriendlyMessage = 'Course ID is required';
          } else if (error.message.includes('Course with ID')) {
            userFriendlyMessage = error.message;
          } else if (error.message.includes('School with ID')) {
            userFriendlyMessage = error.message;
          } else if (error.message.includes('Invalid image format')) {
            userFriendlyMessage =
              'Invalid image format. Must be a base64 string or a valid URL';
          } else if (error.message.includes('Invalid exam type')) {
            userFriendlyMessage = error.message;
          } else if (error.message.includes('Invalid grade')) {
            userFriendlyMessage = error.message;
          } else if (
            error.message.includes('The number of subjects must match')
          ) {
            userFriendlyMessage = error.message;
          } else if (error.message.includes('Ratings must be between')) {
            userFriendlyMessage = error.message;
          } else if (error.message.includes('Invalid duration period')) {
            userFriendlyMessage = error.message;
          } else if (error.message.includes('Invalid currency')) {
            userFriendlyMessage = error.message;
          } else if (
            error.message.includes('Invalid acceptance fee currency')
          ) {
            userFriendlyMessage = error.message;
          } else if (error.message.includes('Invalid JSON format')) {
            userFriendlyMessage =
              'Invalid JSON format in one of the fields (e.g., requirements, careerOpportunities)';
          } else if (error.message.includes('Invalid value for argument')) {
            if (error.message.includes('durationPeriod')) {
              userFriendlyMessage =
                'Invalid duration period. Must be one of: YEAR, MONTH, WEEK';
            } else if (error.message.includes('currency')) {
              userFriendlyMessage =
                'Invalid currency. Must be one of: NAIRA, DOLLAR, EURO';
            } else if (error.message.includes('acceptanceFeeCurrency')) {
              userFriendlyMessage =
                'Invalid acceptance fee currency. Must be one of: NAIRA, DOLLAR, EURO';
            } else {
              userFriendlyMessage =
                'Invalid data provided for the course update';
            }
          }

          // Log the failure to the BulkOperationFailure table
          await db.bulkOperationFailure.create({
            data: {
              entity: 'Course',
              operation: 'Update',
              itemData: course as any, // Store the failed course data as JSON
              errorMessage: userFriendlyMessage,
            },
          });

          return {
            status: 'failed',
            id: course.id,
            title: course.title || 'Unknown',
            reason: userFriendlyMessage,
          };
        }
      })
    );

    const updatedCourses = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'success'
      )
      .map((result: any) => result.value.data);

    const failedUpdates = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'failed'
      )
      .map((result: any) => ({
        id: result.value.id,
        title: result.value.title,
        error: result.value.reason,
      }));

    const skippedUpdates = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'skipped'
      )
      .map((result: any) => ({
        id: result.value.id,
        title: result.value.title,
        message: result.value.message,
      }));

    if (updatedCourses.length > 0) {
      // Validate userId before logging action history
      let userExists = false;
      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        userExists = !!user;
      }

      if (userExists) {
        await db.actionHistory.create({
          data: {
            action: 'Bulk Update',
            entity: 'Course',
            entityIds: updatedCourses.map(({ id, title }) => ({ id, title })),
            userId: userId,
          },
        });
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      message: 'Bulk update process completed',
      data: {
        updated: updatedCourses,
        failed: failedUpdates,
        skipped: skippedUpdates,
      },
    };
  } catch (error: any) {
    console.error('Error in updateBulkCoursesService:', error);
    throw new Error(`Bulk course update failed: ${error.message}`);
  }
};

type SchoolReportData = {
  id: string;
  name: string;
  schoolType: string;
  country: string;
  region: string;
  websiteUrl: string;
  logo: string | null;
  createdAt: Date;
};

export const generateSchoolCourseReport = async (
  entity: string,
  format: string,
  startDate?: string,
  endDate?: string,
  id?: string,
  name?: string,
  title?: string,
  country?: string,
  region?: string,
  schoolId?: string
): Promise<string> => {
  try {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    console.log('Received filters:', {
      entity,
      format,
      startDate,
      endDate,
      id,
      name,
      title,
      country,
      region,
      schoolId,
    });

    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `${entity}_report_${timestamp}.${format}`;
    const filePath = path.join(downloadsDir, fileName);

    if (entity === 'school') {
      const where: any = {};
      if (start && end) where.createdAt = { gte: start, lte: end };
      if (id) where.id = id;
      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (country) where.country = { contains: country, mode: 'insensitive' };
      if (region) where.region = { contains: region, mode: 'insensitive' };

      const schools = await db.school.findMany({
        where,
        select: {
          id: true,
          name: true,
          schoolType: true,
          country: true,
          region: true,
          websiteUrl: true,
          logo: true,
          createdAt: true,
        },
      });

      const schoolData: SchoolReportData[] = schools;

      if (schoolData.length === 0) {
        console.error('No school data found for the given filters:', {
          startDate,
          endDate,
          id,
          name,
          country,
          region,
        });
        throw new Error('No data available for the given filters.');
      }

      if (format === 'csv') {
        const csv = await parseAsync(schoolData);
        fs.writeFileSync(filePath, csv);
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(schoolData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Schools');
        XLSX.writeFile(wb, filePath);
      } else {
        throw new Error('Unsupported format');
      }
    } else if (entity === 'course') {
      const where: any = {};
      if (start && end) where.createdAt = { gte: start, lte: end };
      if (id) where.id = { equals: id };
      if (title) where.title = { contains: title, mode: 'insensitive' };
      if (schoolId) where.schoolId = { equals: schoolId };

      const courses = await db.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          image: true, // Renamed from profile to image
          schoolId: true,
          scholarship: true,
          scholarshipRequirement: true, // Added
          duration: true,
          durationPeriod: true,
          price: true,
          currency: true,
          acceptanceFee: true,
          acceptanceFeeCurrency: true,
          objectives: true, // Renamed from description to objectives
          requirements: true,
          courseInformation: true,
          courseWebsiteUrl: true,
          programLevel: true,
          careerOpportunities: true,
          loanInformation: true,
          examTypes: true, // Added
          examYear: true, // Added
          subjects: true, // Added
          grades: true, // Added
          ratings: true,
          createdAt: true,
        },
      });

      const courseData: CourseReportData[] = courses.map((course) => ({
        id: course.id,
        title: course.title,
        image: course.image ?? '', // Use image instead of profile
        schoolId: course.schoolId,
        scholarship: course.scholarship,
        scholarshipRequirement: course.scholarshipRequirement, // Added
        duration: `${course.duration} ${course.durationPeriod.toLowerCase()}`,
        price: course.price,
        currency: course.currency,
        acceptanceFee: course.acceptanceFee,
        acceptanceFeeCurrency: course.acceptanceFeeCurrency,
        objectives: course.objectives, // Use objectives instead of description
        requirements: course.requirements.join(', '),
        courseInformation: course.courseInformation,
        courseWebsiteUrl: course.courseWebsiteUrl,
        programLevel: course.programLevel,
        careerOpportunities: course.careerOpportunities.join(', '),
        loanInformation: course.loanInformation,
        examTypes: course.examTypes.join(', '), // Added
        examYear: course.examYear, // Added
        subjects: course.subjects.join(', '), // Added
        grades: course.grades.join(', '), // Added
        ratings: course.ratings,
        createdAt: course.createdAt,
      }));

      if (courseData.length === 0) {
        console.error('No course data found for the given filters:', {
          startDate,
          endDate,
          id,
          title,
          schoolId,
        });
        throw new Error('No data available for the given filters.');
      }

      if (format === 'csv') {
        const csv = await parseAsync(courseData);
        fs.writeFileSync(filePath, csv);
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(courseData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Courses');
        XLSX.writeFile(wb, filePath);
      } else {
        throw new Error('Unsupported format');
      }
    } else {
      throw new Error('Invalid entity type');
    }

    return `/downloads/${fileName}`;
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Error generating report');
  }
};

// error fetching
export const getBulkOperationFailuresService = async (
  entity?: string,
  operation?: string
) => {
  try {
    // Build the where clause dynamically based on provided filters
    const whereClause: any = {};
    if (entity) {
      whereClause.entity = entity;
    }
    if (operation) {
      whereClause.operation = operation;
    }

    // Fetch the failures from the BulkOperationFailure table
    const failures = await db.bulkOperationFailure.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // Sort by createdAt in descending order
    });

    return failures;
  } catch (error: any) {
    console.error('Error in getBulkOperationFailuresService:', error);
    throw new Error(
      `Failed to retrieve bulk operation failures: ${error.message}`
    );
  }
};

// services/bulk-test.ts

export const clearOldBulkOperationFailuresService = async (
  days: number = 25
) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deletedRecords = await db.bulkOperationFailure.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(
      `Successfully deleted ${deletedRecords.count} BulkOperationFailure records older than 25 days`
    );

    // Log the cleanup action to ActionHistory (optional)
    await db.actionHistory.create({
      data: {
        action: 'Clear BulkOperationFailures',
        entity: 'BulkOperationFailure',
        entityIds: [
          { id: 'system', title: `Deleted ${deletedRecords.count} records` },
        ],
        userId: 'system', // Use a special userId for system actions
      },
    });

    return {
      message: 'Old BulkOperationFailure records cleared successfully',
      deletedCount: deletedRecords.count,
    };
  } catch (error: any) {
    console.error('Error in clearOldBulkOperationFailuresService:', error);
    throw new Error(
      `Failed to clear old BulkOperationFailure records: ${error.message}`
    );
  }
};
