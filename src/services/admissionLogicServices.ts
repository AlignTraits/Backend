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
  userId: string
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
          validateSubjectsAndGrades(
            admission.ExamType1Subjects,
            admission.ExamType1SubGrades,
            1
          );
          validateSubjectsAndGrades(
            admission.ExamType2Subjects,
            admission.ExamType2SubGrades,
            2
          );
          validateSubjectsAndGrades(
            admission.ExamType3Subjects,
            admission.ExamType3SubGrades,
            3
          );
          validateSubjectsAndGrades(
            admission.ExamType4Subjects,
            admission.ExamType4SubGrades,
            4
          );
          validateSubjectsAndGrades(
            admission.ExamType5Subjects,
            admission.ExamType5SubGrades,
            5
          );
          validateSubjectsAndGrades(
            admission.ExamType6Subjects,
            admission.ExamType6SubGrades,
            6
          );
          validateSubjectsAndGrades(
            admission.ExamType7Subjects,
            admission.ExamType7SubGrades,
            7
          );
          validateSubjectsAndGrades(
            admission.ExamType8Subjects,
            admission.ExamType8SubGrades,
            8
          );
          validateSubjectsAndGrades(
            admission.ExamType9Subjects,
            admission.ExamType9SubGrades,
            9
          );
          validateSubjectsAndGrades(
            admission.ExamType10Subjects,
            admission.ExamType10SubGrades,
            10
          );

          const updatedCourse = await db.course.update({
            where: { id: admission.id },
            data: {
              ExamCountry1:
                admission.ExamCountry1 ?? existingCourse.ExamCountry1,
              ExamType1: admission.ExamType1 ?? existingCourse.ExamType1,
              ExamType1Subjects: stringifyIfArray(
                admission.ExamType1Subjects,
                existingCourse.ExamType1Subjects
              ),
              ExamType1SubGrades: stringifyIfArray(
                admission.ExamType1SubGrades,
                existingCourse.ExamType1SubGrades
              ),

              ExamCountry2:
                admission.ExamCountry2 ?? existingCourse.ExamCountry2,
              ExamType2: admission.ExamType2 ?? existingCourse.ExamType2,
              ExamType2Subjects: stringifyIfArray(
                admission.ExamType2Subjects,
                existingCourse.ExamType2Subjects
              ),
              ExamType2SubGrades: stringifyIfArray(
                admission.ExamType2SubGrades,
                existingCourse.ExamType2SubGrades
              ),

              ExamCountry3:
                admission.ExamCountry3 ?? existingCourse.ExamCountry3,
              ExamType3: admission.ExamType3 ?? existingCourse.ExamType3,
              ExamType3Subjects: stringifyIfArray(
                admission.ExamType3Subjects,
                existingCourse.ExamType3Subjects
              ),
              ExamType3SubGrades: stringifyIfArray(
                admission.ExamType3SubGrades,
                existingCourse.ExamType3SubGrades
              ),

              ExamCountry4:
                admission.ExamCountry4 ?? existingCourse.ExamCountry4,
              ExamType4: admission.ExamType4 ?? existingCourse.ExamType4,
              ExamType4Subjects: stringifyIfArray(
                admission.ExamType4Subjects,
                existingCourse.ExamType4Subjects
              ),
              ExamType4SubGrades: stringifyIfArray(
                admission.ExamType4SubGrades,
                existingCourse.ExamType4SubGrades
              ),

              ExamCountry5:
                admission.ExamCountry5 ?? existingCourse.ExamCountry5,
              ExamType5: admission.ExamType5 ?? existingCourse.ExamType5,
              ExamType5Subjects: stringifyIfArray(
                admission.ExamType5Subjects,
                existingCourse.ExamType5Subjects
              ),
              ExamType5SubGrades: stringifyIfArray(
                admission.ExamType5SubGrades,
                existingCourse.ExamType5SubGrades
              ),

              ExamCountry6:
                admission.ExamCountry6 ?? existingCourse.ExamCountry6,
              ExamType6: admission.ExamType6 ?? existingCourse.ExamType6,
              ExamType6Subjects: stringifyIfArray(
                admission.ExamType6Subjects,
                existingCourse.ExamType6Subjects
              ),
              ExamType6SubGrades: stringifyIfArray(
                admission.ExamType6SubGrades,
                existingCourse.ExamType6SubGrades
              ),

              ExamCountry7:
                admission.ExamCountry7 ?? existingCourse.ExamCountry7,
              ExamType7: admission.ExamType7 ?? existingCourse.ExamType7,
              ExamType7Subjects: stringifyIfArray(
                admission.ExamType7Subjects,
                existingCourse.ExamType7Subjects
              ),
              ExamType7SubGrades: stringifyIfArray(
                admission.ExamType7SubGrades,
                existingCourse.ExamType7SubGrades
              ),

              ExamCountry8:
                admission.ExamCountry8 ?? existingCourse.ExamCountry8,
              ExamType8: admission.ExamType8 ?? existingCourse.ExamType8,
              ExamType8Subjects: stringifyIfArray(
                admission.ExamType8Subjects,
                existingCourse.ExamType8Subjects
              ),
              ExamType8SubGrades: stringifyIfArray(
                admission.ExamType8SubGrades,
                existingCourse.ExamType8SubGrades
              ),

              ExamCountry9:
                admission.ExamCountry9 ?? existingCourse.ExamCountry9,
              ExamType9: admission.ExamType9 ?? existingCourse.ExamType9,
              ExamType9Subjects: stringifyIfArray(
                admission.ExamType9Subjects,
                existingCourse.ExamType9Subjects
              ),
              ExamType9SubGrades: stringifyIfArray(
                admission.ExamType9SubGrades,
                existingCourse.ExamType9SubGrades
              ),

              ExamCountry10:
                admission.ExamCountry10 ?? existingCourse.ExamCountry10,
              ExamType10: admission.ExamType10 ?? existingCourse.ExamType10,
              ExamType10Subjects: stringifyIfArray(
                admission.ExamType10Subjects,
                existingCourse.ExamType10Subjects
              ),
              ExamType10SubGrades: stringifyIfArray(
                admission.ExamType10SubGrades,
                existingCourse.ExamType10SubGrades
              ),

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

    if (updatedAdmissions.length > 0) {
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
          },
        });
      } else {
        console.warn(
          `Skipping ActionHistory creation: userId ${userId} does not exist`
        );
      }
    }

    return {
      message: 'Bulk admission logic update process completed',
      data: results.map((result: any) => result.value),
    };
  } catch (error: any) {
    console.error('Error in updateBulkCourseAdmissionsService:', error);
    throw new Error(`Bulk admission logic update failed: ${error.message}`);
  }
};
