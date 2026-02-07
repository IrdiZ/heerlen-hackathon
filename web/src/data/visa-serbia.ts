/**
 * Serbia → Netherlands Visa Requirements for Work & Study Sponsorship
 * 
 * This file contains comprehensive visa requirements for Serbian citizens
 * seeking work sponsorship (Highly Skilled Migrant / Kennismigrant) or
 * student visas in the Netherlands.
 * 
 * Last updated: February 2026
 * 
 * Sources:
 * - IND (Immigration and Naturalisation Service): https://ind.nl/en
 * - Netherlands Worldwide: https://www.netherlandsworldwide.nl
 * - Dutch Embassy Belgrade: https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/serbia/embassy-belgrade
 */

// ============================================================================
// Types
// ============================================================================

export interface VisaStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  responsible: 'employer' | 'employee' | 'applicant' | 'institution' | 'both' | 'government' | 'ind' | 'embassy';
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
  paidBy: 'employer' | 'employee' | 'applicant' | 'institution' | 'either';
  sourceUrl?: string;
  notes?: string;
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

export interface StudentFinancialRequirement {
  studyType: string;
  monthlyAmount: number;
  annualAmount: number;
  notes?: string;
}

export interface StudentVisaInfo {
  overview: string;
  financialRequirements: StudentFinancialRequirement[];
  steps: VisaStep[];
  requiredDocuments: RequiredDocument[];
  processingTimes: ProcessingTime[];
  fees: Fee[];
  pitfalls: Pitfall[];
}

export interface VisaRequirements {
  country: string;
  countryCode: string;
  visaType: string;
  requiresMVV: boolean;
  requiresTBTest: boolean;
  apostilleConvention: boolean;
  recognizedSponsorMandatory: boolean;
  lastUpdated: string;
  overview: string;
  criticalInfo: string[];
  steps: VisaStep[];
  requiredDocuments: RequiredDocument[];
  salaryThresholds: SalaryThreshold[];
  fees: Fee[];
  processingTimes: ProcessingTime[];
  pitfalls: Pitfall[];
  studentVisa: StudentVisaInfo;
  usefulLinks: { title: string; url: string; description: string }[];
  embassyInfo: {
    name: string;
    address: string;
    city: string;
    country: string;
    email: string;
    appointmentUrl: string;
    vfsGlobalUrl: string;
    openingHours: string[];
    criticalNote: string;
  };
}

// ============================================================================
// Data
// ============================================================================

export const serbiaVisaRequirements: VisaRequirements = {
  country: 'Serbia',
  countryCode: 'RS',
  visaType: 'Highly Skilled Migrant (Kennismigrant)',
  requiresMVV: true, // Serbian citizens need MVV (provisional residence permit) - NOT on exempt list
  requiresTBTest: true, // Serbia is NOT on the TB-exempt list
  apostilleConvention: true, // Serbia is party to Hague Apostille Convention
  recognizedSponsorMandatory: true, // Unlike Turkey, Serbia has NO bilateral agreement - sponsor IS required
  lastUpdated: '2026-02-07',

  overview: `Serbian citizens require an MVV (Machtiging tot Voorlopig Verblijf - Provisional Residence Permit) 
to work or study in the Netherlands for more than 90 days. Serbia is NOT on the MVV-exempt list.

For highly skilled migrants, a recognized IND sponsor (erkend referent) is MANDATORY. Unlike Turkish citizens 
who benefit from the EU-Turkey Association Agreement, Serbian citizens have no special bilateral agreements 
and must follow the standard IND procedures.

The Dutch Embassy in Belgrade has very limited opening hours (Wednesday-Thursday only, 9:00-11:30), 
so plan your MVV collection appointment well in advance.`,

  criticalInfo: [
    '⚠️ EMBASSY HOURS: Wed-Thu 9:00-11:30 ONLY - Very limited availability!',
    '⚠️ RECOGNIZED SPONSOR MANDATORY - Self-application NOT possible for Serbian citizens',
    '📅 Book appointments via VFS Global online system - do not wait until last minute',
    '💉 TB TEST REQUIRED - Serbia is NOT on the exempt list',
    '📄 Documents need APOSTILLE from Serbian court (Osnovni sud)',
  ],

  // ============================================================================
  // Step-by-Step Process (Highly Skilled Migrant)
  // ============================================================================
  steps: [
    {
      step: 1,
      title: 'Find Recognized Sponsor Employer',
      description: 'Your Dutch employer MUST be a recognized sponsor (erkend referent) with the IND. This is mandatory for Serbian citizens - there is no self-application option.',
      duration: 'N/A (employer prerequisite)',
      responsible: 'employer',
      documents: [],
      notes: [
        'Check if employer is recognized: https://ind.nl/en/public-register-recognised-sponsors',
        'If not recognized, employer must apply first (4-8 weeks, €5,080 fee)',
        'Recognition is MANDATORY for highly skilled migrant applications from Serbia',
        'Unlike Turkey, Serbia has no bilateral agreement allowing self-application',
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
        'Salary must meet 2026 thresholds: €4,357 (under 30) or €5,942 (30+)',
      ],
    },
    {
      step: 3,
      title: 'IND Processing',
      description: 'The IND reviews the application and makes a decision. For recognized sponsors, processing is typically 2-4 weeks.',
      duration: '2-4 weeks (typical), up to 90 days (maximum)',
      responsible: 'government',
      documents: [],
      notes: [
        'IND may request additional documents',
        'Check status via My IND portal',
        'Employer receives decision notification',
        'Processing is NOT accelerated like for Turkish citizens without sponsor',
      ],
    },
    {
      step: 4,
      title: 'Book MVV Appointment via VFS Global',
      description: 'Once approved, book your MVV collection appointment through the VFS Global online system. The embassy only accepts appointments on Wednesday and Thursday mornings.',
      duration: 'Varies based on availability',
      responsible: 'employee',
      documents: [],
      notes: [
        '⚠️ CRITICAL: Embassy open ONLY Wed-Thu 9:00-11:30',
        'Book online: https://www.vfsvisaonline.com/Netherlands-Global-Online-Appointment_Zone2/',
        'Limited slots available - book as soon as IND approval is received',
        'Alternative: contact bel-ca@minbuza.nl for appointment assistance',
      ],
    },
    {
      step: 5,
      title: 'Collect MVV at Embassy Belgrade',
      description: 'Attend your appointment at the Dutch Embassy in Belgrade to collect your MVV sticker.',
      duration: '1-2 weeks after approval',
      responsible: 'employee',
      documents: [
        'Valid passport',
        'Appointment confirmation',
        'IND approval letter (optional but helpful)',
        'Passport-size photo meeting Dutch requirements',
      ],
      notes: [
        'MVV sticker valid for 90 days - you must travel within this period',
        'MVV sticker preparation takes up to 10 working days after appointment',
        'Collect within 3 months of IND approval',
      ],
    },
    {
      step: 6,
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
        'MVV serves as entry visa for initial entry',
      ],
    },
    {
      step: 7,
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
      step: 8,
      title: 'Undergo TB Test',
      description: 'Take tuberculosis test at local GGD (Municipal Health Service) within 3 months of receiving residence permit.',
      duration: '1-2 weeks to schedule',
      responsible: 'employee',
      documents: [
        'TB referral form from IND',
        'Passport or ID',
      ],
      notes: [
        'MANDATORY for Serbian citizens - Serbia is NOT TB-exempt',
        'Cost: €62.50 - €116 depending on location',
        'Results sent directly to IND',
        'Failure to complete may affect residence permit',
      ],
    },
    {
      step: 9,
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
      sourceUrl: 'https://www.netherlandsworldwide.nl/legalisation/foreign-documents/serbia',
      notes: [
        'Get international/multilingual format if available - these do NOT need translation',
        'Apostille from Serbian court (Osnovni sud)',
        'Translation by sworn translator (beëdigd vertaler) in NL or certified translator in Serbia',
        'HCCH apostille authorities: https://www.hcch.net/en/states/authorities/details3/?aid=342',
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
        'Salary must meet 2026 thresholds',
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
      notes: ['Serbia is NOT TB-exempt - TB test is MANDATORY'],
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
        'Apostille from Serbian court (Osnovni sud)',
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
  // Fees (2026)
  // ============================================================================
  fees: [
    {
      description: 'Highly Skilled Migrant residence permit (TEV procedure)',
      amount: 423,
      currency: 'EUR',
      paidBy: 'employer',
      sourceUrl: 'https://ind.nl/en/fees-costs-of-an-application',
      notes: '2026 rates - verify current amount on IND website',
    },
    {
      description: 'Recognition as sponsor (standard)',
      amount: 5080,
      currency: 'EUR',
      paidBy: 'employer',
      sourceUrl: 'https://ind.nl/en/residence-permits/work/apply-for-recognition-as-sponsor',
      notes: 'One-time fee for employer recognition',
    },
    {
      description: 'Recognition as sponsor (small business ≤50 employees)',
      amount: 2539,
      currency: 'EUR',
      paidBy: 'employer',
      sourceUrl: 'https://ind.nl/en/residence-permits/work/apply-for-recognition-as-sponsor',
      notes: 'Reduced fee for small businesses',
    },
    {
      description: 'TB test at GGD',
      amount: 90,
      currency: 'EUR',
      paidBy: 'employee',
      sourceUrl: 'https://ind.nl/en/tuberculosis-tb-test',
      notes: 'Range €62.50 - €116 depending on GGD location',
    },
    {
      description: 'Apostille in Serbia (per document)',
      amount: 20,
      currency: 'EUR',
      paidBy: 'employee',
      notes: 'Approximate cost at Osnovni sud',
    },
    {
      description: 'Certified translation (per page, approximate)',
      amount: 35,
      currency: 'EUR',
      paidBy: 'employee',
      notes: 'Varies by translator and language pair',
    },
    {
      description: 'Residence permit extension',
      amount: 192,
      currency: 'EUR',
      paidBy: 'either',
      sourceUrl: 'https://ind.nl/en/fees-costs-of-an-application',
      notes: 'For renewals after initial permit expires',
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
      stage: 'MVV sticker preparation at embassy',
      typical: '5-10 working days',
      maximum: '10 working days',
      notes: 'After embassy appointment',
    },
    {
      stage: 'MVV collection at embassy',
      typical: '1-2 weeks',
      maximum: '3 weeks',
      notes: '⚠️ Embassy only open Wed-Thu 9:00-11:30 - limited slots!',
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
      description: 'Many smaller Dutch companies are not yet recognized IND sponsors. Serbian citizens CANNOT self-apply.',
      prevention: 'Verify sponsor status at IND public register before signing contract. Allow 4-8 weeks extra if recognition is needed.',
      severity: 'high',
    },
    {
      title: 'Embassy appointment availability',
      description: 'The Dutch Embassy in Belgrade only opens Wednesday-Thursday 9:00-11:30. Slots fill up quickly.',
      prevention: 'Book via VFS Global immediately after IND approval. Don\'t wait - slots are very limited!',
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
      prevention: 'Get apostille from local Osnovni sud (basic court) in Serbia before traveling. HCCH link: https://www.hcch.net/en/states/authorities/details3/?aid=342',
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
      description: 'TB test must be completed within 3 months of receiving residence permit. Serbia is NOT exempt.',
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
      prevention: 'Get certified translations before leaving Serbia, or use sworn translator in NL. Multilingual extracts do NOT need translation.',
      severity: 'medium',
    },
    {
      title: 'Trying to self-apply',
      description: 'Unlike Turkish citizens, Serbian citizens CANNOT apply for HSM permit without a recognized sponsor.',
      prevention: 'Always ensure your employer is a recognized IND sponsor before proceeding.',
      severity: 'high',
    },
    {
      title: 'Changing employers too quickly',
      description: 'If you change jobs, new employer must also be recognized sponsor and meet salary threshold.',
      prevention: 'Verify new employer is recognized sponsor before switching. New application may be needed.',
      severity: 'low',
    },
  ],

  // ============================================================================
  // Student Visa Information
  // ============================================================================
  studentVisa: {
    overview: `Serbian students require an MVV and residence permit to study in the Netherlands. The educational 
institution must be a recognized sponsor and applies on behalf of the student via the TEV procedure. 
Students must prove they have sufficient financial means to support themselves during their studies.`,

    financialRequirements: [
      {
        studyType: 'HBO (University of Applied Sciences) / University (WO)',
        monthlyAmount: 1130.77,
        annualAmount: 13569.24,
        notes: 'Must prove access to this amount per month of stay',
      },
      {
        studyType: 'MBO (Vocational Education) / Secondary Education',
        monthlyAmount: 928.58,
        annualAmount: 11142.96,
        notes: 'Must prove access to this amount per month of stay',
      },
    ],

    steps: [
      {
        step: 1,
        title: 'Obtain Admission to Dutch Institution',
        description: 'Apply and get accepted to a Dutch educational institution that is a recognized IND sponsor.',
        duration: 'Varies by institution',
        responsible: 'applicant',
        notes: [
          'Institution must be on IND recognized sponsor list',
          'Check: https://ind.nl/en/public-register-recognised-sponsors',
          'Most universities and HBO institutions are recognized',
        ],
      },
      {
        step: 2,
        title: 'Institution Submits TEV Application',
        description: 'The educational institution submits the TEV application on your behalf through the IND Business Portal.',
        duration: '1-2 weeks to prepare',
        responsible: 'institution',
        documents: [
          'Copy of valid passport',
          'Proof of admission/enrollment',
          'Proof of sufficient financial means',
          'Antecedents certificate (form 7644)',
          'TB test declaration (form 7603)',
        ],
        notes: [
          'Institution handles the application - you provide documents',
          'Must prove access to required funds for duration of study',
        ],
      },
      {
        step: 3,
        title: 'IND Processing',
        description: 'The IND reviews the application. Processing typically takes 2-4 weeks for recognized institution sponsors.',
        duration: '2-4 weeks (typical)',
        responsible: 'government',
        notes: [
          'Institution receives decision notification',
          'IND may request additional documents',
        ],
      },
      {
        step: 4,
        title: 'Collect MVV at Embassy Belgrade',
        description: 'Book appointment via VFS Global and collect MVV sticker at Dutch Embassy in Belgrade.',
        duration: '1-2 weeks',
        responsible: 'applicant',
        notes: [
          '⚠️ Embassy only open Wed-Thu 9:00-11:30!',
          'Book via: https://www.vfsvisaonline.com/Netherlands-Global-Online-Appointment_Zone2/',
          'MVV valid 90 days - travel within this period',
        ],
      },
      {
        step: 5,
        title: 'Travel and Register',
        description: 'Travel to Netherlands, register at municipality, complete TB test, and collect residence permit.',
        duration: 'Within 90 days of MVV',
        responsible: 'applicant',
        notes: [
          'Register at gemeente within 5 days of arrival',
          'TB test mandatory for Serbian students',
          'Collect residence permit at IND desk',
        ],
      },
    ],

    requiredDocuments: [
      {
        name: 'Valid Passport',
        description: 'Valid for duration of studies + 3 months',
        obtainedFrom: 'Serbian Ministry of Interior',
        requiresApostille: false,
        requiresTranslation: false,
      },
      {
        name: 'Proof of Admission',
        description: 'Acceptance letter from Dutch educational institution',
        obtainedFrom: 'Dutch institution',
        requiresApostille: false,
        requiresTranslation: false,
      },
      {
        name: 'Proof of Financial Means',
        description: 'Bank statements, scholarship letter, or sponsor guarantee showing access to required funds',
        obtainedFrom: 'Bank or sponsor',
        requiresApostille: false,
        requiresTranslation: false,
        notes: [
          'Must cover: €1,130.77/month (HBO/Uni) or €928.58/month (MBO)',
          'Can be personal funds, scholarship, or third-party sponsor',
        ],
      },
      {
        name: 'Educational Certificates',
        description: 'Previous diplomas/transcripts required for admission',
        obtainedFrom: 'Serbian educational institutions',
        requiresApostille: true,
        requiresTranslation: true,
        notes: [
          'Apostille from Osnovni sud',
          'May need Nuffic credential evaluation',
        ],
      },
      {
        name: 'TB Test Declaration',
        description: 'Declaration to undergo TB test (form 7603)',
        obtainedFrom: 'IND website',
        requiresApostille: false,
        requiresTranslation: false,
        sourceUrl: 'https://ind.nl/en/forms/7603.pdf',
      },
    ],

    processingTimes: [
      {
        stage: 'Institution application submission',
        typical: '1-2 weeks',
        maximum: '4 weeks',
        notes: 'Depends on institution processing',
      },
      {
        stage: 'IND processing',
        typical: '2-4 weeks',
        maximum: '90 days',
        notes: 'Recognized institution sponsors get faster processing',
      },
      {
        stage: 'MVV collection',
        typical: '1-2 weeks',
        maximum: '3 weeks',
        notes: 'Limited embassy hours - book early!',
      },
    ],

    fees: [
      {
        description: 'Student residence permit (TEV procedure)',
        amount: 224,
        currency: 'EUR',
        paidBy: 'applicant',
        sourceUrl: 'https://ind.nl/en/fees-costs-of-an-application',
        notes: '2026 rates - verify on IND website',
      },
      {
        description: 'TB test at GGD',
        amount: 90,
        currency: 'EUR',
        paidBy: 'applicant',
        notes: 'Range €62.50 - €116',
      },
    ],

    pitfalls: [
      {
        title: 'Insufficient financial proof',
        description: 'Students must prove they have €1,130.77/month (HBO/Uni) or €928.58/month (MBO) for their entire study period.',
        prevention: 'Prepare detailed bank statements or scholarship/sponsor letters well in advance.',
        severity: 'high',
      },
      {
        title: 'Late application',
        description: 'Starting the visa process too late can mean missing the academic year start.',
        prevention: 'Start at least 3 months before intended travel date. Apply to institution even earlier.',
        severity: 'high',
      },
      {
        title: 'Institution not recognized',
        description: 'Some smaller educational institutions may not be IND recognized sponsors.',
        prevention: 'Verify institution is on IND sponsor register before applying for admission.',
        severity: 'medium',
      },
    ],
  },

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
      title: 'IND - Study Visa',
      url: 'https://ind.nl/en/residence-permits/study',
      description: 'Official page for student residence permits',
    },
    {
      title: 'MVV Application Serbia',
      url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/mvv-long-stay/apply-serbia',
      description: 'Specific MVV application information for Serbian citizens',
    },
    {
      title: 'Dutch Embassy Belgrade',
      url: 'https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/serbia/embassy-belgrade',
      description: 'Embassy contact and appointment information',
    },
    {
      title: 'VFS Global - Online Appointments',
      url: 'https://www.vfsvisaonline.com/Netherlands-Global-Online-Appointment_Zone2/',
      description: 'Book your MVV collection appointment online',
    },
    {
      title: 'Document Legalization Serbia',
      url: 'https://www.netherlandsworldwide.nl/legalisation/foreign-documents/serbia',
      description: 'Apostille and document legalization requirements for Serbia',
    },
    {
      title: 'HCCH Apostille Authorities Serbia',
      url: 'https://www.hcch.net/en/states/authorities/details3/?aid=342',
      description: 'Official list of apostille authorities in Serbia',
    },
    {
      title: 'IND - Forms',
      url: 'https://ind.nl/en/search-form',
      description: 'All IND application forms',
    },
    {
      title: 'TB Test Information',
      url: 'https://ind.nl/en/tuberculosis-tb-test',
      description: 'Official IND TB test requirements',
    },
    {
      title: 'Hague Apostille Convention',
      url: 'https://www.hcch.net/en/instruments/conventions/status-table/?cid=41',
      description: 'List of countries accepting apostille (Serbia included)',
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
    vfsGlobalUrl: 'https://www.vfsvisaonline.com/Netherlands-Global-Online-Appointment_Zone2/',
    openingHours: [
      '⚠️ VERY LIMITED HOURS - PLAN AHEAD! ⚠️',
      'Monday: CLOSED',
      'Tuesday: CLOSED',
      'Wednesday: 9:00 - 11:30 (by appointment only)',
      'Thursday: 9:00 - 11:30 (by appointment only)',
      'Friday: CLOSED',
      'Saturday: CLOSED',
      'Sunday: CLOSED',
    ],
    criticalNote: `⚠️ IMPORTANT: The Dutch Embassy in Belgrade has very limited opening hours for consular services. 
MVV appointments are ONLY available on Wednesday and Thursday mornings (9:00-11:30). 

Book your appointment as early as possible via VFS Global online system. Slots fill up quickly!

Appointment booking: https://www.vfsvisaonline.com/Netherlands-Global-Online-Appointment_Zone2/
Alternative contact: bel-ca@minbuza.nl

MVV sticker preparation takes up to 10 working days after your appointment.
You must collect your MVV within 3 months of IND approval.`,
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
    minimum: sponsorRecognition + 4, // 4 weeks if everything goes fast
    typical: sponsorRecognition + 8, // 8 weeks typical (including limited embassy availability)
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
 * Get total estimated costs for highly skilled migrant
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

/**
 * Get student financial requirement
 */
export function getStudentFinancialRequirement(
  studyType: 'hbo' | 'university' | 'mbo' | 'secondary',
  durationMonths: number
): {
  monthlyAmount: number;
  totalRequired: number;
} {
  const monthlyAmount = (studyType === 'mbo' || studyType === 'secondary') ? 928.58 : 1130.77;
  
  return {
    monthlyAmount,
    totalRequired: monthlyAmount * durationMonths,
  };
}

/**
 * Check if applicant can self-apply (Serbia: NO)
 */
export function canSelfApply(): boolean {
  return false; // Serbian citizens MUST have a recognized sponsor
}

// ============================================================================
// Export default
// ============================================================================

export default serbiaVisaRequirements;
