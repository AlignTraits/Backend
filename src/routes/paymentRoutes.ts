// ```typescript
import express from 'express';
import {
  getTransactionRecords,
  // initializeSubscriptionPayment,
  // verifyPaymentWebhook,
  // handlePaymentCallback,
} from '../controllers/paymentController';
import MessageResponse from '../types/messageResponse';

const router = express.Router();

// Initialize payment for a subscription plan
// router.post<{}, MessageResponse>(
//   '/paystack/subscription',
//   initializeSubscriptionPayment
// );
// // Webhook
// router.post('/webhook', verifyPaymentWebhook);
// Callback
router.get('/fetch/transaction', getTransactionRecords);

export default router;
