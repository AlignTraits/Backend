import { Request, Response, NextFunction } from 'express';
import { resetAdminPasswordService } from '../../services/admin/adminPasswordResetService';
import MessageResponse from '../../types/messageResponse';

const resetAdminPassword = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;
    if (!email || !token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: 'All fields are required',
      });
    }

    const result = await resetAdminPasswordService({
      email,
      token,
      newPassword,
      confirmPassword,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      message: error.message || 'Password Reset failed',
    });
  }
};

export default resetAdminPassword;
