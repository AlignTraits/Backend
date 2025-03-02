// import { sendAdminSetupEmail } from './mailService'; // Import your email service
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import {
  createUser,
  deleteUser,
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
import {
  sendAdminCreateEmail,
  sendAdminUpdateEmail,
  sendAdminDeleteEmail,
} from './mailServices';
import { db } from '../config/db';

dotenv.config();

// Validation schema for admin profile (unchanged from your latest request)
const adminProfileSchema = z.object({
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
    .max(15, 'Contact Number must not exceed 15 digits'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN'], {
    message: 'Role must be either ADMIN or SUPER_ADMIN',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// New Services for Admin Profile Management (without ActionHistory)
export const createAdminProfileService = async (
  superAdminId: string,
  data: any
) => {
  try {
    // Check super admin permissions
    const superAdmin = await getUserById(superAdminId);
    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      return {
        status: 403,
        message: 'Unauthorized: Only super admins can create admin profiles',
      };
    }

    const parsedData = adminProfileSchema.parse(data);

    // Check if email already exists
    const existingUser = await getUserByEmail(parsedData.email);
    if (existingUser) {
      return {
        status: 400,
        message: 'Email already in use',
        errors: [{ message: 'Email already exists' }],
      };
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    const newAdmin = await createUser({
      data: {
        firstname: parsedData.firstname,
        lastname: parsedData.lastname,
        email: parsedData.email,
        contactNumber: parsedData.contactNumber,
        role: parsedData.role,
        password: hashedPassword,
      },
    });

    // Send admin creation email with the password (no OTP)
    await sendAdminCreateEmail({
      name: `${newAdmin.firstname} ${newAdmin.lastname}`,
      email: newAdmin.email,
      password: parsedData.password, // Using password as OTP for now, adjust if needed
    });

    return {
      status: 201,
      message:
        'Admin profile created successfully. A setup email has been sent.',
      data: {
        id: newAdmin.id,
        firstname: newAdmin.firstname,
        lastname: newAdmin.lastname,
        email: newAdmin.email,
        contactNumber: newAdmin.contactNumber,
        role: newAdmin.role,
      },
    };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Validation failed',
        errors: e.errors.map((err) => ({ message: err.message })),
      };
    }
    throw e;
  }
};

// Schema without role
const adminProfileUpdateSchema = z.object({
  firstname: z
    .string()
    .min(1, 'First Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'First Name must contain only letters')
    .optional(),
  lastname: z
    .string()
    .min(1, 'Last Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Last Name must contain only letters')
    .optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  contactNumber: z
    .string()
    .regex(/^\d+$/, 'Contact Number must be numeric')
    .min(10, 'Contact Number must be at least 10 digits')
    .max(15, 'Contact Number must not exceed 15 digits')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
});

export const updateAdminProfileService = async (
  superAdminId: string, // From middleware (req.user.id)
  adminId: string, // From route params (req.params.id)
  data: any // From request body (req.body)
) => {
  try {
    // Check super admin permissions using middleware role
    const superAdmin = await getUserById(superAdminId);
    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      return {
        status: 403,
        message: 'Unauthorized: Only super admins can update admin profiles',
      };
    }

    // Parse request data
    const parsedData = adminProfileUpdateSchema.parse(data);

    // Fetch the admin to update
    const adminToUpdate = await getUserById(adminId);
    if (
      !adminToUpdate ||
      (adminToUpdate.role !== 'ADMIN' && adminToUpdate.role !== 'SUPER_ADMIN')
    ) {
      return { status: 404, message: 'Admin profile not found' };
    }

    // Build update data dynamically
    const updateData: any = {};
    if (parsedData.firstname) updateData.firstname = parsedData.firstname;
    if (parsedData.lastname) updateData.lastname = parsedData.lastname;
    if (parsedData.email) updateData.email = parsedData.email;
    if (parsedData.contactNumber)
      updateData.contactNumber = parsedData.contactNumber;
    if (parsedData.password)
      updateData.password = await bcrypt.hash(parsedData.password, 10);
    // Role is not updated; use existing adminToUpdate.role implicitly

    const updatedAdmin = await updateUser(adminId, updateData);

    if (!updatedAdmin) {
      return {
        status: 500,
        message: 'Failed to update admin profile',
        errors: [{ message: 'Server error during update' }],
      };
    }

    // Send update notification email
    await sendAdminUpdateEmail({
      name: `${updatedAdmin.firstname} ${updatedAdmin.lastname}`,
      email: updatedAdmin.email,
    });

    return {
      status: 200,
      message: 'Admin profile updated successfully',
      data: {
        id: updatedAdmin.id,
        firstname: updatedAdmin.firstname,
        lastname: updatedAdmin.lastname,
        email: updatedAdmin.email,
        contactNumber: updatedAdmin.contactNumber,
        role: updatedAdmin.role, // Return existing role
      },
    };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Validation failed',
        errors: e.errors.map((err) => ({ message: err.message })),
      };
    }
    throw e;
  }
};

// delete
export const deleteAdminProfileService = async (
  superAdminId: string,
  adminId: string
) => {
  try {
    // Check super admin permissions
    const superAdmin = await getUserById(superAdminId);
    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      return {
        status: 403,
        message: 'Unauthorized: Only super admins can delete admin profiles',
      };
    }

    const adminToDelete = await getUserById(adminId);
    if (
      !adminToDelete ||
      (adminToDelete.role !== 'ADMIN' && adminToDelete.role !== 'SUPER_ADMIN')
    ) {
      return { status: 404, message: 'Admin profile not found' };
    }

    await deleteUser(adminId);

    // Send delete notification email
    await sendAdminDeleteEmail({
      name: `${adminToDelete.firstname} ${adminToDelete.lastname}`,
      email: adminToDelete.email,
    });

    return {
      status: 200,
      message: 'Admin profile deleted successfully',
    };
  } catch (e) {
    throw e;
  }
};

// Export all services (append these)
// export {
//   createAdminProfileService,
//   updateAdminProfileService,
//   deleteAdminProfileService,
// };
