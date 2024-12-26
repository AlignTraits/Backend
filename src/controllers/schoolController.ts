import { Request, Response } from 'express';
import {
  createCourseService,
  createSchoolService,
  deleteSchoolsService,
  getAllSchoolsService,
  getSchoolByIdService,
  searchSchoolsService,
  updateCourseService,
} from '../services/schoolService';

export const createSchoolController = async (req: Request, res: Response) => {
  try {
    const { name, schoolType, location } = req.body;
    const logo = req.file;

    const newSchool = await createSchoolService({
      name,
      schoolType,
      logo,
      location,
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

// course
export const createCourseController = async (req: Request, res: Response) => {
  try {
    const {
      title,
      // universities,
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
    } = req.body;
    const logo = req.file;
    // const parsedUniversities = Array.isArray(universities)
    //   ? universities
    //   : JSON.parse(universities);
    const newSchool = await createCourseService({
      title,
      logo,
      // universities: parsedUniversities,
      schoolId,
      scholarship,
      duration: parseInt(duration, 10),
      durationPeriod,
      price: parseFloat(price),
      currency,
      acceptanceFee: parseFloat(acceptanceFee),
      acceptanceFeeCurrency,
      description,
      requirements,
    });

    res.status(201).send(newSchool);
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
      acceptanceFeeCurrency,
      description,
      requirements,
    } = req.body;
    const logo = req.file;
    const { id } = req.params;
    // The course ID to be updated
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
      acceptanceFeeCurrency,
      description,
      requirements,
    });
    res.status(200).send(updatedCourse);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while updating the course' });
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
