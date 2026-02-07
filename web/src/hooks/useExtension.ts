'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

export function useExtension() {
  const [isConnected, setIsConnected] = useState(false);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [lastFillResults, setLastFillResults] = useState<FillResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we already have schema to avoid re-polling
  const hasSchema = useRef(false);

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
      // Skip if we already have a schema
      if (hasSchema.current) return;
      
      try {
        const response = await sendMessageToExtension({ type: 'GET_LAST_CAPTURE' });
        if (response?.success && response.schema && response.schema.fields?.length > 0) {
          console.log('[useExtension] Got captured schema from storage:', response.schema);
          setFormSchema(response.schema);
          hasSchema.current = true;
          // Clear it so we don't re-read
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

  // Reset hasSchema ref when formSchema is cleared
  useEffect(() => {
    if (!formSchema) {
      hasSchema.current = false;
    }
  }, [formSchema]);

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
        hasSchema.current = true;
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
    hasSchema.current = false;
  }, []);

  return {
    isConnected,
    formSchema,
    lastFillResults,
    error,
    pingExtension,
    requestFormSchema,
    fillForm,
    clearSchema,
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
