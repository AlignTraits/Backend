// src/controllers/userController.ts
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  updatePasswordService,
  getUserDataService,
  updateUserProfileService,
  getUserActivityHistory,
} from '../services/userServices';
import { uploadProfilePicService } from '../services/uploadServices';
import { getUserByEmail } from '../models/userModel';
import { Gender } from '@prisma/client';

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

export const getUserActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getUserActivityHistory((req.user as any)?.id ?? '');
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// Visitors (not logged in) only need to know whether an email already has an
// account, so the site can say "please log in". That is all this returns:
// no profile, results, payments or card details.
const accountExists = async (email: unknown) => {
  if (typeof email !== 'string' || !email.trim() || email.length > 254) {
    return null;
  }
  const user = await getUserByEmail(email.trim());
  return !!user;
};

export const lookupAccount = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const exists = await accountExists(req.body?.email);
    if (exists === null) {
      return res.status(400).json({ ok: false, message: 'Enter a valid email address' });
    }
    return res
      .status(200)
      .json({ ok: exists, message: exists ? 'User found' : 'User not found' });
  } catch (error) {
    next(error);
  }
};

// Old address used by the site before this update. It now gives the same
// yes or no answer as lookupAccount and nothing else. Remove it once the
// updated frontend is live.
export const getUserByEmailData = async (
  req: Request<{ email: string }, MessageResponse>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const exists = await accountExists(req.params.email);
    if (exists === null) {
      return res.status(400).json({ ok: false, message: 'Invalid email parameter' });
    }
    return res
      .status(200)
      .json({ ok: exists, message: exists ? 'User found' : 'User not found' });
  } catch (error) {
    next(error);
  }
};

// Profile fields a person may change about themselves. Everything else
// (role, email, payment plan and expiry, card and subscription codes,
// verification) is ignored, so nobody can give themselves a paid plan.
const PROFILE_TEXT_FIELDS = [
  'firstname',
  'lastname',
  'username',
  'contactNumber',
  'ageRange',
  'region',
  'bio',
  'otherSkill',
] as const;
const GENDERS = Object.values(Gender) as string[];

const pickProfileFields = (data: Record<string, unknown>) => {
  const picked: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const key of PROFILE_TEXT_FIELDS) {
    if (!(key in data)) continue;
    const value = data[key];
    if (value === null && key !== 'firstname' && key !== 'lastname') {
      picked[key] = null;
    } else if (typeof value === 'string' && value.length <= (key === 'bio' ? 2000 : 200)) {
      picked[key] = value.trim();
    } else {
      errors.push(`${key} is not valid`);
    }
  }

  if ('gender' in data) {
    if (data.gender === null || (typeof data.gender === 'string' && GENDERS.includes(data.gender))) {
      picked.gender = data.gender;
    } else {
      errors.push('gender is not valid');
    }
  }

  if ('dob' in data && data.dob !== undefined) {
    if (data.dob === null || typeof data.dob === 'string') picked.dob = data.dob;
    else errors.push('dob is not valid');
  }

  if ('skills' in data && data.skills !== undefined) {
    const list = Array.isArray(data.skills) ? data.skills : [data.skills];
    if (list.every((s) => typeof s === 'string')) picked.skills = list;
    else errors.push('skills is not valid');
  }

  if ('isCareerPathChecked' in data) {
    if (typeof data.isCareerPathChecked === 'boolean') {
      picked.isCareerPathChecked = data.isCareerPathChecked;
    } else {
      errors.push('isCareerPathChecked is not valid');
    }
  }

  return { picked, errors };
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'Update failed',
        errors: [{ message: 'Send the profile fields inside "data"' }],
      });
    }

    const { picked, errors } = pickProfileFields(data);
    if (errors.length) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'Update failed',
        errors: errors.map((message) => ({ message })),
      });
    }

    // Always the logged in person. A userId in the body is ignored, so nobody
    // can edit another student's profile.
    const userId = (req.user as any)?.id ?? '';
    const result = await updateUserProfileService(userId, picked);
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
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = (req.user as any)?.id ?? '';

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.log('Missing required fields:', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return res.status(400).json({
        ok: false,
        message: 'Missing fields',
        // errors: [{ message: 'Current password, new password, and confirmation are required' }],
      });
    }

    console.log('Calling updatePasswordService with userId:', userId);
    const result = await updatePasswordService(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );
    console.log('Service result:', result);
    res.status(result.status).json(result);
  } catch (error) {
    console.error('Controller error:', error);
    next(error);
  }
};

// export const updateUserPassword = async (
//   req: Request,
//   res: Response<MessageResponse | ErrorResponse>,
//   next: NextFunction
// ) => {
//   try {
//     const { newPassword } = req.body;
//     const userId = (req.user as any)?.id ?? '';
//     const result = await updatePasswordService(userId, newPassword);
//     res.status(result.status).json(result);
//   } catch (error) {
//     next(error);
//   }
// };

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
