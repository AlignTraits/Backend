import crypto from 'crypto';

export const generateOTP = (length: number = 6): string => {
  const buffer = crypto.randomBytes(length);
  const otp = buffer.toString('hex').slice(0, length);
  return otp;
};

export const parseDate = (dateString: string): string => {
  const formats: RegExp[] = [
    /^\d{4}-\d{2}-\d{2}$/, // yyyy-mm-dd
    /^\d{2}\/\d{2}\/\d{4}$/, // dd/mm/yyyy
    /^\d{2}-\d{2}-\d{4}$/, // dd-mm-yyyy
    /^\d{4}\/\d{2}\/\d{2}$/, // yyyy/mm/dd
    /^\d{2}\.\d{2}\.\d{4}$/, // dd.mm.yyyy
  ];

  const regexPatterns: RegExp[] = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // yyyy-mm-dd
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // dd/mm/yyyy
    /^(\d{2})-(\d{2})-(\d{4})$/, // dd-mm-yyyy
    /^(\d{4})\/(\d{2})\/(\d{2})$/, // yyyy/mm/dd
    /^(\d{2})\.(\d{2})\.(\d{4})$/, // dd.mm.yyyy
  ];

  for (let i = 0; i < formats.length; i++) {
    if (formats[i].test(dateString)) {
      const match: RegExpMatchArray | null = dateString.match(regexPatterns[i]);
      if (match) {
        const year: string = match[1];
        const month: string = match[2];
        const day: string = match[3];

        return new Date(`${year}-${month}-${day}`).toISOString();
      } else {
        throw new Error('Invalid date format');
      }
    }
  }

  throw new Error('Invalid date format');
};
