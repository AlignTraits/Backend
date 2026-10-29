import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { render } from 'ejs';
import { Resend } from 'resend';
// import { resend } from '../config/resend';

dotenv.config();

// The Resend key comes only from the RESEND_API_KEY environment variable.
// If it is missing, emails are not sent (and the server says so in the logs),
// but nothing else breaks. Never write a key into the code: anyone who can read
// the repository could send email as aligntraits.com.
let resendClient: Resend | null = null;
const getResend = (): Resend | null => {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
};

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set. Emails will not be sent.');
}

export const sendMail = async ({
  from = 'Aligntraits <no-reply@aligntraits.com>',
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
    const resend = getResend();
    if (!resend) {
      return {
        ok: false,
        status: 500,
        message: 'Email is not configured (RESEND_API_KEY is missing)',
      };
    }
    const template = fs.readFileSync(
      path.join('src', 'views', 'email', `${templateName}.ejs`),
      'utf8'
    );
    const html = render(template, { ...templateInfo });

    const { data, error } = await resend.emails.send({
      from,
      subject,
      html,
      to: recipients,
    });

    if (error) {
      console.error('Resend error details:', error);
      return {
        ok: false,
        status: 500,
        message: error.message || 'Something went wrong',
        error: error, // Include error object for debugging
      };
    }

    return {
      ok: true,
      status: 200,
      message: 'Email sent successful',
      data,
    };
  } catch (error) {
    console.error('SendMail error:', error);
    throw error;
  }
};

// old Function to send an email using Resend
// export const sendMail = async ({
//   from = 'Aligntraits <no-reply@aligntrait.com>',
//   recipients,
//   subject,
//   templateName,
//   templateInfo,
// }: {
//   from?: string;
//   subject: string;
//   templateName: string;
//   templateInfo: Record<string, any>;
//   recipients: [string];
// }) => {
//   try {
//     console.log('Sending an email...');
//     // Read and render the EJS template
//     const template = fs.readFileSync(
//       path.join('src', 'views', 'email', `${templateName}.ejs`),
//       'utf8'
//     );
//     const html = render(template, { ...templateInfo });

//     const { data, error } = await resend.emails.send({
//       from,
//       subject,
//       html,
//       to: recipients, // recipients,
//     });

//     if (error) {
//       return {
//         ok: false,
//         status: 500,
//         message: 'Something went wrong',
//       };
//     }

//     console.log({ data });
//     return {
//       ok: true,
//       status: 200,
//       message: 'Email sent successful',
//     };
//   } catch (error) {
//     throw error;
//   }
// };

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
    // const host = process.env.WEBSITE_URL || process.env.BACKEND_URL || 'http://localhost:3000';
    const url = new URL('/email-verify', process.env.WEBSITE_URL);
    // const url = new URL('/api/v1/auth/verification', process.env.BACKEND_URL);

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
        host: process.env.BACKEND_URL || 'http://localhost:3000',
        // host,
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
        host: process.env.BACKEND_URL || 'http://localhost:3000',
      },
    });
  } catch (e) {
    throw e;
  }
};

// For visitors who used the quiz, a check or a payment before they had a password.
export const sendSetPasswordEmail = async ({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) => {
  const url = new URL('/setup-password', process.env.WEBSITE_URL);
  url.searchParams.append('email', email);
  url.searchParams.append('token', token);

  return sendMail({
    recipients: [email],
    subject: `${token} is your AlignTraits code`,
    templateName: 'setPasswordEmail',
    templateInfo: {
      name,
      email,
      code: token,
      url: url.toString(),
      host: process.env.BACKEND_URL || 'http://localhost:3000',
    },
  });
};

// new mails services

export const sendAdminCreateEmail = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    return await sendMail({
      recipients: [email],
      subject: 'Welcome to AlignTraits Admin Panel!',
      templateName: 'adminCreateEmail',
      templateInfo: {
        name,
        email,
        password, // Pass password instead of OTP
        host: process.env.BACKEND_URL || 'http://localhost:3000',
      },
    });
  } catch (e) {
    throw e;
  }
};

export const sendAdminUpdateEmail = async ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  try {
    return await sendMail({
      recipients: [email],
      subject: 'Your Admin Profile Has Been Updated',
      templateName: 'adminUpdateEmail',
      templateInfo: {
        name,
        email,
        host: process.env.BACKEND_URL || 'http://localhost:3000',
      },
    });
  } catch (e) {
    throw e;
  }
};

export const sendAdminDeleteEmail = async ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  try {
    return await sendMail({
      recipients: [email],
      subject: 'Your Admin Profile Has Been Deleted',
      templateName: 'adminDeleteEmail',
      templateInfo: {
        name,
        email,
        host: process.env.BACKEND_URL || 'http://localhost:3000',
      },
    });
  } catch (e) {
    throw e;
  }
};
