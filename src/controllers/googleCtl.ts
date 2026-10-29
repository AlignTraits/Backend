// src/controllers/googleCtl.ts
import { NextFunction, Request, Response } from 'express';
import {
  createGoogleLoginCode,
  exchangeGoogleLoginCodeService,
} from '../services/googleAuthService';

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
    // Send a one time code, never the login token, in the address. The code
    // sits after # so it is not sent to any server, and the site swaps it for
    // the token with POST /google-auth/exchange.
    const code = await createGoogleLoginCode((user as any).id);
    res.redirect(`${process.env.WEBSITE_URL}/auth/success#code=${code}`);
  } catch (error) {
    next(error);
  }
};

const exchangeGoogleLoginCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await exchangeGoogleLoginCodeService(req.body?.code);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  googleAuthCallback,
  exchangeGoogleLoginCode,
};
