// services/admissionService.ts
import { db } from '../config/db';
import { UpdateCourseAdmissionData } from '../types/school-course-types';

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
