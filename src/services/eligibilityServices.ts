import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import Wetrocloud from 'wetro-sdk';

dotenv.config();

if (!process.env.WETRO_API_KEY) {
  console.warn(
    'WETRO_API_KEY is not set; falling back to database recommendations'
  );
}

const prisma = new PrismaClient();

let wetroClient: Wetrocloud | null = null;
try {
  wetroClient = new Wetrocloud({
    apiKey: process.env.WETRO_API_KEY!,
  });
  console.log('Wetrocloud client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Wetrocloud client:', error);
}

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
  // duration: string;
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
  success?: boolean;
  tokens?: number;
  errors?: { message: string }[];
  [key: string]: any;
}

interface CategorizePayload {
  resource: string;
  type: string;
  json_schema: Record<string, string>;
  categories: string[];
  prompt: string;
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
      subjects =
        typeof subjectsRaw === 'string' ? JSON.parse(subjectsRaw) : subjectsRaw;
      grades =
        typeof gradesRaw === 'string' ? JSON.parse(gradesRaw) : gradesRaw;
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

async function evaluateCourseEligibility(
  course: any,
  exams: ExamInput[],
  preferences: QualificationInput['preferences'],
  wetroClient: Wetrocloud
): Promise<EligibilityResult | null> {
  const criteria = extractCriteria(course);
  const categoryParts: string[] = [];
  criteria.utme.forEach((req) => {
    categoryParts.push(
      `${req.examType} (${req.subjects.join(', ')}, Scores: ${req.grades.join(', ')})`
    );
  });
  criteria.olevel.forEach((req) => {
    categoryParts.push(
      `${req.examType} (${req.subjects.join(', ')}, Grades: ${req.grades.join(', ')})`
    );
  });
  const courseCategory = `${course.title}: ${categoryParts.join(', ')}`;

  const categorizePayload: CategorizePayload = {
    resource: JSON.stringify({ exams, preferences }),
    type: 'text',
    json_schema: {
      course: 'string',
      university: 'string',
      duration: 'string',
      utme_requirements: 'string',
      olevel_requirements: 'string',
      eligibility_status: 'string',
      eligibility_details: 'string',
      career_prospects: 'string',
    },
    categories: [courseCategory],
    prompt: `
Analyze the following student exam data and preferences to determine eligibility for the specified course:

Student Data:
${JSON.stringify({ exams, preferences }, null, 2)}

Course Requirements:
- Course: ${course.title}
- University: ${course.university.name}
- Duration: ${course.duration} ${course.durationPeriod.toLowerCase()}
- Requirements: ${categoryParts.join('; ')}
- Admission Rule: JAMB + WAEC or NECO (must have JAMB and at least one of WAEC or NECO)

Instructions:
1. Check JAMB (UTME) requirements:
   - Match examType: JAMB
   - Match all required subjects exactly (case-insensitive, same order)
   - Ensure scores meet or exceed required scores
2. Check O'Level requirements (WAEC or NECO):
   - Match examType: WAEC or NECO
   - Match all required subjects exactly (case-insensitive, same order)
   - Ensure grades are equal or better (valid grades: A1, B2, B3, C4, C5, C6; lower index is better)
3. Eligibility:
   - Eligible if JAMB requirements are met AND at least one O'Level (WAEC or NECO) is met
   - Not Eligible otherwise
4. Provide detailed explanations for mismatches (e.g., missing exam, subject mismatch, insufficient grade/score)

Return JSON with:
- course: The course name
- university: The university name
- duration: Course duration (e.g., "4 years")
- utme_requirements: Required JAMB subjects and grades (comma-separated, e.g., "Mathematics:70,English:60")
- olevel_requirements: Required WAEC/NECO subjects and grades (comma-separated, e.g., "Mathematics:B2,English:B3")
- eligibility_status: "Eligible" or "Not Eligible"
- eligibility_details: Detailed explanation of eligibility
- career_prospects: List of career opportunities (comma-separated, based on course objectives)
    `,
  };

  try {
    const aiRawResponse = (await wetroClient.categorize(categorizePayload)) as {
      response?: {
        course?: string;
        university?: string;
        duration?: string;
        utme_requirements?: string;
        olevel_requirements?: string;
        eligibility_status?: 'Eligible' | 'Not Eligible';
        eligibility_details?: string;
        career_prospects?: string;
      };
      success?: boolean;
      tokens?: number;
    };

    const response = aiRawResponse?.response;
    if (!response || !response.course || !response.eligibility_status) {
      console.warn('No valid results for course:', course.id, aiRawResponse);
      return null;
    }

    const utmeRequirements: {
      examType: string;
      subjects: string[];
      grades: string[];
    }[] = [];
    const olevelRequirements: {
      examType: string;
      subjects: string[];
      grades: string[];
    }[] = [];

    if (response.utme_requirements) {
      const utmeParts = response.utme_requirements.split(',').map((part) => {
        const [subject, grade] = part.split(':');
        return { subject: subject.trim(), grade: grade?.trim() };
      });
      utmeRequirements.push({
        examType: 'JAMB',
        subjects: utmeParts.map((p) => p.subject),
        grades: utmeParts.map((p) => p.grade || ''),
      });
    }

    if (response.olevel_requirements) {
      const olevelParts = response.olevel_requirements
        .split(',')
        .map((part) => {
          const [subject, grade] = part.split(':');
          return { subject: subject.trim(), grade: grade?.trim() };
        });
      const waecSubjects =
        criteria.olevel.find((o) => o.examType.toUpperCase() === 'WAEC')
          ?.subjects || [];
      const necoSubjects =
        criteria.olevel.find((o) => o.examType.toUpperCase() === 'NECO')
          ?.subjects || [];
      const waecParts = olevelParts.filter((p) =>
        waecSubjects.includes(p.subject)
      );
      const necoParts = olevelParts.filter((p) =>
        necoSubjects.includes(p.subject)
      );
      if (waecParts.length) {
        olevelRequirements.push({
          examType: 'WAEC',
          subjects: waecParts.map((p) => p.subject),
          grades: waecParts.map((p) => p.grade || ''),
        });
      }
      if (necoParts.length) {
        olevelRequirements.push({
          examType: 'NECO',
          subjects: necoParts.map((p) => p.subject),
          grades: necoParts.map((p) => p.grade || ''),
        });
      }
    }

    return {
      course: response.course,
      university: response.university || course.university.name,
      // duration: response.duration || `${course.duration} ${course.durationPeriod.toLowerCase()}`,`
      admission_requirements: {
        utme: utmeRequirements.length ? utmeRequirements : criteria.utme,
        olevel: olevelRequirements.length
          ? olevelRequirements
          : criteria.olevel,
      },
      eligibility: {
        status: response.eligibility_status,
        details: response.eligibility_details || 'No details provided',
      },
      career_prospects:
        response.career_prospects?.split(',') ||
        course.objectives
          .split('.')
          .filter((s: string) => s.trim())
          .slice(0, 3),
    };
  } catch (error) {
    console.error('Wetrocloud API failed for course:', course.id, error);
    return null;
  }
}

async function calculateEligibility(
  userId: string,
  input: QualificationInput
): Promise<WetrocloudResponse> {
  if (!userId) {
    return { ok: false, message: 'Invalid user ID', status: 400 };
  }

  const { courseId, exams, preferences } = input;

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

    let selectedCourseResult: EligibilityResult | null = null;
    let suggestedCourses: EligibilityResult[] = [];
    let success = false;
    let tokens: number | undefined;

    if (wetroClient) {
      console.log('Evaluating selected course:', selectedCourse.id);
      selectedCourseResult = await evaluateCourseEligibility(
        selectedCourse,
        exams,
        preferences,
        wetroClient
      );

      if (selectedCourseResult) {
        success = true;
        tokens = (
          (await wetroClient.categorize({
            resource: JSON.stringify({ exams, preferences }),
            type: 'text',
            json_schema: { course: 'string' },
            categories: [selectedCourse.title],
            prompt: 'Dummy request to get tokens',
          })) as any
        ).tokens;
      } else {
        console.warn(
          'Wetrocloud failed for selected course:',
          selectedCourse.id
        );
      }
    }

    // If selected course is not eligible or Wetrocloud failed, try suggesting alternatives
    if (
      !selectedCourseResult ||
      selectedCourseResult.eligibility.status !== 'Eligible'
    ) {
      if (wetroClient) {
        console.log('Fetching alternative courses');
        const otherCourses = await prisma.course.findMany({
          where: { id: { not: courseId } },
          include: { university: true },
          take: 5, // Limit to avoid excessive API calls
        });

        for (const course of otherCourses) {
          const result = await evaluateCourseEligibility(
            course,
            exams,
            preferences,
            wetroClient
          );
          if (result && result.eligibility.status === 'Eligible') {
            const matchesPreferences =
              (!preferences?.university ||
                course.university.name
                  .toLowerCase()
                  .includes(preferences.university?.toLowerCase() || '')) &&
              (!preferences?.field ||
                course.title
                  .toLowerCase()
                  .includes(preferences.field?.toLowerCase() || '')) &&
              (!preferences?.location ||
                course.university.region?.toLowerCase() ===
                  preferences.location?.toLowerCase());
            if (matchesPreferences) {
              suggestedCourses.push(result);
            } else {
              suggestedCourses.push(result);
            }
          }
        }

        if (suggestedCourses.length > 0) {
          success = true;
          tokens =
            tokens ||
            (
              (await wetroClient.categorize({
                resource: JSON.stringify({ exams, preferences }),
                type: 'text',
                json_schema: { course: 'string' },
                categories: suggestedCourses.map((c) => c.course),
                prompt: 'Dummy request to get tokens',
              })) as any
            ).tokens;
        }
      }

      // Fallback if Wetrocloud is unavailable or no eligible courses found
      if (!selectedCourseResult && suggestedCourses.length === 0) {
        console.log('Using fallback: checking database for eligible courses');
        const fallbackCourses = await prisma.course.findMany({
          where: { id: { not: courseId } },
          include: { university: true },
          take: 3,
        });

        for (const course of fallbackCourses) {
          const criteria = extractCriteria(course);
          let eligible = true;
          let details = '';

          // Simplified eligibility check
          const jambExam = exams.find(
            (e) => e.examType.toUpperCase() === 'JAMB'
          );
          const olevelExams = exams.filter((e) =>
            ['WAEC', 'NECO'].includes(e.examType.toUpperCase())
          );

          if (
            criteria.utme.length > 0 &&
            (!jambExam || jambExam.subjects.length < 4)
          ) {
            eligible = false;
            details += 'No valid JAMB exam provided. ';
          } else if (jambExam) {
            const req = criteria.utme[0];
            if (req.subjects.length !== jambExam.subjects.length) {
              eligible = false;
              details += `JAMB subject count mismatch: expected ${req.subjects.length}. `;
            } else {
              for (let i = 0; i < req.subjects.length; i++) {
                if (
                  req.subjects[i].toLowerCase() !==
                  jambExam.subjects[i].toLowerCase()
                ) {
                  eligible = false;
                  details += `JAMB subject mismatch: expected ${req.subjects[i]}. `;
                } else if (
                  parseFloat(jambExam.grades[i]) < parseFloat(req.grades[i])
                ) {
                  eligible = false;
                  details += `Insufficient JAMB score for ${req.subjects[i]}. `;
                }
              }
            }
          }

          const olevelEligible = olevelExams.some((exam) => {
            const req = criteria.olevel.find(
              (r) => r.examType.toUpperCase() === exam.examType.toUpperCase()
            );
            if (!req) return false;
            if (req.subjects.length !== exam.subjects.length) return false;
            const validGrades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];
            for (let i = 0; i < req.subjects.length; i++) {
              if (
                req.subjects[i].toLowerCase() !== exam.subjects[i].toLowerCase()
              )
                return false;
              if (
                !validGrades.includes(exam.grades[i]) ||
                validGrades.indexOf(exam.grades[i]) >
                  validGrades.indexOf(req.grades[i])
              ) {
                return false;
              }
            }
            return true;
          });

          if (!olevelEligible) {
            eligible = false;
            details += "No valid O'Level exam matches requirements. ";
          }

          if (eligible) {
            suggestedCourses.push({
              course: course.title,
              university: course.university.name,
              // duration: `${course.duration} ${course.durationPeriod.toLowerCase()}`,
              admission_requirements: criteria,
              eligibility: {
                status: 'Eligible',
                details: 'All requirements matched in fallback check.',
              },
              career_prospects: course.objectives
                .split('.')
                .filter((s: string) => s.trim())
                .slice(0, 3),
            });
          }
        }

        if (!selectedCourseResult) {
          selectedCourseResult = {
            course: selectedCourse.title,
            university: selectedCourse.university.name,
            // duration: `${selectedCourse.duration} ${course.durationPeriod.toLowerCase()}`,
            admission_requirements: extractCriteria(selectedCourse),
            eligibility: {
              status: 'Not Eligible',
              details: 'Wetrocloud unavailable and no eligibility determined.',
            },
            career_prospects: selectedCourse.objectives
              .split('.')
              .filter((s: string) => s.trim())
              .slice(0, 3),
          };
        }
      }
    }

    try {
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
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      return {
        ok: false,
        message: 'Failed to save eligibility results',
        status: 500,
      };
    }

    return {
      ok: true,
      message:
        selectedCourseResult &&
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
      success,
      tokens,
    };
  } catch (error) {
    console.error('Error in eligibility check:', error);
    return {
      ok: false,
      message: 'Failed to process eligibility test',
      status: 500,
    };
  }
}

async function submitEligibilityAnswersService(
  userId: string,
  input: QualificationInput
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
    };
  }
}

export { submitEligibilityAnswersService };
