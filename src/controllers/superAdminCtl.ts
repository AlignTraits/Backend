// src/controllers/authController.ts (super admin profile management)
import { NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import {
  createAdminProfileService,
  deleteAdminProfileService,
  updateAdminProfileService,
} from '../services/superAdminServices';

const createAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!(req.user as any)?.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }
    const result = await createAdminProfileService(
      (req.user as any).id,
      req.body
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const updateAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!(req.user as any)?.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }
    const result = await updateAdminProfileService(
      (req.user as any).id,
      req.params.id,
      req.body
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!(req.user as any)?.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }
    const result = await deleteAdminProfileService(
      (req.user as any).id,
      req.params.id
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export = {
  createAdminProfile,
  updateAdminProfile,
  deleteAdminProfile,
};
