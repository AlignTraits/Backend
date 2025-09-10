import { db } from '../../config/db';
const { nanoid } = require('nanoid');
import { parseAsync } from 'json2csv';
import * as XLSX from 'xlsx';
import fs from 'fs';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../../config/cloudinary';
import path from 'path';
import sharp from 'sharp';
import {
  CreateCSVCourseData,
  newCreateSchoolData,
  UpdateCourseData,
  UpdateSchoolData,
  UpdateCsvCourseData,
  CourseReportData,
} from '../../types/school-course-types';
import { Currency, DurationPeriod, Prisma } from '@prisma/client';

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

const getFriendlyErrorMessageUpdate = (error: any, identifier: string) => {
  if (error.message.includes('timeout')) {
    return `Update operation for "${identifier}" timed out. Please try again.`;
  }

  if (error.code === 'P2025') {
    return `School "${identifier}" not found. It may have been deleted.`;
  }

  if (error.code === 'P2002') {
    return `A school with this name already exists. Please use a unique name for "${identifier}".`;
  }

  if (error.message.includes('Missing school ID')) {
    return `Missing school ID for update operation.`;
  }

  return `Failed to update school "${identifier}". Please check the information and try again.`;
};

// Shared utility function to apply a timeout to a promise
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

// Shared types
type UpdateSuccess = {
  status: 'success';
  data: { id: string; name: string };
};

type UpdateSkipped = {
  status: 'skipped';
  id: string;
  name: string;
  message: string;
};

type UpdateFailed = {
  status: 'failed';
  id: string;
  name: string;
  reason: string;
};

type UpdateResult = UpdateSuccess | UpdateSkipped | UpdateFailed;

export const getFriendlyErrorMessage = (
  error: any,
  schoolData: { name: string; country?: string; region?: string }
): string => {
  const schoolName = schoolData.name || 'Unknown school';

  // Database constraint errors
  if (error.code === 'P2002') {
    const target = error.meta?.target;
    if (target?.includes('name')) {
      return `A school named "${schoolName}" already exists in the system. Please use a unique name.`;
    }
    if (target?.includes('websiteUrl')) {
      return `A school with the website URL already exists. Please use a unique website URL for "${schoolName}".`;
    }
    return `Duplicate entry detected for school "${schoolName}". This school may already exist in the system.`;
  }

  // Foreign key constraint errors
  if (error.code === 'P2003') {
    const field = error.meta?.field_name;
    if (field?.includes('country')) {
      return `Invalid country specified for school "${schoolName}". Please provide a valid country.`;
    }
    if (field?.includes('region')) {
      return `Invalid region specified for school "${schoolName}". Please provide a valid region.`;
    }
    return `Invalid reference data for school "${schoolName}". Please check all related fields.`;
  }

  // Required field errors
  if (
    error.code === 'P2012' ||
    error.message.includes('missing') ||
    error.message.includes('required')
  ) {
    if (error.message.includes('name')) {
      return `School name is required. Please provide a name for the school.`;
    }
    if (error.message.includes('country')) {
      return `Country is required for school "${schoolName}". Please specify a country.`;
    }
    if (error.message.includes('schoolType')) {
      return `School type is required for "${schoolName}". Please specify the type of school.`;
    }
    return `Missing required information for school "${schoolName}". Please complete all required fields.`;
  }

  // Data validation errors
  if (
    error.code === 'P2010' ||
    error.message.includes('Invalid value') ||
    error.message.includes('argument')
  ) {
    if (error.message.includes('websiteUrl') || error.message.includes('url')) {
      return `Invalid website URL format for "${schoolName}". Please provide a valid URL (e.g., https://example.com).`;
    }
    if (error.message.includes('email')) {
      return `Invalid email format for "${schoolName}". Please provide a valid email address.`;
    }
    if (error.message.includes('phone')) {
      return `Invalid phone number format for "${schoolName}". Please provide a valid phone number.`;
    }
    return `Invalid data provided for school "${schoolName}". Please check all field formats.`;
  }

  // Length validation errors
  if (
    error.message.includes('length') ||
    error.message.includes('long') ||
    error.message.includes('short')
  ) {
    if (error.message.includes('name')) {
      return `School name is too long. Please keep the name under 255 characters.`;
    }
    if (error.message.includes('description')) {
      return `School description is too long. Please shorten the description.`;
    }
    return `Field length exceeded for school "${schoolName}". Please shorten the input.`;
  }

  // Connection/timeout errors
  if (
    error.code === 'P1001' ||
    error.message.includes('connection') ||
    error.message.includes('timeout')
  ) {
    return `Database connection issue occurred while creating "${schoolName}". Please try again.`;
  }

  // Network errors
  if (
    error.code === 'P1002' ||
    error.message.includes('network') ||
    error.message.includes('connect')
  ) {
    return `Network error occurred while processing "${schoolName}". Please check your connection and try again.`;
  }

  // Server overload errors
  if (
    error.code === 'P1010' ||
    error.message.includes('too many') ||
    error.message.includes('overload')
  ) {
    return `Server is currently busy. Please try creating "${schoolName}" again in a few moments.`;
  }

  // Specific business logic errors from your application
  if (error.message.includes('Invalid country')) {
    return `"${schoolData.country}" is not a valid country for school "${schoolName}". Please choose from the available countries.`;
  }

  if (error.message.includes('Invalid region')) {
    return `"${schoolData.region}" is not a valid region in ${schoolData.country} for school "${schoolName}". Please choose a valid region.`;
  }

  if (error.message.includes('logo') || error.message.includes('image')) {
    return `Invalid logo/image format for "${schoolName}". Please use JPG, PNG, or WebP formats under 5MB.`;
  }

  // Custom error messages from your application
  if (error.message.includes('Failed to create school')) {
    return error.message.replace(`Failed to create school ${schoolName}: `, '');
  }

  // Fallback for unknown errors with helpful context
  console.error('Detailed school creation error:', {
    error,
    schoolName,
    schoolData,
  });

  return `Failed to create school "${schoolName}". Please check all information and try again. If the problem persists, contact support.`;
};

// Update Bulk Schools Service
export const updateBulkSchoolsService = async (
  schools: UpdateSchoolData[],
  userId: string,
  fileName: string
) => {
  const BATCH_SIZE = 50;
  const successfulUpdates: { id: string; name: string }[] = [];
  const failedUpdates: any[] = [];
  const skippedUpdates: any[] = [];

  for (let i = 0; i < schools.length; i += BATCH_SIZE) {
    const batch = schools.slice(i, i + BATCH_SIZE);

    try {
      const results = await Promise.allSettled(
        batch.map(async (school) => {
          try {
            if (!school.id) {
              throw new Error('Missing school ID');
            }

            const existingSchool = await withTimeout(
              db.school.findUnique({
                where: { id: school.id },
              }),
              120000,
              `Timeout finding school "${school.name || school.id}"`
            );

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
              } as UpdateSkipped;
            }

            const updatedSchool = await withTimeout(
              db.school.update({
                where: { id: school.id },
                data: updateData,
              }),
              120000,
              `Timeout updating school "${school.name || school.id}"`
            );

            return {
              status: 'success',
              data: { id: updatedSchool.id, name: updatedSchool.name },
            } as UpdateSuccess;
          } catch (error: any) {
            console.error(
              `Error updating school "${school.name || school.id}":`,
              error
            );

            const userFriendlyMessage = getFriendlyErrorMessage(error, {
              name: school.name || 'Unknown',
              country: school.country,
              region: school.region,
            });

            await db.bulkOperationFailure.create({
              data: {
                entity: 'School',
                operation: 'Update',
                itemData: school as any,
                errorMessage: userFriendlyMessage,
              },
            });

            return {
              status: 'failed',
              id: school.id,
              name: school.name || 'Unknown',
              reason: userFriendlyMessage,
            } as UpdateFailed;
          }
        })
      );

      const batchUpdated = results
        .filter(
          (result): result is PromiseFulfilledResult<UpdateResult> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value)
        .filter((value): value is UpdateSuccess => value.status === 'success')
        .map((value) => value.data);

      const batchFailed = results
        .filter(
          (result): result is PromiseFulfilledResult<UpdateResult> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value)
        .filter((value): value is UpdateFailed => value.status === 'failed')
        .map((value) => ({
          id: value.id,
          name: value.name,
          country: (schools.find((s) => s.id === value.id) || {}).country,
          region: (schools.find((s) => s.id === value.id) || {}).region,
          logo: (schools.find((s) => s.id === value.id) || {}).logo,
          websiteUrl: (schools.find((s) => s.id === value.id) || {}).websiteUrl,
          error: value.reason,
        }));

      const batchSkipped = results
        .filter(
          (result): result is PromiseFulfilledResult<UpdateResult> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value)
        .filter((value): value is UpdateSkipped => value.status === 'skipped')
        .map((value) => ({
          id: value.id,
          name: value.name,
          message: value.message,
        }));

      successfulUpdates.push(...batchUpdated);
      failedUpdates.push(...batchFailed);
      skippedUpdates.push(...batchSkipped);
    } catch (error) {
      console.error('Error processing batch:', error);
      for (const school of batch) {
        failedUpdates.push({
          school,
          error: 'Batch processing failed due to an unexpected error',
        });
      }
    }

    if (i + BATCH_SIZE < schools.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (
    successfulUpdates.length > 0 ||
    failedUpdates.length > 0 ||
    skippedUpdates.length > 0
  ) {
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
          entityIds: successfulUpdates.map(({ id, name }) => ({ id, name })),
          userId: userId,
          metadata: {
            successCount: successfulUpdates.length,
            failedCount: failedUpdates.length,
            skippedCount: skippedUpdates.length,
            fileName: fileName,
            failedMessages: failedUpdates.map((f) => f.error),
            failedItems: failedUpdates,
            skippedItems: skippedUpdates,
          },
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
      updated: successfulUpdates,
      failed: failedUpdates,
      skipped: skippedUpdates,
    },
  };
};

// Create Bulk Schools Service
export const createBulkSchoolsService2 = async (
  schools: newCreateSchoolData[],
  userId: string,
  fileName: string
) => {
  const BATCH_SIZE = 50;
  const successfulSchools: { id: string; name: string }[] = [];
  const failedSchools: any[] = [];

  for (let i = 0; i < schools.length; i += BATCH_SIZE) {
    const batch = schools.slice(i, i + BATCH_SIZE);

    try {
      const results = await Promise.allSettled(
        batch.map(async (school) => {
          try {
            const schoolId = nanoid(10);
            const newSchool = await withTimeout(
              db.school.create({
                data: {
                  id: schoolId,
                  name: school.name,
                  schoolType: school.schoolType,
                  country: school.country,
                  region: school.region,
                  logo: school.logo || null,
                  websiteUrl: school.websiteUrl,
                },
              }),
              120000,
              `Timeout creating school "${school.name}"`
            );

            return { id: newSchool.id, name: newSchool.name };
          } catch (error: any) {
            console.error(`Error creating school "${school.name}":`, error);

            const userFriendlyMessage = getFriendlyErrorMessage(error, {
              name: school.name,
              country: school.country,
              region: school.region,
            });

            await db.bulkOperationFailure.create({
              data: {
                entity: 'School',
                operation: 'Create',
                itemData: school as any,
                errorMessage: userFriendlyMessage,
              },
            });

            throw new Error(userFriendlyMessage);
          }
        })
      );

      const batchSuccessful = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{ id: string; name: string }> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value);

      const batchFailed = results
        .map((result, index) => {
          if (result.status === 'rejected') {
            const school = batch[index];
            return {
              ...school,
              error: result.reason.message,
            };
          }
          return null;
        })
        .filter((item): item is Exclude<typeof item, null> => item !== null);

      successfulSchools.push(...batchSuccessful);
      failedSchools.push(...batchFailed);
    } catch (error) {
      console.error('Error processing batch:', error);
      for (const school of batch) {
        failedSchools.push({
          ...school,
          error: 'Batch processing failed due to an unexpected error',
        });
      }
    }

    if (i + BATCH_SIZE < schools.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (successfulSchools.length > 0 || failedSchools.length > 0) {
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
            entityIds: successfulSchools.map(({ id, name }) => ({ id, name })),
            userId: userId,
            metadata: {
              successCount: successfulSchools.length,
              failedCount: failedSchools.length,
              fileName,
              failedMessages: failedSchools.map((f) => f.error),
              failedItems: failedSchools,
            },
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
};

const getFriendlyCourseCreationErrorMessage = (
  error: any,
  courseData: { title: string; schoolId: string; categoryId?: number },
  schoolMap: Map<string, string>,
  categoryMap: Map<number, string>
): string => {
  const courseIdentifier = courseData.title || 'Unknown course';

  if (error.message.includes('School with ID')) {
    const schoolIdMatch = error.message.match(/ID "([^"]+)"/);
    const schoolId = schoolIdMatch ? schoolIdMatch[1] : 'unknown';
    return `School with ID "${schoolId}" does not exist for course "${courseData.title}"`;
  }

  if (error.message.includes('Course category with ID')) {
    const categoryIdMatch = error.message.match(/ID "([^"]+)"/);
    const categoryId = categoryIdMatch ? categoryIdMatch[1] : 'unknown';
    return `Course category with ID "${categoryId}" does not exist for course "${courseData.title}"`;
  }

  if (error.message.includes('Course image is required')) {
    return `Course "${courseData.title}" is missing required image`;
  }

  if (error.message.includes('Failed to process course image')) {
    return `Failed to process image for course "${courseData.title}"`;
  }

  if (error.message.includes('Ratings must be between')) {
    return `Invalid rating value for course "${courseData.title}" - must be between 0 and 5`;
  }

  if (error.code === 'P2002') {
    const fieldMatch = error.meta?.target?.[0];
    const fieldName = fieldMatch
      ? fieldMatch.replace(/([A-Z])/g, ' $1').toLowerCase()
      : 'data';
    return `Course "${courseData.title}" conflicts with existing course (duplicate ${fieldName})`;
  }

  if (error.code === 'P2003') {
    return `Invalid reference data for course "${courseData.title}" (school or category doesn't exist)`;
  }

  if (error.message.includes('Batch processing failed')) {
    return `Course "${courseData.title}" failed due to system timeout - please try again`;
  }

  // Default error message
  return `Failed to create course "${courseData.title}": ${error.message}`;
};

export const createBulkCoursesService = async (
  courses: CreateCSVCourseData[],
  userId: string,
  fileName: string
) => {
  const BATCH_SIZE = 50;
  const successfulCourses: { id: string; title: string }[] = [];
  const failedCourses: (CreateCSVCourseData & { error: string })[] = [];

  // Pre-validate all school IDs and category IDs once
  const schoolIds = [...new Set(courses.map((course) => course.schoolId))];
  const existingSchools = await db.school.findMany({
    where: { id: { in: schoolIds } },
    select: { id: true, name: true },
  });
  const existingSchoolMap = new Map(existingSchools.map((s) => [s.id, s.name]));

  const categoryIds = [
    ...new Set(
      courses
        .map((course) => course.categoryId)
        .filter((id): id is number => id != null)
    ),
  ];
  const existingCategories = await db.courseCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const existingCategoryMap = new Map(
    existingCategories.map((c) => [c.id, c.name])
  );

  for (let i = 0; i < courses.length; i += BATCH_SIZE) {
    const batch = courses.slice(i, i + BATCH_SIZE);

    try {
      const results = await Promise.allSettled(
        batch.map(async (course) => {
          try {
            // Validate school exists
            if (!existingSchoolMap.has(course.schoolId)) {
              throw new Error(
                `School with ID "${course.schoolId}" does not exist`
              );
            }

            // Validate image is provided
            if (!course.image) {
              throw new Error('Course image is required');
            }

            // Validate ratings range
            if (
              course.ratings !== undefined &&
              (course.ratings < 0 || course.ratings > 5)
            ) {
              throw new Error('Ratings must be between 0 and 5');
            }

            // Validate category exists (if provided)
            if (
              course.categoryId != null &&
              !existingCategoryMap.has(course.categoryId)
            ) {
              throw new Error(
                `Course category with ID "${course.categoryId}" does not exist`
              );
            }

            // Process image
            const profileUrl = await withTimeout(
              processProfileImage(course.image),
              120000,
              `Timeout processing image for course "${course.title}"`
            );
            if (!profileUrl) {
              throw new Error('Failed to process course image');
            }

            const courseId = nanoid(10);

            const newCourse = await withTimeout(
              db.course.create({
                data: {
                  id: courseId,
                  title: course.title,
                  image: profileUrl,
                  schoolId: course.schoolId,
                  scholarship: course.scholarship,
                  scholarshipInformation: course.scholarshipInformation,
                  duration: course.duration,
                  durationPeriod: course.durationPeriod,
                  price: course.price,
                  currency: course.currency,
                  acceptanceFee: course.acceptanceFee,
                  acceptanceFeeCurrency: course.acceptanceFeeCurrency,
                  objectives: course.objectives,
                  courseWebsiteUrl: course.courseWebsiteUrl,
                  programLevel: course.programLevel,
                  loanInformation: course.loanInformation,
                  ratings: course.ratings ?? 0.0,
                  categoryId: course.categoryId ?? undefined,
                },
              }),
              120000,
              `Timeout creating course "${course.title}"`
            );

            return { id: newCourse.id, title: newCourse.title };
          } catch (error: any) {
            const userFriendlyMessage = getFriendlyCourseCreationErrorMessage(
              error,
              {
                title: course.title,
                schoolId: course.schoolId,
                categoryId: course.categoryId,
              },
              existingSchoolMap,
              existingCategoryMap
            );
            return { ...course, error: userFriendlyMessage };
          }
        })
      );

      const batchSuccessful = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{ id: string; title: string }> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value);

      const batchFailed = results
        .filter(
          (
            result
          ): result is
            | PromiseRejectedResult
            | PromiseFulfilledResult<CreateCSVCourseData & { error: string }> =>
            result.status === 'rejected' || 'error' in result.value
        )
        .map((result) =>
          result.status === 'fulfilled'
            ? result.value
            : {
                ...batch[results.indexOf(result)],
                error: result.reason.message,
              }
        );

      successfulCourses.push(...batchSuccessful);
      failedCourses.push(...batchFailed);
    } catch (error) {
      console.error('Error processing batch:', error);
      for (const course of batch) {
        failedCourses.push({
          ...course,
          error: 'Batch processing failed due to an unexpected error',
        });
      }
    }

    if (i + BATCH_SIZE < courses.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Batch create failure logs
  if (failedCourses.length > 0) {
    await db.bulkOperationFailure.createMany({
      data: failedCourses.map((failure) => ({
        entity: 'Course',
        operation: 'Create',
        itemData: failure as any,
        errorMessage: failure.error,
      })),
      skipDuplicates: true,
    });
  }

  // Log action history
  if (successfulCourses.length > 0 || failedCourses.length > 0) {
    const userExists = userId
      ? !!(await db.user.findUnique({ where: { id: userId } }))
      : false;

    if (userExists) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Create',
          entity: 'Course',
          entityIds: successfulCourses.map(({ id, title }) => ({
            id,
            name: title,
          })),
          userId: userId,
          metadata: {
            successCount: successfulCourses.length,
            failedCount: failedCourses.length,
            fileName: fileName,
            failedMessages: failedCourses.map((f) => f.error),
            failedItems: JSON.stringify(failedCourses),
          },
        },
      });
    } else {
      console.warn(
        `Skipping ActionHistory creation: userId ${userId} does not exist`
      );
    }
  }

  return {
    message: 'Bulk course creation process completed',
    data: {
      success: successfulCourses,
      errors: failedCourses,
    },
  };
};

// Assuming withTimeout is defined at the file level:
// const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
//   return Promise.race([
//     promise,
//     new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs))
//   ]);
// };

export const updateBulkCoursesService = async (
  courses: UpdateCsvCourseData[],
  userId: string,
  fileName: string
) => {
  const BATCH_SIZE = 50;
  const successfulUpdates: { id: string; title: string }[] = [];
  const failedUpdates: any[] = [];
  const skippedUpdates: any[] = [];

  // Pre-validate all school IDs and category IDs once
  const schoolIds = [
    ...new Set(
      courses
        .map((course) => course.schoolId)
        .filter((id): id is string => id != null && id !== '') // Filter out null, undefined, and empty strings
    ),
  ];
  const existingSchools = await db.school.findMany({
    where: {
      id: {
        in: schoolIds.length > 0 ? schoolIds : undefined, // Handle empty array case
      },
    },
    select: { id: true, name: true },
  });
  const existingSchoolMap = new Map(existingSchools.map((s) => [s.id, s.name]));

  const categoryIds = [
    ...new Set(
      courses
        .map((course) => course.categoryId)
        .filter((id): id is number => id != null) // Filter out null and undefined
    ),
  ];
  const existingCategories = await db.courseCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const existingCategoryMap = new Map(
    existingCategories.map((c) => [c.id, c.name])
  );

  for (let i = 0; i < courses.length; i += BATCH_SIZE) {
    const batch = courses.slice(i, i + BATCH_SIZE);

    try {
      // Use a SINGLE transaction for the entire batch
      const result = await db.$transaction(
        async (tx) => {
          const batchSuccess: { id: string; title: string }[] = [];
          const batchFailures: any[] = [];
          const batchSkipped: any[] = [];

          for (const course of batch) {
            try {
              if (!course.id) {
                throw new Error('Missing course ID');
              }

              const existingCourse = await withTimeout(
                tx.course.findUnique({
                  where: { id: course.id },
                }),
                120000,
                `Timeout finding course with ID "${course.id}"`
              );

              if (!existingCourse) {
                throw new Error(`Course with ID ${course.id} not found`);
              }

              // Validate school exists if provided
              if (course.schoolId && !existingSchoolMap.has(course.schoolId)) {
                throw new Error(
                  `School with ID "${course.schoolId}" does not exist`
                );
              }

              // Validate category exists if provided
              if (
                course.categoryId !== undefined &&
                course.categoryId !== null &&
                !existingCategoryMap.has(course.categoryId)
              ) {
                throw new Error(
                  `Course category with ID "${course.categoryId}" does not exist`
                );
              }

              // Validate ratings
              if (
                course.ratings !== undefined &&
                (course.ratings < 0 || course.ratings > 5)
              ) {
                throw new Error('Ratings must be between 0 and 5');
              }

              // Process image if provided
              let imageUrl: string | null = null;
              if (course.image) {
                imageUrl = await withTimeout(
                  processImage(course.image),
                  120000,
                  `Timeout processing image for course "${course.title || course.id}"`
                );
                if (!imageUrl) {
                  throw new Error('Failed to process course image');
                }
              }

              const updateData = {
                title: course.title ?? existingCourse.title,
                image: imageUrl ?? existingCourse.image,
                schoolId: course.schoolId ?? existingCourse.schoolId,
                scholarship: course.scholarship ?? existingCourse.scholarship,
                scholarshipInformation:
                  course.scholarshipInformation !== undefined
                    ? course.scholarshipInformation
                    : existingCourse.scholarshipInformation,
                duration: course.duration ?? existingCourse.duration,
                durationPeriod:
                  course.durationPeriod ?? existingCourse.durationPeriod,
                price: course.price ?? existingCourse.price,
                currency: course.currency ?? existingCourse.currency,
                acceptanceFee:
                  course.acceptanceFee ?? existingCourse.acceptanceFee,
                acceptanceFeeCurrency:
                  course.acceptanceFeeCurrency ??
                  existingCourse.acceptanceFeeCurrency,
                objectives: course.objectives ?? existingCourse.objectives,
                courseWebsiteUrl:
                  course.courseWebsiteUrl ?? existingCourse.courseWebsiteUrl,
                programLevel:
                  course.programLevel ?? existingCourse.programLevel,
                loanInformation:
                  course.loanInformation ?? existingCourse.loanInformation,
                ratings:
                  course.ratings !== undefined
                    ? course.ratings
                    : existingCourse.ratings,
                categoryId:
                  course.categoryId !== undefined
                    ? course.categoryId
                    : existingCourse.categoryId,
              };

              // Check if there are actual changes
              if (
                JSON.stringify(updateData) === JSON.stringify(existingCourse)
              ) {
                batchSkipped.push({
                  id: course.id,
                  title: existingCourse.title,
                  message: `No changes for course with ID ${course.id}`,
                });
                continue;
              }

              const updatedCourse = await withTimeout(
                tx.course.update({
                  where: { id: course.id },
                  data: updateData,
                }),
                120000,
                `Timeout updating course with ID "${course.id}"`
              );

              batchSuccess.push({
                id: updatedCourse.id,
                title: updatedCourse.title,
              });
            } catch (error: any) {
              const userFriendlyMessage = getFriendlyCourseUpdateErrorMessage(
                error,
                course.title || course.id,
                existingSchoolMap,
                existingCategoryMap
              );
              batchFailures.push({
                course,
                error: userFriendlyMessage,
              });
            }
          }

          return { batchSuccess, batchFailures, batchSkipped };
        },
        {
          timeout: 120000,
          maxWait: 120000,
        }
      );

      successfulUpdates.push(...result.batchSuccess);
      failedUpdates.push(...result.batchFailures);
      skippedUpdates.push(...result.batchSkipped);
    } catch (batchError) {
      // If the entire transaction fails, mark all courses in batch as failed
      for (const course of batch) {
        failedUpdates.push({
          course,
          error:
            'Batch processing failed - transaction timeout or database error',
        });
      }
    }

    // Small delay between batches
    if (i + BATCH_SIZE < courses.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Batch create failure logs
  if (failedUpdates.length > 0) {
    await db.bulkOperationFailure.createMany({
      data: failedUpdates.map((failure) => ({
        entity: 'Course',
        operation: 'Update',
        itemData: failure.course as any,
        errorMessage: failure.error,
      })),
      skipDuplicates: true,
    });
  }

  // Log action history
  if (
    successfulUpdates.length > 0 ||
    failedUpdates.length > 0 ||
    skippedUpdates.length > 0
  ) {
    const userExists = userId
      ? !!(await db.user.findUnique({ where: { id: userId } }))
      : false;

    if (userExists) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Update',
          entity: 'Course',
          entityIds: successfulUpdates.map(({ id, title }) => ({
            id,
            name: title,
          })),
          userId: userId,
          metadata: {
            successCount: successfulUpdates.length,
            failedCount: failedUpdates.length,
            skippedCount: skippedUpdates.length,
            fileName: fileName,
            failedMessages: failedUpdates.map((f) => f.error),
            failedItems: failedUpdates,
            skippedItems: skippedUpdates,
          },
        },
      });
    } else {
      console.warn(
        `Skipping ActionHistory creation: userId ${userId} does not exist`
      );
    }
  }

  return {
    message: 'Bulk course update process completed',
    data: {
      updated: successfulUpdates,
      failed: failedUpdates,
      skipped: skippedUpdates,
    },
  };
};

// Course update specific error message helper
const getFriendlyCourseUpdateErrorMessage = (
  error: any,
  courseIdentifier: string,
  schoolMap: Map<string, string>,
  categoryMap: Map<number, string>
): string => {
  const courseTitle = courseIdentifier || 'Unknown course';

  if (error.message.includes('Missing course ID')) {
    return 'Course ID is required for update';
  }

  if (error.message.includes('Course with ID')) {
    const courseIdMatch = error.message.match(/ID ([^ ]+)/);
    const courseId = courseIdMatch ? courseIdMatch[1] : 'unknown';
    return `Course with ID "${courseId}" not found`;
  }

  if (error.message.includes('School with ID')) {
    const schoolIdMatch = error.message.match(/ID "([^"]+)"/);
    const schoolId = schoolIdMatch ? schoolIdMatch[1] : 'unknown';
    return `School with ID "${schoolId}" does not exist for course "${courseTitle}"`;
  }

  if (error.message.includes('Course category with ID')) {
    const categoryIdMatch = error.message.match(/ID "([^"]+)"/);
    const categoryId = categoryIdMatch ? categoryIdMatch[1] : 'unknown';
    return `Course category with ID "${categoryId}" does not exist for course "${courseTitle}"`;
  }

  if (error.message.includes('Failed to process course image')) {
    return `Failed to process image for course "${courseTitle}"`;
  }

  if (error.message.includes('Ratings must be between')) {
    return `Invalid rating value for course "${courseTitle}" - must be between 0 and 5`;
  }

  if (error.code === 'P2002') {
    const fieldMatch = error.meta?.target?.[0];
    const fieldName = fieldMatch
      ? fieldMatch.replace(/([A-Z])/g, ' $1').toLowerCase()
      : 'data';
    return `Course "${courseTitle}" conflicts with existing course (duplicate ${fieldName})`;
  }

  if (error.code === 'P2003') {
    return `Invalid reference data for course "${courseTitle}" (school or category doesn't exist)`;
  }

  if (error.message.includes('Batch processing failed')) {
    return `Course "${courseTitle}" failed due to system timeout - please try again`;
  }

  // Default error message
  return `Failed to update course "${courseTitle}": ${error.message}`;
};
