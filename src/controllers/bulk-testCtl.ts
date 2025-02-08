import { Request, Response } from 'express';
import Papa from 'papaparse';
import {
  createBulkCoursesService,
  createBulkSchoolsService2,
  deleteBulkCoursesService,
  deleteBulkSchoolsService,
  updateBulkCoursesService,
  updateBulkSchoolsService,
} from '../services/bulk-test';
import {
  CreateCSVCourseData,
  NewCreateCSVSchoolData,
  UpdateCourseData,
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
        location: school.location,
        websiteUrl: school.websiteUrl,
        logo: school.logo || undefined, // Use logo URL if provided
      })
    );

    const results = await createBulkSchoolsService2(transformedSchools);

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

// course
export const createBulkCoursesController = async (
  req: Request,
  res: Response
) => {
  try {
    const csvFile = req.file;

    if (!csvFile) {
      return res.status(400).send({ error: 'CSV file is required' });
    }

    const csvData = csvFile.buffer.toString('utf-8');

    const parsedData = Papa.parse<CreateCSVCourseData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      console.error('CSV Parsing Errors:', parsedData.errors);
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const courses: CreateCSVCourseData[] =
      parsedData.data as CreateCSVCourseData[];

    const results = await createBulkCoursesService(courses);

    res.status(201).json({
      message: 'Courses created successfully',
      data: results,
    });
  } catch (error) {
    console.error('Error creating courses:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while creating the courses' });
  }
};

// delete
export const deleteBulkSchoolsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { schoolIds }: { schoolIds: string[] } = req.body;

    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return res.status(400).send({ error: 'Invalid school IDs' });
    }

    // Call the service to delete schools
    const deletedSchools = await deleteBulkSchoolsService(schoolIds);

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

    const deletedSchools = await deleteBulkCoursesService(courseIds);

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

// update

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

    // Explicitly cast parsed data to the correct type
    const schoolsToUpdate: UpdateSchoolData[] =
      parsedData.data as UpdateSchoolData[];

    const updatedSchools = await updateBulkSchoolsService(schoolsToUpdate);

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
    const parsedData = Papa.parse<UpdateCourseData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const coursesToUpdate = parsedData.data;

    const updatedCourses = await updateBulkCoursesService(coursesToUpdate);

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
