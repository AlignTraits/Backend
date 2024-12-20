import { NextFunction, Response, Request } from 'express';
import { addToWaitlist } from '../services/waitlistServices';

export const addToWaitlistNow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await addToWaitlist(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
