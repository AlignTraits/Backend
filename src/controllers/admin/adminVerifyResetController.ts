import { Request, Response, NextFunction } from 'express';
import { verifyAdminResetTokenService } from '../../services/admin/adminPasswordResetService';
import MessageResponse from '../../types/messageResponse';

const verifyAdminResetToken = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const { email, token } = req.query as { email: string; token: string };
    if (!email || !token) {
      return res.status(400).json({
        ok: false,
        message: 'Email and token are required',
      });
    }

    const result = await verifyAdminResetTokenService({ email, token });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      message: error.message || 'Token verification failed',
    });
  }
};

export default verifyAdminResetToken;
