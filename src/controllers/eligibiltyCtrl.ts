import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../types/errorResponse';
import { submitEligibilityAnswersService } from '../services/eligibilityServices';

interface WetrocloudResponse {
  ok: boolean;
  message: string;
  status?: number;
  data?: any;
  errors?: { message: string }[];
  [key: string]: any;
}

interface ExamInput {
  examType: string;
  subjects: string[];
  grades: string[];
}

interface QualificationInput {
  courseId: string;
  exams: ExamInput[];
  preferences?: {
    university?: string;
    field?: string;
    location?: string;
  };
}

export const submitEligibilityAnswers = async (
  req: Request,
  res: Response<WetrocloudResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    // const userId = (req.user as any)?.id ?? '';
    const { courseId, exams, preferences } = req.body as QualificationInput;
    const { email } = req.user as any;

    if (!courseId || !exams || !Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Course ID and exams array are required',
      });
    }

    if (
      !exams.some(
        (e) =>
          ['UTME', 'JAMB'].includes(e.examType.toUpperCase()) &&
          e.subjects.length >= 4 &&
          e.subjects.some((s) => s.toLowerCase() === 'english')
      )
    ) {
      return res.status(400).json({
        ok: false,
        message:
          'JAMB/UTME exam with at least 4 subjects including English is required',
      });
    }

    if (exams.some((e) => e.subjects.length !== e.grades.length)) {
      return res.status(400).json({
        ok: false,
        message: 'Each exam must have equal numbers of subjects and grades',
      });
    }

    const result = await submitEligibilityAnswersService(email, {
      courseId,
      exams,
      preferences,
    });
    res.status(result.status || 200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEligibilityResults = async (
  req: Request,
  res: Response<WetrocloudResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.id ?? '';
    // const result = await getEligibilityResultsService(userId);
    // res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// ```
