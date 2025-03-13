// import { PrismaClient } from '@prisma/client';

// // Declare a global type for PrismaClient to prevent multiple instantiations in development
// declare global {
//   var prisma: PrismaClient | undefined;
// }

// export const db = globalThis.prisma || new PrismaClient();
// if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

// new
// src/db.ts (or wherever this lives)
// src/db.ts
import { PrismaClient } from '@prisma/client';

// Type assertion to avoid global augmentation
const globalPrisma = globalThis as { prisma?: PrismaClient };

export const db = globalPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalPrisma.prisma = db;
}
