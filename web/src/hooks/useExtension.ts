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

export interface FormSchema {
  url: string;
  title: string;
  fields: FormField[];
}

export interface FillResult {
  field: string;
  status: 'filled' | 'not_found' | 'error';
}

// Extension ID - update this after loading the extension
const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || '';

export function useExtension() {
  const [isConnected, setIsConnected] = useState(false);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [lastFillResults, setLastFillResults] = useState<FillResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if extension is available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'chrome' in window && chrome.runtime) {
      // Try to ping the extension
      pingExtension();
    }
  }, []);

  const pingExtension = useCallback(async () => {
    if (!EXTENSION_ID) {
      console.warn('Extension ID not configured');
      return false;
    }
    
    try {
      const response = await sendToExtension({ type: 'PING' });
      setIsConnected(response?.success === true);
      return response?.success === true;
    } catch (e) {
      setIsConnected(false);
      return false;
    }
  }, []);

  const sendToExtension = useCallback(async (message: unknown): Promise<unknown> => {
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
  }, []);

  const requestFormSchema = useCallback(async (): Promise<FormSchema | null> => {
    setError(null);
    try {
      const response = await sendToExtension({ type: 'CAPTURE_FORM' }) as { success: boolean; schema?: FormSchema; error?: string };
      
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
  }, [sendToExtension]);

  const fillForm = useCallback(async (fillMap: Record<string, string>): Promise<FillResult[]> => {
    setError(null);
    try {
      const response = await sendToExtension({ 
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
  }, [sendToExtension]);

  const clearSchema = useCallback(() => {
    setFormSchema(null);
    setLastFillResults([]);
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
