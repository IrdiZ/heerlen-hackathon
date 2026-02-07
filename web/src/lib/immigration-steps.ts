// Immigration step definitions for Netherlands newcomers

export type StepStatus = 'pending' | 'in-progress' | 'complete';

export interface ImmigrationStep {
  id: string;
  title: string;
  description: string;
  requiredDocuments: string[];
  estimatedTime: string;
  tips: string[];
  commonMistakes: string[];
  order: number;
}

export const IMMIGRATION_STEPS: ImmigrationStep[] = [
  {
    id: 'gemeente-registration',
    title: 'Gemeente Registration',
    description:
      'Register at your local municipality (gemeente) within 5 days of arrival. This is your first and most important step - everything else depends on it.',
    requiredDocuments: [
      'Valid passport or ID',
      'Birth certificate (apostilled/legalized)',
      'Rental contract or proof of address',
      'Marriage certificate (if applicable)',
      'Work permit or residence permit',
    ],
    estimatedTime: '1-2 weeks for appointment + same day processing',
    tips: [
      'Book your appointment online ASAP - slots fill up fast',
      'Bring original documents + copies',
      'Heerlen gemeente: https://www.heerlen.nl',
      'Some gemeentes accept walk-ins early morning',
    ],
    commonMistakes: [
      'Waiting too long to register (5-day rule!)',
      'Forgetting apostille on birth certificate',
      'Not bringing original documents',
      'Wrong type of proof of address',
    ],
    order: 1,
  },
  {
    id: 'bsn-number',
    title: 'BSN Number',
    description:
      'Your Burgerservicenummer (BSN) is your citizen service number. You get it automatically after gemeente registration - it\'s on your registration confirmation letter.',
    requiredDocuments: [
      'Gemeente registration confirmation',
      'Valid passport or ID',
    ],
    estimatedTime: 'Received immediately at gemeente registration',
    tips: [
      'Your BSN is on your registration letter - save it!',
      'Memorize it - you\'ll need it for everything',
      'Keep a photo of it on your phone',
      'Never share your BSN publicly',
    ],
    commonMistakes: [
      'Losing the registration letter with BSN',
      'Confusing BSN with other numbers',
      'Sharing BSN on social media or unsecured channels',
    ],
    order: 2,
  },
  {
    id: 'bank-account',
    title: 'Dutch Bank Account',
    description:
      'Open a Dutch bank account to receive salary, pay rent, and handle daily transactions. Most landlords and employers require a Dutch IBAN.',
    requiredDocuments: [
      'Valid passport or ID',
      'BSN number',
      'Proof of address (gemeente registration)',
      'Employment contract (helpful but not always required)',
    ],
    estimatedTime: '1-2 weeks for card delivery',
    tips: [
      'ING, ABN AMRO, Rabobank are the big three',
      'bunq and N26 are faster (fully digital)',
      'ING has good English support',
      'Some banks offer appointments in English',
    ],
    commonMistakes: [
      'Trying to open account before having BSN',
      'Not bringing all required documents',
      'Expecting instant card - it takes 1-2 weeks',
      'Forgetting to activate the card when it arrives',
    ],
    order: 3,
  },
  {
    id: 'health-insurance',
    title: 'Health Insurance (Zorgverzekering)',
    description:
      'Dutch health insurance is MANDATORY. You must get basic insurance (basisverzekering) within 4 months of registration. The government may fine you if you don\'t.',
    requiredDocuments: [
      'BSN number',
      'Dutch bank account (for payments)',
      'Proof of residence',
    ],
    estimatedTime: '15-30 minutes online, coverage starts immediately',
    tips: [
      'Compare on Independer.nl or Zorgwijzer.nl',
      'Basic package is ~€130-150/month in 2024',
      'Consider aanvullende verzekering for dental/physio',
      'Zorgtoeslag (healthcare allowance) if income is low',
      'Popular providers: CZ, VGZ, Zilveren Kruis, Menzis',
    ],
    commonMistakes: [
      'Waiting more than 4 months (€400+ fine!)',
      'Not applying for zorgtoeslag subsidy',
      'Choosing based on price alone without checking coverage',
      'Forgetting to cancel coverage from home country',
    ],
    order: 4,
  },
  {
    id: 'digid',
    title: 'DigiD Activation',
    description:
      'DigiD is your digital identity for Dutch government services. You\'ll need it for taxes, healthcare claims, and many official procedures.',
    requiredDocuments: [
      'BSN number',
      'Dutch mobile phone number',
      'Access to your registered address (for activation letter)',
    ],
    estimatedTime: '3-5 business days for activation letter',
    tips: [
      'Apply at digid.nl/aanvragen',
      'Activation code comes by postal mail',
      'Download DigiD app for easier login',
      'Enable SMS verification for extra security',
    ],
    commonMistakes: [
      'Throwing away the activation letter by accident',
      'Using wrong BSN during application',
      'Not setting up the DigiD app',
      'Forgetting password (recovery is slow)',
    ],
    order: 5,
  },
  {
    id: 'tax-registration',
    title: 'Tax Registration (Belastingdienst)',
    description:
      'If you\'re working, you need to be registered with the Dutch Tax Authority. Your employer handles most of this, but you should understand the basics.',
    requiredDocuments: [
      'BSN number',
      'Employment contract',
      'DigiD (for online portal access)',
      'Previous year tax documents (if applicable)',
    ],
    estimatedTime: 'Automatic via employer, or 2-4 weeks if registering yourself',
    tips: [
      'Your employer deducts taxes automatically (loonheffing)',
      'File annual tax return by May 1st',
      'Use the 30% ruling if eligible (tax benefit for skilled migrants)',
      'Toeslagen portal for allowances (rent, healthcare, childcare)',
    ],
    commonMistakes: [
      'Not checking if you qualify for 30% ruling',
      'Missing tax return deadline (May 1st)',
      'Not claiming eligible deductions',
      'Ignoring letters from Belastingdienst',
    ],
    order: 6,
  },
  {
    id: 'zorgtoeslag',
    title: 'Zorgtoeslag (Healthcare Allowance)',
    description:
      'Zorgtoeslag is a monthly healthcare subsidy from the government to help cover the cost of your basic health insurance. If your income is below certain thresholds, you may qualify.',
    requiredDocuments: [
      'DigiD (required for online application)',
      'BSN number',
      'Dutch bank account (IBAN)',
      'Proof of income (salary slips)',
      'Health insurance policy number',
    ],
    estimatedTime: '15 minutes online, 4-6 weeks for first payment',
    tips: [
      'Apply via toeslagen.nl using DigiD',
      'Maximum income ~€38,000/year for singles (2024)',
      'Can get up to ~€150/month back',
      'Apply within 3 months to get backdated payments',
      'Update if your income or situation changes',
    ],
    commonMistakes: [
      'Not applying because you didn\'t know it exists',
      'Missing the 3-month backdating window',
      'Forgetting to update when income changes (leads to repayment!)',
      'Not having DigiD activated first',
    ],
    order: 7,
  },
];

export const getStepById = (id: string): ImmigrationStep | undefined => {
  return IMMIGRATION_STEPS.find(step => step.id === id);
};

export const getStepsByOrder = (): ImmigrationStep[] => {
  return [...IMMIGRATION_STEPS].sort((a, b) => a.order - b.order);
};
