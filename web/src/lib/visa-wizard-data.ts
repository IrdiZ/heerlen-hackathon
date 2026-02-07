// Visa Wizard Data - Integrated with Real Research Data
// This file integrates visa data from Turkey, Serbia, and Albania

import turkeyData, { 
  salaryThresholds2026 as turkeySalaryThresholds,
  visaProcess as turkeyVisaProcess,
  dutchMissionsInTurkey,
  turkishCitizenBenefits,
  processingTimes as turkeyProcessingTimes,
  commonMistakes as turkeyCommonMistakes,
} from '@/data/visa-turkey';

import serbiaData, { 
  serbiaVisaRequirements,
} from '@/data/visa-serbia';

import albaniaData, { 
  albaniaToNetherlandsVisa,
} from '@/data/visa-albania';

// ============================================================================
// Type Definitions
// ============================================================================

export type VisaType = 
  | 'kennismigrant'
  | 'intra-company'
  | 'orientation'
  | 'eu-blue-card'
  | 'startup'
  | 'self-employed'
  | 'family-reunification'
  | 'unknown';

export type CountryCode = 'turkey' | 'serbia' | 'albania' | 'other' | '';

export interface VisaIntakeData {
  countryOfOrigin: CountryCode;
  currentLocation: 'home-country' | 'already-in-nl' | '';
  hasJobOffer: 'yes' | 'no' | '';
  sponsorRecognized: 'yes' | 'no' | 'dont-know' | '';
  salaryRange: 'below-threshold' | 'above-threshold' | 'dont-know' | '';
  age?: number;
  isRecentGraduate?: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  whereToGet: string;
  link?: string;
  tips?: string[];
  needsApostille?: boolean;
  needsTranslation?: boolean;
}

export interface VisaStep {
  id: string;
  order: number;
  title: string;
  description: string;
  whatToDo: string[];
  requiredDocuments: DocumentItem[];
  whereToSubmit: string;
  submitLink?: string;
  estimatedTime: string;
  tips: string[];
  warnings: string[];
  responsibleParty?: 'employer' | 'employee' | 'both' | 'government';
}

export interface SalaryThreshold {
  category: string;
  monthlyGross: number;
  annualGross?: number;
  notes?: string;
}

export interface EmbassyInfo {
  name: string;
  address?: string;
  city: string;
  country: string;
  email?: string;
  website?: string;
  appointmentUrl?: string;
  openingHours?: string[];
  notes?: string[];
}

export interface CommonMistake {
  title: string;
  description: string;
  prevention: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface CountryVisaData {
  country: string;
  countryCode: CountryCode;
  flag: string;
  requiresMVV: boolean;
  requiresTBTest: boolean;
  hasSpecialRules?: boolean;
  specialRulesNote?: string;
  salaryThresholds: SalaryThreshold[];
  embassy: EmbassyInfo;
  commonMistakes: CommonMistake[];
  processingTimeNote: string;
  totalEstimatedTime: string;
}

export interface VisaPathway {
  visaType: VisaType;
  title: string;
  titleNL: string;
  description: string;
  eligibilityCriteria: string[];
  totalEstimatedTime: string;
  steps: VisaStep[];
  countryData?: CountryVisaData;
}

// ============================================================================
// Country Flags
// ============================================================================

export const COUNTRY_FLAGS: Record<CountryCode, string> = {
  turkey: '🇹🇷',
  serbia: '🇷🇸',
  albania: '🇦🇱',
  other: '🌐',
  '': '',
};

// ============================================================================
// Salary Thresholds (2026 - applicable to all countries)
// ============================================================================

export const SALARY_THRESHOLDS = {
  kennismigrant: {
    under30: 4357,
    over30: 5942,
    reducedCriterion: 3122,
  },
  euBlueCard: {
    standard: 5942,
    reduced: 4754,
  },
};

// ============================================================================
// Normalize Country Data
// ============================================================================

function normalizeTurkeyData(): CountryVisaData {
  return {
    country: 'Turkey',
    countryCode: 'turkey',
    flag: '🇹🇷',
    requiresMVV: true,
    requiresTBTest: true,
    hasSpecialRules: true,
    specialRulesNote: turkishCitizenBenefits.description,
    salaryThresholds: turkeySalaryThresholds.map(t => ({
      category: t.category,
      monthlyGross: t.monthlyGross,
      notes: t.notes,
    })),
    embassy: {
      name: dutchMissionsInTurkey.embassy.name,
      address: dutchMissionsInTurkey.embassy.address,
      city: 'Ankara',
      country: 'Turkey',
      email: dutchMissionsInTurkey.embassy.generalEmail,
      website: dutchMissionsInTurkey.embassy.website,
      notes: [
        'MVV appointments: ' + dutchMissionsInTurkey.embassy.mvvAppointmentEmail,
        'Also available at Consulate Istanbul',
        ...dutchMissionsInTurkey.notes,
      ],
    },
    commonMistakes: turkeyCommonMistakes.map(m => ({
      title: m.mistake,
      description: m.consequence,
      prevention: m.prevention,
      severity: 'high' as const,
    })),
    processingTimeNote: `With recognized sponsor: ${turkeyProcessingTimes.totalProcessEstimate.withRecognizedSponsor}. Without: ${turkeyProcessingTimes.totalProcessEstimate.withoutRecognizedSponsor}`,
    totalEstimatedTime: turkeyProcessingTimes.totalProcessEstimate.withRecognizedSponsor,
  };
}

function normalizeSerbiaData(): CountryVisaData {
  return {
    country: 'Serbia',
    countryCode: 'serbia',
    flag: '🇷🇸',
    requiresMVV: serbiaVisaRequirements.requiresMVV,
    requiresTBTest: serbiaVisaRequirements.requiresTBTest,
    hasSpecialRules: false,
    salaryThresholds: serbiaVisaRequirements.salaryThresholds.map(t => ({
      category: t.category,
      monthlyGross: t.monthlyGross,
      annualGross: t.annualGross,
      notes: t.notes,
    })),
    embassy: {
      name: serbiaVisaRequirements.embassyInfo.name,
      address: serbiaVisaRequirements.embassyInfo.address,
      city: serbiaVisaRequirements.embassyInfo.city,
      country: serbiaVisaRequirements.embassyInfo.country,
      email: serbiaVisaRequirements.embassyInfo.email,
      appointmentUrl: serbiaVisaRequirements.embassyInfo.appointmentUrl,
      openingHours: serbiaVisaRequirements.embassyInfo.openingHours,
    },
    commonMistakes: serbiaVisaRequirements.pitfalls.map(p => ({
      title: p.title,
      description: p.description,
      prevention: p.prevention,
      severity: p.severity,
    })),
    processingTimeNote: 'TEV processing: 2-4 weeks with recognized sponsor',
    totalEstimatedTime: '6-10 weeks total',
  };
}

function normalizeAlbaniaData(): CountryVisaData {
  return {
    country: 'Albania',
    countryCode: 'albania',
    flag: '🇦🇱',
    requiresMVV: albaniaToNetherlandsVisa.mvvRequired,
    requiresTBTest: true,
    hasSpecialRules: false,
    salaryThresholds: albaniaToNetherlandsVisa.salaryRequirements.map(s => ({
      category: s.category,
      monthlyGross: s.monthlyGross,
      notes: s.notes,
    })),
    embassy: {
      name: albaniaToNetherlandsVisa.embassy.name,
      city: albaniaToNetherlandsVisa.embassy.city,
      country: albaniaToNetherlandsVisa.embassy.country,
      website: albaniaToNetherlandsVisa.embassy.website,
      notes: [albaniaToNetherlandsVisa.embassy.notes],
    },
    commonMistakes: albaniaToNetherlandsVisa.pitfalls.map(p => ({
      title: p.title,
      description: p.description,
      prevention: p.prevention,
      severity: 'medium' as const,
    })),
    processingTimeNote: albaniaToNetherlandsVisa.totalProcessingTime,
    totalEstimatedTime: '6-12 weeks',
  };
}

// ============================================================================
// Country Data Registry
// ============================================================================

export const COUNTRY_VISA_DATA: Record<CountryCode, CountryVisaData | null> = {
  turkey: normalizeTurkeyData(),
  serbia: normalizeSerbiaData(),
  albania: normalizeAlbaniaData(),
  other: null,
  '': null,
};

// ============================================================================
// Convert Country-Specific Steps to Wizard Steps
// ============================================================================

function convertTurkeySteps(): VisaStep[] {
  return turkeyVisaProcess.map((step, index) => ({
    id: step.id,
    order: index + 1,
    title: step.title,
    description: step.description,
    whatToDo: step.documents.map(d => `Prepare: ${d.name} - ${d.description}`),
    requiredDocuments: step.documents.map(d => ({
      id: d.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
      name: d.name,
      description: d.description,
      whereToGet: d.whereToGet,
      link: d.url,
      tips: [],
      needsApostille: d.needsApostille,
      needsTranslation: d.needsTranslation,
    })),
    whereToSubmit: step.responsibleParty === 'employer' 
      ? 'IND (submitted by employer)' 
      : step.responsibleParty === 'employee'
      ? 'You (the employee)'
      : 'Both employer and employee',
    submitLink: step.links[0]?.url,
    estimatedTime: step.timelineEstimate,
    tips: step.tips || [],
    warnings: step.warnings || [],
    responsibleParty: step.responsibleParty,
  }));
}

function convertSerbiaSteps(): VisaStep[] {
  return serbiaVisaRequirements.steps.map((step) => ({
    id: `serbia-step-${step.step}`,
    order: step.step,
    title: step.title,
    description: step.description,
    whatToDo: step.documents || [],
    requiredDocuments: (step.documents || []).map(doc => ({
      id: doc.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
      name: doc,
      description: '',
      whereToGet: 'See document requirements',
    })),
    whereToSubmit: step.responsible === 'employer' 
      ? 'IND (submitted by employer)'
      : step.responsible === 'employee'
      ? 'You (the employee)'
      : step.responsible === 'government'
      ? 'IND processes automatically'
      : 'Both parties',
    estimatedTime: step.duration,
    tips: step.notes || [],
    warnings: [],
    responsibleParty: step.responsible === 'government' ? 'employer' : step.responsible,
  }));
}

function convertAlbaniaSteps(): VisaStep[] {
  return albaniaToNetherlandsVisa.steps.map((step) => ({
    id: `albania-step-${step.step}`,
    order: step.step,
    title: step.title,
    description: step.description,
    whatToDo: step.tips || [],
    requiredDocuments: [],
    whereToSubmit: step.responsible === 'employer' 
      ? 'IND (submitted by employer)'
      : step.responsible === 'applicant'
      ? 'You (the applicant)'
      : step.responsible === 'ind'
      ? 'IND processes automatically'
      : 'Embassy',
    estimatedTime: step.duration,
    tips: step.tips || [],
    warnings: [],
    responsibleParty: step.responsible === 'applicant' ? 'employee' : step.responsible === 'ind' ? 'employer' : step.responsible as 'employer' | 'employee',
  }));
}

// ============================================================================
// Visa Pathways with Country-Specific Data
// ============================================================================

function getCountrySpecificPathway(country: CountryCode): VisaPathway {
  const countryData = COUNTRY_VISA_DATA[country];
  
  let steps: VisaStep[];
  let totalTime: string;
  
  switch (country) {
    case 'turkey':
      steps = convertTurkeySteps();
      totalTime = turkeyProcessingTimes.totalProcessEstimate.withRecognizedSponsor;
      break;
    case 'serbia':
      steps = convertSerbiaSteps();
      totalTime = '6-10 weeks';
      break;
    case 'albania':
      steps = convertAlbaniaSteps();
      totalTime = albaniaToNetherlandsVisa.totalProcessingTime;
      break;
    default:
      steps = getGenericKennismigrantSteps();
      totalTime = '6-12 weeks';
  }

  return {
    visaType: 'kennismigrant',
    title: 'Highly Skilled Migrant (Kennismigrant)',
    titleNL: 'Kennismigrant',
    description: countryData 
      ? `Work visa pathway for ${countryData.country} citizens with a job offer from a Dutch employer.`
      : 'For highly skilled workers with a job offer from a recognized sponsor in the Netherlands.',
    eligibilityCriteria: [
      'Have a job offer from an IND-recognized sponsor',
      'Meet the salary threshold for your age group',
      'Have valid passport and required documents',
      countryData?.requiresMVV ? 'Collect MVV (entry visa) at Dutch embassy' : '',
      countryData?.requiresTBTest ? 'Complete TB test within 3 months of arrival' : '',
    ].filter(Boolean),
    totalEstimatedTime: totalTime,
    steps,
    countryData: countryData || undefined,
  };
}

function getGenericKennismigrantSteps(): VisaStep[] {
  return [
    {
      id: 'generic-step-1',
      order: 1,
      title: 'Employer Submits Application',
      description: 'Your employer (sponsor) submits the residence permit application to IND.',
      whatToDo: [
        'Provide all required documents to your employer',
        'Ensure your employer is a recognized sponsor',
        'Sign employment contract',
      ],
      requiredDocuments: [
        {
          id: 'passport',
          name: 'Valid Passport',
          description: 'Passport valid for at least 6 months beyond intended stay',
          whereToGet: 'Your country\'s passport office',
          tips: ['Make sure you have at least 2 blank pages'],
        },
        {
          id: 'employment-contract',
          name: 'Employment Contract',
          description: 'Signed employment contract meeting salary requirements',
          whereToGet: 'From your employer',
        },
        {
          id: 'antecedents-certificate',
          name: 'Antecedents Certificate',
          description: 'Declaration of no criminal record',
          whereToGet: 'Filled in by you (form provided by employer)',
          link: 'https://ind.nl/en/forms/7644.pdf',
        },
      ],
      whereToSubmit: 'IND (Immigration and Naturalisation Service) - submitted by employer',
      submitLink: 'https://ind.nl/en/work/working-in-the-netherlands/highly-skilled-migrant',
      estimatedTime: '1-2 weeks processing',
      tips: [
        'Your employer handles most of the process',
        'Keep copies of all documents',
      ],
      warnings: [
        'Do not travel to NL before receiving approval',
      ],
    },
    {
      id: 'generic-step-2',
      order: 2,
      title: 'Collect MVV (Entry Visa)',
      description: 'If required, collect your MVV sticker from Dutch embassy/consulate.',
      whatToDo: [
        'Wait for IND approval notification',
        'Schedule appointment at Dutch embassy/consulate',
        'Collect MVV sticker in your passport',
      ],
      requiredDocuments: [
        {
          id: 'passport-mvv',
          name: 'Passport',
          description: 'For MVV sticker placement',
          whereToGet: 'Already in your possession',
        },
      ],
      whereToSubmit: 'Dutch Embassy or Consulate in your country',
      estimatedTime: '1-5 business days',
      tips: ['Book embassy appointment early - they fill up fast'],
      warnings: ['MVV is valid for 90 days - plan your travel accordingly'],
    },
    {
      id: 'generic-step-3',
      order: 3,
      title: 'Travel to Netherlands',
      description: 'Enter the Netherlands with your MVV.',
      whatToDo: [
        'Book your travel to Netherlands',
        'Enter within MVV validity period',
        'Bring all important documents in carry-on',
      ],
      requiredDocuments: [],
      whereToSubmit: 'Dutch Border Control',
      estimatedTime: 'Same day (entry)',
      tips: ['Keep all documents in hand luggage'],
      warnings: [],
    },
    {
      id: 'generic-step-4',
      order: 4,
      title: 'Register at Municipality',
      description: 'Register your address at the local municipality to get your BSN.',
      whatToDo: [
        'Find housing',
        'Schedule appointment at gemeente',
        'Complete registration and receive BSN',
      ],
      requiredDocuments: [
        {
          id: 'birth-certificate',
          name: 'Legalized Birth Certificate',
          description: 'Apostilled/legalized birth certificate with certified translation',
          whereToGet: 'Your country\'s civil registry',
          tips: ['Must have apostille or legalization', 'Translation must be certified'],
          needsApostille: true,
          needsTranslation: true,
        },
      ],
      whereToSubmit: 'Local Municipality (Gemeente)',
      submitLink: 'https://www.government.nl/topics/registration-basisregistratie-personen-brp',
      estimatedTime: 'Same day (appointment)',
      tips: ['Book appointment online in advance'],
      warnings: ['Must register within 5 days of finding housing'],
    },
    {
      id: 'generic-step-5',
      order: 5,
      title: 'Collect Residence Permit Card',
      description: 'Collect your physical residence permit card from IND.',
      whatToDo: [
        'Wait for IND invitation letter',
        'Schedule biometrics appointment',
        'Collect your residence permit card',
      ],
      requiredDocuments: [],
      whereToSubmit: 'IND Desk',
      submitLink: 'https://ind.nl/en/service-and-contact/ind-desks',
      estimatedTime: '2-4 weeks after arrival',
      tips: ['You can legally stay and work while waiting for the card'],
      warnings: [],
    },
  ];
}

// ============================================================================
// Visa Pathways Registry
// ============================================================================

export const VISA_PATHWAYS: Record<string, VisaPathway> = {
  'kennismigrant': getCountrySpecificPathway('other'),
  'kennismigrant-turkey': getCountrySpecificPathway('turkey'),
  'kennismigrant-serbia': getCountrySpecificPathway('serbia'),
  'kennismigrant-albania': getCountrySpecificPathway('albania'),
  'unknown': {
    visaType: 'unknown',
    title: 'Visa Eligibility Unclear',
    titleNL: 'Visum Geschiktheid Onduidelijk',
    description: 'Based on the information provided, we cannot determine which visa type you qualify for. Please consult with IND or an immigration lawyer.',
    eligibilityCriteria: [],
    totalEstimatedTime: 'Varies',
    steps: [],
  },
};

// ============================================================================
// Determine Visa Type Based on Intake Data
// ============================================================================

export function determineVisaType(intake: VisaIntakeData): VisaType {
  if (intake.hasJobOffer === 'yes') {
    if (intake.sponsorRecognized === 'yes' && intake.salaryRange === 'above-threshold') {
      return 'kennismigrant';
    }
    if (intake.sponsorRecognized === 'dont-know') {
      return 'kennismigrant';
    }
    if (intake.salaryRange === 'dont-know') {
      return 'kennismigrant';
    }
  }
  
  return 'unknown';
}

// ============================================================================
// Get Visa Pathway with Country-Specific Data
// ============================================================================

export function getVisaPathway(visaType: VisaType, country?: CountryCode): VisaPathway {
  if (visaType === 'kennismigrant' && country && country !== 'other' && country.length > 0) {
    const countryPathwayKey = `kennismigrant-${country}`;
    if (VISA_PATHWAYS[countryPathwayKey]) {
      return VISA_PATHWAYS[countryPathwayKey];
    }
  }
  
  return VISA_PATHWAYS[visaType] || VISA_PATHWAYS['unknown'];
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getSalaryThreshold(age: number, isRecentGraduate: boolean = false): number {
  if (isRecentGraduate) {
    return SALARY_THRESHOLDS.kennismigrant.reducedCriterion;
  }
  return age < 30 
    ? SALARY_THRESHOLDS.kennismigrant.under30 
    : SALARY_THRESHOLDS.kennismigrant.over30;
}

export function checkSalaryEligibility(
  monthlyGross: number, 
  age: number, 
  isRecentGraduate: boolean = false
): { eligible: boolean; threshold: number; category: string } {
  const threshold = getSalaryThreshold(age, isRecentGraduate);
  const category = isRecentGraduate 
    ? 'Reduced criterion (recent graduates)'
    : age < 30 
    ? 'Under 30 years'
    : '30 years and older';
  
  return {
    eligible: monthlyGross >= threshold,
    threshold,
    category,
  };
}

export function getCountryData(country: CountryCode): CountryVisaData | null {
  return COUNTRY_VISA_DATA[country] || null;
}

// ============================================================================
// Form Options
// ============================================================================

export const COUNTRY_OPTIONS = [
  { value: 'turkey' as CountryCode, label: 'Turkey', labelNL: 'Turkije', flag: '🇹🇷' },
  { value: 'serbia' as CountryCode, label: 'Serbia', labelNL: 'Servië', flag: '🇷🇸' },
  { value: 'albania' as CountryCode, label: 'Albania', labelNL: 'Albanië', flag: '🇦🇱' },
  { value: 'other' as CountryCode, label: 'Other', labelNL: 'Anders', flag: '🌐' },
];

export const LOCATION_OPTIONS = [
  { value: 'home-country' as const, label: 'In my home country', labelNL: 'In mijn thuisland' },
  { value: 'already-in-nl' as const, label: 'Already in the Netherlands', labelNL: 'Al in Nederland' },
];
