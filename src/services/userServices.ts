import sharp from 'sharp';
import cloudinary from '../config/cloudinary';
import bcrypt from 'bcryptjs';
import { getUserById, updateUser } from '../models/userModel';

export const getUserDataService = async (userId: string) => {
  try {
    const user = await getUserById(userId);
    if (!user)
      return {
        ok: false,
        status: 404,
        message: 'User not found',
        errors: [{ message: 'User does not exist' }],
      };

    return {
      ok: true,
      status: 200,
      message: 'User found',
      data: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    };
  } catch (e) {
    throw e;
  }
};

export const updateUserProfileService = async (
  userId: string,
  filteredData: Record<string, any>,
) => {
  try {
    if (!userId)
      return {
        ok: false,
        status: 400,
        message: 'Update failed',
        errors: [{ message: 'Invalid user ID' }],
      };

    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return {
        ok: false,
        status: 404,
        message: 'User not found',
        errors: [{ message: 'User does not exist' }],
      };
    }

    // security measurements
    const updatedUser = await updateUser(userId, filteredData);

    if (!updatedUser)
      return {
        ok: false,
        status: 500,
        message: 'Update failed',
        errors: [
          {
            message: 'Server error. Something went wrong at updateUserProfile',
          },
        ],
      };

    return {
      ok: true,
      status: 200,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        region: updatedUser.region,
        bio: updatedUser.bio,
      },
    };
  } catch (e) {
    throw e;
  }
};

export const updatePasswordService = async (
  userId: string,
  password: string,
) => {
  try {
    const existingUser = await getUserById(userId);
    if (!existingUser)
      return {
        ok: false,
        status: 403,
        message: 'User not found',
        errors: [{ message: 'User does not exist' }],
      };

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await updateUser(userId, { password: hashedPassword });

    if (!updatedUser)
      return {
        ok: false,
        status: 500,
        message: 'Update failed',
        errors: [
          {
            message: 'Server error. Something went wrong at updateUserProfile',
          },
        ],
      };

    return {
      ok: true,
      status: 200,
      message: 'successful',
      data: updatedUser,
    };
  } catch (e) {
    throw e;
  }
};
