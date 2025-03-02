import { Application, NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';

import { SessionRequest } from '../types/sessionRequest';
import {
  createAdminProfileService,
  deleteAdminProfileService,
  updateAdminProfileService,
} from '../services/superAdminServices';
// import ErrorResponse from '../types/errorResponse';
// / New controllers for Admin Profile Management
const createAdminProfile = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }
    const result = await createAdminProfileService(req.user.id, req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const updateAdminProfile = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }
    const result = await updateAdminProfileService(
      req.user.id,
      req.params.id,
      req.body
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteAdminProfile = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }
    const result = await deleteAdminProfileService(req.user.id, req.params.id);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export = {
  createAdminProfile, // New
  updateAdminProfile, // New
  deleteAdminProfile, // New
};
