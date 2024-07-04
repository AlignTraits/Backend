import bcrypt from 'bcryptjs';
import { db } from "../helpers/db.js";
import { generateOtp } from '../helpers/auth.js';


const generateEmailVerificationToken = async ({ email }) => {
    // Generate and hash the OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const prevToken = db.emailVerificationToken.findOne(email);
    
    // extend time
    if(prevToken) return db.emailVerificationToken.update({
        where: { email },
        data: { 
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 7 * 60 * 1000) 
        }
    })


    // Store the OTP in the database
    const savedToken = await db.emailVerificationToken.create({
        data: {
            email,
            otp: hashedOtp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 60 * 1000) // 7 minutes from creation
        }
    });

    return savedToken;
}

const getEmailVerificationToken = async ({ email }) => {
    // Fetch the latest OTP record for the email
    return await db.emailVerificationToken.findFirst({
        where: { email }
    });
}

const deleteEmailVerificationToken = async ({ email }) => {
    return await db.verificationToken.deleteMany({ where: { email } });
}


export {
    generateEmailVerificationToken,
    getEmailVerificationToken,
    deleteEmailVerificationToken
}