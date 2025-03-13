/*
  Warnings:

  - You are about to drop the column `location` on the `School` table. All the data in the column will be lost.
  - Added the required column `country` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Roles" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "ActionHistory" DROP CONSTRAINT "ActionHistory_userId_fkey";

-- AlterTable
ALTER TABLE "ActionHistory" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);

-- AlterTable
ALTER TABLE "School" DROP COLUMN "location",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);

-- AddForeignKey
ALTER TABLE "ActionHistory" ADD CONSTRAINT "ActionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
