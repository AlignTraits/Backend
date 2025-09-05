// src/controllers/authController.ts (super admin profile management)
import { NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import {
  createAdminProfileService,
  deleteAdminProfileService,
  getAdminByIdService,
  getUserDetailsByAdminService,
  getUsersByAdminService,
  getWaitListByAdminService,
  listAdminsService,
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

// Get one admin/profile by ID (not regular user)
const getAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAdminByIdService(req.params.id);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// Get all admins (not regular users)
const listAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listAdminsService();
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// get users and wait list by admin
const getUsersByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getUsersByAdminService();
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// get waitlist users by admin
const getWaitListByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getWaitListByAdminService();
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

const getUserDetailsByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getUserDetailsByAdminService();
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export = {
  createAdminProfile,
  updateAdminProfile,
  deleteAdminProfile,
  listAdmins,
  getAdminById,
  getUsersByAdmin,
  getWaitListByAdmin,
  getUserDetailsByAdmin,
};
