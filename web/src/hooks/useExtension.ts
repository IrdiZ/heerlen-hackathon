'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FormField {
  id: string;
  name?: string;
  label: string;
  type: string;
  tag: string;
  required?: boolean;
  options?: Array<{ value: string; text?: string; label?: string }>;
}

export interface DetectedTemplate {
  id: string;
  nameEN: string;
  nameNL: string;
  category: 'government' | 'finance' | 'healthcare' | 'utilities';
}

export interface FormSchema {
  url: string;
  title: string;
  fields: FormField[];
  detectedTemplate?: DetectedTemplate | null;
  // Extra context
  headings?: Array<{ level: string; text: string }>;
  mainContent?: string;
  pageDescription?: string;
  buttons?: Array<{ id: string; text: string; type: string }>;
  // Metadata
  capturedAt?: string;
}

export interface FillResult {
  field: string;
  status: 'filled' | 'not_found' | 'error';
}

// Extension ID - update this after loading the extension
const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || '';

// Standalone helper to send messages to extension
async function sendMessageToExtension(message: unknown): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!EXTENSION_ID) {
      reject(new Error('Extension ID not configured'));
      return;
    }
    
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      reject(new Error('Chrome runtime not available'));
      return;
    }

    chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// Save capture to database
async function saveCaptureToDB(schema: FormSchema): Promise<void> {
  try {
    await fetch('/api/captures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schema),
    });
  } catch (e) {
    console.error('[useExtension] Failed to save capture to DB:', e);
  }
}

// Load captures from database
async function loadCapturesFromDB(): Promise<FormSchema[]> {
  try {
    const res = await fetch('/api/captures');
    if (res.ok) {
      const data = await res.json();
      return data.map((c: any) => ({
        ...c,
        capturedAt: c.createdAt,
      }));
    }
  } catch (e) {
    console.error('[useExtension] Failed to load captures from DB:', e);
  }
  return [];
}

export function useExtension() {
  const [isConnected, setIsConnected] = useState(false);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [captureHistory, setCaptureHistory] = useState<FormSchema[]>([]);
  const [lastFillResults, setLastFillResults] = useState<FillResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dbLoaded, setDbLoaded] = useState(false);

  // Load captures from DB on mount
  useEffect(() => {
    loadCapturesFromDB().then(captures => {
      if (captures.length > 0) {
        setCaptureHistory(captures);
        setFormSchema(captures[0]); // Set most recent as current
      }
      setDbLoaded(true);
    });
  }, []);

  // Check if extension is available and poll for captured data
  useEffect(() => {
    if (typeof window === 'undefined' || !('chrome' in window) || !chrome.runtime) {
      return;
    }
    
    if (!EXTENSION_ID) {
      console.warn('[useExtension] Extension ID not configured');
      return;
    }

    // Ping extension
    sendMessageToExtension({ type: 'PING' })
      .then(response => {
        setIsConnected(response?.success === true);
      })
      .catch(() => {
        setIsConnected(false);
      });

    // Poll for captured data from extension storage
    const pollCapture = async () => {
      try {
        const response = await sendMessageToExtension({ type: 'GET_LAST_CAPTURE' });
        
        // Accept if has fields OR has page content (for info/requirements pages)
        const hasFields = response.schema.fields?.length > 0;
        const hasContent = response.schema.mainContent || response.schema.headings?.length > 0;
        
        if (response?.success && response.schema && (hasFields || hasContent)) {
          console.log('[useExtension] ✅ Got captured schema:', response.schema);
          console.log('[useExtension] Fields:', response.schema.fields?.length || 0, 'Content:', !!response.schema.mainContent);
          const newSchema = { ...response.schema, capturedAt: new Date().toISOString() };
          setFormSchema(newSchema);
          // Add to history (keep last 10)
          setCaptureHistory(prev => [newSchema, ...prev.slice(0, 9)]);
          // Save to database
          saveCaptureToDB(newSchema);
          // Clear it so we don't re-read the same capture
          await sendMessageToExtension({ type: 'CLEAR_LAST_CAPTURE' });
        }
      } catch (e) {
        // Ignore errors during poll
      }
    };

    // Poll every 2 seconds for captures from popup
    const interval = setInterval(pollCapture, 2000);
    pollCapture(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const pingExtension = useCallback(async () => {
    if (!EXTENSION_ID) {
      console.warn('Extension ID not configured');
      return false;
    }

    try {
      const response = await sendMessageToExtension({ type: 'PING' });
      setIsConnected(response?.success === true);
      return response?.success === true;
    } catch (e) {
      setIsConnected(false);
      return false;
    }
  }, []);

  const sendToExtension = useCallback(async (message: unknown): Promise<any> => {
    return sendMessageToExtension(message);
  }, []);

  const requestFormSchema = useCallback(async (): Promise<FormSchema | null> => {
    setError(null);
    try {
      const response = await sendMessageToExtension({ type: 'CAPTURE_FORM' }) as { success: boolean; schema?: FormSchema; error?: string };

      if (response?.success && response.schema) {
        setFormSchema(response.schema);
        return response.schema;
      } else {
        setError(response?.error || 'Failed to capture form');
        return null;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      return null;
    }
  }, []);

  const fillForm = useCallback(async (fillMap: Record<string, string>): Promise<FillResult[]> => {
    setError(null);
    try {
      const response = await sendMessageToExtension({
        type: 'FILL_FORM',
        fillMap
      }) as { success: boolean; results?: FillResult[]; error?: string };

      if (response?.success && response.results) {
        setLastFillResults(response.results);
        return response.results;
      } else {
        setError(response?.error || 'Failed to fill form');
        return [];
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      return [];
    }
  }, []);

  const clearSchema = useCallback(() => {
    setFormSchema(null);
    setLastFillResults([]);
  }, []);

  const selectCapture = useCallback((index: number) => {
    if (captureHistory[index]) {
      setFormSchema(captureHistory[index]);
    }
  }, [captureHistory]);

  const clearHistory = useCallback(() => {
    setCaptureHistory([]);
  }, []);

  const removeCapture = useCallback(async (index: number) => {
    const capture = captureHistory[index];
    if (!capture) return;
    
    // Remove from local state
    setCaptureHistory(prev => prev.filter((_, i) => i !== index));
    
    // If we're removing the currently selected one, clear it or select another
    if (formSchema?.capturedAt === capture.capturedAt) {
      const remaining = captureHistory.filter((_, i) => i !== index);
      setFormSchema(remaining.length > 0 ? remaining[0] : null);
    }
    
    // Remove from database if it has an ID
    if ((capture as any).id) {
      try {
        await fetch(`/api/captures/${(capture as any).id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('[useExtension] Failed to delete capture from DB:', e);
      }
    }
  }, [captureHistory, formSchema]);

  return {
    isConnected,
    formSchema,
    captureHistory,
    lastFillResults,
    error,
    pingExtension,
    requestFormSchema,
    fillForm,
    clearSchema,
    selectCapture,
    clearHistory,
    removeCapture,
  };
}

// Message listener for extension -> web app communication
export function setupExtensionListener(
  onSchemaReceived: (schema: FormSchema) => void,
  onFillComplete: (results: FillResult[]) => void
) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: MessageEvent) => {
    if (event.source !== window) return;

    const { type, payload } = event.data || {};

    if (type === 'MIGRANTAI_SCHEMA') {
      onSchemaReceived(payload);
    } else if (type === 'MIGRANTAI_FILL_COMPLETE') {
      onFillComplete(payload);
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
