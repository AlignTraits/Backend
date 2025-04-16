import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of question responses to career paths
const careerPathMapping: Record<string, any> = {
  personality_mbti: {
    learning_style: {
      S: ['Engineering', 'Accounting', 'IT'],
      N: ['Psychology', 'Social Work'],
    },
    group_project: {
      J: ['Law', 'Finance'],
      P: ['Marketing', 'Startups'],
    },
    decision_making: {
      T: ['Data Science', 'Engineering'],
      F: ['HR', 'Teaching'],
    },
    energy_source: {
      E: ['Sales', 'PR', 'Business'],
      I: ['Research', 'Writing', 'IT'],
    },
  },
  work_behavior_disc: {
    challenge_approach: {
      D: ['Leadership', 'Law', 'Business'],
      I: ['Marketing', 'PR', 'Sales'],
      S: ['HR', 'Teaching'],
      C: ['Data Analysis', 'Engineering'],
    },
    project_management: {
      D: ['Business', 'Law', 'Management'],
      I: ['Marketing', 'Social Careers'],
      S: ['Healthcare', 'HR'],
      C: ['Finance', 'IT'],
    },
  },
  career_values_schein: {
    job_feature: {
      Technical: ['Engineering', 'IT'],
      Managerial: ['Business', 'Economics'],
      Stability: ['Banking', 'Government'],
      Service: ['Social Work', 'Teaching'],
    },
    job_offer_choice: {
      Stable: ['Government', 'Accounting'],
      HighRisk: ['Entrepreneurship', 'Marketing'],
    },
  },
  emotional_intelligence_eq: {
    negative_feedback: {
      Constructive: ['Public Relations', 'Leadership'],
      Discouraged: ['Research', 'Data Science'],
      Defensive: ['Research', 'Data Science'],
    },
    conflict_handling: {
      Immediate: ['HR', 'Teaching', 'Counseling'],
      Mediate: ['HR', 'Teaching', 'Counseling'],
      Avoid: ['Independent Roles'],
    },
    stress_source: {
      Social: ['Analytical Work'],
      Alone: ['Dynamic Fields'],
      Unpredictable: ['Stable Roles'],
      Repetitive: ['Dynamic Fields'],
    },
  },
  motivation_career_drive: {
    goal_pursuit: {
      Persistent: ['Law', 'Medicine'],
      Steady: ['Business', 'Marketing'],
      LoseInterest: ['Support', 'Admin'],
    },
    setback_response: {
      Harder: ['Finance', 'Startups'],
      Reevaluate: ['Consulting', 'Mid-Level Management'],
      Discouraged: ['Routine Roles'],
    },
    work_environment: {
      HighPressure: ['Law', 'Medicine'],
      Balanced: ['Creative Fields'],
      LowStress: ['Government', 'Admin'],
    },
  },
};

// Function to calculate career paths based on user answers
async function calculateCareerPath(userId: string) {
  try {
    // Fetch user answers from the database
    const userAnswers = await prisma.userResponse.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            section: true, // Include SurveySection to access section name
          },
        },
        selectedOption: true, // Include AnswerOption to access text
      },
    });

    if (!userAnswers.length) {
      throw new Error('No answers found for this user');
    }

    // Initialize career path scores
    const careerScores: Record<string, number> = {};

    // Group answers by questionId to handle multiple answers per question
    const answersByQuestion: Record<string, typeof userAnswers> = {};
    userAnswers.forEach((userResponse) => {
      const questionId = userResponse.questionId;
      if (!answersByQuestion[questionId]) {
        answersByQuestion[questionId] = [];
      }
      answersByQuestion[questionId].push(userResponse);
    });

    // Process each question and its answers
    Object.values(answersByQuestion).forEach((responses) => {
      const { question } = responses[0]; // All responses share the same question
      const section = question.section.name.toLowerCase().replace(/\s/g, '_');
      const questionKey = question.text.toLowerCase().replace(/\s/g, '_');

      // Collect all selected option texts for this question
      const selectedOptions = responses.map(
        (response) => response.selectedOption.text
      );

      // Get career paths for each selected option
      selectedOptions.forEach((selectedOption) => {
        const paths =
          careerPathMapping[section]?.[questionKey]?.[selectedOption] || [];

        // Increment scores for each career path
        paths.forEach((path: string) => {
          careerScores[path] = (careerScores[path] ?? 0) + 1;
        });
      });
    });

    // Sort career paths by score and limit to top 3
    const sortedCareers = Object.entries(careerScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 3)
      .map(([career]) => career);

    // Store or update career path result in the database
    await prisma.careerResult.upsert({
      where: { userId },
      update: {
        recommendedCareers: sortedCareers,
        updatedAt: new Date(),
      },
      create: {
        userId,
        recommendedCareers: sortedCareers,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      ok: true,
      message: 'Career path calculated successfully',
      data: { recommendedCareers: sortedCareers },
    };
  } catch (error) {
    console.error('Error calculating career path:', error);
    throw new Error('Failed to calculate career path');
  }
}

// Function to handle user answer submission
async function submitAnswersService(
  userId: string,
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[]
) {
  try {
    // Validate answers
    if (!Array.isArray(answers) || !answers.length) {
      throw new Error('Invalid answers provided');
    }

    // Save answers to the database
    const answerPromises = answers.map(async (answer) => {
      const { questionId, selectedOptionId } = answer;
      return prisma.userResponse.create({
        data: {
          userId,
          questionId,
          selectedOptionId,
          createdAt: new Date(),
        },
      });
    });

    await Promise.all(answerPromises);

    // Calculate career path after saving answers
    return await calculateCareerPath(userId);
  } catch (error) {
    console.error('Error submitting answers:', error);
    throw new Error('Failed to submit answers');
  }
}

// Function to get career path results
async function getCareerPathService(userId: string) {
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
      data: { recommendedCareers: careerResult.recommendedCareers },
    };
  } catch (error) {
    console.error('Error retrieving career path:', error);
    throw new Error('Failed to retrieve career path');
  }
}

export { submitAnswersService, getCareerPathService };
