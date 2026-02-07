// Document requirements per immigration step
// Each document has a unique ID, name, and status tracking

export type DocumentStatus = 'obtained' | 'pending' | 'not-needed';

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  tips?: string[];
  whereToGet?: string;
}

export interface StepDocuments {
  stepId: string;
  stepName: string;
  documents: RequiredDocument[];
}

export const STEP_DOCUMENTS: StepDocuments[] = [
  {
    stepId: 'gemeente-registration',
    stepName: 'Gemeente Registration',
    documents: [
      {
        id: 'passport',
        name: 'Valid Passport or ID',
        description: 'Original passport with at least 6 months validity',
        tips: ['Bring both original and copies', 'Check expiry date'],
        whereToGet: 'Your home country embassy for renewal',
      },
      {
        id: 'birth-certificate',
        name: 'Birth Certificate (Apostilled)',
        description: 'Original birth certificate with apostille or legalization',
        tips: [
          'Must be apostilled if from Hague Convention country',
          'May need translation to Dutch/English',
        ],
        whereToGet: 'Home country civil registry + apostille from relevant authority',
      },
      {
        id: 'rental-contract',
        name: 'Rental Contract / Proof of Address',
        description: 'Signed rental agreement or landlord declaration',
        tips: [
          'Must show your name and address',
          'Some gemeentes accept hotel booking temporarily',
        ],
        whereToGet: 'Your landlord or housing provider',
      },
      {
        id: 'marriage-certificate',
        name: 'Marriage Certificate (if applicable)',
        description: 'Apostilled marriage certificate for married couples',
        tips: ['Only needed if registering with spouse', 'Must be apostilled'],
        whereToGet: 'Home country civil registry',
      },
      {
        id: 'work-permit',
        name: 'Work/Residence Permit',
        description: 'Valid work permit or residence permit for the Netherlands',
        tips: ['Check if your employer arranged this', 'Keep a copy on your phone'],
        whereToGet: 'IND (Immigration and Naturalization Service)',
      },
    ],
  },
  {
    stepId: 'bsn-number',
    stepName: 'BSN Number',
    documents: [
      {
        id: 'gemeente-confirmation',
        name: 'Gemeente Registration Confirmation',
        description: 'The letter you receive after gemeente registration with your BSN',
        tips: [
          'Your BSN is printed on this letter',
          'Store it safely - you need this number for everything',
        ],
        whereToGet: 'Automatically provided at gemeente registration',
      },
      {
        id: 'passport-bsn',
        name: 'Valid Passport or ID',
        description: 'Same ID used for gemeente registration',
        tips: ['Keep original and copies handy'],
        whereToGet: 'Already obtained',
      },
    ],
  },
  {
    stepId: 'bank-account',
    stepName: 'Dutch Bank Account',
    documents: [
      {
        id: 'passport-bank',
        name: 'Valid Passport or ID',
        description: 'Original identification document',
        tips: ['Must match your gemeente registration'],
        whereToGet: 'Already obtained',
      },
      {
        id: 'bsn-proof',
        name: 'BSN Number',
        description: 'Your citizen service number from gemeente registration',
        tips: ['Memorize it or keep a photo', 'Banks verify this with the government'],
        whereToGet: 'From gemeente registration letter',
      },
      {
        id: 'proof-of-address-bank',
        name: 'Proof of Address',
        description: 'Gemeente registration extract or utility bill',
        tips: ['Some banks accept the gemeente registration letter'],
        whereToGet: 'Gemeente office or uittreksel request',
      },
      {
        id: 'employment-contract',
        name: 'Employment Contract',
        description: 'Proof of income (helpful but not always required)',
        tips: ['Makes account opening easier', 'Some banks require this'],
        whereToGet: 'Your employer',
      },
    ],
  },
  {
    stepId: 'health-insurance',
    stepName: 'Health Insurance (Zorgverzekering)',
    documents: [
      {
        id: 'bsn-insurance',
        name: 'BSN Number',
        description: 'Required for all health insurance applications',
        tips: ['Insurance is mandatory within 4 months of registration'],
        whereToGet: 'From gemeente registration',
      },
      {
        id: 'dutch-bank-iban',
        name: 'Dutch Bank Account (IBAN)',
        description: 'For monthly premium payments',
        tips: ['Direct debit is standard', 'Some accept foreign IBAN temporarily'],
        whereToGet: 'Your Dutch bank',
      },
      {
        id: 'residence-proof-insurance',
        name: 'Proof of Residence',
        description: 'Confirmation that you live in the Netherlands',
        tips: ['Gemeente registration letter works'],
        whereToGet: 'Gemeente office',
      },
    ],
  },
  {
    stepId: 'digid',
    stepName: 'DigiD Activation',
    documents: [
      {
        id: 'bsn-digid',
        name: 'BSN Number',
        description: 'Required to create DigiD account',
        tips: ['Enter exactly as shown on gemeente letter'],
        whereToGet: 'From gemeente registration',
      },
      {
        id: 'dutch-phone',
        name: 'Dutch Mobile Phone Number',
        description: 'For SMS verification codes',
        tips: ['Must be able to receive SMS', 'Can use prepaid SIM'],
        whereToGet: 'Any Dutch telecom provider (KPN, Vodafone, T-Mobile)',
      },
      {
        id: 'address-access',
        name: 'Access to Registered Address',
        description: 'Activation letter comes by postal mail to your registered address',
        tips: ['Check your mailbox regularly', 'Letter arrives in 3-5 business days'],
        whereToGet: 'Delivered to your registered address',
      },
    ],
  },
  {
    stepId: 'tax-registration',
    stepName: 'Tax Registration (Belastingdienst)',
    documents: [
      {
        id: 'bsn-tax',
        name: 'BSN Number',
        description: 'Central identifier for Dutch tax system',
        tips: ['Your employer uses this for payroll tax'],
        whereToGet: 'From gemeente registration',
      },
      {
        id: 'employment-contract-tax',
        name: 'Employment Contract',
        description: 'Proof of employment for tax registration',
        tips: ['Shows your salary and tax deductions'],
        whereToGet: 'Your employer',
      },
      {
        id: 'digid-tax',
        name: 'DigiD',
        description: 'For accessing online tax portal (Mijn Belastingdienst)',
        tips: ['Needed for filing annual returns', 'Apply for zorgtoeslag/huurtoeslag'],
        whereToGet: 'digid.nl',
      },
      {
        id: 'previous-tax-docs',
        name: 'Previous Tax Documents',
        description: 'Tax records from home country (if applicable)',
        tips: ['May be needed for 30% ruling application'],
        whereToGet: 'Your previous country tax authority',
      },
    ],
  },
];

// Get all unique documents (deduplicated by ID)
export const getAllDocuments = (): RequiredDocument[] => {
  const seen = new Set<string>();
  const docs: RequiredDocument[] = [];
  
  for (const step of STEP_DOCUMENTS) {
    for (const doc of step.documents) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        docs.push(doc);
      }
    }
  }
  
  return docs;
};

// Get documents for a specific step
export const getDocumentsForStep = (stepId: string): RequiredDocument[] => {
  const step = STEP_DOCUMENTS.find(s => s.stepId === stepId);
  return step?.documents || [];
};

// Get which steps require a specific document
export const getStepsRequiringDocument = (docId: string): string[] => {
  return STEP_DOCUMENTS
    .filter(step => step.documents.some(d => d.id === docId))
    .map(step => step.stepId);
};
