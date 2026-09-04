import express from 'express';
import { loginRequired } from '../middlewares/auth';
import { submitFeedback } from '../controllers/feedbackController';

const router = express.Router();

router.post('/', loginRequired, submitFeedback);

export default router;
