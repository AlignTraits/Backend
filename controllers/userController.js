// Authenticate a user
// POST /api/users/auth
import { db } from "../helpers/db.js";
import { sendMail } from "../helpers/mailers.js";
import bcrypt  from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const authUser = (req, res) => {
    res.status(200).json({ message: 'Auth User' })
}
// ~
const login = async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send('User not found');

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).send('Invalid password');

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.status(200).json({ token });
};

// ~
const register = async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).send('User already exists');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await db.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    res.status(201).json({
        message: 'User created successfully',
        user: { email: user.email },
    });
};

// ~
const requestReset = async (req, res) => {
    const { email } = req.body;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send('User not found');

    const otp = crypto.randomBytes(3).toString('hex'); // Generate a 6-character OTP
    const otpHash = await bcrypt.hash(otp, 10);
    await db.verificationToken.create({
        data: {
            email,
            otp: otpHash,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 3600000) // 1 hour TTL
        }
    });

    const sent = await sendMail({
        recipient: user.email,
        subject: 'Password Reset OTP',
        email: {
            body: {
                name: user.email.split('@')[0],
                intro: 'Welcome to Learn Fit! We’re very excited to have you on board.',
                action: {
                    instructions: 'To continue with changing your password, please click here:',
                    button: {
                        color: '#22BC66', // Optional action button color
                        text: 'Confirm your account',
                        link: 'lmu.edu.ng' // Link to dynamically authorized frontend route - with OTP as query param,
                    },
                },
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
            }
        }
    });

    if(sent.error) return res.status(500).json({ message: 'Server error '})
    if(!sent.response.includes('OK')) return res.status(400).json({ message: 'Something went wrong, try again' })
    
    return res.status(200).json({ message: 'Reset Link Mail sent successfully', otp})
}

const validateOtp = async (req, res) => {
    const { email, otp } = req.body;
    const otpRecord = await db.verificationToken.findFirst({ where: { email } });
    if (!otpRecord || !(await bcrypt.compare(otp, otpRecord.otp))) {
        return res.status(400).send('Invalid OTP or OTP expired');
    }

    res.send('OTP is valid');
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const otpRecord = await db.verificationToken.findFirst({ where: { email } });
    if (!otpRecord || !(await bcrypt.compare(otp, otpRecord.otp))) {
        return res.status(400).send('Invalid OTP or OTP expired');
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    await db.verificationToken.deleteMany({ where: { email } });

    res.send('Password reset successfully');
};


export {
    login, register, authUser,
    requestReset, validateOtp,
    resetPassword,
}