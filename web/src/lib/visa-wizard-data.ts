// Visa Wizard Data Types and Placeholder Data
// This structure will be populated with real research data later

export type VisaType = 
  | 'kennismigrant'        // Highly Skilled Migrant
  | 'intra-company'        // Intra-Company Transfer
  | 'orientation'          // Orientation Year (Zoekjaar)
  | 'eu-blue-card'         // EU Blue Card
  | 'startup'              // Startup Visa
  | 'self-employed'        // Self-Employed
  | 'family-reunification' // Family Reunification
  | 'unknown';             // Can't determine eligibility

export interface VisaIntakeData {
  countryOfOrigin: 'turkey' | 'serbia' | 'albania' | 'other' | '';
  currentLocation: 'home-country' | 'already-in-nl' | '';
  hasJobOffer: 'yes' | 'no' | '';
  sponsorRecognized: 'yes' | 'no' | 'dont-know' | '';
  salaryRange: 'below-threshold' | 'above-threshold' | 'dont-know' | '';
}

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  whereToGet: string;
  link?: string;
  tips?: string[];
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
}

export interface VisaPathway {
  visaType: VisaType;
  title: string;
  titleNL: string;
  description: string;
  eligibilityCriteria: string[];
  totalEstimatedTime: string;
  steps: VisaStep[];
}

// Salary thresholds for 2024 (placeholder - update with real data)
export const SALARY_THRESHOLDS = {
  kennismigrant: {
    under30: 3549,   // Monthly gross salary
    over30: 4840,
    phd: 2801,       // For reduced skilled migrant scheme
  },
  euBlueCard: 5867,  // Monthly gross salary
};

// Placeholder visa pathways - to be filled with real research data
export const VISA_PATHWAYS: Record<string, VisaPathway> = {
  'kennismigrant': {
    visaType: 'kennismigrant',
    title: 'Highly Skilled Migrant (Kennismigrant)',
    titleNL: 'Kennismigrant',
    description: 'For highly skilled workers with a job offer from a recognized sponsor in the Netherlands.',
    eligibilityCriteria: [
      'Have a job offer from an IND-recognized sponsor',
      'Meet the salary threshold for your age group',
      'Have valid passport and documents',
    ],
    totalEstimatedTime: '2-4 weeks (fast track)',
    steps: [
      {
        id: 'km-step-1',
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
          {
            id: 'tb-certificate',
            name: 'TB Certificate (if applicable)',
            description: 'Tuberculosis test certificate for certain nationalities',
            whereToGet: 'Designated clinic in your country or NL',
            link: 'https://www.government.nl/topics/tuberculosis-tb/tuberculosis-tb-test-for-immigrants',
          },
        ],
        whereToSubmit: 'IND (Immigration and Naturalisation Service) - submitted by employer',
        submitLink: 'https://ind.nl/en/work/working-in-the-netherlands/highly-skilled-migrant',
        estimatedTime: '1-2 weeks processing',
        tips: [
          'Your employer handles most of the process',
          'Keep copies of all documents',
          'The process is faster than standard visa applications',
        ],
        warnings: [
          'Do not travel to NL before receiving approval',
          'Ensure all documents are translated to Dutch or English by certified translator',
        ],
      },
      {
        id: 'km-step-2',
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
          {
            id: 'approval-letter',
            name: 'IND Approval Letter',
            description: 'Notification of positive decision',
            whereToGet: 'Sent by IND to your employer',
          },
        ],
        whereToSubmit: 'Dutch Embassy or Consulate in your country',
        submitLink: 'https://www.netherlandsandyou.nl/travel-and-residence/visas-for-the-netherlands',
        estimatedTime: '1-5 business days',
        tips: [
          'Some nationalities don\'t need MVV (EU, US, Japan, etc.)',
          'Book embassy appointment early - they fill up fast',
        ],
        warnings: [
          'MVV is valid for 90 days - plan your travel accordingly',
        ],
      },
      {
        id: 'km-step-3',
        order: 3,
        title: 'Travel to Netherlands',
        description: 'Enter the Netherlands with your MVV.',
        whatToDo: [
          'Book your travel to Netherlands',
          'Enter within MVV validity period',
          'Bring all important documents in carry-on',
        ],
        requiredDocuments: [
          {
            id: 'passport-travel',
            name: 'Passport with MVV',
            description: 'Your passport containing MVV sticker',
            whereToGet: 'From embassy collection',
          },
          {
            id: 'approval-copy',
            name: 'Copy of IND Approval',
            description: 'For border control if needed',
            whereToGet: 'Received earlier',
          },
        ],
        whereToSubmit: 'Dutch Border Control (Schiphol Airport or other entry point)',
        estimatedTime: 'Same day (entry)',
        tips: [
          'Keep all documents in hand luggage',
          'Have your employer\'s contact details ready',
        ],
        warnings: [
          'Don\'t put important documents in checked luggage',
        ],
      },
      {
        id: 'km-step-4',
        order: 4,
        title: 'Register at Municipality (Gemeente)',
        description: 'Register your address at the local municipality to get your BSN.',
        whatToDo: [
          'Find housing (temporary is okay for initial registration)',
          'Schedule appointment at gemeente',
          'Complete registration and receive BSN',
        ],
        requiredDocuments: [
          {
            id: 'passport-reg',
            name: 'Passport',
            description: 'For identity verification',
            whereToGet: 'Already in your possession',
          },
          {
            id: 'rental-contract',
            name: 'Rental Contract or Address Proof',
            description: 'Proof of where you are staying',
            whereToGet: 'From your landlord/housing provider',
          },
          {
            id: 'birth-certificate',
            name: 'Legalized Birth Certificate',
            description: 'Apostilled/legalized birth certificate with certified translation',
            whereToGet: 'Your country\'s civil registry',
            tips: ['Must have apostille or legalization', 'Translation must be certified'],
          },
        ],
        whereToSubmit: 'Local Municipality (Gemeente)',
        submitLink: 'https://www.government.nl/topics/registration-basisregistratie-personen-brp',
        estimatedTime: 'Same day (appointment), BSN received immediately',
        tips: [
          'Book appointment online in advance',
          'Some cities have long wait times for appointments',
          'You can register at a temporary address first',
        ],
        warnings: [
          'Must register within 5 days of finding housing',
          'Without BSN you cannot open bank account or start work officially',
        ],
      },
      {
        id: 'km-step-5',
        order: 5,
        title: 'Collect Residence Permit Card',
        description: 'Collect your physical residence permit card from IND.',
        whatToDo: [
          'Wait for IND invitation letter',
          'Schedule biometrics appointment if not done',
          'Collect your residence permit card',
        ],
        requiredDocuments: [
          {
            id: 'passport-collect',
            name: 'Passport',
            description: 'For identity verification',
            whereToGet: 'Already in your possession',
          },
          {
            id: 'ind-letter',
            name: 'IND Invitation Letter',
            description: 'Letter stating your permit is ready',
            whereToGet: 'Sent by IND to your address',
          },
        ],
        whereToSubmit: 'IND Desk (at designated location)',
        submitLink: 'https://ind.nl/en/service-and-contact/ind-desks',
        estimatedTime: '2-4 weeks after arrival (for card production)',
        tips: [
          'You can legally stay and work while waiting for the card',
          'The card is proof of your legal residence',
        ],
        warnings: [
          'Keep your passport safe - you need it to collect the card',
        ],
      },
    ],
  },
  // More visa types will be added with research data
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

// Function to determine visa type based on intake data
export function determineVisaType(intake: VisaIntakeData): VisaType {
  // Basic logic - will be enhanced with more research data
  if (intake.hasJobOffer === 'yes') {
    if (intake.sponsorRecognized === 'yes' && intake.salaryRange === 'above-threshold') {
      return 'kennismigrant';
    }
    if (intake.sponsorRecognized === 'dont-know') {
      // Could still be kennismigrant, need more info
      return 'kennismigrant';
    }
  }
  
  // TODO: Add more visa type logic based on research
  // - Family reunification
  // - EU Blue Card
  // - Startup visa
  // - Self-employed
  
  return 'unknown';
}

// Get the visa pathway data
export function getVisaPathway(visaType: VisaType): VisaPathway {
  return VISA_PATHWAYS[visaType] || VISA_PATHWAYS['unknown'];
}

// Country options for the intake form
export const COUNTRY_OPTIONS = [
  { value: 'turkey', label: 'Turkey', labelNL: 'Turkije' },
  { value: 'serbia', label: 'Serbia', labelNL: 'Servië' },
  { value: 'albania', label: 'Albania', labelNL: 'Albanië' },
  { value: 'other', label: 'Other', labelNL: 'Anders' },
];

// Location options
export const LOCATION_OPTIONS = [
  { value: 'home-country', label: 'In my home country', labelNL: 'In mijn thuisland' },
  { value: 'already-in-nl', label: 'Already in the Netherlands', labelNL: 'Al in Nederland' },
];
