// Roadmap Types for Progress Tracker Feature
// ============================================
// ENHANCED ROADMAP TYPES FOR HYPER-SPECIFICITY
// ============================================

export type RoadmapStepStatus = 'pending' | 'in-progress' | 'complete';

// ============================================
// NEW TYPES FOR HYPER-SPECIFIC ROADMAPS
// ============================================

/**
 * Verified source with provenance tracking.
 * Used to cite official sources and track when information was last verified.
 */
export interface VerifiedSource {
  /** Display label for the source (e.g., "IND - Study at University Permit") */
  url: string;
  /** Human-readable title of the source */
  title: string;
  /** Type of source for trust indication */
  type: 'official' | 'government' | 'verified-third-party' | 'community';
  /** ISO date string when this source was last verified (e.g., "2026-02-08") */
  lastVerified: string;
  /** Optional notes about this source */
  notes?: string;
}

/**
 * Direct action link - the exact URL to complete a step.
 * Used for primary CTAs like "Submit Application" or "Book Appointment".
 */
export interface ActionLink {
  /** Button/link label (e.g., "Book VFS Appointment") */
  label: string;
  /** Direct URL to the action */
  url: string;
  /** Type of action for styling/icon purposes */
  type: 'portal' | 'form' | 'pdf' | 'external';
  /** Whether this action requires authentication */
  requiresAuth?: boolean;
  /** Additional context about this action */
  notes?: string;
}

/**
 * Fee information with currency and payment details.
 * Used to show exact costs for each step.
 */
export interface StepFee {
  /** Numeric amount (e.g., 225) */
  amount: number;
  /** Currency code */
  currency: 'EUR' | 'USD' | 'GBP' | 'ALL';
  /** What this fee is for (e.g., "TEV Application Fee") */
  description: string;
  /** Direct URL for payment if available */
  paymentUrl?: string;
  /** Additional notes about payment methods, validity, etc. */
  notes?: string;
}

/**
 * Required document for a specific step.
 * Used to create interactive document checklists.
 */
export interface StepDocument {
  /** Document name (e.g., "Valid Passport") */
  name: string;
  /** Whether this document is mandatory */
  required: boolean;
  /** Where to obtain this document */
  obtainFrom?: string;
  /** Direct URL to obtain the document */
  obtainUrl?: string;
  /** How long it typically takes to obtain */
  estimatedTime?: string;
  /** Additional details about requirements */
  description?: string;
  /** Whether apostille is required */
  apostilleRequired?: boolean;
  /** How long the document remains valid */
  validityPeriod?: string;
}

/**
 * Common pitfall specific to a step.
 * Used to warn users about frequent mistakes.
 */
export interface StepPitfall {
  /** Title of the pitfall (e.g., "Bank statement too old") */
  title: string;
  /** Detailed description of the issue */
  description: string;
  /** How to prevent this pitfall */
  prevention: string;
  /** How common this pitfall is */
  severity: 'common' | 'occasional' | 'rare';
}

// ============================================
// CORE ROADMAP TYPES (Enhanced)
// ============================================

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedTime?: string;
  status: RoadmapStepStatus;
  tips?: string[];
  sources?: RoadmapSource[];
  completedAt?: string;
  notes?: string;

  // ===== ENHANCED FIELDS (All Optional for Backwards Compatibility) =====

  /**
   * Primary action button - THE main CTA for this step.
   * Should be a direct link to complete the action.
   */
  primaryAction?: ActionLink;

  /**
   * Official form number if applicable (e.g., "Form 7626", "TEV Application")
   */
  formNumber?: string;

  /**
   * Direct URL to the relevant portal
   */
  portalUrl?: string;

  /**
   * List of fees associated with this step
   */
  fees?: StepFee[];

  /**
   * Documents required to complete this step
   */
  documentsRequired?: StepDocument[];

  /**
   * Common pitfalls and how to avoid them
   */
  pitfalls?: StepPitfall[];

  /**
   * Verified sources with provenance tracking
   */
  verifiedSources?: VerifiedSource[];

  /**
   * ISO date string when this step was last verified accurate
   */
  lastVerified?: string;

  /**
   * Country-specific notes keyed by ISO country code.
   * E.g., { "AL": "No Dutch embassy - must travel to Skopje" }
   */
  countrySpecificNotes?: Record<string, string>;
}

/**
 * Legacy source interface for backwards compatibility.
 * New code should prefer VerifiedSource for enhanced tracking.
 */
export interface RoadmapSource {
  label: string;
  url?: string;
}

export interface Roadmap {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  steps: RoadmapStep[];
}

// Tool call parameters from LLM
export interface CreateRoadmapParams {
  name: string;
  steps: Array<{
    title: string;
    description: string;
    estimatedTime?: string;
    tips?: string[];
    sources?: RoadmapSource[];
  }>;
}

export interface UpdateRoadmapParams {
  stepId: string;
  status?: RoadmapStepStatus;
  notes?: string;
}
