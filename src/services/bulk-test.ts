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
} from '../types/school-course-types';

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
              country: school.country, // Updated from location to country
              region: school.region, // New field for region
              logo: school.logo || null,
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
      try {
        await db.actionHistory.create({
          data: {
            action: 'Bulk Create',
            entity: 'School',
            entityIds: successfulSchools.map(({ id, name }) => ({ id, name })),
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
      await db.actionHistory.create({
        data: {
          action: 'Bulk Delete',
          entity: 'School',
          entityIds: schoolsToDelete.map(({ id, name }) => ({ id, name })),
          userId: userId,
        },
      });
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
      await db.actionHistory.create({
        data: {
          action: 'Bulk Delete',
          entity: 'Course',
          entityIds: coursesToDelete.map(({ id, title }) => ({ id, title })),
          userId: userId,
        },
      });
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

    const schoolIds = [...new Set(courses.map((course) => course.schoolId))];
    const existingSchools = await db.school.findMany({
      where: { id: { in: schoolIds } },
      select: { id: true },
    });

    const existingSchoolIds = new Set(existingSchools.map((s) => s.id));

    const results = await Promise.allSettled(
      courses.map(async (course) => {
        try {
          if (!existingSchoolIds.has(course.schoolId)) {
            throw new Error(`School with ID ${course.schoolId} does not exist`);
          }

          let profileUrl: string | null = null;
          if (course.profile) {
            profileUrl = await processProfileImage(course.profile);
          }

          const requirements = parseJsonField(course.requirements);
          const careerOpportunities = parseJsonField(
            course.careerOpportunities
          );

          const courseId = nanoid(10);
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
          errors.push({ courseTitle: course.title, error: error.message });
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
      await db.actionHistory.create({
        data: {
          action: 'Bulk Create',
          entity: 'Course',
          entityIds: createdCourses.map(({ id, title }) => ({ id, title })),
          userId: userId,
        },
      });
    }

    return {
      message: 'Courses created successfully',
      data: {
        success: createdCourses,
        errors: errors,
      },
    };
  } catch (error) {
    console.error('Error in createBulkCoursesService:', error);
    throw new Error('Bulk course creation failed');
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
            country: school.country ?? existingSchool.country, // Updated from location to country
            region: school.region ?? existingSchool.region, // New field for region
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
          return {
            status: 'failed',
            id: school.id,
            name: school.name || 'Unknown',
            reason: error.message,
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
      await db.actionHistory.create({
        data: {
          action: 'Bulk Update',
          entity: 'School',
          entityIds: updatedSchools.map(({ id, name }) => ({ id, name })),
          userId: userId,
        },
      });
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

export const updateBulkCoursesService = async (
  courses: UpdateCourseData[],
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

          const keepOldIfEmpty = (newValue: any, oldValue: any) =>
            typeof newValue === 'string' && newValue.trim() !== ''
              ? newValue
              : oldValue;

          const parsedRequirements = parseJsonFieldForUpdate(
            course.requirements
          );
          const parsedCareerOpportunities = parseJsonFieldForUpdate(
            course.careerOpportunities
          );

          const finalRequirements =
            parsedRequirements.length > 0
              ? parsedRequirements
              : existingCourse.requirements;
          const finalCareerOpportunities =
            parsedCareerOpportunities.length > 0
              ? parsedCareerOpportunities
              : existingCourse.careerOpportunities;

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

          if (JSON.stringify(updateData) === JSON.stringify(existingCourse)) {
            return {
              status: 'skipped',
              id: course.id,
              title: existingCourse.title,
              message: `No changes for course ID ${course.id}`,
            };
          }

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
      await db.actionHistory.create({
        data: {
          action: 'Bulk Update',
          entity: 'Course',
          entityIds: updatedCourses.map(({ id, title }) => ({ id, title })),
          userId: userId,
        },
      });
    }

    return {
      message: 'Bulk update process completed',
      data: {
        updated: updatedCourses,
        failed: failedUpdates,
        skipped: skippedUpdates,
      },
    };
  } catch (error) {
    console.error('Error in updateBulkCoursesService:', error);
    throw new Error('Bulk course update failed');
  }
};

type SchoolReportData = {
  id: string;
  name: string;
  schoolType: string;
  country: string; // Updated from location to country
  region: string; // New field for region
  websiteUrl: string;
  logo: string | null;
  createdAt: Date;
};

type CourseReportData = {
  id: string;
  title: string;
  profile: string;
  schoolId: string;
  scholarship: string;
  duration: string;
  price: number;
  currency: string;
  acceptanceFee: number;
  acceptanceFeeCurrency: string;
  description: string;
  requirements: string;
  ratings: number;
  courseInformation: string;
  courseWebsiteUrl: string;
  programLevel: string;
  careerOpportunities: string;
  loanInformation: string;
  estimatedLivingCost: number;
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
          country: true, // Updated from location to country
          region: true, // New field for region
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
          profile: true,
          schoolId: true,
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
          createdAt: true,
        },
      });

      const courseData: CourseReportData[] = courses.map((course) => ({
        id: course.id,
        title: course.title,
        profile: course.profile ?? '',
        schoolId: course.schoolId,
        scholarship: course.scholarship,
        duration: `${course.duration} ${course.durationPeriod.toLowerCase()}`,
        price: course.price,
        currency: course.currency,
        acceptanceFee: course.acceptanceFee,
        acceptanceFeeCurrency: course.acceptanceFeeCurrency,
        description: course.description,
        requirements: course.requirements.join(', '),
        ratings: course.ratings,
        courseInformation: course.courseInformation,
        courseWebsiteUrl: course.courseWebsiteUrl,
        programLevel: course.programLevel,
        careerOpportunities: course.careerOpportunities.join(', '),
        loanInformation: course.loanInformation,
        estimatedLivingCost: course.estimatedLivingCost,
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
