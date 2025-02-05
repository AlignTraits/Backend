// services/schoolService.ts
import { db } from '../config/db';
import { DefaultArgs } from '@prisma/client/runtime/library';

enum SchoolType {
  FEDERAL_UNIVERSITY = 'FEDERAL_UNIVERSITY',
  PRIVATE_UNIVERSITY = 'PRIVATE_UNIVERSITY',
  PUBLIC_UNIVERSITY = 'PUBLIC_UNIVERSITY',
}

export enum DurationPeriod {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

export enum Currency {
  NAIRA = 'NAIRA',
  DOLLAR = 'DOLLAR',
}

// Create School Function
const createSchool = async (schoolData: {
  data: {
    name: string;
    schoolType: SchoolType;
    location: string;
    logo: string | null;
    websiteUrl: string;
  };
}) => {
  return db.school.create(schoolData);
};

// Create Course Function
const createCourse = async (courseData: {
  data: {
    title: string;
    profile: string;
    schoolId: string;
    scholarship: string;
    duration: number;
    durationPeriod: DurationPeriod;
    price: number;
    currency: Currency;
    acceptanceFee: number;
    estimatedLivingCost: number;
    acceptanceFeeCurrency: Currency;
    description: string;
    requirements: string[];
    courseInformation: string; // New field
    courseWebsiteUrl: string; // New field
    programLevel: string; // New field
    careerOpportunities: string[]; // New field
    loanInformation: string; // New field
  };
}) => {
  return db.course.create(courseData);
};

// Export Functions
export { createSchool, createCourse };
