import { Request, Response } from 'express';
import {
  bulkUploadCourseImagesService,
  bulkUploadSchoolImagesService,
} from '../services/bulkImageuploadService';

export const bulkUploadCourseImagesController = async (
  req: Request,
  res: Response
) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Image files are required',
        errors: [{ message: 'Please upload at least one image file' }],
      });
    }

    const knownCourseIds = req.body.knownCourseIds
      ? JSON.parse(req.body.knownCourseIds)
      : [];

    if (!Array.isArray(knownCourseIds) || knownCourseIds.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Known course IDs are required',
        errors: [{ message: 'Please provide a list of valid course IDs' }],
      });
    }

    const userId = (req as any)?.user?.id ?? '';

    const result = await bulkUploadCourseImagesService({
      files,
      knownCourseIds,
      userId,
    });

    const statusCode =
      result.summary?.failed && result.summary?.failed > 0 ? 207 : 201;

    res.status(statusCode).json({
      ok: true,
      message: result.message,
      data: result.data,
      summary: result.summary,
    });
  } catch (error: any) {
    console.error('Error in bulk course image upload controller:', error);
    res.status(500).json({
      ok: false,
      message: 'An unexpected error occurred while uploading course images',
      errors: [{ message: error.message || 'Please try again later' }],
    });
  }
};

export const bulkUploadSchoolImagesController = async (
  req: Request,
  res: Response
) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Image files are required',
        errors: [{ message: 'Please upload at least one image file' }],
      });
    }

    const knownSchoolIds = req.body.knownSchoolIds
      ? JSON.parse(req.body.knownSchoolIds)
      : [];

    if (!Array.isArray(knownSchoolIds) || knownSchoolIds.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Known school IDs are required',
        errors: [{ message: 'Please provide a list of valid school IDs' }],
      });
    }

    const userId = (req as any)?.user?.id ?? '';

    const result = await bulkUploadSchoolImagesService({
      files,
      knownSchoolIds,
      userId,
    });

    const statusCode =
      result.summary?.failed && result.summary?.failed > 0 ? 207 : 201;

    res.status(statusCode).json({
      ok: true,
      message: result.message,
      data: result.data,
      summary: result.summary,
    });
  } catch (error: any) {
    console.error('Error in bulk school image upload controller:', error);
    res.status(500).json({
      ok: false,
      message: 'An unexpected error occurred while uploading school images',
      errors: [{ message: error.message || 'Please try again later' }],
    });
  }
};

// export const bulkUploadSchoolImagesController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const files = req.files as Express.Multer.File[];

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         ok: false,
//         message: 'Image files are required',
//         errors: [{ message: 'Please upload at least one image file' }],
//       });
//     }

//     // ← Improved parsing with fallback and logging
//     let knownSchoolIds: string[] = [];
//     if (req.body.knownSchoolIds) {
//       try {
//         knownSchoolIds =
//           typeof req.body.knownSchoolIds === 'string'
//             ? JSON.parse(req.body.knownSchoolIds)
//             : req.body.knownSchoolIds;
//       } catch (e) {
//         console.error(
//           'Failed to parse knownSchoolIds:',
//           req.body.knownSchoolIds
//         );
//       }
//     }

//     console.log('Received knownSchoolIds:', knownSchoolIds); // ← Debug log

//     if (!Array.isArray(knownSchoolIds) || knownSchoolIds.length === 0) {
//       return res.status(400).json({
//         ok: false,
//         message: 'Known school IDs are required',
//         errors: [{ message: 'Please provide a list of valid school IDs' }],
//         received: req.body.knownSchoolIds, // Helpful for debugging
//       });
//     }

//     const userId = (req as any)?.user?.id ?? '';

//     const result = await bulkUploadSchoolImagesService({
//       files,
//       knownSchoolIds,
//       userId,
//     });

//     const statusCode =
//       result.summary?.failed && result.summary.failed > 0 ? 207 : 201;

//     res.status(statusCode).json({
//       ok: true,
//       message: result.message,
//       data: result.data,
//       summary: result.summary,
//     });
//   } catch (error: any) {
//     console.error('Error in bulk school image upload controller:', error);
//     res.status(500).json({
//       ok: false,
//       message: 'An unexpected error occurred while uploading school images',
//       errors: [{ message: error.message || 'Please try again later' }],
//     });
//   }
// };
