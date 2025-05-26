import express from 'express';
import { loginRequired } from '../middlewares/auth';
import {
  initializeSubscriptionPayment,
  verifyPaymentWebhook,
  //   getTransactionRecords,
} from '../controllers/paymentController';
import MessageResponse from '../types/messageResponse';

const router = express.Router();

// just incase the redirect or callback_url isn't working
router.get('/callback', (req, res) => {
  const { reference, trxref } = req.query;

  // Do something with the reference/trxref...
  return res
    .status(200)
    .json({ message: 'Callback received', reference, trxref });
});

// Initialize payment for a subscription plan
router.post<{}, MessageResponse>(
  '/paystack/subscription',
  loginRequired,
  initializeSubscriptionPayment
);

// Ngrok URLs change every time you restart it (unless you're on a paid plan). So:
// Every time you restart your terminal or Ngrok, update the webhook URL on Paystack.
// Handle Paystack webhook for payment verification
router.post<{}, MessageResponse>('/paystack/webhook', verifyPaymentWebhook);

// webhook
router.post('/webhook', verifyPaymentWebhook);

// Admin: View transaction records
// router.get<{}, MessageResponse>(
//   '/transactions',
//   loginRequired,
//   getTransactionRecords
// );

export default router;
