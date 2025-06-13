// ```typescript
import express from 'express';

import { loginRequired } from '../../middlewares/auth';
import { submitServerEligibilityAnswers } from '../../controllers/Eligibility/serverEligibilityController';

interface WetrocloudResponse {
  ok: boolean;
  message: string;
  data?: any;
  [key: string]: any;
}

const router = express.Router();

router.post<{}, WetrocloudResponse>(
  '/answers',
  // loginRequired,
  submitServerEligibilityAnswers
);

export default router;
// ```;
