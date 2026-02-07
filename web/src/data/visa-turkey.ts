/**
 * Turkey → Netherlands Visa Requirements
 * Highly Skilled Migrant (Kennismigrant) & Student Visa Guide
 * 
 * Last Updated: February 2026
 * 
 * Official Sources:
 * - IND (Immigration and Naturalisation Service): https://ind.nl/en
 * - IND - Turkish Citizens: https://ind.nl/en/turkish-citizens-and-living-in-the-netherlands
 * - IND - Required Amounts: https://ind.nl/en/required-amounts-income-requirements
 * - IND - Fees: https://ind.nl/en/fees-costs-of-an-application
 * - Netherlands Worldwide - MVV Turkey: https://www.netherlandsworldwide.nl/visa-the-netherlands/mvv-long-stay/apply-turkiye
 * - Netherlands Worldwide - Legalisation Turkey: https://www.netherlandsworldwide.nl/legalisation/foreign-documents/turkiye
 * - HCCH Apostille Turkey: https://www.hcch.net/en/states/authorities/details3/?aid=350
 */

export interface VisaStep {
  id: string;
  title: string;
  description: string;
  responsibleParty: 'employer' | 'employee' | 'both';
  timelineEstimate: string;
  documents: DocumentRequirement[];
  links: ResourceLink[];
  tips?: string[];
  warnings?: string[];
}

export interface DocumentRequirement {
  name: string;
  description: string;
  whereToGet: string;
  url?: string;
  needsApostille: boolean;
  needsTranslation: boolean;
  validityPeriod?: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  description: string;
}

export interface SalaryThreshold {
  category: string;
  monthlyGross: number;
  excludesHolidayAllowance: boolean;
  notes?: string;
}

export interface Fee {
  description: string;
  amount: number;
  currency: string;
  notes?: string;
}

export interface CommonMistake {
  mistake: string;
  consequence: string;
  prevention: string;
}

// ============================================================================
// SALARY THRESHOLDS (2026 rates - updated January 1, 2026)
// ============================================================================

export const salaryThresholds2026: SalaryThreshold[] = [
  {
    category: 'Highly Skilled Migrant - 30 years or older',
    monthlyGross: 5942,
    excludesHolidayAllowance: true,
    notes: 'Standard rate for experienced professionals'
  },
  {
    category: 'Highly Skilled Migrant - younger than 30 years',
    monthlyGross: 4357,
    excludesHolidayAllowance: true,
    notes: 'Age at time of application determines threshold'
  },
  {
    category: 'Highly Skilled Migrant - Reduced salary criterion',
    monthlyGross: 3122,
    excludesHolidayAllowance: true,
    notes: 'For recent graduates (within 3 years of graduation) or those with orientation year permit'
  },
  {
    category: 'European Blue Card',
    monthlyGross: 5942,
    excludesHolidayAllowance: true,
  },
  {
    category: 'European Blue Card - Reduced criterion (graduates)',
    monthlyGross: 4754,
    excludesHolidayAllowance: true,
    notes: 'For graduates applying within 3 years of graduation'
  }
];

// 2025 rates for reference
export const salaryThresholds2025: SalaryThreshold[] = [
  {
    category: 'Highly Skilled Migrant - 30 years or older',
    monthlyGross: 5688,
    excludesHolidayAllowance: true,
  },
  {
    category: 'Highly Skilled Migrant - younger than 30 years',
    monthlyGross: 4171,
    excludesHolidayAllowance: true,
  },
  {
    category: 'Highly Skilled Migrant - Reduced salary criterion',
    monthlyGross: 2989,
    excludesHolidayAllowance: true,
  }
];

// ============================================================================
// APPLICATION FEES
// Source: https://ind.nl/en/fees-costs-of-an-application
// ============================================================================

export const applicationFees: Fee[] = [
  {
    description: 'First application - Highly Skilled Migrant (standard rate)',
    amount: 423,
    currency: 'EUR',
    notes: '2026 rates - Standard fee for non-Turkish citizens'
  },
  {
    description: 'First application - Highly Skilled Migrant (Turkish citizens)',
    amount: 72,
    currency: 'EUR',
    notes: 'Reduced rate under EU-Turkey Association Agreement'
  },
  {
    description: 'Extension - Highly Skilled Migrant (standard rate)',
    amount: 423,
    currency: 'EUR',
  },
  {
    description: 'Extension - Highly Skilled Migrant (Turkish citizens)',
    amount: 72,
    currency: 'EUR',
    notes: 'Reduced rate under EU-Turkey Association Agreement'
  },
  {
    description: 'Family member (spouse/partner/child) - First application',
    amount: 215,
    currency: 'EUR',
    notes: '2026 rates'
  },
  {
    description: 'Family member (Turkish citizens)',
    amount: 72,
    currency: 'EUR',
    notes: 'Reduced rate under EU-Turkey Association Agreement'
  },
  {
    description: 'Recognized Sponsor Registration (standard)',
    amount: 5080,
    currency: 'EUR',
    notes: 'One-time fee, valid indefinitely'
  },
  {
    description: 'Recognized Sponsor Registration (reduced - <50 employees or <1.5 years old)',
    amount: 2540,
    currency: 'EUR',
  }
];

// ============================================================================
// SPECIAL RULES FOR TURKISH CITIZENS
// ============================================================================

export const turkishCitizenBenefits = {
  title: 'EU-Turkey Association Agreement Benefits',
  description: 'Turkish citizens benefit from special rules under the 1963 Association Agreement between the EU and Turkey',
  benefits: [
    {
      benefit: 'Recognized sponsor not mandatory',
      details: 'Turkish nationals can apply without the employer being a recognized sponsor, though processing is faster with one'
    },
    {
      benefit: 'Reduced application fees',
      details: 'Turkish citizens pay only €72 for work permit applications instead of the standard €423'
    },
    {
      benefit: 'Self-application option',
      details: 'Can apply independently at Dutch embassy using form 9532 (for MVV + residence permit) or form 7531 (Association Law)'
    }
  ],
  importantNote: 'Even though a recognized sponsor is not mandatory, it is HIGHLY RECOMMENDED because processing time is reduced from 8+ weeks to approximately 2 weeks',
  links: [
    {
      title: 'IND - Turkish citizens and living in the Netherlands',
      url: 'https://ind.nl/en/turkish-citizens-and-living-in-the-netherlands',
      description: 'Official IND page on special rules for Turkish nationals'
    },
    {
      title: 'IND - Fees and Costs',
      url: 'https://ind.nl/en/fees-costs-of-an-application',
      description: 'Official fee amounts including reduced rates for Turkish citizens'
    }
  ]
};

// ============================================================================
// STUDENT VISA REQUIREMENTS
// Source: https://ind.nl/en/required-amounts-income-requirements
// ============================================================================

export interface StudentFinancialRequirement {
  studyType: string;
  monthlyAmount: number;
  currency: string;
  notes?: string;
}

export const studentVisaRequirements = {
  title: 'Student Residence Permit (Study)',
  description: 'Turkish students can study in the Netherlands with a student residence permit. The educational institution must be a recognized sponsor and applies on behalf of the student.',
  mvvRequired: true,
  
  financialRequirements2026: [
    {
      studyType: 'HBO (University of Applied Sciences) / University (WO)',
      monthlyAmount: 1130.77,
      currency: 'EUR',
      notes: 'Must demonstrate sufficient funds for entire study period'
    },
    {
      studyType: 'MBO (Vocational Education) / Secondary Education',
      monthlyAmount: 928.58,
      currency: 'EUR',
      notes: 'For vocational or secondary education programs'
    }
  ] as StudentFinancialRequirement[],
  
  process: [
    {
      step: 1,
      title: 'Admission to Dutch Educational Institution',
      description: 'Obtain admission letter from a recognized Dutch educational institution'
    },
    {
      step: 2,
      title: 'Institution Applies for Permit',
      description: 'The educational institution (as recognized sponsor) submits the TEV application on your behalf'
    },
    {
      step: 3,
      title: 'Proof of Finances',
      description: 'Provide proof of sufficient funds (bank statement, scholarship letter, or sponsor guarantee)'
    },
    {
      step: 4,
      title: 'IND Processing',
      description: 'IND reviews the application (2-4 weeks for recognized sponsors)'
    },
    {
      step: 5,
      title: 'MVV Collection',
      description: 'After approval, collect MVV sticker at Dutch Embassy in Ankara or Consulate in Istanbul'
    },
    {
      step: 6,
      title: 'Travel and Register',
      description: 'Travel to NL, register at municipality, take TB test, collect residence permit'
    }
  ],
  
  documentRequirements: [
    {
      name: 'Valid Passport',
      description: 'At least 6 months validity beyond intended stay',
      needsApostille: false,
      needsTranslation: false
    },
    {
      name: 'Admission Letter',
      description: 'Official admission letter from Dutch educational institution',
      needsApostille: false,
      needsTranslation: false
    },
    {
      name: 'Educational Certificates',
      description: 'Previous diplomas and transcripts',
      needsApostille: true,
      needsTranslation: true,
      notes: 'Apostille from Turkish authorities required'
    },
    {
      name: 'Proof of Financial Means',
      description: 'Bank statements or scholarship letter showing sufficient funds',
      needsApostille: false,
      needsTranslation: false
    },
    {
      name: 'Antecedents Certificate',
      description: 'Declaration about criminal history (IND form)',
      needsApostille: false,
      needsTranslation: false
    }
  ],
  
  fees: [
    {
      description: 'Student residence permit - First application (Turkish citizens)',
      amount: 72,
      currency: 'EUR',
      notes: 'Reduced rate under EU-Turkey Association Agreement'
    },
    {
      description: 'Student residence permit - First application (standard)',
      amount: 222,
      currency: 'EUR',
      notes: 'Standard rate for non-Turkish citizens'
    }
  ],
  
  links: [
    {
      title: 'IND - Study in the Netherlands',
      url: 'https://ind.nl/en/residence-permits/study',
      description: 'Official IND page for student residence permits'
    },
    {
      title: 'IND - Financial Requirements for Study',
      url: 'https://ind.nl/en/required-amounts-income-requirements',
      description: 'Current financial requirements for students'
    },
    {
      title: 'Study in Holland',
      url: 'https://www.studyinholland.nl',
      description: 'Official portal for international students in the Netherlands'
    }
  ],
  
  tips: [
    'Educational institution handles the application - contact their international office',
    'Turkish citizens pay reduced fees under the EU-Turkey Association Agreement',
    'Financial proof can be: personal bank account, scholarship, or sponsor guarantee',
    'Students can work up to 16 hours per week alongside studies',
    'Consider applying for orientation year (zoekjaar) after graduation'
  ]
};

// ============================================================================
// STEP-BY-STEP PROCESS
// ============================================================================

export const visaProcess: VisaStep[] = [
  {
    id: 'step-1-employer-sponsor',
    title: 'Step 1: Employer Becomes Recognized Sponsor (Recommended)',
    description: 'While not mandatory for Turkish citizens, having a recognized sponsor significantly speeds up the process (2 weeks vs 8+ weeks)',
    responsibleParty: 'employer',
    timelineEstimate: '2-4 weeks',
    documents: [
      {
        name: 'Chamber of Commerce (KvK) Registration',
        description: 'Company must be registered in the Dutch Commercial Register',
        whereToGet: 'Chamber of Commerce Netherlands',
        url: 'https://www.kvk.nl/english/',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Financial Statements',
        description: 'To prove continuity and solvency of the company',
        whereToGet: 'Company accountant',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Sponsor Recognition Application Form',
        description: 'Official IND form for sponsor registration',
        whereToGet: 'IND website',
        url: 'https://ind.nl/en/residence-permits/work/apply-for-recognition-as-sponsor',
        needsApostille: false,
        needsTranslation: false
      }
    ],
    links: [
      {
        title: 'Apply for recognition as sponsor - IND',
        url: 'https://ind.nl/en/residence-permits/work/apply-for-recognition-as-sponsor',
        description: 'Official IND page for sponsor registration'
      }
    ],
    tips: [
      'Companies >3 years old can be recognized without additional assessment',
      'Registration is valid for 5 years',
      'Having the sponsor status ready before finding candidates speeds up future hires'
    ],
    warnings: [
      'Without recognized sponsor status, processing can take 8 weeks or more instead of 2 weeks'
    ]
  },
  {
    id: 'step-2-employment-contract',
    title: 'Step 2: Sign Employment Contract',
    description: 'Employee and employer sign an employment contract meeting the salary threshold requirements',
    responsibleParty: 'both',
    timelineEstimate: '1-2 weeks',
    documents: [
      {
        name: 'Employment Contract',
        description: 'Must specify gross monthly salary (meeting threshold), job description, duration, and working hours',
        whereToGet: 'Prepared by employer',
        needsApostille: false,
        needsTranslation: false
      }
    ],
    links: [
      {
        title: 'IND Required Amounts (Salary Thresholds)',
        url: 'https://ind.nl/en/required-amounts-income-requirements',
        description: 'Current salary requirements for highly skilled migrants'
      }
    ],
    tips: [
      'Salary must EXCLUDE 8% holiday allowance when comparing to thresholds',
      'Include all fixed monthly allowances (like 13th month paid monthly) to meet threshold',
      'Age at time of application determines which salary threshold applies'
    ],
    warnings: [
      'Variable pay elements (overtime, tips, bonuses) cannot count toward salary threshold',
      'If changing employers later, must meet threshold applicable at that time'
    ]
  },
  {
    id: 'step-3-gather-documents',
    title: 'Step 3: Gather Required Documents (Employee in Turkey)',
    description: 'Employee collects and prepares all required documents in Turkey. Most Turkish documents need apostille.',
    responsibleParty: 'employee',
    timelineEstimate: '2-4 weeks',
    documents: [
      {
        name: 'Valid Passport',
        description: 'Must be valid for at least 6 months beyond intended stay',
        whereToGet: 'Turkish passport offices',
        needsApostille: false,
        needsTranslation: false,
        validityPeriod: 'At least 6 months remaining'
      },
      {
        name: 'Passport Photo',
        description: 'Recent biometric photo meeting Dutch requirements',
        whereToGet: 'Photo studio',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Educational Diplomas/Degrees',
        description: 'University degree or relevant qualifications',
        whereToGet: 'Educational institution',
        url: 'https://www.netherlandsworldwide.nl/legalisation/foreign-documents/turkiye',
        needsApostille: true,
        needsTranslation: true,
        validityPeriod: 'No expiration, but apostille should be recent'
      },
      {
        name: 'Antecedents Certificate (Form 7539)',
        description: 'Declaration about criminal history - required for everyone over 12',
        whereToGet: 'IND forms page',
        url: 'https://ind.nl/en/forms',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Birth Certificate (if needed)',
        description: 'May be required for certain applications',
        whereToGet: 'Turkish civil registry (Nüfus Müdürlüğü)',
        needsApostille: true,
        needsTranslation: true
      },
      {
        name: 'Marriage Certificate (if applicable)',
        description: 'Required if spouse will accompany',
        whereToGet: 'Turkish civil registry',
        needsApostille: true,
        needsTranslation: true
      }
    ],
    links: [
      {
        title: 'Legalisation of Turkish documents for NL',
        url: 'https://www.netherlandsworldwide.nl/legalisation/foreign-documents/turkiye',
        description: 'Which Turkish documents need apostille and how to get it'
      },
      {
        title: 'HCCH - Turkish Apostille Authorities',
        url: 'https://www.hcch.net/en/states/authorities/details3/?aid=350',
        description: 'Official Turkish authorities that issue apostilles'
      }
    ],
    tips: [
      'Multilingual civil status extracts do NOT need translation or apostille',
      'Get apostilles from Turkish Ministry of Foreign Affairs or provincial governors',
      'Have documents translated by a sworn translator (beëdigd vertaler) into Dutch, English, French, or German',
      'Start gathering documents early - apostille process can take 1-2 weeks'
    ],
    warnings: [
      'Documents in Turkish MUST be translated unless they are multilingual extracts',
      'Original documents required - no copies accepted for most items'
    ]
  },
  {
    id: 'step-4-submit-application',
    title: 'Step 4: Submit TEV Application (MVV + Residence Permit)',
    description: 'Recognized sponsor submits combined application for MVV (entry visa) and residence permit online or by post',
    responsibleParty: 'employer',
    timelineEstimate: '1-2 days to submit',
    documents: [
      {
        name: 'Application Form 7511 (Online) or 3072 (Paper)',
        description: 'Combined application for highly skilled migrant residence permit',
        whereToGet: 'IND Business Portal or IND forms page',
        url: 'https://ind.nl/en/forms',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'All gathered employee documents',
        description: 'Passport copy, diplomas, antecedents certificate, etc.',
        whereToGet: 'From employee',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Signed employment contract',
        description: 'Must show salary meets threshold',
        whereToGet: 'From employer',
        needsApostille: false,
        needsTranslation: false
      }
    ],
    links: [
      {
        title: 'IND Online Application Portal',
        url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
        description: 'Start the online application process'
      },
      {
        title: 'Checklist Documents - Highly Skilled Migrant',
        url: 'https://ind.nl/en/checklist-documents-online-application-highly-skilled-migrant',
        description: 'Complete list of required documents per situation'
      },
      {
        title: 'Application Form 7511 (PDF)',
        url: 'https://ind.nl/en/forms/7511.pdf',
        description: 'Paper application form for highly skilled migrants'
      }
    ],
    tips: [
      'Online applications via Business Portal are fastest',
      'Indicate which embassy (Ankara or Istanbul) employee will collect MVV',
      'Pay application fee immediately to avoid delays'
    ]
  },
  {
    id: 'step-5-ind-processing',
    title: 'Step 5: IND Processing',
    description: 'IND reviews the application and makes a decision',
    responsibleParty: 'employer',
    timelineEstimate: '2 weeks (recognized sponsor) / 8+ weeks (without)',
    documents: [],
    links: [
      {
        title: 'Track your application',
        url: 'https://ind.nl/en/service-and-contact',
        description: 'Contact IND to check application status'
      }
    ],
    tips: [
      'Recognized sponsors get fast-track processing (aim: 2 weeks)',
      'IND may request additional documents - respond quickly',
      'Employer receives decision letter by post and/or email'
    ],
    warnings: [
      'Complex cases may take up to 90 days',
      'Incomplete applications cause significant delays'
    ]
  },
  {
    id: 'step-6-mvv-collection',
    title: 'Step 6: Collect MVV at Dutch Embassy/Consulate in Turkey',
    description: 'After approval, employee visits Dutch embassy (Ankara) or consulate-general (Istanbul) to collect MVV sticker',
    responsibleParty: 'employee',
    timelineEstimate: '1-2 weeks after approval',
    documents: [
      {
        name: 'IND Approval Letter',
        description: 'The positive decision letter from IND',
        whereToGet: 'Received from employer after IND decision',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Valid Passport',
        description: 'The MVV sticker will be placed in your passport',
        whereToGet: 'Your own passport',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Passport Photo',
        description: 'Recent biometric photo',
        whereToGet: 'Photo studio',
        needsApostille: false,
        needsTranslation: false
      }
    ],
    links: [
      {
        title: 'Apply for MVV sticker in Turkey',
        url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/mvv-long-stay/apply-turkiye',
        description: 'Instructions for collecting MVV at Dutch embassy/consulate'
      },
      {
        title: 'Dutch Embassy Ankara - Make Appointment',
        url: 'mailto:ank-inburgering@minbuza.nl',
        description: 'Email to schedule MVV collection appointment in Ankara'
      },
      {
        title: 'Dutch Consulate Istanbul',
        url: 'https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/turkiye',
        description: 'Contact information for consulate-general Istanbul'
      }
    ],
    tips: [
      'You have 3 months from approval date to collect MVV (6 months for family reunification refugees)',
      'Biometric data (fingerprints, photo) will be collected at the embassy',
      'MVV sticker takes up to 10 working days to prepare',
      'Verify all information on MVV sticker immediately - report errors right away'
    ],
    warnings: [
      'Missing the 3-month deadline requires new application',
      'Book appointment early - embassy slots fill up quickly'
    ]
  },
  {
    id: 'step-7-travel-netherlands',
    title: 'Step 7: Travel to the Netherlands',
    description: 'Use the MVV sticker to enter the Netherlands within its validity period',
    responsibleParty: 'employee',
    timelineEstimate: 'Within MVV validity (usually 90 days)',
    documents: [
      {
        name: 'Passport with MVV sticker',
        description: 'Your entry document for the Netherlands',
        whereToGet: 'From embassy after Step 6',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Employment contract copy',
        description: 'May be requested at border',
        whereToGet: 'From employer',
        needsApostille: false,
        needsTranslation: false
      }
    ],
    links: [],
    tips: [
      'MVV is typically valid for 90 days - plan your move accordingly',
      'Bring copies of all important documents in carry-on luggage',
      'Keep employer contact information handy'
    ]
  },
  {
    id: 'step-8-register-netherlands',
    title: 'Step 8: Register in the Netherlands',
    description: 'Register with municipality (gemeente), take TB test, and collect residence permit',
    responsibleParty: 'employee',
    timelineEstimate: 'Within 3 months of arrival',
    documents: [
      {
        name: 'Birth Certificate (apostilled + translated)',
        description: 'Required for municipal registration',
        whereToGet: 'Brought from Turkey',
        needsApostille: true,
        needsTranslation: true
      },
      {
        name: 'Proof of Address',
        description: 'Rental contract or registration at temporary address',
        whereToGet: 'Landlord or host',
        needsApostille: false,
        needsTranslation: false
      },
      {
        name: 'Marriage Certificate (if applicable)',
        description: 'For registering spouse',
        whereToGet: 'Brought from Turkey',
        needsApostille: true,
        needsTranslation: true
      }
    ],
    links: [
      {
        title: 'IND - Requirements for everyone (TB test)',
        url: 'https://ind.nl/en/requirements-that-apply-to-everyone',
        description: 'Information about TB test requirement'
      },
      {
        title: 'TB Test Referral Form (7604)',
        url: 'https://ind.nl/en/forms/7604.pdf',
        description: 'Form for scheduling TB test at GGD'
      }
    ],
    tips: [
      'Register at municipality within 5 days of arrival',
      'TB test must be done within 3 months - Turkish citizens are NOT exempt',
      'Residence permit card can be collected at IND desk or Expatcenter',
      'Some municipalities have Expat Centers with one-stop service'
    ],
    warnings: [
      'Failure to take TB test can affect residence permit',
      'Late municipal registration may result in fines'
    ]
  }
];

// ============================================================================
// PROCESSING TIMES SUMMARY
// ============================================================================

export const processingTimes = {
  recognizedSponsorApplication: {
    description: 'Employer becoming recognized sponsor',
    duration: '2-4 weeks',
    notes: 'One-time process, valid 5 years'
  },
  indProcessingRecognizedSponsor: {
    description: 'IND decision (with recognized sponsor)',
    duration: 'Approximately 2 weeks',
    notes: 'Fast-track processing for recognized sponsors'
  },
  indProcessingWithoutSponsor: {
    description: 'IND decision (without recognized sponsor)',
    duration: '8 weeks to 90 days',
    notes: 'Significantly longer without sponsor status'
  },
  mvvSticker: {
    description: 'MVV sticker preparation at embassy',
    duration: 'Up to 10 working days',
    notes: 'After IND approval'
  },
  mvvValidity: {
    description: 'MVV validity for entry',
    duration: '90 days',
    notes: 'Must enter NL within this period'
  },
  residencePermitCollection: {
    description: 'Collect residence permit card',
    duration: '1-2 weeks after arrival',
    notes: 'After municipal registration'
  },
  totalProcessEstimate: {
    withRecognizedSponsor: '6-10 weeks total',
    withoutRecognizedSponsor: '12-20 weeks total'
  }
};

// ============================================================================
// COMMON MISTAKES AND PITFALLS
// ============================================================================

export const commonMistakes: CommonMistake[] = [
  {
    mistake: 'Salary below threshold when including holiday allowance',
    consequence: 'Application rejected - salary must EXCLUDE the 8% holiday allowance when comparing to IND thresholds',
    prevention: 'Calculate: threshold amount × 1.08 = minimum total gross salary including holiday allowance'
  },
  {
    mistake: 'Not getting documents apostilled in Turkey',
    consequence: 'Documents rejected, significant delays while getting proper apostilles',
    prevention: 'Get apostilles from Turkish authorities BEFORE leaving Turkey for all diplomas, birth/marriage certificates'
  },
  {
    mistake: 'Missing the 3-month MVV collection deadline',
    consequence: 'Approval expires, must start entire application process again',
    prevention: 'Book embassy appointment immediately upon receiving approval letter'
  },
  {
    mistake: 'Employer not being recognized sponsor (for speed)',
    consequence: 'Processing takes 8+ weeks instead of 2 weeks',
    prevention: 'Employer should become recognized sponsor BEFORE starting employee application'
  },
  {
    mistake: 'Not taking TB test within 3 months of arrival',
    consequence: 'May affect residence permit validity',
    prevention: 'Schedule TB test at local GGD within first weeks of arrival'
  },
  {
    mistake: 'Using wrong age threshold',
    consequence: 'Application rejected if salary too low for actual age bracket',
    prevention: 'Check age on date of application, not start of employment'
  },
  {
    mistake: 'Incomplete application package',
    consequence: 'IND requests additional documents, adding weeks to processing',
    prevention: 'Use IND checklist and include ALL required documents before submitting'
  },
  {
    mistake: 'Translations not by sworn translator',
    consequence: 'Documents not accepted, delays for proper translation',
    prevention: 'Use beëdigd vertaler (sworn translator) for all Turkish → Dutch/English translations'
  },
  {
    mistake: 'Not registering with municipality within 5 days',
    consequence: 'Fines and problems with BSN (citizen service number)',
    prevention: 'Book gemeente appointment before arrival, bring all required documents'
  },
  {
    mistake: 'Waiting too long to start process',
    consequence: 'Employee cannot start work on planned date',
    prevention: 'Begin 3-4 months before intended start date; 6 months if employer needs sponsor status'
  }
];

// ============================================================================
// IMPORTANT LINKS AND RESOURCES
// ============================================================================

export const importantLinks: ResourceLink[] = [
  // Work Visa Links
  {
    title: 'IND - Highly Skilled Migrant Main Page',
    url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
    description: 'Official starting point for all HSM information'
  },
  {
    title: 'IND - Required Amounts (Salary Thresholds)',
    url: 'https://ind.nl/en/required-amounts-income-requirements',
    description: 'Current salary thresholds updated annually'
  },
  {
    title: 'IND - Turkish Citizens Special Rules',
    url: 'https://ind.nl/en/turkish-citizens-and-living-in-the-netherlands',
    description: 'EU-Turkey Association Agreement benefits'
  },
  {
    title: 'IND - Forms Download Page',
    url: 'https://ind.nl/en/forms',
    description: 'All application forms in PDF'
  },
  {
    title: 'IND - Fees and Costs',
    url: 'https://ind.nl/en/fees-costs-of-an-application',
    description: 'Current application fees'
  },
  {
    title: 'IND - Become Recognized Sponsor',
    url: 'https://ind.nl/en/residence-permits/work/apply-for-recognition-as-sponsor',
    description: 'How employers can become recognized sponsors'
  },
  {
    title: 'IND - Public Register of Recognized Sponsors',
    url: 'https://ind.nl/en/public-register-recognised-sponsors',
    description: 'Check if an employer is already a recognized sponsor'
  },
  
  // Student Visa Links
  {
    title: 'IND - Study in the Netherlands',
    url: 'https://ind.nl/en/residence-permits/study',
    description: 'Official IND page for student residence permits'
  },
  {
    title: 'Study in Holland',
    url: 'https://www.studyinholland.nl',
    description: 'Official portal for international students'
  },
  
  // Embassy & MVV Links
  {
    title: 'NetherlandsWorldwide - MVV in Turkey',
    url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/mvv-long-stay/apply-turkiye',
    description: 'How to collect MVV at Dutch embassy/consulate'
  },
  {
    title: 'NetherlandsWorldwide - Embassies in Turkey',
    url: 'https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/turkiye',
    description: 'Contact information for Dutch missions in Turkey'
  },
  {
    title: 'NetherlandsWorldwide - Document Legalisation Turkey',
    url: 'https://www.netherlandsworldwide.nl/legalisation/foreign-documents/turkiye',
    description: 'Which Turkish documents need apostille'
  },
  {
    title: 'HCCH - Turkish Apostille Authorities',
    url: 'https://www.hcch.net/en/states/authorities/details3/?aid=350',
    description: 'Official Turkish authorities that issue apostilles'
  },
  
  // VFS Global (Schengen Only)
  {
    title: 'VFS Global - Netherlands Turkey',
    url: 'https://visa.vfsglobal.com/tur/en/nld',
    description: '⚠️ For Schengen (short-stay) visa ONLY - NOT for MVV'
  },
  {
    title: 'VFS Global - Book Appointment',
    url: 'https://visa.vfsglobal.com/tur/en/nld/book-an-appointment',
    description: 'Schengen visa appointments only - MVV appointments via embassy email'
  },
  
  // General Information
  {
    title: 'Business.gov.nl - Highly Skilled Migrant',
    url: 'https://business.gov.nl/coming-to-the-netherlands/permits-and-visa/residence-permit-for-highly-skilled-migrant/',
    description: 'Government business portal with employer information'
  }
];

// ============================================================================
// EMBASSY/CONSULATE CONTACT INFO
// Source: https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/turkiye
// ============================================================================

export const dutchMissionsInTurkey = {
  embassy: {
    name: 'Royal Netherlands Embassy in Ankara',
    address: 'Hollanda Caddesi No:5, Yıldız, 06550 Çankaya/Ankara',
    phone: '+90 312 409 18 00',
    generalEmail: 'ank-ca@minbuza.nl',
    mvvAppointmentEmail: 'ank-inburgering@minbuza.nl',
    orangeCarpetEmail: 'ank-orange@minbuza.nl',
    website: 'https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/turkiye',
    mvvBookingNotes: 'Email ank-inburgering@minbuza.nl to schedule MVV collection appointment'
  },
  consulateGeneral: {
    name: 'Consulate General of the Netherlands in Istanbul',
    address: 'İstiklal Caddesi No:197, Beyoğlu, 34433 Istanbul',
    phone: '+90 212 393 21 21',
    generalEmail: 'ist-ca@minbuza.nl',
    mvvAppointmentEmail: 'ist-ca@minbuza.nl',
    orangeCarpetEmail: 'ist-orange@minbuza.nl',
    website: 'https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/turkiye',
    mvvBookingNotes: 'Email ist-ca@minbuza.nl to schedule MVV collection appointment'
  },
  vfsGlobal: {
    description: '⚠️ VFS Global handles ONLY Schengen (short-stay) visa applications',
    website: 'https://visa.vfsglobal.com/tur/en/nld',
    appointmentUrl: 'https://visa.vfsglobal.com/tur/en/nld/book-an-appointment',
    centers: [
      'Ankara',
      'Antalya', 
      'Bodrum',
      'Bursa',
      'Edirne',
      'Gaziantep',
      'Istanbul',
      'Izmir'
    ],
    importantNote: 'MVV (long-stay entry visa) is NOT processed through VFS Global. You must book directly with the Embassy or Consulate-General by email.'
  },
  notes: [
    'VFS Global handles Schengen (short-stay) visa applications only',
    'MVV (long-stay entry visa) is collected directly at embassy or consulate-general',
    'Make MVV appointment by email, not through VFS Global',
    'IND approval letter will specify which location (Ankara or Istanbul) to use',
    'MVV sticker preparation takes up to 10 working days',
    'Biometric data (fingerprints, photo) will be collected at appointment'
  ],
  links: [
    {
      title: 'Netherlands Worldwide - MVV in Turkey',
      url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/mvv-long-stay/apply-turkiye',
      description: 'Official instructions for MVV collection in Turkey'
    },
    {
      title: 'Netherlands Worldwide - Embassies Turkey',
      url: 'https://www.netherlandsworldwide.nl/contact/embassies-consulates-general/turkiye',
      description: 'Contact information for Dutch missions in Turkey'
    },
    {
      title: 'VFS Global Turkey (Schengen only)',
      url: 'https://visa.vfsglobal.com/tur/en/nld',
      description: 'For short-stay Schengen visa only - NOT for MVV'
    }
  ]
};

// ============================================================================
// 30% RULING (TAX BENEFIT) INFORMATION
// ============================================================================

export const thirtyPercentRuling = {
  title: '30% Ruling (Expat Tax Scheme)',
  description: 'Tax benefit allowing employers to pay up to 30% of salary tax-free as compensation for extraterritorial costs',
  eligibility: [
    'Recruited from abroad (>150km from Dutch border for 16+ months before employment)',
    'Has specific expertise scarce in the Dutch labor market',
    'Meets minimum salary threshold (lower than HSM threshold)',
    'Employment contract with Dutch employer'
  ],
  currentStatus: {
    year2025: '30% tax-free (unchanged)',
    year2026: '30% tax-free (unchanged)',
    year2027: 'Reduced to 27% tax-free'
  },
  duration: 'Maximum 5 years (60 months)',
  links: [
    {
      title: 'Government.nl - 30% Ruling',
      url: 'https://www.government.nl/topics/income-tax/shortening-30-percent-ruling',
      description: 'Official government information on the 30% ruling'
    },
    {
      title: 'Business.gov.nl - 30% Ruling Changes',
      url: 'https://business.gov.nl/amendments/30-percent-ruling-compensation-down-to-27-percent/',
      description: 'Information about upcoming changes to the ruling'
    }
  ],
  tip: 'Apply for 30% ruling together with or shortly after residence permit - it is a separate application to the Tax Authority (Belastingdienst)'
};

// ============================================================================
// OFFICIAL SOURCES
// ============================================================================

export const officialSources = [
  {
    name: 'IND - Highly Skilled Migrant',
    url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
    description: 'Main IND page for highly skilled migrant residence permit'
  },
  {
    name: 'IND - Turkish Citizens',
    url: 'https://ind.nl/en/turkish-citizens-and-living-in-the-netherlands',
    description: 'Special rules for Turkish citizens under EU-Turkey Association Agreement'
  },
  {
    name: 'IND - Required Amounts (Salary & Financial Requirements)',
    url: 'https://ind.nl/en/required-amounts-income-requirements',
    description: '2026 salary thresholds and student financial requirements'
  },
  {
    name: 'IND - Fees and Costs',
    url: 'https://ind.nl/en/fees-costs-of-an-application',
    description: 'Current application fees including reduced rates for Turkish citizens'
  },
  {
    name: 'IND - MVV (Provisional Residence Permit)',
    url: 'https://ind.nl/en/provisional-residence-permit-mvv',
    description: 'Information about MVV requirements'
  },
  {
    name: 'Netherlands Worldwide - MVV Turkey',
    url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/mvv-long-stay/apply-turkiye',
    description: 'How to collect MVV at Dutch embassy/consulate in Turkey'
  },
  {
    name: 'Netherlands Worldwide - Legalisation Turkey',
    url: 'https://www.netherlandsworldwide.nl/legalisation/foreign-documents/turkiye',
    description: 'Which Turkish documents need apostille'
  },
  {
    name: 'HCCH - Turkish Apostille Authorities',
    url: 'https://www.hcch.net/en/states/authorities/details3/?aid=350',
    description: 'Official Turkish authorities that issue apostilles'
  }
];

// ============================================================================
// EXPORT DEFAULT DATA OBJECT
// ============================================================================

export default {
  // Highly Skilled Migrant (Work Visa)
  salaryThresholds2026,
  salaryThresholds2025,
  applicationFees,
  turkishCitizenBenefits,
  visaProcess,
  processingTimes,
  commonMistakes,
  
  // Student Visa
  studentVisaRequirements,
  
  // General Information
  importantLinks,
  dutchMissionsInTurkey,
  thirtyPercentRuling,
  officialSources,
  
  // Metadata
  lastUpdated: '2026-02-07',
  mvvRequired: true,
  nationality: 'Turkish',
  destinationCountry: 'Netherlands',
  
  disclaimer: 'This information is provided for guidance only. Always verify current requirements with official IND sources (ind.nl) as immigration rules change frequently. Fee amounts and salary thresholds are updated annually - check IND website for latest figures.'
};
