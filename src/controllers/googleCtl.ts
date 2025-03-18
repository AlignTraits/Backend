// src/controllers/googleCtl.ts
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
    const result = await googleAuthCallbackService(user); // No type assertion needed here

    if (result.ok && result.data && 'token' in result.data) {
      // Extract the token from the data object
      const token = result.data.token as string;
      // Redirect to frontend with the token in the query string
      const frontendSuccessUrl = `${process.env.WEBSITE_URL}/auth/success?token=${encodeURIComponent(token)}`;
      res.redirect(frontendSuccessUrl);
      // res.status(result.status).json(result)
    } else {
      // Redirect to error page if authentication fails
      res.redirect(`${process.env.WEBSITE_URL}/auth/error`);
    }
  } catch (error) {
    next(error);
  }
};

export default {
  googleAuthCallback,
};
