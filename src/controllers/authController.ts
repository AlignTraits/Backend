// src/controllers/authController.ts
import { NextFunction, Request, Response } from 'express';
import {
  loginService,
  registerService,
  validateTokenService,
  requestResetService,
  resetPasswordService,
  // admin auth service
  loginAdminService,
  registerAdminService,
  addAdminPasswordService,
  updateAdminPasswordService,
  updateAdminProfileService,
} from '../services/authService';
import {
  getAdminDataService,
  getUserDataService,
} from '../services/userServices';

const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginAdminService(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await registerAdminService(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const AddAdminPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await addAdminPasswordService(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const getAdmindetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAdminDataService((req.user as any)?.id ?? '');
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// admin auth ends here

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
  next: NextFunction
) => {
  try {
    const result = await validateTokenService(
      req.query as { email: string; token: string }
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const requestReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    console.log(email);
    const result = await requestResetService(email);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await resetPasswordService(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// New controller: Update Admin Profile
const updateAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await updateAdminProfileService(
      (req.user as any)?.id ?? '',
      req.body
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// New controller: Update Admin Password
const updateAdminPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await updateAdminPasswordService(
      (req.user as any)?.id ?? '',
      req.body
    );
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
  // admin auth controller
  loginAdmin,
  registerAdmin,
  AddAdminPassword,
  getAdmindetails,
  updateAdminPassword,
  updateAdminProfile,
};
