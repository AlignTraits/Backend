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
import { Currency, DurationPeriod, Prisma } from '@prisma/client';

// npm install @prisma/client@^5.19.1 prisma@^5.19.1

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

// export const createBulkSchoolsService2 = async (
//   schools: newCreateSchoolData[],
//   userId: string,
//   fileName: string // <-- pass the file name here
// ) => {
//   try {
//     const results = await Promise.allSettled(
//       schools.map(async (school) => {
//         try {
//           const schoolId = nanoid(10);
//           const newSchool = await db.school.create({
//             data: {
//               id: schoolId,
//               name: school.name,
//               schoolType: school.schoolType,
//               country: school.country,
//               region: school.region,
//               logo: school.logo || null,
//               websiteUrl: school.websiteUrl,
//             },
//           });

//           return { id: newSchool.id, name: newSchool.name };
//         } catch (error: any) {
//           console.error(`Error creating school "${school.name}":`, error);

//           // Beautify the error message
//           let userFriendlyMessage =
//             'An unexpected error occurred while creating the school';
//           if (error.message.includes('Unique constraint failed')) {
//             if (error.message.includes('name')) {
//               userFriendlyMessage = `A school with the name "${school.name}" already exists`;
//             } else {
//               userFriendlyMessage = 'A unique constraint was violated';
//             }
//           } else if (error.message.includes('Invalid value for argument')) {
//             if (error.message.includes('schoolType')) {
//               userFriendlyMessage =
//                 'Invalid school type. Must be a valid school type (e.g., UNIVERSITY, COLLEGE)';
//             } else {
//               userFriendlyMessage = 'Invalid data provided for the school';
//             }
//           } else if (error.message.includes('Failed to create school')) {
//             userFriendlyMessage = error.message.replace(
//               `Failed to create school ${school.name}: `,
//               ''
//             );
//           }

//           // Log the failure to the BulkOperationFailure table
//           await db.bulkOperationFailure.create({
//             data: {
//               entity: 'School',
//               operation: 'Create',
//               itemData: school as any, // Store the failed school data as JSON
//               errorMessage: userFriendlyMessage,
//             },
//           });

//           throw new Error(userFriendlyMessage);
//         }
//       })
//     );

//     const successfulSchools = results
//       .filter((result) => result.status === 'fulfilled')
//       .map(
//         (result: PromiseFulfilledResult<{ id: string; name: string }>) =>
//           result.value
//       );

//     // const failedSchools = results
//     //   .filter((result) => result.status === 'rejected')
//     //   .map((result: PromiseRejectedResult) => ({
//     //     error: result.reason.message,
//     //   }));
//     const failedSchools = results
//       .map((result, index) => {
//         if (result.status === 'rejected') {
//           const school = schools[index];
//           return {
//             ...school,
//             error: result.reason.message,
//           };
//         }
//         return null;
//       })
//       .filter((item) => item !== null);

//     // if (successfulSchools.length > 0) {
//     if (successfulSchools.length > 0 || failedSchools.length > 0) {
//       // Validate userId before logging action history
//       let userExists = false;
//       if (userId) {
//         const user = await db.user.findUnique({ where: { id: userId } });
//         userExists = !!user;
//       }

//       if (userExists) {
//         try {
//           await db.actionHistory.create({
//             data: {
//               action: 'Bulk Create',
//               entity: 'School',
//               entityIds: successfulSchools.map(({ id, name }) => ({
//                 id,
//                 name,
//               })),
//               userId: userId,
//               metadata: {
//                 successCount: successfulSchools.length,
//                 failedCount: failedSchools.length,
//                 fileName,
//                 failedMessages: failedSchools.map((f) => f.error),
//                 failedItems: failedSchools,
//               },
//             },
//           });
//         } catch (error) {
//           console.error('Error logging action history:', error);
//         }
//       } else {
//         console.warn(
//           `Skipping ActionHistory creation: userId ${userId} does not exist`
//         );
//       }
//     }

//     return {
//       success: successfulSchools,
//       failed: failedSchools,
//     };
//   } catch (error: any) {
//     console.error('Error in createBulkSchoolsService2:', error);
//     throw new Error(`Bulk school creation failed: ${error.message}`);
//   }
// };

// export const createBulkSchoolsService2 = async (
//   schools: newCreateSchoolData[],
//   userId: string,
//   fileName: string
// ) => {
//   const BATCH_SIZE = 50;
//   const successfulSchools: { id: string; name: string }[] = [];
//   const failedSchools: any[] = [];

//   for (let i = 0; i < schools.length; i += BATCH_SIZE) {
//     const batch = schools.slice(i, i + BATCH_SIZE);
//     const batchSuccess: { id: string; name: string }[] = [];
//     const batchFailures: any[] = [];

//     for (const school of batch) {
//       try {
//         const schoolId = nanoid(10);
//         // Process each school individually to avoid transaction abort issues
//         const newSchool = await db.school.create({
//           data: {
//             id: schoolId,
//             name: school.name,
//             schoolType: school.schoolType,
//             country: school.country,
//             region: school.region,
//             logo: school.logo || null,
//             websiteUrl: school.websiteUrl,
//           },
//         });
//         batchSuccess.push({ id: newSchool.id, name: newSchool.name });
//       } catch (error: any) {
//         const userFriendlyMessage = getFriendlyErrorMessage(error, {
//           name: school.name,
//           country: school.country,
//           region: school.region,
//         });
//         batchFailures.push({
//           school,
//           error: userFriendlyMessage,
//         });
//       }
//     }

//     successfulSchools.push(...batchSuccess);
//     failedSchools.push(...batchFailures);

//     // Small delay between batches
//     if (i + BATCH_SIZE < schools.length) {
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }
//   }

//   // Create failure logs matching your schema
//   await createBulkFailureLogs(failedSchools);
//   await logActionHistory(userId, successfulSchools, failedSchools, fileName);

//   return {
//     success: successfulSchools,
//     failed: failedSchools,
//   };
// };

// export const createBulkSchoolsOptimized = async (
//   schools: newCreateSchoolData[],
//   userId: string,
//   fileName: string
// ) => {
//   try {
//     const schoolsWithIds = schools.map(school => ({
//       id: nanoid(10),
//       ...school,
//       logo: school.logo || null,
//     }));

//     // Try bulk insert first
//     const result = await db.school.createMany({
//       data: schoolsWithIds,
//       skipDuplicates: true, // This will skip duplicates without throwing errors
//     });

//     // For failed records (due to duplicates), handle them individually
//     const successfulCount = result.count;
//     const failedSchools = [];

//     if (successfulCount < schools.length) {
//       // Find which schools failed (likely duplicates)
//       for (const school of schools) {
//         try {
//           // Try to find if the school already exists
//           const existing = await db.school.findFirst({
//             where: { name: school.name }
//           });

//           if (existing) {
//             failedSchools.push({
//               school,
//               error: `School "${school.name}" already exists`
//             });
//           }
//         } catch (error) {
//           failedSchools.push({
//             school,
//             error: 'Error checking school existence'
//           });
//         }
//       }
//     }

//     await logActionHistory(
//       userId,
//       schoolsWithIds.slice(0, successfulCount),
//       failedSchools,
//       fileName
//     );

//     return {
//       success: successfulCount,
//       failed: failedSchools,
//     };

//   } catch (error) {
//     console.error('Bulk create failed:', error);
//     // Fallback to individual processing
//     return createBulkSchoolsService2(schools, userId, fileName);
//   }
// };

// Helper function to batch create failure logs

// Helper function for error messages

const getFriendlyErrorMessage = (
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

// const createBulkFailureLogs = async (failedSchools: any[]) => {
//   const BATCH_SIZE = 20;

//   for (let i = 0; i < failedSchools.length; i += BATCH_SIZE) {
//     const batch = failedSchools.slice(i, i + BATCH_SIZE);

//     await db.bulkOperationFailure.createMany({
//       data: batch.map(({ school, error }) => ({
//         entity: 'School',
//         operation: 'Create',
//         itemData: school,
//         errorMessage: error,
//         errorCode: school.errorCode || null, // Add error code if available
//         timestamp: new Date(),
//       })),
//       skipDuplicates: true,
//     });
//   }
// };

// Helper function for action history

const createBulkFailureLogs = async (failedSchools: any[]) => {
  const BATCH_SIZE = 50;

  for (let i = 0; i < failedSchools.length; i += BATCH_SIZE) {
    const batch = failedSchools.slice(i, i + BATCH_SIZE);

    await db.bulkOperationFailure.createMany({
      data: batch.map(({ school, error }) => ({
        entity: 'School',
        operation: 'Create',
        itemData: {
          name: school.name,
          schoolType: school.schoolType,
          country: school.country,
          region: school.region,
          websiteUrl: school.websiteUrl,
          logo: school.logo || null,
        },
        errorMessage: error,
        // createdAt is automatically added by @default(now())
      })),
      skipDuplicates: true,
    });
  }
};

const logActionHistory = async (
  userId: string,
  successfulSchools: any[],
  failedSchools: any[],
  fileName: string
) => {
  if (userId) {
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
            failedItems: failedSchools.map((f) => f.school),
          },
        },
      });
    } catch (error) {
      console.error('Error logging action history:', error);
    }
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

    // Prepare fake failed records (those not found)
    const failedSchools = invalidSchoolIds.map((id) => ({
      id,
      error: `School with ID "${id}" not found.`,
    }));

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
            metadata: {
              successCount: deletedSchools.count,
              failedCount: failedSchools.length,
              fileName: 'delete', // You can dynamically pass filename if needed
              failedMessages: failedSchools.map((f) => f.error),
              failedItems: failedSchools,
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

    const failedCourses = invalidCourseIds.map((id) => ({
      id,
      reason: 'Course not found',
    }));

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
            metadata: {
              successCount: deletedCourses.count,
              failedCount: failedCourses.length,
              fileName: 'courses-delete',
              failedMessages: failedCourses.map((item) => item.reason),
              failedItems: failedCourses,
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

// export const updateBulkSchoolsService = async (
//   schools: UpdateSchoolData[],
//   userId: string,
//   fileName: string
// ) => {
//   try {
//     const results = await Promise.allSettled(
//       schools.map(async (school) => {
//         try {
//           if (!school.id) {
//             throw new Error('Missing school ID');
//           }

//           const existingSchool = await db.school.findUnique({
//             where: { id: school.id },
//           });

//           if (!existingSchool) {
//             throw new Error(`School with ID ${school.id} not found`);
//           }

//           const updateData = {
//             name: school.name ?? existingSchool.name,
//             schoolType: school.schoolType ?? existingSchool.schoolType,
//             country: school.country ?? existingSchool.country,
//             region: school.region ?? existingSchool.region,
//             websiteUrl: school.websiteUrl ?? existingSchool.websiteUrl,
//             logo: school.logo ?? existingSchool.logo,
//           };

//           if (JSON.stringify(updateData) === JSON.stringify(existingSchool)) {
//             return {
//               status: 'skipped',
//               id: school.id,
//               name: existingSchool.name,
//               message: `No changes for school with ID ${school.id}`,
//             };
//           }

//           const updatedSchool = await db.school.update({
//             where: { id: school.id },
//             data: updateData,
//           });

//           return {
//             status: 'success',
//             data: { id: updatedSchool.id, name: updatedSchool.name },
//           };
//         } catch (error: any) {
//           console.error(
//             `Error updating school "${school.name || school.id}":`,
//             error
//           );

//           // Beautify the error message
//           let userFriendlyMessage =
//             'An unexpected error occurred while updating the school';
//           if (error.message.includes('Missing school ID')) {
//             userFriendlyMessage = 'School ID is required';
//           } else if (error.message.includes('School with ID')) {
//             userFriendlyMessage = error.message; // Already user-friendly
//           }

//           // Log the failure to the BulkOperationFailure table
//           await db.bulkOperationFailure.create({
//             data: {
//               entity: 'School',
//               operation: 'Update',
//               itemData: school as any, // Store the failed school data as JSON
//               errorMessage: userFriendlyMessage,
//             },
//           });

//           return {
//             status: 'failed',
//             id: school.id,
//             name: school.name || 'Unknown',
//             reason: userFriendlyMessage,
//           };
//         }
//       })
//     );

//     const updatedSchools = results
//       .filter(
//         (result) =>
//           result.status === 'fulfilled' && result.value.status === 'success'
//       )
//       .map((result: any) => result.value.data);

//     const failedUpdates = results
//       .filter(
//         (result) =>
//           result.status === 'fulfilled' && result.value.status === 'failed'
//       )
//       .map((result: any) => ({
//         id: result.value.id,
//         name: result.value.name,
//         country: result.value.country,
//         region: result.value.region,
//         logo: result.value.logo,
//         websiteUrl: result.value.websiteUrl,
//         error: result.value.reason,
//       }));

//     const skippedUpdates = results
//       .filter(
//         (result) =>
//           result.status === 'fulfilled' && result.value.status === 'skipped'
//       )
//       .map((result: any) => ({
//         id: result.value.id,
//         name: result.value.name,
//         message: result.value.message,
//       }));

//     // if (updatedSchools.length > 0) {
//     if (
//       updatedSchools.length > 0 ||
//       failedUpdates.length > 0 ||
//       skippedUpdates.length > 0
//     ) {
//       // Validate userId before logging action history
//       let userExists = false;
//       if (userId) {
//         const user = await db.user.findUnique({ where: { id: userId } });
//         userExists = !!user;
//       }

//       if (userExists) {
//         await db.actionHistory.create({
//           data: {
//             action: 'Bulk Update',
//             entity: 'School',
//             entityIds: updatedSchools.map(({ id, name }) => ({ id, name })),
//             userId: userId,
//             metadata: {
//               successCount: updatedSchools.length,
//               failedCount: failedUpdates.length,
//               fileName: fileName, // You can replace this with actual filename if passed from controller
//               failedMessages: failedUpdates.map((f) => f.error),
//               failedItems: failedUpdates,
//             },
//           },
//         });
//       } else {
//         console.warn(
//           `Skipping ActionHistory creation: userId ${userId} does not exist`
//         );
//       }
//     }

//     return {
//       message: 'Bulk update process completed',
//       data: {
//         updated: updatedSchools,
//         failed: failedUpdates,
//         skipped: skippedUpdates,
//       },
//     };
//   } catch (error) {
//     console.error('Error in updateBulkSchoolsService:', error);
//     throw new Error('Bulk school update failed');
//   }
// };

// const getFriendlyErrorMessageUpdate = (error: any, identifier: string) => {
//   if (error.message.includes('timeout')) {
//     return `Update operation for "${identifier}" timed out. Please try again.`;
//   }

//   if (error.code === 'P2025') {
//     return `School "${identifier}" not found. It may have been deleted.`;
//   }

//   if (error.code === 'P2002') {
//     return `A school with this name already exists. Please use a unique name for "${identifier}".`;
//   }

//   if (error.message.includes('Missing school ID')) {
//     return `Missing school ID for update operation.`;
//   }

//   return `Failed to update school "${identifier}". Please check the information and try again.`;
// };
// Define the result type for updatePromise

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

type SchoolReportData = {
  id: string;
  name: string;
  schoolType: string;
  country: string;
  region: string;
  websiteUrl: string;
  logo: string | null;
  createdAt: string;
};

//

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
  schoolId?: string,
  userId?: string
): Promise<string> => {
  try {
    const start = startDate ? new Date(startDate) : undefined;
    if (start) start.setUTCHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : undefined;
    if (end) end.setUTCHours(23, 59, 59, 999);

    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir))
      fs.mkdirSync(downloadsDir, { recursive: true });

    const timestamp = Date.now();
    const fileName = `${entity}_report_${timestamp}.${format}`;
    const filePath = path.join(downloadsDir, fileName);

    if (entity === 'school') {
      const where: Prisma.SchoolWhereInput = {};
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

      const schoolData: SchoolReportData[] = schools.map((school) => ({
        id: school.id,
        name: school.name,
        schoolType: school.schoolType,
        country: school.country,
        region: school.region,
        websiteUrl: school.websiteUrl,
        logo: school.logo,
        createdAt: school.createdAt?.toISOString(),
      }));

      if (schoolData.length === 0)
        throw new Error('No data available for the given filters.');

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

      if (userId) {
        await db.actionHistory.create({
          data: {
            action: 'Generate Report',
            entity: 'School',
            entityIds: schoolData.map(({ id, name }) => ({ id, title: name })),
            userId: userId,
            metadata: {
              successCount: schoolData.length,
              failedCount: 0,
              fileName: fileName,
              filters: {
                id,
                name,
                country,
                region,
                startDate,
                endDate,
              },
            },
          },
        });
      }
    } else if (entity === 'course') {
      const where: Prisma.CourseWhereInput = {};
      if (start && end) where.createdAt = { gte: start, lte: end };
      if (id) where.id = id;
      if (title) where.title = { contains: title, mode: 'insensitive' };
      if (schoolId) where.schoolId = schoolId;

      const courses = await db.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          image: true,
          schoolId: true,
          scholarship: true,
          scholarshipInformation: true,
          duration: true,
          durationPeriod: true,
          price: true,
          currency: true,
          acceptanceFee: true,
          acceptanceFeeCurrency: true,
          objectives: true,
          courseWebsiteUrl: true,
          programLevel: true,
          loanInformation: true,
          ratings: true,
          createdAt: true,
        },
      });

      const courseData: CourseReportData[] = courses.map((course) => ({
        id: course.id,
        title: course.title,
        image: course.image ?? '',
        schoolId: course.schoolId,
        scholarship: course.scholarship,
        scholarshipInformation: course.scholarshipInformation ?? null,
        duration: `${course.duration} ${course.durationPeriod.toLowerCase()}`,
        price: course.price,
        currency: course.currency,
        acceptanceFee: course.acceptanceFee,
        acceptanceFeeCurrency: course.acceptanceFeeCurrency,
        objectives: course.objectives,
        courseWebsiteUrl: course.courseWebsiteUrl,
        programLevel: course.programLevel,
        loanInformation: course.loanInformation,
        ratings: course.ratings ?? 0.0,
        createdAt: course.createdAt?.toISOString(),
      }));

      if (courseData.length === 0)
        throw new Error('No data available for the given filters.');

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

      if (userId) {
        await db.actionHistory.create({
          data: {
            action: 'Generate Report',
            entity: 'Course',
            entityIds: courseData.map(({ id, title }) => ({ id, title })),
            userId: userId,
            metadata: {
              successCount: courseData.length,
              failedCount: 0,
              fileName: fileName,
              filters: {
                id,
                title,
                schoolId,
                startDate,
                endDate,
              },
            },
          },
        });
      }
    } else {
      throw new Error('Invalid entity type');
    }

    return `/downloads/${fileName}`;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
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

// course
// export const createBulkCoursesService = async (
//   courses: CreateCSVCourseData[],
//   userId: string,
//   fileName: string
// ) => {
//   try {
//     const errors: (CreateCSVCourseData & { error: string })[] = [];

//     // Validate school IDs
//     const schoolIds = [...new Set(courses.map((course) => course.schoolId))];
//     const existingSchools = await db.school.findMany({
//       where: { id: { in: schoolIds } },
//       select: { id: true },
//     });
//     const existingSchoolIds = new Set(existingSchools.map((s) => s.id));

//     // Validate category IDs
//     const categoryIds = [
//       ...new Set(
//         courses
//           .map((course) => course.categoryId)
//           .filter((id): id is number => id != null) // Exclude null and undefined
//       ),
//     ];
//     let existingCategoryIds: Set<number> = new Set();
//     if (categoryIds.length > 0) {
//       const existingCategories = await db.courseCategory.findMany({
//         where: { id: { in: categoryIds } },
//         select: { id: true },
//       });
//       existingCategoryIds = new Set(existingCategories.map((c) => c.id));
//     }

//     const results = await Promise.allSettled(
//       courses.map(async (course) => {
//         try {
//           if (!existingSchoolIds.has(course.schoolId)) {
//             throw new Error(`School with ID ${course.schoolId} does not exist`);
//           }

//           let profileUrl: string | null = null;
//           if (course.image) {
//             profileUrl = await processProfileImage(course.image);
//           } else {
//             throw new Error('Course image is required');
//           }

//           if (
//             course.ratings !== undefined &&
//             (course.ratings < 0 || course.ratings > 5)
//           ) {
//             throw new Error('Ratings must be between 0 and 5');
//           }

//           // Validate categoryId
//           if (
//             course.categoryId != null && // Allow null to unset category
//             !existingCategoryIds.has(course.categoryId)
//           ) {
//             throw new Error(
//               `Course category with ID ${course.categoryId} does not exist`
//             );
//           }

//           const courseId = nanoid(10);

//           const newCourse = await db.course.create({
//             data: {
//               id: courseId,
//               title: course.title,
//               image: profileUrl,
//               schoolId: course.schoolId,
//               scholarship: course.scholarship,
//               scholarshipInformation: course.scholarshipInformation,
//               duration: course.duration,
//               durationPeriod: course.durationPeriod,
//               price: course.price,
//               currency: course.currency,
//               acceptanceFee: course.acceptanceFee,
//               acceptanceFeeCurrency: course.acceptanceFeeCurrency,
//               objectives: course.objectives,
//               courseWebsiteUrl: course.courseWebsiteUrl,
//               programLevel: course.programLevel,
//               loanInformation: course.loanInformation,
//               ratings: course.ratings ?? 0.0,
//               categoryId: course.categoryId ?? undefined, // Convert null to undefined for Prisma
//             },
//           });

//           return { id: newCourse.id, title: newCourse.title };
//         } catch (error: any) {
//           console.error(`Error creating course "${course.title}":`, error);
//           const userFriendlyMessage =
//             error.message.includes('School with ID') ||
//             error.message.includes('Course category with ID') ||
//             error.message.includes('Course image is required') ||
//             error.message.includes('Ratings must be between')
//               ? error.message
//               : 'An unexpected error occurred while creating the course';

//           await db.bulkOperationFailure.create({
//             data: {
//               entity: 'Course',
//               operation: 'Create',
//               itemData: course as any,
//               errorMessage: userFriendlyMessage,
//             },
//           });

//           errors.push({
//             ...course,
//             error: userFriendlyMessage,
//           });

//           return null;
//         }
//       })
//     );

//     const createdCourses = results
//       .filter(
//         (
//           result
//         ): result is PromiseFulfilledResult<{ id: string; title: string }> =>
//           result.status === 'fulfilled' && result.value !== null
//       )
//       .map((result) => result.value);

//     if (createdCourses.length > 0 || errors.length > 0) {
//       let userExists = false;
//       if (userId) {
//         const user = await db.user.findUnique({ where: { id: userId } });
//         userExists = !!user;
//       }
//       if (userExists) {
//         await db.actionHistory.create({
//           data: {
//             action: 'Bulk Create',
//             entity: 'Course',
//             entityIds: createdCourses.map(({ id, title }) => ({
//               id,
//               name: title,
//             })),
//             userId,
//             metadata: {
//               successCount: createdCourses.length,
//               failedCount: errors.length,
//               fileName,
//               failedMessages: errors.map((e) => e.error),
//               failedItems: errors.map((item) => ({ ...item })),
//             },
//           },
//         });
//       } else {
//         console.warn(
//           `Skipping ActionHistory creation: userId ${userId} does not exist`
//         );
//       }
//     }

//     return {
//       message: 'Courses created successfully',
//       data: { success: createdCourses, errors },
//     };
//   } catch (error: any) {
//     console.error('Error in createBulkCoursesService:', error);
//     throw new Error(`Bulk course creation failed: ${error.message}`);
//   }
// };

// export const createBulkCoursesService = async (
//   courses: CreateCSVCourseData[],
//   userId: string,
//   fileName: string
// ) => {
//   const BATCH_SIZE = 50;
//   const successfulCourses: { id: string; title: string }[] = [];
//   const failedCourses: (CreateCSVCourseData & { error: string })[] = [];

//   // Pre-validate all school IDs and category IDs once
//   const schoolIds = [...new Set(courses.map((course) => course.schoolId))];
//   const existingSchools = await db.school.findMany({
//     where: { id: { in: schoolIds } },
//     select: { id: true, name: true },
//   });
//   const existingSchoolMap = new Map(existingSchools.map((s) => [s.id, s.name]));

//   const categoryIds = [
//     ...new Set(
//       courses
//         .map((course) => course.categoryId)
//         .filter((id): id is number => id != null)
//     ),
//   ];
//   const existingCategories = await db.courseCategory.findMany({
//     where: { id: { in: categoryIds } },
//     select: { id: true, name: true },
//   });
//   const existingCategoryMap = new Map(
//     existingCategories.map((c) => [c.id, c.name])
//   );

//   for (let i = 0; i < courses.length; i += BATCH_SIZE) {
//     const batch = courses.slice(i, i + BATCH_SIZE);

//     try {
//       // Use a SINGLE transaction for the entire batch
//       const result = await db.$transaction(
//         async (tx) => {
//           const batchSuccess: { id: string; title: string }[] = [];
//           const batchFailures: (CreateCSVCourseData & { error: string })[] = [];

//           for (const course of batch) {
//             try {
//               // Validate school exists
//               if (!existingSchoolMap.has(course.schoolId)) {
//                 throw new Error(
//                   `School with ID "${course.schoolId}" does not exist`
//                 );
//               }

//               // Validate image is provided
//               if (!course.image) {
//                 throw new Error('Course image is required');
//               }

//               // Validate ratings range
//               if (
//                 course.ratings !== undefined &&
//                 (course.ratings < 0 || course.ratings > 5)
//               ) {
//                 throw new Error('Ratings must be between 0 and 5');
//               }

//               // Validate category exists (if provided)
//               if (
//                 course.categoryId != null &&
//                 !existingCategoryMap.has(course.categoryId)
//               ) {
//                 throw new Error(
//                   `Course category with ID "${course.categoryId}" does not exist`
//                 );
//               }

//               // Process image
//               const profileUrl = await processProfileImage(course.image);
//               if (!profileUrl) {
//                 throw new Error('Failed to process course image');
//               }

//               const courseId = nanoid(10);

//               const newCourse = await tx.course.create({
//                 data: {
//                   id: courseId,
//                   title: course.title,
//                   image: profileUrl,
//                   schoolId: course.schoolId,
//                   scholarship: course.scholarship,
//                   scholarshipInformation: course.scholarshipInformation,
//                   duration: course.duration,
//                   durationPeriod: course.durationPeriod,
//                   price: course.price,
//                   currency: course.currency,
//                   acceptanceFee: course.acceptanceFee,
//                   acceptanceFeeCurrency: course.acceptanceFeeCurrency,
//                   objectives: course.objectives,
//                   courseWebsiteUrl: course.courseWebsiteUrl,
//                   programLevel: course.programLevel,
//                   loanInformation: course.loanInformation,
//                   ratings: course.ratings ?? 0.0,
//                   categoryId: course.categoryId ?? undefined,
//                 },
//               });

//               batchSuccess.push({ id: newCourse.id, title: newCourse.title });
//             } catch (error: any) {
//               const userFriendlyMessage = getFriendlyCourseCreationErrorMessage(
//                 error,
//                 course.title,
//                 existingSchoolMap,
//                 existingCategoryMap
//               );
//               batchFailures.push({
//                 ...course,
//                 error: userFriendlyMessage,
//               });
//             }
//           }

//           return { batchSuccess, batchFailures };
//         },
//         {
//           timeout: 120000,
//           maxWait: 120000,
//         }
//       );

//       successfulCourses.push(...result.batchSuccess);
//       failedCourses.push(...result.batchFailures);
//     } catch (batchError) {
//       // If the entire transaction fails, mark all courses in batch as failed
//       for (const course of batch) {
//         failedCourses.push({
//           ...course,
//           error:
//             'Batch processing failed - transaction timeout or database error',
//         });
//       }
//     }

//     // Small delay between batches
//     if (i + BATCH_SIZE < courses.length) {
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }
//   }

//   // Batch create failure logs
//   if (failedCourses.length > 0) {
//     await db.bulkOperationFailure.createMany({
//       data: failedCourses.map((failure) => ({
//         entity: 'Course',
//         operation: 'Create',
//         itemData: failure as any,
//         errorMessage: failure.error,
//       })),
//       skipDuplicates: true,
//     });
//   }

//   // Log action history
//   if (successfulCourses.length > 0 || failedCourses.length > 0) {
//     const userExists = userId
//       ? !!(await db.user.findUnique({ where: { id: userId } }))
//       : false;

//     if (userExists) {
//       await db.actionHistory.create({
//         data: {
//           action: 'Bulk Create',
//           entity: 'Course',
//           entityIds: successfulCourses.map(({ id, title }) => ({
//             id,
//             name: title,
//           })),
//           userId: userId,
//           metadata: {
//             successCount: successfulCourses.length,
//             failedCount: failedCourses.length,
//             fileName: fileName,
//             failedMessages: failedCourses.map((f) => f.error),
//             failedItems: JSON.stringify(failedCourses),
//           },
//         },
//       });
//     } else {
//       console.warn(
//         `Skipping ActionHistory creation: userId ${userId} does not exist`
//       );
//     }
//   }

//   return {
//     message: 'Bulk course creation process completed',
//     data: {
//       success: successfulCourses,
//       errors: failedCourses,
//     },
//   };
// };

// // Course creation specific error message helper
// const getFriendlyCourseCreationErrorMessage = (
//   error: any,
//   courseTitle: string,
//   schoolMap: Map<string, string>,
//   categoryMap: Map<number, string>
// ): string => {
//   const courseIdentifier = courseTitle || 'Unknown course';

//   if (error.message.includes('School with ID')) {
//     const schoolIdMatch = error.message.match(/ID "([^"]+)"/);
//     const schoolId = schoolIdMatch ? schoolIdMatch[1] : 'unknown';
//     return `School with ID "${schoolId}" does not exist for course "${courseTitle}"`;
//   }

//   if (error.message.includes('Course category with ID')) {
//     const categoryIdMatch = error.message.match(/ID "([^"]+)"/);
//     const categoryId = categoryIdMatch ? categoryIdMatch[1] : 'unknown';
//     return `Course category with ID "${categoryId}" does not exist for course "${courseTitle}"`;
//   }

//   if (error.message.includes('Course image is required')) {
//     return `Course "${courseTitle}" is missing required image`;
//   }

//   if (error.message.includes('Failed to process course image')) {
//     return `Failed to process image for course "${courseTitle}"`;
//   }

//   if (error.message.includes('Ratings must be between')) {
//     return `Invalid rating value for course "${courseTitle}" - must be between 0 and 5`;
//   }

//   if (error.code === 'P2002') {
//     const fieldMatch = error.meta?.target?.[0];
//     const fieldName = fieldMatch
//       ? fieldMatch.replace(/([A-Z])/g, ' $1').toLowerCase()
//       : 'data';
//     return `Course "${courseTitle}" conflicts with existing course (duplicate ${fieldName})`;
//   }

//   if (error.code === 'P2003') {
//     return `Invalid reference data for course "${courseTitle}" (school or category doesn't exist)`;
//   }

//   if (error.message.includes('Batch processing failed')) {
//     return `Course "${courseTitle}" failed due to system timeout - please try again`;
//   }

//   // Default error message
//   return `Failed to create course "${courseTitle}": ${error.message}`;
// };

// failed result type
type FailedCourseItem = UpdateCsvCourseData & {
  status: 'failed';
  reason: string;
};

// export const updateBulkCoursesService = async (
//   courses: UpdateCsvCourseData[],
//   userId: string,
//   fileName: string
// ) => {
//   try {
//     const results = await Promise.allSettled(
//       courses.map(async (course) => {
//         try {
//           if (!course.id) {
//             throw new Error('Missing course ID');
//           }

//           const existingCourse = await db.course.findUnique({
//             where: { id: course.id },
//           });
//           if (!existingCourse) {
//             throw new Error(`Course with ID ${course.id} not found`);
//           }

//           if (course.schoolId) {
//             const schoolExists = await db.school.findUnique({
//               where: { id: course.schoolId },
//             });
//             if (!schoolExists) {
//               throw new Error(
//                 `School with ID ${course.schoolId} does not exist`
//               );
//             }
//           }

//           // Validate categoryId individually
//           if (course.categoryId !== undefined) {
//             const categoryExists = await db.courseCategory.findUnique({
//               where: { id: course.categoryId },
//             });
//             if (!categoryExists) {
//               throw new Error(
//                 `Course category with ID ${course.categoryId} does not exist`
//               );
//             }
//           }

//           let imageUrl: string | null = null;
//           if (course.image) {
//             imageUrl = await processImage(course.image);
//           }

//           if (
//             course.ratings !== undefined &&
//             (course.ratings < 0 || course.ratings > 5)
//           ) {
//             throw new Error('Ratings must be between 0 and 5');
//           }

//           const updatedCourse = await db.course.update({
//             where: { id: course.id },
//             data: {
//               title: course.title ?? existingCourse.title,
//               image: imageUrl ?? existingCourse.image,
//               schoolId: course.schoolId ?? existingCourse.schoolId,
//               scholarship: course.scholarship ?? existingCourse.scholarship,
//               scholarshipInformation:
//                 course.scholarshipInformation !== undefined
//                   ? course.scholarshipInformation
//                   : existingCourse.scholarshipInformation,
//               duration: course.duration ?? existingCourse.duration,
//               durationPeriod:
//                 course.durationPeriod ?? existingCourse.durationPeriod,
//               price: course.price ?? existingCourse.price,
//               currency: course.currency ?? existingCourse.currency,
//               acceptanceFee:
//                 course.acceptanceFee ?? existingCourse.acceptanceFee,
//               acceptanceFeeCurrency:
//                 course.acceptanceFeeCurrency ??
//                 existingCourse.acceptanceFeeCurrency,
//               objectives: course.objectives ?? existingCourse.objectives,
//               courseWebsiteUrl:
//                 course.courseWebsiteUrl ?? existingCourse.courseWebsiteUrl,
//               programLevel: course.programLevel ?? existingCourse.programLevel,
//               loanInformation:
//                 course.loanInformation ?? existingCourse.loanInformation,
//               ratings:
//                 course.ratings !== undefined
//                   ? course.ratings
//                   : existingCourse.ratings,
//               categoryId:
//                 course.categoryId !== undefined
//                   ? course.categoryId
//                   : existingCourse.categoryId, // Add categoryId
//             },
//           });

//           return {
//             status: 'success',
//             data: { id: updatedCourse.id, title: updatedCourse.title },
//           };
//         } catch (error: any) {
//           console.error(
//             `Error updating course "${course.title || course.id || 'unknown'}":`,
//             error
//           );
//           return {
//             status: 'failed',
//             id: course.id || 'unknown',
//             title: course.title || 'Unknown',
//             reason:
//               error.message.includes('Course with ID') ||
//               error.message.includes('School with ID') ||
//               error.message.includes('Course category with ID') ||
//               error.message.includes('Ratings must be between') ||
//               error.message.includes('Missing course ID')
//                 ? error.message
//                 : 'An unexpected error occurred while updating the course',
//           };
//         }
//       })
//     );

//     const updatedCourses = results
//       .filter(
//         (
//           result
//         ): result is PromiseFulfilledResult<{
//           status: 'success';
//           data: { id: string; title: string };
//         }> => result.status === 'fulfilled' && result.value.status === 'success'
//       )
//       .map((result) => result.value.data);

//     const failedCourses = results
//       .filter(
//         (
//           result
//         ): result is PromiseFulfilledResult<{
//           status: 'failed';
//           id: string;
//           title: string;
//           schoolId: string;
//           scholarshipInformation: string;
//           duration: string;
//           durationPeriod: string;
//           price: string;
//           currency: string;
//           acceptanceFee: string;
//           acceptanceFeeCurrency: string;
//           objectives: string;
//           courseWebsiteUrl: string;
//           reason: string;
//         }> => result.status === 'fulfilled' && result.value.status === 'failed'
//       )
//       .map((result) => result.value);

//     // if (updatedCourses.length > 0) {
//     if (updatedCourses.length > 0 || failedCourses.length > 0) {
//       let userExists = false;
//       if (userId) {
//         const user = await db.user.findUnique({ where: { id: userId } });
//         userExists = !!user;
//       }
//       if (userExists) {
//         await db.actionHistory.create({
//           data: {
//             action: 'Bulk Update',
//             entity: 'Course',
//             entityIds: updatedCourses.map(({ id, title }) => ({ id, title })),
//             userId: userId,
//             metadata: {
//               successCount: updatedCourses.length,
//               failedCount: failedCourses.length,
//               fileName: fileName,
//               failedMessages: failedCourses.map((item) => item.reason),
//               failedItems: failedCourses,
//             },
//           },
//         });
//       } else {
//         console.warn(
//           `Skipping ActionHistory creation: userId ${userId} does not exist`
//         );
//       }
//     }

//     return {
//       message: 'Bulk update process completed',
//       data: results.map((result: any) => result.value),
//     };
//   } catch (error: any) {
//     console.error('Error in updateBulkCoursesService:', error);
//     throw new Error(`Bulk course update failed: ${error.message}`);
//   }
// };

// export const updateBulkCoursesService = async (
//   courses: UpdateCsvCourseData[],
//   userId: string,
//   fileName: string
// ) => {
//   const BATCH_SIZE = 50;
//   const successfulUpdates: { id: string; title: string }[] = [];
//   const failedUpdates: any[] = [];
//   const skippedUpdates: any[] = [];

//   // Pre-validate all school IDs and category IDs once

//   // const schoolIds = [...new Set(courses.map(course => course.schoolId).filter(Boolean))];
//   const schoolIds = [
//     ...new Set(
//       courses
//         .map((course) => course.schoolId)
//         .filter((id): id is string => id != null && id !== '') // Filter out null, undefined, and empty strings
//     ),
//   ];
//   const existingSchools = await db.school.findMany({
//     where: {
//       id: {
//         in: schoolIds.length > 0 ? schoolIds : undefined, // Handle empty array case
//       },
//     },
//     select: { id: true, name: true },
//   });
//   const existingSchoolMap = new Map(existingSchools.map((s) => [s.id, s.name]));

//   const categoryIds = [
//     ...new Set(
//       courses
//         .map((course) => course.categoryId)
//         .filter((id): id is number => id != null) // Filter out null and undefined
//     ),
//   ];
//   const existingCategories = await db.courseCategory.findMany({
//     where: { id: { in: categoryIds } },
//     select: { id: true, name: true },
//   });
//   const existingCategoryMap = new Map(
//     existingCategories.map((c) => [c.id, c.name])
//   );

//   for (let i = 0; i < courses.length; i += BATCH_SIZE) {
//     const batch = courses.slice(i, i + BATCH_SIZE);

//     try {
//       // Use a SINGLE transaction for the entire batch
//       const result = await db.$transaction(
//         async (tx) => {
//           const batchSuccess: { id: string; title: string }[] = [];
//           const batchFailures: any[] = [];
//           const batchSkipped: any[] = [];

//           for (const course of batch) {
//             try {
//               if (!course.id) {
//                 throw new Error('Missing course ID');
//               }

//               const existingCourse = await tx.course.findUnique({
//                 where: { id: course.id },
//               });

//               if (!existingCourse) {
//                 throw new Error(`Course with ID ${course.id} not found`);
//               }

//               // Validate school exists if provided
//               if (course.schoolId && !existingSchoolMap.has(course.schoolId)) {
//                 throw new Error(
//                   `School with ID "${course.schoolId}" does not exist`
//                 );
//               }

//               // Validate category exists if provided
//               if (
//                 course.categoryId !== undefined &&
//                 course.categoryId !== null &&
//                 !existingCategoryMap.has(course.categoryId)
//               ) {
//                 throw new Error(
//                   `Course category with ID "${course.categoryId}" does not exist`
//                 );
//               }

//               // Validate ratings
//               if (
//                 course.ratings !== undefined &&
//                 (course.ratings < 0 || course.ratings > 5)
//               ) {
//                 throw new Error('Ratings must be between 0 and 5');
//               }

//               // Process image if provided
//               let imageUrl: string | null = null;
//               if (course.image) {
//                 imageUrl = await processImage(course.image);
//                 if (!imageUrl) {
//                   throw new Error('Failed to process course image');
//                 }
//               }

//               const updateData = {
//                 title: course.title ?? existingCourse.title,
//                 image: imageUrl ?? existingCourse.image,
//                 schoolId: course.schoolId ?? existingCourse.schoolId,
//                 scholarship: course.scholarship ?? existingCourse.scholarship,
//                 scholarshipInformation:
//                   course.scholarshipInformation !== undefined
//                     ? course.scholarshipInformation
//                     : existingCourse.scholarshipInformation,
//                 duration: course.duration ?? existingCourse.duration,
//                 durationPeriod:
//                   course.durationPeriod ?? existingCourse.durationPeriod,
//                 price: course.price ?? existingCourse.price,
//                 currency: course.currency ?? existingCourse.currency,
//                 acceptanceFee:
//                   course.acceptanceFee ?? existingCourse.acceptanceFee,
//                 acceptanceFeeCurrency:
//                   course.acceptanceFeeCurrency ??
//                   existingCourse.acceptanceFeeCurrency,
//                 objectives: course.objectives ?? existingCourse.objectives,
//                 courseWebsiteUrl:
//                   course.courseWebsiteUrl ?? existingCourse.courseWebsiteUrl,
//                 programLevel:
//                   course.programLevel ?? existingCourse.programLevel,
//                 loanInformation:
//                   course.loanInformation ?? existingCourse.loanInformation,
//                 ratings:
//                   course.ratings !== undefined
//                     ? course.ratings
//                     : existingCourse.ratings,
//                 categoryId:
//                   course.categoryId !== undefined
//                     ? course.categoryId
//                     : existingCourse.categoryId,
//               };

//               // Check if there are actual changes
//               if (
//                 JSON.stringify(updateData) === JSON.stringify(existingCourse)
//               ) {
//                 batchSkipped.push({
//                   id: course.id,
//                   title: existingCourse.title,
//                   message: `No changes for course with ID ${course.id}`,
//                 });
//                 continue;
//               }

//               const updatedCourse = await tx.course.update({
//                 where: { id: course.id },
//                 data: updateData,
//               });

//               batchSuccess.push({
//                 id: updatedCourse.id,
//                 title: updatedCourse.title,
//               });
//             } catch (error: any) {
//               const userFriendlyMessage = getFriendlyCourseUpdateErrorMessage(
//                 error,
//                 course.title || course.id,
//                 existingSchoolMap,
//                 existingCategoryMap
//               );
//               batchFailures.push({
//                 course,
//                 error: userFriendlyMessage,
//               });
//             }
//           }

//           return { batchSuccess, batchFailures, batchSkipped };
//         },
//         {
//           timeout: 120000,
//           maxWait: 120000,
//         }
//       );

//       successfulUpdates.push(...result.batchSuccess);
//       failedUpdates.push(...result.batchFailures);
//       skippedUpdates.push(...result.batchSkipped);
//     } catch (batchError) {
//       // If the entire transaction fails, mark all courses in batch as failed
//       for (const course of batch) {
//         failedUpdates.push({
//           course,
//           error:
//             'Batch processing failed - transaction timeout or database error',
//         });
//       }
//     }

//     // Small delay between batches
//     if (i + BATCH_SIZE < courses.length) {
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }
//   }

//   // Batch create failure logs
//   if (failedUpdates.length > 0) {
//     await db.bulkOperationFailure.createMany({
//       data: failedUpdates.map((failure) => ({
//         entity: 'Course',
//         operation: 'Update',
//         itemData: failure.course as any,
//         errorMessage: failure.error,
//       })),
//       skipDuplicates: true,
//     });
//   }

//   // Log action history
//   if (
//     successfulUpdates.length > 0 ||
//     failedUpdates.length > 0 ||
//     skippedUpdates.length > 0
//   ) {
//     const userExists = userId
//       ? !!(await db.user.findUnique({ where: { id: userId } }))
//       : false;

//     if (userExists) {
//       await db.actionHistory.create({
//         data: {
//           action: 'Bulk Update',
//           entity: 'Course',
//           entityIds: successfulUpdates.map(({ id, title }) => ({
//             id,
//             name: title,
//           })),
//           userId: userId,
//           metadata: {
//             successCount: successfulUpdates.length,
//             failedCount: failedUpdates.length,
//             skippedCount: skippedUpdates.length,
//             fileName: fileName,
//             failedMessages: failedUpdates.map((f) => f.error),
//             failedItems: failedUpdates,
//             skippedItems: skippedUpdates,
//           },
//         },
//       });
//     } else {
//       console.warn(
//         `Skipping ActionHistory creation: userId ${userId} does not exist`
//       );
//     }
//   }

//   return {
//     message: 'Bulk course update process completed',
//     data: {
//       updated: successfulUpdates,
//       failed: failedUpdates,
//       skipped: skippedUpdates,
//     },
//   };
// };

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
