import { UploadApiResponse } from 'cloudinary';
import path from 'path';
import sharp from 'sharp';
import { db } from '../config/db';
import cloudinary from '../config/cloudinary';

// Reusable Cloudinary uploader
export const uploadToCloudinaryByName = async ({
  folder,
  file,
}: {
  folder: string;
  file: Express.Multer.File;
}): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const publicId = path.parse(file.originalname).name;
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
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

// ==================== BULK SCHOOL IMAGE UPLOAD ====================
export const bulkUploadSchoolImagesService = async ({
  files,
  knownSchoolIds,
  userId,
}: {
  files: Express.Multer.File[];
  knownSchoolIds: string[];
  userId: string;
}) => {
  const results = [];
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];

  if (!knownSchoolIds || knownSchoolIds.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'Known school IDs are required',
      errors: [{ message: 'Please provide a list of valid school IDs' }],
    };
  }

  for (const file of files) {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        results.push({
          filename: file.originalname,
          status: 'failed',
          message: 'Invalid file type. Only JPG, JPEG, PNG allowed.',
        });
        continue;
      }

      const schoolId = path.parse(file.originalname).name.trim();

      if (!knownSchoolIds.includes(schoolId)) {
        results.push({
          filename: file.originalname,
          status: 'skipped',
          message: 'School ID not in provided list',
        });
        continue;
      }

      // Resize
      const resizedBuffer = await sharp(file.buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      // Upload
      const result = await uploadToCloudinaryByName({
        folder: 'school_profile',
        file: { ...file, buffer: resizedBuffer },
      });

      // Update school (safe)
      const updatedSchool = await db.school
        .update({
          where: { id: schoolId },
          data: { logo: result.secure_url },
        })
        .catch(() => null);

      if (!updatedSchool) {
        results.push({
          filename: file.originalname,
          status: 'failed',
          message: 'School not found or could not be updated',
        });
        continue;
      }

      // Log action (safe — only if userId exists)
      if (userId) {
        await db.actionHistory
          .create({
            data: {
              action: 'Update',
              entity: 'School',
              entityIds: [{ id: updatedSchool.id, title: updatedSchool.name }],
              userId,
            },
          })
          .catch((err) => {
            console.warn('Failed to create action history:', err.message);
          });
      }

      results.push({
        filename: file.originalname,
        schoolId,
        status: 'success',
        imageUrl: result.secure_url,
      });
    } catch (error: any) {
      results.push({
        filename: file.originalname,
        status: 'failed',
        message: error.message || 'Unknown error occurred',
      });
    }
  }

  const successful = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return {
    ok: true,
    status: 207,
    message: `Bulk school image upload completed. ${successful} succeeded, ${failed} failed, ${skipped} skipped.`,
    data: results,
    summary: { successful, failed, skipped, total: results.length },
  };
};

// ==================== BULK COURSE IMAGE UPLOAD ====================
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

  if (!knownCourseIds || knownCourseIds.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'Known course IDs are required',
      errors: [{ message: 'Please provide a list of valid course IDs' }],
    };
  }

  for (const file of files) {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        results.push({
          filename: file.originalname,
          status: 'failed',
          message: 'Invalid file type. Only JPG, JPEG, PNG allowed.',
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

      // Resize image
      const resizedBuffer = await sharp(file.buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      // Upload to Cloudinary
      const result = await uploadToCloudinaryByName({
        folder: 'course_profile',
        file: { ...file, buffer: resizedBuffer },
      });

      // Update database
      const updatedCourse = await db.course.update({
        where: { id: courseId },
        data: { image: result.secure_url },
      });

      // Log action
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
        message: error.message || 'Unknown error occurred',
      });
    }
  }

  const successful = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return {
    ok: true,
    status: 207, // Multi-Status
    message: `Bulk upload completed. ${successful} succeeded, ${failed} failed, ${skipped} skipped.`,
    data: results,
    summary: { successful, failed, skipped, total: results.length },
  };
};

// // services/schoolService.ts

// import { UploadApiResponse } from 'cloudinary';
// import { nanoid } from 'nanoid';
// import cloudinary from '../config/cloudinary';
// import path from 'path';
// import sharp from 'sharp';
// import { db } from '../config/db';
// import { z } from 'zod';
// import { getUserByEmail } from '../models/userModel';
// import { Prisma } from '@prisma/client';
// import {
//   CreateCourseData,
//   UpdateCourseData,
// } from '../types/school-course-types';

// // Reusable Cloudinary uploader with custom public_id (extracted from file name)
// export const uploadToCloudinaryByName = async ({
//   folder,
//   file,
// }: {
//   folder: string;
//   file: Express.Multer.File;
// }): Promise<UploadApiResponse> => {
//   return new Promise((resolve, reject) => {
//     const courseId = path.parse(file.originalname).name;
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         public_id: courseId,
//         overwrite: true,
//         use_filename: false,
//         unique_filename: false,
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         if (!result) return reject(new Error('Upload result is undefined'));
//         resolve(result);
//       }
//     );
//     stream.end(file.buffer);
//   });
// };

// // Bulk Course Image Upload Service
// export const bulkUploadCourseImagesService = async ({
//   files,
//   knownCourseIds,
//   userId,
// }: {
//   files: Express.Multer.File[];
//   knownCourseIds: string[];
//   userId: string;
// }) => {
//   const results = [];
//   const allowedExtensions = ['.jpg', '.jpeg', '.png'];

//   for (const file of files) {
//     try {
//       const fileExtension = path.extname(file.originalname).toLowerCase();
//       if (!allowedExtensions.includes(fileExtension)) {
//         results.push({
//           filename: file.originalname,
//           status: 'failed',
//           message: 'Invalid file type',
//         });
//         continue;
//       }

//       const courseId = path.parse(file.originalname).name;

//       if (!knownCourseIds.includes(courseId)) {
//         results.push({
//           filename: file.originalname,
//           status: 'skipped',
//           message: 'Course ID not in provided list',
//         });
//         continue;
//       }

//       const resizedBuffer = await sharp(file.buffer)
//         .resize(400, 400, {
//           fit: sharp.fit.inside,
//           withoutEnlargement: true,
//         })
//         .toBuffer();

//       const result = await uploadToCloudinaryByName({
//         folder: 'course_profile',
//         file: { ...file, buffer: resizedBuffer },
//       });

//       const updatedCourse = await db.course.update({
//         where: { id: courseId },
//         data: { image: result.secure_url },
//       });

//       await db.actionHistory.create({
//         data: {
//           action: 'Update',
//           entity: 'Course',
//           entityIds: [{ id: updatedCourse.id, title: updatedCourse.title }],
//           userId,
//         },
//       });

//       results.push({
//         filename: file.originalname,
//         courseId,
//         status: 'success',
//         imageUrl: result.secure_url,
//       });
//     } catch (error: any) {
//       results.push({
//         filename: file.originalname,
//         status: 'failed',
//         message: error.message,
//       });
//     }
//   }

//   return {
//     ok: true,
//     status: 207,
//     message: 'Bulk image upload completed',
//     data: results,
//   };
// };
