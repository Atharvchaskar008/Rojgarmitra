import { SupportedLocale } from '@rojgarmitra/shared';
import { ZodError } from 'zod';

export interface LocalizedValidationError {
  field: string;
  message: string;
}

const ERROR_TRANSLATIONS: Record<
  SupportedLocale,
  Record<string, Record<string, string>>
> = {
  mr: {
    preferredName: {
      too_small: 'कृपया किमान २ अक्षरांचे नाव प्रविष्ट करा',
      invalid_type: 'नाव योग्य स्वरूपात नाही',
    },
    district: {
      too_small: 'कृपया जिल्हा निवडा किंवा प्रविष्ट करा',
    },
    skillIds: {
      too_small: 'कृपया किमान एक काम किंवा कौशल्य निवडा',
    },
    phone: {
      invalid_string: 'कृपया १० अंकी वैध भारतीय मोबाईल नंबर प्रविष्ट करा',
    },
    pincode: {
      invalid_string: 'पिनकोड बरोबर ६ अंकांचा असावा',
    },
    businessName: {
      too_small: 'कृपया व्यवसायाचे किंवा कंपनीचे नाव प्रविष्ट करा',
    },
    contactName: {
      too_small: 'कृपया संपर्क व्यक्तीचे नाव प्रविष्ट करा',
    },
  },
  hi: {
    preferredName: {
      too_small: 'कृपया कम से कम २ अक्षरों का नाम दर्ज करें',
      invalid_type: 'नाम का प्रारूप सही नहीं है',
    },
    district: {
      too_small: 'कृपया जिला चुनें या दर्ज करें',
    },
    skillIds: {
      too_small: 'कृपया कम से कम एक कौशल या काम चुनें',
    },
    phone: {
      invalid_string: 'कृपया १० अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें',
    },
    pincode: {
      invalid_string: 'पिन कोड ठीक ६ अंकों का होना चाहिए',
    },
    businessName: {
      too_small: 'कृपया कंपनी या व्यवसाय का नाम दर्ज करें',
    },
    contactName: {
      too_small: 'कृपया संपर्क व्यक्ति का नाम दर्ज करें',
    },
  },
  en: {
    preferredName: {
      too_small: 'Please enter a name with at least 2 characters',
      invalid_type: 'Invalid name format',
    },
    district: {
      too_small: 'Please enter or select a district',
    },
    skillIds: {
      too_small: 'Please select at least one skill',
    },
    phone: {
      invalid_string: 'Please enter a valid 10-digit Indian mobile number',
    },
    pincode: {
      invalid_string: 'Pincode must be exactly 6 digits',
    },
    businessName: {
      too_small: 'Please enter business or company name',
    },
    contactName: {
      too_small: 'Please enter contact person name',
    },
  },
};

export function formatZodErrors(
  error: ZodError,
  locale: SupportedLocale = 'mr'
): LocalizedValidationError[] {
  return error.errors.map((issue) => {
    const field = issue.path.join('.');
    const issueCode = issue.code;
    const trans = ERROR_TRANSLATIONS[locale]?.[field]?.[issueCode];

    return {
      field,
      message: trans || issue.message,
    };
  });
}
