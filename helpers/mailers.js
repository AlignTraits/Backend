import fs from 'fs'
import path from 'path'
import { render } from 'ejs'
import { createTransport } from "nodemailer";
import { generateEmailVerificationToken } from '../models/Token.js';

export const sendMail = async ({ recipient, emailName, emailData, subject }) => {
    const transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // logger: true, // Enable logging to the console
        // debug: true   // Enable debugging information
    });
    
    try {
        // Read and render the EJS template
        const template = fs.readFileSync(path.join('views', 'email', `${emailName}.ejs`), 'utf8');
        const html = render(template, { ...emailData });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipient,
            subject,
            html: html
        });

        return {
            status: 'success',
            message: 'Email sent successful',
            res: info.response
        };

    } catch (error) {
        console.log(error)
        return { 
            status: 'error',
            message: 'Server error. Email failed to send',
            res: error
        };
    }
}

export const sendWelcomeEmail = async ({ name, email }) => {
    const { otp } = await generateEmailVerificationToken({ email });

    const url = new URL(`/api/users/verification`, process.env.BACKEND_URL);

    url.searchParams.append("email", email);
    url.searchParams.append("token", otp ?? '');

    const res = await sendMail({
        recipient: email,
        subject: 'Welcome to AlignTraits! Verify Your Email',
        emailName: 'welcomeEmail',        
        emailData: {
            name,
            email,
            url: url.toString(),
            host: 'https://express-backend-jd5ikmdhba-nw.a.run.app/' || process.env.BACKEND_URL
        }
    });

    return res;
}

export const sendResetPasswordEmail = async ({ name, email, token }) => {
    const url = new URL('/reset-password', process.env.WEBSITE_URL);

    url.searchParams.append("email", email);
    url.searchParams.append("token", token ?? '');

    const res = await sendMail({
        recipient: email,
        subject: 'Reset Password? It happens',
        emailName: 'resetPasswordEmail',        
        emailData: {
            name,
            email,
            url: url.toString(),
            host: 'https://express-backend-jd5ikmdhba-nw.a.run.app/' || process.env.BACKEND_URL
        }
    });

    return res;
}