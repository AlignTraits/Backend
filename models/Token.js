import bcrypt from 'bcryptjs';
import { db } from "../helpers/db.js";
import { generateOtp } from '../helpers/auth.js';


const generateEmailVerificationToken = async ({ email }) => {
    // Generate and hash the OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expirationTime = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from creation

    const existingToken = await db.emailVerificationToken.findFirst({ where: { email } });
    if(!existingToken) return null;
    
    const savedToken = await db.emailVerificationToken.upsert({
        where: { id: existingToken?.id },
        update: { 
            otp: hashedOtp,
            expiresAt: expirationTime 
        },
        create: {
            email,
            otp: hashedOtp,
            createdAt: new Date(),
            expiresAt: expirationTime 
        }
    });
    
    return savedToken;
}

const getEmailVerificationToken = async ({ email }) => {
    // Fetch the latest OTP record for the email
    return await db.emailVerificationToken.findFirst({ where: { email } });
}

const deleteEmailVerificationToken = async ({ email }) => {
    return await db.emailVerificationToken.deleteMany({ where: { email } });
}


export {
    generateEmailVerificationToken,
    getEmailVerificationToken,
    deleteEmailVerificationToken
}