import { db } from '../config/db';

export const saveEmailVerificationToken = async ({
  id,
  email,
  otp,
  expirationTime,
}: {
  id: string;
  email: string;
  otp: string;
  expirationTime: Date;
}) => {
  return db.emailVerificationToken.upsert({
    where: { id: id ?? '' },
    update: {
      otp,
      expiresAt: expirationTime,
    },
    create: {
      email,
      otp,
      expiresAt: expirationTime,
    },
  });
};

export const getEmailVerificationTokenByToken = async (token: string) => {
  return db.emailVerificationToken.findFirst({
    where: {
      otp: token,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getEmailVerificationTokenByEmail = async (email: string) => {
  return db.emailVerificationToken.findFirst({
    where: {
      email,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteEmailVerificationToken = async (email: string) => {
  // try {
  return db.emailVerificationToken.deleteMany({ where: { email } });
  // } catch (error) {
  //     return null;
  // }
};
