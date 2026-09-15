import express from 'express';
import { loginRequired } from '../middlewares/auth';
import {
  getUserData,
  updateUserProfile,
  uploadUserPicture,
  updateUserPassword,
  getUserByEmailData,
  getUserActivity,
} from '../controllers/userController';
import MessageResponse from '../types/messageResponse';
import { upload } from '../services/uploadServices';

const router = express.Router();

router.get<{}, MessageResponse>('/', loginRequired, getUserData);

router.get<{}, MessageResponse>('/activity', loginRequired, getUserActivity);

router.get<{ email: string }, MessageResponse>(
  '/email/:email',
  getUserByEmailData
);

router.patch<{}, MessageResponse>('/', loginRequired, updateUserProfile);

router.patch<{}, MessageResponse>(
  '/picture',
  loginRequired,
  upload.single('profile'),
  uploadUserPicture
);

router.patch<{}, MessageResponse>(
  '/password',
  loginRequired,
  updateUserPassword
);

export default router;
