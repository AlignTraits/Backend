/*
  Warnings:

  - You are about to drop the column `examTypes` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `examYear` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `grades` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `programLocation` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `ruleDescription` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `ruleName` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `ruleRequiredExams` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `scholarshipRequirement` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `subjects` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "examTypes",
DROP COLUMN "examYear",
DROP COLUMN "grades",
DROP COLUMN "programLocation",
DROP COLUMN "ruleDescription",
DROP COLUMN "ruleName",
DROP COLUMN "ruleRequiredExams",
DROP COLUMN "scholarshipRequirement",
DROP COLUMN "subjects",
ADD COLUMN     "scholarshipInformation" TEXT,
ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10),
ALTER COLUMN "ratings" DROP NOT NULL;

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);
