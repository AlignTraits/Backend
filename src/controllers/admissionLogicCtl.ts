// controllers/admissionController.ts
import { Request, Response } from 'express';
import Papa from 'papaparse';
import {
  updateBulkCourseAdmissionsService,
  updateCourseAdmissionService,
  createAcademicRecordService,
  updateAcademicRecordService,
  deleteAcademicRecordService,
  getAcademicRecordService,
  addUserRecordByEmailService,
} from '../services/admissionLogicServices';
import MessageResponse from '../types/messageResponse';
import {
  UpdateCourseAdmissionData,
  AcademicRecordData,
} from '../types/school-course-types';

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

    // jamb
    jambCutOffMark,
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
    jambCutOffMark,
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
      //       if (typeof value === 'string') {
      //         if (value.startsWith('[')) {
      //           return JSON.parse(value); // Handle JSON array
      //         }
      //         return value.split(',').map((item) => item.trim()); // Handle comma-separated
      //       }
      //       return value; // Already an array, return as-is
      //     }
      //   }
      //   return value;
      // },

      transform: (value, field) => {
        if (typeof field === 'string') {
          if (field.includes('Subjects') || field.includes('SubGrades')) {
            if (typeof value === 'string') {
              let trimmed = value.trim();

              if (trimmed.startsWith('[')) {
                // TEMPORARY: flatten "X" / "Y" either-or groups into plain
                // comma-separated entries, e.g. "Government" / "History"
                // becomes "Government", "History". This loses the either-or
                // semantics (both will be treated as required, not
                // alternatives) — acceptable for now, but matching logic
                // should be revisited to properly model OR-groups later
                // (see conversation: Option B).
                trimmed = trimmed.replace(/\s*\/\s*/g, ', ');

                try {
                  return JSON.parse(trimmed);
                } catch {
                  try {
                    return JSON.parse(trimmed.replace(/'/g, '"'));
                  } catch {
                    console.warn(
                      `Could not parse array for field "${field}": ${trimmed}`
                    );
                    return trimmed;
                  }
                }
              }
              return value.split(',').map((item) => item.trim());
            }
            return value;
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

// export const updateBulkCourseAdmissionsController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).send({ error: 'CSV file is required' });
//     }

//     const fileName = file.originalname;
//     const csvData = file.buffer.toString('utf-8');

//     const parsedData = Papa.parse<UpdateCourseAdmissionData>(csvData, {
//       header: true,
//       skipEmptyLines: true,
//       dynamicTyping: true,
//       transform: (value, field) => {
//         if (typeof field === 'string') {
//           if (field.includes('Subjects') || field.includes('SubGrades')) {
//             if (typeof value === 'string') {
//               const trimmed = value.trim();
//               if (trimmed.startsWith('[')) {
//                 try {
//                   return JSON.parse(trimmed);
//                 } catch {
//                   try {
//                     return JSON.parse(trimmed.replace(/'/g, '"'));
//                   } catch {
//                     console.warn(
//                       `Could not parse array for field "${field}": ${trimmed}`
//                     );
//                     return trimmed; // flagged as invalid below
//                   }
//                 }
//               }
//               return value.split(',').map((item) => item.trim());
//             }
//             return value;
//           }
//         }
//         return value;
//       },
//     });

//     if (parsedData.errors.length > 0) {
//       return res.status(400).send({
//         error: 'Invalid CSV data',
//         details: parsedData.errors,
//       });
//     }

//     // Catch rows where a Subjects/SubGrades field failed to parse into an
//     // array (i.e. transform fell back to returning a raw string) — report
//     // these instead of letting them silently corrupt stored data.
//     const subjectFieldNames = Array.from({ length: 10 }, (_, i) => [
//       `ExamType${i + 1}Subjects`,
//       `ExamType${i + 1}SubGrades`,
//     ]).flat();

//     const rowErrors: { row: number; id?: string; field: string; value: any }[] =
//       [];
//     parsedData.data.forEach((row: any, index: number) => {
//       subjectFieldNames.forEach((field) => {
//         if (row[field] !== undefined && !Array.isArray(row[field])) {
//           rowErrors.push({
//             row: index + 2,
//             id: row.id,
//             field,
//             value: row[field],
//           }); // +2: header row + 0-index
//         }
//       });
//     });

//     if (rowErrors.length > 0) {
//       return res.status(400).json({
//         error:
//           'Some rows contain invalid array data (check quote style — use double quotes, e.g. ["Biology","Math"])',
//         rowErrors,
//       });
//     }

//     const admissionsToUpdate = parsedData.data;
//     const userId = (req as any)?.user?.id ?? '';
//     const updatedAdmissions = await updateBulkCourseAdmissionsService(
//       admissionsToUpdate,
//       userId,
//       fileName
//     );

//     res.status(200).json({
//       message: 'Course admission logic updated successfully',
//       data: updatedAdmissions,
//     });
//   } catch (error) {
//     console.error('Error updating course admission logic:', error);
//     res.status(500).send({
//       error: 'An error occurred while updating the course admission logic',
//     });
//   }
// };

// Create academic record
export const createAcademicRecordController = async (
  req: Request,
  res: Response<MessageResponse>
) => {
  const userId = (req as any)?.user?.id ?? '';
  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: User ID not found',
      ok: false,
    });
  }

  const academicRecordData: AcademicRecordData = {
    userId,
    ...req.body,
  };

  const result = await createAcademicRecordService(academicRecordData);
  res.status(result.status).json({
    message: result.message,
    ...(result.data && { data: result.data }),
    ...(result.errors && { errors: result.errors }),
    ok: result.ok,
  });
};

// Update academic record
export const updateAcademicRecordController = async (
  req: Request,
  res: Response<MessageResponse>
) => {
  const userId = (req as any)?.user?.id ?? '';
  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: User ID not found',
      ok: false,
    });
  }

  const { id } = req.params;
  const academicRecordData: AcademicRecordData = {
    id,
    userId,
    ...req.body,
  };

  const result = await updateAcademicRecordService(academicRecordData);
  res.status(result.status).json({
    message: result.message,
    ...(result.data && { data: result.data }),
    ...(result.errors && { errors: result.errors }),
    ok: result.ok,
  });
};

// Delete academic record
export const deleteAcademicRecordController = async (
  req: Request,
  res: Response<MessageResponse>
) => {
  const userId = (req as any)?.user?.id ?? '';
  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: User ID not found',
      ok: false,
    });
  }

  const { id } = req.params;

  const result = await deleteAcademicRecordService({ id, userId });
  res.status(result.status).json({
    message: result.message,
    ...(result.data && { data: result.data }), // Only include data if it exists
    ...(result.errors && { errors: result.errors }), // Only include errors if they exist
    ok: result.ok,
  });
};

// Fetch academic record
export const getAcademicRecordController = async (
  req: Request,
  res: Response<MessageResponse>
) => {
  const userId = (req as any)?.user?.id ?? '';
  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized: User ID not found',
      ok: false,
    });
  }

  const result = await getAcademicRecordService({ userId });
  res.status(result.status).json({
    message: result.message,
    ...(result.data && { data: result.data }),
    ...(result.errors && { errors: result.errors }),
    ok: result.ok,
  });
};

// New controller function for adding academic record by email
export const addUserRecordByEmailController = async (
  req: Request,
  res: Response<MessageResponse>
) => {
  const { email, ...academicRecordData } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      message: 'Email is required and must be a string',
      ok: false,
    });
  }

  const academicRecordDataByEmail: AcademicRecordData = {
    email,
    ...academicRecordData,
  };

  const result = await addUserRecordByEmailService(academicRecordDataByEmail);
  res.status(result.status).json({
    message: result.message,
    ...(result.data && { data: result.data }),
    ...(result.errors && { errors: result.errors }),
    ok: result.ok,
  });
};
