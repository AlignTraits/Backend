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

    // Create school
    const newSchool = await db.school.create({
      data: { name, schoolType, location, websiteUrl, logo: logoUrl },
    });

    // Log action history
    await db.actionHistory.create({
      data: {
        action: 'Create',
        entity: 'School',
        entityIds: [{ id: newSchool.id, name: newSchool.name }], // Stores an array of { id, name }
        userId: userId, // Admin who performed the action
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
  userId, // Capture user ID
}: CreateCourseData & { userId: string }) => {
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

    // Create course
    const newCourse = await db.course.create({
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

    // Log action history
    await db.actionHistory.create({
      data: {
        action: 'Create',
        entity: 'Course',
        entityIds: [{ id: newCourse.id, title: newCourse.title }], // Stores an array of { id, title }
        userId: userId, // Admin who performed the action
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
  courseInformation,
  courseWebsiteUrl,
  programLevel,
  careerOpportunities,
  loanInformation,
  userId, // Capture user ID
}: CreateCourseData & { userId: string }) => {
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

    // Log action history
    await db.actionHistory.create({
      data: {
        action: 'Update',
        entity: 'Course',
        entityIds: [{ id: updatedCourse.id, title: updatedCourse.title }], // Stores an array of { id, title }
        userId: userId, // Admin who performed the update
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
        entityIds: [{ id: deletedSchool.id, name: deletedSchool.name }], // Store school details
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
  userId, // Admin who performed the update
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
        location: location || existingSchool.location,
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
