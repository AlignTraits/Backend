import { Request, Response } from 'express';
import Papa from 'papaparse';
import {
  createBulkCoursesService,
  createBulkSchoolsService2,
  deleteBulkCoursesService,
  deleteBulkSchoolsService,
  updateBulkCoursesService,
  updateBulkSchoolsService,
  generateSchoolCourseReport,
  getBulkOperationFailuresService,
} from '../services/bulk-test';
import {
  CreateCSVCourseData,
  NewCreateCSVSchoolData,
  UpdateCourseData,
  UpdateCsvCourseData,
  UpdateSchoolData,
} from '../types/school-course-types';

export const createBulkSchoolsController = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send({ error: 'CSV file is required' });
    }

    const csvData = file.buffer.toString('utf-8');
    const parsedData = Papa.parse<NewCreateCSVSchoolData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const schools: NewCreateCSVSchoolData[] =
      parsedData.data as NewCreateCSVSchoolData[];

    // Transform data to include optional logo
    const transformedSchools: NewCreateCSVSchoolData[] = schools.map(
      (school) => ({
        name: school.name,
        schoolType: school.schoolType,
        country: school.country, // Updated from location to country
        region: school.region, // New field for region
        websiteUrl: school.websiteUrl,
        logo: school.logo || undefined, // Use logo URL if provided
      })
    );

    const userId = (req as any)?.user?.id ?? '';

    const results = await createBulkSchoolsService2(transformedSchools, userId);

    res.status(201).json({
      message: 'Schools created successfully',
      data: results,
    });
  } catch (error) {
    console.error('Error creating schools:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while creating the schools' });
  }
};

// controllers/schoolController.ts

export const createBulkCoursesController = async (
  req: Request,
  res: Response
) => {
  try {
    const csvFile = req.file;

    if (!csvFile) {
      return res.status(400).send({
        ok: false,
        message: 'CSV file is required',
        errors: [{ message: 'Please upload a CSV file' }],
      });
    }

    const csvData = csvFile.buffer.toString('utf-8');

    const parsedData = Papa.parse<CreateCSVCourseData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      console.error('CSV Parsing Errors:', parsedData.errors);
      return res.status(400).send({
        ok: false,
        message: 'Invalid CSV data',
        errors: [
          { message: 'The CSV file contains invalid data or formatting' },
        ],
      });
    }

    const courses: CreateCSVCourseData[] =
      parsedData.data as CreateCSVCourseData[];

    const userId = (req as any)?.user?.id ?? '';

    const results = await createBulkCoursesService(courses, userId);

    res.status(201).json({
      ok: true,
      message: 'Courses created successfully',
      data: results,
    });
  } catch (error: any) {
    console.error('Error creating courses:', error);
    res.status(500).send({
      ok: false,
      message: 'An unexpected error occurred while creating the courses',
      errors: [{ message: 'Please try again later or contact support' }],
    });
  }
};

export const deleteBulkSchoolsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { schoolIds }: { schoolIds: string[] } = req.body;

    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return res.status(400).send({ error: 'Invalid school IDs' });
    }

    const userId = (req as any)?.user?.id ?? '';
    const deletedSchools = await deleteBulkSchoolsService(schoolIds, userId);

    res.status(200).json({
      message: 'Schools deleted successfully',
      data: deletedSchools,
    });
  } catch (error) {
    console.error('Error deleting schools:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while deleting the schools' });
  }
};

export const deleteBulkCoursesController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseIds: string[] = req.body.courseIds;

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).send({ error: 'Invalid course data' });
    }

    const userId = (req as any)?.user?.id ?? '';
    const deletedSchools = await deleteBulkCoursesService(courseIds, userId);

    res.status(200).json({
      message: 'Courses deleted successfully',
      data: deletedSchools,
    });
  } catch (error) {
    console.error('Error deleting courses:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while deleting the courses' });
  }
};

export const updateBulkSchoolsController = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send({ error: 'CSV file is required' });
    }

    const csvData = file.buffer.toString('utf-8');
    const parsedData = Papa.parse<UpdateSchoolData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const schoolsToUpdate: UpdateSchoolData[] =
      parsedData.data as UpdateSchoolData[];

    const userId = (req as any)?.user?.id ?? '';
    const updatedSchools = await updateBulkSchoolsService(
      schoolsToUpdate,
      userId
    );

    res.status(200).json({
      message: 'Schools updated successfully',
      data: updatedSchools,
    });
  } catch (error) {
    console.error('Error updating schools:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while updating the schools' });
  }
};

export const updateBulkCoursesController = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send({ error: 'CSV file is required' });
    }

    const csvData = file.buffer.toString('utf-8');
    const parsedData = Papa.parse<UpdateCsvCourseData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const coursesToUpdate = parsedData.data;

    const userId = (req as any)?.user?.id ?? '';
    const updatedCourses = await updateBulkCoursesService(
      coursesToUpdate,
      userId
    );

    res.status(200).json({
      message: 'Courses updated successfully',
      data: updatedCourses,
    });
  } catch (error) {
    console.error('Error updating courses:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while updating the courses' });
  }
};

export const downloadSchoolCourseDataController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      format,
      entity,
      startDate,
      endDate,
      id,
      name,
      title,
      country, // Updated from location to country
      region, // New field for region
      schoolId,
    } = req.query;

    console.log('Raw query:', req.query);

    if (!['csv', 'excel'].includes(format as string)) {
      return res
        .status(400)
        .json({ message: 'Invalid format. Choose CSV or Excel.' });
    }

    if (!['school', 'course'].includes(entity as string)) {
      return res
        .status(400)
        .json({ message: 'Invalid entity type. Choose school or course.' });
    }

    const fileUrl = await generateSchoolCourseReport(
      entity as string,
      format as string,
      startDate as string,
      endDate as string,
      id as string,
      name as string,
      title as string,
      country as string, // Updated from location to country
      region as string, // New field for region
      schoolId as string
    );

    return res.json({ message: 'Download ready', fileUrl });
  } catch (error) {
    console.error('Download error:', error);
    return res
      .status(500)
      .json({ message: 'Error processing download request', data: [] });
  }
};

export const getBulkOperationFailuresController = async (
  req: Request,
  res: Response
) => {
  try {
    const { entity, operation } = req.query;

    // Validate query parameters
    if (entity && typeof entity !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'Invalid entity parameter',
        errors: [
          { message: 'Entity must be a string (e.g., Course or School)' },
        ],
      });
    }

    if (operation && typeof operation !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'Invalid operation parameter',
        errors: [
          { message: 'Operation must be a string (e.g., Create or Update)' },
        ],
      });
    }

    // Fetch the failures using the service
    const failures = await getBulkOperationFailuresService(
      entity as string,
      operation as string
    );

    res.status(200).json({
      ok: true,
      message: 'Bulk operation failures retrieved successfully',
      data: failures,
    });
  } catch (error: any) {
    console.error('Error retrieving bulk operation failures:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to retrieve bulk operation failures',
      errors: [{ message: error.message }],
    });
  }
};
