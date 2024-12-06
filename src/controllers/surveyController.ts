import { NextFunction, Request, Response } from 'express';
import * as surveyModel from '../models/surveyModel';
import { SessionRequest } from '../types/sessionRequest';
import {
  createAnswerOptionService,
  createQuestionService,
  createUserResponseService,
  getAnswerOptionsService,
  getQuestion,
  getUserResponseService,
} from '../services/surveryService';

// Create a new AnswerOption
export const createAnswerOption = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = createAnswerOptionService(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get all AnswerOptions
export const getAnswerOptions = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAnswerOptionsService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Create a new UserResponse
export const createUserResponse = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createUserResponseService(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get all UserResponses
export const getUserResponses = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getUserResponseService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Create a new Question
export const createQuestion = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text, sectionId } = req.body;
    const result = await createQuestionService(req.body);
    res.status(200).json(XPathResult);
  } catch (error) {
    next(error);
  }
};

// Get all Questions
export const getQuestions = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const questions = await surveyModel.getQuestions();
    const result = await getQuestion();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
