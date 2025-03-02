import express from 'express';
import { adminLoginRequired, preventLoggedUser } from '../middlewares/auth';
import authController from '../controllers/authController';
import MessageResponse from '../types/messageResponse';
import { NextFunction, Request, Response } from 'express';

const router = express.Router();

router.post<{}, MessageResponse>(
  '/register',
  preventLoggedUser,
  authController.register
);

router.post<{}, MessageResponse>(
  '/login',
  preventLoggedUser,
  authController.login
);

router.post<{}, MessageResponse>(
  '/request-reset',
  preventLoggedUser,
  authController.requestReset
);

router.get<{}, MessageResponse>(
  '/verification',
  preventLoggedUser,
  authController.validateToken
);

router.put<{}, MessageResponse>(
  '/reset-password',
  preventLoggedUser,
  authController.resetPassword
);

// admin login route section

router.post<{}, MessageResponse>(
  '/admin/login',
  preventLoggedUser,
  authController.loginAdmin
);

router.post<{}, MessageResponse>(
  '/admin/register',
  preventLoggedUser,
  authController.registerAdmin
);

router.get<{}, MessageResponse>(
  '/admin/details',
  adminLoginRequired,
  authController.getAdmindetails
);

router.patch<{}, MessageResponse>(
  '/admin/add-password',
  authController.AddAdminPassword
);

// New routes for profile and password management
router.patch<{}, MessageResponse>(
  '/admin/profile',
  adminLoginRequired,
  authController.updateAdminProfile
);

router.patch<{}, MessageResponse>(
  '/admin/password',
  adminLoginRequired,
  authController.updateAdminPassword
);

export default router;
