import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import Wetrocloud from 'wetro-sdk';
import axios, { AxiosError } from 'axios';

dotenv.config();

if (!process.env.WETRO_API_KEY) {
  throw new Error('WETRO_API_KEY is required for eligibility checks');
}

const prisma = new PrismaClient();

const wetroClient = new Wetrocloud({ apiKey: process.env.WETRO_API_KEY! });
console.log('Wetrocloud client initialized successfully');

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

interface EligibilityResult {
  course: string;
  university: string;
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
  status: number;
  data?: {
    selectedCourse: EligibilityResult;
    suggestedCourses: EligibilityResult[];
  };
  success?: boolean;
  tokens: number | null;
}

interface Course {
  id: string;
  title: string;
  objectives: string;
  university: { name: string; region?: string; country: string };
  [key: string]: any;
}

interface CategorizePayload {
  resource: string;
  type: string;
  json_schema: Record<string, string>;
  categories: string[];
  prompt: string;
}

function extractCriteria(course: Course): {
  utme: { examType: string; subjects: string[]; grades: string[] }[];
  olevel: { examType: string; subjects: string[]; grades: string[] }[];
} {
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
      subjects =
        typeof subjectsRaw === 'string' ? JSON.parse(subjectsRaw) : subjectsRaw;
      grades =
        typeof gradesRaw === 'string' ? JSON.parse(gradesRaw) : gradesRaw;
      if (!Array.isArray(subjects) || !Array.isArray(grades)) {
        throw new Error('Invalid format');
      }
    } catch (e) {
      console.error(`Failed to parse ExamType${i} for course ${course.id}:`, e);
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

// Note: matchExamEligibility is included for reference; Wetrocloud's prompt emulates its logic
function matchExamEligibility(
  required: { examType: string; subjects: string[]; grades: string[] },
  studentExam: ExamInput
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

  const studentSubjectGradeMap = new Map<string, string>();
  for (let i = 0; i < studentExam.subjects.length; i++) {
    const subject = studentExam.subjects[i].toLowerCase();
    if (studentSubjectGradeMap.has(subject)) {
      details += `Duplicate student subject: ${studentExam.subjects[i]}. `;
      return { eligible: false, details };
    }
    studentSubjectGradeMap.set(subject, studentExam.grades[i]);
  }

  for (let i = 0; i < required.subjects.length; i++) {
    const reqSubject = required.subjects[i].toLowerCase();
    const reqGrade = required.grades[i];

    if (!studentSubjectGradeMap.has(reqSubject)) {
      details += `Missing required subject: ${required.subjects[i]}. `;
      continue;
    }

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

// Retry Wetrocloud API calls on transient errors
async function categorizeWithRetry(
  payload: CategorizePayload,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await wetroClient.categorize(payload);
    } catch (error) {
      attempt++;
      if (
        error instanceof AxiosError &&
        error.code === 'EAI_AGAIN' &&
        attempt < maxRetries
      ) {
        console.warn(
          `DNS error (EAI_AGAIN), retrying (${attempt}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      console.error('Wetrocloud API error:', error);
      throw error;
    }
  }
  throw new Error('Max retries reached for Wetrocloud API');
}

async function calculateEligibility(
  userId: string,
  input: QualificationInput
): Promise<WetrocloudResponse> {
  if (!userId) {
    return {
      ok: false,
      message: 'Invalid user ID',
      status: 400,
      tokens: null,
    };
  }

  const { courseId, exams, preferences } = input;

  if (!courseId) {
    return {
      ok: false,
      message: 'Course ID is required',
      status: 400,
      tokens: null,
    };
  }
  if (!exams || !Array.isArray(exams) || exams.length === 0) {
    return {
      ok: false,
      message: 'At least one exam is required',
      status: 400,
      tokens: null,
    };
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
      tokens: null,
    };
  }
  if (exams.some((e) => e.subjects.length !== e.grades.length)) {
    return {
      ok: false,
      message: 'Each exam must have equal numbers of subjects and grades',
      status: 400,
      tokens: null,
    };
  }

  try {
    // Fetch user payment plan and expiration
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        payment_plan: true,
        payment_plan_expires_at: true,
        firstname: true,
        email: true,
      },
    });

    if (!user) {
      return {
        ok: false,
        message: 'User not found',
        status: 404,
        tokens: null,
      };
    }

    const paymentPlan = user.payment_plan;
    const expiresAt = user.payment_plan_expires_at;
    const currentDate = new Date();

    // Check if payment plan is valid
    if (!paymentPlan || (expiresAt && expiresAt < currentDate)) {
      return {
        ok: false,
        message: 'No valid payment plan or plan has expired',
        status: 403,
        tokens: null,
      };
    }

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
        tokens: null,
      };
    }

    // Prepare Wetrocloud payload
    const criteria = extractCriteria(selectedCourse);
    const categoryParts: string[] = [];
    criteria.utme.forEach((req) => {
      categoryParts.push(
        `${req.examType} (${req.subjects.join(', ')}, Scores: ${req.grades.join(
          ', '
        )})`
      );
    });
    criteria.olevel.forEach((req) => {
      categoryParts.push(
        `${req.examType} (${req.subjects.join(', ')}, Grades: ${req.grades.join(
          ', '
        )})`
      );
    });
    const courseCategory = `${selectedCourse.title}: ${categoryParts.join(
      ', '
    )}`;

    const categorizePayload: CategorizePayload = {
      resource: JSON.stringify({ exams, preferences, criteria }),
      type: 'text',
      json_schema: {
        course: 'string',
        university: 'string',
        admission_requirements: 'object',
        eligibility_status: 'string',
        eligibility_details: 'string',
        career_prospects: 'string',
        suggested_courses: 'array',
      },
      categories: [courseCategory],
      prompt: `
Analyze the student's exam data and preferences to determine eligibility for the specified course and suggest alternative courses:

Student Data:
- Exams: ${JSON.stringify(exams, null, 2)}
- Preferences: ${JSON.stringify(preferences || {}, null, 2)}

Course Requirements:
- Course: ${selectedCourse.title}
- University: ${selectedCourse.university.name}
- Requirements: ${categoryParts.join('; ')}
- Admission Rule: Must meet JAMB requirements and at least one O'Level (WAEC or NECO)

Instructions:
1. JAMB (UTME) Requirements:
   - Match examType: JAMB
   - Match all required subjects (case-insensitive, any order)
   - Ensure scores meet or exceed required scores
2. O'Level Requirements (WAEC or NECO):
   - Match examType: WAEC or NECO
   - Match all required subjects (case-insensitive, any order)
   - Ensure grades are equal or better (valid grades: A1, B2, B3, C4, C5, C6; lower index is better)
3. Eligibility:
   - Eligible if JAMB requirements are met AND at least one O'Level (WAEC or NECO) is met
   - Not Eligible otherwise
4. Suggestions:
   - If not eligible, suggest up to 5 alternative courses that match the student's qualifications
   - Consider preferences (university, field, location) for suggestions
   - Each suggested course should include: course name, university, requirements, and why it matches
5. Provide detailed explanations for mismatches (e.g., missing exam, missing subject, insufficient grade/score)

Return JSON with:
- course: The course name
- university: The university name
- admission_requirements: Object with utme and olevel arrays
- eligibility_status: "Eligible" or "Not Eligible"
- eligibility_details: Detailed explanation of eligibility
- career_prospects: List of career opportunities (comma-separated)
- suggested_courses: Array of suggested courses with {course, university, admission_requirements, eligibility_details}
`,
    };

    // Call Wetrocloud with retry
    const aiRawResponse = await categorizeWithRetry(categorizePayload);
    const response = aiRawResponse.response as {
      course?: string;
      university?: string;
      admission_requirements?: {
        utme: { examType: string; subjects: string[]; grades: string[] }[];
        olevel: { examType: string; subjects: string[]; grades: string[] }[];
      };
      eligibility_status?: 'Eligible' | 'Not Eligible';
      eligibility_details?: string;
      career_prospects?: string;
      suggested_courses?: {
        course: string;
        university: string;
        admission_requirements: {
          utme: { examType: string; subjects: string[]; grades: string[] }[];
          olevel: { examType: string; subjects: string[]; grades: string[] }[];
        };
        eligibility_details: string;
      }[];
    };

    if (!response || !response.course || !response.eligibility_status) {
      console.error('Invalid Wetrocloud response:', aiRawResponse);
      return {
        ok: false,
        message: 'Invalid response from Wetrocloud API',
        status: 500,
        tokens: aiRawResponse.tokens || null,
      };
    }

    const selectedCourseResult: EligibilityResult = {
      course: response.course,
      university: response.university || selectedCourse.university.name,
      admission_requirements: response.admission_requirements || criteria,
      eligibility: {
        status: response.eligibility_status,
        details: response.eligibility_details || 'No details provided',
      },
      career_prospects:
        response.career_prospects?.split(',') ||
        selectedCourse.objectives
          .split('.')
          .filter((s: string) => s.trim())
          .slice(0, 3),
    };

    let suggestedCourses: EligibilityResult[] = (
      response.suggested_courses || []
    ).map((sc) => ({
      course: sc.course,
      university: sc.university,
      admission_requirements: sc.admission_requirements,
      eligibility: {
        status: 'Eligible',
        details: sc.eligibility_details,
      },
      career_prospects: selectedCourse.objectives
        .split('.')
        .filter((s: string) => s.trim())
        .slice(0, 3),
    }));

    // Apply payment plan logic for suggestions
    if (paymentPlan === 'BASIC_ONETIME') {
      suggestedCourses = [];
    } else if (
      selectedCourseResult.eligibility.status === 'Not Eligible' &&
      suggestedCourses.length > 0 &&
      paymentPlan === 'LOCAL_MONTHLY'
    ) {
      const schoolCountry = selectedCourse.university.country;
      const filteredCourses: EligibilityResult[] = [];
      for (const course of suggestedCourses) {
        const courseSchool = await prisma.course.findFirst({
          where: { title: course.course },
          include: { university: true },
        });
        if (courseSchool && courseSchool.university.country === schoolCountry) {
          filteredCourses.push(course);
        }
      }
      suggestedCourses = filteredCourses;
    }
    // GLOBAL_MONTHLY: Keep all suggestedCourses

    // Save results to database
    await prisma.eligibilityResult.upsert({
      where: { id: userId },
      update: {
        results: [
          selectedCourseResult,
          ...suggestedCourses,
        ] as unknown as Prisma.InputJsonValue[],
        updatedAt: new Date(),
      },
      create: {
        userId,
        results: [
          selectedCourseResult,
          ...suggestedCourses,
        ] as unknown as Prisma.InputJsonValue[],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // TODO: Send email with results
    // Dummy email structure
    const emailData = {
      to: user.email,
      subject: 'Your Course Eligibility Results',
      body: {
        greeting: `Hello ${user.firstname || 'User'}`,
        eligibility: {
          course: selectedCourseResult.course,
          university: selectedCourseResult.university,
          status: selectedCourseResult.eligibility.status,
          details: selectedCourseResult.eligibility.details,
        },
        suggestions: suggestedCourses.map((course) => ({
          course: course.course,
          university: course.university,
          requirements: course.admission_requirements,
          why: course.eligibility.details,
        })),
        planStatus: {
          plan: paymentPlan || 'None',
          expiresAt: expiresAt ? expiresAt.toISOString() : 'N/A',
        },
        footer:
          'Thank you for using our platform! For further assistance, contact support@example.com.',
      },
      // Include login link for monthly plans
      loginLink:
        paymentPlan === 'LOCAL_MONTHLY' || paymentPlan === 'GLOBAL_MONTHLY'
          ? 'https://example.com/login'
          : undefined,
    };
    // Note: Email sending logic to be implemented later (e.g., using Nodemailer or SendGrid)

    return {
      ok: true,
      message:
        selectedCourseResult.eligibility.status === 'Eligible'
          ? 'Eligibility test completed successfully'
          : suggestedCourses.length > 0
            ? 'You are not eligible for the selected course. Here are some recommendations.'
            : 'You are not eligible for the selected course, and no alternative courses match your qualifications.',
      status: 200,
      data: {
        selectedCourse: selectedCourseResult,
        suggestedCourses,
      },
      success: true,
      tokens: aiRawResponse.tokens || null,
    };
  } catch (error) {
    let message = 'Failed to process eligibility with Wetrocloud';
    if (error instanceof AxiosError) {
      if (error.code === 'EAI_AGAIN') {
        message =
          'Network error: Unable to connect to Wetrocloud due to DNS resolution failure';
      } else if (error.response) {
        message = `Wetrocloud API error: ${error.response.status} ${error.response.statusText}`;
      }
    }
    console.error('Wetrocloud error:', error);
    return {
      ok: false,
      message,
      status: 500,
      tokens: null,
    };
  }
}

async function submitEligibilityAnswersService(
  userId: string,
  input: QualificationInput
): Promise<WetrocloudResponse> {
  if (!userId) {
    return {
      ok: false,
      message: 'Invalid user ID',
      status: 400,
      tokens: null,
    };
  }

  try {
    if (!input.courseId || !Array.isArray(input.exams)) {
      return {
        ok: false,
        message: 'Course ID and exams array are required',
        status: 400,
        tokens: null,
      };
    }
    return await calculateEligibility(userId, input);
  } catch (error) {
    console.error('Error submitting eligibility answers:', error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to submit eligibility answers',
      status: 500,
      tokens: null,
    };
  }
}

export { submitEligibilityAnswersService };
