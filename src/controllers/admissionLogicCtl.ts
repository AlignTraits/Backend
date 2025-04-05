// controllers/admissionController.ts
import { Request, Response } from 'express';
import { updateCourseAdmissionService } from '../services/admissionLogicServices';
import MessageResponse from '../types/messageResponse';

export const updateCourseAdmissionController = async (
  req: Request,
  res: Response<MessageResponse>
) => {
  const userId = (req as any)?.user?.id ?? ''; // From adminLoginRequired middleware
  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: User ID not found',
      ok: false,
    });
  }

  const { id } = req.params;
  const {
    ExamCountry1,
    ExamType1,
    ExamType1Subjects,
    ExamType1SubGrades,
    ExamCountry2,
    ExamType2,
    ExamType2Subjects,
    ExamType2SubGrades,
    ExamCountry3,
    ExamType3,
    ExamType3Subjects,
    ExamType3SubGrades,
    ExamCountry4,
    ExamType4,
    ExamType4Subjects,
    ExamType4SubGrades,
    ExamCountry5,
    ExamType5,
    ExamType5Subjects,
    ExamType5SubGrades,
    ExamCountry6,
    ExamType6,
    ExamType6Subjects,
    ExamType6SubGrades,
    ExamCountry7,
    ExamType7,
    ExamType7Subjects,
    ExamType7SubGrades,
    ExamCountry8,
    ExamType8,
    ExamType8Subjects,
    ExamType8SubGrades,
    ExamCountry9,
    ExamType9,
    ExamType9Subjects,
    ExamType9SubGrades,
    ExamCountry10,
    ExamType10,
    ExamType10Subjects,
    ExamType10SubGrades,
    Adminrule1,
    Adminrule2,
    Adminrule3,
    Adminrule4,
    Adminrule5,
  } = req.body;

  const result = await updateCourseAdmissionService({
    id,
    ExamCountry1,
    ExamType1,
    ExamType1Subjects,
    ExamType1SubGrades,
    ExamCountry2,
    ExamType2,
    ExamType2Subjects,
    ExamType2SubGrades,
    ExamCountry3,
    ExamType3,
    ExamType3Subjects,
    ExamType3SubGrades,
    ExamCountry4,
    ExamType4,
    ExamType4Subjects,
    ExamType4SubGrades,
    ExamCountry5,
    ExamType5,
    ExamType5Subjects,
    ExamType5SubGrades,
    ExamCountry6,
    ExamType6,
    ExamType6Subjects,
    ExamType6SubGrades,
    ExamCountry7,
    ExamType7,
    ExamType7Subjects,
    ExamType7SubGrades,
    ExamCountry8,
    ExamType8,
    ExamType8Subjects,
    ExamType8SubGrades,
    ExamCountry9,
    ExamType9,
    ExamType9Subjects,
    ExamType9SubGrades,
    ExamCountry10,
    ExamType10,
    ExamType10Subjects,
    ExamType10SubGrades,
    Adminrule1,
    Adminrule2,
    Adminrule3,
    Adminrule4,
    Adminrule5,
    userId,
  });

  res.status(result.status).json({
    message: result.message,
    ...(result.data && { data: result.data }),
    ...(result.errors && { errors: result.errors }),
    ok: false,
  });
};
