import sharp from 'sharp';
import cloudinary from '../config/cloudinary';
import bcrypt from 'bcryptjs';
import { getUserById, updateUser } from '../models/userModel';
import { parseDate } from '../lib/utils';
import { db } from '../config/db';

export const getAdminDataService = async (userId: string) => {
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
      message: 'Admin found',
      data: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    };
  } catch (e) {
    throw e;
  }
};

//Admin end

// services/userServices.ts (updated getUserDataService)
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
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        gender: user.gender,
        dob: user.dob,
        ageRange: user.ageRange,
        region: user.region,
        bio: user.bio,
        otherSkill: user.otherSkill, // Include otherSkill
        skills: user.skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
        })), // Include skills
      },
    };
  } catch (e) {
    throw e;
  }
};

export const updatePasswordService = async (
  userId: string,
  password: string
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

// convert date before updating user profile

// export const updateUserProfileService = async (
//   userId: string,
//   filteredData: Record<string, any>
// ) => {
//   try {
//     if (!userId)
//       return {
//         ok: false,
//         status: 400,
//         message: 'Update failed',
//         errors: [{ message: 'Invalid user ID' }],
//       };

//     const existingUser = await getUserById(userId);
//     if (!existingUser) {
//       return {
//         ok: false,
//         status: 404,
//         message: 'User not found',
//         errors: [{ message: 'User does not exist' }],
//       };
//     }

//     // Parse dob to ensure it's a valid ISO-8601 string if it exists in filteredData
//     if (filteredData.dob) {
//       try {
//         filteredData.dob = parseDate(filteredData.dob);
//       } catch (error) {
//         return {
//           ok: false,
//           status: 400,
//           message: 'Invalid date format',
//           errors: [{ message: 'Date of birth format is incorrect' }],
//         };
//       }
//     }
//     // security measurements
//     const updatedUser = await updateUser(userId, filteredData);

//     if (!updatedUser)
//       return {
//         ok: false,
//         status: 500,
//         message: 'Update failed',
//         errors: [
//           {
//             message: 'Server error. Something went wrong at updateUserProfile',
//           },
//         ],
//       };

//     return {
//       ok: true,
//       status: 200,
//       message: 'User updated successfully',
//       data: {
//         id: updatedUser.id,
//         firstname: updatedUser.firstname,
//         lastname: updatedUser.lastname,
//         email: updatedUser.email,
//         image: updatedUser.image,
//         role: updatedUser.role,
//         gender: updatedUser.gender,
//         dob: updatedUser.dob,
//         region: updatedUser.region,
//         bio: updatedUser.bio,
//       },
//     };
//   } catch (e) {
//     throw e;
//   }
// };

// Updated updateUserProfileService to handle skill IDs and otherSkill
export const updateUserProfileService = async (
  userId: string,
  filteredData: Record<string, any>
) => {
  try {
    if (!userId) {
      return {
        ok: false,
        status: 400,
        message: 'Update failed',
        errors: [{ message: 'Invalid user ID' }],
      };
    }

    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return {
        ok: false,
        status: 404,
        message: 'User not found',
        errors: [{ message: 'User does not exist' }],
      };
    }

    // Parse dob to ensure it's a valid ISO-8601 string if it exists in filteredData
    if (filteredData.dob) {
      try {
        filteredData.dob = parseDate(filteredData.dob);
      } catch (error) {
        return {
          ok: false,
          status: 400,
          message: 'Invalid date format',
          errors: [{ message: 'Date of birth format is incorrect' }],
        };
      }
    }

    // Handle skills if provided (array of skill IDs)
    let skillIds: string[] = [];
    if (filteredData.skills) {
      const skillsInput = Array.isArray(filteredData.skills)
        ? filteredData.skills
        : [filteredData.skills];

      // Validate that all skill IDs exist
      const validSkillIds = await Promise.all(
        skillsInput.map(async (skillId: string) => {
          const skill = await db.skill.findUnique({ where: { id: skillId } });
          if (!skill) {
            throw new Error(`Skill with ID ${skillId} not found`);
          }
          return skillId;
        })
      );
      skillIds = validSkillIds;

      // Update the user's skills relation
      await db.user.update({
        where: { id: userId },
        data: {
          skills: {
            set: skillIds.map((id) => ({ id })), // Overwrite existing skills with selected ones
          },
        },
      });

      // Remove skills from filteredData to avoid passing it to updateUser
      delete filteredData.skills;
    }

    // Handle otherSkill if provided
    if (filteredData.otherSkill !== undefined) {
      // Ensure otherSkill is a string or null/undefined
      if (
        filteredData.otherSkill !== null &&
        typeof filteredData.otherSkill !== 'string'
      ) {
        return {
          ok: false,
          status: 400,
          message: 'Invalid otherSkill format',
          errors: [{ message: 'otherSkill must be a string or null' }],
        };
      }
    }

    // Update the user profile with the remaining fields, including otherSkill
    const updatedUser = await updateUser(userId, filteredData);

    if (!updatedUser) {
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
    }

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
        otherSkill: updatedUser.otherSkill, // Now included in the return type
        skills: updatedUser.skills,
        // skills: updatedUser.skills.map((skill) => ({
        //   id: skill.id,
        //   name: skill.name,
        // })),
      },
    };
  } catch (e) {
    if (e instanceof Error && e.message.includes('Skill with ID')) {
      return {
        ok: false,
        status: 404,
        message: 'Invalid skill selection',
        errors: [{ message: e.message }],
      };
    }
    throw e;
  }
};
