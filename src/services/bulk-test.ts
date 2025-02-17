import { db } from '../config/db';
const { nanoid } = require('nanoid');

import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import path from 'path';
import sharp from 'sharp';
import {
  CreateCSVCourseData,
  newCreateSchoolData,
  UpdateCourseData,
  UpdateSchoolData,
} from '../types/school-course-types';

const uploadBase64ImageToCloudinary = async (
  base64Image: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Image}`, // Ensure the base64 string is properly formatted
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
  userId: string // Pass the admin user ID from the request
) => {
  try {
    const results = await Promise.allSettled(
      schools.map(async (school) => {
        try {
          const schoolId = nanoid(10);
          // id: schoolId,
          const newSchool = await db.school.create({
            data: {
              id: schoolId,
              name: school.name,
              schoolType: school.schoolType,
              location: school.location,
              logo: school.logo || null, // Keep null if no logo provided
              websiteUrl: school.websiteUrl,
            },
          });

          return { id: newSchool.id, name: newSchool.name };
        } catch (error: any) {
          console.error(`Error creating school ${school.name}:`, error);
          throw new Error(
            `Failed to create school ${school.name}: ${error.message}`
          );
        }
      })
    );

    // Extract successful and failed creations
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

    // Log action history if any schools were successfully created
    if (successfulSchools.length > 0) {
      try {
        await db.actionHistory.create({
          data: {
            action: 'Bulk Create',
            entity: 'School',
            entityIds: successfulSchools.map(({ id, name }) => ({ id, name })), // ✅ Directly store array (No need for JSON.stringify)
            userId: userId,
          },
        });
      } catch (error) {
        console.error('Error logging action history:', error);
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

// delete
export const deleteBulkSchoolsService = async (
  schoolIds: string[],
  userId: string
) => {
  try {
    // Fetch valid schools before deletion
    const schoolsToDelete = await db.school.findMany({
      where: { id: { in: schoolIds } },
      select: { id: true, name: true },
    });

    // Extract valid school IDs
    const validSchoolIds = schoolsToDelete.map((school) => school.id);

    // Identify invalid school IDs
    const invalidSchoolIds = schoolIds.filter(
      (id) => !validSchoolIds.includes(id)
    );

    // Delete all courses associated with valid schools
    await db.course.deleteMany({
      where: { schoolId: { in: validSchoolIds } },
    });

    // Delete valid schools
    const deletedSchools = await db.school.deleteMany({
      where: { id: { in: validSchoolIds } },
    });

    // Log action history if any schools were deleted
    if (deletedSchools.count > 0) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Delete',
          entity: 'School',
          entityIds: schoolsToDelete.map(({ id, name }) => ({ id, name })), // ✅ Directly store array (No need for JSON.stringify)
          userId: userId, // Admin who performed the action
        },
      });
    }

    return {
      message: 'Bulk school deletion process completed',
      data: {
        deleted: schoolsToDelete, // Successfully deleted schools with id & name
        failed: invalidSchoolIds.length > 0 ? invalidSchoolIds : null, // Invalid school IDs
      },
    };
  } catch (error: any) {
    console.error('Error in deleteBulkSchoolsService:', error);
    throw new Error(
      'Failed to delete schools and their associated courses: ' + error.message
    );
  }
};

// course

export const deleteBulkCoursesService = async (
  courseIds: string[],
  userId: string
) => {
  try {
    // Fetch valid courses before deletion
    const coursesToDelete = await db.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true },
    });

    // Extract valid course IDs
    const validCourseIds = coursesToDelete.map((course) => course.id);

    // Identify invalid course IDs
    const invalidCourseIds = courseIds.filter(
      (id) => !validCourseIds.includes(id)
    );

    // Delete valid courses
    const deletedCourses = await db.course.deleteMany({
      where: { id: { in: validCourseIds } },
    });

    // Log action history if any courses were deleted
    if (deletedCourses.count > 0) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Delete',
          entity: 'Course',
          entityIds: coursesToDelete.map(({ id, title }) => ({ id, title })), // Properly formatted array of { id, title }
          userId: userId, // Admin who performed the action
        },
      });
    }

    return {
      message: 'Bulk course deletion process completed',
      data: {
        deleted: coursesToDelete, // Successfully deleted courses with id & title
        failed: invalidCourseIds.length > 0 ? invalidCourseIds : null, // Invalid course IDs
      },
    };
  } catch (error: any) {
    console.error('Error in deleteBulkCoursesService:', error);
    throw new Error('Failed to delete courses: ' + error.message);
  }
};

// Helper to process profile image
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

// Helper to parse JSON fields safely
const parseJsonField = (field: any): any[] => {
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (error) {
    throw new Error('Invalid JSON format in one of the fields');
  }
};

export const createBulkCoursesService = async (
  courses: CreateCSVCourseData[],
  userId: string // Admin performing the action
) => {
  try {
    const errors: { courseTitle: string; error: string }[] = []; // ✅ Define errors array

    // Get unique schoolIds from the input courses
    const schoolIds = [...new Set(courses.map((course) => course.schoolId))];

    // Fetch existing schools in one query
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

          // Process profile image
          let profileUrl: string | null = null;
          if (course.profile) {
            profileUrl = await processProfileImage(course.profile);
          }

          // Parse stringified fields
          const requirements = parseJsonField(course.requirements);
          const careerOpportunities = parseJsonField(
            course.careerOpportunities
          );

          const courseId = nanoid(10);
          // id: courseId, // Use generated short ID
          // ✅ Fix: Explicitly connect course to an existing school
          const newCourse = await db.course.create({
            data: {
              id: courseId,
              title: course.title,
              profile: profileUrl,
              schoolId: course.schoolId,
              scholarship: course.scholarship,
              duration: course.duration,
              durationPeriod: course.durationPeriod as any,
              price: course.price,
              currency: course.currency as any,
              acceptanceFee: course.acceptanceFee,
              acceptanceFeeCurrency: course.acceptanceFeeCurrency as any,
              description: course.description,
              requirements,
              ratings: 0.0,
              courseInformation: course.courseInformation,
              courseWebsiteUrl: course.courseWebsiteUrl,
              programLevel: course.programLevel,
              careerOpportunities,
              loanInformation: course.loanInformation,
              estimatedLivingCost: course.estimatedLivingCost,
            },
          });

          return { id: newCourse.id, title: newCourse.title };
        } catch (error: any) {
          console.error(`Error creating course "${course.title}":`, error);
          errors.push({ courseTitle: course.title, error: error.message }); // ✅ Collect errors
          return null; // ✅ Ensure rejected items return null
        }
      })
    );

    // ✅ Fix: Filter out null values before destructuring
    const createdCourses = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{ id: string; title: string }> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => result.value);

    // ✅ Fix: Check if `createdCourses` is empty before logging action history
    if (createdCourses.length > 0) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Create',
          entity: 'Course',
          entityIds: createdCourses.map(({ id, title }) => ({ id, title })), // ✅ Store as an array
          userId: userId, // Admin who performed the action
        },
      });
    }

    return {
      message: 'Courses created successfully',
      data: {
        success: createdCourses,
        errors: errors, // ✅ Include errors
      },
    };
  } catch (error) {
    console.error('Error in createBulkCoursesService:', error);
    throw new Error('Bulk course creation failed');
  }
};

// update bulk schools

export const updateBulkSchoolsService = async (
  schools: UpdateSchoolData[],
  userId: string // Admin performing the update
) => {
  try {
    const results = await Promise.allSettled(
      schools.map(async (school) => {
        try {
          // Validate that school ID exists
          if (!school.id) {
            throw new Error('Missing school ID');
          }

          // Fetch the existing school record
          const existingSchool = await db.school.findUnique({
            where: { id: school.id },
          });

          if (!existingSchool) {
            throw new Error(`School with ID ${school.id} not found`);
          }

          // Construct update data by keeping existing values if undefined
          const updateData = {
            name: school.name ?? existingSchool.name,
            schoolType: school.schoolType ?? existingSchool.schoolType,
            location: school.location ?? existingSchool.location,
            websiteUrl: school.websiteUrl ?? existingSchool.websiteUrl,
            logo: school.logo ?? existingSchool.logo,
          };

          // Check if there are actual updates
          if (JSON.stringify(updateData) === JSON.stringify(existingSchool)) {
            return {
              status: 'skipped',
              id: school.id,
              name: existingSchool.name,
              message: `No changes for school with ID ${school.id}`,
            };
          }

          // Update school
          const updatedSchool = await db.school.update({
            where: { id: school.id },
            data: updateData,
          });

          return {
            status: 'success',
            data: { id: updatedSchool.id, name: updatedSchool.name },
          };
        } catch (error: any) {
          return {
            status: 'failed',
            id: school.id,
            name: school.name || 'Unknown',
            reason: error.message,
          };
        }
      })
    );

    // Extract successful updates
    const updatedSchools = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'success'
      )
      .map((result: any) => result.value.data);

    // Extract failed updates
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

    // Extract skipped updates
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

    // Log action history if any schools were updated
    if (updatedSchools.length > 0) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Update',
          entity: 'School',
          entityIds: updatedSchools.map(({ id, name }) => ({ id, name })),
          userId: userId, // Admin who performed the action
        },
      });
    }

    return {
      message: 'Bulk update process completed',
      data: {
        updated: updatedSchools, // Successfully updated schools with id & name
        failed: failedUpdates, // Failed updates with school id & error reason
        skipped: skippedUpdates, // Schools that had no changes
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

export const updateBulkCoursesService = async (
  courses: UpdateCourseData[],
  userId: string // Admin performing the update
) => {
  try {
    const results = await Promise.allSettled(
      courses.map(async (course) => {
        try {
          // Validate that course ID exists
          if (!course.id) {
            throw new Error('Missing course ID');
          }

          // Fetch existing course from DB
          const existingCourse = await db.course.findUnique({
            where: { id: course.id },
          });

          if (!existingCourse) {
            throw new Error(`Course with ID ${course.id} not found`);
          }

          // Function to keep old value if new value is empty
          const keepOldIfEmpty = (newValue: any, oldValue: any) =>
            typeof newValue === 'string' && newValue.trim() !== ''
              ? newValue
              : oldValue;

          // Convert JSON fields to array
          const parsedRequirements = parseJsonFieldForUpdate(
            course.requirements
          );
          const parsedCareerOpportunities = parseJsonFieldForUpdate(
            course.careerOpportunities
          );

          // Keep old values if empty array is provided
          const finalRequirements =
            parsedRequirements.length > 0
              ? parsedRequirements
              : existingCourse.requirements;
          const finalCareerOpportunities =
            parsedCareerOpportunities.length > 0
              ? parsedCareerOpportunities
              : existingCourse.careerOpportunities;

          // Construct update data while keeping existing values
          const updateData = {
            title: keepOldIfEmpty(course.title, existingCourse.title),
            profile: keepOldIfEmpty(course.profile, existingCourse.profile),
            schoolId: course.schoolId ?? existingCourse.schoolId,
            scholarship: course.scholarship ?? existingCourse.scholarship,
            duration: course.duration ?? existingCourse.duration,
            durationPeriod:
              course.durationPeriod ?? existingCourse.durationPeriod,
            price: course.price ?? existingCourse.price,
            currency: course.currency ?? existingCourse.currency,
            acceptanceFee: course.acceptanceFee ?? existingCourse.acceptanceFee,
            estimatedLivingCost:
              course.estimatedLivingCost ?? existingCourse.estimatedLivingCost,
            acceptanceFeeCurrency:
              course.acceptanceFeeCurrency ??
              existingCourse.acceptanceFeeCurrency,
            description: keepOldIfEmpty(
              course.description,
              existingCourse.description
            ),
            requirements: finalRequirements,
            courseInformation: keepOldIfEmpty(
              course.courseInformation,
              existingCourse.courseInformation
            ),
            courseWebsiteUrl: keepOldIfEmpty(
              course.courseWebsiteUrl,
              existingCourse.courseWebsiteUrl
            ),
            programLevel: course.programLevel ?? existingCourse.programLevel,
            careerOpportunities: finalCareerOpportunities,
            loanInformation: keepOldIfEmpty(
              course.loanInformation,
              existingCourse.loanInformation
            ),
          };

          // Prevent unnecessary updates if no change is detected
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
          return {
            status: 'failed',
            id: course.id,
            title: course.title || 'Unknown',
            reason: error.message,
          };
        }
      })
    );

    // Extract successfully updated courses
    const updatedCourses = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'success'
      )
      .map((result: any) => result.value.data);

    // Extract failed updates
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

    // Extract skipped updates
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

    // Log action history if any courses were updated
    if (updatedCourses.length > 0) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Update',
          entity: 'Course',
          entityIds: updatedCourses.map(({ id, title }) => ({ id, title })), // Correctly formatted array of { id, title }
          userId: userId, // Admin who performed the action
        },
      });
    }

    return {
      message: 'Bulk update process completed',
      data: {
        updated: updatedCourses, // Successfully updated courses with id & title
        failed: failedUpdates, // Failed updates with course id & error reason
        skipped: skippedUpdates, // Courses that had no changes
      },
    };
  } catch (error) {
    console.error('Error in updateBulkCoursesService:', error);
    throw new Error('Bulk course update failed');
  }
};
