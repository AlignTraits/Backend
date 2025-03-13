// import { sendAdminSetupEmail } from './mailService'; // Import your email service
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from '../models/userModel';
import {
  getEmailVerificationTokenByEmail,
  deleteEmailVerificationToken,
  saveEmailVerificationToken,
  getEmailVerificationTokenByToken,
} from '../models/tokenModel';
import { generateOTP } from '../lib/utils';
import { sendConfirmationEmail, sendResetPasswordEmail } from './mailServices';

dotenv.config();

const loginAdminService = async ({
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
        errors: [{ message: 'Admin does not exist' }],
      };
    }

    // Check if the user has an admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return {
        ok: false,
        status: 403,
        message: 'Login failed',
        errors: [{ message: 'You are not authorized to log in as an admin' }],
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
      { expiresIn: '1h' }
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

const registerAdminService = async ({
  username, // firstname i couldn't add username to d db, i had to convert username to first and send back
  email,
}: {
  username: string;
  email: string;
}) => {
  try {
    // Validate fields
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        status: 400,
        message: 'Registration failed',
        errors: [{ message: 'User already exists' }],
      };
    }

    // Set a secure default password from environment variable
    const defaultPassword = process.env.JWT_SECRET;
    if (!defaultPassword) {
      throw new Error('Environment variable JWT_SECRET is not set');
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await createUser({
      data: {
        username: username,
        firstname: 'admin name',
        lastname: 'admin user',
        email: email,
        role: 'ADMIN',
        password: hashedPassword,
      },
    });

    // Send setup email with link to create password
    // await sendAdminSetupEmail(newUser);

    return {
      status: 201,
      message:
        'Admin created successfully. An email has been sent to set up the password.',
      data: {
        id: newUser.id,
        username: newUser.username,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const addAdminPasswordService = async ({
  email,
  newPassword,
}: {
  email: string;
  newPassword: string;
}) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return {
        status: 404,
        message: 'Failed To Add Admin Password',
        errors: [{ message: 'User not found' }],
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [updatedData] = await Promise.all([
      updateUser(user.id, { password: hashedPassword }),
    ]);

    if (!updatedData) {
      return {
        status: 500,
        message: 'Failed To Add Admin Password',
        errors: [
          { message: 'Server error. Something went wrong at admin Update' },
        ],
      };
    }

    return {
      status: 200,
      message: 'Password Added successfully',
      data: { email },
    };
  } catch (e) {
    throw e;
  }
};

//admin service ends

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

    if (!user.password) {
      return {
        ok: false,
        status: 400,
        message: 'Login failed',
        errors: [{ message: 'Password not set. Please set your password.' }],
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
      { expiresIn: '1h' }
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
  // Validate fields if (!password) { return { status: 400, message: 'Registration failed', errors: [{ message: 'Password is required' }], }; }

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
      data: {
        firstname: firstname,
        email,
        lastname: lastname,
        password: hashedPassword,
      },
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
    console.log(e, 3239);
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

// const resetPasswordService = async ({
//   email,
//   token,
//   newPassword,
// }: {
//   email: string;
//   token: string;
//   newPassword: string;
// }) => {
//   try {
//     const otpRecord = await getEmailVerificationTokenByToken(token);
//     if (!otpRecord || !(await bcrypt.compare(token, otpRecord?.otp))) {
//       return {
//         status: 400,
//         message: 'Password Reset failed',
//         errors: [{ message: 'Invalid OTP or OTP expired' }],
//       };
//     }

//     const user = await getUserByEmail(email);
//     if (!user) {
//       return {
//         status: 404,
//         message: 'Password Reset failed',
//         errors: [{ message: 'User not found' }],
//       };
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     // const existingUser = await getUserByEmail(email);

//     const [updatedData] = await Promise.all([
//       updateUser(user?.id, { password: hashedPassword }),
//       deleteEmailVerificationToken(email),
//     ]);
//     if (!updatedData) {
//       return {
//         status: 500,
//         message: 'Password Reset failed',
//         errors: [
//           { message: 'Server error. Something went wrong at updateUser' },
//         ],
//       };
//     }

//     return {
//       status: 200,
//       message: 'Password Reset successful',
//       data: { email },
//     };
//   } catch (e) {
//     throw e;
//   }
// };

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
    // const otpRecord = await getEmailVerificationTokenByToken(token);
    const tokenRecord = await getEmailVerificationTokenByEmail(email);

    console.log('OTP Record:', tokenRecord); // Debugging
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

    // if (!otpRecord || !(await bcrypt.compare(token, otpRecord.otp))) {
    //   return {
    //     status: 400,
    //     message: 'Password Reset failed',
    //     errors: [{ message: 'Invalid OTP or OTP expired' }],
    //   };
    // }

    const user = await getUserByEmail(email);
    if (!user) {
      return {
        status: 404,
        message: 'Password Reset failed',
        errors: [{ message: 'User not found' }],
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [updatedData] = await Promise.all([
      updateUser(user.id, { password: hashedPassword }),
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
    console.log('starting...');
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

    console.log('start confirm send email');
    const emailRes = await sendConfirmationEmail({
      name: existingUser.firstname,
      email: existingUser.email,
      otp,
    });

    return {
      ok: true,
      status: 200,
      didEmailSend: emailRes.ok,
      data: { otp, token: { ...savedToken } },
    };
  } catch (e) {
    throw e;
  }
};

const profileSchema = z.object({
  firstname: z
    .string()
    .min(1, 'First Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'First Name must contain only letters'),
  lastname: z
    .string()
    .min(1, 'Last Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Last Name must contain only letters'),
  email: z.string().email('Please enter a valid email address'),
  contactNumber: z
    .string()
    .regex(/^\d+$/, 'Contact Number must be numeric')
    .min(10, 'Contact Number must be at least 10 digits')
    .max(15, 'Contact Number must not exceed 15 digits')
    .optional(),
});

const requestSchema = z.object({
  data: profileSchema, // Expect a nested 'data' object
});

const updateAdminProfileService = async (adminId: string, requestData: any) => {
  try {
    // Parse the outer request object to extract the nested 'data'
    const { data } = requestSchema.parse(requestData);
    const parsedData = profileSchema.parse(data); // Validate the inner data

    const currentUser = await getUserByEmail(parsedData.email);
    if (
      !currentUser ||
      currentUser.id !== adminId ||
      currentUser.role !== 'ADMIN'
    ) {
      return {
        status: 404,
        message: 'User not found or not authorized',
      };
    }

    const updatedUser = await updateUser(adminId, {
      firstname: parsedData.firstname,
      lastname: parsedData.lastname,
      email: parsedData.email,
      contactNumber: parsedData.contactNumber,
    });

    if (!updatedUser) {
      return {
        status: 500,
        message: 'Failed to update profile',
        errors: [{ message: 'Server error during update' }],
      };
    }

    return {
      status: 200,
      message: 'Your profile has been successfully updated',
      data: {
        id: updatedUser.id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        contactNumber: updatedUser.contactNumber,
      },
    };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Validation failed',
        errors: e.errors.map((err: { message: any }) => ({
          message: err.message,
        })),
      };
    }
    throw e;
  }
};

// Password validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().optional(), // Changed to optional
  })
  .refine(
    (data) =>
      !data.confirmPassword || data.newPassword === data.confirmPassword, // Only check if provided
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

const updateAdminPasswordService = async (adminId: string, data: any) => {
  try {
    const parsedData = passwordSchema.parse(data);

    const user = await getUserByEmail(data.email);
    if (!user || user.id !== adminId || user.role !== 'ADMIN') {
      return {
        status: 404,
        message: 'User not found or not authorized',
      };
    }

    const isValid = await bcrypt.compare(
      parsedData.currentPassword,
      user.password
    );
    if (!isValid) {
      return {
        status: 400,
        message: 'Current password is incorrect',
      };
    }

    const hashedPassword = await bcrypt.hash(parsedData.newPassword, 10);

    const updatedUser = await updateUser(adminId, { password: hashedPassword });
    if (!updatedUser) {
      return {
        status: 500,
        message: 'Failed to update password',
        errors: [{ message: 'Server error during update' }],
      };
    }

    return {
      status: 200,
      message: 'Your password has been updated successfully',
    };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Validation failed',
        errors: e.errors.map((err: { message: any }) => ({
          message: err.message,
        })),
      };
    }
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
  // admin auth service
  loginAdminService,
  registerAdminService,
  addAdminPasswordService,
  updateAdminPasswordService,
  updateAdminProfileService,
};
