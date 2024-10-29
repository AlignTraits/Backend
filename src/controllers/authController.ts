import { Application, NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import {
  loginService,
  registerService,
  validateTokenService,
  requestResetService,
  resetPasswordService,
} from '../services/authService';
// import ErrorResponse from '../types/errorResponse';

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginService(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerService(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await validateTokenService(
      req.query as { email: string; token: string },
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const requestReset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await requestResetService(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await resetPasswordService(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export = {
  login,
  register,
  validateToken,
  requestReset,
  resetPassword,
};
