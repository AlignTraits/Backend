/*
  Website forms on aligntraits.com:
  - Community > Become an ambassador
  - Institutions > Request a pilot (schools, tutorial centres and universities)

  Each submission is checked, saved, and then the team is emailed. Saving comes first: if the
  email fails, the submission is still kept and the person still sees a success message.
*/
import { z } from 'zod';
import { db } from '../config/db';
import { sendMail } from './mailServices';
import { ensureFormsTables } from './formsTables';

/* Where alert emails go. Set FORMS_ALERT_EMAIL on the server to change it
   (several addresses can be separated by commas). */
const ALERT_EMAILS = (process.env.FORMS_ALERT_EMAIL || 'support@aligntraits.com')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
  'Zamfara',
] as const;

/* ---------------- Shared field rules ---------------- */

const text = (max: number, message: string) =>
  z
    .string({ required_error: message, invalid_type_error: message })
    .transform((v) => v.replace(/\s+/g, ' ').trim())
    .pipe(z.string().min(1, message).max(max, `Please keep this under ${max} characters.`));

const optionalText = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\s+/g, ' ').trim() : ''))
    .pipe(z.string().max(max, `Please keep this under ${max} characters.`))
    .transform((v) => v || null);

/** Nigerian mobile number, stored as +234XXXXXXXXXX. Accepts 0801..., 801..., +234801... */
export function normaliseNigerianPhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('234')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^[789]\d{9}$/.test(digits) ? `+234${digits}` : null;
}

const phone = (message: string) =>
  z.unknown().transform((v, ctx) => {
    const n = normaliseNigerianPhone(v);
    if (!n) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      return z.NEVER;
    }
    return n;
  });

const state = z.enum(NIGERIAN_STATES, {
  errorMap: () => ({ message: 'Choose your state.' }),
});

/* A hidden field people never see. Bots fill it in. */
const honeypot = z.string().optional();

/* ---------------- Ambassador ---------------- */

const ambassadorSchema = z
  .object({
    fullName: text(120, 'Enter your full name.'),
    ageGroup: z.enum(['18_or_older', 'under_18'], {
      errorMap: () => ({ message: 'Tell us if you are 18 or older.' }),
    }),
    guardianName: optionalText(120),
    guardianPhone: z.unknown().optional(),
    school: text(160, 'Enter your school.'),
    classLevel: z.enum(['SS1', 'SS2', 'SS3', 'Finished'], {
      errorMap: () => ({ message: 'Choose your class.' }),
    }),
    state,
    whatsapp: phone('Enter a Nigerian WhatsApp number, for example 0801 234 5678.'),
    reason: text(300, 'Tell us why you want to be an ambassador.'),
    confirmed: z.literal(true, {
      errorMap: () => ({ message: 'Please confirm the details are true.' }),
    }),
    website: honeypot,
  })
  .transform((data, ctx) => {
    let guardianPhone: string | null = null;
    if (data.ageGroup === 'under_18') {
      if (!data.guardianName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianName'], message: 'Enter your parent or guardian’s name.' });
      }
      guardianPhone = normaliseNigerianPhone(data.guardianPhone);
      if (!guardianPhone) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianPhone'], message: 'Enter your parent or guardian’s phone number.' });
      }
    }
    return {
      ...data,
      // Only kept for students under 18, where a parent or guardian must agree.
      guardianName: data.ageGroup === 'under_18' ? data.guardianName : null,
      guardianPhone,
    };
  });

/* ---------------- Pilot ---------------- */

const INSTITUTION_TYPES = ['secondary_school', 'tutorial_centre', 'university', 'other'] as const;

const pilotSchema = z
  .object({
    institutionType: z.enum(INSTITUTION_TYPES, {
      errorMap: () => ({ message: 'Choose the type of institution.' }),
    }),
    institutionName: text(160, 'Enter the name of your institution.'),
    state,
    fullName: text(120, 'Enter your full name.'),
    role: text(80, 'Choose your role.'),
    workEmail: z
      .string({ required_error: 'Enter your work email.' })
      .trim()
      .toLowerCase()
      .email('Enter a valid email, for example name@school.edu.ng.')
      .max(160),
    whatsapp: phone('Enter a Nigerian WhatsApp number, for example 0801 234 5678.'),
    participants: z
      .array(z.string().trim().min(1).max(60))
      .max(8)
      .optional()
      .transform((v) => v ?? []),
    programmes: optionalText(300),
    studentRange: z.enum(['under_50', '50_to_200', 'over_200'], {
      errorMap: () => ({ message: 'Choose about how many students.' }),
    }),
    startWhen: z.enum(['this_term', 'next_term', 'exploring'], {
      errorMap: () => ({ message: 'Choose when you would like to start.' }),
    }),
    note: optionalText(500),
    authorised: z.literal(true, {
      errorMap: () => ({ message: 'Please confirm you can request a pilot for your institution.' }),
    }),
    source: optionalText(120),
    website: honeypot,
  })
  .superRefine((data, ctx) => {
    if (data.institutionType === 'university') {
      if (!data.programmes) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['programmes'], message: 'Tell us which programmes.' });
      }
    } else if (data.participants.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['participants'], message: 'Choose who would take part.' });
    }
  });

/* ---------------- Helpers ---------------- */

type Result =
  | { status: 201; ok: true; message: string; data: { id: string } }
  | { status: 400; ok: false; message: string; errors: Record<string, string> };

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const LABELS: Record<string, string> = {
  '18_or_older': '18 or older',
  under_18: 'Under 18',
  secondary_school: 'Secondary school',
  tutorial_centre: 'Tutorial centre',
  university: 'University',
  other: 'Other',
  under_50: 'Under 50',
  '50_to_200': '50 to 200',
  over_200: 'Over 200',
  this_term: 'This term',
  next_term: 'Next term',
  exploring: 'Just exploring',
};

const label = (v: string | null | undefined) => (v ? LABELS[v] ?? v : '');

const TITLES = new Set(['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'engr', 'chief', 'pastor', 'rev', 'alhaji', 'alhaja', 'barr', 'sir', 'hon']);

/** The name to greet someone by: "Mr Tunde Adeyemi" becomes "Tunde". */
function greetingName(fullName: string): string {
  const words = fullName.split(' ').filter(Boolean);
  return words.find((w) => !TITLES.has(w.toLowerCase().replace(/\./g, ''))) ?? words[0] ?? '';
}

async function alertTeam(subject: string, title: string, rows: [string, string | null | undefined][]) {
  try {
    for (const to of ALERT_EMAILS) {
      await sendMail({
        recipients: [to],
        subject,
        templateName: 'formSubmission',
        templateInfo: { title, rows: rows.filter(([, v]) => v) },
      });
    }
  } catch (error) {
    console.error('Form alert email failed:', error);
  }
}

/* ---------------- Public functions ---------------- */

export async function submitAmbassador(body: unknown): Promise<Result> {
  const parsed = ambassadorSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, ok: false, message: 'Please check the highlighted answers.', errors: fieldErrors(parsed.error) };
  }
  const d = parsed.data;
  // Bots fill the hidden field. Answer as if it worked, and save nothing.
  if (d.website) return { status: 201, ok: true, message: 'Thank you', data: { id: 'ok' } };

  await ensureFormsTables();
  const saved = await db.ambassadorApplication.create({
    data: {
      fullName: d.fullName,
      ageGroup: d.ageGroup,
      guardianName: d.guardianName,
      guardianPhone: d.guardianPhone,
      school: d.school,
      classLevel: d.classLevel,
      state: d.state,
      whatsapp: d.whatsapp,
      reason: d.reason,
      confirmed: d.confirmed,
    },
    select: { id: true },
  });

  await alertTeam(`New ambassador application: ${d.fullName}, ${d.school}`, 'New ambassador application', [
    ['Name', d.fullName],
    ['Age group', label(d.ageGroup)],
    ['School', d.school],
    ['Class', d.classLevel],
    ['State', d.state],
    ['WhatsApp', d.whatsapp],
    ['Parent or guardian', d.guardianName],
    ['Parent or guardian phone', d.guardianPhone],
    ['Why', d.reason],
    ['Next step', d.ageGroup === 'under_18' ? 'Call the parent or guardian for consent before anything else.' : 'Reply on WhatsApp.'],
    ['Reference', saved.id],
  ]);

  return { status: 201, ok: true, message: 'Application received', data: { id: saved.id } };
}

export async function submitPilot(body: unknown): Promise<Result> {
  const parsed = pilotSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, ok: false, message: 'Please check the highlighted answers.', errors: fieldErrors(parsed.error) };
  }
  const d = parsed.data;
  if (d.website) return { status: 201, ok: true, message: 'Thank you', data: { id: 'ok' } };

  await ensureFormsTables();
  const saved = await db.pilotRequest.create({
    data: {
      institutionType: d.institutionType,
      institutionName: d.institutionName,
      state: d.state,
      fullName: d.fullName,
      role: d.role,
      workEmail: d.workEmail,
      whatsapp: d.whatsapp,
      participants: d.institutionType === 'university' ? [] : d.participants,
      programmes: d.institutionType === 'university' ? d.programmes : null,
      studentRange: d.studentRange,
      startWhen: d.startWhen,
      note: d.note,
      authorised: d.authorised,
      source: d.source,
    },
    select: { id: true },
  });

  await alertTeam(`New pilot request: ${d.institutionName} (${label(d.institutionType)})`, 'New pilot request', [
    ['Institution', d.institutionName],
    ['Type', label(d.institutionType)],
    ['State', d.state],
    ['Name', d.fullName],
    ['Role', d.role],
    ['Work email', d.workEmail],
    ['WhatsApp', d.whatsapp],
    ['Who would take part', d.participants.join(', ')],
    ['Programmes', d.programmes],
    ['About how many students', label(d.studentRange)],
    ['Start', label(d.startWhen)],
    ['Note', d.note],
    ['Came from', d.source],
    ['Reference', saved.id],
  ]);

  // A short receipt for the person who asked. If it fails, the request is still saved.
  try {
    await sendMail({
      recipients: [d.workEmail],
      subject: 'We have your AlignTraits pilot request',
      templateName: 'pilotReceived',
      templateInfo: { name: greetingName(d.fullName), institution: d.institutionName },
    });
  } catch (error) {
    console.error('Pilot receipt email failed:', error);
  }

  return { status: 201, ok: true, message: 'Pilot request received', data: { id: saved.id } };
}
