// src/controllers/userController.ts
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  updatePasswordService,
  getUserDataService,
  updateUserProfileService,
  getUserByEmailService,
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

export const getUserByEmailData = async (
  req: Request<{ email: string }, MessageResponse>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const { email } = req.params;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      ok: false,
      // status: 400,
      message: 'Invalid email parameter',
    });
  }

  try {
    const result = await getUserByEmailService(email);
    // Set status code explicitly, e.g., 200 for success, or handle error cases as needed
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getUserByEmailData:', error);
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
