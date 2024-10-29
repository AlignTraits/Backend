import {
  createAnswerOption,
  createUserResponse,
  getAnswerOptions,
  getQuestions,
  createQuestion,
  getUserResponses,
} from '../models/surveyModel';

export const createAnswerOptionService = async ({
  text,
  isNotSure,
  questionId,
}: {
  text: string;
  isNotSure: boolean;
  questionId: string;
}) => {
  try {
    const answerOption = await createAnswerOption({
      data: {
        text,
        isNotSure,
        question: { connect: { id: questionId } },
      },
    });

    if (!answerOption) throw new Error('didn create a new option');

    return answerOption;
  } catch (e) {
    throw e;
  }
};

export const getAnswerOptionsService = async () => {
  try {
    const answerOptions = await getAnswerOptions();
    return answerOptions;
  } catch (error) {
    throw error;
  }
};

export const createUserResponseService = async ({
  userId,
  questionId,
  selectedOptionId,
}: {
  userId: string;
  questionId: string;
  selectedOptionId: string;
}) => {
  try {
    const userResponse = await createUserResponse({
      data: {
        user: { connect: { id: userId } },
        question: { connect: { id: questionId } },
        selectedOption: { connect: { id: selectedOptionId } },
      },
    });

    return userResponse;
  } catch (e) {
    throw e;
  }
};

export const getUserResponseService = async () => {
  try {
    const res = await getUserResponses();
    return res;
  } catch (error) {
    throw error;
  }
};

export const createQuestionService = async ({
  text,
  sectionId,
}: {
  text: string;
  sectionId: string;
}) => {
  try {
    const res = await createQuestion({ data: { text, sectionId } });
    return res;
  } catch (e) {
    throw e;
  }
};

export const getQuestion = async () => {
  try {
    const res = await getQuestions();
    return res;
  } catch (e) {
    throw e;
  }
};
