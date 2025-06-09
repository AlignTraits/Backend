import { Request, Response, NextFunction } from 'express';
import {
  initializeBasicOneTimePayment,
  initializeMonthlySubscription,
  verifySubscriptionPaymentService,
  cancelUserSubscription,
  getUserCards,
  removeCard,
  handleChargeFailed,
  addCardToSubscription,
} from '../services/monthlyPaymentService';
import { createHmac } from 'crypto';
import { getClientIp } from 'request-ip';
import { PaymentPlan } from '@prisma/client';

export const initOneTimePayment = async (
  req: Request,
  res: Response,
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
    const result = await initializeBasicOneTimePayment(
      email,
      firstname,
      lastname,
      schoolLocation,
      paymentPlan as PaymentPlan,
      ip
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const initMonthlySubscription = async (
  req: Request,
  res: Response,
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
    const result = await initializeMonthlySubscription(
      email,
      firstname,
      lastname,
      schoolLocation,
      paymentPlan as PaymentPlan,
      ip
    );
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// This function handles Paystack webhook verification and processes subscription payment events
//  and retries failed charges with another card by calling handleChargeFailed
export const verifyWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res
        .status(401)
        .json({ ok: false, message: 'Invalid webhook signature' });
    }

    const event = req.body;
    if (['charge.success', 'charge.failed'].includes(event.event)) {
      const result = await verifySubscriptionPaymentService(
        event.data.reference,
        event.event
      );

      // For charge.failed, attempt to retry with another card
      if (event.event === 'charge.failed') {
        await handleChargeFailed(event.data.reference);
      }

      return res.status(result.status).json(result);
    }

    res.status(200).json({ ok: true, message: 'Webhook received' });
  } catch (error) {
    next(error);
  }
};

// This function handles Paystack webhook verification and processes subscription payment events
// export const verifyWebhook = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const secret = process.env.PAYSTACK_SECRET_KEY || '';
//     const hash = createHmac('sha512', secret)
//       .update(JSON.stringify(req.body))
//       .digest('hex');

//     if (hash !== req.headers['x-paystack-signature']) {
//       return res
//         .status(401)
//         .json({ ok: false, message: 'Invalid webhook signature' });
//     }

//     const event = req.body;
//     if (['charge.success', 'charge.failed'].includes(event.event)) {
//       const result = await verifySubscriptionPaymentService(
//         event.data.reference,
//         event.event
//       );
//       return res.status(result.status).json(result);
//     }

//     res.status(200).json({ ok: true, message: 'Webhook received' });
//   } catch (error) {
//     next(error);
//   }
// };

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any)?.user?.id ?? '';
    const result = await cancelUserSubscription(userId);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any)?.user?.id ?? '';
    const result = await getUserCards(userId);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any)?.user?.id ?? '';
    const { authorization_code } = req.params;

    if (!authorization_code) {
      return res
        .status(400)
        .json({ ok: false, message: 'authorization_code is required' });
    }

    const result = await removeCard(userId, authorization_code);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const addCardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, amount } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'userId, email, and amount are required',
      });
    }

    const ip = getClientIp(req) || '127.0.0.1';

    const userId = (req as any)?.user?.id ?? '';
    const result = await addCardToSubscription(userId, email, amount);

    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
