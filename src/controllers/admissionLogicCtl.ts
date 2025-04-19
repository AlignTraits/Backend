// controllers/admissionController.ts
import { Request, Response } from 'express';
import Papa from 'papaparse';
import {
  updateBulkCourseAdmissionsService,
  updateCourseAdmissionService,
} from '../services/admissionLogicServices';
import MessageResponse from '../types/messageResponse';
import { UpdateCourseAdmissionData } from '../types/school-course-types';

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

// Controller for bulk admission logic update
export const updateBulkCourseAdmissionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send({ error: 'CSV file is required' });
    }

    const fileName = file.originalname;

    const csvData = file.buffer.toString('utf-8');
    const parsedData = Papa.parse<UpdateCourseAdmissionData>(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      // transform: (value, field) => {
      //   if (typeof field === 'string') {
      //     if (field.includes('Subjects') || field.includes('SubGrades')) {
      //       return value && typeof value === 'string'
      //         ? value.split(',').map((item) => item.trim())
      //         : undefined;
      //     }
      //   }
      //   return value;
      // },
      transform: (value, field) => {
        if (typeof field === 'string') {
          if (field.includes('Subjects') || field.includes('SubGrades')) {
            if (typeof value === 'string') {
              if (value.startsWith('[')) {
                return JSON.parse(value); // Handle JSON array
              }
              return value.split(',').map((item) => item.trim()); // Handle comma-separated
            }
            return value; // Already an array, return as-is
          }
        }
        return value;
      },
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).send({ error: 'Invalid CSV data' });
    }

    const admissionsToUpdate = parsedData.data;
    const userId = (req as any)?.user?.id ?? '';
    const updatedAdmissions = await updateBulkCourseAdmissionsService(
      admissionsToUpdate,
      userId,
      fileName
    );

    res.status(200).json({
      message: 'Course admission logic updated successfully',
      data: updatedAdmissions,
    });
  } catch (error) {
    console.error('Error updating course admission logic:', error);
    res.status(500).send({
      error: 'An error occurred while updating the course admission logic',
    });
  }
};
