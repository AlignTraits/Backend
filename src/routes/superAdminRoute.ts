import express from 'express';
import {
  adminLoginRequired,
  preventLoggedUser,
  superAdminLoginRequired,
} from '../middlewares/auth';
import superAdminController from '../controllers/superAdminCtl';
import MessageResponse from '../types/messageResponse';
import { NextFunction, Request, Response } from 'express';

const router = express.Router();

// New routes for Admin Profile Management CRUD
router.post<{}, MessageResponse>(
  '/admin/profiles',
  superAdminLoginRequired,
  superAdminController.createAdminProfile
);
router.patch<{ id: string }, MessageResponse>(
  '/admin/profiles/:id',
  superAdminLoginRequired,
  superAdminController.updateAdminProfile
);
router.delete<{ id: string }, MessageResponse>(
  '/admin/profiles/:id',
  superAdminLoginRequired,
  superAdminController.deleteAdminProfile
);

router.get<{ id: string }, MessageResponse>(
  '/admin/profiles/:id',
  superAdminLoginRequired,
  superAdminController.getAdminById
);

router.get<{}, MessageResponse>(
  '/admin/profiles',
  superAdminLoginRequired,
  superAdminController.listAdmins
);

export default router;
