import { Request, Response, NextFunction } from 'express';
import { requestAdminResetService } from '../../services/admin/adminPasswordResetService';
import MessageResponse from '../../types/messageResponse';

const requestAdminReset = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required',
      });
    }

    const result = await requestAdminResetService(email);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      message: error.message || 'Admin Password Reset Request failed',
    });
  }
};

export default requestAdminReset;
