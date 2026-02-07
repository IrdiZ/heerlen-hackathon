/**
 * Albania → Netherlands STUDENT Visa - Hyper-Specific Roadmap
 * 
 * This file provides a comprehensive, step-by-step roadmap with direct action links,
 * verified sources, exact fees, required documents, and critical pitfalls.
 * 
 * CRITICAL: There is NO Dutch embassy in Albania for visa processing.
 * Albanian citizens MUST travel to SKOPJE, NORTH MACEDONIA for MVV collection.
 * 
 * Last Verified: 2026-02-08
 * 
 * Sources:
 * - IND: https://ind.nl/en/residence-permits/study/study-at-university
 * - Nuffic: https://www.studyinholland.nl
 * - Netherlands Embassy Skopje: https://www.netherlandsandyou.nl/web/north-macedonia
 */

import type { RoadmapStep } from '../lib/roadmap-types';

export interface AlbaniaStudentRoadmap {
  id: string;
  name: string;
  nationality: 'Albanian';
  destinationCountry: 'Netherlands';
  visaType: 'Student Residence Permit (Study)';
  lastVerified: string;
  totalEstimatedTime: string;
  steps: RoadmapStep[];
}

export const albaniaStudentRoadmap: AlbaniaStudentRoadmap = {
  id: 'al-nl-student-2026',
  name: 'Albania → Netherlands Student Visa Roadmap',
  nationality: 'Albanian',
  destinationCountry: 'Netherlands',
  visaType: 'Student Residence Permit (Study)',
  lastVerified: '2026-02-08',
  totalEstimatedTime: '8-16 weeks',
  
  steps: [
    // ============================================
    // STEP 1: University Admission
    // ============================================
    {
      id: 'step-1-admission',
      order: 1,
      title: '🎓 University Admission Application',
      description: 'Apply directly to a Dutch university or HBO institution. Non-EU students typically apply through university portals, NOT Studielink.',
      estimatedTime: '2-8 weeks',
      status: 'pending',
      
      primaryAction: {
        label: 'Find Programs on Study in Holland',
        url: 'https://www.studyinholland.nl/dutch-universities',
        type: 'portal',
        notes: 'Search by field, level, and language. Apply via individual university websites.'
      },
      
      documentsRequired: [
        {
          name: 'High School Diploma (Dëftesë Pjekurie)',
          required: true,
          obtainFrom: 'Albanian Secondary School',
          description: 'Original diploma with transcripts',
          apostilleRequired: true,
          estimatedTime: '1-2 weeks for apostille'
        },
        {
          name: 'Bachelor Diploma (for Master\'s)',
          required: false,
          obtainFrom: 'Albanian University',
          description: 'Required only for Master\'s programs',
          apostilleRequired: true,
          estimatedTime: '1-2 weeks for apostille'
        },
        {
          name: 'IELTS/TOEFL Score Report',
          required: true,
          obtainFrom: 'British Council (IELTS) or ETS (TOEFL)',
          obtainUrl: 'https://www.ielts.org/for-test-takers/book-a-test',
          description: 'Usually IELTS 6.0-6.5 for Bachelor, 6.5-7.0 for Master',
          validityPeriod: '2 years'
        },
        {
          name: 'Motivation Letter',
          required: true,
          description: 'Explain why this program and why Netherlands'
        },
        {
          name: 'CV / Resume',
          required: true,
          description: 'Academic and professional background'
        },
        {
          name: 'Passport Copy',
          required: true,
          description: 'Biographical data page, valid 1+ year beyond study period'
        }
      ],
      
      fees: [
        {
          amount: 100,
          currency: 'EUR',
          description: 'Application fee (varies by university)',
          notes: 'Some universities waive this; ranges €0-€100'
        }
      ],
      
      pitfalls: [
        {
          title: 'Using Studielink as Non-EU Student',
          description: 'Studielink is primarily for Dutch/EU students. Non-EU students often cannot complete enrollment there.',
          prevention: 'Apply directly via the university website\'s international admissions portal.',
          severity: 'common'
        },
        {
          title: 'Missing Application Deadline',
          description: 'Most programs: 15 January for September start. Some HBO: 1 May.',
          prevention: 'Check individual program deadlines. Apply by November-December to be safe.',
          severity: 'common'
        },
        {
          title: 'IELTS/TOEFL Score Expiry',
          description: 'English test scores expire after 2 years.',
          prevention: 'Ensure your score is valid at enrollment time, not just application time.',
          severity: 'occasional'
        },
        {
          title: 'Documents Without Apostille',
          description: 'Albanian diplomas need apostille for Dutch recognition.',
          prevention: 'Get apostille from Albanian Ministry of Foreign Affairs BEFORE applying.',
          severity: 'common'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://www.studyinholland.nl',
          title: 'Study in Holland - Official Guide',
          type: 'government',
          lastVerified: '2026-02-08',
          notes: 'Nuffic-run portal for international students'
        },
        {
          url: 'https://www.nuffic.nl/en/education-systems/albania',
          title: 'Nuffic - Albanian Education System',
          type: 'government',
          lastVerified: '2026-02-08',
          notes: 'How Albanian diplomas are evaluated'
        }
      ],
      
      countrySpecificNotes: {
        'AL': 'Albanian diplomas (Dëftesë Pjekurie) are recognized in Netherlands. Apostille required from Ministry of Foreign Affairs, Bulevardi "Gjergj Fishta", Tirana.'
      },
      
      tips: [
        '⚠️ Non-EU students: Apply directly via university website, NOT Studielink',
        'Check program requirements on studyinholland.nl',
        'Deadlines: 15 January (most programs) or 1 May (some HBO programs)',
        'English proficiency: IELTS 6.0-6.5 or TOEFL 80-90 typically required',
        'Get apostille on diplomas early - it takes 1-2 weeks'
      ],
      
      lastVerified: '2026-02-08'
    },

    // ============================================
    // STEP 2: Accept Offer & Pay Tuition
    // ============================================
    {
      id: 'step-2-tuition',
      order: 2,
      title: '💳 Accept Offer & Pay Tuition',
      description: 'Accept the admission offer and pay tuition fee (or first installment). Non-EU students pay institutional tuition rates.',
      estimatedTime: '1-2 weeks',
      status: 'pending',
      
      primaryAction: {
        label: 'Check Holland Scholarship',
        url: 'https://www.studyinholland.nl/finances/holland-scholarship',
        type: 'portal',
        notes: '€5,000 one-time scholarship for non-EU students'
      },
      
      documentsRequired: [
        {
          name: 'Admission Letter',
          required: true,
          obtainFrom: 'University (via email)',
          description: 'Official letter confirming conditional or unconditional admission'
        },
        {
          name: 'Bank Account Details',
          required: true,
          description: 'For wire transfer of tuition fee'
        }
      ],
      
      fees: [
        {
          amount: 10000,
          currency: 'EUR',
          description: 'Tuition Fee (typical range €8,000-€20,000)',
          notes: 'Non-EU tuition. Check exact amount with your university. Payment plans often available.'
        }
      ],
      
      pitfalls: [
        {
          title: 'Missing Payment Deadline',
          description: 'Universities have strict payment deadlines; missing them can void your admission.',
          prevention: 'Pay within 2 weeks of acceptance. Keep payment proof for visa application.',
          severity: 'common'
        },
        {
          title: 'Not Exploring Scholarships',
          description: 'Many students don\'t know about available scholarships.',
          prevention: 'Check Holland Scholarship (€5,000), Orange Knowledge Programme, university-specific scholarships.',
          severity: 'occasional'
        },
        {
          title: 'Bank Transfer Issues',
          description: 'International wire transfers can take 3-5 days and have fees.',
          prevention: 'Use IBAN transfer, not SWIFT if possible. Include exact reference number.',
          severity: 'occasional'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://www.studyinholland.nl/finances',
          title: 'Study in Holland - Finances',
          type: 'government',
          lastVerified: '2026-02-08'
        },
        {
          url: 'https://www.studyinholland.nl/finances/holland-scholarship',
          title: 'Holland Scholarship',
          type: 'government',
          lastVerified: '2026-02-08',
          notes: '€5,000 for non-EU Bachelor/Master students'
        }
      ],
      
      countrySpecificNotes: {
        'AL': 'Albanian banks (BKT, Raiffeisen, Intesa) can do EUR wire transfers. Expect €20-40 transfer fee. Get exact IBAN from university.'
      },
      
      tips: [
        'Non-EU tuition is €8,000-€20,000/year (higher than EU rates)',
        'Check scholarship options: Holland Scholarship, Orange Knowledge Programme',
        'Some universities offer payment plans',
        'Keep payment proof - you\'ll need it for visa application'
      ],
      
      lastVerified: '2026-02-08'
    },

    // ============================================
    // STEP 3: TEV Application (University Submits)
    // ============================================
    {
      id: 'step-3-tev',
      order: 3,
      title: '📋 Provide Documents for TEV Application',
      description: 'Your university (as recognized sponsor) submits the combined MVV + residence permit application to IND. You provide required documents and proof of finances.',
      estimatedTime: '1-2 weeks to gather documents',
      status: 'pending',
      formNumber: 'Form 7626 (Antecedents Certificate)',
      
      primaryAction: {
        label: 'Download Antecedents Certificate Form 7626',
        url: 'https://ind.nl/en/forms/7626.pdf',
        type: 'pdf',
        notes: 'Must be signed by you, declaring no criminal record'
      },
      
      portalUrl: 'https://ind.nl/en/residence-permits/study/study-at-university',
      
      documentsRequired: [
        {
          name: 'Valid Passport',
          required: true,
          description: 'Valid for at least 1 year beyond planned stay, 2+ blank pages',
          validityPeriod: 'Must cover entire study period + 3 months'
        },
        {
          name: 'Passport Photos',
          required: true,
          description: '2 recent photos, 35x45mm, white background, Schengen compliant',
          obtainFrom: 'Photo studio following Dutch requirements'
        },
        {
          name: 'Proof of Sufficient Funds',
          required: true,
          description: 'Bank statement showing €13,569.24 minimum (2026 amount). Alternatives: scholarship letter, sponsor declaration, or DUO loan commitment.',
          validityPeriod: 'Statement must be < 1 month old'
        },
        {
          name: 'Admission Letter',
          required: true,
          obtainFrom: 'University',
          description: 'Shows program name, start date, duration'
        },
        {
          name: 'Proof of Tuition Payment',
          required: true,
          obtainFrom: 'University/Bank',
          description: 'Receipt showing tuition fee paid or first installment'
        },
        {
          name: 'Antecedents Certificate (Form 7626)',
          required: true,
          obtainUrl: 'https://ind.nl/en/forms/7626.pdf',
          description: 'Self-declaration of no criminal record, signed by you. Must be original with handwritten signature.'
        },
        {
          name: 'Apostilled Diplomas',
          required: true,
          obtainFrom: 'Albanian Ministry of Foreign Affairs',
          apostilleRequired: true,
          description: 'High school and/or university diploma with apostille'
        }
      ],
      
      fees: [
        {
          amount: 225,
          currency: 'EUR',
          description: 'TEV Application Fee (Student)',
          paymentUrl: 'https://ind.nl/en/costs',
          notes: '2026 rate. Usually paid by/through university. Check with your international office.'
        }
      ],
      
      pitfalls: [
        {
          title: 'Bank Statement Too Old',
          description: 'IND rejects bank statements older than 1 month.',
          prevention: 'Get fresh bank statement dated within 3 weeks of submission.',
          severity: 'common'
        },
        {
          title: 'Insufficient Funds',
          description: 'Account showing less than €13,569.24.',
          prevention: 'Have money in account 1+ month before application. This is the 2026 amount - check IND for current requirement.',
          severity: 'common'
        },
        {
          title: 'Missing Apostille',
          description: 'Diplomas without apostille are not accepted.',
          prevention: 'Get apostille from Ministry of Foreign Affairs in Tirana BEFORE university submits application.',
          severity: 'common'
        },
        {
          title: 'Form 7626 Not Signed',
          description: 'Digital signature not accepted; must be handwritten.',
          prevention: 'Print form, sign by hand, scan and send to university.',
          severity: 'occasional'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://ind.nl/en/residence-permits/study/study-at-university',
          title: 'IND - Study at University Permit',
          type: 'official',
          lastVerified: '2026-02-08',
          notes: 'Official requirements and processing info'
        },
        {
          url: 'https://ind.nl/en/forms/7626.pdf',
          title: 'Form 7626 - Antecedents Certificate',
          type: 'official',
          lastVerified: '2026-02-08'
        },
        {
          url: 'https://ind.nl/en/costs',
          title: 'IND - Application Costs',
          type: 'official',
          lastVerified: '2026-02-08'
        }
      ],
      
      countrySpecificNotes: {
        'AL': 'Albanian bank statements from BKT, Raiffeisen, Intesa Sanpaolo accepted. Statement must be in EUR (convert from ALL at official rate). Apostille office: Ministry of Foreign Affairs, Tirana - costs ~€10, takes 3-5 days.'
      },
      
      tips: [
        'University international office guides you through this process',
        'Financial proof needed: €13,569.24/year (2026 amount)',
        'Bank statement must be recent (< 1 month old)',
        'Blocked account (like DUO loan commitment) can also work',
        'Some universities pay the TEV fee for you - check with international office'
      ],
      
      lastVerified: '2026-02-08'
    },

    // ============================================
    // STEP 4: IND Processing
    // ============================================
    {
      id: 'step-4-ind-processing',
      order: 4,
      title: '⏳ IND Processes Application',
      description: 'IND processes your TEV application. Educational institutions are recognized sponsors, enabling faster processing.',
      estimatedTime: '2-6 weeks',
      status: 'pending',
      
      primaryAction: {
        label: 'Check IND Processing Times',
        url: 'https://ind.nl/en/service-and-contact/processing-times',
        type: 'external',
        notes: 'Current processing times for study permits'
      },
      
      pitfalls: [
        {
          title: 'Summer Peak Delays',
          description: 'Processing takes longer June-August due to high volume.',
          prevention: 'Apply early - by April for September start. Universities should submit by May.',
          severity: 'common'
        },
        {
          title: 'Additional Documents Requested',
          description: 'IND may request clarification or additional documents.',
          prevention: 'Respond within 2 weeks. Check email (including spam) daily. University will forward IND requests.',
          severity: 'occasional'
        },
        {
          title: 'Not Tracking Application',
          description: 'Missing status updates or requests for information.',
          prevention: 'Ask university international office for tracking. They can see IND portal status.',
          severity: 'occasional'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://ind.nl/en/service-and-contact/processing-times',
          title: 'IND - Processing Times',
          type: 'official',
          lastVerified: '2026-02-08'
        },
        {
          url: 'https://ind.nl/en/public-register-recognised-sponsors',
          title: 'IND - Recognized Sponsors',
          type: 'official',
          lastVerified: '2026-02-08',
          notes: 'Universities on this list get faster processing'
        }
      ],
      
      countrySpecificNotes: {
        'AL': 'Albania is TB-exempt per IND form 7644, so no tuberculosis test required. This saves ~€100 and 1-2 days.'
      },
      
      tips: [
        'University tracks status for you via IND portal',
        'IND may request additional documents - respond quickly',
        'Apply early - summer is peak season with delays',
        'Recognized sponsors (universities) get priority processing'
      ],
      
      lastVerified: '2026-02-08'
    },

    // ============================================
    // STEP 5: MVV Approval & Embassy Notification
    // ============================================
    {
      id: 'step-5-approval',
      order: 5,
      title: '✅ MVV Approval & Embassy Notification',
      description: 'Upon approval, IND notifies the Dutch Embassy in SKOPJE (not Albania!). You\'ll receive instructions to book an appointment.',
      estimatedTime: '1-2 weeks',
      status: 'pending',
      
      primaryAction: {
        label: 'Prepare for VFS Appointment',
        url: 'https://www.vfsglobal.com/Netherlands/northmacedonia/',
        type: 'portal',
        notes: 'Start checking appointment availability. Book as soon as you get approval.'
      },
      
      documentsRequired: [
        {
          name: 'Approval Notification',
          required: true,
          obtainFrom: 'University (forwards from IND)',
          description: 'Email/letter confirming MVV approval'
        }
      ],
      
      pitfalls: [
        {
          title: 'Assuming Embassy in Albania',
          description: 'There is NO Dutch embassy in Albania that processes visas.',
          prevention: 'Embassy is in SKOPJE, North Macedonia. Start planning your trip now.',
          severity: 'common'
        },
        {
          title: 'Delayed Appointment Booking',
          description: 'VFS appointments in Skopje fill up, especially summer.',
          prevention: 'Check VFS website daily. Book immediately when approval comes.',
          severity: 'common'
        },
        {
          title: 'Missing Approval Email',
          description: 'Approval notification goes to spam or wrong email.',
          prevention: 'Check spam folder. Confirm correct email with university. Check student portal.',
          severity: 'occasional'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://www.netherlandsandyou.nl/web/north-macedonia',
          title: 'Netherlands Embassy - North Macedonia',
          type: 'official',
          lastVerified: '2026-02-08',
          notes: 'Embassy handling Albanian visa applications'
        },
        {
          url: 'https://www.vfsglobal.com/Netherlands/northmacedonia/',
          title: 'VFS Global - Netherlands Visa Skopje',
          type: 'verified-third-party',
          lastVerified: '2026-02-08',
          notes: 'Outsourced visa application center'
        }
      ],
      
      countrySpecificNotes: {
        'AL': '⚠️ CRITICAL: NO Dutch embassy in Albania! You MUST travel to Skopje, North Macedonia. Start planning trip: bus from Tirana is 5-6 hours, €15-25 one-way.'
      },
      
      tips: [
        '⚠️ Embassy is in SKOPJE, North Macedonia - NOT Albania!',
        'University sends you the approval notification',
        'Start planning your Skopje trip immediately',
        'Book VFS appointment as soon as you get approval email',
        'Summer appointments fill up fast - check daily'
      ],
      
      lastVerified: '2026-02-08'
    },

    // ============================================
    // STEP 6: TRAVEL TO SKOPJE (CRITICAL!)
    // ============================================
    {
      id: 'step-6-skopje',
      order: 6,
      title: '🚌 TRAVEL TO SKOPJE for MVV Collection',
      description: '⚠️ CRITICAL: There is NO Dutch embassy in Albania that processes visas! You MUST travel to SKOPJE, NORTH MACEDONIA to collect your MVV. Book via VFS Global.',
      estimatedTime: '1-3 days (travel + appointment)',
      status: 'pending',
      
      primaryAction: {
        label: 'Book VFS Appointment in Skopje',
        url: 'https://www.vfsglobal.com/Netherlands/northmacedonia/book-an-appointment.html',
        type: 'portal',
        requiresAuth: true,
        notes: 'Create account, select "MVV Collection", choose date/time. Book ASAP!'
      },
      
      portalUrl: 'https://www.vfsglobal.com/Netherlands/northmacedonia/',
      
      documentsRequired: [
        {
          name: 'Valid Passport',
          required: true,
          description: 'ORIGINAL passport - valid 1+ year beyond study period'
        },
        {
          name: 'MVV Approval Letter',
          required: true,
          obtainFrom: 'University/IND',
          description: 'Printed copy of approval notification'
        },
        {
          name: 'VFS Appointment Confirmation',
          required: true,
          obtainFrom: 'VFS Global website',
          description: 'Printed appointment confirmation with barcode'
        },
        {
          name: 'Passport Photos',
          required: true,
          description: '2 photos, 35x45mm, white background (bring extras)'
        },
        {
          name: 'All Original Documents',
          required: true,
          description: 'Bring ALL originals submitted for application + copies'
        },
        {
          name: 'Travel Documents',
          required: true,
          description: 'ID card for North Macedonia border crossing (passport recommended)'
        }
      ],
      
      fees: [
        {
          amount: 25,
          currency: 'EUR',
          description: 'Bus Tirana → Skopje (one-way)',
          notes: 'Multiple companies: Relax, Albatros. ~5-6 hours journey'
        },
        {
          amount: 25,
          currency: 'EUR',
          description: 'Bus Skopje → Tirana (return)',
          notes: 'Book flexible return in case of delays'
        },
        {
          amount: 40,
          currency: 'EUR',
          description: 'Accommodation in Skopje (budget hotel/hostel)',
          notes: '1 night minimum recommended - appointments often early morning'
        },
        {
          amount: 30,
          currency: 'EUR',
          description: 'VFS Service Fee',
          notes: 'Paid at VFS center on appointment day'
        }
      ],
      
      pitfalls: [
        {
          title: 'Assuming Embassy in Albania',
          description: 'There is NO Dutch visa processing in Albania. Students have missed flights thinking they could get MVV in Tirana.',
          prevention: 'Must travel to Skopje, North Macedonia. Plan 1-2 day trip. No exceptions.',
          severity: 'common'
        },
        {
          title: 'Same-Day Appointment from Tirana',
          description: 'Trying to take early bus and make 9 AM appointment - risky!',
          prevention: 'Travel to Skopje the day before. Book hotel near VFS center. Appointments often 8-9 AM.',
          severity: 'common'
        },
        {
          title: 'Missing Original Documents',
          description: 'Bringing only copies, not originals.',
          prevention: 'Bring ALL ORIGINAL documents + photocopies of everything. Embassy keeps some originals.',
          severity: 'common'
        },
        {
          title: 'VFS Appointment Full',
          description: 'No available appointments for weeks, especially June-August.',
          prevention: 'Book immediately when you get approval. Check website multiple times daily. Try different browsers.',
          severity: 'common'
        },
        {
          title: 'Border Crossing Issues',
          description: 'Problems at Albanian-North Macedonian border.',
          prevention: 'Albanian citizens can enter North Macedonia with just ID card. Bring passport anyway.',
          severity: 'rare'
        },
        {
          title: 'Wrong VFS Center Location',
          description: 'Going to wrong address in Skopje.',
          prevention: 'VFS Netherlands is at: GTC Mall, Kej 13 Noemvri, Skopje. NOT the embassy itself.',
          severity: 'occasional'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://www.vfsglobal.com/Netherlands/northmacedonia/',
          title: 'VFS Global - Netherlands Visa Skopje',
          type: 'verified-third-party',
          lastVerified: '2026-02-08',
          notes: 'Book appointments here. Create account first.'
        },
        {
          url: 'https://www.netherlandsandyou.nl/web/north-macedonia/travel/visas-for-the-netherlands',
          title: 'Dutch Embassy Skopje - Visa Info',
          type: 'official',
          lastVerified: '2026-02-08'
        },
        {
          url: 'https://www.rome2rio.com/map/Tirana/Skopje',
          title: 'Travel Tirana to Skopje',
          type: 'verified-third-party',
          lastVerified: '2026-02-08',
          notes: 'Bus options and schedules'
        }
      ],
      
      countrySpecificNotes: {
        'AL': `⚠️ CRITICAL FOR ALBANIAN STUDENTS:

📍 VFS GLOBAL ADDRESS: GTC Mall, Kej 13 Noemvri, Skopje, North Macedonia
📍 EMBASSY ADDRESS (if needed): Leninova 69-71, 1000 Skopje
📞 VFS Tel: +389 2 551 9003
📧 Embassy: sko@minbuza.nl

🚌 GETTING THERE FROM TIRANA:
• Bus Terminal: Terminali Lindor (Eastern Terminal), Rruga e Dibrës
• Companies: Relax Company, Albatros
• Duration: 5-6 hours
• Cost: €15-25 one-way
• Leave early morning or take overnight bus night before

💡 RECOMMENDED ITINERARY:
• Day 1 PM: Bus Tirana→Skopje (arrive evening)
• Day 1 Night: Hotel near city center
• Day 2 AM: VFS appointment (usually 8-10 AM)
• Day 2 PM: Bus back to Tirana

🏨 BUDGET HOTELS NEAR VFS:
• Hotel Square (€35/night) - 5 min walk
• HI Skopje Hostel (€15/night) - 10 min walk
• Hotel Pelister (€30/night) - city center

📝 AFTER APPOINTMENT:
• Passport kept for 1-2 weeks for MVV sticker
• VFS offers courier return service (€20) - RECOMMENDED
• Or second trip to collect passport`
      },
      
      tips: [
        '⚠️ NO Dutch embassy in Albania - SKOPJE is mandatory!',
        'Book appointment: vfsglobal.com/Netherlands/northmacedonia/',
        'Bus Tirana→Skopje: ~5-6 hours, €15-25 one-way',
        'Travel day before - appointments often early morning (8-9 AM)',
        'Bring ALL original documents + copies',
        'VFS address: GTC Mall, Kej 13 Noemvri, Skopje',
        'Embassy address: Leninova 69-71, 1000 Skopje',
        'Alternative: Athens embassy (longer trip but sometimes faster slots)',
        'Consider VFS courier return service (€20) to avoid second trip'
      ],
      
      lastVerified: '2026-02-08'
    },

    // ============================================
    // STEP 7: Travel to Netherlands
    // ============================================
    {
      id: 'step-7-travel',
      order: 7,
      title: '✈️ Travel to Netherlands',
      description: 'Travel to the Netherlands within MVV validity period (90 days). Arrive before your program start date for orientation.',
      estimatedTime: 'Within 90 days of MVV',
      status: 'pending',
      
      primaryAction: {
        label: 'Check Flights to Amsterdam',
        url: 'https://www.skyscanner.net/routes/tia/ams/tirana-mother-teresa-to-amsterdam-schiphol.html',
        type: 'external',
        notes: 'Compare prices. Book after receiving passport with MVV.'
      },
      
      documentsRequired: [
        {
          name: 'Passport with MVV Sticker',
          required: true,
          description: 'Check MVV validity - must enter Netherlands within 90 days',
          validityPeriod: '90 days from collection'
        },
        {
          name: 'Admission Letter',
          required: true,
          description: 'Carry for potential immigration questions'
        },
        {
          name: 'Proof of Accommodation',
          required: true,
          description: 'University housing confirmation or rental contract'
        },
        {
          name: 'Travel Insurance',
          required: true,
          description: 'Covers trip until Dutch health insurance starts. Popular providers: World Nomads, SafetyWing.'
        },
        {
          name: 'Sufficient Cash/Card',
          required: true,
          description: 'For first weeks before bank account opens. €500+ recommended.'
        },
        {
          name: 'COVID Vaccination Certificate',
          required: false,
          description: 'Check current requirements before travel. Requirements change - verify on netherlandsworldwide.nl'
        }
      ],
      
      fees: [
        {
          amount: 150,
          currency: 'EUR',
          description: 'Flight Tirana → Amsterdam (typical)',
          notes: 'Varies €100-300. Book 2-3 weeks in advance for best prices.'
        }
      ],
      
      pitfalls: [
        {
          title: 'MVV Expiry',
          description: 'MVV is only valid for 90 days from collection.',
          prevention: 'Book flight immediately after getting passport back. Don\'t wait.',
          severity: 'common'
        },
        {
          title: 'Arriving Too Late for Orientation',
          description: 'Missing mandatory orientation/introduction week.',
          prevention: 'Arrive 1-2 weeks before program start. Check exact dates with university.',
          severity: 'occasional'
        },
        {
          title: 'No Accommodation Arranged',
          description: 'Arriving without confirmed housing.',
          prevention: 'Book university housing or find room BEFORE flying. SSH, Room.nl, or university housing office.',
          severity: 'common'
        },
        {
          title: 'Not Enough Cash for First Days',
          description: 'Can\'t pay for things before opening Dutch bank account.',
          prevention: 'Bring €500+ cash or card that works internationally. Bank account takes 1-2 weeks.',
          severity: 'occasional'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/short-stay-schengen-visa',
          title: 'Netherlands Worldwide - Entry Requirements',
          type: 'official',
          lastVerified: '2026-02-08'
        },
        {
          url: 'https://www.schiphol.nl/en/',
          title: 'Amsterdam Schiphol Airport',
          type: 'official',
          lastVerified: '2026-02-08'
        }
      ],
      
      countrySpecificNotes: {
        'AL': 'Direct flights Tirana (TIA) → Amsterdam (AMS) available. Also consider: Tirana→Vienna→Amsterdam or Tirana→Munich→Amsterdam for cheaper options. Wizz Air and others fly from Tirana.'
      },
      
      tips: [
        'Book flight after getting MVV in passport',
        'Many students arrive 1-2 weeks early for orientation',
        'Carry all original documents in hand luggage',
        'University often arranges airport pickup',
        'Bring warm clothes - Netherlands is colder than Albania!',
        'Join university\'s international student WhatsApp/Telegram groups before arrival'
      ],
      
      lastVerified: '2026-02-08'
    },

    // ============================================
    // STEP 8: Registration in Netherlands
    // ============================================
    {
      id: 'step-8-registration',
      order: 8,
      title: '🏠 Registration & Settlement in Netherlands',
      description: 'Register at municipality (gemeente), collect residence permit at IND, get BSN (citizen service number), and open Dutch bank account.',
      estimatedTime: '1-3 weeks after arrival',
      status: 'pending',
      
      primaryAction: {
        label: 'Find Your Municipality',
        url: 'https://www.government.nl/topics/municipalities/municipalities-by-province',
        type: 'external',
        notes: 'Register at the gemeente where you\'ll live. University city.'
      },
      
      portalUrl: 'https://ind.nl/en/contact/locations-desk-and-collection',
      
      documentsRequired: [
        {
          name: 'Passport with MVV',
          required: true,
          description: 'Original passport with MVV sticker'
        },
        {
          name: 'Birth Certificate (Apostilled)',
          required: true,
          obtainFrom: 'Albanian Civil Registry Office',
          apostilleRequired: true,
          description: 'For municipality registration',
          estimatedTime: '1-2 weeks to obtain'
        },
        {
          name: 'Proof of Address',
          required: true,
          description: 'Rental contract or university housing confirmation. Must be official letter from housing provider.'
        },
        {
          name: 'IND Appointment Letter',
          required: true,
          obtainFrom: 'University arranges this',
          description: 'For residence permit collection'
        }
      ],
      
      fees: [
        {
          amount: 0,
          currency: 'EUR',
          description: 'Municipality Registration',
          notes: 'Free in most municipalities'
        },
        {
          amount: 0,
          currency: 'EUR',
          description: 'BSN Assignment',
          notes: 'Free - automatic with municipality registration'
        },
        {
          amount: 0,
          currency: 'EUR',
          description: 'Bank Account Opening',
          notes: 'Free at most banks for students. Try ING, ABN AMRO, Rabobank'
        },
        {
          amount: 130,
          currency: 'EUR',
          description: 'Health Insurance (monthly)',
          notes: 'Mandatory Dutch basic insurance. Student options: Zilveren Kruis, CZ, AON Student Insurance'
        }
      ],
      
      pitfalls: [
        {
          title: 'Late Municipality Registration',
          description: 'Not registering within 5 days of arrival.',
          prevention: 'Book gemeente appointment BEFORE arrival if possible. Many cities have online booking.',
          severity: 'common'
        },
        {
          title: 'No Fixed Address',
          description: 'Can\'t register without a confirmed address.',
          prevention: 'Secure housing BEFORE arriving. Temporary hotel doesn\'t count.',
          severity: 'common'
        },
        {
          title: 'Missing Birth Certificate',
          description: 'Gemeente requires apostilled birth certificate for registration.',
          prevention: 'Get this from Albania BEFORE leaving. Apostille required.',
          severity: 'common'
        },
        {
          title: 'Bank Account Without BSN',
          description: 'Most banks require BSN to open account.',
          prevention: 'Register at gemeente first, get BSN, then open bank. Takes 1-2 weeks total.',
          severity: 'common'
        },
        {
          title: 'No Health Insurance',
          description: 'Dutch health insurance is mandatory within 4 months.',
          prevention: 'Get basic health insurance (basispakket) within 4 months. ~€130/month. AON offers student packages.',
          severity: 'occasional'
        }
      ],
      
      verifiedSources: [
        {
          url: 'https://www.government.nl/topics/bsn/contents/applying-for-a-bsn',
          title: 'BSN Application',
          type: 'government',
          lastVerified: '2026-02-08'
        },
        {
          url: 'https://ind.nl/en/contact/locations-desk-and-collection',
          title: 'IND Desk Locations',
          type: 'official',
          lastVerified: '2026-02-08',
          notes: 'Find IND desk to collect residence permit'
        },
        {
          url: 'https://www.iamsterdam.com/en/living/take-care-of-official-matters/registration',
          title: 'I amsterdam - Registration Guide',
          type: 'verified-third-party',
          lastVerified: '2026-02-08',
          notes: 'Helpful guide for Amsterdam residents'
        }
      ],
      
      countrySpecificNotes: {
        'AL': 'Albanian birth certificates need apostille from Ministry of Foreign Affairs in Tirana. Get this BEFORE leaving Albania! Çertifikatë Lindje from Zyra e Gjendjes Civile + apostille.'
      },
      
      tips: [
        'Register at gemeente within 5 days of arrival - REQUIRED BY LAW',
        'Need registered address (university housing or private rental)',
        'BSN required for everything: bank, phone, healthcare, work',
        'University international office helps with IND appointment',
        'Open bank account after getting BSN (ING, ABN AMRO popular for students)',
        'Get health insurance within 4 months (mandatory)',
        'DigiD (digital identity) useful for many Dutch services'
      ],
      
      lastVerified: '2026-02-08'
    }
  ]
};

export default albaniaStudentRoadmap;
