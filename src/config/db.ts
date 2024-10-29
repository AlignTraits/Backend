import { PrismaClient } from '@prisma/client';

// Declare a global type for PrismaClient to prevent multiple instantiations in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
