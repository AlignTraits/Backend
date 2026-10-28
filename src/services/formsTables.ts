import { db } from '../config/db';

/*
  Creates the two website-form tables if they are missing, so the forms work even when
  `prisma db push` has not been run against the live database.

  The SQL below is what Prisma itself generates for the AmbassadorApplication and PilotRequest
  models in prisma/schema.prisma (same names, types, defaults and indexes), so a later
  `prisma db push` finds nothing to change. If you edit those models, edit this SQL too.

  It runs once per server start, on the first form submission. IF NOT EXISTS makes it safe to
  run again, and it never alters or drops anything.
*/
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "ambassador_applications" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "school" TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ambassador_applications_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "ambassador_applications_createdAt_idx" ON "ambassador_applications"("createdAt")`,
  `CREATE TABLE IF NOT EXISTS "pilot_requests" (
    "id" TEXT NOT NULL,
    "institutionType" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "participants" TEXT[],
    "programmes" TEXT,
    "studentRange" TEXT NOT NULL,
    "startWhen" TEXT NOT NULL,
    "note" TEXT,
    "authorised" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pilot_requests_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "pilot_requests_createdAt_idx" ON "pilot_requests"("createdAt")`,
];

let ready: Promise<void> | null = null;

export function ensureFormsTables(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      for (const sql of STATEMENTS) {
        await db.$executeRawUnsafe(sql);
      }
    })().catch((error) => {
      // Try again on the next submission. If the tables already exist, the insert still works.
      ready = null;
      console.error('Could not prepare the website form tables:', error);
    });
  }
  return ready;
}
