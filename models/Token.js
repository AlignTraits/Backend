import { db } from "../helpers/db.js";
import { generateOtp } from '../helpers/auth.js';
import { getUserByEmail } from "./User.js";
import bcrypt from 'bcryptjs';


const generateEmailVerificationToken = async ({ email }) => {
    try {
        console.log('Generating email verification token for: ', email)
        const existingUser = await getUserByEmail(email);
        if(!existingUser) return null; 

        // Generate and hash the OTP
        const otp = generateOtp(12);
        const expirationTime = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from creation
    
        const existingToken = await db.emailVerificationToken.findFirst({ where: { email } });

        const encryptedToken = await bcrypt.hash(otp, 10);
        
        const savedToken = await db.emailVerificationToken.upsert({
            where: { id: existingToken?.id ?? '' },
            update: { 
                otp: encryptedToken,
                expiresAt: expirationTime 
            },
            create: {
                email, 
                otp: encryptedToken,
                createdAt: new Date(),
                expiresAt: expirationTime 
            }
        });
        
        console.log('Returning the token: ', savedToken, otp, await bcrypt.compare(otp, savedToken.otp))
        return { otp, token: {...savedToken} };
    } catch (error) {
        console.log('Error from generateEmailVerificationToken: ', error)
        return null;
    }
}

const getEmailVerificationToken = async ({ email }) => {
    // Fetch the latest OTP record for the email
    try {
        return await db.emailVerificationToken.findFirst({
            where: {
                email,
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.log('getEmailVerificationToken: ', error, 762356)
        return null;
    }
}

const deleteEmailVerificationToken = async ({ email }) => {
    try {
        return await db.emailVerificationToken.deleteMany({ where: { email } });
    } catch (error) {
        return null;
    }
}


export {
    generateEmailVerificationToken,
    getEmailVerificationToken,
    deleteEmailVerificationToken
}