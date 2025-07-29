import { DurationPeriod, Currency } from '@prisma/client';

export enum SchoolType {
  FEDERAL_UNIVERSITY = 'FEDERAL_UNIVERSITY',
  PRIVATE_UNIVERSITY = 'PRIVATE_UNIVERSITY',
  PUBLIC_UNIVERSITY = 'PUBLIC_UNIVERSITY',
}

export interface CreateCSVSchoolData {
  name: string;
  schoolType: SchoolType;
  location: string;
  websiteUrl: string;
}
export interface CreateCourseData {
  title: string;
  logo: Express.Multer.File | null | undefined; // Keep as logo
  schoolId: string;
  scholarship: string;
  scholarshipInformation?: string;
  duration: number;
  durationPeriod: DurationPeriod;
  price: number;
  currency: Currency;
  acceptanceFee: number;
  acceptanceFeeCurrency: Currency;
  objectives: string;
  courseWebsiteUrl: string;
  programLevel: string;
  loanInformation?: string;
  ratings?: number; // Optional as per model
  categoryId?: number; // Add categoryId
}

// Type for updating a course (all fields optional)
export interface UpdateCourseData {
  id: string;
  title?: string;
  logo?: Express.Multer.File | null | undefined; // Keep as logo
  schoolId?: string;
  scholarship?: string;
  scholarshipInformation?: string; // Allow null for updates
  duration?: number;
  durationPeriod?: DurationPeriod;
  price?: number;
  currency?: Currency;
  acceptanceFee?: number;
  acceptanceFeeCurrency?: Currency;
  objectives?: string;
  courseWebsiteUrl?: string;
  programLevel?: string;
  loanInformation?: string;
  ratings?: number; // Optional
  categoryId?: number; // Add categoryId
}

export interface CreateCSVCourseData {
  title: string;
  image: string; // Renamed from profile to image
  schoolId: string;
  scholarship: string;
  scholarshipInformation?: string;
  duration: number;
  durationPeriod: DurationPeriod;
  price: number;
  currency: Currency;
  acceptanceFee: number;
  acceptanceFeeCurrency: Currency;
  objectives: string;
  requirements: string[];
  courseInformation: string;
  courseWebsiteUrl: string;
  programLevel: string;
  loanInformation?: string;
  ratings?: number;
  categoryId?: number; // Add categoryId
}

export interface UpdateCsvCourseData {
  id: string;
  title?: string;
  image?: string;
  schoolId?: string;
  scholarship?: string;
  scholarshipInformation?: string;
  duration?: number;
  durationPeriod?: DurationPeriod;
  price?: number;
  currency?: Currency;
  acceptanceFee?: number;
  acceptanceFeeCurrency?: Currency;
  objectives?: string;
  courseInformation?: string;
  courseWebsiteUrl?: string;
  programLevel?: string;
  loanInformation?: string;
  ratings?: number;
  categoryId?: number; // Add categoryId
}

export interface NewCreateCSVSchoolData {
  name: string;
  schoolType: SchoolType;
  country: string;
  region: string;
  websiteUrl: string;
  logo?: string; // This will be the image URL
}

export interface UpdateSchoolData {
  id: string;
  name?: string;
  schoolType?: SchoolType;
  country: string;
  region: string;
  websiteUrl?: string;
  logo?: string;
}

export interface newCreateSchoolData {
  name: string;
  schoolType: SchoolType;
  country: string;
  region: string;
  websiteUrl: string;
  logo?: string; // Make logo optional and accept URL or file
}

// New types for the dashboard
export interface CourseCardData {
  id: string;
  title: string;
  schoolName: string;
  country: string;
  region: string;
  price: number;
  currency: string;
  scholarship: string;
  ratings: number;
  programLevel: string;
}

export interface CourseDetailData {
  id: string;
  title: string;
  image: string | null;
  university: {
    // Changed from 'school' to 'university' to match Prisma relation
    id: string;
    name: string;
    country: string;
    region: string;
    logo: string | null;
    websiteUrl: string;
  };
  scholarship: string;
  scholarshipInformation: string | null; // Correct field name
  duration: number;
  durationPeriod: DurationPeriod;
  price: number;
  currency: Currency;
  acceptanceFee: number;
  acceptanceFeeCurrency: Currency;
  objectives: string;
  ratings: number | null; // Allow null to match Prisma model
  courseWebsiteUrl: string;
  programLevel: string;
  loanInformation: string | null;
}

export interface FilterOptions {
  scholarship?: string; // e.g., "Full Scholarship"
  country?: string;
  region?: string;
  programLevel?: string; // e.g., "Bachelor Degree"
  fieldOfStudy?: string; // Not in schema, might map to objectives or careerOpportunities
  keyword?: string; // Search keyword for title or school name
  examTypes?: string[]; // New field for filtering by exam types
  ratings?: number; // New field for filtering by minimum ratings
  page?: number;
  limit?: number;
}

export type CourseReportData = {
  id: string;
  title: string;
  image: string; // Renamed from profile to image
  schoolId: string;
  scholarship: string;
  scholarshipInformation: string | null; // Already correct
  duration: string; // Combined duration and durationPeriod
  price: number;
  currency: string;
  acceptanceFee: number;
  acceptanceFeeCurrency: string;
  objectives: string; // Renamed from description to objectives
  ratings: number;
  courseWebsiteUrl: string;
  programLevel: string;
  loanInformation: string | null; // Changed from string to string | null
  createdAt: string; // Ensure this matches the mapped value
};

// New type for updating only admission logic
export interface UpdateCourseAdmissionData {
  id: string;

  ExamCountry1?: string;
  ExamType1?: string;
  ExamType1Subjects?: string[]; // Accept array of strings
  ExamType1SubGrades?: string[]; // Accept array of strings

  ExamCountry2?: string;
  ExamType2?: string;
  ExamType2Subjects?: string[];
  ExamType2SubGrades?: string[];

  ExamCountry3?: string;
  ExamType3?: string;
  ExamType3Subjects?: string[];
  ExamType3SubGrades?: string[];

  ExamCountry4?: string;
  ExamType4?: string;
  ExamType4Subjects?: string[];
  ExamType4SubGrades?: string[];

  ExamCountry5?: string;
  ExamType5?: string;
  ExamType5Subjects?: string[];
  ExamType5SubGrades?: string[];

  ExamCountry6?: string;
  ExamType6?: string;
  ExamType6Subjects?: string[];
  ExamType6SubGrades?: string[];

  ExamCountry7?: string;
  ExamType7?: string;
  ExamType7Subjects?: string[];
  ExamType7SubGrades?: string[];

  ExamCountry8?: string;
  ExamType8?: string;
  ExamType8Subjects?: string[];
  ExamType8SubGrades?: string[];

  ExamCountry9?: string;
  ExamType9?: string;
  ExamType9Subjects?: string[];
  ExamType9SubGrades?: string[];

  ExamCountry10?: string;
  ExamType10?: string;
  ExamType10Subjects?: string[];
  ExamType10SubGrades?: string[];

  Adminrule1?: string;
  Adminrule2?: string;
  Adminrule3?: string;
  Adminrule4?: string;
  Adminrule5?: string;
}

// types/academicRecordTypes.ts
// types/academicRecordTypes.ts
export interface AcademicRecordData {
  id?: string;
  userId: string;
  ExamCountry1?: string | null;
  ExamType1?: string | null;
  ExamType1Subjects?: string | null; // Changed from string | string[] | undefined to string | null | undefined
  ExamType1SubGrades?: string | null; // Changed from string | string[] | undefined to string | null | undefined
  ExamCountry2?: string | null;
  ExamType2?: string | null;
  ExamType2Subjects?: string | null;
  ExamType2SubGrades?: string | null;
  ExamCountry3?: string | null;
  ExamType3?: string | null;
  ExamType3Subjects?: string | null;
  ExamType3SubGrades?: string | null;
  ExamCountry4?: string | null;
  ExamType4?: string | null;
  ExamType4Subjects?: string | null;
  ExamType4SubGrades?: string | null;
  ExamCountry5?: string | null;
  ExamType5?: string | null;
  ExamType5Subjects?: string | null;
  ExamType5SubGrades?: string | null;
  ExamCountry6?: string | null;
  ExamType6?: string | null;
  ExamType6Subjects?: string | null;
  ExamType6SubGrades?: string | null;
  ExamCountry7?: string | null;
  ExamType7?: string | null;
  ExamType7Subjects?: string | null;
  ExamType7SubGrades?: string | null;
  ExamCountry8?: string | null;
  ExamType8?: string | null;
  ExamType8Subjects?: string | null;
  ExamType8SubGrades?: string | null;
  ExamCountry9?: string | null;
  ExamType9?: string | null;
  ExamType9Subjects?: string | null;
  ExamType9SubGrades?: string | null;
  ExamCountry10?: string | null;
  ExamType10?: string | null;
  ExamType10Subjects?: string | null;
  ExamType10SubGrades?: string | null;
}
