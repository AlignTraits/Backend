// services/schoolService.ts

import { UploadApiResponse } from 'cloudinary';
import { nanoid } from 'nanoid';
import cloudinary from '../config/cloudinary';
import path from 'path';
import sharp from 'sharp';
import { db } from '../config/db';
import { z } from 'zod';
import { getUserByEmail } from '../models/userModel';
import { Prisma } from '@prisma/client';
import {
  CreateCourseData,
  UpdateCourseData,
} from '../types/school-course-types';

// Reusable Cloudinary uploader with custom public_id (extracted from file name)
export const uploadToCloudinaryByName = async ({
  folder,
  file,
}: {
  folder: string;
  file: Express.Multer.File;
}): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const courseId = path.parse(file.originalname).name;
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: courseId,
        overwrite: true,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload result is undefined'));
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

// Bulk Course Image Upload Service
export const bulkUploadCourseImagesService = async ({
  files,
  knownCourseIds,
  userId,
}: {
  files: Express.Multer.File[];
  knownCourseIds: string[];
  userId: string;
}) => {
  const results = [];
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];

  for (const file of files) {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        results.push({
          filename: file.originalname,
          status: 'failed',
          message: 'Invalid file type',
        });
        continue;
      }

      const courseId = path.parse(file.originalname).name;

      if (!knownCourseIds.includes(courseId)) {
        results.push({
          filename: file.originalname,
          status: 'skipped',
          message: 'Course ID not in provided list',
        });
        continue;
      }

      const resizedBuffer = await sharp(file.buffer)
        .resize(400, 400, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .toBuffer();

      const result = await uploadToCloudinaryByName({
        folder: 'course_profile',
        file: { ...file, buffer: resizedBuffer },
      });

      const updatedCourse = await db.course.update({
        where: { id: courseId },
        data: { image: result.secure_url },
      });

      await db.actionHistory.create({
        data: {
          action: 'Update',
          entity: 'Course',
          entityIds: [{ id: updatedCourse.id, title: updatedCourse.title }],
          userId,
        },
      });

      results.push({
        filename: file.originalname,
        courseId,
        status: 'success',
        imageUrl: result.secure_url,
      });
    } catch (error: any) {
      results.push({
        filename: file.originalname,
        status: 'failed',
        message: error.message,
      });
    }
  }

  return {
    ok: true,
    status: 207,
    message: 'Bulk image upload completed',
    data: results,
  };
};
