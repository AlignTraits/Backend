import { db } from '../config/db';
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
  schools: newCreateSchoolData[]
) => {
  try {
    // promise.all() will fail all when on requirement fails
    // promise.allSettle() will fail only the course or school with requirement fail and others will be success
    const results = await Promise.allSettled(
      schools.map(async (school) => {
        try {
          let logoUrl: string | null = null;

          if (school.logo) {
            logoUrl = school.logo; // Use the URL directly
          }

          const newSchool = await db.school.create({
            data: {
              name: school.name,
              schoolType: school.schoolType,
              location: school.location,
              logo: logoUrl,
              websiteUrl: school.websiteUrl,
            },
          });

          return newSchool;
        } catch (error) {
          console.error(`Error creating school ${school.name}:`, error);
          throw new Error(`Failed to create school ${school.name}`);
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Error in createBulkSchoolsService2:', error);
    throw new Error('Bulk school creation failed');
  }
};

// delete
export const deleteBulkSchoolsService = async (schoolIds: string[]) => {
  try {
    // Delete all courses associated with the schools
    await db.course.deleteMany({
      where: {
        schoolId: {
          in: schoolIds,
        },
      },
    });

    // Delete the schools
    const deletedSchools = await db.school.deleteMany({
      where: {
        id: {
          in: schoolIds,
        },
      },
    });

    return deletedSchools;
  } catch (error) {
    console.error('Error deleting schools and their courses:', error);
    throw new Error('Failed to delete schools and their associated courses');
  }
};

// course

export const deleteBulkCoursesService = async (courseIds: string[]) => {
  try {
    const deletedCourses = await db.course.deleteMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    });

    return deletedCourses;
  } catch (error) {
    console.error('Error deleting courses:', error);
    throw new Error('Failed to delete courses');
  }
};

//
// export const createBulkCoursesService = async (
//   courses: CreateCSVCourseData[]
// ) => {
//   try {
//     const results = await Promise.all(
//       courses.map(async (course) => {
//         try {
//           let profileUrl: string | null = null;

//           if (course.profile) {
//             if (course.profile.startsWith('data:image/')) {
//               const result: UploadApiResponse =
//                 await uploadBase64ImageToCloudinary(course.profile);
//               profileUrl = result.secure_url;
//             } else if (course.profile.startsWith('https://')) {
//               profileUrl = course.profile; // Use URL directly
//             } else {
//               throw new Error('Invalid profile image format');
//             }
//           }

//           // Parse requirements and careerOpportunities from strings to arrays
//           if (typeof course.requirements === 'string') {
//             course.requirements = JSON.parse(course.requirements);
//           }

//           if (typeof course.careerOpportunities === 'string') {
//             course.careerOpportunities = JSON.parse(course.careerOpportunities);
//           }

//           // Check if the schoolId exists
//           const schoolExists = await db.school.findUnique({
//             where: { id: course.schoolId },
//           });

//           if (!schoolExists) {
//             throw new Error(`School with ID ${course.schoolId} does not exist`);
//           }

//           const newCourse = await db.course.create({
//             data: {
//               title: course.title,
//               profile: profileUrl,
//               schoolId: course.schoolId,
//               scholarship: course.scholarship,
//               duration: course.duration,
//               durationPeriod: course.durationPeriod as any,
//               price: course.price,
//               currency: course.currency as any,
//               acceptanceFee: course.acceptanceFee,
//               acceptanceFeeCurrency: course.acceptanceFeeCurrency as any,
//               description: course.description,
//               requirements: course.requirements,
//               ratings: 0.0, // Initialize ratings to 0.0
//               courseInformation: course.courseInformation,
//               courseWebsiteUrl: course.courseWebsiteUrl,
//               programLevel: course.programLevel,
//               careerOpportunities: course.careerOpportunities,
//               loanInformation: course.loanInformation,
//               estimatedLivingCost: course.estimatedLivingCost,
//             },
//           });

//           return newCourse;
//         } catch (error) {
//           console.error(`Error creating course ${course.title}:`, error);
//           throw error; // Rethrow to be caught by the outer try-catch block
//         }
//       })
//     );

//     return results;
//   } catch (error) {
//     console.error('Error in createBulkCoursesService:', error);
//     throw new Error('Bulk course creation failed');
//   }
// };

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
  courses: CreateCSVCourseData[]
) => {
  try {
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

          // Create course
          const newCourse = await db.course.create({
            data: {
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

          return { status: 'fulfilled', value: newCourse };
        } catch (error: any) {
          console.error(`Error creating course "${course.title}":`, error);
          return { status: 'rejected', reason: error.message };
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Error in createBulkCoursesService:', error);
    throw new Error('Bulk course creation failed');
  }
};

// update bulk schools

// export const updateBulkSchoolsService = async (schools: UpdateSchoolData[]) => {
//   try {
//     const results = await Promise.allSettled(
//       schools.map(async (school) => {
//         try {
//           const updatedSchool = await db.school.update({
//             where: { id: school.id },
//             data: {
//               name: school.name,
//               schoolType: school.schoolType,
//               location: school.location,
//               websiteUrl: school.websiteUrl,
//               logo: school.logo,
//             },
//           });

//           return updatedSchool;
//         } catch (error) {
//           console.error(`Error updating school with ID ${school.id}:`, error);
//           throw new Error(`Failed to update school with ID ${school.id}`);
//         }
//       })
//     );

//     return results;
//   } catch (error) {
//     console.error('Error in updateBulkSchoolsService:', error);
//     throw new Error('Bulk school update failed');
//   }
// };

// update bulk course

export const updateBulkSchoolsService = async (schools: UpdateSchoolData[]) => {
  try {
    const results = await Promise.all(
      schools.map(async (school) => {
        try {
          // Validate that school ID exists
          if (!school.id) {
            console.error('Skipping school update due to missing ID:', school);
            return {
              status: 'skipped',
              reason: 'Missing school ID',
            };
          }

          // Fetch the existing school record
          const existingSchool = await db.school.findUnique({
            where: { id: school.id },
          });

          if (!existingSchool) {
            console.error(`School with ID ${school.id} not found`);
            return {
              status: 'failed',
              reason: `School with ID ${school.id} not found`,
            };
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
            data: updatedSchool,
          };
        } catch (error) {
          console.error(`Error updating school with ID ${school.id}:`, error);
          return {
            status: 'failed',
            reason: `Error updating school with ID ${school.id}`,
          };
        }
      })
    );

    return results;
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

export const updateBulkCoursesService = async (courses: UpdateCourseData[]) => {
  try {
    const results = await Promise.allSettled(
      courses.map(async (course) => {
        try {
          // Validate that school ID exists
          if (!course.id) {
            console.error('Skipping course update due to missing ID:', course);
            return {
              status: 'skipped',
              reason: 'Missing course ID',
            };
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
              message: `No changes for course ID ${course.id}`,
            };
          }

          // Update the course
          const updatedCourse = await db.course.update({
            where: { id: course.id },
            data: updateData,
          });

          return updatedCourse;
        } catch (error) {
          console.error(`Error updating course with ID ${course.id}:`, error);
          return {
            status: 'rejected',
            reason: `Failed to update course with ID ${course.id}`,
          };
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Error in updateBulkCoursesService:', error);
    throw new Error('Bulk course update failed');
  }
};
