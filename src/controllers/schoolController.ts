// controllers/schoolController.ts
import { Request, Response } from 'express';
import {
  createCourseService,
  createSchoolService,
} from '../services/schoolService';

export const createSchoolController = async (req: Request, res: Response) => {
  try {
    const { name, schoolType } = req.body;
    const logo = req.file;

    const newSchool = await createSchoolService({ name, schoolType, logo });

    res.status(201).send(newSchool);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while creating the school' });
  }
};

// course
export const createCourseController = async (req: Request, res: Response) => {
  try {
    const {
      title,
      universities,
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
    const parsedUniversities = Array.isArray(universities)
      ? universities
      : JSON.parse(universities);
    const newSchool = await createCourseService({
      title,
      logo,
      universities: parsedUniversities,
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
      .send({ error: 'An error occurred while creating the school' });
  }
};
