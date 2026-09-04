import { Request, Response, NextFunction } from 'express';
import { createFeedback } from '../services/feedbackService';

interface FeedbackResponse {
  ok: boolean;
  data?: unknown;
}

export const submitFeedback = async (
  req: Request,
  res: Response<FeedbackResponse>,
  next: NextFunction
) => {
  try {
    const { isClear, message } = req.body;
    const email = (req.user as any)?.email ?? '';

    const result = await createFeedback({
      isSatisfied: !!isClear,
      suggestion: message,
      emailAddress: email,
    });

    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
