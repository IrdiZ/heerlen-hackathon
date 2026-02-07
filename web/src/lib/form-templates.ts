// Form Templates for MigrantAI
// Each template defines field mappings for a specific Dutch government/service form

import { PlaceholderValue, PLACEHOLDERS } from './placeholders';

export interface FormFieldMapping {
  formFieldId: string;           // ID or name used in the actual form
  placeholder: PlaceholderValue; // Placeholder token to map to PII
  required: boolean;
  description?: string;          // Human-readable description
}

export interface FormTemplate {
  id: string;
  nameNL: string;                // Dutch name
  nameEN: string;                // English name
  description: string;           // What this form is for
  urlPatterns: string[];         // URL patterns for auto-detection (regex)
  category: 'government' | 'finance' | 'healthcare' | 'utilities';
  fields: FormFieldMapping[];
  tips: string[];                // Helpful tips for completing this form
  requiredDocuments?: string[];  // Documents needed
}

export const FORM_TEMPLATES: FormTemplate[] = [
  // ============ GEMEENTE REGISTRATION ============
  {
    id: 'gemeente-registration',
    nameNL: 'Gemeente Inschrijving',
    nameEN: 'Municipality Registration',
    description: 'Register your address with your local municipality (verplicht within 5 days of arrival)',
    urlPatterns: [
      'gemeente\\.nl.*inschrijving',
      'gemeente\\.nl.*registration',
      'gemeente\\.nl.*verhuizing',
      'mijn\\.overheid\\.nl.*brp',
      'amsterdam\\.nl.*registration',
      'rotterdam\\.nl.*registration',
      'denhaag\\.nl.*registration',
      'utrecht\\.nl.*registration',
    ],
    category: 'government',
    fields: [
      { formFieldId: 'voornaam', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'firstName', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'achternaam', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'lastName', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'geboortedatum', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'dateOfBirth', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'geboorteplaats', placeholder: PLACEHOLDERS.BIRTH_PLACE, required: true, description: 'Birth place' },
      { formFieldId: 'birthPlace', placeholder: PLACEHOLDERS.BIRTH_PLACE, required: true, description: 'Birth place' },
      { formFieldId: 'nationaliteit', placeholder: PLACEHOLDERS.NATIONALITY, required: true, description: 'Nationality' },
      { formFieldId: 'nationality', placeholder: PLACEHOLDERS.NATIONALITY, required: true, description: 'Nationality' },
      { formFieldId: 'geslacht', placeholder: PLACEHOLDERS.GENDER, required: true, description: 'Gender' },
      { formFieldId: 'gender', placeholder: PLACEHOLDERS.GENDER, required: true, description: 'Gender' },
      { formFieldId: 'straat', placeholder: PLACEHOLDERS.STREET, required: true, description: 'Street name' },
      { formFieldId: 'street', placeholder: PLACEHOLDERS.STREET, required: true, description: 'Street name' },
      { formFieldId: 'huisnummer', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'houseNumber', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'postcode', placeholder: PLACEHOLDERS.POSTCODE, required: true, description: 'Postal code' },
      { formFieldId: 'woonplaats', placeholder: PLACEHOLDERS.CITY, required: true, description: 'City' },
      { formFieldId: 'city', placeholder: PLACEHOLDERS.CITY, required: true, description: 'City' },
      { formFieldId: 'telefoon', placeholder: PLACEHOLDERS.PHONE, required: false, description: 'Phone number' },
      { formFieldId: 'phone', placeholder: PLACEHOLDERS.PHONE, required: false, description: 'Phone number' },
      { formFieldId: 'email', placeholder: PLACEHOLDERS.EMAIL, required: false, description: 'Email address' },
      { formFieldId: 'documentnummer', placeholder: PLACEHOLDERS.DOCUMENT_NUMBER, required: true, description: 'Passport/ID number' },
      { formFieldId: 'documentNumber', placeholder: PLACEHOLDERS.DOCUMENT_NUMBER, required: true, description: 'Passport/ID number' },
      { formFieldId: 'verhuisdatum', placeholder: PLACEHOLDERS.MOVE_DATE, required: true, description: 'Move-in date' },
      { formFieldId: 'moveDate', placeholder: PLACEHOLDERS.MOVE_DATE, required: true, description: 'Move-in date' },
    ],
    tips: [
      'Book an appointment at your local gemeente first - walk-ins are rarely accepted',
      'Bring your passport, rental contract, and landlord declaration (verhuurderverklaring)',
      'The move-in date should be within 5 days of your actual arrival',
      'After registration, you will receive your BSN within 1-2 weeks by post',
    ],
    requiredDocuments: [
      'Valid passport or EU ID card',
      'Rental contract (huurcontract)',
      'Landlord declaration (verhuurderverklaring) - often a specific gemeente form',
      'Proof of purpose of stay (work contract, university enrollment)',
      'Birth certificate with apostille (for some nationalities)',
    ],
  },

  // ============ DIGID APPLICATION ============
  {
    id: 'digid-application',
    nameNL: 'DigiD Aanvraag',
    nameEN: 'DigiD Application',
    description: 'Apply for DigiD - your digital ID for Dutch government services',
    urlPatterns: [
      'digid\\.nl.*aanvragen',
      'digid\\.nl.*apply',
      'digid\\.nl.*request',
      'mijn\\.digid\\.nl',
    ],
    category: 'government',
    fields: [
      { formFieldId: 'bsn', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN (Citizen Service Number)' },
      { formFieldId: 'burgerservicenummer', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN (Citizen Service Number)' },
      { formFieldId: 'geboortedatum', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'dateOfBirth', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'postcode', placeholder: PLACEHOLDERS.POSTCODE, required: true, description: 'Postal code' },
      { formFieldId: 'huisnummer', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'houseNumber', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'email', placeholder: PLACEHOLDERS.EMAIL, required: true, description: 'Email address' },
      { formFieldId: 'telefoon', placeholder: PLACEHOLDERS.PHONE, required: false, description: 'Phone number' },
      { formFieldId: 'phone', placeholder: PLACEHOLDERS.PHONE, required: false, description: 'Phone number' },
    ],
    tips: [
      'You need a BSN first - register at the gemeente before applying for DigiD',
      'Your address must match exactly what is registered at the gemeente',
      'The activation code is sent by post and takes 3-5 business days',
      'Set up 2-factor authentication (DigiD app) for higher security level',
      'Many services require "DigiD Midden" or higher - upgrade via the DigiD app',
    ],
    requiredDocuments: [
      'BSN (Burger Service Nummer) - received after gemeente registration',
      'Access to registered address (for receiving activation letter)',
      'Mobile phone for SMS verification',
    ],
  },

  // ============ BSN REQUEST ============
  {
    id: 'bsn-request',
    nameNL: 'BSN Aanvraag / RNI Inschrijving',
    nameEN: 'BSN Request / RNI Registration',
    description: 'Request a BSN without full municipality registration (for temporary stays)',
    urlPatterns: [
      'rfrni\\.nl',
      'rfrni\\.amsterdam\\.nl',
      'belastingdienst\\.nl.*bsn',
      'rfrni\\.',
    ],
    category: 'government',
    fields: [
      { formFieldId: 'voornaam', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'firstName', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'achternaam', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'lastName', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'geboortedatum', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'dateOfBirth', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'geboorteplaats', placeholder: PLACEHOLDERS.BIRTH_PLACE, required: true, description: 'Birth place' },
      { formFieldId: 'birthPlace', placeholder: PLACEHOLDERS.BIRTH_PLACE, required: true, description: 'Birth place' },
      { formFieldId: 'nationaliteit', placeholder: PLACEHOLDERS.NATIONALITY, required: true, description: 'Nationality' },
      { formFieldId: 'nationality', placeholder: PLACEHOLDERS.NATIONALITY, required: true, description: 'Nationality' },
      { formFieldId: 'geslacht', placeholder: PLACEHOLDERS.GENDER, required: true, description: 'Gender' },
      { formFieldId: 'gender', placeholder: PLACEHOLDERS.GENDER, required: true, description: 'Gender' },
      { formFieldId: 'documentnummer', placeholder: PLACEHOLDERS.DOCUMENT_NUMBER, required: true, description: 'Passport/ID number' },
      { formFieldId: 'documentNumber', placeholder: PLACEHOLDERS.DOCUMENT_NUMBER, required: true, description: 'Passport/ID number' },
      { formFieldId: 'email', placeholder: PLACEHOLDERS.EMAIL, required: true, description: 'Email address' },
      { formFieldId: 'telefoon', placeholder: PLACEHOLDERS.PHONE, required: false, description: 'Phone number' },
      { formFieldId: 'phone', placeholder: PLACEHOLDERS.PHONE, required: false, description: 'Phone number' },
    ],
    tips: [
      'RNI registration is for people who will stay less than 4 months',
      'You must make an appointment at an RNI location (19 locations in NL)',
      'Bring original documents - copies are not accepted',
      'You receive your BSN immediately at the appointment',
      'RNI registration does NOT register you at an address',
    ],
    requiredDocuments: [
      'Valid passport (EU ID card may also work)',
      'Birth certificate with apostille (for non-EU nationals)',
      'Proof of why you need a BSN (work contract, etc.)',
    ],
  },

  // ============ HEALTH INSURANCE ============
  {
    id: 'health-insurance',
    nameNL: 'Zorgverzekering Aanmelden',
    nameEN: 'Health Insurance Registration',
    description: 'Register for Dutch mandatory health insurance (zorgverzekering)',
    urlPatterns: [
      'cz\\.nl.*aanmelden',
      'zilverenkruis\\.nl.*register',
      'zilveren-kruis\\.nl',
      'vgz\\.nl.*aanmelden',
      'menzis\\.nl.*aanmelden',
      'unive\\.nl.*zorg',
      'ohra\\.nl.*zorg',
      'aegon\\.nl.*zorg',
      'anderzorg\\.nl',
      'ditzo\\.nl',
      'zorgverzekering',
    ],
    category: 'healthcare',
    fields: [
      { formFieldId: 'voornaam', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'firstName', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'voorletters', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'Initials' },
      { formFieldId: 'achternaam', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'lastName', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'geboortedatum', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'dateOfBirth', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'bsn', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN' },
      { formFieldId: 'burgerservicenummer', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN' },
      { formFieldId: 'geslacht', placeholder: PLACEHOLDERS.GENDER, required: true, description: 'Gender' },
      { formFieldId: 'gender', placeholder: PLACEHOLDERS.GENDER, required: true, description: 'Gender' },
      { formFieldId: 'straat', placeholder: PLACEHOLDERS.STREET, required: true, description: 'Street name' },
      { formFieldId: 'street', placeholder: PLACEHOLDERS.STREET, required: true, description: 'Street name' },
      { formFieldId: 'huisnummer', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'houseNumber', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'postcode', placeholder: PLACEHOLDERS.POSTCODE, required: true, description: 'Postal code' },
      { formFieldId: 'woonplaats', placeholder: PLACEHOLDERS.CITY, required: true, description: 'City' },
      { formFieldId: 'city', placeholder: PLACEHOLDERS.CITY, required: true, description: 'City' },
      { formFieldId: 'telefoon', placeholder: PLACEHOLDERS.PHONE, required: true, description: 'Phone number' },
      { formFieldId: 'phone', placeholder: PLACEHOLDERS.PHONE, required: true, description: 'Phone number' },
      { formFieldId: 'email', placeholder: PLACEHOLDERS.EMAIL, required: true, description: 'Email address' },
      { formFieldId: 'iban', placeholder: PLACEHOLDERS.IBAN, required: true, description: 'Bank account for payments' },
      { formFieldId: 'rekeningnummer', placeholder: PLACEHOLDERS.IBAN, required: true, description: 'Bank account' },
    ],
    tips: [
      'You MUST have insurance within 4 months of arriving in NL',
      'Compare prices on independer.nl or zorgwijzer.nl',
      'Basisverzekering (basic) costs ~€130-150/month in 2024',
      'Consider aanvullende verzekering for dental, physio, etc.',
      'You may be eligible for zorgtoeslag (healthcare allowance) - apply via toeslagen.nl',
      'Eigen risico (deductible) is €385/year in 2024',
    ],
    requiredDocuments: [
      'BSN (required for all Dutch health insurance)',
      'Dutch IBAN bank account',
      'Proof of residence/address',
    ],
  },

  // ============ BANK ACCOUNT ============
  {
    id: 'bank-account',
    nameNL: 'Bankrekening Openen',
    nameEN: 'Bank Account Opening',
    description: 'Open a Dutch bank account (betaalrekening)',
    urlPatterns: [
      'ing\\.nl.*rekening.*openen',
      'abnamro\\.nl.*rekening.*openen',
      'rabobank\\.nl.*rekening.*openen',
      'snsbank\\.nl.*rekening',
      'asnbank\\.nl.*rekening',
      'triodos\\.nl.*rekening',
      'bunq\\.com.*signup',
      'n26\\.com.*signup',
      'revolut\\.com.*signup',
    ],
    category: 'finance',
    fields: [
      { formFieldId: 'voornaam', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'firstName', placeholder: PLACEHOLDERS.FIRST_NAME, required: true, description: 'First name' },
      { formFieldId: 'achternaam', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'lastName', placeholder: PLACEHOLDERS.LAST_NAME, required: true, description: 'Last name' },
      { formFieldId: 'geboortedatum', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'dateOfBirth', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'geboorteplaats', placeholder: PLACEHOLDERS.BIRTH_PLACE, required: true, description: 'Birth place' },
      { formFieldId: 'birthPlace', placeholder: PLACEHOLDERS.BIRTH_PLACE, required: true, description: 'Birth place' },
      { formFieldId: 'nationaliteit', placeholder: PLACEHOLDERS.NATIONALITY, required: true, description: 'Nationality' },
      { formFieldId: 'nationality', placeholder: PLACEHOLDERS.NATIONALITY, required: true, description: 'Nationality' },
      { formFieldId: 'bsn', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN (required for Dutch banks)' },
      { formFieldId: 'burgerservicenummer', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN' },
      { formFieldId: 'straat', placeholder: PLACEHOLDERS.STREET, required: true, description: 'Street name' },
      { formFieldId: 'street', placeholder: PLACEHOLDERS.STREET, required: true, description: 'Street name' },
      { formFieldId: 'huisnummer', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'houseNumber', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'postcode', placeholder: PLACEHOLDERS.POSTCODE, required: true, description: 'Postal code' },
      { formFieldId: 'woonplaats', placeholder: PLACEHOLDERS.CITY, required: true, description: 'City' },
      { formFieldId: 'city', placeholder: PLACEHOLDERS.CITY, required: true, description: 'City' },
      { formFieldId: 'telefoon', placeholder: PLACEHOLDERS.PHONE, required: true, description: 'Phone number' },
      { formFieldId: 'phone', placeholder: PLACEHOLDERS.PHONE, required: true, description: 'Phone number' },
      { formFieldId: 'email', placeholder: PLACEHOLDERS.EMAIL, required: true, description: 'Email address' },
      { formFieldId: 'documentnummer', placeholder: PLACEHOLDERS.DOCUMENT_NUMBER, required: true, description: 'Passport/ID number' },
      { formFieldId: 'documentNumber', placeholder: PLACEHOLDERS.DOCUMENT_NUMBER, required: true, description: 'Passport/ID number' },
    ],
    tips: [
      'Traditional banks (ING, ABN AMRO, Rabobank) require BSN and Dutch address',
      'Digital banks (bunq, N26, Revolut) are often faster and easier for newcomers',
      'bunq offers accounts without BSN initially - useful while waiting',
      'Most banks are free for basic accounts, some charge ~€2-5/month',
      'You need a Dutch bank account to receive salary in NL',
      'iDEAL (Dutch payment system) works with all Dutch bank accounts',
    ],
    requiredDocuments: [
      'Valid passport or EU ID',
      'BSN (for traditional Dutch banks)',
      'Proof of address (recent utility bill or gemeente registration)',
      'Some banks require proof of income',
    ],
  },

  // ============ ZORGTOESLAG (Healthcare Allowance) ============
  {
    id: 'zorgtoeslag',
    nameNL: 'Zorgtoeslag Aanvragen',
    nameEN: 'Healthcare Allowance Application',
    description: 'Apply for healthcare cost subsidy (income-dependent)',
    urlPatterns: [
      'toeslagen\\.nl.*zorgtoeslag',
      'belastingdienst\\.nl.*zorgtoeslag',
      'mijntoeslagen\\.nl',
    ],
    category: 'government',
    fields: [
      { formFieldId: 'bsn', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN' },
      { formFieldId: 'burgerservicenummer', placeholder: PLACEHOLDERS.BSN, required: true, description: 'BSN' },
      { formFieldId: 'geboortedatum', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'dateOfBirth', placeholder: PLACEHOLDERS.DOB, required: true, description: 'Date of birth' },
      { formFieldId: 'iban', placeholder: PLACEHOLDERS.IBAN, required: true, description: 'Bank account for payments' },
      { formFieldId: 'rekeningnummer', placeholder: PLACEHOLDERS.IBAN, required: true, description: 'Bank account' },
      { formFieldId: 'postcode', placeholder: PLACEHOLDERS.POSTCODE, required: true, description: 'Postal code' },
      { formFieldId: 'huisnummer', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
      { formFieldId: 'houseNumber', placeholder: PLACEHOLDERS.HOUSE_NUMBER, required: true, description: 'House number' },
    ],
    tips: [
      'You need DigiD to apply - make sure you have it set up first',
      'Maximum income for zorgtoeslag is ~€38,000/year (2024, single)',
      'You can receive up to €154/month depending on income',
      'Apply within 3 months of starting health insurance',
      'Zorgtoeslag is paid monthly to your bank account',
      'Report changes in income - you may need to repay if income increases',
    ],
    requiredDocuments: [
      'DigiD (required for online application)',
      'BSN',
      'Dutch IBAN',
      'Proof of health insurance',
      'Income information (salary slips)',
    ],
  },
];

// ============ HELPER FUNCTIONS ============

/**
 * Detect which template matches the current URL
 */
export function detectTemplateByUrl(url: string): FormTemplate | null {
  for (const template of FORM_TEMPLATES) {
    for (const pattern of template.urlPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(url)) {
        return template;
      }
    }
  }
  return null;
}

/**
 * Get all templates in a specific category
 */
export function getTemplatesByCategory(category: FormTemplate['category']): FormTemplate[] {
  return FORM_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get unique PII fields required by a template
 */
export function getRequiredPIIFields(template: FormTemplate): string[] {
  const fields = new Set<string>();
  for (const field of template.fields) {
    if (field.required) {
      // Extract field name from placeholder, e.g., '[FIRST_NAME]' -> 'firstName'
      const match = field.placeholder.match(/\[(\w+)\]/);
      if (match) {
        const placeholderKey = match[1];
        // Convert FIRST_NAME to firstName
        const piiKey = placeholderKey.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        fields.add(piiKey);
      }
    }
  }
  return Array.from(fields);
}

/**
 * Get all unique PII fields across all templates
 */
export function getAllPIIFields(): string[] {
  const fields = new Set<string>();
  for (const template of FORM_TEMPLATES) {
    for (const field of template.fields) {
      const match = field.placeholder.match(/\[(\w+)\]/);
      if (match) {
        const placeholderKey = match[1];
        const piiKey = placeholderKey.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        fields.add(piiKey);
      }
    }
  }
  return Array.from(fields);
}

/**
 * Create a fill map from a template and form schema
 * Matches template field IDs to actual form fields
 */
export function createFillMapFromTemplate(
  template: FormTemplate,
  formFieldIds: string[]
): Record<string, PlaceholderValue> {
  const fillMap: Record<string, PlaceholderValue> = {};
  const normalizedFormFields = formFieldIds.map(id => ({ original: id, lower: id.toLowerCase() }));

  for (const templateField of template.fields) {
    const templateId = templateField.formFieldId.toLowerCase();
    
    // Find matching form field
    const match = normalizedFormFields.find(f => 
      f.lower === templateId ||
      f.lower.includes(templateId) ||
      templateId.includes(f.lower)
    );

    if (match) {
      fillMap[match.original] = templateField.placeholder;
    }
  }

  return fillMap;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find(t => t.id === id);
}

// Category labels for UI
export const CATEGORY_LABELS: Record<FormTemplate['category'], { nl: string; en: string; icon: string }> = {
  government: { nl: 'Overheid', en: 'Government', icon: '🏛️' },
  finance: { nl: 'Financiën', en: 'Finance', icon: '🏦' },
  healthcare: { nl: 'Zorg', en: 'Healthcare', icon: '🏥' },
  utilities: { nl: 'Nutsvoorzieningen', en: 'Utilities', icon: '🔌' },
};
