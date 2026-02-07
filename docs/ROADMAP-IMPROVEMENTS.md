# Roadmap Generation System - Research & Improvement Recommendations

**Research Agent:** RESEARCH-ROADMAP  
**Date:** 2026-02-07

---

## 1. Current System Analysis

### Current Data Structure (`roadmap-types.ts`)
```typescript
interface RoadmapStep {
  id: string;
  order: number;
  title: string;                // Generic: "Apply for MVV"
  description: string;          // Often vague
  estimatedTime?: string;       // Just a string, no breakdown
  status: RoadmapStepStatus;
  tips?: string[];              // Helpful but unstructured
  sources?: RoadmapSource[];    // Just label + URL
  completedAt?: string;
  notes?: string;
}
```

### Problems Identified:
1. **Too Generic** - Titles like "Apply for MVV" don't tell users WHERE or HOW
2. **Missing Actionable Details** - No form numbers, no portal links, no specific costs
3. **No Cost Information** - Fees are a huge concern for migrants
4. **Vague Time Estimates** - "2-3 weeks" doesn't account for appointment wait times
5. **No Prerequisites** - Steps don't link to what must be done first
6. **No Warnings/Pitfalls** - Common mistakes aren't highlighted
7. **No Contact Information** - Who to call when stuck?
8. **Sources Are Too Basic** - Just a label and URL, no context

---

## 2. Recommended Improved Data Structure

```typescript
interface ImprovedRoadmapStep {
  id: string;
  order: number;
  
  // Core Information
  title: string;                    // Specific: "Submit TEV Application (Form 7527)"
  summary: string;                  // One-line action summary
  description: string;              // Detailed explanation
  
  // Actionable Details
  action: {
    type: 'form' | 'appointment' | 'payment' | 'document' | 'registration' | 'other';
    formNumber?: string;            // "7527" for TEV application
    formName?: string;              // "Application for residence permit and MVV"
    formUrl?: string;               // Direct PDF link
    portalUrl?: string;             // Online submission portal
    portalName?: string;            // "IND Online Portal"
    appointmentUrl?: string;        // Where to book appointments
    paymentUrl?: string;            // Where to pay fees
    locationAddress?: string;       // Physical address if needed
  };
  
  // Financial Information
  costs: {
    fee: number;                    // In euros
    feeDescription: string;         // What the fee covers
    feeUrl?: string;                // Link to official fee page
    paymentMethods: string[];       // ["iDEAL", "Credit Card", "Bank Transfer"]
    additionalCosts?: {             // Other costs
      description: string;
      amount: number;
    }[];
    feeExemptions?: string[];       // Who might pay less
  };
  
  // Time Estimates (Granular)
  timing: {
    preparationTime: string;        // "1-2 days" to gather documents
    appointmentWaitTime?: string;   // "2-4 weeks" for embassy appointment
    processingTime: string;         // "90 days maximum" for IND decision
    totalEstimate: string;          // "2-4 months" end-to-end
    deadline?: string;              // "Within 3 weeks of embassy visit"
  };
  
  // Prerequisites & Dependencies
  prerequisites: {
    stepIds: string[];              // IDs of steps that must be complete
    documents: string[];            // Documents needed
    conditions: string[];           // "Partner must earn €2,294/month minimum"
  };
  
  // Helpful Information
  tips: string[];
  warnings: string[];               // NEW: Common mistakes to avoid
  commonMistakes: string[];         // NEW: What people get wrong
  
  // Contact Information
  contacts: {
    name: string;                   // "IND Information Line"
    phone?: string;                 // "+31 88 043 0430"
    email?: string;
    hours?: string;                 // "Mon-Fri 9:00-17:00"
    website?: string;
  }[];
  
  // Sources with Context
  sources: {
    label: string;
    url: string;
    description: string;            // Why this source is helpful
    lastVerified?: string;          // When we checked this link
    type: 'official' | 'guide' | 'form' | 'tool';
  }[];
  
  // Status & Progress
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
  blockedReason?: string;           // Why is this blocked?
  completedAt?: string;
  notes?: string;
  
  // Metadata
  applicableTo: string[];           // ["partner-visa", "family-reunification"]
  countrySpecificNotes?: Record<string, string>;  // Notes for specific nationalities
}
```

---

## 3. Official IND Forms & Links Reference

### Key Forms (Always Reference by Number)
| Form # | Name | Purpose | Direct Link |
|--------|------|---------|-------------|
| 7527 | MVV + Residence Permit (TEV) - Partner | Family reunification with partner | `https://ind.nl/en/forms/7527.pdf` |
| 7528 | MVV + Residence Permit - Other Family | Foster/adopted children, other relatives | `https://ind.nl/en/forms/7528.pdf` |
| 7626 | ICT Engagement Letter | Intra-corporate transfers | `https://ind.nl/en/forms/7626.pdf` |
| 7627 | Means Requirement Declaration | Proving sufficient income | `https://ind.nl/en/forms/7627.pdf` |
| 7628 | Medical Circumstances | Health-related applications | `https://ind.nl/en/forms/7628.pdf` |
| 7629 | SEPA Direct Debit Authorization | Fee payment | `https://ind.nl/en/forms/7629.pdf` |
| 7630 | Passport Photo Form | Photo requirements | `https://ind.nl/en/forms/7630.pdf` |
| 7631 | DNA Test Application | Family verification | `https://ind.nl/en/forms/7631.pdf` |
| 7644 | TB Test Exemption | Tuberculosis exemption | `https://ind.nl/en/forms/7644.pdf` |
| 7645 | Authorization Declaration | Third-party representation | `https://ind.nl/en/forms/7645.pdf` |

### Key Portals & URLs
| Portal | URL | Purpose |
|--------|-----|---------|
| IND Main Site | `https://ind.nl/en` | Central information hub |
| IND Forms Search | `https://ind.nl/en/search-form` | Find all forms (236 available) |
| IND Fees Page | `https://ind.nl/en/fees-costs-of-an-application` | Current fee amounts |
| Required Amounts | `https://ind.nl/en/required-amounts-income-requirements` | Salary thresholds |
| Embassy Appointments | `https://www.netherlandsworldwide.nl/making-appointment` | Book embassy visits |
| My IND Portal | `https://ind.nl/en` (Login) | Track applications |
| Sponsor Register | `https://ind.nl/en/public-register-recognised-sponsors` | Check if employer is recognized |
| MVV-Exempt Countries | `https://ind.nl/en/mvv-exemptions` | Check if MVV needed |
| EU/EEA Members | `https://ind.nl/en/member-states-eu-eea` | EU country list |

### 2026 Fee Information (Valid Jan-Dec 2026)
| Application Type | Fee (EUR) |
|-----------------|-----------|
| Family Reunification (partner/child) | ~€210 |
| Highly Skilled Migrant | ~€210 |
| Student Permit | ~€192 |
| Orientation Year | ~€210 |
| Permanent Residence | ~€243 |
| Replacement Card | ~€140 |

*Note: Fees increased 4.4% on 1 Jan 2026*

### 2026 Income Requirements (Jan-Jun 2026)
| Household Type | Gross Monthly (incl. holiday) |
|---------------|-------------------------------|
| Married/Cohabiting Couples | €2,477.95 |
| Singles/Single Parents | €1,734.57 |
| Highly Skilled Migrant (30+) | €5,942 |
| Highly Skilled Migrant (<30) | €4,357 |
| EU Blue Card | €5,942 |

---

## 4. Example: IDEAL Roadmap Step (Partner Visa)

Here's what a truly helpful roadmap step should look like:

```json
{
  "id": "step-1-check-eligibility",
  "order": 1,
  "title": "Verify You Need an MVV (Entry Visa)",
  "summary": "Check if your nationality requires an MVV before traveling to the Netherlands",
  
  "description": "Before starting the application process, confirm whether you need a provisional residence permit (MVV). Citizens of certain countries (USA, UK, Canada, Australia, Japan, South Korea, New Zealand, Monaco, Vatican City, Switzerland, and all EU/EEA countries) are EXEMPT from the MVV requirement and can travel to the Netherlands first, then apply for the residence permit.",
  
  "action": {
    "type": "other",
    "portalUrl": "https://ind.nl/en/mvv-exemptions",
    "portalName": "IND MVV Exemptions List"
  },
  
  "costs": {
    "fee": 0,
    "feeDescription": "No cost for this eligibility check",
    "paymentMethods": []
  },
  
  "timing": {
    "preparationTime": "10 minutes",
    "processingTime": "Instant",
    "totalEstimate": "Same day"
  },
  
  "prerequisites": {
    "stepIds": [],
    "documents": ["Your passport (to check nationality)"],
    "conditions": []
  },
  
  "tips": [
    "Even if you're MVV-exempt, you still need a residence permit for stays over 90 days",
    "If you have dual nationality, check if EITHER exempts you from the MVV",
    "Family members of EU citizens may also be exempt"
  ],
  
  "warnings": [
    "DO NOT travel to NL on a tourist visa if you need an MVV - your application will be rejected",
    "The MVV exemption list can change - always check the official IND page"
  ],
  
  "commonMistakes": [
    "Assuming all Western countries are exempt (they're not - check the list)",
    "Confusing short-stay Schengen visa with MVV requirement"
  ],
  
  "contacts": [{
    "name": "IND Information Line",
    "phone": "+31 88 043 0430",
    "hours": "Mon-Fri 9:00-17:00 CET",
    "website": "https://ind.nl/en/contact"
  }],
  
  "sources": [
    {
      "label": "IND MVV Exemptions",
      "url": "https://ind.nl/en/mvv-exemptions",
      "description": "Official list of nationalities exempt from MVV requirement",
      "type": "official",
      "lastVerified": "2026-02-07"
    },
    {
      "label": "What is an MVV?",
      "url": "https://ind.nl/en/provisional-residence-permit-mvv",
      "description": "Explanation of the provisional residence permit",
      "type": "official"
    }
  ],
  
  "status": "pending",
  "applicableTo": ["partner-visa", "family-reunification", "work-visa", "study-visa"],
  
  "countrySpecificNotes": {
    "US": "US citizens are exempt from MVV. You can enter NL visa-free and apply for residence permit after arrival.",
    "IN": "Indian citizens REQUIRE an MVV. Apply through the Dutch embassy in India.",
    "CN": "Chinese citizens REQUIRE an MVV. Apply through the Dutch embassy in China.",
    "TR": "Turkish citizens pay reduced fees under the EC-Turkey Association Agreement."
  }
}
```

### Second Example: Concrete Application Step

```json
{
  "id": "step-3-embassy-appointment",
  "order": 3,
  "title": "Book and Attend Embassy Appointment",
  "summary": "Schedule your appointment at the Dutch embassy to submit biometric data",
  
  "description": "Make an appointment at the Dutch embassy or consulate in your country of residence. During this appointment, you will submit your application form, provide your passport and photo, and give your fingerprints and signature for the residence permit. The embassy will fill in the application date and give you a receipt with your V-number (your personal IND reference number).",
  
  "action": {
    "type": "appointment",
    "appointmentUrl": "https://www.netherlandsworldwide.nl/making-appointment",
    "portalName": "Netherlands Worldwide - Embassy Appointments",
    "formNumber": "7527",
    "formUrl": "https://ind.nl/en/forms/7527.pdf"
  },
  
  "costs": {
    "fee": 210,
    "feeDescription": "TEV application fee (MVV + residence permit together)",
    "feeUrl": "https://ind.nl/en/fees-costs-of-an-application",
    "paymentMethods": ["Bank Transfer", "Credit Card"],
    "additionalCosts": [
      {
        "description": "Passport photos (2 required)",
        "amount": 10
      },
      {
        "description": "Document legalization/apostille",
        "amount": 50
      }
    ],
    "feeExemptions": [
      "Turkish nationals pay reduced fees",
      "San Marino and Israeli citizens are exempt from MVV fee"
    ]
  },
  
  "timing": {
    "preparationTime": "1-2 weeks to gather documents",
    "appointmentWaitTime": "2-6 weeks depending on embassy location",
    "processingTime": "N/A - this is just the submission",
    "totalEstimate": "3-8 weeks from deciding to apply",
    "deadline": "None, but book early as slots fill up"
  },
  
  "prerequisites": {
    "stepIds": ["step-1-check-eligibility", "step-2-gather-documents"],
    "documents": [
      "Completed Form 7527 (TEV application)",
      "Valid passport (valid for duration of intended stay)",
      "2 recent passport photos (35x45mm)",
      "Proof of relationship (marriage certificate or cohabitation proof)",
      "Partner's proof of income (pay slips, employment contract)",
      "Partner's valid residence permit or Dutch passport copy"
    ],
    "conditions": [
      "Partner in NL must earn at least €2,477.95/month gross (2026 rates)",
      "Both partners must be 21+ years old (18+ if legally married before arrival)",
      "Relationship must be exclusive and durable"
    ]
  },
  
  "tips": [
    "Book the earliest available appointment - waiting times vary greatly by embassy",
    "Bring originals AND copies of all documents",
    "All foreign documents must be legalized/apostilled and translated to Dutch or English",
    "The embassy will give you a receipt - KEEP THIS SAFE, it has your V-number"
  ],
  
  "warnings": [
    "You only have 3 WEEKS after the embassy appointment to send documents to IND and pay the fee",
    "Missing the 3-week deadline means starting the entire process over",
    "If your embassy doesn't have appointments available, you can use the nearest embassy in another country"
  ],
  
  "commonMistakes": [
    "Not bringing passport photos that meet Dutch requirements",
    "Forgetting to get marriage certificate translated and legalized",
    "Assuming you can pay at the embassy (payment goes directly to IND)",
    "Not checking partner's income meets the threshold BEFORE applying"
  ],
  
  "contacts": [
    {
      "name": "Netherlands Worldwide (Embassy Info)",
      "website": "https://www.netherlandsworldwide.nl",
      "phone": "Varies by embassy"
    },
    {
      "name": "IND Information Line",
      "phone": "+31 88 043 0430",
      "hours": "Mon-Fri 9:00-17:00 CET"
    }
  ],
  
  "sources": [
    {
      "label": "Apply for MVV and Residence Permit from Abroad",
      "url": "https://ind.nl/en/apply-for-mvv-and-residence-permit-from-abroad",
      "description": "Complete official guide to the TEV procedure",
      "type": "official",
      "lastVerified": "2026-02-07"
    },
    {
      "label": "Form 7527 (Partner TEV Application)",
      "url": "https://ind.nl/en/forms/7527.pdf",
      "description": "The actual application form to fill out",
      "type": "form"
    },
    {
      "label": "Make an Embassy Appointment",
      "url": "https://www.netherlandsworldwide.nl/making-appointment",
      "description": "Portal to find and book embassy appointments worldwide",
      "type": "tool"
    }
  ],
  
  "status": "pending",
  "applicableTo": ["partner-visa", "family-reunification"]
}
```

---

## 5. Implementation Recommendations

### For the LLM Prompt (Roadmap Generation)
When generating roadmaps, the AI should be instructed to:

1. **Always include form numbers** - "Submit Form 7527" not "Submit the application"
2. **Always include direct links** - Every action should have a clickable URL
3. **Always include costs** - Both official fees and typical additional costs
4. **Break down time estimates** - Prep time + wait time + processing time
5. **List specific documents needed** - Not "gather documents" but list each one
6. **Include country-specific notes** - Different rules for different nationalities
7. **Add warnings prominently** - Mistakes that cause rejection should be highlighted
8. **Include contact info** - Who to call when stuck

### For the Frontend (`RoadmapStepCard.tsx`)
Add visual sections for:
- 💰 **Cost Breakdown** - Fee + additional costs in a clear box
- 📋 **Documents Checklist** - Clickable checklist users can mark
- ⚠️ **Warnings Section** - Red/orange highlighted common mistakes
- 📞 **Help Section** - Contacts with click-to-call on mobile
- 🔗 **Action Buttons** - "Download Form", "Book Appointment", "Pay Fee"
- ⏰ **Timeline Visual** - Show prep → wait → processing phases

### Database/Storage Considerations
- Cache form URLs and verify periodically (IND sometimes changes URLs)
- Store fee amounts with effective dates (fees change annually on Jan 1)
- Include income thresholds with valid date ranges

---

## 6. Quick Reference: Common Migration Paths

### Partner Visa (Family Reunification)
1. Check MVV requirement
2. Partner in NL gathers income proof
3. Applicant gathers relationship proof + passport photos
4. Book embassy appointment
5. Attend appointment, submit biometrics
6. Send documents to IND within 3 weeks
7. Pay €210 fee within 3 weeks
8. Wait 90 days for decision
9. Collect MVV sticker at embassy
10. Travel to NL, pick up residence card

### Highly Skilled Migrant
1. Employer must be recognized sponsor (check register)
2. Salary must meet threshold (€5,942/mo if 30+, €4,357 if <30)
3. Employer submits application via Business Portal
4. If MVV needed: applicant gets MVV sticker
5. Travel to NL
6. Pick up residence card at IND desk

### Student Visa
1. Get accepted by Dutch educational institution
2. University handles application as sponsor
3. If MVV needed: collect at embassy
4. Travel to NL
5. Register at municipality (get BSN)
6. TB test if required
7. Get Dutch health insurance

---

## 7. Summary

**The goal:** Roadmaps so specific that users can follow them WITHOUT needing to search for anything else.

**Key improvements needed:**
1. ✅ Structured action data (form numbers, portal URLs)
2. ✅ Detailed cost breakdown with current fees
3. ✅ Granular time estimates (prep/wait/processing)
4. ✅ Prerequisites and document checklists
5. ✅ Warnings and common mistakes sections
6. ✅ Contact information for help
7. ✅ Verified, typed sources with descriptions
8. ✅ Country-specific variations

**This document should be used as reference when generating roadmaps to ensure maximum usefulness for migrants.**
