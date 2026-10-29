// Not used by the app: emails are sent from src/services/mailServices.ts.
// Kept only so old imports do not break. The key comes from RESEND_API_KEY,
// never from the code.
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
