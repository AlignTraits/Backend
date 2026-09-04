import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateFeedbackInput {
  isSatisfied: boolean;
  suggestion?: string;
  emailAddress: string;
}

export const createFeedback = async ({
  isSatisfied,
  suggestion,
  emailAddress,
}: CreateFeedbackInput) => {
  return await prisma.feedback.create({
    data: {
      isSatisfied,
      suggestion: suggestion || null,
      emailAddress,
    },
  });
};
