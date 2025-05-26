import { Request, Response, NextFunction } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  initializeSubscriptionPaymentService,
  verifySubscriptionPaymentService,
  getTransactionRecordsService,
} from '../services/paymentServices';
import { createHmac } from 'crypto';
import { Roles } from '@prisma/client';

export const initializeSubscriptionPayment = async (
  req: Request,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.id ?? '';
    const { paymentPlan } = req.body; // e.g., 'BASIC_ONETIME'
    const result = await initializeSubscriptionPaymentService(
      userId,
      paymentPlan
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyPaymentWebhook = async (
  req: Request,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    // Verify Paystack webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({
        ok: false,
        // status: 401,
        message: 'Invalid webhook signature',
        // errors: [{ message: 'Webhook signature verification failed' }],
      });
    }

    const event = req.body;
    if (event.event === 'charge.success' || event.event === 'charge.failed') {
      const reference = event.data.reference;
      const result = await verifySubscriptionPaymentService(
        reference,
        event.event
      );
      res.status(result.status).json(result);
    } else {
      res.status(200).json({
        ok: true,
        // status: 200,
        message: 'Webhook received',
      });
    }
  } catch (error) {
    next(error);
  }
};

// export const getTransactionRecords = async (
//   req: Request,
//   res: Response<MessageResponse | ErrorResponse>,
//   next: NextFunction
// ) => {
//   try {
//     const userId = (req.user as any)?.id ?? '';
//     const user = await (
//       await import('../models/userModel')
//     ).getUserById(userId);
//     if (!user || user.role !== Roles.ADMIN) {
//       return res.status(403).json({
//         ok: false,
//         status: 403,
//         message: 'Unauthorized',
//         errors: [{ message: 'Only admins can view transaction records' }],
//       });
//     }

//     const result = await getTransactionRecordsService();
//     res.status(result.status).json(result);
//   } catch (error) {
//     next(error);
//   }
// };
