import { Request, Response } from 'express';
import Papa from 'papaparse';
import {
  createBulkCoursesService,
  createBulkSchoolsService2,
  deleteBulkCoursesService,
  deleteBulkSchoolsService,
} from '../services/bulk-test';

enum SchoolType {
  FEDERAL_UNIVERSITY = 'FEDERAL_UNIVERSITY',
  PRIVATE_UNIVERSITY = 'PRIVATE_UNIVERSITY',
  PUBLIC_UNIVERSITY = 'PUBLIC_UNIVERSITY',
}

interface CreateCSVSchoolData {
  name: string;
  schoolType: SchoolType;
  location: string;
  websiteUrl: string;
}

export enum DurationPeriod {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

export enum Currency {
  NAIRA = 'NAIRA',
  DOLLAR = 'DOLLAR',
}

interface CreateCSVCourseData {
  id?: string;
  title: string;
  // logo: Express.Multer.File | null | undefined;
  profile: any; // added this
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

interface newCreateCSVSchoolData {
  name: string;
  schoolType: SchoolType;
  location: string;
  websiteUrl: string;
  logo?: string; // This will be the image URL
}

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
    const parsedData = Papa.parse<newCreateCSVSchoolData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const schools: newCreateCSVSchoolData[] =
      parsedData.data as newCreateCSVSchoolData[];

    // Transform data to include optional logo
    const transformedSchools: newCreateCSVSchoolData[] = schools.map(
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
