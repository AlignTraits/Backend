// services/admissionService.ts
import { db } from '../config/db';
import {
  AcademicRecordData,
  UpdateCourseAdmissionData,
} from '../types/school-course-types';

export const updateCourseAdmissionService = async ({
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
}: UpdateCourseAdmissionData & { userId: string }) => {
  try {
    const existingCourse = await db.course.findUnique({ where: { id } });
    if (!existingCourse) {
      return { ok: false, status: 404, message: 'Course not found' };
    }

    const stringifyIfArray = (value: any, fallback: any) => {
      return Array.isArray(value)
        ? JSON.stringify(value)
        : value !== undefined
          ? value
          : fallback;
    };

    // Validation function to check subjects and grades
    const validateSubjectsAndGrades = (
      subjects: any,
      grades: any,
      examNumber: number
    ) => {
      const hasSubjects = subjects !== undefined;
      const hasGrades = grades !== undefined;

      // If either is provided, both must be provided
      if (hasSubjects !== hasGrades) {
        throw new Error(
          `ExamType${examNumber}: Both subjects and grades must be provided together`
        );
      }

      // If both are provided, check their lengths match
      if (hasSubjects && hasGrades) {
        const subjectsArray = Array.isArray(subjects)
          ? subjects
          : JSON.parse(subjects || '[]');
        const gradesArray = Array.isArray(grades)
          ? grades
          : JSON.parse(grades || '[]');

        if (subjectsArray.length !== gradesArray.length) {
          throw new Error(
            `ExamType${examNumber}: Number of subjects (${subjectsArray.length}) does not match number of grades (${gradesArray.length})`
          );
        }
      }
    };

    // Validate all exam types
    validateSubjectsAndGrades(ExamType1Subjects, ExamType1SubGrades, 1);
    validateSubjectsAndGrades(ExamType2Subjects, ExamType2SubGrades, 2);
    validateSubjectsAndGrades(ExamType3Subjects, ExamType3SubGrades, 3);
    validateSubjectsAndGrades(ExamType4Subjects, ExamType4SubGrades, 4);
    validateSubjectsAndGrades(ExamType5Subjects, ExamType5SubGrades, 5);
    validateSubjectsAndGrades(ExamType6Subjects, ExamType6SubGrades, 6);
    validateSubjectsAndGrades(ExamType7Subjects, ExamType7SubGrades, 7);
    validateSubjectsAndGrades(ExamType8Subjects, ExamType8SubGrades, 8);
    validateSubjectsAndGrades(ExamType9Subjects, ExamType9SubGrades, 9);
    validateSubjectsAndGrades(ExamType10Subjects, ExamType10SubGrades, 10);

    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        ExamCountry1: ExamCountry1 ?? existingCourse.ExamCountry1,
        ExamType1: ExamType1 ?? existingCourse.ExamType1,
        ExamType1Subjects: stringifyIfArray(
          ExamType1Subjects,
          existingCourse.ExamType1Subjects
        ),
        ExamType1SubGrades: stringifyIfArray(
          ExamType1SubGrades,
          existingCourse.ExamType1SubGrades
        ),

        ExamCountry2: ExamCountry2 ?? existingCourse.ExamCountry2,
        ExamType2: ExamType2 ?? existingCourse.ExamType2,
        ExamType2Subjects: stringifyIfArray(
          ExamType2Subjects,
          existingCourse.ExamType2Subjects
        ),
        ExamType2SubGrades: stringifyIfArray(
          ExamType2SubGrades,
          existingCourse.ExamType2SubGrades
        ),

        ExamCountry3: ExamCountry3 ?? existingCourse.ExamCountry3,
        ExamType3: ExamType3 ?? existingCourse.ExamType3,
        ExamType3Subjects: stringifyIfArray(
          ExamType3Subjects,
          existingCourse.ExamType3Subjects
        ),
        ExamType3SubGrades: stringifyIfArray(
          ExamType3SubGrades,
          existingCourse.ExamType3SubGrades
        ),

        ExamCountry4: ExamCountry4 ?? existingCourse.ExamCountry4,
        ExamType4: ExamType4 ?? existingCourse.ExamType4,
        ExamType4Subjects: stringifyIfArray(
          ExamType4Subjects,
          existingCourse.ExamType4Subjects
        ),
        ExamType4SubGrades: stringifyIfArray(
          ExamType4SubGrades,
          existingCourse.ExamType4SubGrades
        ),

        ExamCountry5: ExamCountry5 ?? existingCourse.ExamCountry5,
        ExamType5: ExamType5 ?? existingCourse.ExamType5,
        ExamType5Subjects: stringifyIfArray(
          ExamType5Subjects,
          existingCourse.ExamType5Subjects
        ),
        ExamType5SubGrades: stringifyIfArray(
          ExamType5SubGrades,
          existingCourse.ExamType5SubGrades
        ),

        ExamCountry6: ExamCountry6 ?? existingCourse.ExamCountry6,
        ExamType6: ExamType6 ?? existingCourse.ExamType6,
        ExamType6Subjects: stringifyIfArray(
          ExamType6Subjects,
          existingCourse.ExamType6Subjects
        ),
        ExamType6SubGrades: stringifyIfArray(
          ExamType6SubGrades,
          existingCourse.ExamType6SubGrades
        ),

        ExamCountry7: ExamCountry7 ?? existingCourse.ExamCountry7,
        ExamType7: ExamType7 ?? existingCourse.ExamType7,
        ExamType7Subjects: stringifyIfArray(
          ExamType7Subjects,
          existingCourse.ExamType7Subjects
        ),
        ExamType7SubGrades: stringifyIfArray(
          ExamType7SubGrades,
          existingCourse.ExamType7SubGrades
        ),

        ExamCountry8: ExamCountry8 ?? existingCourse.ExamCountry8,
        ExamType8: ExamType8 ?? existingCourse.ExamType8,
        ExamType8Subjects: stringifyIfArray(
          ExamType8Subjects,
          existingCourse.ExamType8Subjects
        ),
        ExamType8SubGrades: stringifyIfArray(
          ExamType8SubGrades,
          existingCourse.ExamType8SubGrades
        ),

        ExamCountry9: ExamCountry9 ?? existingCourse.ExamCountry9,
        ExamType9: ExamType9 ?? existingCourse.ExamType9,
        ExamType9Subjects: stringifyIfArray(
          ExamType9Subjects,
          existingCourse.ExamType9Subjects
        ),
        ExamType9SubGrades: stringifyIfArray(
          ExamType9SubGrades,
          existingCourse.ExamType9SubGrades
        ),

        ExamCountry10: ExamCountry10 ?? existingCourse.ExamCountry10,
        ExamType10: ExamType10 ?? existingCourse.ExamType10,
        ExamType10Subjects: stringifyIfArray(
          ExamType10Subjects,
          existingCourse.ExamType10Subjects
        ),
        ExamType10SubGrades: stringifyIfArray(
          ExamType10SubGrades,
          existingCourse.ExamType10SubGrades
        ),

        Adminrule1: Adminrule1 ?? existingCourse.Adminrule1,
        Adminrule2: Adminrule2 ?? existingCourse.Adminrule2,
        Adminrule3: Adminrule3 ?? existingCourse.Adminrule3,
        Adminrule4: Adminrule4 ?? existingCourse.Adminrule4,
        Adminrule5: Adminrule5 ?? existingCourse.Adminrule5,
      },
    });

    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user) {
        await db.actionHistory.create({
          data: {
            action: 'Update',
            entity: 'Course Admission Logic',
            entityIds: [{ id: updatedCourse.id, title: updatedCourse.title }],
            userId,
          },
        });
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      ok: true,
      status: 200,
      message: 'Course admission logic updated successfully',
      data: updatedCourse,
    };
  } catch (error: any) {
    console.error('Error updating course admission logic:', error);
    return {
      ok: false,
      status: 500,
      message: 'An error occurred while updating the course admission logic',
      errors: [{ message: error.message }],
    };
  }
};

// bulk admission logic update
export const updateBulkCourseAdmissionsService = async (
  admissions: UpdateCourseAdmissionData[],
  userId: string,
  fileName: string
) => {
  try {
    const results = await Promise.allSettled(
      admissions.map(async (admission) => {
        try {
          if (!admission.id) {
            throw new Error('Missing course ID');
          }

          const existingCourse = await db.course.findUnique({
            where: { id: admission.id },
          });
          if (!existingCourse) {
            throw new Error(`Course with ID ${admission.id} not found`);
          }

          const stringifyIfArray = (value: any, fallback: any) => {
            return Array.isArray(value)
              ? JSON.stringify(value)
              : value !== undefined
                ? value
                : fallback;
          };

          const validateSubjectsAndGrades = (
            subjects: any,
            grades: any,
            examNumber: number
          ) => {
            const hasSubjects = subjects !== undefined;
            const hasGrades = grades !== undefined;

            if (hasSubjects !== hasGrades) {
              throw new Error(
                `ExamType${examNumber}: Both subjects and grades must be provided together`
              );
            }

            if (hasSubjects && hasGrades) {
              const subjectsArray = Array.isArray(subjects)
                ? subjects
                : JSON.parse(subjects || '[]');
              const gradesArray = Array.isArray(grades)
                ? grades
                : JSON.parse(grades || '[]');

              if (subjectsArray.length !== gradesArray.length) {
                throw new Error(
                  `ExamType${examNumber}: Number of subjects (${subjectsArray.length}) does not match number of grades (${gradesArray.length})`
                );
              }
            }
          };

          for (let i = 1; i <= 10; i++) {
            validateSubjectsAndGrades(
              (admission as any)[`ExamType${i}Subjects`],
              (admission as any)[`ExamType${i}SubGrades`],
              i
            );
          }

          const updatedCourse = await db.course.update({
            where: { id: admission.id },
            data: {
              ...[...Array(10)].reduce((acc, _, i) => {
                const n = i + 1;
                return {
                  ...acc,
                  [`ExamCountry${n}`]:
                    (admission as any)[`ExamCountry${n}`] ??
                    (existingCourse as any)[`ExamCountry${n}`],
                  [`ExamType${n}`]:
                    (admission as any)[`ExamType${n}`] ??
                    (existingCourse as any)[`ExamType${n}`],
                  [`ExamType${n}Subjects`]: stringifyIfArray(
                    (admission as any)[`ExamType${n}Subjects`],
                    (existingCourse as any)[`ExamType${n}Subjects`]
                  ),
                  [`ExamType${n}SubGrades`]: stringifyIfArray(
                    (admission as any)[`ExamType${n}SubGrades`],
                    (existingCourse as any)[`ExamType${n}SubGrades`]
                  ),
                };
              }, {}),
              Adminrule1: admission.Adminrule1 ?? existingCourse.Adminrule1,
              Adminrule2: admission.Adminrule2 ?? existingCourse.Adminrule2,
              Adminrule3: admission.Adminrule3 ?? existingCourse.Adminrule3,
              Adminrule4: admission.Adminrule4 ?? existingCourse.Adminrule4,
              Adminrule5: admission.Adminrule5 ?? existingCourse.Adminrule5,
            },
          });

          return {
            status: 'success',
            data: { id: updatedCourse.id, title: updatedCourse.title },
          };
        } catch (error: any) {
          console.error(
            `Error updating admission logic for course "${admission.id || 'unknown'}":`,
            error
          );
          return {
            status: 'failed',
            id: admission.id || 'unknown',
            title: 'Unknown',
            reason: error.message,
          };
        }
      })
    );

    const updatedAdmissions = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          status: 'success';
          data: { id: string; title: string };
        }> => result.status === 'fulfilled' && result.value.status === 'success'
      )
      .map((result) => result.value.data);

    const failedAdmissions = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          status: 'failed';
          id: string;
          title: string;
          ExamCountry1: string;
          ExamType1: string;
          ExamType1Subjects: string;
          ExamType1SubGrades: string;
          Adminrule1: string;
          reason: string;
        }> => result.status === 'fulfilled' && result.value.status === 'failed'
      )
      .map((result) => result.value);

    let userExists = false;
    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      userExists = !!user;
    }

    if (userExists) {
      await db.actionHistory.create({
        data: {
          action: 'Bulk Update',
          entity: 'Course Admission Logic',
          entityIds: updatedAdmissions.map(({ id, title }) => ({
            id,
            title,
          })),
          userId: userId,
          metadata: {
            successCount: updatedAdmissions.length,
            failedCount: failedAdmissions.length,
            fileName: fileName,
            failedMessages: failedAdmissions.map((item) => item.reason),
            failedItems: failedAdmissions,
          },
        },
      });
    } else {
      console.warn(
        `Skipping ActionHistory creation: userId ${userId} does not exist`
      );
    }

    const allFailed = results.every(
      (result) =>
        result.status === 'fulfilled' && result.value.status === 'failed'
    );

    return {
      message: allFailed
        ? 'All course admission logic updates failed'
        : 'Bulk admission logic update process completed',
      data: results.map((result: any) => result.value),
    };
  } catch (error: any) {
    console.error('Error in updateBulkCourseAdmissionsService:', error);
    throw new Error(`Bulk admission logic update failed: ${error.message}`);
  }
};

// users' Academic History
export const createAcademicRecordService = async (data: AcademicRecordData) => {
  try {
    // Preprocess data to handle arrays by converting them to JSON strings
    const processedData = {
      userId: data.userId,
      ExamCountry1: data.ExamCountry1,
      ExamType1: data.ExamType1,
      ExamType1Subjects: Array.isArray(data.ExamType1Subjects)
        ? JSON.stringify(data.ExamType1Subjects)
        : data.ExamType1Subjects,
      ExamType1SubGrades: Array.isArray(data.ExamType1SubGrades)
        ? JSON.stringify(data.ExamType1SubGrades)
        : data.ExamType1SubGrades,
      ExamCountry2: data.ExamCountry2,
      ExamType2: data.ExamType2,
      ExamType2Subjects: Array.isArray(data.ExamType2Subjects)
        ? JSON.stringify(data.ExamType2Subjects)
        : data.ExamType2Subjects,
      ExamType2SubGrades: Array.isArray(data.ExamType2SubGrades)
        ? JSON.stringify(data.ExamType2SubGrades)
        : data.ExamType2SubGrades,
      ExamCountry3: data.ExamCountry3,
      ExamType3: data.ExamType3,
      ExamType3Subjects: Array.isArray(data.ExamType3Subjects)
        ? JSON.stringify(data.ExamType3Subjects)
        : data.ExamType3Subjects,
      ExamType3SubGrades: Array.isArray(data.ExamType3SubGrades)
        ? JSON.stringify(data.ExamType3SubGrades)
        : data.ExamType3SubGrades,
      ExamCountry4: data.ExamCountry4,
      ExamType4: data.ExamType4,
      ExamType4Subjects: Array.isArray(data.ExamType4Subjects)
        ? JSON.stringify(data.ExamType4Subjects)
        : data.ExamType4Subjects,
      ExamType4SubGrades: Array.isArray(data.ExamType4SubGrades)
        ? JSON.stringify(data.ExamType4SubGrades)
        : data.ExamType4SubGrades,
      ExamCountry5: data.ExamCountry5,
      ExamType5: data.ExamType5,
      ExamType5Subjects: Array.isArray(data.ExamType5Subjects)
        ? JSON.stringify(data.ExamType5Subjects)
        : data.ExamType5Subjects,
      ExamType5SubGrades: Array.isArray(data.ExamType5SubGrades)
        ? JSON.stringify(data.ExamType5SubGrades)
        : data.ExamType5SubGrades,
      ExamCountry6: data.ExamCountry6,
      ExamType6: data.ExamType6,
      ExamType6Subjects: Array.isArray(data.ExamType6Subjects)
        ? JSON.stringify(data.ExamType6Subjects)
        : data.ExamType6Subjects,
      ExamType6SubGrades: Array.isArray(data.ExamType6SubGrades)
        ? JSON.stringify(data.ExamType6SubGrades)
        : data.ExamType6SubGrades,
      ExamCountry7: data.ExamCountry7,
      ExamType7: data.ExamType7,
      ExamType7Subjects: Array.isArray(data.ExamType7Subjects)
        ? JSON.stringify(data.ExamType7Subjects)
        : data.ExamType7Subjects,
      ExamType7SubGrades: Array.isArray(data.ExamType7SubGrades)
        ? JSON.stringify(data.ExamType7SubGrades)
        : data.ExamType7SubGrades,
      ExamCountry8: data.ExamCountry8,
      ExamType8: data.ExamType8,
      ExamType8Subjects: Array.isArray(data.ExamType8Subjects)
        ? JSON.stringify(data.ExamType8Subjects)
        : data.ExamType8Subjects,
      ExamType8SubGrades: Array.isArray(data.ExamType8SubGrades)
        ? JSON.stringify(data.ExamType8SubGrades)
        : data.ExamType8SubGrades,
      ExamCountry9: data.ExamCountry9,
      ExamType9: data.ExamType9,
      ExamType9Subjects: Array.isArray(data.ExamType9Subjects)
        ? JSON.stringify(data.ExamType9Subjects)
        : data.ExamType9Subjects,
      ExamType9SubGrades: Array.isArray(data.ExamType9SubGrades)
        ? JSON.stringify(data.ExamType9SubGrades)
        : data.ExamType9SubGrades,
      ExamCountry10: data.ExamCountry10,
      ExamType10: data.ExamType10,
      ExamType10Subjects: Array.isArray(data.ExamType10Subjects)
        ? JSON.stringify(data.ExamType10Subjects)
        : data.ExamType10Subjects,
      ExamType10SubGrades: Array.isArray(data.ExamType10SubGrades)
        ? JSON.stringify(data.ExamType10SubGrades)
        : data.ExamType10SubGrades,
    };

    const academicRecord = await db.academicRecord.create({
      data: processedData,
    });
    return {
      ok: true,
      status: 201,
      message: 'Academic record created successfully',
      data: academicRecord,
    };
  } catch (error: any) {
    console.error('Error creating academic record:', error);
    return {
      ok: false,
      status: 500,
      message: 'An error occurred while creating the academic record',
      errors: [{ message: error.message }],
    };
  }
};

export const updateAcademicRecordService = async (data: AcademicRecordData) => {
  try {
    const { id, userId, ...updateData } = data;
    const existingRecord = await db.academicRecord.findUnique({
      where: { id },
    });
    if (!existingRecord) {
      return {
        ok: false,
        status: 404,
        message: 'Academic record not found',
      };
    }
    if (existingRecord.userId !== userId) {
      return {
        ok: false,
        status: 403,
        message: 'Unauthorized: Record does not belong to user',
      };
    }

    const stringifyIfArray = (value: any, fallback: any) => {
      return Array.isArray(value)
        ? JSON.stringify(value)
        : value !== undefined
          ? value
          : fallback;
    };

    const validatedData = {
      ExamCountry1: updateData.ExamCountry1 ?? existingRecord.ExamCountry1,
      ExamType1: updateData.ExamType1 ?? existingRecord.ExamType1,
      ExamType1Subjects: stringifyIfArray(
        updateData.ExamType1Subjects,
        existingRecord.ExamType1Subjects
      ),
      ExamType1SubGrades: stringifyIfArray(
        updateData.ExamType1SubGrades,
        existingRecord.ExamType1SubGrades
      ),
      ExamCountry2: updateData.ExamCountry2 ?? existingRecord.ExamCountry2,
      ExamType2: updateData.ExamType2 ?? existingRecord.ExamType2,
      ExamType2Subjects: stringifyIfArray(
        updateData.ExamType2Subjects,
        existingRecord.ExamType2Subjects
      ),
      ExamType2SubGrades: stringifyIfArray(
        updateData.ExamType2SubGrades,
        existingRecord.ExamType2SubGrades
      ),
      ExamCountry3: updateData.ExamCountry3 ?? existingRecord.ExamCountry3,
      ExamType3: updateData.ExamType3 ?? existingRecord.ExamType3,
      ExamType3Subjects: stringifyIfArray(
        updateData.ExamType3Subjects,
        existingRecord.ExamType3Subjects
      ),
      ExamType3SubGrades: stringifyIfArray(
        updateData.ExamType3SubGrades,
        existingRecord.ExamType3SubGrades
      ),
      ExamCountry4: updateData.ExamCountry4 ?? existingRecord.ExamCountry4,
      ExamType4: updateData.ExamType4 ?? existingRecord.ExamType4,
      ExamType4Subjects: stringifyIfArray(
        updateData.ExamType4Subjects,
        existingRecord.ExamType4Subjects
      ),
      ExamType4SubGrades: stringifyIfArray(
        updateData.ExamType4SubGrades,
        existingRecord.ExamType4SubGrades
      ),
      ExamCountry5: updateData.ExamCountry5 ?? existingRecord.ExamCountry5,
      ExamType5: updateData.ExamType5 ?? existingRecord.ExamType5,
      ExamType5Subjects: stringifyIfArray(
        updateData.ExamType5Subjects,
        existingRecord.ExamType5Subjects
      ),
      ExamType5SubGrades: stringifyIfArray(
        updateData.ExamType5SubGrades,
        existingRecord.ExamType5SubGrades
      ),
      ExamCountry6: updateData.ExamCountry6 ?? existingRecord.ExamCountry6,
      ExamType6: updateData.ExamType6 ?? existingRecord.ExamType6,
      ExamType6Subjects: stringifyIfArray(
        updateData.ExamType6Subjects,
        existingRecord.ExamType6Subjects
      ),
      ExamType6SubGrades: stringifyIfArray(
        updateData.ExamType6SubGrades,
        existingRecord.ExamType6SubGrades
      ),
      ExamCountry7: updateData.ExamCountry7 ?? existingRecord.ExamCountry7,
      ExamType7: updateData.ExamType7 ?? existingRecord.ExamType7,
      ExamType7Subjects: stringifyIfArray(
        updateData.ExamType7Subjects,
        existingRecord.ExamType7Subjects
      ),
      ExamType7SubGrades: stringifyIfArray(
        updateData.ExamType7SubGrades,
        existingRecord.ExamType7SubGrades
      ),
      ExamCountry8: updateData.ExamCountry8 ?? existingRecord.ExamCountry8,
      ExamType8: updateData.ExamType8 ?? existingRecord.ExamType8,
      ExamType8Subjects: stringifyIfArray(
        updateData.ExamType8Subjects,
        existingRecord.ExamType8Subjects
      ),
      ExamType8SubGrades: stringifyIfArray(
        updateData.ExamType8SubGrades,
        existingRecord.ExamType8SubGrades
      ),
      ExamCountry9: updateData.ExamCountry9 ?? existingRecord.ExamCountry9,
      ExamType9: updateData.ExamType9 ?? existingRecord.ExamType9,
      ExamType9Subjects: stringifyIfArray(
        updateData.ExamType9Subjects,
        existingRecord.ExamType9Subjects
      ),
      ExamType9SubGrades: stringifyIfArray(
        updateData.ExamType9SubGrades,
        existingRecord.ExamType9SubGrades
      ),
      ExamCountry10: updateData.ExamCountry10 ?? existingRecord.ExamCountry10,
      ExamType10: updateData.ExamType10 ?? existingRecord.ExamType10,
      ExamType10Subjects: stringifyIfArray(
        updateData.ExamType10Subjects,
        existingRecord.ExamType10Subjects
      ),
      ExamType10SubGrades: stringifyIfArray(
        updateData.ExamType10SubGrades,
        existingRecord.ExamType10SubGrades
      ),
    };

    const updatedRecord = await db.academicRecord.update({
      where: { id },
      data: validatedData,
    });

    return {
      ok: true,
      status: 200,
      message: 'Academic record updated successfully',
      data: updatedRecord,
    };
  } catch (error: any) {
    console.error('Error updating academic record:', error);
    return {
      ok: false,
      status: 500,
      message: 'An error occurred while updating the academic record',
      errors: [{ message: error.message }],
    };
  }
};

export const deleteAcademicRecordService = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) => {
  try {
    const existingRecord = await db.academicRecord.findUnique({
      where: { id },
    });
    if (!existingRecord) {
      return {
        ok: false,
        status: 404,
        message: 'Academic record not found',
      };
    }
    if (existingRecord.userId !== userId) {
      return {
        ok: false,
        status: 403,
        message: 'Unauthorized: Record does not belong to user',
      };
    }

    const deletedRecord = await db.academicRecord.delete({
      where: { id },
    });

    return {
      ok: true,
      status: 200,
      message: 'Academic record deleted successfully',
      data: deletedRecord, // Optionally return the deleted record
    };
  } catch (error: any) {
    console.error('Error deleting academic record:', error);
    return {
      ok: false,
      status: 500,
      message: 'An error occurred while deleting the academic record',
      errors: [{ message: error.message }],
    };
  }
};

export const getAcademicRecordService = async ({
  userId,
}: {
  userId: string;
}) => {
  try {
    const academicRecords = await db.academicRecord.findMany({
      where: { userId },
    });

    if (academicRecords.length === 0) {
      return {
        ok: false,
        status: 404,
        message: 'No academic records found for this user',
      };
    }

    // Parse JSON strings into arrays for each record
    const parsedRecords = academicRecords.map((record) => ({
      ...record,
      ExamType1Subjects: record.ExamType1Subjects
        ? JSON.parse(record.ExamType1Subjects)
        : null,
      ExamType1SubGrades: record.ExamType1SubGrades
        ? JSON.parse(record.ExamType1SubGrades)
        : null,
      ExamType2Subjects: record.ExamType2Subjects
        ? JSON.parse(record.ExamType2Subjects)
        : null,
      ExamType2SubGrades: record.ExamType2SubGrades
        ? JSON.parse(record.ExamType2SubGrades)
        : null,
      ExamType3Subjects: record.ExamType3Subjects
        ? JSON.parse(record.ExamType3Subjects)
        : null,
      ExamType3SubGrades: record.ExamType3SubGrades
        ? JSON.parse(record.ExamType3SubGrades)
        : null,
      ExamType4Subjects: record.ExamType4Subjects
        ? JSON.parse(record.ExamType4Subjects)
        : null,
      ExamType4SubGrades: record.ExamType4SubGrades
        ? JSON.parse(record.ExamType4SubGrades)
        : null,
      ExamType5Subjects: record.ExamType5Subjects
        ? JSON.parse(record.ExamType5Subjects)
        : null,
      ExamType5SubGrades: record.ExamType5SubGrades
        ? JSON.parse(record.ExamType5SubGrades)
        : null,
      ExamType6Subjects: record.ExamType6Subjects
        ? JSON.parse(record.ExamType6Subjects)
        : null,
      ExamType6SubGrades: record.ExamType6SubGrades
        ? JSON.parse(record.ExamType6SubGrades)
        : null,
      ExamType7Subjects: record.ExamType7Subjects
        ? JSON.parse(record.ExamType7Subjects)
        : null,
      ExamType7SubGrades: record.ExamType7SubGrades
        ? JSON.parse(record.ExamType7SubGrades)
        : null,
      ExamType8Subjects: record.ExamType8Subjects
        ? JSON.parse(record.ExamType8Subjects)
        : null,
      ExamType8SubGrades: record.ExamType8SubGrades
        ? JSON.parse(record.ExamType8SubGrades)
        : null,
      ExamType9Subjects: record.ExamType9Subjects
        ? JSON.parse(record.ExamType9Subjects)
        : null,
      ExamType9SubGrades: record.ExamType9SubGrades
        ? JSON.parse(record.ExamType9SubGrades)
        : null,
      ExamType10Subjects: record.ExamType10Subjects
        ? JSON.parse(record.ExamType10Subjects)
        : null,
      ExamType10SubGrades: record.ExamType10SubGrades
        ? JSON.parse(record.ExamType10SubGrades)
        : null,
    }));

    return {
      ok: true,
      status: 200,
      message: 'Academic records retrieved successfully',
      data: parsedRecords,
    };
  } catch (error: any) {
    console.error('Error fetching academic records:', error);
    if (error.name === 'SyntaxError') {
      return {
        ok: false,
        status: 500,
        message: 'Invalid JSON data in academic records',
        errors: [{ message: error.message }],
      };
    }
    return {
      ok: false,
      status: 500,
      message: 'An error occurred while fetching the academic records',
      errors: [{ message: error.message }],
    };
  }
};
