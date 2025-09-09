// Old Working Code
// import { PrismaClient } from '@prisma/client';

// // Type assertion to avoid global augmentation
// const globalPrisma = globalThis as { prisma?: PrismaClient };

// export const db = globalPrisma.prisma ?? new PrismaClient();

// if (process.env.NODE_ENV !== 'production') {
//   globalPrisma.prisma = db;
// }

// New Working Code
import { PrismaClient } from '@prisma/client';

const globalPrisma = globalThis as { prisma?: PrismaClient };

export const db =
  globalPrisma.prisma ??
  new PrismaClient({
    // Increase transaction timeout for bulk operations
    transactionOptions: {
      timeout: 120000, // Align with bulk operation needs 12 sec
      maxWait: 120000,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalPrisma.prisma = db;
}
