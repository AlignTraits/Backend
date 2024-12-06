import express from 'express';
import {
  createAnswerOption,
  getAnswerOptions,
  createUserResponse,
  getUserResponses,
  createQuestion,
  getQuestions,
} from '../controllers/surveyController';
import MessageResponse from '../types/messageResponse';
import { loginRequired } from '../middlewares/auth';

const router = express.Router();

// AnswerOption routes
router.post<{}, MessageResponse>(
  '/answer-options',
  loginRequired,
  createAnswerOption
);
router.get<{}, MessageResponse>(
  '/answer-options',
  loginRequired,
  getAnswerOptions
);

// UserResponse routes
router.post<{}, MessageResponse>(
  '/user-responses',
  loginRequired,
  createUserResponse
);
router.get<{}, MessageResponse>(
  '/user-responses',
  loginRequired,
  getUserResponses
);

// Question routes
router.post<{}, MessageResponse>('/questions', loginRequired, createQuestion);
router.get<{}, MessageResponse>('/questions', loginRequired, getQuestions);

export default router;
