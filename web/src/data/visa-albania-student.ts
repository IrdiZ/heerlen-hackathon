/**
 * Albania → Netherlands STUDENT Visa Requirements
 * 
 * Comprehensive guide for Albanian students seeking to study in the Netherlands.
 * Last updated: February 2026
 * 
 * CRITICAL: There is NO Dutch embassy in Albania for visa processing.
 * Albanian citizens must travel to SKOPJE, NORTH MACEDONIA for MVV collection.
 * 
 * Sources:
 * - IND: https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education
 * - Nuffic: https://www.studyinholland.nl
 * - Netherlands Embassy Skopje: https://www.netherlandsandyou.nl/web/north-macedonia
 */

import type { VisaGuide } from './visa-albania';

export const albaniaToNetherlandsStudentVisa: VisaGuide = {
  nationality: 'Albanian',
  destinationCountry: 'Netherlands',
  visaType: 'Student Residence Permit (Study)',
  mvvRequired: true,
  lastUpdated: '2026-02-07',
  
  overview: `Albanian students need an MVV (Provisional Residence Permit) and residence permit to study 
in the Netherlands for more than 90 days. The Dutch educational institution acts as your sponsor and 
submits the application. 

⚠️ IMPORTANT: There is NO Dutch embassy in Albania. You MUST travel to SKOPJE, NORTH MACEDONIA 
to collect your MVV. Plan for a 1-2 day trip (5-6 hour bus ride from Tirana).`,

  totalProcessingTime: '8-16 weeks (from university application to MVV collection)',

  steps: [
    {
      step: 1,
      title: 'University Admission',
      description: `Apply to a Dutch university or university of applied sciences (HBO). 
You need a conditional or unconditional admission letter. Non-EU students typically apply DIRECTLY through university portals, not Studielink.`,
      duration: '2-8 weeks',
      responsible: 'applicant',
      tips: [
        '⚠️ Non-EU students: Apply directly via university website, NOT Studielink',
        'Studielink (studielink.nl) is primarily for Dutch/EU students',
        'Check program requirements on https://www.studyinholland.nl',
        'Deadlines: 15 January (most programs) or 1 May (some HBO programs)',
        'English proficiency: IELTS 6.0-6.5 or TOEFL 80-90 typically required'
      ]
    },
    {
      step: 2,
      title: 'Acceptance & Tuition Payment',
      description: `Accept the admission offer and pay tuition fee (or first installment). 
Non-EU students pay institutional tuition (€8,000-€20,000/year typically).`,
      duration: '1-2 weeks',
      responsible: 'applicant',
      tips: [
        'Non-EU tuition is higher than EU rates',
        'Check scholarship options: Holland Scholarship, Orange Knowledge Programme',
        'Some universities offer payment plans',
        'Keep payment proof for visa application'
      ]
    },
    {
      step: 3,
      title: 'University Submits TEV Application',
      description: `Your university (as sponsor) submits the combined MVV + residence permit application 
to IND on your behalf. You'll need to provide documents and proof of finances.`,
      duration: '1-2 weeks to gather documents',
      responsible: 'applicant',
      tips: [
        'University international office guides you through this',
        'Financial proof needed: €13,569.24/year (2026 amount) in bank account',
        'Bank statement must be recent (< 1 month old)',
        'Blocked account (like DUO loan commitment) can also work'
      ]
    },
    {
      step: 4,
      title: 'IND Processing',
      description: `IND processes the application. Educational institutions are recognized sponsors, 
so processing is relatively fast.`,
      duration: '2-6 weeks',
      responsible: 'ind',
      tips: [
        'University tracks status for you',
        'IND may request additional documents',
        'Apply early - summer is peak season with delays'
      ]
    },
    {
      step: 5,
      title: 'MVV Approval & Embassy Notification',
      description: `Upon approval, IND notifies the Dutch Embassy in SKOPJE (not Albania!). 
You'll receive instructions to book an appointment.`,
      duration: '1-2 weeks',
      responsible: 'ind',
      tips: [
        '⚠️ Embassy is in SKOPJE, North Macedonia - NOT Albania!',
        'University sends you the approval notification',
        'Start planning your Skopje trip'
      ]
    },
    {
      step: 6,
      title: '🚌 TRAVEL TO SKOPJE for MVV Collection',
      description: `⚠️ CRITICAL: There is NO Dutch embassy in Albania that processes visas!
You MUST travel to SKOPJE, NORTH MACEDONIA to collect your MVV. Book via VFS Global.`,
      duration: '1-3 days (travel + appointment)',
      responsible: 'applicant',
      tips: [
        '⚠️ NO Dutch embassy in Albania - SKOPJE is mandatory!',
        'Book appointment: https://www.vfsglobal.com/Netherlands/northmacedonia/',
        'Bus Tirana→Skopje: ~5-6 hours, €15-25 one-way',
        'Consider overnight stay - appointments often early morning',
        'Bring ALL original documents + copies',
        'Embassy address: Leninova 69-71, 1000 Skopje',
        'Alternative: Athens embassy (longer trip but sometimes faster slots)'
      ]
    },
    {
      step: 7,
      title: 'Travel to Netherlands',
      description: `Travel to the Netherlands within MVV validity (90 days). 
Arrive before your program start date.`,
      duration: 'Within 90 days of MVV',
      responsible: 'applicant',
      tips: [
        'Book flight after getting MVV',
        'Many students arrive 1-2 weeks early for orientation',
        'Carry all original documents',
        'University often arranges airport pickup'
      ]
    },
    {
      step: 8,
      title: 'Registration in Netherlands',
      description: `Register at municipality (gemeente), collect residence permit at IND, 
and get your BSN (citizen service number). Open Dutch bank account.`,
      duration: '1-3 weeks after arrival',
      responsible: 'applicant',
      tips: [
        'Register at gemeente within 5 days of arrival',
        'Need registered address (university housing or private)',
        'BSN required for everything: bank, phone, healthcare',
        'University helps with IND appointment'
      ]
    }
  ],

  requiredDocuments: {
    applicant: [
      {
        name: 'Valid Passport',
        description: 'Valid for at least 1 year beyond planned stay',
        legalizationRequired: false,
        notes: 'At least 2 blank pages for visa stickers'
      },
      {
        name: 'Passport Photos',
        description: 'Recent photos meeting Dutch/Schengen requirements',
        legalizationRequired: false,
        notes: '35x45mm, white background'
      },
      {
        name: 'Admission Letter',
        description: 'Official admission letter from Dutch university',
        legalizationRequired: false,
        notes: 'Must show program name, start date, duration'
      },
      {
        name: 'Proof of Tuition Payment',
        description: 'Receipt showing tuition fee paid (or first installment)',
        legalizationRequired: false
      },
      {
        name: 'Proof of Sufficient Funds',
        description: '€13,569.24 minimum in bank account (2026 amount)',
        legalizationRequired: false,
        notes: 'Bank statement < 1 month old. Can also use: scholarship letter, sponsor declaration, DUO loan commitment'
      },
      {
        name: 'High School Diploma + Transcripts',
        description: 'Secondary education certificates',
        legalizationRequired: true,
        notes: 'Apostille from Albanian Ministry of Foreign Affairs required',
        source: 'Albanian secondary school'
      },
      {
        name: 'Bachelor Diploma (for Masters)',
        description: 'University degree if applying for Masters',
        legalizationRequired: true,
        notes: 'Apostille required',
        source: 'Albanian university'
      },
      {
        name: 'English Proficiency Test',
        description: 'IELTS, TOEFL, or Cambridge certificate',
        legalizationRequired: false,
        notes: 'Usually IELTS 6.0-6.5 for Bachelor, 6.5-7.0 for Master'
      },
      /* TB Test NOT required - Albania is EXEMPT (see IND form 7644)
      {
        name: 'TB Test Certificate',
        description: 'Tuberculosis test from approved clinic',
        legalizationRequired: false,
        notes: 'Albania is EXEMPT from TB testing requirement'
      }
      */
    ],
    employer: [
      {
        name: 'Sponsor Declaration',
        description: 'University declaration as recognized sponsor',
        legalizationRequired: false,
        notes: 'University handles this automatically'
      }
    ]
  },

  fees: [
    {
      type: 'TEV Application (Student)',
      amount: 254,
      currency: 'EUR',
      notes: '2026 rate for study purpose. Usually paid by/through university.'
    },
    {
      type: 'Residence Permit Extension',
      amount: 192,
      currency: 'EUR',
      notes: 'For extending permit if study takes longer'
    },
    {
      type: 'Nuffic Credential Evaluation',
      amount: 148,
      currency: 'EUR',
      notes: 'If diploma evaluation required (some universities include this)'
    }
  ],

  salaryRequirements: [
    {
      category: 'Financial Requirement (Study)',
      monthlyGross: 1130.77,
      notes: '€13,569.24/year = €1,130.77/month. Must show this amount available for first year.'
    }
  ],

  processingTimes: [
    {
      step: 'University Admission',
      duration: '2-8 weeks',
      notes: 'Depends on program and completeness of application'
    },
    {
      step: 'TEV Application Processing',
      duration: '2-6 weeks',
      notes: 'Educational institutions have fast-track processing'
    },
    {
      step: 'Embassy Appointment (Skopje)',
      duration: '1-3 weeks',
      notes: 'Book early! Summer appointments fill up fast.'
    }
  ],

  pitfalls: [
    {
      title: '⚠️ ASSUMING EMBASSY IN ALBANIA',
      description: 'The biggest mistake: There is NO Dutch visa processing in Albania!',
      prevention: 'Plan and budget for trip to SKOPJE, North Macedonia. Bus ~5-6 hours from Tirana.'
    },
    {
      title: 'Insufficient Funds Proof',
      description: 'Bank statement not showing €13,569.24 or statement too old.',
      prevention: 'Have money in account 1+ month before application. Get fresh statement (< 1 month old).'
    },
    {
      title: 'Missing Apostille on Diplomas',
      description: 'Albanian documents need apostille for Netherlands.',
      prevention: 'Get apostille from Ministry of Foreign Affairs BEFORE application.'
    },
    {
      title: 'Late Application',
      description: 'Applying too late for visa, missing program start.',
      prevention: 'Apply 3-4 months before program starts. Summer processing is slower.'
    },
    {
      title: 'Skopje Appointment Delays',
      description: 'VFS Global appointments in Skopje fill up, especially in summer.',
      prevention: 'Book appointment as soon as you get IND approval. Check daily for slots.'
    },
    {
      title: 'English Test Expiry',
      description: 'IELTS/TOEFL scores expire after 2 years.',
      prevention: 'Check your score is still valid at time of enrollment.'
    }
  ],

  usefulLinks: [
    {
      title: 'Study in Holland',
      url: 'https://www.studyinholland.nl',
      description: 'Official guide for international students - find programs, scholarships'
    },
    {
      title: 'Studielink',
      url: 'https://www.studielink.nl',
      description: 'Apply to Dutch universities through this portal'
    },
    {
      title: 'IND - Study Permit',
      url: 'https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education',
      description: 'Official IND information for student residence permits'
    },
    {
      title: 'Nuffic - Diploma Recognition',
      url: 'https://www.nuffic.nl/en/education-systems/albania',
      description: 'How Albanian diplomas are evaluated in Netherlands'
    },
    {
      title: '🚌 VFS Global Skopje (BOOK MVV APPOINTMENT)',
      url: 'https://www.vfsglobal.com/Netherlands/northmacedonia/',
      description: '⚠️ MUST book here - no Dutch embassy in Albania!'
    },
    {
      title: 'Netherlands Embassy Skopje',
      url: 'https://www.netherlandsandyou.nl/web/north-macedonia',
      description: 'Embassy handling Albanian visa applications'
    },
    {
      title: 'Bus Tirana-Skopje',
      url: 'https://www.rome2rio.com/map/Tirana/Skopje',
      description: 'Travel options: ~5-6 hours, €15-25 by bus'
    },
    {
      title: 'Holland Scholarship',
      url: 'https://www.studyinholland.nl/finances/holland-scholarship',
      description: '€5,000 scholarship for non-EU students'
    },
    {
      title: 'DUO - Student Finance',
      url: 'https://duo.nl/particulier/student-finance/applying-for-student-finance.jsp',
      description: 'Information about student loans and finance'
    }
  ],

  embassy: {
    name: 'Embassy of the Kingdom of the Netherlands in North Macedonia',
    city: 'Skopje',
    country: 'North Macedonia',
    website: 'https://www.netherlandsandyou.nl/web/north-macedonia',
    notes: `⚠️ CRITICAL FOR ALBANIAN STUDENTS:
    
There is NO Dutch embassy in Albania that processes visas!
You MUST travel to SKOPJE, NORTH MACEDONIA.

📍 Address: Leninova 69-71, 1000 Skopje, North Macedonia
📞 Tel: +389 2 3129 319
📧 Email: sko@minbuza.nl
🌐 Appointments: https://www.vfsglobal.com/Netherlands/northmacedonia/

🚌 GETTING THERE FROM ALBANIA:
• Bus Tirana → Skopje: ~5-6 hours, €15-25
• Leave early morning or take overnight bus
• Main bus station: Terminali Lindor, Tirana
• Book return flexible in case of delays

💡 TIPS:
• Book accommodation in Skopje (1 night minimum recommended)
• Appointments often 8-9 AM - hard to make same-day from Tirana
• Bring ALL original documents + photocopies
• Processing after appointment: 1-2 weeks
• MVV valid 90 days from collection - plan your travel to NL

Alternative: Some students use Dutch Embassy in Athens, Greece
(longer trip but sometimes faster appointment availability)`
  }
};

export default albaniaToNetherlandsStudentVisa;
