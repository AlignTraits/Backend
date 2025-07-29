// ```typescript
import express from 'express';

import {
  submitEligibilityAnswers,
  // getEligibilityResults,
} from '../controllers/eligibiltyCtrl';

interface WetrocloudResponse {
  ok: boolean;
  message: string;
  data?: any;
  [key: string]: any;
}

const router = express.Router();

router.post<{}, WetrocloudResponse>('/answer', submitEligibilityAnswers);

// router.get<{}, WetrocloudResponse>('/', loginRequired, getEligibilityResults);

export default router;
// ```
