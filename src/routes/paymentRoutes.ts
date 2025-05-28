// ```typescript
import express from 'express';
import {
  initializeSubscriptionPayment,
  verifyPaymentWebhook,
  // handlePaymentCallback,
} from '../controllers/paymentController';
import MessageResponse from '../types/messageResponse';

const router = express.Router();

// Initialize payment for a subscription plan
router.post<{}, MessageResponse>(
  '/paystack/subscription',
  initializeSubscriptionPayment
);
// Webhook
router.post('/webhook', verifyPaymentWebhook);
// Callback
// router.get('/callback', handlePaymentCallback);

export default router;
// ```

// import express from 'express';
// import {
//   initializeSubscriptionPayment,
//   verifyPaymentWebhook,
// } from '../controllers/paymentController';
// import MessageResponse from '../types/messageResponse';

// const router = express.Router();

// // Initialize payment for a subscription plan
// router.post<{}, MessageResponse>(
//   '/paystack/subscription',

//   initializeSubscriptionPayment
// );
// // webhook
// router.post('/webhook', verifyPaymentWebhook);

// router.get('/callback', (req, res) => {
//   const { reference, trxref } = req.query;

//   // Do something with the reference/trxref...
//   return res
//     .status(200)
//     .json({ message: 'Callback received', reference, trxref });
// });

// export default router;
