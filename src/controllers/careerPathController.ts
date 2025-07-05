import { NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  getCareerPathService,
  submitAnswersService,
  submitAnswersServiceServer,
  // getCareerPathService,
} from '../services/careerPathService';

interface WetrocloudResponse {
  career_path?: string;
  reason?: string;
  // Add other possible properties from the response if needed
  [key: string]: any; // This allows for additional properties if the API returns more
}
export const submitCareerAnswers = async (
  req: Request,
  res: Response<WetrocloudResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.id ?? '';
    // const { answers } = req.body;
    const { answers, firstName, lastName, email } = req.body;
    const result = await submitAnswersService(
      answers,
      firstName,
      lastName,
      email
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const submitServerCareerAnswers = async (
  req: Request,
  res: Response<WetrocloudResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const { answers, firstName, lastName, email } = req.body;
    if (!answers || !Array.isArray(answers) || !answers.length) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid or missing answers in request body',
      });
    }
    const result = await submitAnswersServiceServer(
      answers,
      firstName,
      lastName,
      email
    );
    res.status(result.status || 200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCareerPath = async (
  req: Request,
  res: Response<WetrocloudResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.id ?? '';
    const result = await getCareerPathService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
