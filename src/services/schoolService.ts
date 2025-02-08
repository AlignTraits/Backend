// services/schoolService.ts
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import path from 'path';
import sharp from 'sharp';
import { createCourse, createSchool } from '../models/schoolmodel';
import { db } from '../config/db';

// Define the SchoolType enum
enum SchoolType {
  FEDERAL_UNIVERSITY = 'FEDERAL_UNIVERSITY',
  PRIVATE_UNIVERSITY = 'PRIVATE_UNIVERSITY',
  PUBLIC_UNIVERSITY = 'PUBLIC_UNIVERSITY',
}

// enums.ts
export enum DurationPeriod {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

export enum Currency {
  NAIRA = 'NAIRA',
  DOLLAR = 'DOLLAR',
}

// School interface
interface CreateSchoolData {
  name: string;
  schoolType: SchoolType;
  location: string;
  websiteUrl: string;
  logo: Express.Multer.File | undefined;
}

// Course interface
// Course interface
interface CreateCourseData {
  id?: string;
  title: string;
  logo: Express.Multer.File | null | undefined;
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
  location,
  websiteUrl,
  logo,
}: CreateSchoolData) => {
  let logoUrl: string | null = null;

  try {
    // Check if a school with the given name already exists
    const existingSchool = await db.school.findFirst({ where: { name } });
    if (existingSchool) {
      return {
        ok: false,
        status: 400,
        message: 'A school with this name already exists',
        errors: [{ message: 'Duplicate school name' }],
      };
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
        .resize(400, 400, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .toBuffer();

      const result: UploadApiResponse = await uploadToCloudinary({
        folder: 'school_logos',
        file: { ...logo, buffer: resizedBuffer },
      });

      logoUrl = result.secure_url;
    }

    const newSchool = await createSchool({
      data: { name, schoolType, location, websiteUrl, logo: logoUrl },
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

// Course service
export const createCourseService = async ({
  title,
  logo,
  schoolId,
  scholarship,
  duration,
  durationPeriod,
  price,
  currency,
  acceptanceFee,
  estimatedLivingCost,
  acceptanceFeeCurrency,
  description,
  requirements,
  courseInformation,
  courseWebsiteUrl,
  programLevel,
  careerOpportunities,
  loanInformation,
}: CreateCourseData) => {
  let profileUrl: string;

  try {
    if (!logo) {
      return {
        ok: false,
        status: 403,
        message: 'File upload failed',
        errors: [{ message: 'No file uploaded' }],
      };
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(logo.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension))
      return {
        ok: false,
        status: 403,
        message: 'File upload failed',
        errors: [
          { message: 'Invalid file type. Only JPG, JPEG & PNG are allowed.' },
        ],
      };

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

    // Parse JSON fields if needed
    if (typeof requirements === 'string') {
      requirements = JSON.parse(requirements);
    }
    if (typeof careerOpportunities === 'string') {
      careerOpportunities = JSON.parse(careerOpportunities);
    }

    const newCourse = await createCourse({
      data: {
        title,
        profile: profileUrl,
        schoolId,
        scholarship,
        duration,
        durationPeriod,
        price,
        currency,
        acceptanceFee,
        estimatedLivingCost,
        acceptanceFeeCurrency,
        description,
        requirements,
        courseInformation,
        courseWebsiteUrl,
        programLevel,
        careerOpportunities,
        loanInformation,
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
  duration,
  durationPeriod,
  price,
  currency,
  acceptanceFee,
  acceptanceFeeCurrency,
  description,
  requirements,
  estimatedLivingCost,
  courseInformation, // New field
  courseWebsiteUrl, // New field
  programLevel, // New field
  careerOpportunities, // New field
  loanInformation, // New field
}: CreateCourseData) => {
  let profileUrl: string | undefined;

  try {
    // Check if the course exists
    const existingCourse = await db.course.findUnique({ where: { id } });
    if (!existingCourse) {
      return { ok: false, status: 404, message: 'Course not found' };
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
        folder: 'course_profile',
        file: { ...logo, buffer: resizedBuffer },
      });

      profileUrl = result.secure_url;
    }

    // Parse JSON fields if needed
    if (typeof requirements === 'string') {
      requirements = JSON.parse(requirements);
    }

    if (typeof careerOpportunities === 'string') {
      careerOpportunities = JSON.parse(careerOpportunities);
    }

    // Update the course
    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        title: title || existingCourse.title,
        profile: profileUrl || existingCourse.profile,
        scholarship: scholarship || existingCourse.scholarship,
        duration: duration || existingCourse.duration,
        durationPeriod: durationPeriod || existingCourse.durationPeriod,
        price: price || existingCourse.price,
        currency: currency || existingCourse.currency,
        acceptanceFee: acceptanceFee || existingCourse.acceptanceFee,
        estimatedLivingCost:
          estimatedLivingCost || existingCourse.estimatedLivingCost,
        acceptanceFeeCurrency:
          acceptanceFeeCurrency || existingCourse.acceptanceFeeCurrency,
        description: description || existingCourse.description,
        requirements: requirements || existingCourse.requirements,
        courseInformation:
          courseInformation || existingCourse.courseInformation,
        courseWebsiteUrl: courseWebsiteUrl || existingCourse.courseWebsiteUrl,
        programLevel: programLevel || existingCourse.programLevel,
        careerOpportunities:
          careerOpportunities || existingCourse.careerOpportunities,
        loanInformation: loanInformation || existingCourse.loanInformation,
      },
    });

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
export const deleteSchoolsService = async (schoolId: string) => {
  // Delete all courses associated with the school
  await db.course.deleteMany({ where: { schoolId } });
  // Delete the school
  return db.school.delete({ where: { id: schoolId } });
};
//
export const searchSchoolsService = async (location: string) => {
  return db.school.findMany({
    where: {
      location: {
        contains: `/${location}`, // This will match any location containing "/Country"
      },
    },
    include: { courses: true },
  });
};

// new
interface UpdateSchoolData {
  id: string;
  name?: string;
  schoolType?: SchoolType;
  location?: string;
  websiteUrl?: string;
  logo?: Express.Multer.File | null | undefined;
}

export const updateSchoolService = async ({
  id,
  name,
  schoolType,
  location,
  logo,
  websiteUrl,
}: UpdateSchoolData) => {
  let logoUrl: string | undefined;
  try {
    // Check if the school exists
    const existingSchool = await db.school.findUnique({ where: { id } });
    if (!existingSchool) {
      return { ok: false, status: 404, message: 'School not found' };
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
        location: location || existingSchool.location,
        websiteUrl: websiteUrl || existingSchool.websiteUrl,
        logo: logoUrl || existingSchool.logo,
      },
    });
    return updatedSchool;
  } catch (e) {
    throw e;
  }
};

export const deleteCourseService = async (courseId: string) => {
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
    return { ok: true, status: 200, message: 'Course deleted successfully' };
  } catch (e) {
    throw e;
  }
};

// Get a single course by ID export
export const getCourseByIdService = async (id: string) => {
  try {
    const course = await db.course.findUnique({
      where: { id },
      include: { university: true },
      // Include the associated university
    });
    return course;
  } catch (e) {
    throw e;
  }
};

export const getAllCoursesService = async () => {
  try {
    const courses = await db.course.findMany({
      include: {
        university: true,
      },
    });
    return courses;
  } catch (error) {
    throw error;
  }
};

// Bulk Creations

interface CreateCSVSchoolData {
  name: string;
  schoolType: string;
  location: string;
  websiteUrl: string;
}

export const createBulkSchoolsService = async (
  schools: CreateSchoolData[],
  files: Express.Multer.File[]
) => {
  const results = await Promise.all(
    schools.map(async (school, index) => {
      const file = files[index];

      // Upload logo to Cloudinary
      const result = await uploadToCloudinary({
        folder: 'school_logos',
        file,
      });

      // Create school with logo URL
      const newSchool = await createSchool({
        data: {
          name: school.name,
          schoolType: school.schoolType,
          location: school.location,
          websiteUrl: school.websiteUrl,
          logo: result.secure_url,
        },
        // name: school.name,
        // schoolType: school.schoolType,
        // location: school.location,
        // logo: result.secure_url,
      });

      return newSchool;
    })
  );

  return results;
};

export const createBulkCSVSchoolsService = async (
  schools: CreateCSVSchoolData[],
  files: Express.Multer.File[]
) => {
  const results = await Promise.all(
    schools.map(async (school, index) => {
      const file = files ? files[index] : null;
      let logoUrl: string | null = null;

      if (file) {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
          throw new Error(
            'Invalid file type. Only JPG, JPEG & PNG are allowed.'
          );
        }

        // Resize the image using sharp
        const resizedBuffer = await sharp(file.buffer)
          .resize(400, 400, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .toBuffer();

        const result: UploadApiResponse = await uploadToCloudinary({
          folder: 'school_logos',
          file: { ...file, buffer: resizedBuffer },
        });

        logoUrl = result.secure_url;
      }

      // Create school with logo URL
      const newSchool = await db.school.create({
        data: {
          name: school.name,
          schoolType: school.schoolType as any, // Cast to appropriate type
          location: school.location,
          logo: logoUrl,
          websiteUrl: school.websiteUrl,
        },
      });

      return newSchool;
    })
  );

  return results;
};
