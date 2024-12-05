import { Prisma } from '@prisma/client';
import { db } from '../config/db';

export const createAnswerOption = async (
  data: Prisma.AnswerOptionCreateArgs
) => {
  const response = await db.answerOption.create(data);
  return response;
};

export const getAnswerOptions = async () => {
  return db.answerOption.findMany();
};

export const createUserResponse = async (
  data: Prisma.UserResponseCreateArgs
) => {
  return db.userResponse.create(data);
};

export const getUserResponses = async () => {
  return db.userResponse.findMany();
};

export const createQuestion = async (data: Prisma.QuestionCreateArgs) => {
  return db.question.create(data);
};

export const getQuestions = async () => {
  return db.question.findMany();
};
