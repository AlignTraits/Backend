import dotenv from 'dotenv';
import { getUserById, updateUser } from '../models/userModel';
import { NextFunction, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  updatePasswordService,
  getUserDataService,
  updateUserProfileService,
} from '../services/userServices';
import { SessionRequest } from '../types/sessionRequest';
import { uploadProfilePicService } from '../services/uploadServices';

dotenv.config();

export const getUserData = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getUserDataService(req.user?.id ?? '');
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction,
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
    const userId = req.body.userId ?? req.user?.id ?? '';
    const result = await updateUserProfileService(userId, filteredData);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUserPassword = async (
  req: SessionRequest,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction,
) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.id ?? '';
    const result = await updatePasswordService(userId, newPassword);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const uploadUserPicture = async (
  req: SessionRequest,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction,
) => {
  try {
    const userId = req?.user?.id ?? '';
    const result = await uploadProfilePicService(userId, req.file);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
