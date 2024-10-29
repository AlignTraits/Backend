import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { render } from 'ejs';
import { resend } from '../config/resend';

dotenv.config();

export const sendMail = async ({
  from = 'Aligntraits <no-reply@aligntrait.com>',
  recipients,
  subject,
  templateName,
  templateInfo,
}: {
  from?: string;
  subject: string;
  templateName: string;
  templateInfo: Record<string, any>;
  recipients: [string];
}) => {
  try {
    // Read and render the EJS template
    const template = fs.readFileSync(
      path.join('views', 'email', `${templateName}.ejs`),
      'utf8',
    );
    const html = render(template, { ...templateInfo });

    const { data, error } = await resend.emails.send({
      from,
      subject,
      html,
      to: ['taiwo.emmanuel@lmu.edu.ng', 'ttaiwo4910@gmail.com'], // recipients,
    });

    if (error) {
      return {
        ok: false,
        status: 500,
        message: 'Something went wrong',
      };
    }

    console.log({ data });
    return {
      ok: true,
      status: 200,
      message: 'Email sent successful',
    };
  } catch (error) {
    throw error;
  }
};

export const sendConfirmationEmail = async ({
  name,
  email,
  otp,
}: {
  name: string;
  email: string;
  otp: string;
}) => {
  try {
    const url = new URL('/api/auth/verification', process.env.BACKEND_URL);

    url.searchParams.append('email', email);
    url.searchParams.append('token', otp ?? '');

    return await sendMail({
      recipients: [email],
      subject: 'Welcome to AlignTraits! Verify Your Email',
      templateName: 'welcomeEmail',
      templateInfo: {
        name,
        email,
        url: url.toString(),
        host: process.env.BACKEND_URL,
      },
    });
  } catch (e) {
    throw e;
  }
};

export const sendResetPasswordEmail = async ({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) => {
  try {
    const url = new URL('/reset-password', process.env.WEBSITE_URL);

    url.searchParams.append('email', email);
    url.searchParams.append('token', token ?? '');

    return await sendMail({
      recipients: [email],
      subject: 'Reset Password? It happens',
      templateName: 'resetPasswordEmail',
      templateInfo: {
        name,
        email,
        url: url.toString(),
        host: process.env.BACKEND_URL,
      },
    });
  } catch (e) {
    throw e;
  }
};
