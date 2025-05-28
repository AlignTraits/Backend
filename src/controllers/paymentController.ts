import { Request, Response, NextFunction } from 'express';
import MessageResponse from '../types/messageResponse';
import ErrorResponse from '../types/errorResponse';
import {
  initializeSubscriptionPaymentService,
  verifySubscriptionPaymentService,
} from '../services/paymentServices';
import { createHmac } from 'crypto';
import { getClientIp } from 'request-ip';
import { Roles } from '@prisma/client';

export const initializeSubscriptionPayment = async (
  req: Request,
  res: Response<MessageResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const { email, firstname, lastname, schoolLocation, paymentPlan } =
      req.body;
    if (!email || !firstname || !lastname || !schoolLocation || !paymentPlan) {
      return res.status(400).json({
        ok: false,
        message:
          'Email, firstname, lastname, schoolLocation, and paymentPlan are required',
      });
    }

    const ip = getClientIp(req) || '127.0.0.1';
    console.log(
      `Client IP: ${ip}, Headers: ${JSON.stringify(req.headers['x-forwarded-for'] || 'none')}, Remote: ${req.socket.remoteAddress}`
    );

    const result = await initializeSubscriptionPaymentService(
      email,
      firstname,
      lastname,
      schoolLocation,
      paymentPlan,
      ip
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
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid webhook signature:', {
        received: req.headers['x-paystack-signature'],
        expected: hash,
      });
      return res.status(401).json({
        ok: false,
        message: 'Invalid webhook signature',
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
        message: 'Webhook received',
      });
    }
  } catch (error) {
    console.error('Error in verifyPaymentWebhook:', error);
    next(error);
  }
};

// export const handlePaymentCallback = async (req: Request, res: Response) => {
//   try {
//     const { reference } = req.query;
//     console.log(`Callback received for reference: ${reference}`);
//     res.redirect('https://your-frontend-url.com/payment-success'); // Replace with actual frontend URL
//   } catch (error) {
//     console.error('Error in handlePaymentCallback:', error);
//     res.redirect('https://your-frontend-url.com/payment-failure');
//   }
// };

// working with logged in users controller

// export const initializeSubscriptionPayment = async (
//   req: Request,
//   res: Response<MessageResponse | ErrorResponse>,
//   next: NextFunction
// ) => {
//   try {
//     const userId = (req.user as any)?.id ?? '';
//     const { paymentPlan } = req.body; // e.g., 'BASIC_ONETIME'
//     const result = await initializeSubscriptionPaymentService(
//       userId,
//       paymentPlan
//     );
//     res.status(result.status).json(result);
//   } catch (error) {
//     next(error);
//   }
// };

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
