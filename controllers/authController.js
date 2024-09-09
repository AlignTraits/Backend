import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail, sendWelcomeEmail } from "../helpers/mailers.js";
import { createUser, getUserByEmail, getUserById, updateUser } from '../models/User.js';
import { 
    generateEmailVerificationToken, 
    getEmailVerificationToken,
    deleteEmailVerificationToken
} from '../models/Token.js'
import { uploadProfilePic } from '../helpers/upload.js';
import sharp from 'sharp';
import path from 'path';

dotenv.config();

const login = async ( req, res ) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ 
        status: 'error',
        message: 'Login failed',
        errors: [{ message: 'User does not exist' }] 
    });

    if (!user.emailVerified) return res.status(403).json({ 
        status: 'error',
        message: 'Login failed',
        errors: [{ message: 'Email has not been verified' }] 
    });

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ 
        status: 'error',
        message: 'Login failed',
        errors: [{ message: 'Invalid password' }] 
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h'});

    res.status(200).json({ 
        status: 'success',
        message: 'Login successful',
        data: { token }
    });
};

const register = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    // Validate inputs using zod

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if(existingUser) return res.status(400).json({ 
        status: 'error',
        message: 'Registration failed',
        errors: [{ message: 'User already exist' }] 
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
        firstname, 
        email, 
        lastname,
        password: hashedPassword,
    });

    const emailRes = await sendWelcomeEmail({
        name: firstname,
        email
    });

    // const [newUser, emailRes] = await Promise.all([stepOne(), stepTwo()]);

    res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: {
            id: newUser.id,
            firstname: newUser.firstname,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
            emailResponse: emailRes.res
        }
    });
};

const validateToken = async (req, res) => {
    try {
        const { email, token } = req.query;

        const { emailVerified } = await getUserByEmail(email)
        if(!!emailVerified) return res.redirect(`${process.env.WEBSITE_URL}/login?error=alreadyverified`);

        // Fetch the latest OTP record for the email
        const tokenRecord = await getEmailVerificationToken({ email });
        if (!tokenRecord) return res.redirect(`${process.env.WEBSITE_URL}/login?error=invalidtoken`);
        // return res.status(400).json({
        //     status: 'error',
        //     message: 'Validation failed',
        //     errors: [{ message: 'Invalid OTP or OTP expired.' }] 
        // });

        // Compare the provided token with the stored token
        const isMatch = await bcrypt.compare(token.toString(), tokenRecord.otp);
        if (!isMatch) return res.redirect(`${process.env.WEBSITE_URL}/login?error=expiredtoken`);
        // return res.status(400).json({
        //     status: 'error',
        //     message: 'Validation failed',
        //     errors: [{ message: 'Invalid OTP or OTP expired' }] 
        // });

        const [{ id }] = await Promise.all([ 
            getUserByEmail(email),
            deleteEmailVerificationToken(email)
        ])
        await updateUser(id, { emailVerified: new Date() })

        // return res.status(200).json({ valid: true, message: 'token is valid' });
        return res.redirect(`${process.env.WEBSITE_URL}/login`);
    } catch (error) {
        console.error('Error validating token:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Validation failed',
            errors: [{ message: 'Server error. Something went wrong in requestReset' }]
        })
    }
};

const requestReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await getUserByEmail(email);
        if (!user) return res.status(404).json({ 
            status: 'error',
            message: 'Change Password Request failed',
            errors: [{ message: 'User does not exist' }] 
        });
    
        const { token: savedToken, otp } = await generateEmailVerificationToken({ email });
        const { firstname } = await getUserByEmail(savedToken?.email);

        if(!firstname) return res.status(400).json({ 
            status: 'error',
            message: 'Change Password Request failed',
            errors: [{ message: 'Unknown User' }]
        }); 
    
        const emailRes = await sendResetPasswordEmail({
            name: firstname,
            email,
            token: otp
        });

        if (emailRes.status !== 'success') return res.status(500).json({
            status: 'error',
            message: 'Change Password Request failed',
            errors: [{ message: 'Server failed to send email' }]
        })

        return res.status(201).json({
            status: 'success',
            message: 'Password Reset Mail sent successfully',
            data: {
                token: otp,
                createdAt: savedToken.createdAt,
                expiresAt: savedToken.expiresAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Change Password Request failed',
            errors: [{ message: 'Server error. Something went wrong in requestReset' }]
        })
    }
};

const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;

    const otpRecord = await getEmailVerificationToken({ token });    

    if (!otpRecord || !(await bcrypt.compare(token, otpRecord?.otp))) return res.status(400).json({
        status: 'error',
        message: 'Password Reset failed',
        errors: [{ message: 'Invalid OTP or OTP expired' }] 
    });

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ 
        status: 'error',
        message: 'Password Reset failed',
        errors: [{ message: 'User not found' }] 
    });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const existingUser = await getUserByEmail(email);

    const [updatedData] = await Promise.all([
        updateUser(existingUser?.id, { password: hashedPassword }),
        deleteEmailVerificationToken(email)
    ])

    if(!updatedData) return res.status(500).json({ 
        status: 'error',
        message: 'Password Reset failed',
        errors: [{ message: 'Server error. Something went wrong at updateUser' }] 
    });

    return res.status(200).json({ 
        status: 'success',
        message: 'Password Reset successful',
        data: { email } 
    });
};

export {
    login,
    register,
    validateToken,
    requestReset,
    resetPassword
}