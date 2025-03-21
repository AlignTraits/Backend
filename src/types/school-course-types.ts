import { DurationPeriod, Currency, ExamType, Grade } from '@prisma/client';

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
  logo: Express.Multer.File | null | undefined;
  schoolId: string;
  scholarship: string;
  scholarshipRequirement?: string;
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
  careerOpportunities: string[];
  loanInformation: string;
  examTypes: string[];
  examYear?: number;
  subjects: string[];
  grades: string[];
  ratings?: number;
}

// Type for updating a course (all fields optional)
export interface UpdateCourseData {
  id: string;
  title?: string;
  logo?: Express.Multer.File | null | undefined;
  schoolId?: string;
  scholarship?: string;
  scholarshipRequirement?: string;
  duration?: number;
  durationPeriod?: DurationPeriod;
  price?: number;
  currency?: Currency;
  acceptanceFee?: number;
  acceptanceFeeCurrency?: Currency;
  objectives?: string;
  requirements?: string[];
  courseInformation?: string;
  courseWebsiteUrl?: string;
  programLevel?: string;
  careerOpportunities?: string[];
  loanInformation?: string;
  examTypes?: string[];
  examYear?: number;
  subjects?: string[];
  grades?: string[];
  ratings?: number;
}
export interface CreateCSVCourseData {
  title: string;
  image: string; // Renamed from profile to image
  schoolId: string;
  scholarship: string;
  scholarshipRequirement?: string;
  duration: number;
  durationPeriod: 'YEAR' | 'MONTH' | 'WEEK';
  price: number;
  currency: 'NAIRA' | 'DOLLAR' | 'EURO';
  acceptanceFee: number;
  acceptanceFeeCurrency: 'NAIRA' | 'DOLLAR' | 'EURO';
  objectives: string;
  requirements: string[];
  courseInformation: string;
  courseWebsiteUrl: string;
  programLevel: string;
  careerOpportunities: string[];
  loanInformation: string;
  examTypes: ExamType[];
  examYear?: number;
  subjects: string[];
  grades: Grade[];
  ratings?: number;
}

export interface UpdateCsvCourseData {
  id: string;
  title?: string;
  image?: string;
  schoolId?: string;
  scholarship?: string;
  scholarshipRequirement?: string;
  duration?: number;
  durationPeriod?: 'YEAR' | 'MONTH' | 'WEEK';
  price?: number;
  currency?: 'NAIRA' | 'DOLLAR' | 'EURO';
  acceptanceFee?: number;
  acceptanceFeeCurrency?: 'NAIRA' | 'DOLLAR' | 'EURO';
  objectives?: string;
  requirements?: string[];
  courseInformation?: string;
  courseWebsiteUrl?: string;
  programLevel?: string;
  careerOpportunities?: string[];
  loanInformation?: string;
  examTypes?: string[];
  examYear?: number;
  subjects?: string[];
  grades?: string[];
  ratings?: number;
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
  image: string | null; // Renamed from profile
  school: {
    id: string;
    name: string;
    country: string;
    region: string;
    logo: string | null;
    websiteUrl: string;
  };
  scholarship: string;
  scholarshipRequirement: string | null; // Added
  duration: number;
  durationPeriod: DurationPeriod;
  price: number;
  currency: Currency;
  acceptanceFee: number;
  acceptanceFeeCurrency: Currency;
  objectives: string; // Renamed from description
  requirements: string[];
  ratings: number;
  courseInformation: string;
  courseWebsiteUrl: string;
  programLevel: string;
  careerOpportunities: string[];
  loanInformation: string;
  examTypes: ExamType[]; // Added
  examYear: number | null; // Added
  subjects: string[]; // Added
  grades: Grade[]; // Added
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
  scholarshipRequirement: string | null; // Added
  duration: string; // Combined duration and durationPeriod
  price: number;
  currency: string;
  acceptanceFee: number;
  acceptanceFeeCurrency: string;
  objectives: string; // Renamed from description to objectives
  requirements: string; // Joined array
  ratings: number;
  courseInformation: string;
  courseWebsiteUrl: string;
  programLevel: string;
  careerOpportunities: string; // Joined array
  loanInformation: string;
  examTypes: string; // Joined array, added
  examYear: number | null; // Added
  subjects: string; // Joined array, added
  grades: string; // Joined array, added
  createdAt: Date;
};
