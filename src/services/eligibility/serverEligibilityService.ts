import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

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

interface EligibilityResult {
  course: string;
  university: string;
  duration: string;
  admission_requirements: {
    utme: { examType: string; subjects: string[]; grades: string[] }[];
    olevel: { examType: string; subjects: string[]; grades: string[] }[];
  };
  eligibility: {
    status: 'Eligible' | 'Not Eligible';
    details: string;
  };
  career_prospects: string[];
}

interface WetrocloudResponse {
  ok: boolean;
  message: string;
  status?: number;
  data?: any;
  errors?: { message: string }[];
  [key: string]: any;
}

function extractCriteria(course: any) {
  const utme: { examType: string; subjects: string[]; grades: string[] }[] = [];
  const olevel: { examType: string; subjects: string[]; grades: string[] }[] =
    [];

  for (let i = 1; i <= 10; i++) {
    const examType = course[`ExamType${i}`];
    const subjectsRaw = course[`ExamType${i}Subjects`];
    const gradesRaw = course[`ExamType${i}SubGrades`];
    if (!examType || !subjectsRaw || !gradesRaw) continue;

    let subjects: string[] = [];
    let grades: string[] = [];
    try {
      subjects = JSON.parse(subjectsRaw);
      grades = JSON.parse(gradesRaw);
    } catch (e) {
      console.error(
        `Failed to parse ExamType${i} subjects/grades for course ${course.id}:`,
        { subjectsRaw, gradesRaw }
      );
      continue;
    }

    if (['UTME', 'JAMB'].includes(examType.toUpperCase())) {
      utme.push({ examType, subjects, grades });
    } else if (['WAEC', 'NECO', 'GCE'].includes(examType.toUpperCase())) {
      olevel.push({ examType, subjects, grades });
    }
  }

  return { utme, olevel };
}

function matchExamEligibility(
  required: { examType: string; subjects: string[]; grades: string[] },
  studentExam: { examType: string; subjects: string[]; grades: string[] }
): { eligible: boolean; details: string } {
  if (required.examType.toUpperCase() !== studentExam.examType.toUpperCase()) {
    return {
      eligible: false,
      details: `Exam type mismatch: expected ${required.examType}, got ${studentExam.examType}`,
    };
  }

  const validGrades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];
  const isUtme = ['UTME', 'JAMB'].includes(required.examType.toUpperCase());
  const matchedSubjects: string[] = [];
  let details = '';

  // Check if lengths match
  if (
    required.subjects.length !== studentExam.subjects.length ||
    required.subjects.length !== studentExam.grades.length ||
    studentExam.subjects.length !== studentExam.grades.length
  ) {
    return {
      eligible: false,
      details: `Subject/grade count mismatch: expected ${required.subjects.length}, got subjects: ${studentExam.subjects.length}, grades: ${studentExam.grades.length}`,
    };
  }

  // Create a map of student subjects to grades for lookup
  const studentSubjectGradeMap = new Map<string, string>();
  for (let i = 0; i < studentExam.subjects.length; i++) {
    const subject = studentExam.subjects[i].toLowerCase();
    if (studentSubjectGradeMap.has(subject)) {
      details += `Duplicate student subject: ${studentExam.subjects[i]}. `;
      return { eligible: false, details };
    }
    studentSubjectGradeMap.set(subject, studentExam.grades[i]);
  }

  // Check if all required subjects are present and validate grades
  for (let i = 0; i < required.subjects.length; i++) {
    const reqSubject = required.subjects[i].toLowerCase();
    const reqGrade = required.grades[i];

    // Check if the required subject exists in student's submission
    if (!studentSubjectGradeMap.has(reqSubject)) {
      details += `Missing required subject: ${required.subjects[i]}. `;
      continue;
    }

    // Get the student's grade for the subject
    const studentGrade = studentSubjectGradeMap.get(reqSubject)!;

    if (isUtme) {
      const studentScore = parseFloat(studentGrade);
      const requiredScore = parseFloat(reqGrade);
      if (isNaN(studentScore) || studentScore < requiredScore) {
        details += `Insufficient score for ${reqSubject}: got ${studentGrade}, required ${reqGrade}. `;
        continue;
      }
    } else {
      if (
        !validGrades.includes(studentGrade) ||
        validGrades.indexOf(studentGrade) > validGrades.indexOf(reqGrade)
      ) {
        details += `Insufficient grade for ${reqSubject}: got ${studentGrade}, required ${reqGrade} or better. `;
        continue;
      }
    }

    matchedSubjects.push(reqSubject);
  }

  const eligible = matchedSubjects.length === required.subjects.length;
  if (eligible) {
    details = `All requirements matched for ${required.examType}: ${matchedSubjects.join(', ')}.`;
  } else {
    details = `Matched ${matchedSubjects.length}/${required.subjects.length} requirements for ${required.examType}. ${details}`;
  }

  return { eligible, details };
}

function createEligibilityResult(
  course: any,
  olevelResults: { eligible: boolean; details: string }[],
  utmeResults: { eligible: boolean; details: string }[]
): EligibilityResult {
  const criteria = extractCriteria(course);
  const allEligible =
    utmeResults.every((r) => r.eligible) &&
    olevelResults.some((r) => r.eligible); // Require at least one O'Level to be eligible
  const status = allEligible ? 'Eligible' : 'Not Eligible';
  const details = [...olevelResults, ...utmeResults]
    .map((r) => r.details)
    .join(' ');

  return {
    course: course.title,
    university: course.university.name,
    duration: `${course.duration} ${course.durationPeriod.toLowerCase()}`,
    admission_requirements: criteria,
    eligibility: { status, details },
    career_prospects: course.objectives
      .split('.')
      .filter((s: string) => s.trim())
      .slice(0, 3),
  };
}

async function calculateServerEligibility(
  userId: string,
  input: ServerQualificationInput
): Promise<WetrocloudResponse> {
  if (!userId) {
    return { ok: false, message: 'Invalid user ID', status: 400 };
  }

  const { courseId, exams, preferences } = input;

  // Validation
  if (!courseId) {
    return { ok: false, message: 'Course ID is required', status: 400 };
  }
  if (!exams || !Array.isArray(exams) || exams.length === 0) {
    return { ok: false, message: 'At least one exam is required', status: 400 };
  }
  if (
    !exams.some(
      (e) =>
        ['UTME', 'JAMB'].includes(e.examType.toUpperCase()) &&
        e.subjects.length >= 4 &&
        e.subjects.some((s) => s.toLowerCase() === 'english')
    )
  ) {
    return {
      ok: false,
      message:
        'JAMB/UTME exam with at least 4 subjects including English is required',
      status: 400,
    };
  }
  if (exams.some((e) => e.subjects.length !== e.grades.length)) {
    return {
      ok: false,
      message: 'Each exam must have equal numbers of subjects and grades',
      status: 400,
    };
  }

  try {
    // Fetch selected course
    const selectedCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: { university: true },
    });

    if (!selectedCourse) {
      return {
        ok: false,
        message: `Course with ID ${courseId} not found`,
        status: 404,
      };
    }

    const selectedCriteria = extractCriteria(selectedCourse);
    console.log('Selected Course:', {
      id: selectedCourse.id,
      title: selectedCourse.title,
      criteria: selectedCriteria,
    });

    // Check eligibility for selected course
    const olevelResults: { eligible: boolean; details: string }[] = [];
    const utmeResults: { eligible: boolean; details: string }[] = [];

    for (const req of selectedCriteria.olevel) {
      const studentExam = exams.find(
        (e) => e.examType.toUpperCase() === req.examType.toUpperCase()
      );
      if (!studentExam) {
        olevelResults.push({
          eligible: false,
          details: `No ${req.examType} exam provided`,
        });
        continue;
      }
      olevelResults.push(matchExamEligibility(req, studentExam));
    }

    for (const req of selectedCriteria.utme) {
      const studentExam = exams.find(
        (e) => e.examType.toUpperCase() === req.examType.toUpperCase()
      );
      if (!studentExam) {
        utmeResults.push({
          eligible: false,
          details: `No ${req.examType} exam provided`,
        });
        continue;
      }
      utmeResults.push(matchExamEligibility(req, studentExam));
    }

    console.log('Selected Course Eligibility:', { olevelResults, utmeResults });

    const selectedCourseResult = createEligibilityResult(
      selectedCourse,
      olevelResults,
      utmeResults
    );

    if (selectedCourseResult.eligibility.status === 'Eligible') {
      await prisma.eligibilityResult.upsert({
        where: { id: userId },
        update: {
          results: [selectedCourseResult] as unknown as Prisma.InputJsonValue[],
          updatedAt: new Date(),
        },
        create: {
          userId,
          results: [selectedCourseResult] as unknown as Prisma.InputJsonValue[],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        ok: true,
        message: 'Eligibility test completed successfully',
        status: 200,
        data: {
          selectedCourse: selectedCourseResult,
          suggestedCourses: [],
        },
      };
    }

    // Find alternative courses
    const courses = await prisma.course.findMany({
      where: { id: { not: courseId } },
      include: { university: true },
    });

    const preferredCourses: EligibilityResult[] = [];
    const suggestedCourses: EligibilityResult[] = [];

    for (const course of courses) {
      const criteria = extractCriteria(course);
      if (criteria.olevel.length === 0 && criteria.utme.length === 0) {
        console.log(
          `Skipping course ${course.id} (${course.title}): no requirements specified`
        );
        continue; // Skip courses with no requirements
      }

      const olevelResults: { eligible: boolean; details: string }[] = [];
      const utmeResults: { eligible: boolean; details: string }[] = [];

      for (const req of criteria.olevel) {
        const studentExam = exams.find(
          (e) => e.examType.toUpperCase() === req.examType.toUpperCase()
        );
        if (!studentExam) {
          olevelResults.push({
            eligible: false,
            details: `No ${req.examType} exam provided`,
          });
          continue;
        }
        olevelResults.push(matchExamEligibility(req, studentExam));
      }

      for (const req of criteria.utme) {
        const studentExam = exams.find(
          (e) => e.examType.toUpperCase() === req.examType.toUpperCase()
        );
        if (!studentExam) {
          utmeResults.push({
            eligible: false,
            details: `No ${req.examType} exam provided`,
          });
          continue;
        }
        utmeResults.push(matchExamEligibility(req, studentExam));
      }

      if (
        utmeResults.every((r) => r.eligible) &&
        olevelResults.some((r) => r.eligible)
      ) {
        const result = createEligibilityResult(
          course,
          olevelResults,
          utmeResults
        );
        const matchesPreferences =
          (!preferences?.university ||
            course.university.name
              .toLowerCase()
              .includes(preferences.university.toLowerCase())) &&
          (!preferences?.field ||
            course.title
              .toLowerCase()
              .includes(preferences.field.toLowerCase())) &&
          (!preferences?.location ||
            course.university.region?.toLowerCase() ===
              preferences.location.toLowerCase());

        if (matchesPreferences) {
          preferredCourses.push(result);
        } else {
          suggestedCourses.push(result);
        }
      }
    }

    const allSuggestedCourses = [...preferredCourses, ...suggestedCourses];
    console.log(
      'Suggested Courses:',
      allSuggestedCourses.map((c) => ({
        id: c.course,
        title: c.course,
        university: c.university,
        eligibility: c.eligibility,
      }))
    );

    await prisma.eligibilityResult.upsert({
      where: { id: userId },
      update: {
        results: allSuggestedCourses as unknown as Prisma.InputJsonValue[],
        updatedAt: new Date(),
      },
      create: {
        userId,
        results: allSuggestedCourses as unknown as Prisma.InputJsonValue[],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      ok: true,
      message:
        allSuggestedCourses.length > 0
          ? 'You are not eligible for the selected course. Here are some recommendations.'
          : 'You are not eligible for the selected course, and no alternative courses match your qualifications.',
      status: 200,
      data: {
        selectedCourse: selectedCourseResult,
        suggestedCourses: allSuggestedCourses,
      },
    };
  } catch (error) {
    console.error('Error in server eligibility check:', error);
    return {
      ok: false,
      message: 'Failed to process eligibility test',
      status: 500,
    };
  }
}

async function submitServerEligibilityAnswersService(
  userId: string,
  input: ServerQualificationInput
): Promise<WetrocloudResponse> {
  if (!userId) {
    return { ok: false, message: 'Invalid user ID', status: 400 };
  }

  try {
    if (!input.courseId || !Array.isArray(input.exams)) {
      return {
        ok: false,
        message: 'Course ID and exams array are required',
        status: 400,
      };
    }
    return await calculateServerEligibility(userId, input);
  } catch (error) {
    console.error('Error submitting server eligibility answers:', error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to submit eligibility answers',
      status: 500,
    };
  }
}

export { submitServerEligibilityAnswersService };
