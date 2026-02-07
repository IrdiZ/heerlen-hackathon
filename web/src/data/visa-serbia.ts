/**
 * Serbia → Netherlands Visa Requirements for Work Sponsorship
 * 
 * This file contains comprehensive visa requirements for Serbian citizens
 * seeking work sponsorship (Highly Skilled Migrant / Kennismigrant) in the Netherlands.
 * 
 * Last updated: February 2026
 * Sources: IND.nl, Netherlands Worldwide, Serbian Ministry of Foreign Affairs
 */

// ============================================================================
// Types
// ============================================================================

export interface VisaStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  responsible: 'employer' | 'employee' | 'both' | 'government';
  documents?: string[];
  notes?: string[];
}

export interface RequiredDocument {
  name: string;
  description: string;
  obtainedFrom: string;
  requiresApostille: boolean;
  requiresTranslation: boolean;
  validityPeriod?: string;
  sourceUrl?: string;
  notes?: string[];
}

export interface SalaryThreshold {
  category: string;
  monthlyGross: number;
  annualGross: number;
  notes?: string;
}

export interface Fee {
  description: string;
  amount: number;
  currency: string;
  paidBy: 'employer' | 'employee' | 'either';
  sourceUrl?: string;
}

export interface ProcessingTime {
  stage: string;
  typical: string;
  maximum: string;
  notes?: string;
}

export interface Pitfall {
  title: string;
  description: string;
  prevention: string;
  severity: 'low' | 'medium' | 'high';
}

export interface VisaRequirements {
  country: string;
  countryCode: string;
  visaType: string;
  requiresMVV: boolean;
  requiresTBTest: boolean;
  apostilleConvention: boolean;
  lastUpdated: string;
  steps: VisaStep[];
  requiredDocuments: RequiredDocument[];
  salaryThresholds: SalaryThreshold[];
  fees: Fee[];
  processingTimes: ProcessingTime[];
  pitfalls: Pitfall[];
  usefulLinks: { title: string; url: string; description: string }[];
  embassyInfo: {
    name: string;
    address: string;
    city: string;
    country: string;
    email: string;
    appointmentUrl: string;
    openingHours: string[];
  };
}

// ============================================================================
// Data
// ============================================================================

export const serbiaVisaRequirements: VisaRequirements = {
  country: 'Serbia',
  countryCode: 'RS',
  visaType: 'Highly Skilled Migrant (Kennismigrant)',
  requiresMVV: true, // Serbian citizens need MVV (provisional residence permit)
  requiresTBTest: true, // Serbia is not on the TB-exempt list
  apostilleConvention: true, // Serbia is party to Hague Apostille Convention
  lastUpdated: '2026-02-07',

  // ============================================================================
  // Step-by-Step Process
  // ============================================================================
  steps: [
    {
      step: 1,
      title: 'Find Recognized Sponsor Employer',
      description: 'Your Dutch employer must be a recognized sponsor (erkend referent) with the IND. Only recognized sponsors can apply for highly skilled migrant permits.',
      duration: 'N/A (employer prerequisite)',
      responsible: 'employer',
      documents: [],
      notes: [
        'Check if employer is recognized: https://ind.nl/en/public-register-recognised-sponsors',
        'If not recognized, employer must apply first (4-8 weeks, €5,080 fee)',
        'Recognition is mandatory for highly skilled migrant applications',
      ],
    },
    {
      step: 2,
      title: 'Employer Submits TEV Application',
      description: 'The employer submits a combined application (TEV procedure) for both the MVV (entry visa) and residence permit via the IND Business Portal.',
      duration: '1-2 days to prepare',
      responsible: 'employer',
      documents: [
        'Completed application form',
        'Copy of valid passport',
        'Employment contract meeting salary requirements',
        'Appendix Antecedents Certificate (form 7644)',
        'Declaration of intent to undergo TB test (form 7603)',
      ],
      notes: [
        'Application submitted via IND Business Portal',
        'Employee must sign antecedents certificate',
        'Employment contract must specify exact gross monthly salary',
      ],
    },
    {
      step: 3,
      title: 'IND Processing',
      description: 'The IND reviews the application and makes a decision. For recognized sponsors, this is typically fast.',
      duration: '2-4 weeks (typical), up to 90 days (maximum)',
      responsible: 'government',
      documents: [],
      notes: [
        'IND may request additional documents',
        'Check status via My IND portal',
        'Employer receives decision notification',
      ],
    },
    {
      step: 4,
      title: 'Collect MVV at Embassy Belgrade',
      description: 'Once approved, you collect your MVV (provisional residence permit) sticker at the Dutch Embassy in Belgrade.',
      duration: '1-2 weeks after approval',
      responsible: 'employee',
      documents: [
        'Valid passport',
        'Appointment confirmation',
        'IND approval letter (optional but helpful)',
      ],
      notes: [
        'Make appointment via bel-ca@minbuza.nl',
        'Embassy open Wed-Thu only, 9:00-11:30',
        'MVV is valid for 90 days - you must travel within this period',
      ],
    },
    {
      step: 5,
      title: 'Travel to Netherlands',
      description: 'Enter the Netherlands using your MVV sticker within its validity period.',
      duration: 'Within 90 days of MVV issuance',
      responsible: 'employee',
      documents: [
        'Passport with MVV sticker',
        'Employment contract',
        'Proof of accommodation (recommended)',
      ],
      notes: [
        'Keep all documents accessible at border',
        'MVV serves as entry visa',
      ],
    },
    {
      step: 6,
      title: 'Register at Municipality (Gemeente)',
      description: 'Register at your local municipality within 5 days of arrival to get your BSN (citizen service number).',
      duration: '1-2 weeks for appointment',
      responsible: 'employee',
      documents: [
        'Passport with MVV',
        'Birth certificate (apostilled + translated)',
        'Rental contract or proof of address',
        'Employment contract',
      ],
      notes: [
        'BSN required for work, banking, healthcare',
        'Some municipalities have long wait times - book early',
        'Bring original documents + copies',
      ],
    },
    {
      step: 7,
      title: 'Undergo TB Test',
      description: 'Take tuberculosis test at local GGD (Municipal Health Service) within 3 months of receiving residence permit.',
      duration: '1-2 weeks to schedule',
      responsible: 'employee',
      documents: [
        'TB referral form from IND',
        'Passport or ID',
        'Debit card for payment (€62.50-116)',
      ],
      notes: [
        'Mandatory for Serbian citizens',
        'Results sent directly to IND',
        'Failure to complete may affect residence permit',
      ],
    },
    {
      step: 8,
      title: 'Collect Residence Permit Card',
      description: 'Collect your residence permit card (verblijfsvergunning) at the IND desk.',
      duration: '2-4 weeks after arrival',
      responsible: 'employee',
      documents: [
        'Passport',
        'Appointment confirmation',
      ],
      notes: [
        'Biometrics taken at this appointment',
        'Card valid for duration of employment (max 5 years)',
        'Bring passport photo meeting Dutch requirements',
      ],
    },
  ],

  // ============================================================================
  // Required Documents
  // ============================================================================
  requiredDocuments: [
    {
      name: 'Valid Passport',
      description: 'Must be valid for at least 6 months beyond intended stay',
      obtainedFrom: 'Serbian Ministry of Interior (MUP)',
      requiresApostille: false,
      requiresTranslation: false,
      validityPeriod: 'Check passport expiry',
      notes: ['Must have at least 2 blank pages for visa stickers'],
    },
    {
      name: 'Birth Certificate',
      description: 'Required for municipality registration (BSN)',
      obtainedFrom: 'Serbian Registry Office (Matičar)',
      requiresApostille: true,
      requiresTranslation: true,
      validityPeriod: 'Generally 6 months',
      sourceUrl: 'https://www.mfa.gov.rs/en/citizens/services/document-certification',
      notes: [
        'Get international format (multilingual) if available',
        'Apostille from Serbian court (Osnovni sud)',
        'Translation by sworn translator (beëdigd vertaler) in NL or certified translator in Serbia',
      ],
    },
    {
      name: 'Employment Contract',
      description: 'Signed contract meeting HSM salary requirements',
      obtainedFrom: 'Dutch employer',
      requiresApostille: false,
      requiresTranslation: false,
      notes: [
        'Must specify exact gross monthly salary',
        'Must be with recognized IND sponsor',
        'Include job title and start date',
      ],
    },
    {
      name: 'Antecedents Certificate',
      description: 'Declaration about criminal history (IND form 7644)',
      obtainedFrom: 'Signed by applicant, form from IND',
      requiresApostille: false,
      requiresTranslation: false,
      sourceUrl: 'https://ind.nl/en/forms/7644.pdf',
      notes: [
        'Must be completed honestly',
        'Required for everyone over 12 years old',
        'False statements can lead to permit revocation',
      ],
    },
    {
      name: 'TB Test Declaration',
      description: 'Declaration of intent to undergo tuberculosis test (form 7603)',
      obtainedFrom: 'Signed by applicant, form from IND',
      requiresApostille: false,
      requiresTranslation: false,
      sourceUrl: 'https://ind.nl/en/forms/7603.pdf',
      notes: ['Serbia is not TB-exempt, so TB test is mandatory'],
    },
    {
      name: 'Passport Photos',
      description: 'Recent biometric passport photos',
      obtainedFrom: 'Photo studio',
      requiresApostille: false,
      requiresTranslation: false,
      notes: [
        'Must meet Dutch passport photo requirements',
        '35x45mm, neutral expression, white background',
      ],
    },
    {
      name: 'Proof of Qualifications',
      description: 'Diplomas/degrees (if relevant to reduced salary threshold)',
      obtainedFrom: 'Educational institutions',
      requiresApostille: true,
      requiresTranslation: true,
      notes: [
        'Required for reduced salary criterion (recent graduates)',
        'May need credential evaluation (Nuffic)',
      ],
    },
  ],

  // ============================================================================
  // Salary Thresholds (2026)
  // ============================================================================
  salaryThresholds: [
    {
      category: 'Highly Skilled Migrant - 30 years and older',
      monthlyGross: 5942,
      annualGross: 71304,
      notes: 'Standard threshold for workers aged 30+',
    },
    {
      category: 'Highly Skilled Migrant - Under 30 years',
      monthlyGross: 4357,
      annualGross: 52284,
      notes: 'Reduced threshold for workers under 30',
    },
    {
      category: 'Reduced salary criterion (recent graduates)',
      monthlyGross: 3122,
      annualGross: 37464,
      notes: 'For graduates within 3 years of graduation, search year holders',
    },
    {
      category: 'European Blue Card - Standard',
      monthlyGross: 5942,
      annualGross: 71304,
      notes: 'Alternative to HSM for highly educated workers',
    },
    {
      category: 'European Blue Card - Reduced',
      monthlyGross: 4754,
      annualGross: 57048,
      notes: 'For recent graduates applying for Blue Card',
    },
  ],

  // ============================================================================
  // Fees
  // ============================================================================
  fees: [
    {
      description: 'Highly Skilled Migrant residence permit (TEV procedure)',
      amount: 423,
      currency: 'EUR',
      paidBy: 'employer',
      sourceUrl: 'https://ind.nl/en/fees-costs-of-an-application',
    },
    {
      description: 'Recognition as sponsor (standard)',
      amount: 5080,
      currency: 'EUR',
      paidBy: 'employer',
      sourceUrl: 'https://ind.nl/en/residence-permits/work/apply-for-recognition-as-sponsor',
    },
    {
      description: 'Recognition as sponsor (small business ≤50 employees)',
      amount: 2539,
      currency: 'EUR',
      paidBy: 'employer',
      sourceUrl: 'https://ind.nl/en/residence-permits/work/apply-for-recognition-as-sponsor',
    },
    {
      description: 'TB test at GGD',
      amount: 90,
      currency: 'EUR',
      paidBy: 'employee',
      sourceUrl: 'https://allaboutexpats.nl/tuberculosis-test/',
    },
    {
      description: 'Apostille in Serbia (per document)',
      amount: 20,
      currency: 'EUR',
      paidBy: 'employee',
    },
    {
      description: 'Certified translation (per page, approximate)',
      amount: 35,
      currency: 'EUR',
      paidBy: 'employee',
    },
  ],

  // ============================================================================
  // Processing Times
  // ============================================================================
  processingTimes: [
    {
      stage: 'Sponsor recognition (if needed)',
      typical: '4-6 weeks',
      maximum: '90 days',
      notes: 'Only needed if employer is not yet recognized',
    },
    {
      stage: 'TEV application (MVV + residence permit)',
      typical: '2-4 weeks',
      maximum: '90 days',
      notes: 'Recognized sponsors get faster processing',
    },
    {
      stage: 'MVV collection at embassy',
      typical: '1-2 weeks',
      maximum: '2-3 weeks',
      notes: 'Appointment required, embassy only open Wed-Thu',
    },
    {
      stage: 'Municipality registration (BSN)',
      typical: '1-3 weeks',
      maximum: '4-6 weeks',
      notes: 'Varies by municipality, some have long waits',
    },
    {
      stage: 'Residence permit card collection',
      typical: '2-3 weeks after arrival',
      maximum: '4-6 weeks',
      notes: 'Biometrics appointment at IND desk',
    },
  ],

  // ============================================================================
  // Common Pitfalls
  // ============================================================================
  pitfalls: [
    {
      title: 'Employer not a recognized sponsor',
      description: 'Many smaller Dutch companies are not yet recognized IND sponsors. Without recognition, they cannot apply for HSM permits.',
      prevention: 'Verify sponsor status at IND public register before signing contract. Allow 4-8 weeks extra if recognition is needed.',
      severity: 'high',
    },
    {
      title: 'Salary below threshold',
      description: 'Salary must meet IND thresholds (including holiday allowance). Thresholds change annually on January 1.',
      prevention: 'Confirm gross monthly salary meets current IND requirements. For 2026: €4,357/month (under 30) or €5,942/month (30+).',
      severity: 'high',
    },
    {
      title: 'Missing apostille on documents',
      description: 'Birth certificates and diplomas need apostille from Serbian courts. Without it, documents may be rejected.',
      prevention: 'Get apostille from local Osnovni sud (basic court) in Serbia before traveling.',
      severity: 'high',
    },
    {
      title: 'MVV expires before travel',
      description: 'MVV is valid for only 90 days. If you don\'t travel within this period, you need to restart the process.',
      prevention: 'Plan travel as soon as MVV is ready. Don\'t wait until last minute.',
      severity: 'high',
    },
    {
      title: 'Missing TB test deadline',
      description: 'TB test must be completed within 3 months of receiving residence permit. Failure can affect permit validity.',
      prevention: 'Schedule GGD appointment in your first week in Netherlands.',
      severity: 'medium',
    },
    {
      title: 'Municipality registration delays',
      description: 'Some Dutch municipalities (especially Amsterdam, Rotterdam) have weeks-long waiting times for registration.',
      prevention: 'Book municipality appointment before arriving if possible. Some allow online booking.',
      severity: 'medium',
    },
    {
      title: 'Untranslated documents',
      description: 'Documents in Serbian need sworn translation to Dutch or English for municipality registration.',
      prevention: 'Get certified translations before leaving Serbia, or use sworn translator in NL.',
      severity: 'medium',
    },
    {
      title: 'Changing employers too quickly',
      description: 'If you change jobs, new employer must also be recognized sponsor and meet salary threshold.',
      prevention: 'Verify new employer is recognized sponsor before switching. New application may be needed.',
      severity: 'low',
    },
  ],

  // ============================================================================
  // Useful Links
  // ============================================================================
  usefulLinks: [
    {
      title: 'IND - Highly Skilled Migrant',
      url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
      description: 'Official IND page for highly skilled migrant permits',
    },
    {
      title: 'IND - Recognized Sponsors Register',
      url: 'https://ind.nl/en/public-register-recognised-sponsors',
      description: 'Check if your employer is a recognized sponsor',
    },
    {
      title: 'IND - Salary Requirements 2026',
      url: 'https://ind.nl/en/required-amounts-income-requirements',
      description: 'Current salary thresholds for all visa types',
    },
    {
      title: 'IND - Application Fees',
      url: 'https://ind.nl/en/fees-costs-of-an-application',
      description: 'Current fees for all application types',
    },
    {
      title: 'IND - Forms',
      url: 'https://ind.nl/en/search-form',
      description: 'All IND application forms',
    },
    {
      title: 'Dutch Embassy Belgrade',
      url: 'https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/serbia/embassy-belgrade',
      description: 'Embassy contact and appointment information',
    },
    {
      title: 'Serbia MFA - Document Legalization',
      url: 'https://www.mfa.gov.rs/en/citizens/services/document-certification',
      description: 'Apostille and document certification in Serbia',
    },
    {
      title: 'Hague Apostille Convention',
      url: 'https://www.hcch.net/en/instruments/conventions/status-table/?cid=41',
      description: 'List of countries accepting apostille (Serbia included)',
    },
    {
      title: 'Netherlands Worldwide - Making Appointments',
      url: 'https://www.netherlandsworldwide.nl/making-appointment/serbia',
      description: 'How to make appointments at Dutch embassy in Serbia',
    },
    {
      title: 'TB Test Information',
      url: 'https://allaboutexpats.nl/tuberculosis-test/',
      description: 'Detailed information about TB test requirements',
    },
  ],

  // ============================================================================
  // Embassy Information
  // ============================================================================
  embassyInfo: {
    name: 'Embassy of the Kingdom of the Netherlands',
    address: 'Milentija Popovica 5b',
    city: '11070 Belgrade',
    country: 'Serbia',
    email: 'bel-ca@minbuza.nl',
    appointmentUrl: 'https://www.netherlandsworldwide.nl/making-appointment/serbia',
    openingHours: [
      'Monday: Closed',
      'Tuesday: Closed',
      'Wednesday: 9:00 - 11:30 (by appointment only)',
      'Thursday: 9:00 - 11:30 (by appointment only)',
      'Friday: Closed',
      'Saturday: Closed',
      'Sunday: Closed',
    ],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get total estimated timeline in weeks
 */
export function getEstimatedTimeline(employerIsRecognizedSponsor: boolean): {
  minimum: number;
  typical: number;
  maximum: number;
} {
  const sponsorRecognition = employerIsRecognizedSponsor ? 0 : 6;
  
  return {
    minimum: sponsorRecognition + 3, // 3 weeks if everything goes fast
    typical: sponsorRecognition + 6, // 6 weeks typical
    maximum: sponsorRecognition + 16, // 16 weeks if delays
  };
}

/**
 * Get salary threshold for a given age
 */
export function getSalaryThreshold(age: number, isRecentGraduate: boolean = false): number {
  if (isRecentGraduate) {
    return 3122;
  }
  return age < 30 ? 4357 : 5942;
}

/**
 * Check if salary meets requirements
 */
export function meetsSalaryRequirement(
  monthlyGross: number,
  age: number,
  isRecentGraduate: boolean = false
): boolean {
  const threshold = getSalaryThreshold(age, isRecentGraduate);
  return monthlyGross >= threshold;
}

/**
 * Get total estimated costs
 */
export function getEstimatedCosts(employerNeedsRecognition: boolean): {
  employerCosts: number;
  employeeCosts: number;
  total: number;
} {
  let employerCosts = 423; // HSM application fee
  if (employerNeedsRecognition) {
    employerCosts += 5080; // Recognition fee (standard)
  }

  const employeeCosts = 90 + 20 + 35; // TB test + apostille + translation (estimates)

  return {
    employerCosts,
    employeeCosts,
    total: employerCosts + employeeCosts,
  };
}

// ============================================================================
// Export default
// ============================================================================

export default serbiaVisaRequirements;
