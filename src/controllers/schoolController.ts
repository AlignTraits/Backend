import { Request, Response } from 'express';
import Papa from 'papaparse';

import {
  createCourseService,
  createSchoolService,
  deleteSchoolsService,
  getAllSchoolsService,
  getSchoolByIdService,
  searchSchoolsService,
  updateCourseService,
  deleteCourseService,
  updateSchoolService,
  getCourseByIdService,
  getAllCoursesService,
  createBulkSchoolsService,
  createBulkCSVSchoolsService,
  // createBulkCoursesService,
} from '../services/schoolService';

interface CreateCSVSchoolData {
  name: string;
  schoolType: string;
  location: string;
  websiteUrl: string;
}

export const createBulkCSVSchoolsController = async (
  req: Request,
  res: Response
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const csvFile = files?.csvFile?.[0];
    const logos = files?.logos;

    if (!csvFile) {
      return res.status(400).send({ error: 'CSV file is required' });
    }

    // Convert the CSV file buffer to string
    const csvData = csvFile.buffer.toString('utf-8');

    // Parse the CSV string
    const parsedData = Papa.parse<CreateCSVSchoolData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const schools: CreateCSVSchoolData[] =
      parsedData.data as CreateCSVSchoolData[];

    const results = await createBulkCSVSchoolsService(schools, logos);

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

//

export const createSchoolController = async (req: Request, res: Response) => {
  try {
    const { name, schoolType, location, websiteUrl } = req.body;
    const logo = req.file;

    const newSchool = await createSchoolService({
      name,
      schoolType,
      logo,
      location,
      websiteUrl,
    });

    res.status(201).send(newSchool);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while creating the school' });
  }
};

// Get all schools export
export const getAllSchoolsController = async (req: Request, res: Response) => {
  try {
    const schools = await getAllSchoolsService();
    res.status(200).send(schools);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching the schools' });
  }
};

// Get a single school by ID and populate courses export
export const getSchoolByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const school = await getSchoolByIdService(id);
    if (!school) {
      return res.status(404).send({ error: 'School not found' });
    }
    res.status(200).send(school);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching the school' });
  }
};

// Course creation
export const createCourseController = async (req: Request, res: Response) => {
  try {
    const {
      title,
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
      courseInformation, // New property
      courseWebsiteUrl, // New property
      programLevel, // New property
      careerOpportunities, // New property
      loanInformation, // New property
    } = req.body;
    const logo = req.file;
    const newCourse = await createCourseService({
      title,
      logo,
      schoolId,
      scholarship,
      duration: parseInt(duration, 10),
      durationPeriod,
      price: parseFloat(price),
      currency,
      acceptanceFee: parseFloat(acceptanceFee),
      estimatedLivingCost: parseFloat(estimatedLivingCost),
      acceptanceFeeCurrency,
      description,
      requirements,
      courseInformation, // New property
      courseWebsiteUrl, // New property
      programLevel, // New property
      careerOpportunities, // New property
      loanInformation, // New property
    });

    res.status(201).send(newCourse);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while creating the course' });
  }
};

export const updateCourseController = async (req: Request, res: Response) => {
  try {
    const {
      title,
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
      courseInformation, // New property
      courseWebsiteUrl, // New property
      programLevel, // New property
      careerOpportunities, // New property
      loanInformation, // New property
    } = req.body;
    const logo = req.file;
    const { id } = req.params;
    const updatedCourse = await updateCourseService({
      id,
      title,
      logo,
      schoolId,
      scholarship,
      duration: parseInt(duration, 10),
      durationPeriod,
      price: parseFloat(price),
      currency,
      acceptanceFee: parseFloat(acceptanceFee),
      estimatedLivingCost: parseFloat(estimatedLivingCost),
      acceptanceFeeCurrency,
      description,
      requirements,
      courseInformation, // New property
      courseWebsiteUrl, // New property
      programLevel, // New property
      careerOpportunities, // New property
      loanInformation, // New property
    });
    res.status(200).send(updatedCourse);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while updating the course' });
  }
};

// Delete a course
export const deleteCourseController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteCourseService(id);
    res.status(200).send({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while deleting the course' });
  }
};

// Update a school
export const updateSchoolController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, schoolType, location, websiteUrl } = req.body;
    const logo = req.file;
    const updatedSchool = await updateSchoolService({
      id,
      name,
      schoolType,
      logo,
      location,
      websiteUrl,
    });
    res.status(200).send(updatedSchool);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while updating the school' });
  }
};

// Delete a school and associated courses
export const deleteSchoolsController = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const deletedSchoolDetails = await deleteSchoolsService(schoolId);
    res.status(200).send({
      message: 'School deleted successfully',
      school: deletedSchoolDetails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while deleting the school' });
  }
};

// Search schools by location
export const searchSchoolsController = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const schools = await searchSchoolsService(location);
    res.status(200).send(schools);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: 'An error occurred while searching for schools by location',
    });
  }
};

// Get a single course by ID
export const getCourseByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await getCourseByIdService(id);
    if (!course) {
      return res.status(404).send({ error: 'Course not found' });
    }
    res.status(200).send(course);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching the course' });
  }
};

// Get all courses
export const getAllCoursesController = async (req: Request, res: Response) => {
  try {
    const courses = await getAllCoursesService();
    res.status(200).send(courses);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching the courses' });
  }
};

// bulk School creations

export const createBulkSchoolsController = async (
  req: Request,
  res: Response
) => {
  try {
    const schools = JSON.parse(req.body.schools); // Array of schools
    const files = req.files as Express.Multer.File[]; // Array of uploaded logo files

    const results = await createBulkSchoolsService(schools, files);

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

//  bulk School creations

// export const createBulkCoursesController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const courses = JSON.parse(req.body.courses); // Array of courses
//     const files = req.files as Express.Multer.File[]; // Array of uploaded profile images

//     const results = await createBulkCoursesService(courses, files);

//     res.status(201).json({
//       message: 'Courses created successfully',
//       data: results,
//     });
//   } catch (error) {
//     console.error('Error creating courses:', error);
//     res
//       .status(500)
//       .send({ error: 'An error occurred while creating the courses' });
//   }
// };
