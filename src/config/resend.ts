import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const resend = new Resend('re_L8ceAt8f_Au5p9J1y5uRULvF9BkPqAdo5');
// export const resend = new Resend(process.env.RESEND_API_KEY);
