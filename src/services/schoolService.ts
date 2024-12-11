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
  logo: Express.Multer.File | undefined;
}

// Course interface
interface CreateCourseData {
  title: string;
  logo: Express.Multer.File | null | undefined;
  universities: string[]; // Array of school IDs
  scholarship: string;
  duration: number;
  durationPeriod: DurationPeriod;
  price: number;
  currency: Currency;
  acceptanceFee: number;
  acceptanceFeeCurrency: Currency;
  description?: string;
  requirements?: string;
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
      data: { name, schoolType, logo: logoUrl },
    });
    return newSchool;
  } catch (e) {
    throw e;
  }
};

// Course service
export const createCourseService = async ({
  title,
  logo,
  universities,
  scholarship,
  duration,
  durationPeriod,
  price,
  currency,
  acceptanceFee,
  acceptanceFeeCurrency,
  description,
  requirements,
}: CreateCourseData) => {
  let profileUrl: string;

  try {
    // Check if a course with the given title already exists
    const existingCourse = await db.course.findFirst({ where: { title } });
    if (existingCourse) {
      return {
        ok: false,
        status: 400,
        message: 'A course with this title already exists',
        errors: [{ message: 'Duplicate course title' }],
      };
    }

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

    // Resize the image using sharp
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
    //   pass the cloudinary uploaded image url
    profileUrl = result.secure_url;

    const newCourse = await createCourse({
      data: {
        title,
        profile: profileUrl,
        universities: {
          connect: universities.map((id) => ({ id })), // Properly structure the universities relation
        },
        scholarship,
        duration,
        durationPeriod,
        price,
        currency,
        acceptanceFee,
        acceptanceFeeCurrency,
        description,
        requirements,
      },
    });
    return newCourse;
  } catch (e) {
    throw e;
  }
};
