# Implementation Plan: Hyper-Specific Roadmaps

**Created:** 2026-02-08  
**Priority:** HIGH  
**Estimated Total Effort:** 8-12 hours  

---

## 🎯 Problem Statement

Current roadmap steps are generic:
```
"Submit documents to IND"
```

Users must then Google to find:
- Which portal?
- What forms?
- What fees?
- How long?

**Goal:** Every roadmap step is so specific that users can act WITHOUT additional research.

---

## 📋 Implementation Plan

### Phase 1: Data Structure Enhancement (3-4 hours)

#### 1.1 New TypeScript Interfaces

**File:** `/root/clawd/heerlen-hackathon/web/src/lib/roadmap-types.ts`

```typescript
// ============================================
// ENHANCED ROADMAP TYPES FOR HYPER-SPECIFICITY
// ============================================

export type RoadmapStepStatus = 'pending' | 'in-progress' | 'complete';
export type ResponsibleParty = 'applicant' | 'employer' | 'institution' | 'ind' | 'embassy' | 'municipality';

/**
 * Verified source with provenance tracking
 */
export interface VerifiedSource {
  label: string;
  url: string;
  type: 'official' | 'government' | 'verified-third-party' | 'community';
  lastVerified: string; // ISO date: "2026-02-08"
  language?: 'en' | 'nl' | 'other';
  documentType?: 'webpage' | 'pdf' | 'form' | 'portal';
}

/**
 * Direct action link - the exact URL to complete this step
 */
export interface ActionLink {
  label: string;
  url: string;
  type: 'portal' | 'form' | 'booking' | 'download' | 'info';
  requiresAuth?: boolean;
  notes?: string;
}

/**
 * Fee information with currency and notes
 */
export interface StepFee {
  amount: number;
  currency: 'EUR' | 'USD' | 'ALL'; // ALL = Albanian Lek
  description: string;
  validUntil?: string; // "2026-12-31"
  paymentMethod?: string;
  paidBy?: ResponsibleParty;
}

/**
 * Required document for this specific step
 */
export interface StepDocument {
  name: string;
  required: boolean;
  description?: string;
  obtainFrom?: string;
  obtainUrl?: string;
  processingTime?: string;
  cost?: StepFee;
  apostilleRequired?: boolean;
  validityPeriod?: string; // "3 months", "2 years"
}

/**
 * Common pitfall specific to this step
 */
export interface StepPitfall {
  issue: string;
  consequence: string;
  prevention: string;
  frequency?: 'common' | 'occasional' | 'rare';
}

/**
 * THE ENHANCED ROADMAP STEP
 * Every field is designed for ACTIONABILITY
 */
export interface RoadmapStep {
  id: string;
  order: number;
  
  // ===== WHAT TO DO =====
  title: string;
  action: string; // Specific action verb: "Submit TEV application via IND Business Portal"
  description: string;
  
  // ===== WHERE TO DO IT =====
  primaryAction?: ActionLink; // THE main button/link for this step
  additionalLinks?: ActionLink[]; // Supporting links
  
  // ===== OFFICIAL REFERENCES =====
  formNumber?: string; // "Form 7626", "TEV Application"
  portalName?: string; // "IND Business Portal", "Studielink"
  portalUrl?: string; // Direct link to the portal
  
  // ===== COSTS =====
  fees?: StepFee[];
  totalEstimatedCost?: number; // Sum in EUR
  
  // ===== TIMING =====
  estimatedDuration: string; // "2-4 weeks"
  deadline?: string; // If there's a specific deadline
  validityPeriod?: string; // How long the result is valid
  
  // ===== RESPONSIBILITY =====
  responsible: ResponsibleParty;
  applicantActions?: string[]; // What YOU specifically do
  otherPartyActions?: string[]; // What they do
  
  // ===== DOCUMENTS NEEDED =====
  documentsRequired?: StepDocument[];
  
  // ===== GUIDANCE =====
  tips: string[];
  pitfalls?: StepPitfall[];
  
  // ===== VERIFICATION =====
  sources: VerifiedSource[];
  lastUpdated: string; // ISO date
  
  // ===== USER STATE =====
  status: RoadmapStepStatus;
  completedAt?: string;
  notes?: string;
  
  // ===== CONDITIONAL LOGIC =====
  conditions?: {
    showIf?: Record<string, string | boolean>; // e.g., { "visaType": "student" }
    skipIf?: Record<string, string | boolean>;
  };
}

// Legacy compatibility - maps to old structure
export interface RoadmapSource {
  label: string;
  url?: string;
}

export interface Roadmap {
  id: string;
  name: string;
  nationality: string;
  destination: string;
  visaType: string;
  createdAt: string;
  updatedAt: string;
  lastVerified: string;
  steps: RoadmapStep[];
  
  // Metadata
  totalEstimatedTime: string;
  totalEstimatedCost: number;
  criticalWarnings?: string[]; // e.g., "No Dutch embassy in Albania!"
}
```

**Effort:** 1.5 hours  
**Priority:** P0 (blocks everything else)

---

#### 1.2 Update CreateRoadmapParams for LLM Tool Calls

```typescript
export interface CreateRoadmapParams {
  name: string;
  nationality: string;
  destination: string;
  visaType: string;
  steps: Array<{
    title: string;
    action: string;
    description: string;
    responsible: ResponsibleParty;
    
    primaryAction?: {
      label: string;
      url: string;
      type: 'portal' | 'form' | 'booking' | 'download' | 'info';
    };
    
    formNumber?: string;
    portalName?: string;
    portalUrl?: string;
    
    fees?: Array<{
      amount: number;
      currency: 'EUR';
      description: string;
    }>;
    
    estimatedDuration: string;
    tips?: string[];
    
    pitfalls?: Array<{
      issue: string;
      prevention: string;
    }>;
    
    sources: Array<{
      label: string;
      url: string;
      type: 'official' | 'government' | 'verified-third-party';
    }>;
    
    documentsRequired?: Array<{
      name: string;
      required: boolean;
      obtainUrl?: string;
    }>;
  }>;
}
```

**Effort:** 0.5 hours

---

### Phase 2: UI Component Enhancement (2-3 hours)

#### 2.1 Enhanced RoadmapStepCard Component

**File:** `/root/clawd/heerlen-hackathon/web/src/components/RoadmapStepCard.tsx`

**New Sections to Add:**

```tsx
{/* PRIMARY ACTION BUTTON - The main CTA */}
{step.primaryAction && (
  <div className="mt-4">
    <a
      href={step.primaryAction.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
    >
      <span>{step.primaryAction.label}</span>
      <ExternalLinkIcon className="w-4 h-4" />
    </a>
    {step.primaryAction.notes && (
      <p className="mt-2 text-xs text-slate-500">{step.primaryAction.notes}</p>
    )}
  </div>
)}

{/* FEES BREAKDOWN */}
{step.fees && step.fees.length > 0 && (
  <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
    <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
      <span>💰</span> Costs
    </h4>
    <ul className="space-y-2">
      {step.fees.map((fee, idx) => (
        <li key={idx} className="flex justify-between text-sm">
          <span className="text-green-900">{fee.description}</span>
          <span className="font-bold text-green-700">
            {fee.currency === 'EUR' ? '€' : fee.currency}{fee.amount}
          </span>
        </li>
      ))}
    </ul>
    {step.totalEstimatedCost && (
      <div className="mt-3 pt-3 border-t border-green-200 flex justify-between font-bold">
        <span>Total</span>
        <span className="text-green-700">€{step.totalEstimatedCost}</span>
      </div>
    )}
  </div>
)}

{/* DOCUMENTS CHECKLIST */}
{step.documentsRequired && step.documentsRequired.length > 0 && (
  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
    <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
      <span>📄</span> Documents Needed
    </h4>
    <ul className="space-y-2">
      {step.documentsRequired.map((doc, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 rounded" />
          <div>
            <span className={doc.required ? 'font-medium' : ''}>
              {doc.name}
              {doc.required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {doc.obtainUrl && (
              <a href={doc.obtainUrl} target="_blank" className="ml-2 text-purple-600 text-xs">
                Get it →
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

{/* PITFALLS / WARNINGS */}
{step.pitfalls && step.pitfalls.length > 0 && (
  <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
    <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
      <span>⚠️</span> Common Pitfalls
    </h4>
    {step.pitfalls.map((pitfall, idx) => (
      <div key={idx} className="mb-3 last:mb-0">
        <p className="text-sm font-medium text-red-900">{pitfall.issue}</p>
        <p className="text-xs text-red-700 mt-1">
          ✓ Prevention: {pitfall.prevention}
        </p>
      </div>
    ))}
  </div>
)}

{/* VERIFICATION BADGE */}
<div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
  <span className="flex items-center gap-1">
    <CheckCircleIcon className="w-3 h-3 text-green-500" />
    Last verified: {step.lastUpdated}
  </span>
  <span>•</span>
  <span>{step.sources.length} official sources</span>
</div>
```

**Effort:** 2 hours

---

### Phase 3: Example Data Transformation (2-3 hours)

#### 3.1 Albania Student Visa - Hyper-Specific Version

**Before (generic):**
```typescript
{
  title: 'University Submits TEV Application',
  description: 'Your university submits the combined MVV + residence permit application to IND.',
  estimatedTime: '1-2 weeks'
}
```

**After (hyper-specific):**
```typescript
{
  id: 'step-3-tev-submit',
  order: 3,
  
  title: 'TEV Application Submission',
  action: 'Provide documents to university international office for TEV submission',
  description: 'Your university (as recognized sponsor) submits the combined MVV + residence permit (TEV) application to IND on your behalf via the IND Business Portal.',
  
  responsible: 'institution',
  applicantActions: [
    'Gather all required documents (see checklist below)',
    'Upload documents to university portal or email to international office',
    'Pay application fee (if not covered by university)',
    'Sign authorization form for university to submit on your behalf'
  ],
  otherPartyActions: [
    'University international office reviews your documents',
    'University submits TEV via IND Business Portal',
    'University tracks application status'
  ],
  
  primaryAction: {
    label: 'Contact Your University International Office',
    url: 'https://www.studyinholland.nl/plan-your-stay/visas-and-permits',
    type: 'info',
    notes: 'Each university has its own portal - check your admission email'
  },
  
  formNumber: 'TEV Application (combined MVV + VVR)',
  portalName: 'IND Business Portal',
  portalUrl: 'https://ind.nl/en/service-and-contact/ind-business-portal',
  
  fees: [
    {
      amount: 225,
      currency: 'EUR',
      description: 'TEV Application Fee (Study purpose)',
      paidBy: 'applicant',
      paymentMethod: 'Usually paid through university',
      validUntil: '2026-12-31'
    }
  ],
  totalEstimatedCost: 225,
  
  estimatedDuration: '1-2 weeks to gather documents; 2-6 weeks IND processing',
  
  documentsRequired: [
    {
      name: 'Valid Passport',
      required: true,
      description: 'Valid for at least 1 year beyond planned stay',
      validityPeriod: 'Must have 2+ blank pages'
    },
    {
      name: 'Passport Photos',
      required: true,
      description: '35x45mm, white background',
      obtainUrl: 'https://www.government.nl/topics/identification-documents/passport/passport-photo'
    },
    {
      name: 'Proof of Sufficient Funds',
      required: true,
      description: '€13,350 minimum in bank account',
      obtainFrom: 'Your bank',
      validityPeriod: 'Bank statement must be < 1 month old'
    },
    {
      name: 'Admission Letter',
      required: true,
      description: 'Official admission from Dutch university',
      obtainFrom: 'University'
    },
    {
      name: 'Proof of Tuition Payment',
      required: true,
      description: 'Receipt showing tuition paid or first installment'
    },
    {
      name: 'High School Diploma (Apostilled)',
      required: true,
      description: 'Albanian diploma with apostille',
      obtainUrl: 'https://punetejashtme.gov.al/en/',
      processingTime: '5-10 business days',
      apostilleRequired: true
    },
    {
      name: 'TB Test Certificate',
      required: true,
      description: 'From approved clinic - Albania is on TB-test required list',
      obtainFrom: 'Approved medical clinic'
    }
  ],
  
  tips: [
    '📧 Check university admission email for exact document submission portal',
    '💰 Financial proof: €13,350 must be in YOUR account (not parents) OR have sponsor declaration',
    '🏦 Bank statement must be less than 1 month old at submission',
    '📅 Apply 3-4 months before program starts - summer processing is slower',
    '✅ University tracks status - you can ask international office for updates'
  ],
  
  pitfalls: [
    {
      issue: 'Bank statement too old',
      consequence: 'Application delayed or rejected',
      prevention: 'Get fresh bank statement (< 1 month old) right before submission',
      frequency: 'common'
    },
    {
      issue: 'Funds in parents account, not applicants',
      consequence: 'IND may not accept as proof',
      prevention: 'Transfer to your account OR get formal sponsor declaration signed by parents',
      frequency: 'common'
    },
    {
      issue: 'Missing apostille on diploma',
      consequence: 'Application cannot proceed',
      prevention: 'Get apostille from Albanian Ministry of Foreign Affairs BEFORE sending documents',
      frequency: 'occasional'
    }
  ],
  
  sources: [
    {
      label: 'IND - Study at University Permit',
      url: 'https://ind.nl/en/residence-permits/study/study-at-university',
      type: 'official',
      lastVerified: '2026-02-08',
      language: 'en',
      documentType: 'webpage'
    },
    {
      label: 'IND - 2026 Fee Schedule',
      url: 'https://ind.nl/en/fees-costs-of-an-application',
      type: 'official',
      lastVerified: '2026-02-08',
      language: 'en'
    },
    {
      label: 'IND - Financial Requirements 2026',
      url: 'https://ind.nl/en/required-amounts-income-requirements',
      type: 'official',
      lastVerified: '2026-02-08',
      language: 'en'
    },
    {
      label: 'Study in Holland - Visa Guide',
      url: 'https://www.studyinholland.nl/plan-your-stay/visas-and-permits',
      type: 'government',
      lastVerified: '2026-02-08',
      language: 'en'
    }
  ],
  
  lastUpdated: '2026-02-08',
  status: 'pending'
}
```

**Effort:** 2-3 hours (for full Albania student visa transformation)

---

### Phase 4: Critical Step - Skopje Embassy Visit (Showcase)

This is the MOST critical step for Albanian applicants. Here's the hyper-specific version:

```typescript
{
  id: 'step-6-skopje-mvv',
  order: 6,
  
  title: '🚌 TRAVEL TO SKOPJE - Collect MVV',
  action: 'Book appointment at VFS Global Skopje and travel to collect your MVV visa sticker',
  
  description: `⚠️ CRITICAL: There is NO Dutch embassy in Albania that processes visas!
You MUST travel to SKOPJE, NORTH MACEDONIA to collect your MVV.
This is mandatory - there is no alternative in Albania.`,
  
  responsible: 'applicant',
  applicantActions: [
    'Book VFS Global appointment in Skopje (do this IMMEDIATELY after IND approval)',
    'Book bus ticket Tirana → Skopje (5-6 hours)',
    'Book accommodation in Skopje (recommended: 1 night)',
    'Gather ALL original documents + photocopies',
    'Attend embassy appointment',
    'Wait for MVV processing (passport kept for 1-2 weeks)',
    'Return to Skopje to collect passport with MVV sticker'
  ],
  
  primaryAction: {
    label: '📅 BOOK VFS SKOPJE APPOINTMENT',
    url: 'https://www.vfsglobal.com/Netherlands/northmacedonia/',
    type: 'booking',
    notes: 'Book IMMEDIATELY after receiving IND approval - slots fill up fast in summer!'
  },
  
  additionalLinks: [
    {
      label: 'Bus Tirana → Skopje (Rome2Rio)',
      url: 'https://www.rome2rio.com/map/Tirana/Skopje',
      type: 'info',
      notes: '5-6 hours, €15-25 one-way'
    },
    {
      label: 'Netherlands Embassy Skopje Info',
      url: 'https://www.netherlandsandyou.nl/web/north-macedonia',
      type: 'info'
    },
    {
      label: 'Booking.com - Skopje Hotels',
      url: 'https://www.booking.com/city/mk/skopje.html',
      type: 'booking',
      notes: 'Budget: €25-50/night near city center'
    }
  ],
  
  fees: [
    {
      amount: 25,
      currency: 'EUR',
      description: 'Bus Tirana → Skopje (one-way)',
      paidBy: 'applicant'
    },
    {
      amount: 25,
      currency: 'EUR',
      description: 'Bus Skopje → Tirana (return)',
      paidBy: 'applicant'
    },
    {
      amount: 40,
      currency: 'EUR',
      description: 'Accommodation in Skopje (1 night)',
      paidBy: 'applicant'
    },
    {
      amount: 20,
      currency: 'EUR',
      description: 'VFS Service Fee (approximate)',
      paidBy: 'applicant'
    }
  ],
  totalEstimatedCost: 110,
  
  estimatedDuration: '1-3 days travel + 1-2 weeks passport processing',
  
  documentsRequired: [
    {
      name: 'Passport (Original)',
      required: true,
      description: 'Will be kept for 1-2 weeks for MVV sticker'
    },
    {
      name: 'IND Approval Letter',
      required: true,
      description: 'Confirmation from university that IND approved'
    },
    {
      name: 'VFS Appointment Confirmation',
      required: true,
      description: 'Printed confirmation of your appointment'
    },
    {
      name: 'Admission Letter (Copy)',
      required: true
    },
    {
      name: 'Proof of Funds (Copy)',
      required: true
    },
    {
      name: 'All Previously Submitted Documents (Copies)',
      required: true,
      description: 'Bring copies of everything you submitted for TEV'
    }
  ],
  
  tips: [
    '🚨 Book appointment SAME DAY you get IND approval - summer slots disappear in days!',
    '🚌 Take early morning bus (6-7 AM) or overnight bus from Tirana',
    '🏨 Book refundable hotel - appointment times can change',
    '📍 Embassy address: Leninova 69-71, 1000 Skopje',
    '⏰ Appointments often 8-9 AM - impossible same-day from Tirana',
    '📱 Bring phone charger + data roaming for maps',
    '💶 Bring extra cash - ATMs available but good to have backup',
    '🎒 Carry originals in hand luggage - never check them!',
    '📅 Passport returned in 1-2 weeks - plan second trip or arrange courier',
    '✈️ Wait for MVV before booking Netherlands flight!'
  ],
  
  pitfalls: [
    {
      issue: 'Assuming there is a Dutch embassy in Albania',
      consequence: 'Wasted time, missed deadlines',
      prevention: 'Accept it: Skopje is the ONLY option. Plan the trip immediately.',
      frequency: 'common'
    },
    {
      issue: 'VFS appointment slots full',
      consequence: 'Delay of weeks, might miss program start',
      prevention: 'Book appointment within 24 hours of IND approval. Check site multiple times daily.',
      frequency: 'common'
    },
    {
      issue: 'Forgetting original documents',
      consequence: 'Wasted trip, must return',
      prevention: 'Make checklist, pack the night before, check in morning',
      frequency: 'occasional'
    },
    {
      issue: 'Arriving same-day from Tirana for early appointment',
      consequence: 'Miss appointment due to bus delays',
      prevention: 'ALWAYS stay overnight in Skopje the night before',
      frequency: 'occasional'
    },
    {
      issue: 'MVV expires before travel',
      consequence: 'Must restart entire visa process',
      prevention: 'MVV valid 90 days - book Netherlands flight within 60 days of collection',
      frequency: 'rare'
    }
  ],
  
  sources: [
    {
      label: 'VFS Global Netherlands - North Macedonia',
      url: 'https://www.vfsglobal.com/Netherlands/northmacedonia/',
      type: 'official',
      lastVerified: '2026-02-08',
      language: 'en',
      documentType: 'portal'
    },
    {
      label: 'Netherlands Embassy Skopje',
      url: 'https://www.netherlandsandyou.nl/web/north-macedonia',
      type: 'government',
      lastVerified: '2026-02-08',
      language: 'en'
    },
    {
      label: 'Rome2Rio - Tirana to Skopje',
      url: 'https://www.rome2rio.com/map/Tirana/Skopje',
      type: 'verified-third-party',
      lastVerified: '2026-02-08',
      language: 'en'
    }
  ],
  
  lastUpdated: '2026-02-08',
  status: 'pending'
}
```

---

## 🔧 Files to Modify

| File | Changes | Priority | Effort |
|------|---------|----------|--------|
| `src/lib/roadmap-types.ts` | New interfaces (VerifiedSource, ActionLink, StepFee, StepDocument, StepPitfall, enhanced RoadmapStep) | P0 | 1.5h |
| `src/components/RoadmapStepCard.tsx` | Add sections for fees, documents, pitfalls, action buttons, verification badge | P1 | 2h |
| `src/data/visa-albania-student.ts` | Transform to hyper-specific format | P1 | 2h |
| `src/data/visa-albania.ts` | Transform work visa to hyper-specific | P2 | 2h |
| LLM prompts/tools | Update to generate hyper-specific steps | P1 | 1h |

---

## 📊 Priority Order

1. **P0: Types** - Define the data structures (blocks everything)
2. **P1: One Example** - Albania student visa transformed completely
3. **P1: UI Components** - Can render the new data
4. **P1: LLM Integration** - Tool can create hyper-specific steps
5. **P2: Other Visas** - Transform remaining visa types

---

## 🎯 Success Criteria

A roadmap step is "hyper-specific" when:

- [ ] Has a PRIMARY ACTION button with direct URL
- [ ] Lists exact fees with EUR amounts
- [ ] Shows documents as interactive checklist
- [ ] Includes at least 2 official sources with "last verified" dates
- [ ] Has 3+ practical tips from real experience
- [ ] Lists 2+ common pitfalls with prevention
- [ ] Shows who is responsible (applicant vs institution)
- [ ] User can complete step without Googling ANYTHING

---

## 📝 Implementation Notes

### Breaking Changes
The enhanced `RoadmapStep` interface is backwards-compatible - all new fields are optional. Existing roadmaps will continue to work but won't have the enhanced features.

### LLM Prompt Updates
When generating roadmaps, the LLM should be instructed to:
1. Always include direct portal URLs (not just "go to IND website")
2. Always include exact fees in EUR
3. Always cite official sources with URLs
4. Include practical tips from real user experiences
5. Warn about common pitfalls specific to that nationality

### Data Freshness
- Fees should include `validUntil` date
- Sources should include `lastVerified` date
- Consider a nightly job to flag stale data (> 6 months unverified)

---

## 🚀 Quick Wins (< 1 hour each)

1. Add "Last Verified" badge to existing sources
2. Add fee display to existing steps
3. Add pitfall warnings for critical steps
4. Add primary action buttons to existing steps

---

*Plan created by PLANNER agent, ready for REVIEWER validation.*
