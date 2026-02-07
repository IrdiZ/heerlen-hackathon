// Frequently asked questions about Dutch immigration
// Used for quick answers and SEO

export interface FAQ {
  id: string;
  question: string;
  questionNL: string;
  answer: string;
  category: 'registration' | 'documents' | 'banking' | 'healthcare' | 'work' | 'housing';
  keywords: string[];
}

export const FAQ_DATA: FAQ[] = [
  {
    id: 'bsn-what',
    question: 'What is a BSN number?',
    questionNL: 'Wat is een BSN-nummer?',
    answer: 'The BSN (Burgerservicenummer) is your Dutch citizen service number. It\'s a unique personal identification number used for all government services, healthcare, banking, and employment. You receive it automatically when you register at the gemeente.',
    category: 'documents',
    keywords: ['bsn', 'burgerservicenummer', 'citizen number', 'identification'],
  },
  {
    id: 'gemeente-register',
    question: 'How do I register at the gemeente?',
    questionNL: 'Hoe registreer ik me bij de gemeente?',
    answer: 'Book an appointment at your local gemeente (municipality) within 5 days of arriving. Bring your passport, birth certificate, rental contract or proof of address, and any relevant family documents. After registration, you\'ll receive your BSN.',
    category: 'registration',
    keywords: ['gemeente', 'municipality', 'register', 'address', 'inschrijven'],
  },
  {
    id: 'digid-what',
    question: 'What is DigiD and do I need it?',
    questionNL: 'Wat is DigiD en heb ik het nodig?',
    answer: 'DigiD is the Dutch digital identity system used to access government services online. You\'ll need it for taxes, healthcare declarations, and many official processes. Apply at digid.nl after getting your BSN - activation takes about a week.',
    category: 'documents',
    keywords: ['digid', 'digital identity', 'login', 'government'],
  },
  {
    id: 'health-insurance',
    question: 'Is health insurance mandatory in the Netherlands?',
    questionNL: 'Is zorgverzekering verplicht in Nederland?',
    answer: 'Yes, basic health insurance (basisverzekering) is mandatory for everyone living or working in the Netherlands. You must arrange it within 4 months of arrival. Prices are around €120-150/month. Popular insurers include CZ, Zilveren Kruis, and VGZ.',
    category: 'healthcare',
    keywords: ['health insurance', 'zorgverzekering', 'healthcare', 'mandatory'],
  },
  {
    id: 'bank-account',
    question: 'How do I open a Dutch bank account?',
    questionNL: 'Hoe open ik een Nederlandse bankrekening?',
    answer: 'Most banks require a BSN, valid ID, and proof of address. ING, ABN AMRO, and Rabobank are the big three. Bunq and N26 are digital alternatives that may have easier requirements for newcomers. Expect the process to take 1-2 weeks.',
    category: 'banking',
    keywords: ['bank', 'account', 'bankrekening', 'ING', 'ABN', 'Rabobank'],
  },
  {
    id: 'work-permit',
    question: 'Do I need a work permit?',
    questionNL: 'Heb ik een werkvergunning nodig?',
    answer: 'EU/EEA citizens can work freely. Non-EU citizens typically need a work permit (TWV) or residence permit that allows work. Highly skilled migrants and certain categories have special schemes. Check with IND for your specific situation.',
    category: 'work',
    keywords: ['work permit', 'TWV', 'employment', 'werkvergunning', 'IND'],
  },
  {
    id: 'housing-registration',
    question: 'Can I register at a temporary address?',
    questionNL: 'Kan ik me op een tijdelijk adres inschrijven?',
    answer: 'Yes, but the main tenant must give permission. Some landlords don\'t allow registration (especially in room rentals). Without registration, you can\'t get a BSN. Make sure your housing contract allows registration before signing.',
    category: 'housing',
    keywords: ['registration', 'address', 'temporary', 'rental', 'inschrijven'],
  },
  {
    id: '30-ruling',
    question: 'What is the 30% ruling?',
    questionNL: 'Wat is de 30%-regeling?',
    answer: 'A tax benefit for highly skilled migrants recruited from abroad. 30% of your salary can be paid tax-free for up to 5 years. You must meet specific criteria: recruited from abroad, have specific expertise, and salary thresholds. Your employer must apply.',
    category: 'work',
    keywords: ['30% ruling', 'tax', 'expat', 'skilled migrant', 'belasting'],
  },
];

export const FAQ_CATEGORIES = {
  registration: { label: 'Registration', emoji: '📋' },
  documents: { label: 'Documents & ID', emoji: '🪪' },
  banking: { label: 'Banking', emoji: '🏦' },
  healthcare: { label: 'Healthcare', emoji: '🏥' },
  work: { label: 'Work & Taxes', emoji: '💼' },
  housing: { label: 'Housing', emoji: '🏠' },
};

export function searchFAQs(query: string): FAQ[] {
  const lowerQuery = query.toLowerCase();
  return FAQ_DATA.filter(faq => 
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery) ||
    faq.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
}
