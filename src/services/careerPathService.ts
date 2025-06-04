import { PrismaClient, Roles } from '@prisma/client';
import dotenv from 'dotenv';
import Wetrocloud from 'wetro-sdk';
import MessageResponse from '../types/messageResponse';
import { createUser, getUserByEmail } from '../models/userModel';

dotenv.config();

if (!process.env.WETRO_API_KEY) {
  console.warn('WETRO_API_KEY is not set; falling back to careerPathMapping');
}

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Wetrocloud client
let wetroClient: Wetrocloud | null = null;
try {
  wetroClient = new Wetrocloud({
    apiKey: process.env.WETRO_API_KEY!,
  });
  console.log('Wetrocloud client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Wetrocloud client:', error);
}

// Fallback mapping
// const careerPathMapping: Record<string, any> = {
//   personality_mbti: {
//     when_learning_something_new_do_you_prefer: {
//       'Practical, hands-on experience': ['Engineering', 'Accounting', 'IT'],
//       'Exploring theories and possibilities': ['Psychology', 'Social Work'],
//     },
//     when_working_on_a_group_project_do_you: {
//       'Prefer structured plans and clear goals': ['Law', 'Finance'],
//       'Adapt as you go and keep things flexible': ['Marketing', 'Startups'],
//     },
//     when_making_a_decision_do_you: {
//       'Focus on facts and logic': ['Data Science', 'Engineering'],
//       'Consider how it affects people emotionally': ['HR', 'Teaching'],
//     },
//     do_you_feel_energized_by: {
//       'Socializing and working with groups': ['Sales', 'PR', 'Business'],
//       'Working alone or in quiet environments': ['Research', 'Writing', 'IT'],
//     },
//   },
//   work_behavior_disc: {
//     how_do_you_approach_challenges_at_work: {
//       'Take control and solve problems quickly': [
//         'Leadership',
//         'Law',
//         'Business',
//       ],
//       'Persuade and inspire others to contribute': ['Marketing', 'PR', 'Sales'],
//       'Work patiently and maintain team harmony': ['HR', 'Teaching'],
//       'Analyze all details before making a decision': [
//         'Data Analysis',
//         'Engineering',
//       ],
//     },
//     when_managing_a_project_you_prefer: {
//       'Setting ambitious goals and leading from the front': [
//         'Business',
//         'Law',
//         'Management',
//       ],
//       'Engaging people and ensuring collaboration': [
//         'Marketing',
//         'Social Careers',
//       ],
//       'Maintaining a stable workflow and supporting the team': [
//         'Healthcare',
//         'HR',
//       ],
//       'Creating detailed plans and ensuring accuracy': ['Finance', 'IT'],
//     },
//   },
//   career_values_schein: {
//     which_of_these_job_features_is_most_important_to_you: {
//       'Becoming an expert in my field': ['Engineering', 'IT'],
//       'Leading teams and making decisions': ['Business', 'Economics'],
//       'Having job security and stability': ['Banking', 'Government'],
//       'Helping people and making a difference': ['Social Work', 'Teaching'],
//     },
//     if_you_had_to_choose_between_two_job_offers_you_would_pick: {
//       'A stable job with a clear career path': ['Government', 'Accounting'],
//       'A high-risk, high-reward opportunity': ['Entrepreneurship', 'Marketing'],
//     },
//   },
//   emotional_intelligence_eq: {
//     when_you_receive_negative_feedback_you: {
//       'Take it constructively and improve': ['Public Relations', 'Leadership'],
//       'Feel discouraged but eventually bounce back': [
//         'Research',
//         'Data Science',
//       ],
//       'Get defensive and justify your actions': ['Research', 'Data Science'],
//     },
//     how_do_you_handle_workplace_conflict: {
//       'Address it immediately and resolve the issue': [
//         'HR',
//         'Teaching',
//         'Counseling',
//       ],
//       'Try to mediate and find common ground': ['HR', 'Teaching', 'Counseling'],
//       'Avoid confrontation and let it pass': ['Independent Roles'],
//     },
//     which_situation_would_stress_you_the_most: {
//       'Constantly having to network and socialize': ['Analytical Work'],
//       'Working alone for long periods without interaction': ['Dynamic Fields'],
//       'Being in an unpredictable and rapidly changing job': ['Stable Roles'],
//       'Doing the same repetitive tasks every day': ['Dynamic Fields'],
//     },
//   },
//   motivation_career_drive: {
//     when_you_set_a_goal_how_do_you_pursue_it: {
//       'Push myself to achieve it, no matter the obstacles': ['Law', 'Medicine'],
//       'Work steadily but adjust if necessary': ['Business', 'Marketing'],
//       'Lose interest if it takes too long': ['Support', 'Admin'],
//     },
//     if_faced_with_a_major_career_setback_what_would_you_do: {
//       'Work even harder and find another way': ['Finance', 'Startups'],
//       'Reevaluate my options and adjust my plans': [
//         'Consulting',
//         'Mid-Level Management',
//       ],
//       'Feel discouraged and consider quitting': ['Routine Roles'],
//     },
//     what_type_of_work_environment_suits_you_best: {
//       'High-pressure, competitive fields': ['Law', 'Medicine'],
//       'Balanced work-life environment': ['Creative Fields'],
//       'Low-stress, stable careers': ['Government', 'Admin'],
//     },
//   },
// };

interface CareerPathResponse {
  career_path: string;
  reason: string;
}

interface CategorizePayload {
  resource: string;
  type: string;
  json_schema: { career_path: string; reason: string };
  categories: string[];
  prompt: string;
}

interface WetrocloudResponse {
  career_path?: string;
  reason?: string;
  // Add other possible properties from the response if needed
  [key: string]: any; // This allows for additional properties if the API returns more
}

async function calculateCareerPath(
  userId: string,
  formResponses: { question: string; answer: string }[]
): Promise<WetrocloudResponse> {
  if (!userId) {
    return {
      ok: false,
      message: 'Invalid user ID',
    };
  }

  if (!formResponses?.length) {
    return {
      ok: false,
      message: 'No answers provided',
    };
  }

  try {
    if (wetroClient) {
      console.log('Calling Wetrocloud categorize API');

      const categorizePayload: CategorizePayload = {
        resource: JSON.stringify(formResponses),
        type: 'text',
        json_schema: { career_path: '', reason: '' },
        categories: [
          'Engineering',
          'Data Science',
          'IT',
          'Psychology',
          'Social Work',
          'Law',
          'Finance',
          'Marketing',
          'Startups',
          'HR',
          'Teaching',
        ],
        prompt: `
          Analyze these career assessment responses and recommend the best career path:
          ${JSON.stringify(formResponses, null, 2)}

          Consider:
          - Skills and interests shown
          - Personality traits revealed
          - Work style preferences
          - Long-term career goals

          Return JSON with:
          - career_path: The recommended career
          - reason: Detailed explanation including required skills
        `,
      };

      const aiRawResponse = (await wetroClient.categorize(
        categorizePayload
      )) as {
        response?: {
          career_path?: string;
          reason?: string;
        };
        success?: boolean;
        tokens?: number;
      };

      // ✅ Correctly extract nested values
      const career_path = aiRawResponse?.response?.career_path;
      const reason = aiRawResponse?.response?.reason;

      if (career_path) {
        const recommendedCareer = career_path;
        const reasoning = reason || 'No detailed reason provided.';

        console.log('AI recommendation:', { recommendedCareer, reasoning });

        try {
          await prisma.careerResult.upsert({
            where: { userId },
            update: { recommendedCareers: [recommendedCareer], reasoning },
            create: {
              userId,
              recommendedCareers: [recommendedCareer],
              reasoning,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        } catch (dbError) {
          console.error('Database save failed:', dbError);
          return {
            ok: false,
            message: 'Failed to save career results',
          };
        }

        return {
          ok: true,
          message: 'Career path calculated successfully',
          data: { recommendedCareer, reasoning },
        };
      } else {
        console.warn('No career_path in AI response:', aiRawResponse);
      }
    }
  } catch (apiError) {
    console.error('Wetrocloud API failed:', apiError);
  }

  return {
    ok: false,
    message: 'Unable to generate career path recommendation at this time.',
  };
}

// async function submitAnswersService(
//   userId: string,
//   answers: { question: string; answer: string }[]
// ): Promise<WetrocloudResponse> {
//   if (!userId) {
//     return {
//       ok: false,
//       message: 'Invalid user ID',
//     };
//   }

//   try {
//     if (!Array.isArray(answers) || !answers.length) {
//       return {
//         ok: false,
//         message: 'Invalid answers provided',
//       };
//     }

//     return await calculateCareerPath(userId, answers);
//   } catch (error) {
//     console.error('Error submitting answers:', error);
//     return {
//       ok: false,
//       message:
//         error instanceof Error ? error.message : 'Failed to submit answers',
//     };
//   }
// }

async function submitAnswersService(
  // userId: string,
  answers: { question: string; answer: string }[],
  firstName?: string,
  lastName?: string,
  email?: string
): Promise<WetrocloudResponse> {
  // Use provided userId or check by email
  let userId: string | null = null;
  if (email) {
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser({
        data: {
          firstname: firstName ?? '',
          lastname: lastName ?? '',
          email,
          password: '',
          emailVerified: new Date(),
          role: Roles.USER,
        },
      });
    }
    userId = user.id;
  }

  if (!userId) {
    return {
      ok: false,
      message: 'Invalid user ID',
    };
  }

  try {
    if (!Array.isArray(answers) || !answers.length) {
      return {
        ok: false,
        message: 'Invalid answers provided',
      };
    }

    return await calculateCareerPath(userId, answers);
  } catch (error) {
    console.error('Error submitting answers:', error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Failed to submit answers',
    };
  }
}

async function getCareerPathService(userId: string) {
  if (!userId) {
    throw new Error('Invalid user ID');
  }

  try {
    const careerResult = await prisma.careerResult.findUnique({
      where: { userId },
    });

    if (!careerResult) {
      return {
        ok: false,
        status: 404,
        message: 'No career path found for this user',
        errors: [
          { message: 'Please submit answers to get career recommendations' },
        ],
      };
    }

    return {
      ok: true,
      status: 200,
      message: 'Career path retrieved successfully',
      data: {
        recommendedCareer: careerResult.recommendedCareers[0] || '',
        reasoning: careerResult.reasoning || 'No reasoning provided.',
      },
    };
  } catch (error) {
    console.error('Error retrieving career path:', error);
    throw new Error('Failed to retrieve career path');
  }
}

export { submitAnswersService, getCareerPathService };
