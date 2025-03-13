import { Gender, Roles } from '@prisma/client';
// // src/types/express.d.ts
// import { User } from '@prisma/client';
// // import { Multer } from 'multer';

// declare module 'express-serve-static-core' {
//   interface Request {
//     user?: User;
//   }
// }

declare global {
  namespace Express {
    interface User {
      id: string;
      firstname: string;
      lastname: string;
      username: string | null;
      email: string;
      emailVerified: Date | null;
      password: string;
      role: Roles;
      contactNumber: string | null;
      gender: Gender | null;
      dob: Date | null;
      ageRange: string | null;
      region: string | null;
      bio: string | null;
      image: string | null;
      createdAt: Date;
      updatedAt: Date | null;
    }

    interface Request {
      user?: User;
    }
  }
}
