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
  loanInformation: string;
  ratings?: number; // Optional as per model
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
  loanInformation: string;
  ratings?: number;
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
  loanInformation: string;
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
  scholarshipInformation: string | null; // Added
  duration: string; // Combined duration and durationPeriod
  price: number;
  currency: string;
  acceptanceFee: number;
  acceptanceFeeCurrency: string;
  objectives: string; // Renamed from description to objectives
  ratings: number;
  courseWebsiteUrl: string;
  programLevel: string;
  loanInformation: string;
  createdAt: string; // Ensure this matches the mapped value
};
