import { NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  submitAnswersService,
  getCareerPathService,
} from '../services/careerPathService';

export const submitCareerAnswers = async (
  req: Request,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.id ?? '';
    const { answers } = req.body;
    const result = await submitAnswersService(userId, answers);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCareerPath = async (
  req: Request,
  res: Response<MessageResponse | ErrorResponse>,
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
