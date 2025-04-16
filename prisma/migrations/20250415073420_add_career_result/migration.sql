-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);

-- CreateTable
CREATE TABLE "CareerResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recommendedCareers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerResult_userId_key" ON "CareerResult"("userId");

-- AddForeignKey
ALTER TABLE "CareerResult" ADD CONSTRAINT "CareerResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
