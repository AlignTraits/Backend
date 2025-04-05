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
