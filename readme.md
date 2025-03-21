# LearnConnect Backend

<!-- New Course Model -->

model Course {
id String @id @default(dbgenerated("substring(gen_random_uuid()::text, 1, 10)"))
title String // Course Title
image String? // Course Image
schoolId String // Program Location (via relation to School)
university School @relation(fields: [schoolId], references: [id])
scholarship String // Scholarship
scholarshipRequirement String? // Scholarship Requirement
duration Int // Program Duration (e.g., 4)
durationPeriod DurationPeriod // Program Duration (e.g., YEARS)
programLevel String // Program Level (Bachelor Degree, Masters Degree, PGD)
price Float // Course Price
currency Currency // Currency for Course Price
acceptanceFee Float // Acceptance Fee
acceptanceFeeCurrency Currency // Currency for Acceptance Fee
objectives String // Course Objectives
courseInformation String // Course Information
courseWebsiteUrl String // Course website url
loanInformation String // Loan Information
careerOpportunities String[] // Additional info
requirements String[] // Admission Requirements (general)
examTypes ExamType[] // Exam Type
examYear Int? // Exam Year
subjects String[] // Subjects
grades Grade[] // Grade
ratings Float @default(0.0) // Reintroduced ratings field
createdAt DateTime @default(now())
updatedAt DateTime @default(now()) @updatedAt
}

<!-- New Course Model -->

"postinstall": "npx prisma generate && npx prisma db push --schema prisma/schema.prisma --accept-data-loss",

<!--  -->

This is the LearnConnect Backend.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

1. `EMAIL_PASS`

   - Description: The password for the email account used for sending emails.

2. `EMAIL_USER`

   - Description: The username (or email address) of the email account used for sending emails.

3. `JWT_SECRET`

   - Description: A secret string used for JWT token encryption. You can generate a secure string on your Linux machine using the command `openssl rand -base64 32`.

4. `DATABASE_URL`
   - Description: A connection URL to a Postgres database.
   - Example: `postgresql://user:password@localhost:5432/mydatabase`

## Usage

Instructions on how to use the project is posted on the documentation on the active [backend link](#)

## Installation

Step-by-step instructions on how to install the project.

```bash
# Install dependencies
npm install

# Run the project
npx prisma db push && npm start
```
