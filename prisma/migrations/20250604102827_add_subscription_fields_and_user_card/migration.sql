-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "id" SET DEFAULT substring(gen_random_uuid()::text, 1, 10);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "schoolLocation" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "default_authorization" TEXT,
ADD COLUMN     "email_token" TEXT,
ADD COLUMN     "subscription_code" TEXT;

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorization_code" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "exp_month" TEXT NOT NULL,
    "exp_year" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "reusable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_authorization_code_key" ON "UserCard"("authorization_code");

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
