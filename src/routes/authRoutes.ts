import express from 'express';
import { preventLoggedUser } from '../middlewares/auth';
import authController from '../controllers/authController';
import MessageResponse from '../types/messageResponse';
import { NextFunction, Request, Response } from 'express';

const router = express.Router();

router.post<{}, MessageResponse>(
  '/register',
  preventLoggedUser,
  authController.register,
);

router.post<{}, MessageResponse>(
  '/login',
  preventLoggedUser,
  authController.login,
);

router.post<{}, MessageResponse>(
  '/request-reset',
  preventLoggedUser,
  authController.requestReset,
);

router.get<{}, MessageResponse>(
  '/verification',
  preventLoggedUser,
  authController.validateToken,
);

router.put<{}, MessageResponse>(
  '/reset-password',
  preventLoggedUser,
  authController.resetPassword,
);

export default router;
