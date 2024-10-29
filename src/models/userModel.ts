import { db } from '../config/db';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

const createUser = async (userData: Prisma.UserCreateArgs<DefaultArgs>) => {
  return db.user.create(userData);
};

const getUserByEmail = async (email: string) => {
  return db.user.findUnique({ where: { email } });
};

const getUserById = async (email: string) => {
  return db.user.findUnique({ where: { email } });
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
  >,
) => {
  return db.user.update({
    where: { id },
    data: updateData,
  });
};

export { createUser, getUserByEmail, getUserById, updateUser };
