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

export enum DurationPeriod {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

export enum Currency {
  NAIRA = 'NAIRA',
  DOLLAR = 'DOLLAR',
}

export interface CreateCSVCourseData {
  id?: string;
  title: string;
  profile: any; // Consider replacing 'any' with a more specific type if possible
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
  courseInformation: string;
  courseWebsiteUrl: string;
  programLevel: string;
  careerOpportunities: string[];
  loanInformation: string;
}
// interface CreateCSVCourseData {
//   profile: any;
//   id?: string;
//   title: string;
//   // logo: Express.Multer.File | null | undefined;
//   schoolId: string;
//   scholarship: string;
//   duration: number;
//   durationPeriod: DurationPeriod;
//   price: number;
//   currency: Currency;
//   acceptanceFee: number;
//   estimatedLivingCost: number;
//   acceptanceFeeCurrency: Currency;
//   description: string;
//   requirements: string[];
//   courseInformation: string; // New field
//   courseWebsiteUrl: string; // New field
//   programLevel: string; // New field
//   careerOpportunities: string[]; // New field
//   loanInformation: string; // New field
// }

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

export interface UpdateCourseData {
  id: string;
  title?: string;
  schoolId?: string;
  scholarship?: string;
  duration?: number;
  durationPeriod?: DurationPeriod;
  price?: number;
  currency?: Currency;
  acceptanceFee?: number;
  estimatedLivingCost?: number;
  acceptanceFeeCurrency?: Currency;
  description?: string;
  requirements?: string[];
  courseInformation?: string;
  courseWebsiteUrl?: string;
  programLevel?: string;
  careerOpportunities?: string[];
  loanInformation?: string;
  profile?: any;
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
  programLevel: string; // Keeping programLevel for display
}

export interface CourseDetailData {
  id: string;
  title: string;
  profile: string | null;
  school: {
    id: string;
    name: string;
    country: string;
    region: string;
    logo: string | null;
    websiteUrl: string;
  };
  scholarship: string;
  duration: number;
  durationPeriod: string;
  price: number;
  currency: string;
  acceptanceFee: number;
  acceptanceFeeCurrency: string;
  description: string;
  requirements: string[];
  ratings: number;
  courseInformation: string;
  courseWebsiteUrl: string;
  programLevel: string;
  careerOpportunities: string[];
  loanInformation: string;
  estimatedLivingCost: number;
}

export interface FilterOptions {
  scholarship?: string; // e.g., "Full Scholarship"
  country?: string;
  region?: string;
  programLevel?: string; // e.g., "IT & Computer Science"
  fieldOfStudy?: string; // Added as a query parameter (e.g., "STEM")
  keyword?: string; // Search keyword for title or school name
  page?: number;
  limit?: number;
}
