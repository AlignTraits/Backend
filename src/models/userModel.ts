// models/userModel.ts
import { db } from '../config/db';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

const createUser = async (userData: Prisma.UserCreateArgs<DefaultArgs>) => {
  return db.user.create(userData);
};

// const getUserByEmail = async (email: string) => {
//   const a = await db.user.findUnique({ where: { email } });
//   console.log(a);
//   return a;
// };

// const getUserById = async (userId: string) => {
//   return db.user.findUnique({
//     where: { id: userId },
//     include: {
//       skills: true, // Include the skills relation
//     },
//   });
// };

const getUserByEmail = async (email: string) => {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const a = await db.user.findUnique({ where: { email } });
      console.log(a);
      return a;
    } catch (error) {
      if (
        attempt === maxRetries ||
        !(
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as any).message === 'string' &&
          (error as any).message.includes('connection pool')
        )
      ) {
        throw error;
      }
      console.warn(
        `Retry ${attempt}/${maxRetries} due to connection pool timeout`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff: 1s, 2s, 3s
    }
  }
};

const getUserById = async (userId: string) => {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          skills: true, // Include the skills relation
        },
      });
      return user;
    } catch (error) {
      if (
        attempt === maxRetries ||
        !(
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as any).message === 'string' &&
          (error as any).message.includes('connection pool')
        )
      ) {
        throw error;
      }
      console.warn(
        `Retry ${attempt}/${maxRetries} due to connection pool timeout`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff: 1s, 2s, 3s
    }
  }
};

const safeGetUserById = async (email: string) => {
  return db.user.findUnique({
    where: { email },
    include: {
      skills: true, // Include the skills relation
    },
  });
};

const updateUser = async (
  id: string,
  updateData: Prisma.XOR<
    Prisma.UserUpdateInput,
    Prisma.UserUncheckedUpdateInput
  >
) => {
  return db.user.update({
    where: { id },
    data: updateData,
    include: {
      skills: true, // Include the skills relation
    },
  });
};

const deleteUser = async (id: string) => {
  try {
    return await db.user.delete({
      where: { id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('User not found');
    }
    throw error;
  }
};

export { createUser, getUserByEmail, getUserById, updateUser, deleteUser };
