import express from 'express';
import passport from 'passport';
import googleController from '../controllers/googleCtl'; // Fixed import
import MessageResponse from '../types/messageResponse';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  })
);

router.get<{}, MessageResponse>(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  googleController.googleAuthCallback
);

export default router;

// http://localhost:3000/api/v1/google-auth/google/callback
// http://localhost:3000/api/v1/google-auth/google
