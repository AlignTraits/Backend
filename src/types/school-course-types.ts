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
  location: string;
  websiteUrl: string;
  logo?: string; // This will be the image URL
}

export interface UpdateSchoolData {
  id: string;
  name?: string;
  schoolType?: SchoolType;
  location?: string;
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
  location: string;
  websiteUrl: string;
  logo?: string; // Make logo optional and accept URL or file
}

// interface UpdateSchoolData {
//     id: string;
//     name?: string;
//     schoolType?: SchoolType;
//     location?: string;
//     websiteUrl?: string;
//     logo?: string;
//   }

// interface UpdateCourseData {
//     id: string;
//     title?: string;
//     schoolId?: string;
//     scholarship?: string;
//     duration?: number;
//     durationPeriod?: DurationPeriod;
//     price?: number;
//     currency?: Currency;
//     acceptanceFee?: number;
//     estimatedLivingCost?: number;
//     acceptanceFeeCurrency?: Currency;
//     description?: string;
//     requirements?: string[];
//     courseInformation?: string;
//     courseWebsiteUrl?: string;
//     programLevel?: string;
//     careerOpportunities?: string[];
//     loanInformation?: string;
//     profile?: any;
//   }
