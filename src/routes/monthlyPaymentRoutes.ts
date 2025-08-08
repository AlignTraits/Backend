import { Router } from 'express';
import {
  initOneTimePayment,
  initMonthlySubscription,
  verifyWebhook,
  cancelSubscription,
  getCards,
  deleteCard,
  addCardController,
  addDirectDebitController,
} from '../controllers/monthlyPaymentCtl';

import { loginRequired } from '../middlewares/auth';
const router = Router();

// For one-time basic payments
router.post('/paystack/basic', initOneTimePayment);

// For monthly recurring subscription payments
router.post('/paystack/subscription', initMonthlySubscription);

// This route cancels the user's active Paystack subscription. It uses Paystack's subscription.disable API and
// clears subscription-related fields in your database. When a user clicks “Cancel Auto-Renew”
router.post('/webhook', verifyWebhook);

// Cancel user subscription
router.post('/subscription/cancel', loginRequired, cancelSubscription);

// This route retrieves all saved cards (from your userCard table) for the logged-in user.
// To show a list of saved cards in the user's billing settings or payment method page.
router.get('/cards', loginRequired, getCards);

// Remove specific card
// This route deletes a specific card from the logged-in user's
// saved cards using the card’s authorization_code. user clicks “Remove Card”
router.delete('/cards/:authorization_code', loginRequired, deleteCard);

// This route adds a new card to the logged-in user's saved cards.
router.post('/add-card', addCardController);
router.post('/add-direct-debit', loginRequired, addDirectDebitController);

// router.post('/deactivate-direct-debit', loginRequired, deactivateDirectDebitController);

export default router;
