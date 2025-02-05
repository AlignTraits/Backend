import { db } from '../config/db';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import path from 'path';
import sharp from 'sharp';

enum SchoolType {
  FEDERAL_UNIVERSITY = 'FEDERAL_UNIVERSITY',
  PRIVATE_UNIVERSITY = 'PRIVATE_UNIVERSITY',
  PUBLIC_UNIVERSITY = 'PUBLIC_UNIVERSITY',
}

export enum DurationPeriod {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

export enum Currency {
  NAIRA = 'NAIRA',
  DOLLAR = 'DOLLAR',
}

interface CreateCSVCourseData {
  profile: any;
  id?: string;
  title: string;
  // logo: Express.Multer.File | null | undefined;
  schoolId: string;
  scholarship: string;
  duration: number;
  durationPeriod: DurationPeriod;
  price: number;
  currency: Currency;
  acceptanceFee: number;
  estimatedLivingCost: number;
  acceptanceFeeCurrency: Currency;
  description: string;
  requirements: string[];
  courseInformation: string; // New field
  courseWebsiteUrl: string; // New field
  programLevel: string; // New field
  careerOpportunities: string[]; // New field
  loanInformation: string; // New field
}

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

interface newCreateSchoolData {
  name: string;
  schoolType: SchoolType;
  location: string;
  websiteUrl: string;
  logo?: string; // Make logo optional and accept URL or file
}

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
