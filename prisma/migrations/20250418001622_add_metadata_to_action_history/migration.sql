-- AlterTable
ALTER TABLE "ActionHistory" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "CareerResult" ADD COLUMN     "reasoning" TEXT;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);
