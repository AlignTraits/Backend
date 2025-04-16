import express from 'express';
import { loginRequired } from '../middlewares/auth';
import {
  submitCareerAnswers,
  getCareerPath,
} from '../controllers/careerPathController';
import MessageResponse from '../types/messageResponse';

const router = express.Router();

router.post<{}, MessageResponse>(
  '/answers',
  loginRequired,
  submitCareerAnswers
);

router.get<{}, MessageResponse>('/', loginRequired, getCareerPath);

export default router;
