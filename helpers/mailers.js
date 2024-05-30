import { createTransport } from 'nodemailer';
import Mailgen from 'mailgen';

const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Change to app email
    },
};

const transporter = createTransport(emailConfig);

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
        html: mailGenerator.generate({...email, signature: "Best regards"}),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return {res: info.response};
    } catch (error) {
        return { error };
    }
}
