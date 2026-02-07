/**
 * Albania → Netherlands Work Visa Requirements
 * 
 * Comprehensive guide for Albanian citizens seeking work sponsorship in the Netherlands.
 * Last updated: February 2026
 * 
 * Sources:
 * - IND (Immigration and Naturalisation Service): https://ind.nl/en
 * - Netherlands Worldwide: https://www.netherlandsworldwide.nl
 * - Dutch Embassy Albania: https://www.netherlandsandyou.nl/web/albania
 */

export interface VisaStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  responsible: 'applicant' | 'employer' | 'ind' | 'embassy';
  tips?: string[];
}

export interface RequiredDocument {
  name: string;
  description: string;
  source?: string;
  legalizationRequired: boolean;
  notes?: string;
}

export interface VisaFee {
  type: string;
  amount: number;
  currency: 'EUR';
  notes?: string;
}

export interface SalaryRequirement {
  category: string;
  monthlyGross: number;
  notes?: string;
}

export interface Pitfall {
  title: string;
  description: string;
  prevention: string;
}

export interface VisaGuide {
  nationality: string;
  destinationCountry: string;
  visaType: string;
  mvvRequired: boolean;
  lastUpdated: string;
  overview: string;
  totalProcessingTime: string;
  steps: VisaStep[];
  requiredDocuments: {
    applicant: RequiredDocument[];
    employer: RequiredDocument[];
  };
  fees: VisaFee[];
  salaryRequirements: SalaryRequirement[];
  processingTimes: {
    step: string;
    duration: string;
    notes?: string;
  }[];
  pitfalls: Pitfall[];
  usefulLinks: {
    title: string;
    url: string;
    description: string;
  }[];
  embassy: {
    name: string;
    city: string;
    country: string;
    website: string;
    notes: string;
  };
}

export const albaniaToNetherlandsVisa: VisaGuide = {
  nationality: 'Albanian',
  destinationCountry: 'Netherlands',
  visaType: 'Highly Skilled Migrant (Kennismigrant)',
  mvvRequired: true,
  lastUpdated: '2026-02-07',
  
  overview: `Albanian citizens require an MVV (Machtiging tot Voorlopig Verblijf - Provisional Residence Permit) 
to work in the Netherlands for more than 90 days. The most common route for skilled professionals is the 
Highly Skilled Migrant scheme, which requires sponsorship by a recognized employer. Albania is NOT on the 
MVV-exempt list, so the full TEV procedure (combined MVV + residence permit application) is required.`,

  totalProcessingTime: '6-12 weeks (from employer application to MVV collection)',

  steps: [
    {
      step: 1,
      title: 'Employer Recognition as Sponsor',
      description: `Before hiring foreign workers, the Dutch employer must be recognized as a sponsor by the IND. 
This is mandatory for highly skilled migrants. The employer applies via the IND Business Portal.`,
      duration: '4-6 weeks (one-time process)',
      responsible: 'employer',
      tips: [
        'Employer should start this process before making job offers to non-EU candidates',
        'Recognition is valid indefinitely but subject to ongoing compliance',
        'Check if employer is already recognized: https://ind.nl/en/public-register-recognised-sponsors'
      ]
    },
    {
      step: 2,
      title: 'Job Offer & Employment Contract',
      description: `Employer provides a job offer meeting the salary requirements for highly skilled migrants. 
The contract must be for a position that requires the specific skills of the applicant.`,
      duration: '1-2 weeks',
      responsible: 'employer',
      tips: [
        'Salary must meet the minimum threshold based on age',
        'Contract should specify start date, duration, and gross monthly salary',
        'Holiday allowance (8%) may be included in salary calculation'
      ]
    },
    {
      step: 3,
      title: 'TEV Application by Employer',
      description: `The recognized sponsor submits the TEV application (combined MVV and residence permit) 
through the IND Business Portal. This is done on behalf of the employee.`,
      duration: '1 day to submit',
      responsible: 'employer',
      tips: [
        'Employer needs copies of applicant documents',
        'Application fee must be paid at submission',
        'Online application via Business Portal is fastest'
      ]
    },
    {
      step: 4,
      title: 'IND Processing',
      description: `The IND processes the application. For recognized sponsors applying for highly skilled 
migrants, the accelerated procedure applies with shorter processing times.`,
      duration: '2-4 weeks',
      responsible: 'ind',
      tips: [
        'Recognized sponsors benefit from faster processing',
        'IND may request additional documents',
        'Track status via My IND portal'
      ]
    },
    {
      step: 5,
      title: 'MVV Approval Notification',
      description: `Upon approval, the IND notifies both the employer and the Dutch embassy in Tirana. 
The applicant receives instructions to collect the MVV.`,
      duration: '1-2 weeks',
      responsible: 'ind',
      tips: [
        'Approval letter will be sent to employer',
        'Embassy will contact applicant for appointment'
      ]
    },
    {
      step: 6,
      title: 'MVV Collection at Embassy',
      description: `The applicant visits the Dutch Embassy in Tirana to have the MVV sticker placed in 
their passport. Biometrics may be collected at this time.`,
      duration: '1-2 weeks (appointment + processing)',
      responsible: 'applicant',
      tips: [
        'Bring original passport with sufficient validity',
        'MVV is valid for 90 days - plan travel accordingly',
        'Schedule appointment early as slots fill up'
      ]
    },
    {
      step: 7,
      title: 'Travel to Netherlands',
      description: `Travel to the Netherlands within the MVV validity period (90 days). 
The MVV allows multiple entries during this period.`,
      duration: 'Within 90 days of MVV issuance',
      responsible: 'applicant',
      tips: [
        'Carry all original documents when traveling',
        'MVV is a multiple-entry visa',
        'Book travel well within the 90-day window'
      ]
    },
    {
      step: 8,
      title: 'Registration & Residence Permit Collection',
      description: `After arrival, register with the municipality (gemeente) and collect the residence 
permit (verblijfsvergunning) at the IND desk. Biometrics will be collected if not done at embassy.`,
      duration: '1-3 weeks after arrival',
      responsible: 'applicant',
      tips: [
        'Register at gemeente within 5 days of arrival',
        'Schedule IND appointment for residence permit collection',
        'Get BSN (citizen service number) at gemeente registration'
      ]
    }
  ],

  requiredDocuments: {
    applicant: [
      {
        name: 'Valid Passport',
        description: 'Must be valid for at least 6 months beyond intended stay',
        legalizationRequired: false,
        notes: 'Should have at least 2 blank pages for visa stickers'
      },
      {
        name: 'Passport Photos',
        description: 'Recent passport-size photos meeting Dutch/Schengen requirements',
        legalizationRequired: false,
        notes: '35x45mm, white background, neutral expression'
      },
      {
        name: 'Curriculum Vitae (CV)',
        description: 'Detailed CV showing education, work experience, and skills',
        legalizationRequired: false,
        notes: 'Should demonstrate qualifications for the position'
      },
      {
        name: 'Educational Certificates',
        description: 'Degree certificates, diplomas, and transcripts',
        legalizationRequired: true,
        notes: 'Must be apostilled by Albanian Ministry of Foreign Affairs',
        source: 'Albanian universities/educational institutions'
      },
      {
        name: 'Birth Certificate',
        description: 'Official birth certificate from civil registry',
        legalizationRequired: true,
        notes: 'Apostille required for use in Netherlands',
        source: 'Albanian Civil Registry Office'
      },
      {
        name: 'TB Test Certificate',
        description: 'Tuberculosis test result (if required)',
        legalizationRequired: false,
        notes: 'Albania is currently on the list of countries requiring TB testing'
      },
      {
        name: 'Criminal Record Certificate',
        description: 'Police clearance certificate (may be required)',
        legalizationRequired: true,
        notes: 'From Albanian State Police, must be recent (usually <3 months)',
        source: 'Albanian State Police'
      }
    ],
    employer: [
      {
        name: 'Sponsor Recognition Proof',
        description: 'Confirmation of IND recognition as sponsor',
        legalizationRequired: false,
        source: 'IND Business Portal'
      },
      {
        name: 'Employment Contract',
        description: 'Signed employment contract or binding offer',
        legalizationRequired: false,
        notes: 'Must show salary meeting highly skilled migrant threshold'
      },
      {
        name: 'Antecedents Certificate',
        description: 'Declaration regarding reliability of sponsor',
        legalizationRequired: false,
        source: 'IND Form 7626 or Business Portal'
      },
      {
        name: 'Job Description',
        description: 'Detailed description of the position and required qualifications',
        legalizationRequired: false
      }
    ]
  },

  fees: [
    {
      type: 'TEV Application (Highly Skilled Migrant)',
      amount: 350,
      currency: 'EUR',
      notes: '2026 rates, increased by 4.4% from 2025. Paid by employer or applicant as agreed.'
    },
    {
      type: 'Sponsor Recognition Application',
      amount: 4584,
      currency: 'EUR',
      notes: 'One-time fee for employer, valid indefinitely'
    },
    {
      type: 'Residence Permit Extension',
      amount: 192,
      currency: 'EUR',
      notes: 'For renewals after initial permit expires'
    }
  ],

  salaryRequirements: [
    {
      category: 'Highly Skilled Migrant (under 30 years)',
      monthlyGross: 4357,
      notes: 'Gross monthly salary without holiday allowance, valid for 2026'
    },
    {
      category: 'Highly Skilled Migrant (30 years and older)',
      monthlyGross: 5942,
      notes: 'Gross monthly salary without holiday allowance, valid for 2026'
    },
    {
      category: 'Reduced Criterion (recent graduates)',
      monthlyGross: 3122,
      notes: 'For those with orientation year permit or meeting requirements, within 3 years of graduation'
    },
    {
      category: 'European Blue Card',
      monthlyGross: 5942,
      notes: 'Alternative to highly skilled migrant for highly educated workers'
    },
    {
      category: 'European Blue Card (reduced)',
      monthlyGross: 4754,
      notes: 'For recent graduates within 3 years of graduation'
    }
  ],

  processingTimes: [
    {
      step: 'Sponsor Recognition',
      duration: '4-6 weeks',
      notes: 'One-time process for employer'
    },
    {
      step: 'TEV Application (Recognized Sponsor)',
      duration: '2-4 weeks',
      notes: 'Accelerated procedure for recognized sponsors'
    },
    {
      step: 'TEV Application (Standard)',
      duration: '90 days maximum',
      notes: 'Statutory maximum, rarely reached for work permits'
    },
    {
      step: 'MVV Collection at Embassy',
      duration: '1-2 weeks',
      notes: 'Depends on embassy appointment availability'
    },
    {
      step: 'Residence Permit Collection (after arrival)',
      duration: '1-3 weeks',
      notes: 'After IND appointment and biometrics'
    }
  ],

  pitfalls: [
    {
      title: 'Employer Not Recognized as Sponsor',
      description: 'If the employer is not a recognized IND sponsor, they cannot apply for highly skilled migrant permits.',
      prevention: 'Verify employer recognition before accepting job offer: https://ind.nl/en/public-register-recognised-sponsors'
    },
    {
      title: 'Salary Below Threshold',
      description: 'Salary not meeting the minimum requirements will result in application rejection.',
      prevention: 'Confirm gross monthly salary meets €4,357 (under 30) or €5,942 (30+) before signing contract'
    },
    {
      title: 'Documents Not Apostilled',
      description: 'Albanian educational and civil documents require apostille for use in Netherlands.',
      prevention: 'Get apostille from Albanian Ministry of Foreign Affairs before application submission'
    },
    {
      title: 'MVV Expiry Before Travel',
      description: 'The MVV is valid for only 90 days. If not used, the process must restart.',
      prevention: 'Plan travel immediately after MVV collection, book refundable tickets until MVV is confirmed'
    },
    {
      title: 'Missing TB Test',
      description: 'Albania requires TB testing; arriving without the certificate can cause delays.',
      prevention: 'Get TB test from an approved facility before or immediately after MVV collection'
    },
    {
      title: 'Late Municipality Registration',
      description: 'Failing to register within 5 days of arrival can cause complications.',
      prevention: 'Book gemeente appointment before traveling if possible, or immediately upon arrival'
    },
    {
      title: 'Incorrect Salary Type in Contract',
      description: 'Salary must be "SV-loon" (social security wage). Other bonuses may not count.',
      prevention: 'Ensure contract clearly states gross monthly SV salary excluding variable elements'
    },
    {
      title: 'Changing Employers',
      description: 'Changing jobs requires a new permit application by the new employer.',
      prevention: 'New employer must also be recognized sponsor and file new TEV application'
    }
  ],

  usefulLinks: [
    {
      title: 'IND - Highly Skilled Migrant',
      url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
      description: 'Official IND page for highly skilled migrant residence permit'
    },
    {
      title: 'IND - Provisional Residence Permit (MVV)',
      url: 'https://ind.nl/en/provisional-residence-permit-mvv',
      description: 'Information about MVV requirements and exemptions'
    },
    {
      title: 'IND - Recognized Sponsors Register',
      url: 'https://ind.nl/en/public-register-recognised-sponsors',
      description: 'Public list of employers recognized as sponsors'
    },
    {
      title: 'IND - Fees and Costs',
      url: 'https://ind.nl/en/fees-costs-of-an-application',
      description: 'Current application fees and payment information'
    },
    {
      title: 'IND - Salary Requirements 2026',
      url: 'https://ind.nl/en/required-amounts-income-requirements',
      description: 'Current minimum salary thresholds for various permit types'
    },
    {
      title: 'IND - Application Forms',
      url: 'https://ind.nl/en/search-form',
      description: 'Download forms for various applications'
    },
    {
      title: 'Netherlands Embassy Albania',
      url: 'https://www.netherlandsandyou.nl/web/albania',
      description: 'Dutch embassy in Tirana, Albania - for MVV collection'
    },
    {
      title: 'Netherlands Worldwide - Legalisation',
      url: 'https://www.netherlandsworldwide.nl/legalisation',
      description: 'Information about document apostille and legalisation'
    },
    {
      title: 'MVV Exemptions',
      url: 'https://ind.nl/en/mvv-exemptions',
      description: 'List of situations and nationalities exempt from MVV requirement'
    }
  ],

  embassy: {
    name: 'Embassy of the Kingdom of the Netherlands in Albania',
    city: 'Tirana',
    country: 'Albania',
    website: 'https://www.netherlandsandyou.nl/web/albania',
    notes: `The Dutch Embassy in Tirana handles MVV collection for Albanian citizens. 
Appointments must be scheduled in advance. Bring original passport and all required documents. 
For visa inquiries, check netherlandsworldwide.nl for consular services.`
  }
};

// Helper function to calculate total estimated timeline
export function getEstimatedTimeline(hasRecognizedSponsor: boolean): string {
  if (hasRecognizedSponsor) {
    return '6-8 weeks from TEV application to MVV collection';
  }
  return '10-14 weeks including sponsor recognition process';
}

// Helper function to check salary eligibility
export function checkSalaryEligibility(age: number, monthlySalary: number, isRecentGraduate: boolean): {
  eligible: boolean;
  minimumRequired: number;
  category: string;
} {
  let minimumRequired: number;
  let category: string;

  if (isRecentGraduate) {
    minimumRequired = 3122;
    category = 'Reduced Criterion (recent graduates)';
  } else if (age < 30) {
    minimumRequired = 4357;
    category = 'Highly Skilled Migrant (under 30)';
  } else {
    minimumRequired = 5942;
    category = 'Highly Skilled Migrant (30+)';
  }

  return {
    eligible: monthlySalary >= minimumRequired,
    minimumRequired,
    category
  };
}

// Export default for convenience
export default albaniaToNetherlandsVisa;
