// // src/services/facebookAuthService.ts
// import passport from 'passport';
// import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { createUser, getUserByEmail } from '../models/userModel';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID as string,
//       clientSecret: process.env.FACEBOOK_APP_SECRET as string,
//       callbackURL: process.env.FACEBOOK_CALLBACK_URL as string,
//       profileFields: ['id', 'emails', 'name'],
//     },
//     async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
//       try {
//         const email = profile.emails?.[0]?.value;
//         if (!email) return done(new Error('No email provided by Facebook'));

//         let user = await getUserByEmail(email);
//         if (!user) {
//           user = await createUser({
//             data: {
//               firstname: profile.name?.givenName || 'Unknown',
//               lastname: profile.name?.familyName || 'User',
//               email,
//               password: '',
//               emailVerified: new Date(),
//               role: 'USER',
//             },
//           });
//         }
//         return done(null, user);
//       } catch (error) {
//         return done(error as Error);
//       }
//     }
//   )
// );

// const facebookAuthCallbackService = async (user: any) => {
//   if (!user) {
//     return {
//       ok: false,
//       status: 401,
//       message: 'Facebook authentication failed',
//     };
//   }

//   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
//   return {
//     ok: true,
//     status: 200,
//     message: 'Facebook authentication successful',
//     data: { token, user },
//   };
// };

// export { facebookAuthCallbackService };
