import { NextFunction, Request, Response } from 'express';
import { submitAmbassador, submitPilot } from '../services/formsService';

export const ambassadorApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await submitAmbassador(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const pilotRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await submitPilot(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
