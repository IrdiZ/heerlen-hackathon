// Simple analytics for demo tracking (no external service)
// Stores events in localStorage for demo purposes

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

const STORAGE_KEY = 'migrantai_analytics';

export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

    events.push({
      event,
      timestamp: Date.now(),
      data,
    });

    // Keep only last 100 events
    const trimmed = events.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Analytics tracking failed:', e);
  }
}

export function getEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearEvents() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Pre-defined events
export const Events = {
  CONVERSATION_STARTED: 'conversation_started',
  CONVERSATION_ENDED: 'conversation_ended',
  FORM_CAPTURED: 'form_captured',
  FORM_FILLED: 'form_filled',
  PII_UPDATED: 'pii_updated',
  LANGUAGE_DETECTED: 'language_detected',
  ERROR_OCCURRED: 'error_occurred',
} as const;
