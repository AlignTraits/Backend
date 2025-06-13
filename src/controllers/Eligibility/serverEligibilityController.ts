import { NextFunction, Request, Response } from 'express';
import { submitServerEligibilityAnswersService } from '../../services/eligibility/serverEligibilityService';

interface WetrocloudResponse {
  ok: boolean;
  message: string;
  data?: any;
  status?: number;
  errors?: { message: string }[];
  [key: string]: any;
}

interface ErrorResponse {
  ok: false;
  message: string;
}

interface ExamInput {
  examType: string;
  subjects: string[];
  grades: string[];
}

interface ServerQualificationInput {
  courseId: string;
  exams: ExamInput[];
  preferences?: {
    university?: string;
    field?: string;
    location?: string;
  };
}

export const submitServerEligibilityAnswers = async (
  req: Request,
  res: Response<WetrocloudResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    // const userId = (req.user as any)?.id ?? '';
    const { email } = req.body as any;

    const body = req.body as ServerQualificationInput;
    const { courseId, exams, preferences } = body;

    if (!courseId || !exams || !Array.isArray(exams)) {
      return res.status(400).json({
        ok: false,
        message: 'Course ID and exams array are required',
      });
    }

    if (
      !exams.some(
        (e) =>
          ['UTME', 'JAMB'].includes(e.examType.toUpperCase()) &&
          e.subjects.some((s) => s.toLowerCase() === 'english')
      )
    ) {
      return res.status(400).json({
        ok: false,
        message: 'JAMB/UTME exam with English is required',
      });
    }

    const result = await submitServerEligibilityAnswersService(email, {
      courseId,
      exams,
      preferences,
    });

    res.status(result.ok ? 200 : result.status || 400).json(result);
  } catch (error) {
    next(error);
  }
};
