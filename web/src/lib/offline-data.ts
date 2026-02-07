// Essential immigration data cached for offline access

export interface OfflineStep {
  id: string;
  title: string;
  description: string;
  documents: string[];
  timeline: string;
  tips: string[];
}

export interface OfflineFAQ {
  question: string;
  answer: string;
  category: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
}

export interface OfflineData {
  steps: OfflineStep[];
  faqs: OfflineFAQ[];
  emergencyContacts: EmergencyContact[];
  lastUpdated: string;
}

// Essential immigration steps for the Netherlands
export const IMMIGRATION_STEPS: OfflineStep[] = [
  {
    id: 'bsn',
    title: 'Get Your BSN (Burger Service Number)',
    description: 'The BSN is your citizen service number, essential for working, opening a bank account, and accessing healthcare in the Netherlands.',
    documents: [
      'Valid passport or ID',
      'Proof of address (rental contract or host letter)',
      'Birth certificate (apostilled)',
      'Appointment confirmation',
    ],
    timeline: '1-2 weeks after arrival',
    tips: [
      'Book appointment at gemeente (municipality) immediately upon arrival',
      'Bring original documents, not copies',
      'Some municipalities have long waiting times - book early!',
      'You can use DigiD once you have BSN',
    ],
  },
  {
    id: 'address',
    title: 'Register Your Address',
    description: 'You must register at your municipality within 5 days of finding housing. This is mandatory for everyone staying more than 4 months.',
    documents: [
      'Valid passport or ID',
      'Rental contract or ownership deed',
      'Landlord permission form (if subletting)',
    ],
    timeline: 'Within 5 days of moving',
    tips: [
      'Your landlord must agree to registration',
      'Some short-term rentals don\'t allow registration',
      'You need this before you can get BSN',
    ],
  },
  {
    id: 'bank',
    title: 'Open a Dutch Bank Account',
    description: 'A Dutch bank account is needed for salary, rent payments, and subscriptions. Major banks include ING, ABN AMRO, and Rabobank.',
    documents: [
      'Valid passport or ID',
      'BSN number',
      'Proof of address',
      'Employment contract (sometimes)',
    ],
    timeline: '1-2 weeks after BSN',
    tips: [
      'Bunq and N26 are faster alternatives while waiting for BSN',
      'Most Dutch payments use iDEAL',
      'Keep some cash for initial period',
    ],
  },
  {
    id: 'health',
    title: 'Get Health Insurance',
    description: 'Health insurance is mandatory in the Netherlands. You must get basic insurance (basisverzekering) within 4 months of registration.',
    documents: [
      'BSN number',
      'Bank account details',
      'Residence permit (if applicable)',
    ],
    timeline: 'Within 4 months of registration',
    tips: [
      'Compare on Independer.nl or Zorgwijzer.nl',
      'Basic insurance costs €130-160/month',
      'Zorgtoeslag (healthcare allowance) available for low income',
      'Choose your own risk (eigen risico) level',
    ],
  },
  {
    id: 'digid',
    title: 'Set Up DigiD',
    description: 'DigiD is your digital identity for accessing government services, tax returns, and healthcare portals.',
    documents: [
      'BSN number',
      'Dutch phone number',
      'Email address',
    ],
    timeline: 'After receiving BSN',
    tips: [
      'Apply at digid.nl',
      'Activation code arrives by mail (5-7 days)',
      'Download DigiD app for easier login',
      'Enable 2-factor authentication',
    ],
  },
  {
    id: 'permit',
    title: 'Residence Permit (if required)',
    description: 'Non-EU citizens need a residence permit. Apply through MVV before arrival or IND after arrival depending on nationality.',
    documents: [
      'Valid passport',
      'Passport photos',
      'Proof of income or sponsor',
      'MVV (if applicable)',
      'TB test results (some countries)',
    ],
    timeline: 'Varies by permit type',
    tips: [
      'Check IND.nl for requirements by nationality',
      'Processing can take 3-6 months',
      'Keep copies of all documents',
      'Premium service available for faster processing',
    ],
  },
];

// Frequently asked questions
export const FAQS: OfflineFAQ[] = [
  {
    question: 'How long can I stay in the Netherlands without registration?',
    answer: 'EU citizens can stay up to 3 months without registration. If staying longer, you must register at the municipality. Non-EU citizens need valid visas and must register within 5 days of arrival.',
    category: 'registration',
  },
  {
    question: 'Can I work while waiting for my BSN?',
    answer: 'Yes, you can start working before receiving your BSN. Your employer can use a temporary tax number. However, you should register for BSN as soon as possible.',
    category: 'work',
  },
  {
    question: 'What if I can\'t find housing that allows registration?',
    answer: 'Registration is mandatory. Consider temporary solutions like hostels that allow registration, or contact your municipality about alternatives. Some municipalities offer postal addresses for homeless registration.',
    category: 'housing',
  },
  {
    question: 'Is the 30% ruling still available?',
    answer: 'Yes, the 30% ruling is still available for highly skilled migrants, though recent changes have reduced the benefit period. You must apply within 4 months of starting work.',
    category: 'tax',
  },
  {
    question: 'How do I find a GP (huisarts)?',
    answer: 'Use Zorgkaart Nederland to find GPs in your area. Call to register - some have waiting lists. You need a GP before you can see specialists.',
    category: 'health',
  },
  {
    question: 'What is the civic integration exam (inburgeringsexamen)?',
    answer: 'Non-EU citizens must pass integration exams including Dutch language (A2 level), knowledge of Dutch society, and participation declaration. You have 3 years to complete it.',
    category: 'integration',
  },
  {
    question: 'Can I bring my family to the Netherlands?',
    answer: 'Yes, through family reunification. Requirements include sufficient income, suitable housing, and valid relationship proof. Apply through IND after you have a valid residence permit.',
    category: 'family',
  },
  {
    question: 'How do I get a Dutch driver\'s license?',
    answer: 'EU licenses can be exchanged. Other licenses may need to be exchanged (some countries) or you may need to retake the test. Check RDW.nl for your country\'s requirements.',
    category: 'transport',
  },
];

// Emergency contacts
export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Emergency Services',
    phone: '112',
    description: 'Police, Fire, Ambulance - for life-threatening emergencies',
  },
  {
    name: 'Police (non-emergency)',
    phone: '0900-8844',
    description: 'For non-urgent police matters',
  },
  {
    name: 'GP Hotline (outside hours)',
    phone: '0900-1515',
    description: 'Medical advice when your GP is closed',
  },
  {
    name: 'IND (Immigration)',
    phone: '088-043 0430',
    description: 'Questions about residence permits and visas',
  },
  {
    name: 'Gemeente Amsterdam',
    phone: '14 020',
    description: 'Amsterdam municipality for registration and BSN',
  },
  {
    name: 'Belastingdienst (Tax)',
    phone: '0800-0543',
    description: 'Tax authority for tax questions',
  },
];

// Get complete offline data bundle
export function getOfflineData(): OfflineData {
  return {
    steps: IMMIGRATION_STEPS,
    faqs: FAQS,
    emergencyContacts: EMERGENCY_CONTACTS,
    lastUpdated: new Date().toISOString(),
  };
}

// Store offline data in localStorage
export function cacheOfflineData(): void {
  if (typeof window !== 'undefined') {
    const data = getOfflineData();
    localStorage.setItem('migrantai-offline-data', JSON.stringify(data));
    localStorage.setItem('migrantai-offline-timestamp', Date.now().toString());
  }
}

// Retrieve cached offline data
export function getCachedOfflineData(): OfflineData | null {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('migrantai-offline-data');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Check if cache is fresh (less than 24 hours old)
export function isCacheFresh(): boolean {
  if (typeof window !== 'undefined') {
    const timestamp = localStorage.getItem('migrantai-offline-timestamp');
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      return age < 24 * 60 * 60 * 1000; // 24 hours
    }
  }
  return false;
}

// Queue message for sync when back online
export async function queueMessageForSync(message: { content: string; timestamp: number }): Promise<void> {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    const db = await openDatabase();
    const transaction = db.transaction('pendingMessages', 'readwrite');
    const store = transaction.objectStore('pendingMessages');
    await store.add({ data: message, timestamp: Date.now() });
  }
}

// Open IndexedDB for offline message queue
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MigrantAI', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Request background sync when online
export async function requestSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('sync-conversations');
  }
}
