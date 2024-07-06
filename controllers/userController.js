import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendMail } from "../helpers/mailers.js";
import { createUser, getUserByEmail, updateUser } from '../models/User.js';
import { 
    generateEmailVerificationToken, 
    getEmailVerificationToken,
    deleteEmailVerificationToken
} from '../models/Token.js'


const login = async ( req, res ) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({message: 'User not found'});

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.status(200).json({ token });
};

const register = async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if(existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await createUser({
        username, email,
        password: hashedPassword,
    });

    res.status(201).json({
        message: 'User created successfully',
        user: { email: newUser?.email },
    });
};

const requestReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await getUserByEmail(email);
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        const savedToken = await generateEmailVerificationToken({ email });
        const { username } = await getUserByEmail(savedToken?.email);
    
        if(!username) return res.status(400).json({ message: 'Unknown user' }); 
    
        const sent = await sendMail({
            recipient: savedToken?.email,
            subject: 'Password Reset Request for Your LearnConnect Account',
            email: {
                body: {
                    name: username ?? user.email.split('@')[0],
                    intro: `We received a request to reset the password for your LearnConnect account associated with this email address: ${user.email}.`,
                    action: {
                        instructions: 'To reset your password, please click the button below:',
                        button: {
                            color: '#DC4D2F', // Optional action button color
                            text: 'Reset Password',
                            link: `resetLink?otp=${savedToken.otp}&email=${user.email}` // Fixed typo here
                        }
                    },
                    outro: [
                        'If you did not request a password reset, please ignore this email. Your password will remain unchanged, and no further action is required.', 
                        "If you have any questions or need further assistance, please don't hesitate to contact our support team at samueltobi032@gmail.com.\n\nThank you for being a part of the LearnConnect community!"
                    ]
                }
            }
        });
    
        if (sent.error) return res.status(500).json({ message: 'Server error' });
        if (!(!!sent?.res?.includes('OK'))) return res.status(400).json({ message: 'Something went wrong. Unable to send email. Try again' });
    
        return res.status(200).json({
            message: 'Reset Link Mail sent successfully',
            otp: {
                token: savedToken?.otp,
                createdAt: savedToken.createdAt,
                expiresAt: savedToken.expiresAt
            }
        });    
    } catch (error) {
        console.error('Error requesting OTP: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Store the OTP in the database
        const savedToken = await generateEmailVerificationToken({ email });
        const { username } = await getUserByEmail(savedToken?.email);

        if(!username) return res.status(400).json({ message: 'Unknown user' }); 

        const sent = await sendMail({
            recipient: email,
            subject: 'Welcome to LearnConnect! Verify Your Account',
            email: {
                body: {
                    name: username,
                    intro: 'Welcome to LearnConnect!',
                    outro: [
                        `<strong style="display: block; text-align: center; font-size: 48px; padding: 25px 0;">${savedToken?.otp}</strong>`, 
                        "Simply enter this code on the verification page to complete your registration. If you didn't request this email, please ignore it.", 
                        "Here are some features you can look forward to:", 
                        "- Personalized Learning Paths: Recommendations to help you achieve your goals.", 
                        "- Interactive Courses and Resources: Access high-quality content from top educators.", 
                        "- Community Engagement: Connect and collaborate with peers.", 
                        "- Career Path Suggestions: Discover career options that match your skills and interests.", 
                        "If you have any questions or need assistance, feel free to reach out to our support team at samueltobi032@gmail.com.", 
                        "Once again, welcome to LearnConnect! We're thrilled to have you with us."
                    ]
                }
            }
        });

        if (sent.error) return res.status(500).json({ message: 'Server error' });
        if (!(!!sent?.res?.includes('OK'))) return res.status(400).json({ message: 'Something went wrong, Unable to send email. Try again' });

        return res.status(200).json({
            message: 'OTP sent to your email address',
            otp: {
                token: savedToken?.otp,
                createdAt: savedToken.createdAt,
                expiresAt: savedToken.expiresAt
            }
        });
    } catch (error) {
        console.error('Error requesting OTP: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const validateOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Fetch the latest OTP record for the email
        const otpRecord = await getEmailVerificationToken(email);
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        // Compare the provided OTP with the stored OTP
        const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        await deleteEmailVerificationToken(email);

        return res.status(200).json({ valid: true, message: 'OTP is valid' });
    } catch (error) {
        console.error('Error validating OTP:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const otpRecord = await getEmailVerificationToken(email);
    if (!otpRecord || !(await bcrypt.compare(otp, otpRecord.otp))) {
        return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
    }

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const existingUser = getUserByEmail(email);
    await updateUser(existingUser?.id, { 
        password: hashedPassword 
    });

    await deleteEmailVerificationToken(email);

    res.status(200).json({ message: 'Password reset successfully', email });
};

export {
    login, register,
    requestReset, validateOtp,
    resetPassword, requestOtp
}