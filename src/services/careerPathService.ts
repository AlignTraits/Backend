import { PrismaClient, Roles } from '@prisma/client';
import dotenv from 'dotenv';
import Wetrocloud from 'wetro-sdk';
import MessageResponse from '../types/messageResponse';
import { createUser, getUserByEmail } from '../models/userModel';
import { sendMail } from './mailServices';
import { db } from '../config/db';

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
          // await prisma.careerResult.update({
          //   where: { userId },
          //   data: {
          //     recommendedCareers: {
          //       push: [recommendedCareer], // Prepend instead of push to put latest first
          //     },
          //     reasoning: reasoning, // Update or append reasoning if needed
          //     updatedAt: new Date(),
          //   },
          // });
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
          emailVerified: null,
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

    const updatedUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (updatedUser) {
      const host = process.env.WEBSITE_URL || 'http://localhost:3000';

      // Send welcome email if email is not verified && !updatedUser.emailVerified
      if (!updatedUser.emailVerified) {
        const welcomeEmailResult = await sendMail({
          from: 'Aligntraits <no-reply@aligntrait.com>',
          recipients: [updatedUser.email],
          subject: 'Welcome to AlignTraits - Verify Your Email',
          templateName: 'welcome-unverified-email',
          templateInfo: {
            name: `${updatedUser.firstname} ${updatedUser.lastname}`,
            signupUrl: `${host}/setup-password?email=${updatedUser.email}`,
            host,
          },
        });
        console.log('20: Welcome Email Result:', welcomeEmailResult);
      }
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
    const careerResults = await prisma.careerResult.findUnique({
      where: { userId },
    });

    // if (careerResults.length === 0) {
    //   return {
    //     ok: false,
    //     status: 404,
    //     message: 'No career path found for this user',
    //     errors: [
    //       { message: 'Please submit answers to get career recommendations' },
    //     ],
    //   };
    // }

    // Map all career results to include recommended career and reasoning
    // const formattedResults = careerResults.map((result) => ({
    //   recommendedCareer: result.recommendedCareers
    //     ? [...result.recommendedCareers].reverse()
    //     : [],
    //   reasoning: result.reasoning || 'No reasoning provided.',
    // }));

    return {
      ok: true,
      status: 200,
      message: 'Career paths retrieved successfully',
      data: careerResults,
      // data: formattedResults,
    };
  } catch (error) {
    console.error('Error retrieving career path:', error);
    throw new Error('Failed to retrieve career path');
  }
}

// Server Career Path Mapping
// async function calculateCareerPathFromMappingServer(
//   userId: string,
//   answers: { question: string; answer: string }[],
//   mapping: Record<string, any>
// ): Promise<WetrocloudResponse> {
//   try {
//     // console.log(
//     //   'Calculating career path for user:',
//     //   userId,
//     //   'with answers:',
//     //   answers
//     // );

//     // Convert answers to a case-insensitive map for lookup
//     const answerMap = new Map(
//       answers.map(({ question, answer }) => [
//         question.toLowerCase().replace(/[^a-z0-9]/g, ''), // Normalize question
//         answer.toLowerCase().replace(/[^a-z0-9]/g, ''), // Normalize answer
//       ])
//     );

//     let totalScore: Record<string, number> = {};
//     let matchedDetails: {
//       question: string;
//       answer: string;
//       careers: string[];
//     }[] = [];

//     // Iterate through mapping to find matches with relaxed criteria
//     for (const [category, categoryRules] of Object.entries(mapping)) {
//       for (const [question, options] of Object.entries(categoryRules)) {
//         const normalizedQuestion = question
//           .toLowerCase()
//           .replace(/[^a-z0-9]/g, '');
//         if (answerMap.has(normalizedQuestion)) {
//           const userAnswer = answerMap.get(normalizedQuestion)!;
//           for (const [answerOption, careers] of Object.entries(
//             options as Record<string, unknown>
//           )) {
//             const normalizedOption = answerOption
//               .toLowerCase()
//               .replace(/[^a-z0-9]/g, '');
//             if (
//               userAnswer.includes(normalizedOption) ||
//               normalizedOption.includes(userAnswer)
//             ) {
//               if (
//                 Array.isArray(careers) &&
//                 careers.every((c) => typeof c === 'string')
//               ) {
//                 matchedDetails.push({
//                   question,
//                   answer: userAnswer,
//                   careers: careers as string[],
//                 });
//                 careers.forEach((career) => {
//                   totalScore[career] = (totalScore[career] || 0) + 1; // Increment score for each match
//                 });
//               }
//             }
//           }
//         }
//       }
//     }

//     let recommendedCareer = 'Undetermined';
//     let reasoning = 'No clear career path identified based on your responses.';

//     // Determine the best career based on total score
//     if (matchedDetails.length > 0) {
//       const sortedCareers = Object.entries(totalScore).sort(
//         (a, b) => b[1] - a[1]
//       );
//       recommendedCareer = sortedCareers[0][0]; // Top career

//       // Identify key traits from matched details
//       const traits = {
//         planning: matchedDetails.some(
//           (md) => md.careers.includes('Law') || md.careers.includes('Finance')
//         ),
//         logic: matchedDetails.some(
//           (md) =>
//             md.careers.includes('Data Science') ||
//             md.careers.includes('Engineering')
//         ),
//         independence: matchedDetails.some(
//           (md) => md.careers.includes('Research') || md.careers.includes('IT')
//         ),
//         pressure: matchedDetails.some(
//           (md) => md.careers.includes('Law') || md.careers.includes('Medicine')
//         ),
//         stability: matchedDetails.some(
//           (md) =>
//             md.careers.includes('Government') ||
//             md.careers.includes('Accounting')
//         ),
//         growth: matchedDetails.some(
//           (md) =>
//             md.careers.includes('Engineering') || md.careers.includes('IT')
//         ),
//         feedback: matchedDetails.some(
//           (md) =>
//             md.careers.includes('Public Relations') ||
//             md.careers.includes('Leadership')
//         ),
//         conflict: matchedDetails.some(
//           (md) => md.careers.includes('HR') || md.careers.includes('Teaching')
//         ),
//         decisiveness: matchedDetails.some(
//           (md) =>
//             md.careers.includes('Leadership') || md.careers.includes('Law')
//         ),
//       };

//       // Craft reasoning based on the recommended career
//       const traitList = [];
//       if (traits.planning) traitList.push('structured planning');
//       if (traits.logic) traitList.push('logical decision-making');
//       if (traits.independence) traitList.push('working independently');
//       if (traits.pressure)
//         traitList.push('thriving in competitive environments');
//       if (traits.stability) traitList.push('preferring stability');
//       if (traits.growth) traitList.push('a drive to become an expert');
//       if (traits.feedback) traitList.push('handling feedback constructively');
//       if (traits.conflict) traitList.push('addressing conflict directly');
//       if (traits.decisiveness) traitList.push('quick decision-making');

//       const skills =
//         {
//           Law: 'legal analysis, argumentation, leadership',
//           Engineering: 'technical problem-solving, project management',
//           IT: 'technical expertise, system design',
//           'Data Science': 'data analysis, statistical modeling',
//         }[recommendedCareer] || 'problem-solving, critical thinking';

//       reasoning = `Based on the assessment, you demonstrate ${traitList.join(', ')}. These traits align well with a career in ${recommendedCareer}, which requires ${skills}.`;
//     }

//     // console.log('Career recommendation:', { recommendedCareer, reasoning });

//     // Save to database
//     try {
//       await prisma.careerResult.upsert({
//         where: { userId },
//         update: { recommendedCareers: [recommendedCareer], reasoning },
//         create: {
//           userId,
//           recommendedCareers: [recommendedCareer],
//           reasoning,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       });
//       // await prisma.careerResult.update({
//       //   where: { userId },
//       //   data: {
//       //     recommendedCareers: {
//       //       push: [recommendedCareer], // Prepend instead of push to put latest first
//       //     },
//       //     reasoning: reasoning, // Update or append reasoning if needed
//       //     updatedAt: new Date(),
//       //   },
//       // });
//     } catch (dbError) {
//       console.error('Database save failed:', dbError);
//       return {
//         ok: false,
//         message: 'Failed to save career results',
//       };
//     }

//     return {
//       ok: true,
//       message: 'Career path calculated successfully',
//       data: { recommendedCareer, reasoning },
//     };
//   } catch (error) {
//     console.error('Career path calculation failed:', error);
//     return {
//       ok: false,
//       message:
//         error instanceof Error
//           ? error.message
//           : 'Unable to generate career path recommendation',
//     };
//   }
// }

async function calculateCareerPathFromMappingServer(
  userId: string,
  answers: { question: string; answer: string }[],
  mapping: Record<string, any>
): Promise<WetrocloudResponse> {
  try {
    // console.log(
    //   'Calculating career path for user:',
    //   userId,
    //   'with answers:',
    //   answers
    // );

    // Convert answers to a case-insensitive map for lookup
    const answerMap = new Map(
      answers.map(({ question, answer }) => [
        question.toLowerCase().replace(/[^a-z0-9]/g, ''), // Normalize question
        answer.toLowerCase().replace(/[^a-z0-9]/g, ''), // Normalize answer
      ])
    );

    let totalScore: Record<string, number> = {};
    let matchedDetails: {
      question: string;
      answer: string;
      careers: string[];
    }[] = [];

    // Iterate through mapping to find matches with relaxed criteria
    for (const [category, categoryRules] of Object.entries(mapping)) {
      for (const [question, options] of Object.entries(categoryRules)) {
        const normalizedQuestion = question
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        if (answerMap.has(normalizedQuestion)) {
          const userAnswer = answerMap.get(normalizedQuestion)!;
          for (const [answerOption, careers] of Object.entries(
            options as Record<string, unknown>
          )) {
            const normalizedOption = answerOption
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
            if (
              userAnswer.includes(normalizedOption) ||
              normalizedOption.includes(userAnswer)
            ) {
              if (
                Array.isArray(careers) &&
                careers.every((c) => typeof c === 'string')
              ) {
                matchedDetails.push({
                  question,
                  answer: userAnswer,
                  careers: careers as string[],
                });
                careers.forEach((career) => {
                  totalScore[career] = (totalScore[career] || 0) + 1; // Increment score for each match
                });
              }
            }
          }
        }
      }
    }

    let recommendedCareers: string[] = ['Undetermined'];
    let reasoning = 'No clear career paths identified based on your responses.';

    // Determine the top 4 careers based on total score
    if (matchedDetails.length > 0) {
      const sortedCareers = Object.entries(totalScore).sort(
        (a, b) => b[1] - a[1]
      );
      recommendedCareers = sortedCareers
        .slice(0, 4) // Take top 4 careers
        .map((entry) => entry[0]); // Extract career names

      // Identify key traits from matched details
      const traits = {
        planning: matchedDetails.some(
          (md) => md.careers.includes('Law') || md.careers.includes('Finance')
        ),
        logic: matchedDetails.some(
          (md) =>
            md.careers.includes('Data Science') ||
            md.careers.includes('Engineering')
        ),
        independence: matchedDetails.some(
          (md) => md.careers.includes('Research') || md.careers.includes('IT')
        ),
        pressure: matchedDetails.some(
          (md) => md.careers.includes('Law') || md.careers.includes('Medicine')
        ),
        stability: matchedDetails.some(
          (md) =>
            md.careers.includes('Government') ||
            md.careers.includes('Accounting')
        ),
        growth: matchedDetails.some(
          (md) =>
            md.careers.includes('Engineering') || md.careers.includes('IT')
        ),
        feedback: matchedDetails.some(
          (md) =>
            md.careers.includes('Public Relations') ||
            md.careers.includes('Leadership')
        ),
        conflict: matchedDetails.some(
          (md) => md.careers.includes('HR') || md.careers.includes('Teaching')
        ),
        decisiveness: matchedDetails.some(
          (md) =>
            md.careers.includes('Leadership') || md.careers.includes('Law')
        ),
      };

      // Craft reasoning based on the top 4 recommended careers
      const traitList = [];
      if (traits.planning) traitList.push('structured planning');
      if (traits.logic) traitList.push('logical decision-making');
      if (traits.independence) traitList.push('working independently');
      if (traits.pressure)
        traitList.push('thriving in competitive environments');
      if (traits.stability) traitList.push('preferring stability');
      if (traits.growth) traitList.push('a drive to become an expert');
      if (traits.feedback) traitList.push('handling feedback constructively');
      if (traits.conflict) traitList.push('addressing conflict directly');
      if (traits.decisiveness) traitList.push('quick decision-making');

      const careerSkills: Record<
        | 'Law'
        | 'Engineering'
        | 'IT'
        | 'Data Science'
        | 'Finance'
        | 'Medicine'
        | 'Accounting'
        | 'Psychology'
        | 'Social Work'
        | 'Marketing'
        | 'Startups'
        | 'HR'
        | 'Teaching'
        | 'Sales'
        | 'Public Relations'
        | 'Business'
        | 'Research'
        | 'Writing'
        | 'Management'
        | 'Economics'
        | 'Banking'
        | 'Government'
        | 'Entrepreneurship'
        | 'Consulting'
        | 'Mid-Level Mgmt'
        | 'Healthcare'
        | 'Counseling'
        | 'Support/Admin',
        string
      > = {
        Law: 'legal analysis, argumentation, leadership',
        Engineering: 'technical problem-solving, project management',
        IT: 'technical expertise, system design',
        'Data Science': 'data analysis, statistical modeling',
        Finance: 'financial planning, risk assessment',
        Medicine: 'patient care, medical knowledge',
        Accounting: 'financial reporting, auditing, precision',
        Psychology: 'emotional intelligence, counseling, research',
        'Social Work': 'community support, empathy, advocacy',
        Marketing: 'creative strategy, market analysis, communication',
        Startups: 'innovation, risk management, adaptability',
        HR: 'employee relations, conflict resolution, training',
        Teaching: 'education, communication, mentorship',
        Sales: 'persuasion, relationship building, negotiation',
        'Public Relations': 'media management, storytelling, networking',
        Business: 'strategy, leadership, decision-making',
        Research: 'investigation, critical thinking, documentation',
        Writing: 'content creation, editing, narrative skills',
        Management: 'team leadership, resource allocation, planning',
        Economics: 'economic analysis, policy advising, forecasting',
        Banking: 'financial services, risk assessment, customer relations',
        Government: 'public policy, administration, stability',
        Entrepreneurship: 'business development, innovation, resilience',
        Consulting: 'problem-solving, advisory services, adaptability',
        'Mid-Level Mgmt': 'team coordination, process optimization, support',
        Healthcare: 'patient care, medical knowledge, teamwork',
        Counseling: 'emotional support, guidance, listening skills',
        'Support/Admin': 'organization, documentation, reliability',
      };

      const skillsList = recommendedCareers
        .map((career) =>
          career in careerSkills
            ? careerSkills[career as keyof typeof careerSkills]
            : 'problem-solving, critical thinking'
        )
        .join('; ');

      reasoning = `Based on the assessment, you demonstrate ${traitList.join(
        ', '
      )}. These traits align well with careers in ${recommendedCareers.join(
        ', '
      )}, which require ${skillsList}. The recommendations are prioritized by your strongest matches, with ${recommendedCareers[0]} being the top fit.`;
    }

    // console.log('Career recommendation:', { recommendedCareer, reasoning });

    // Save to database
    try {
      await prisma.careerResult.upsert({
        where: { userId },
        update: { recommendedCareers, reasoning },
        create: {
          userId,
          recommendedCareers,
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
      data: { recommendedCareers, reasoning },
    };
  } catch (error) {
    console.error('Career path calculation failed:', error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to generate career path recommendation',
    };
  }
}

// This mapping is used to categorize career paths based on user responses
const careerPathMappingServer: Record<string, any> = {
  personality_mbti: {
    when_learning_something_new_do_you_prefer: {
      'Practical, hands-on experience': ['Engineering', 'Accounting', 'IT'],
      'Exploring theories and possibilities': ['Psychology', 'Social Work'],
    },
    when_working_on_a_group_project_do_you: {
      'Prefer structured plans and clear goals': ['Law', 'Finance'],
      'Adapt as you go and keep things flexible': ['Marketing', 'Startups'],
    },
    when_making_a_decision_do_you: {
      'Focus on facts and logic': ['Data Science', 'Engineering'],
      'Consider how it affects people emotionally': ['HR', 'Teaching'],
    },
    do_you_feel_energized_by: {
      'Socializing and working with groups': ['Sales', 'PR', 'Business'],
      'Working alone or in quiet environments': ['Research', 'Writing', 'IT'],
    },
  },
  work_behavior_disc: {
    how_do_you_approach_challenges_at_work: {
      'Take control and solve problems quickly': [
        'Leadership',
        'Law',
        'Business',
      ],
      'Persuade and inspire others to contribute': ['Marketing', 'PR', 'Sales'],
      'Work patiently and maintain team harmony': ['HR', 'Teaching'],
      'Analyze all details before making a decision': [
        'Data Analysis',
        'Engineering',
      ],
    },
    when_managing_a_project_you_prefer: {
      'Setting ambitious goals and leading from the front': [
        'Business',
        'Law',
        'Management',
      ],
      'Engaging people and ensuring collaboration': [
        'Marketing',
        'Social Careers',
      ],
      'Maintaining a stable workflow and supporting the team': [
        'Healthcare',
        'HR',
      ],
      'Creating detailed plans and ensuring accuracy': ['Finance', 'IT'],
    },
  },
  career_values_schein: {
    which_of_these_job_features_is_most_important_to_you: {
      'Becoming an expert in my field': ['Engineering', 'IT'],
      'Leading teams and making decisions': ['Business', 'Economics'],
      'Having job security and stability': ['Banking', 'Government'],
      'Helping people and making a difference': ['Social Work', 'Teaching'],
    },
    if_you_had_to_choose_between_two_job_offers_you_would_pick: {
      'A stable job with a clear career path': ['Government', 'Accounting'],
      'A high-risk, high-reward opportunity': ['Entrepreneurship', 'Marketing'],
    },
  },
  emotional_intelligence_eq: {
    when_you_receive_negative_feedback_you: {
      'Take it constructively and improve': ['Public Relations', 'Leadership'],
      'Feel discouraged but eventually bounce back': [
        'Research',
        'Data Science',
      ],
      'Get defensive and justify your actions': ['Research', 'Data Science'],
    },
    how_do_you_handle_workplace_conflict: {
      'Address it immediately and resolve the issue': [
        'HR',
        'Teaching',
        'Counseling',
      ],
      'Try to mediate and find common ground': ['HR', 'Teaching', 'Counseling'],
      'Avoid confrontation and let it pass': ['Independent Roles'],
    },
    which_situation_would_stress_you_the_most: {
      'Constantly having to network and socialize': ['Analytical Work'],
      'Working alone for long periods without interaction': ['Dynamic Fields'],
      'Being in an unpredictable and rapidly changing job': ['Stable Roles'],
      'Doing the same repetitive tasks every day': ['Dynamic Fields'],
    },
  },
  motivation_career_drive: {
    when_you_set_a_goal_how_do_you_pursue_it: {
      'Push myself to achieve it, no matter the obstacles': ['Law', 'Medicine'],
      'Work steadily but adjust if necessary': ['Business', 'Marketing'],
      'Lose interest if it takes too long': ['Support', 'Admin'],
    },
    if_faced_with_a_major_career_setback_what_would_you_do: {
      'Work even harder and find another way': ['Finance', 'Startups'],
      'Reevaluate my options and adjust my plans': [
        'Consulting',
        'Mid-Level Management',
      ],
      'Feel discouraged and consider quitting': ['Routine Roles'],
    },
    what_type_of_work_environment_suits_you_best: {
      'High-pressure, competitive fields': ['Law', 'Medicine'],
      'Balanced work-life environment': ['Creative Fields'],
      'Low-stress, stable careers': ['Government', 'Admin'],
    },
  },
};

async function submitAnswersServiceServer(
  answers: { question: string; answer: string }[],
  firstName?: string,
  lastName?: string,
  email?: string
): Promise<WetrocloudResponse> {
  let userId: string | null = null;

  // Handle user creation or retrieval based on email
  if (email) {
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser({
        data: {
          firstname: firstName ?? '',
          lastname: lastName ?? '',
          email,
          password: '', // Empty password as per eligibility check
          emailVerified: null, // Require verification
          role: Roles.USER,
        },
      });
      console.log('New user created:', {
        userId: user.id,
        email,
        emailVerified: user.emailVerified,
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
        message: 'Invalid or empty answers provided',
      };
    }

    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        email: true,
        firstname: true,
        lastname: true,
        email_token: true,
      }, // Explicitly select required fields
    });

    console.log('Fetched user:', {
      userId,
      emailVerified: updatedUser?.emailVerified,
    }); // Debug log

    if (!updatedUser) {
      return {
        ok: false,
        message: 'User not found after creation',
      };
    }

    const host = process.env.WEBSITE_URL || 'http://localhost:3000';

    // Send welcome email if email is not verified
    if (updatedUser.emailVerified === null) {
      // Explicitly check for null
      console.log(
        'Email verification is null, triggering email send for:',
        updatedUser.email
      );
      const welcomeEmailResult = await sendMail({
        from: 'Aligntraits <no-reply@aligntrait.com>',
        recipients: [
          updatedUser.email === 'odionbeauty7@example.com'
            ? 'testuser@resend.dev'
            : updatedUser.email,
        ], // Use test email for example.com
        subject: 'Welcome to AlignTraits - Verify Your Email',
        templateName: 'welcome-unverified-email',
        templateInfo: {
          name: `${updatedUser.firstname} ${updatedUser.lastname}` || 'User',
          signupUrl: `${host}/setup-password?email=${updatedUser.email}`,
          host,
        },
      });
      console.log('20: Welcome Email Result:', welcomeEmailResult);
      if (!welcomeEmailResult.ok) {
        console.warn(
          'Email sending failed: ',
          welcomeEmailResult.message ||
            'Unknown error, proceeding with career calculation'
        );
      }
    } else {
      console.log(
        'Email already verified or not null, skipping email send for:',
        updatedUser.email
      );
    }

    // Calculate career path
    const careerResult = await calculateCareerPathFromMappingServer(
      userId,
      answers,
      careerPathMappingServer
    );
    return careerResult;
  } catch (error) {
    console.error('Error submitting answers:', error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Failed to submit answers',
    };
  }
}

// Recommended Courses

type AcademicRecordSubjectFields =
  | 'ExamType1Subjects'
  | 'ExamType2Subjects'
  | 'ExamType3Subjects'
  | 'ExamType4Subjects'
  | 'ExamType5Subjects'
  | 'ExamType6Subjects'
  | 'ExamType7Subjects'
  | 'ExamType8Subjects'
  | 'ExamType9Subjects'
  | 'ExamType10Subjects';

type CourseSubjectFields =
  | 'ExamType1Subjects'
  | 'ExamType2Subjects'
  | 'ExamType3Subjects'
  | 'ExamType4Subjects'
  | 'ExamType5Subjects'
  | 'ExamType6Subjects'
  | 'ExamType7Subjects'
  | 'ExamType8Subjects'
  | 'ExamType9Subjects'
  | 'ExamType10Subjects';

interface RecommendedCourse {
  id: string;
  title: string;
}

// async function extractUserData(userId: string) {
//   const careerResult = await prisma.careerResult.findUnique({
//     where: { userId },
//     include: { user: { include: { academicRecords: true } } },
//   });

//   if (!careerResult) {
//     throw new Error('No career path found for this user');
//   }

//   const academicRecord = careerResult.user.academicRecords[0];
//   if (!academicRecord) {
//     throw new Error('No academic record found for this user');
//   }

//   console.log('academicRecord:', academicRecord);

//   let userSubjects: string[] = [];
//   const subjectFields: AcademicRecordSubjectFields[] = [
//     'ExamType1Subjects',
//     'ExamType2Subjects',
//     'ExamType3Subjects',
//     'ExamType4Subjects',
//     'ExamType5Subjects',
//     'ExamType6Subjects',
//     'ExamType7Subjects',
//     'ExamType8Subjects',
//     'ExamType9Subjects',
//     'ExamType10Subjects',
//   ];
//   for (const field of subjectFields) {
//     if (academicRecord[field]) {
//       try {
//         userSubjects = JSON.parse(academicRecord[field] as string) || [];
//         break;
//       } catch (e) {
//         console.warn(`Failed to parse ${field}:`, e);
//       }
//     }
//   }

//   const firstCareer = careerResult.recommendedCareers[0] || 'Undetermined';

//   return { careerResult, firstCareer, userSubjects };
// }

// async function matchRecommendedCourses(
//   firstCareer: string,
//   userSubjects: string[]
// ): Promise<RecommendedCourse[]> {
//   const requiredSubjects = ['Math', 'English', ...userSubjects.slice(2)]; // Ensure Math and English are included
//   const minSubjectMatch = 5;

//   let recommendedCourses: RecommendedCourse[] = [];

//   // Step 1: Find category matching the first career and loop through its courses
//   const matchingCategory = await prisma.courseCategory.findFirst({
//     where: { name: { contains: firstCareer, mode: 'insensitive' } },
//     include: { courses: true },
//   });

//   if (matchingCategory?.courses && matchingCategory.courses.length > 0) {
//     recommendedCourses = matchingCategory.courses
//       .filter((course) => {
//         const subjectFields: CourseSubjectFields[] = [
//           'ExamType1Subjects',
//           'ExamType2Subjects',
//           'ExamType3Subjects',
//           'ExamType4Subjects',
//           'ExamType5Subjects',
//           'ExamType6Subjects',
//           'ExamType7Subjects',
//           'ExamType8Subjects',
//           'ExamType9Subjects',
//           'ExamType10Subjects',
//         ];
//         for (const field of subjectFields) {
//           if (course[field]) {
//             try {
//               const courseSubjects = JSON.parse(course[field] as string) || [];
//               const matches = courseSubjects.filter((subject: string) =>
//                 requiredSubjects.includes(subject)
//               ).length;
//               return matches >= minSubjectMatch;
//             } catch (e) {
//               console.warn(`Failed to parse course ${field}:`, e);
//               return false;
//             }
//           }
//         }
//         return false;
//       })
//       .map((course) => ({ id: course.id, title: course.title }))
//       .slice(0, 5); // Limit to 5
//   }

//   // Step 2: If no courses match the category, find 3–5 courses from any category
//   if (
//     recommendedCourses.length === 0 &&
//     userSubjects.length >= minSubjectMatch
//   ) {
//     const allCategories = await prisma.courseCategory.findMany({
//       include: { courses: true },
//     });
//     const allCourses = allCategories.flatMap(
//       (category) => category.courses || []
//     );

//     recommendedCourses = allCourses
//       .filter((course) => {
//         const subjectFields: CourseSubjectFields[] = [
//           'ExamType1Subjects',
//           'ExamType2Subjects',
//           'ExamType3Subjects',
//           'ExamType4Subjects',
//           'ExamType5Subjects',
//           'ExamType6Subjects',
//           'ExamType7Subjects',
//           'ExamType8Subjects',
//           'ExamType9Subjects',
//           'ExamType10Subjects',
//         ];
//         for (const field of subjectFields) {
//           if (course[field]) {
//             try {
//               const courseSubjects = JSON.parse(course[field] as string) || [];
//               const matches = courseSubjects.filter((subject: string) =>
//                 requiredSubjects.includes(subject)
//               ).length;
//               return matches >= minSubjectMatch;
//             } catch (e) {
//               console.warn(`Failed to parse course ${field}:`, e);
//               return false;
//             }
//           }
//         }
//         return false;
//       })
//       .map((course) => ({ id: course.id, title: course.title }))
//       .slice(0, 5); // Limit to 5
//   }

//   // Ensure 3–5 courses
//   return recommendedCourses.length < 3 && recommendedCourses.length > 0
//     ? recommendedCourses
//     : recommendedCourses.slice(0, 5).slice(-5); // Restrict to 3–5
// }

async function extractUserData(userId: string, academicRecord: any) {
  const careerResult = await prisma.careerResult.findUnique({
    where: { userId },
    include: { user: true }, // No academicRecords needed
  });

  if (!careerResult) {
    throw new Error('No career path found for this user');
  }

  console.log('academicRecord from request:', academicRecord); // Debug log

  let subjectData: { [key: string]: string[] } = {};
  const subjectFields: AcademicRecordSubjectFields[] = [
    'ExamType1Subjects',
    'ExamType2Subjects',
    'ExamType3Subjects',
    'ExamType4Subjects',
    'ExamType5Subjects',
    'ExamType6Subjects',
    'ExamType7Subjects',
    'ExamType8Subjects',
    'ExamType9Subjects',
    'ExamType10Subjects',
  ];
  for (const field of subjectFields) {
    const examTypeField = field.replace(
      'Subjects',
      ''
    ) as `ExamType${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
    if (academicRecord[field] && academicRecord[examTypeField]) {
      try {
        const subjects =
          JSON.parse(JSON.stringify(academicRecord[field])) || []; // Ensure proper parsing
        const examType = academicRecord[examTypeField] as string;
        subjectData[examType] = subjects;
        console.log(`Parsed ${examType}:`, subjects); // Debug log
      } catch (e) {
        console.warn(`Failed to parse ${field}:`, e);
      }
    }
  }

  const firstCareer = careerResult.recommendedCareers[0] || 'Undetermined';
  console.log('firstCareer:', firstCareer); // Debug log

  return { careerResult, firstCareer, subjectData };
}

async function matchRecommendedCourses(
  firstCareer: string,
  subjectData: { [key: string]: string[] }
): Promise<RecommendedCourse[]> {
  const minSubjectMatchDefault = 5;
  const minSubjectMatchJambUtme = 4;

  let recommendedCourses: RecommendedCourse[] = [];

  // Step 1: Find category matching the first career
  const matchingCategory = await prisma.courseCategory.findFirst({
    where: { name: { contains: firstCareer, mode: 'insensitive' } },
    include: { courses: true },
  });

  if (matchingCategory?.courses && matchingCategory.courses.length > 0) {
    recommendedCourses = matchingCategory.courses
      .filter((course) => {
        const academicExamTypes = Object.entries(subjectData);
        const courseExamTypes = getCourseExamTypes(course);
        const matchedExamTypes = matchExamTypes(
          academicExamTypes,
          courseExamTypes
        );
        console.log('Matched Exam Types (Category):', matchedExamTypes); // Debug log

        let totalMatches = 0;
        for (const [academicType, academicSubjects] of matchedExamTypes) {
          const courseField = courseExamTypes.find(
            ([field]) => getExamTypeName(course, field) === academicType
          )?.[0];
          if (courseField && academicSubjects) {
            const courseSubjects =
              JSON.parse(course[courseField] as string) || [];
            const isJambUtme = ['JAMB', 'UTME'].includes(
              academicType.toUpperCase()
            );
            const minMatches = isJambUtme
              ? minSubjectMatchJambUtme
              : minSubjectMatchDefault;

            const matches = courseSubjects.filter((subject: string) =>
              academicSubjects.includes(subject)
            ).length;
            totalMatches += matches;
            console.log(`Matches for ${academicType}:`, matches); // Debug log
          }
        }
        console.log('Total Matches (Category):', totalMatches); // Debug log
        return totalMatches >= minSubjectMatchDefault;
      })
      .map((course) => ({ id: course.id, title: course.title }))
      .slice(0, 5);
  }

  // Step 2: Fallback to all categories
  if (recommendedCourses.length === 0 && Object.keys(subjectData).length >= 1) {
    const allCategories = await prisma.courseCategory.findMany({
      include: { courses: true },
    });
    const allCourses = allCategories.flatMap(
      (category) => category.courses || []
    );

    recommendedCourses = allCourses
      .filter((course) => {
        const academicExamTypes = Object.entries(subjectData);
        const courseExamTypes = getCourseExamTypes(course);
        const matchedExamTypes = matchExamTypes(
          academicExamTypes,
          courseExamTypes
        );
        console.log('Matched Exam Types (Fallback):', matchedExamTypes); // Debug log

        let totalMatches = 0;
        for (const [academicType, academicSubjects] of matchedExamTypes) {
          const courseField = courseExamTypes.find(
            ([field]) => getExamTypeName(course, field) === academicType
          )?.[0];
          if (courseField && academicSubjects) {
            const courseSubjects =
              JSON.parse(course[courseField] as string) || [];
            const isJambUtme = ['JAMB', 'UTME'].includes(
              academicType.toUpperCase()
            );
            const minMatches = isJambUtme
              ? minSubjectMatchJambUtme
              : minSubjectMatchDefault;

            const matches = courseSubjects.filter((subject: string) =>
              academicSubjects.includes(subject)
            ).length;
            totalMatches += matches;
            console.log(`Matches for ${academicType}:`, matches); // Debug log
          }
        }
        console.log('Total Matches (Fallback):', totalMatches); // Debug log
        return totalMatches >= minSubjectMatchDefault;
      })
      .map((course) => ({ id: course.id, title: course.title }))
      .slice(0, 5);
  }

  // Ensure 3–5 courses
  return recommendedCourses.length < 3 && recommendedCourses.length > 0
    ? recommendedCourses
    : recommendedCourses.slice(0, 5).slice(-5);

  // Helper functions (unchanged)
  function getCourseExamTypes(
    course: any
  ): [CourseSubjectFields | null, string | null][] {
    const examTypes: [CourseSubjectFields | null, string | null][] = [];
    const subjectFields: CourseSubjectFields[] = [
      'ExamType1Subjects',
      'ExamType2Subjects',
      'ExamType3Subjects',
      'ExamType4Subjects',
      'ExamType5Subjects',
      'ExamType6Subjects',
      'ExamType7Subjects',
      'ExamType8Subjects',
      'ExamType9Subjects',
      'ExamType10Subjects',
    ];
    for (const field of subjectFields) {
      const examTypeField = field.replace(
        'Subjects',
        ''
      ) as `ExamType${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
      if (course[examTypeField]) {
        examTypes.push([field, course[examTypeField] as string]);
      }
    }
    return examTypes;
  }

  function getExamTypeName(
    course: any,
    field: CourseSubjectFields | null
  ): string {
    const examTypeField = field ? field.replace('Subjects', '') : null;
    return examTypeField ? (course[examTypeField] as string) || '' : '';
  }

  function matchExamTypes(
    academicExamTypes: [string, string[]][],
    courseExamTypes: [CourseSubjectFields | null, string | null][]
  ): [string, string[]][] {
    const matched: [string, string[]][] = [];
    for (const [academicType, academicSubjects] of academicExamTypes) {
      for (const [courseField, courseType] of courseExamTypes) {
        if (
          courseType &&
          academicType.toUpperCase() === courseType.toUpperCase()
        ) {
          matched.push([academicType, academicSubjects]);
          break;
        }
      }
    }
    return matched.length > 0 ? matched : academicExamTypes.slice(0, 1);
  }
}

async function getRecommendedCoursesService(
  userId: string,
  academicRecord: any
): Promise<WetrocloudResponse> {
  if (!userId) {
    throw new Error('Invalid user ID');
  }

  try {
    const { firstCareer, subjectData } = await extractUserData(
      userId,
      academicRecord
    );
    const recommendedCourses = await matchRecommendedCourses(
      firstCareer,
      subjectData
    );

    // Update careerResult with recommended courses
    if (recommendedCourses.length > 0) {
      await prisma.careerResult.update({
        where: { userId },
        data: { recommendedCourses: recommendedCourses as any }, // Cast to Json
      });
    }

    console.log('Recommended Courses:', recommendedCourses); // Diagnostic log
    return {
      ok: true,
      status: 200,
      message: 'Recommended courses retrieved successfully',
      data: recommendedCourses,
    };
  } catch (error) {
    console.error('Error retrieving career path:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string' &&
      (error as any).message === 'No career path found for this user'
    ) {
      return {
        ok: false,
        status: 404,
        message: 'No career path found for this user',
        data: {
          message: 'Please submit answers to get career recommendations',
        },
      };
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string' &&
      (error as any).message === 'No academic record found for this user'
    ) {
      return {
        ok: false,
        status: 404,
        message: 'No academic record found for this user',
        data: {
          message: 'Please submit your academic record to get recommendations',
        },
      };
    }
    throw new Error('Failed to retrieve career path');
  }
}

// async function getRecommendedCoursesService(
//   userId: string
// ): Promise<WetrocloudResponse> {
//   if (!userId) {
//     throw new Error('Invalid user ID');
//   }

//   try {
//     const { firstCareer, userSubjects } = await extractUserData(userId);
//     const recommendedCourses = await matchRecommendedCourses(
//       firstCareer,
//       userSubjects
//     );

//     // Update careerResult with recommended courses
//     if (recommendedCourses.length > 0) {
//       await prisma.careerResult.update({
//         where: { userId },
//         data: { recommendedCourses: recommendedCourses as any }, // Cast to Json
//       });
//     }

//     return {
//       ok: true,
//       status: 200,
//       message: 'Recommended courses retrieved successfully',
//       data: recommendedCourses,
//     };
//   } catch (error) {
//     console.error('Error retrieving career path:', error);
//     if (
//       typeof error === 'object' &&
//       error !== null &&
//       'message' in error &&
//       typeof (error as any).message === 'string' &&
//       (error as any).message === 'No career path found for this user'
//     ) {
//       return {
//         ok: false,
//         status: 404,
//         message: 'No career path found for this user',
//         data: {
//           message: 'Please submit answers to get career recommendations',
//         },
//       };
//     }
//     if (
//       typeof error === 'object' &&
//       error !== null &&
//       'message' in error &&
//       typeof (error as any).message === 'string' &&
//       (error as any).message === 'No academic record found for this user'
//     ) {
//       return {
//         ok: false,
//         status: 404,
//         message: 'No academic record found for this user',
//         data: {
//           message: 'Please submit your academic record to get recommendations',
//         },
//       };
//     }
//     throw new Error('Failed to retrieve career path');
//   }
// }

export {
  submitAnswersService,
  submitAnswersServiceServer,
  getCareerPathService,
  // recommended courses service
  getRecommendedCoursesService,
};
