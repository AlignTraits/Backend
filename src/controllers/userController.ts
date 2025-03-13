// src/controllers/userController.ts
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  updatePasswordService,
  getUserDataService,
  updateUserProfileService,
} from '../services/userServices';
import { uploadProfilePicService } from '../services/uploadServices';

dotenv.config();

export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getUserDataService((req.user as any)?.id ?? '');
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      data: {
        id,
        image,
        email,
        updatedAt,
        createdAt,
        emailVerified,
        role,
        ...filteredData
      },
    } = req.body; // use join to filter out unwanted data
    const userId = req.body.userId ?? (req.user as any)?.id ?? '';
    const result = await updateUserProfileService(userId, filteredData);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUserPassword = async (
  req: Request,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const { newPassword } = req.body;
    const userId = (req.user as any)?.id ?? '';
    const result = await updatePasswordService(userId, newPassword);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const uploadUserPicture = async (
  req: Request,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.id ?? '';
    const result = await uploadProfilePicService(userId, req.file);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
