import Paystack from 'paystack-api';
import retry from 'async-retry';
import { db } from '../config/db';
import { getUserById, updateUser } from '../models/userModel';
import { PaymentPlan, TransactionStatus } from '@prisma/client';

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY || '');

// Pricing configuration by plan and region
const PLAN_PRICING: Record<
  PaymentPlan,
  { baseAmount: number; durationDays: number | null }
> = {
  BASIC_ONETIME: { baseAmount: 500000, durationDays: null }, // ₦5000 (kobo)
  LOCAL_MONTHLY: { baseAmount: 1000000, durationDays: 30 }, // ₦10000
  GLOBAL_MONTHLY: { baseAmount: 2000000, durationDays: 30 }, // ₦20000
};

const PRICING_BY_REGION: Record<
  string,
  { currency: string; multiplier: number }
> = {
  Nigeria: { currency: 'NGN', multiplier: 1.0 },
  'United States': { currency: 'USD', multiplier: 0.1 },
  default: { currency: 'USD', multiplier: 0.15 },
};

// Simplified exchange rate (use real-time API in production)
const NGN_TO_USD_RATE = 0.0006; // 1 NGN = 0.0006 USD

export const initializeSubscriptionPaymentService = async (
  userId: string,
  paymentPlan: PaymentPlan
) => {
  try {
    // Validate user
    const user = await getUserById(userId);
    if (!user) {
      return {
        ok: false,
        status: 404,
        message: 'User not found',
        errors: [{ message: 'User does not exist' }],
      };
    }

    // Validate payment plan
    if (!Object.values(PaymentPlan).includes(paymentPlan)) {
      return {
        ok: false,
        status: 400,
        message: 'Invalid payment plan',
        errors: [{ message: `Payment plan ${paymentPlan} is not supported` }],
      };
    }

    // Check if user has an active plan
    // Block only if the new plan is not an upgrade
    if (
      user.payment_plan &&
      user.payment_plan_expires_at &&
      new Date() < user.payment_plan_expires_at
    ) {
      const isUpgradingToGlobal =
        user.payment_plan !== PaymentPlan.GLOBAL_MONTHLY &&
        paymentPlan === PaymentPlan.GLOBAL_MONTHLY;

      if (!isUpgradingToGlobal) {
        return {
          ok: false,
          status: 400,
          message: 'Active subscription exists',
          errors: [
            {
              message: `User already has an active ${user.payment_plan} plan. You can only upgrade to GLOBAL_MONTHLY before expiry.`,
            },
          ],
        };
      }
    }

    // Determine pricing
    const region = user.region || 'default';
    const pricing = PRICING_BY_REGION[region] || PRICING_BY_REGION.default;
    const planConfig = PLAN_PRICING[paymentPlan];
    let amount = planConfig.baseAmount * pricing.multiplier;
    let currency = pricing.currency;

    if (currency === 'USD') {
      amount = amount * NGN_TO_USD_RATE;
    }
    amount = Math.round(amount); // In kobo/cents

    // Create transaction record
    const reference = `sub_${userId}_${paymentPlan}_${Date.now()}`;
    const transaction = await db.transaction.create({
      data: {
        userId,
        paymentPlan,
        amount: amount / 100, // Store in base currency
        currency,
        reference,
        status: TransactionStatus.PENDING,
      },
    });

    // Initialize Paystack transaction
    const paystackResponse = await retry(
      async () => {
        return await paystack.transaction.initialize({
          email: user.email,
          amount,
          currency,
          reference,
          // callback_url: `${process.env.APP_URL}/payment/callback`,
          // callback_url: `https://52f1-105-113-118-38.ngrok-free.app/payment/callback`,
          callback_url: `https://backend-oo07.onrender.com/payment/callback`,
          metadata: { userId, paymentPlan },
          channels: ['card', 'bank', 'ussd', 'bank_transfer'],
        });
      },
      {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 5000,
        onRetry: (error) => {
          if (error instanceof Error) {
            console.log(`Retrying Paystack initialize: ${error.message}`);
          } else {
            console.log('Retrying Paystack initialize: Unknown error', error);
          }
        },
      }
    );

    return {
      ok: true,
      status: 200,
      message: 'Payment initialized',
      data: {
        authorization_url: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
      },
    };
  } catch (error: any) {
    console.error('Error in initializeSubscriptionPaymentService:', error);
    return {
      ok: false,
      status: 500,
      message: 'Failed to initialize payment',
      errors: [{ message: error.message || 'Paystack transaction failed' }],
    };
  }
};

export const verifySubscriptionPaymentService = async (
  reference: string,
  event: string
) => {
  try {
    // Fetch transaction
    const transaction = await db.transaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      return {
        ok: false,
        status: 404,
        message: 'Transaction not found',
        errors: [{ message: 'Transaction does not exist' }],
      };
    }

    // Update transaction status based on event
    const status =
      event === 'charge.success'
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILED;

    const updatedTransaction = await db.transaction.update({
      where: { reference },
      data: { status },
    });

    if (status === TransactionStatus.SUCCESS) {
      // Verify with Paystack
      const verification = await retry(
        async () => {
          return await paystack.transaction.verify({ reference });
        },
        {
          retries: 3,
          minTimeout: 1000,
          maxTimeout: 5000,
          onRetry: (error) => {
            if (error instanceof Error) {
              console.log(`Retrying Paystack verify: ${error.message}`);
            } else {
              console.log('Retrying Paystack verify: Unknown error', error);
            }
          },
        }
      );

      if (verification.data.status !== 'success') {
        await db.transaction.update({
          where: { reference },
          data: { status: TransactionStatus.FAILED },
        });

        return {
          ok: false,
          status: 400,
          message: 'Payment verification failed',
          errors: [{ message: 'Transaction was not successful' }],
        };
      }

      // Verify amount
      const expectedAmount = Math.round(transaction.amount * 100);
      if (verification.data.amount !== expectedAmount) {
        await db.transaction.update({
          where: { reference },
          data: { status: TransactionStatus.FAILED },
        });

        return {
          ok: false,
          status: 400,
          message: 'Invalid payment amount',
          errors: [{ message: 'Transaction amount does not match' }],
        };
      }

      // Calculate new expiry date from now
      const planConfig = PLAN_PRICING[transaction.paymentPlan];
      let expiresAt: Date;

      if (transaction.paymentPlan === 'BASIC_ONETIME') {
        // 15 minutes from now
        expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      } else if (planConfig.durationDays) {
        // Fresh duration from now
        expiresAt = new Date(
          Date.now() + planConfig.durationDays * 24 * 60 * 60 * 1000
        );
      } else {
        throw new Error('Invalid plan configuration: durationDays not set');
      }

      // Update user with new plan and expiry
      await updateUser(transaction.userId, {
        payment_plan: transaction.paymentPlan,
        payment_plan_expires_at: expiresAt,
      });
    }

    return {
      ok: true,
      status: 200,
      message: `Payment ${status.toLowerCase()}`,
      data: {
        reference,
        status: updatedTransaction.status,
      },
    };
  } catch (error: any) {
    console.error('Error in verifySubscriptionPaymentService:', error);
    return {
      ok: false,
      status: 500,
      message: 'Failed to verify payment',
      errors: [{ message: error.message || 'Paystack verification failed' }],
    };
  }
};

export const getTransactionRecordsService = async () => {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ok: true,
      status: 200,
      message: 'Transaction records retrieved',
      data: transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        userEmail: t.user.email,
        paymentPlan: t.paymentPlan,
        amount: t.amount,
        currency: t.currency,
        reference: t.reference,
        status: t.status,
        createdAt: t.createdAt,
      })),
    };
  } catch (error: any) {
    console.error('Error in getTransactionRecordsService:', error);
    return {
      ok: false,
      status: 500,
      message: 'Failed to retrieve transaction records',
      errors: [{ message: error.message || 'Database query failed' }],
    };
  }
};
