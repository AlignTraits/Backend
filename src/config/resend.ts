import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not configured in .env');
}
export const resend = new Resend(
  resendApiKey || 're_L8ceAt8f_Au5p9J1y5uRULvF9BkPqAdo5'
); // Fallback for debugging

//old code

// import { Resend } from 'resend';
// import dotenv from 'dotenv';

// dotenv.config();

// // export const resend = new Resend("re_L8ceAt8f_Au5p9J1y5uRULvF9BkPqAdo5");
// export const resend = new Resend(process.env.RESEND_API_KEY as string);
// // export const resend = new Resend(process.env.RESEND_API_KEY);
