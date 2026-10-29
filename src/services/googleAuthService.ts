// src/services/googleAuthService.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import crypto from 'crypto';
import { createUser, getUserByEmail, updateUser } from '../models/userModel';
import { db } from '../config/db';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/api/v1/google-auth/google/callback', // Updated
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error('No email provided by Google'));
        }

        let user = await getUserByEmail(email);
        if (!user) {
          user = await createUser({
            data: {
              firstname: profile.name?.givenName || 'Unknown',
              lastname: profile.name?.familyName || 'User',
              email,
              password: '',
              emailVerified: new Date(),
              role: 'USER',
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

const googleAuthCallbackService = async (user: any) => {
  try {
    if (!user) {
      return {
        ok: false,
        status: 401,
        message: 'Google authentication failed',
        errors: [{ message: 'Unable to authenticate with Google' }],
      };
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );
    return {
      ok: true,
      status: 200,
      message: 'Google authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
        },
      },
    };
  } catch (e) {
    throw e;
  }
};

// After Google sign in, the browser is sent back to the site with a one time
// code instead of the login token. The site swaps the code for the token with
// a POST request. The code works once, for 60 seconds, so even if the address
// is copied into analytics, logs or browser history, it is useless.
const GOOGLE_CODE_PREFIX = 'google-login:';
const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

const createGoogleLoginCode = async (userId: string) => {
  // Tidy up codes that were never used.
  await db.emailVerificationToken.deleteMany({
    where: {
      email: { startsWith: GOOGLE_CODE_PREFIX },
      expiresAt: { lt: new Date() },
    },
  });
  const code = crypto.randomBytes(32).toString('hex');
  await db.emailVerificationToken.create({
    data: {
      email: `${GOOGLE_CODE_PREFIX}${userId}`,
      otp: sha256(code),
      expiresAt: new Date(Date.now() + 60 * 1000),
    },
  });
  return code;
};

const exchangeGoogleLoginCodeService = async (code: unknown) => {
  const refused = {
    ok: false,
    status: 400,
    message: 'This sign in link has expired. Please sign in with Google again.',
  };
  if (typeof code !== 'string' || !/^[a-f0-9]{64}$/.test(code)) return refused;

  const record = await db.emailVerificationToken.findFirst({
    where: {
      otp: sha256(code),
      email: { startsWith: GOOGLE_CODE_PREFIX },
      expiresAt: { gt: new Date() },
    },
  });
  if (!record) return refused;

  // Single use: delete it before issuing the token.
  const deleted = await db.emailVerificationToken.deleteMany({
    where: { id: record.id },
  });
  if (deleted.count !== 1) return refused;

  const userId = record.email.slice(GOOGLE_CODE_PREFIX.length);
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
  await updateUser(userId, { lastLoginAt: new Date() });
  return { ok: true, status: 200, message: 'Signed in', data: { token } };
};

export {
  googleAuthCallbackService,
  createGoogleLoginCode,
  exchangeGoogleLoginCodeService,
};
