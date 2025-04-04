import { NextFunction, Request, Response } from 'express';
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
  getAllHistoryService,
  getAdminDashboardService,
} from '../services/schoolService';
import { DurationPeriod, Currency } from '@prisma/client';
// import { SessionRequest } from '../types/sessionRequest';

export const createSchoolController = async (req: Request, res: Response) => {
  try {
    const { name, schoolType, region, country, websiteUrl } = req.body;
    const logo = req.file;

    const userId = (req as any)?.user?.id ?? '';
    const newSchool = await createSchoolService({
      name,
      schoolType,
      logo,
      region,
      country,
      websiteUrl,
      userId,
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

export const createCourseController = async (req: Request, res: Response) => {
  try {
    const {
      title,
      schoolId,
      scholarship,
      scholarshipInformation,
      duration,
      durationPeriod,
      price,
      currency,
      acceptanceFee,
      acceptanceFeeCurrency,
      objectives,
      courseWebsiteUrl,
      programLevel,
      loanInformation,
      ratings, // Add ratings since it's in the model
    } = req.body;
    const logo = req.file;

    // Validate required fields
    if (!title) {
      return res.status(400).send({ error: 'Title is required' });
    }
    if (!schoolId) {
      return res.status(400).send({ error: 'School ID is required' });
    }
    if (!scholarship) {
      return res.status(400).send({ error: 'Scholarship is required' });
    }
    if (!duration || isNaN(parseInt(duration, 10))) {
      return res.status(400).send({
        error: 'Duration is required and must be a valid number',
      });
    }
    if (!durationPeriod) {
      return res.status(400).send({ error: 'Duration period is required' });
    }
    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).send({
        error: 'Price is required and must be a valid number',
      });
    }
    if (!currency) {
      return res.status(400).send({ error: 'Currency is required' });
    }
    if (!acceptanceFee || isNaN(parseFloat(acceptanceFee))) {
      return res.status(400).send({
        error: 'Acceptance fee is required and must be a valid number',
      });
    }
    if (!acceptanceFeeCurrency) {
      return res.status(400).send({
        error: 'Acceptance fee currency is required',
      });
    }
    if (!objectives) {
      return res.status(400).send({ error: 'Objectives are required' });
    }
    if (!courseWebsiteUrl) {
      return res.status(400).send({ error: 'Course website URL is required' });
    }
    if (!programLevel) {
      return res.status(400).send({ error: 'Program level is required' });
    }
    if (!loanInformation) {
      return res.status(400).send({ error: 'Loan information is required' });
    }
    if (
      ratings &&
      (isNaN(parseFloat(ratings)) ||
        parseFloat(ratings) < 0 ||
        parseFloat(ratings) > 5)
    ) {
      return res.status(400).send({
        error: 'Ratings must be a valid number between 0 and 5 if provided',
      });
    }

    // Map durationPeriod to Prisma's DurationPeriod
    let mappedDurationPeriod: DurationPeriod;
    if (durationPeriod === 'YEARS') {
      mappedDurationPeriod = DurationPeriod.YEARS;
    } else if (durationPeriod === 'MONTHS') {
      mappedDurationPeriod = DurationPeriod.MONTHS;
    } else if (durationPeriod === 'WEEKS') {
      mappedDurationPeriod = DurationPeriod.WEEKS;
    } else {
      return res.status(400).send({
        error: 'Invalid duration period. Must be "YEARS", "MONTHS", or "WEEKS"',
      });
    }

    // Map currency to Prisma's Currency
    let mappedCurrency: Currency;
    if (currency === 'NGN') {
      mappedCurrency = Currency.NGN;
    } else if (currency === 'USD') {
      mappedCurrency = Currency.USD;
    } else if (currency === 'EUR') {
      mappedCurrency = Currency.EUR;
    } else {
      return res.status(400).send({
        error: 'Invalid currency. Must be "NGN", "USD", or "EUR"',
      });
    }

    // Map acceptanceFeeCurrency to Prisma's Currency
    let mappedAcceptanceFeeCurrency: Currency;
    if (acceptanceFeeCurrency === 'NGN') {
      mappedAcceptanceFeeCurrency = Currency.NGN;
    } else if (acceptanceFeeCurrency === 'USD') {
      mappedAcceptanceFeeCurrency = Currency.USD;
    } else if (acceptanceFeeCurrency === 'EUR') {
      mappedAcceptanceFeeCurrency = Currency.EUR;
    } else {
      return res.status(400).send({
        error:
          'Invalid acceptance fee currency. Must be "NGN", "USD", or "EUR"',
      });
    }

    const userId = (req as any)?.user?.id ?? '';
    const newCourse = await createCourseService({
      title,
      logo,
      schoolId,
      scholarship,
      scholarshipInformation,
      duration: parseInt(duration, 10),
      durationPeriod: mappedDurationPeriod,
      price: parseFloat(price),
      currency: mappedCurrency,
      acceptanceFee: parseFloat(acceptanceFee),
      acceptanceFeeCurrency: mappedAcceptanceFeeCurrency,
      objectives,
      courseWebsiteUrl,
      programLevel,
      loanInformation,
      ratings: ratings ? parseFloat(ratings) : undefined,
      userId,
    });

    res.status(newCourse.status).send(newCourse);
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
      scholarshipInformation,
      duration,
      durationPeriod,
      price,
      currency,
      acceptanceFee,
      acceptanceFeeCurrency,
      objectives,
      courseWebsiteUrl,
      programLevel,
      loanInformation,
      ratings,
    } = req.body;
    const logo = req.file;
    const { id } = req.params;

    // Validate numeric fields if provided
    if (duration && isNaN(parseInt(duration, 10))) {
      return res.status(400).send({
        error: 'Duration must be a valid number if provided',
      });
    }
    if (price && isNaN(parseFloat(price))) {
      return res.status(400).send({
        error: 'Price must be a valid number if provided',
      });
    }
    if (acceptanceFee && isNaN(parseFloat(acceptanceFee))) {
      return res.status(400).send({
        error: 'Acceptance fee must be a valid number if provided',
      });
    }
    if (
      ratings &&
      (isNaN(parseFloat(ratings)) ||
        parseFloat(ratings) < 0 ||
        parseFloat(ratings) > 5)
    ) {
      return res.status(400).send({
        error: 'Ratings must be a valid number between 0 and 5 if provided',
      });
    }

    // Map durationPeriod to Prisma's DurationPeriod if provided
    let mappedDurationPeriod: DurationPeriod | undefined;
    if (durationPeriod) {
      if (durationPeriod === 'YEARS') {
        mappedDurationPeriod = DurationPeriod.YEARS;
      } else if (durationPeriod === 'MONTHS') {
        mappedDurationPeriod = DurationPeriod.MONTHS;
      } else if (durationPeriod === 'WEEKS') {
        mappedDurationPeriod = DurationPeriod.WEEKS;
      } else {
        return res.status(400).send({
          error:
            'Invalid duration period. Must be "YEARS", "MONTHS", or "WEEKS"',
        });
      }
    }

    // Map currency to Prisma's Currency if provided
    let mappedCurrency: Currency | undefined;
    if (currency) {
      if (currency === 'NGN') {
        mappedCurrency = Currency.NGN;
      } else if (currency === 'USD') {
        mappedCurrency = Currency.USD;
      } else if (currency === 'EUR') {
        mappedCurrency = Currency.EUR;
      } else {
        return res.status(400).send({
          error: 'Invalid currency. Must be "NGN", "USD", or "EUR"',
        });
      }
    }

    // Map acceptanceFeeCurrency to Prisma's Currency if provided
    let mappedAcceptanceFeeCurrency: Currency | undefined;
    if (acceptanceFeeCurrency) {
      if (acceptanceFeeCurrency === 'NGN') {
        mappedAcceptanceFeeCurrency = Currency.NGN;
      } else if (acceptanceFeeCurrency === 'USD') {
        mappedAcceptanceFeeCurrency = Currency.USD;
      } else if (acceptanceFeeCurrency === 'EUR') {
        mappedAcceptanceFeeCurrency = Currency.EUR;
      } else {
        return res.status(400).send({
          error:
            'Invalid acceptance fee currency. Must be "NGN", "USD", or "EUR"',
        });
      }
    }

    const userId = (req as any)?.user?.id ?? '';
    const updatedCourse = await updateCourseService({
      userId,
      id,
      title,
      logo,
      schoolId,
      scholarship,
      scholarshipInformation,
      duration: duration ? parseInt(duration, 10) : undefined,
      durationPeriod: mappedDurationPeriod,
      price: price ? parseFloat(price) : undefined,
      currency: mappedCurrency,
      acceptanceFee: acceptanceFee ? parseFloat(acceptanceFee) : undefined,
      acceptanceFeeCurrency: mappedAcceptanceFeeCurrency,
      objectives,
      courseWebsiteUrl,
      programLevel,
      loanInformation,
      ratings: ratings ? parseFloat(ratings) : undefined,
    });
    res.status(updatedCourse.status).send(updatedCourse);
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
    const userId = (req as any)?.user?.id ?? '';
    await deleteCourseService(id, userId);
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
    const { name, schoolType, region, country, websiteUrl } = req.body;
    const logo = req.file;

    const userId = (req as any)?.user?.id ?? '';
    const updatedSchool = await updateSchoolService({
      userId,
      id,
      name,
      schoolType,
      logo,
      country,
      region,
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
    const userId = (req as any)?.user?.id ?? '';
    const deletedSchoolDetails = await deleteSchoolsService(schoolId, userId);
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

// get allhistory
export const getAllHistoryController = async (req: Request, res: Response) => {
  try {
    const history = await getAllHistoryService();
    res.status(200).send(history);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching the courses' });
  }
};

// New controller for Admin Dashboard
export const getAdminDashboard = async (
  // req: SessionRequest,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, location, export: exportFormat } = req.query;
    const result = await getAdminDashboardService({
      startDate: startDate as string,
      endDate: endDate as string,
      location: location as string,
      exportFormat: exportFormat as string,
    });
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
