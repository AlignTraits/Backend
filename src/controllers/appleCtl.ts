// // src/services/appleAuthService.ts
// import passport from 'passport';
// import { Strategy as AppleStrategy } from 'passport-apple';
// import { createUser, getUserByEmail } from '../models/userModel';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID as string,
//       teamID: process.env.APPLE_TEAM_ID as string,
//       keyID: process.env.APPLE_KEY_ID as string,
//       key: process.env.APPLE_PRIVATE_KEY as string,
//       callbackURL: process.env.APPLE_CALLBACK_URL as string,
//       scope: ['name', 'email'],
//     },
//     async (
//       accessToken: string,
//       refreshToken: string,
//       profile: any,
//       done: (err: any, user?: any) => void
//     ) => {
//       try {
//         const email = profile.email;
//         if (!email) return done(new Error('No email provided by Apple'));

//         let user = await getUserByEmail(email);
//         if (!user) {
//           user = await createUser({
//             data: {
//               firstname: profile.name?.firstName || 'Unknown',
//               lastname: profile.name?.lastName || 'User',
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

// const appleAuthCallbackService = async (user: any) => {
//   if (!user) {
//     return {
//       ok: false,
//       status: 401,
//       message: 'Apple authentication failed',
//     };
//   }

//   const token = jwt.sign(
//     { userId: user.id },
//     process.env.JWT_SECRET as string,
//     { expiresIn: '1h' }
//   );
//   return {
//     ok: true,
//     status: 200,
//     message: 'Apple authentication successful',
//     data: { token, user },
//   };
// };

// export { appleAuthCallbackService };
