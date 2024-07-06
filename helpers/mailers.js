import { createTransport } from 'nodemailer';
import Mailgen from 'mailgen';
import dotenv from 'dotenv';

dotenv.config();

const transporter = createTransport({
    service: 'gmail',
    auth: {
        default: 'login',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Change to app email
    },
});

const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'LearnConnect',
        link: 'https://link-to-website.com/',
    },
});

export async function sendMail({
    recipient,
    subject = 'Signup Successful',
    email 
}){
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject,  
        html: mailGenerator.generate({
            ...email, 
            body: { ...email.body, signature: "Best regards" }
        }),
    };

    
    try {
        const info = await transporter.sendMail(mailOptions);
        return { res: info.response };
    } catch (error) {
        return { error };
    }
}
