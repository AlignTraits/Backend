import { Request, Response } from 'express';

import Papa from 'papaparse';
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
      return res.status(400).send({
        ok: false,
        message: 'Image files are required',
        errors: [{ message: 'Please upload at least one image file' }],
      });
    }

    const knownCourseIds = req.body.knownCourseIds
      ? JSON.parse(req.body.knownCourseIds)
      : [];
    if (!Array.isArray(knownCourseIds) || knownCourseIds.length === 0) {
      return res.status(400).send({
        ok: false,
        message: 'Known course IDs are required',
        errors: [{ message: 'Please provide a list of valid course IDs' }],
      });
    }

    const userId = (req as any)?.user?.id ?? '';

    const results = await bulkUploadCourseImagesService({
      files,
      knownCourseIds,
      userId,
    });

    res.status(201).json({
      ok: true,
      message: 'Course images uploaded successfully',
      data: results.data,
    });
  } catch (error: any) {
    console.error('Error uploading course images:', error);
    res.status(500).send({
      ok: false,
      message: 'An unexpected error occurred while uploading course images',
      errors: [{ message: 'Please try again later or contact support' }],
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
      return res.status(400).send({
        ok: false,
        message: 'Image files are required',
        errors: [{ message: 'Please upload at least one image file' }],
      });
    }

    const knownSchoolIds = req.body.knownSchoolIds
      ? JSON.parse(req.body.knownSchoolIds)
      : [];
    if (!Array.isArray(knownSchoolIds) || knownSchoolIds.length === 0) {
      return res.status(400).send({
        ok: false,
        message: 'Known school IDs are required',
        errors: [{ message: 'Please provide a list of valid school IDs' }],
      });
    }

    const userId = (req as any)?.user?.id ?? '';

    const results = await bulkUploadSchoolImagesService({
      files,
      knownSchoolIds,
      userId,
    });

    res.status(201).json({
      ok: true,
      message: 'School images uploaded successfully',
      data: results.data,
    });
  } catch (error: any) {
    console.error('Error uploading school images:', error);
    res.status(500).send({
      ok: false,
      message: 'An unexpected error occurred while uploading school images',
      errors: [{ message: 'Please try again later or contact support' }],
    });
  }
};
