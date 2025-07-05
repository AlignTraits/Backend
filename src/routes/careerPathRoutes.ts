import express from 'express';
import { loginRequired } from '../middlewares/auth';
import {
  submitCareerAnswers,
  getCareerPath,
  submitServerCareerAnswers,
} from '../controllers/careerPathController';
// import MessageResponse from '../types/messageResponse';
interface WetrocloudResponse {
  career_path?: string;
  reason?: string;
  // Add other possible properties from the response if needed
  [key: string]: any; // This allows for additional properties if the API returns more
}

const router = express.Router();

router.post<{}, WetrocloudResponse>('/answers', submitCareerAnswers);

router.post<{}, WetrocloudResponse>(
  '/answers/server',
  submitServerCareerAnswers
);

router.get<{}, WetrocloudResponse>('/', loginRequired, getCareerPath);

export default router;
