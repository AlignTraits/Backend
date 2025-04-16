import express from 'express';
import { preventLoggedUser } from '../../middlewares/auth';
import requestAdminReset from '../../controllers/admin/adminRequestResetController';
import verifyAdminResetToken from '../../controllers/admin/adminVerifyResetController';
import resetAdminPassword from '../../controllers/admin/adminResetPasswordController';
import MessageResponse from '../../types/messageResponse';

const router = express.Router();

router.post<{}, MessageResponse>(
  '/request-reset',
  preventLoggedUser,
  requestAdminReset
);

router.get<{}, MessageResponse>(
  '/verify-reset',
  preventLoggedUser,
  verifyAdminResetToken
);

router.put<{}, MessageResponse>(
  '/reset-password',
  preventLoggedUser,
  resetAdminPassword
);

export default router;
