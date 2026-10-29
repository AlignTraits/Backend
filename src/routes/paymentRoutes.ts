// ```typescript
import express from 'express';
import {
  getTransactionRecords,
  // initializeSubscriptionPayment,
  // verifyPaymentWebhook,
  // handlePaymentCallback,
} from '../controllers/paymentController';
import MessageResponse from '../types/messageResponse';
import { adminLoginRequired } from '../middlewares/auth';

const router = express.Router();

// Initialize payment for a subscription plan
// router.post<{}, MessageResponse>(
//   '/paystack/subscription',
//   initializeSubscriptionPayment
// );
// // Webhook
// router.post('/webhook', verifyPaymentWebhook);
// Every payment ever made, with emails and references: admins only.
router.get('/fetch/transaction', adminLoginRequired, getTransactionRecords);

export default router;
