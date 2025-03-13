import { NextFunction, Request, Response } from 'express';
import { googleAuthCallbackService } from '../services/googleAuthService';

const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const result = await googleAuthCallbackService(user as any); // Temporary type assertion
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  googleAuthCallback,
};
