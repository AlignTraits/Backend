import { db } from '../config/db';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

const createUser = async (userData: Prisma.UserCreateArgs<DefaultArgs>) => {
  return db.user.create(userData);
};

const getUserByEmail = async (email: string) => {
  const a = await db.user.findUnique({ where: { email } });
  console.log(a);
  return a;
};

const getUserById = async (userId: string) => {
  return db.user.findUnique({ where: { id: userId } });
  // console.log(userId);
};

const safeGetUserById = async (email: string) => {
  return db.user.findUnique({
    where: { email },
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
    data: updateData, // pass the update details to data to replicate on the schema
  });
};

export { createUser, getUserByEmail, getUserById, updateUser };
