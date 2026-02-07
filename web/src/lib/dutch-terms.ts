// Common Dutch bureaucratic terms and their explanations
// Helps users understand Dutch terminology

export interface DutchTerm {
  term: string;
  translation: string;
  explanation: string;
  context: string;
  example?: string;
}

export const DUTCH_TERMS: DutchTerm[] = [
  {
    term: 'Gemeente',
    translation: 'Municipality',
    explanation: 'The local government office where you register your address and handle many official matters.',
    context: 'You need to visit the gemeente within 5 days of arriving in the Netherlands.',
  },
  {
    term: 'BSN',
    translation: 'Citizen Service Number',
    explanation: 'Your unique personal identification number used for all government services, healthcare, and banking.',
    context: 'Burgerservicenummer - you get this when you register at the gemeente.',
  },
  {
    term: 'DigiD',
    translation: 'Digital Identity',
    explanation: 'Your online login for Dutch government services. Required for taxes, healthcare claims, and more.',
    context: 'Apply at digid.nl after getting your BSN. Activation takes about a week.',
  },
  {
    term: 'Belastingdienst',
    translation: 'Tax Authority',
    explanation: 'The Dutch tax office. Handles income tax, VAT, and tax benefits.',
    context: 'You\'ll need to file taxes annually if you work in the Netherlands.',
  },
  {
    term: 'IND',
    translation: 'Immigration and Naturalisation Service',
    explanation: 'The government agency handling visas, residence permits, and citizenship.',
    context: 'Non-EU citizens need IND approval for residence and work permits.',
  },
  {
    term: 'Zorgverzekering',
    translation: 'Health Insurance',
    explanation: 'Mandatory basic health insurance that everyone in the Netherlands must have.',
    context: 'You must arrange this within 4 months of arrival or starting work.',
  },
  {
    term: 'Huurtoeslag',
    translation: 'Rent Allowance',
    explanation: 'Government subsidy for rent if you have a low income and meet certain conditions.',
    context: 'Applied for through the Belastingdienst with your DigiD.',
  },
  {
    term: 'Zorgtoeslag',
    translation: 'Healthcare Allowance',
    explanation: 'Government subsidy to help pay for health insurance if you have a low income.',
    context: 'Can significantly reduce your monthly insurance costs.',
  },
  {
    term: 'Verblijfsvergunning',
    translation: 'Residence Permit',
    explanation: 'Official permission to live in the Netherlands for non-EU citizens.',
    context: 'Different types exist for work, study, family, and asylum.',
  },
  {
    term: 'Werkvergunning',
    translation: 'Work Permit',
    explanation: 'Permission to work in the Netherlands, required for some non-EU citizens.',
    context: 'Often combined with residence permit or handled by employer.',
  },
  {
    term: 'Rijbewijs',
    translation: 'Driving License',
    explanation: 'Dutch driving license. Some foreign licenses can be exchanged, others require a new test.',
    context: 'EU licenses are valid. Some countries have exchange agreements.',
  },
  {
    term: 'OV-chipkaart',
    translation: 'Public Transport Card',
    explanation: 'The electronic card used for all public transport in the Netherlands.',
    context: 'Get one at train stations or online. Can be anonymous or personal.',
  },
  {
    term: 'Inschrijving',
    translation: 'Registration',
    explanation: 'The process of officially registering yourself at the gemeente.',
    context: 'First step when arriving in the Netherlands.',
  },
  {
    term: 'Uittreksel',
    translation: 'Extract/Certificate',
    explanation: 'An official document from the BRP (population register) proving your registration.',
    context: 'Sometimes needed for official purposes like bank accounts.',
  },
  {
    term: 'Apostille',
    translation: 'Apostille',
    explanation: 'An international certification that authenticates documents for use in another country.',
    context: 'Some foreign documents need an apostille to be valid in NL.',
  },
];

export function searchTerms(query: string): DutchTerm[] {
  const lowerQuery = query.toLowerCase();
  return DUTCH_TERMS.filter(term =>
    term.term.toLowerCase().includes(lowerQuery) ||
    term.translation.toLowerCase().includes(lowerQuery) ||
    term.explanation.toLowerCase().includes(lowerQuery)
  );
}

export function getTermByName(name: string): DutchTerm | undefined {
  return DUTCH_TERMS.find(t => 
    t.term.toLowerCase() === name.toLowerCase()
  );
}
