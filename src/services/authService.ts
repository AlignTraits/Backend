import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, updateUser } from '../models/userModel';
import {
  getEmailVerificationTokenByEmail,
  deleteEmailVerificationToken,
  saveEmailVerificationToken,
  getEmailVerificationTokenByToken,
} from '../models/tokenModel';
import { generateOTP } from '../lib/utils';
import { sendConfirmationEmail, sendResetPasswordEmail } from './mailServices';

dotenv.config();

const loginService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    if (!email || !password) {
      return {
        status: 400,
        message: 'Login failed',
        errors: [{ message: 'Email and password are required' }],
      };
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return {
        ok: false,
        status: 404,
        message: 'Login failed',
        errors: [{ message: 'User does not exist' }],
      };
    }

    if (!user.emailVerified) {
      await emailVerificationService(user.email); // Resend the verification email
      return {
        ok: false,
        status: 403,
        message: 'Login failed',
        errors: [
          {
            message:
              "Email has not been verified. We've send a new one to your email",
          },
        ],
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        ok: false,
        status: 400,
        message: 'Login failed',
        errors: [{ message: 'Invalid password' }],
      };
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
    );
    return {
      ok: true,
      status: 200,
      message: 'Login successful',
      data: { token },
    };
  } catch (e) {
    throw e;
  }
};

const registerService = async ({
  firstname,
  lastname,
  email,
  password,
}: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}) => {
  try {
    // validate fields
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        status: 400,
        message: 'Registration failed',
        errors: [{ message: 'User already exist' }],
      };
    }

    // hashpassword
    const hashedPassword = await bcrypt.hash(password, 10);

    // save into database
    const newUser = await createUser({
      data: { firstname: firstname, email, lastname: lastname, password: hashedPassword },
    });


    // send verification email
    const response = await emailVerificationService(newUser.email);

    return {
      status: 201,
      message: 'Registration successful',
      data: {
        id: newUser.id,
        firstname: newUser.firstname,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        emailSent: response?.didEmailSend,
      },
    };
  } catch (e) {
    console.log(e, 3239)
    throw e;
  }
};

const validateTokenService = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  try {
    if (!email || !token)
      return {
        ok: false,
        status: 400,
        message: 'Invalid inputs',
      };

    const user = await getUserByEmail(email);

    if (user?.emailVerified || !user) {
      return {
        ok: false,
        status: 400,
        message: 'Validation failed',
        errors: [{ message: 'Email already verified' }],
      };
    }

    const tokenRecord = await getEmailVerificationTokenByEmail(email);
    if (!tokenRecord) {
      return {
        ok: false,
        status: 400,
        message: 'Validation failed',
        errors: [{ message: 'Invalid OTP or OTP expired' }],
      };
    }

    const isMatch = await bcrypt.compare(token.toString(), tokenRecord.otp);
    if (!isMatch) {
      return {
        ok: false,
        status: 400,
        message: 'Validation failed',
        errors: [{ message: 'Invalid OTP or OTP expired' }],
      };
    }

    const update = Promise.all([
      await updateUser(user?.id, { emailVerified: new Date() }),
      await deleteEmailVerificationToken(email),
    ]);

    return { ok: true, status: 200, message: 'Token is valid' };
  } catch (e) {
    throw e;
  }
};

const requestResetService = async (email: string) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return {
        status: 404,
        message: 'Change Password Request failed',
        errors: [{ message: 'User does not exist' }],
      };
    }

    // Generate and hash the OTP
    const otp = generateOTP(12);
    const expirationTime = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from creation

    const encryptedToken = await bcrypt.hash(otp, 10);

    const savedToken = await saveEmailVerificationToken({
      id: '',
      otp: encryptedToken,
      email,
      expirationTime,
    });

    if (!user.firstname) {
      return {
        status: 400,
        message: 'Change Password Request failed',
        errors: [{ message: 'Unknown User' }],
      };
    }

    const emailRes = await sendResetPasswordEmail({
      name: user.firstname,
      email,
      token: otp,
    });
    if (!emailRes.ok) {
      return {
        status: 500,
        message: 'Change Password Request failed',
        errors: [{ message: 'Server failed to send email' }],
      };
    }

    return {
      status: 201,
      message: 'Password Reset Mail sent successfully',
      data: {
        token: otp,
        createdAt: savedToken.createdAt,
        expiresAt: savedToken.expiresAt,
      },
    };
  } catch (e) {
    throw e;
  }
};

const resetPasswordService = async ({
  email,
  token,
  newPassword,
}: {
  email: string;
  token: string;
  newPassword: string;
}) => {
  try {
    const otpRecord = await getEmailVerificationTokenByToken(token);
    if (!otpRecord || !(await bcrypt.compare(token, otpRecord?.otp))) {
      return {
        status: 400,
        message: 'Password Reset failed',
        errors: [{ message: 'Invalid OTP or OTP expired' }],
      };
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return {
        status: 404,
        message: 'Password Reset failed',
        errors: [{ message: 'User not found' }],
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // const existingUser = await getUserByEmail(email);

    const [updatedData] = await Promise.all([
      updateUser(user?.id, { password: hashedPassword }),
      deleteEmailVerificationToken(email),
    ]);
    if (!updatedData) {
      return {
        status: 500,
        message: 'Password Reset failed',
        errors: [
          { message: 'Server error. Something went wrong at updateUser' },
        ],
      };
    }

    return {
      status: 200,
      message: 'Password Reset successful',
      data: { email },
    };
  } catch (e) {
    throw e;
  }
};

const emailVerificationService = async (email: string) => {
  try {
    console.log('starting...')
    const existingUser = await getUserByEmail(email);
    if (!existingUser) return null;

    const existingToken = await getEmailVerificationTokenByEmail(email);

    // Generate and hash the OTP
    const otp = generateOTP(12);
    const expirationTime = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from creation

    const encryptedToken = await bcrypt.hash(otp, 10);

    const savedToken = await saveEmailVerificationToken({
      id: existingToken?.id ?? '',
      otp: encryptedToken,
      email,
      expirationTime,
    });

    console.log('start sen confirmd email');
    const emailRes = await sendConfirmationEmail({
      name: existingUser.firstname,
      email: existingUser.email,
      otp,
    });

    return {
      ok: true,
      status: 200,
      didEmailSend: emailRes.ok,
      data: { otp, token: { ...savedToken }, 
    },
    };
  } catch (e) {
    throw e;
  }
};

export {
  loginService,
  registerService,
  validateTokenService,
  requestResetService,
  resetPasswordService,
  emailVerificationService,
};
