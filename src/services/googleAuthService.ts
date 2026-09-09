// src/services/googleAuthService.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createUser, getUserByEmail } from '../models/userModel';
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

export { googleAuthCallbackService };
