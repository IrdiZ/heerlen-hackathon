/**
 * Extension Bridge Hook
 * Connects the ElevenLabs voice widget to the MigrantAI browser extension
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Extension ID - update this after loading unpacked extension
const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || '';

interface PageData {
  url: string;
  title: string;
  timestamp: string;
  forms: FormData[];
  inputs: FieldData[];
  buttons: ButtonData[];
  headings: HeadingData[];
  errors: string[];
  mainContent: string;
}

interface FormData {
  id: string;
  name?: string;
  action?: string;
  fields: FieldData[];
}

interface FieldData {
  id: string;
  name?: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  options?: { value: string; text: string; selected?: boolean }[];
}

interface ButtonData {
  text: string;
  type?: string;
  id?: string;
  disabled?: boolean;
}

interface HeadingData {
  level: string;
  text: string;
}

interface ExtensionMessage {
  type: string;
  data?: PageData;
  result?: { filled: string[]; errors: { selector: string; error: string }[] };
  manual?: boolean;
}

export function useExtensionBridge() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastCapture, setLastCapture] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const pendingResolveRef = useRef<((data: PageData | null) => void) | null>(null);

  // Connect to extension
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.connect) {
      console.log('[ExtensionBridge] Chrome extension API not available');
      return;
    }

    if (!EXTENSION_ID) {
      console.log('[ExtensionBridge] No extension ID configured');
      return;
    }

    try {
      // Connect to extension
      const port = chrome.runtime.connect(EXTENSION_ID, { name: 'migrantai-app' });
      portRef.current = port;

      port.onMessage.addListener((message: ExtensionMessage) => {
        console.log('[ExtensionBridge] Message from extension:', message);

        if (message.type === 'PAGE_CAPTURED' && message.data) {
          setLastCapture(message.data);
          
          // Resolve any pending capture request
          if (pendingResolveRef.current) {
            pendingResolveRef.current(message.data);
            pendingResolveRef.current = null;
          }
        }

        if (message.type === 'FORM_FILLED') {
          console.log('[ExtensionBridge] Form fill result:', message.result);
        }
      });

      port.onDisconnect.addListener(() => {
        console.log('[ExtensionBridge] Disconnected from extension');
        setIsConnected(false);
        portRef.current = null;
      });

      setIsConnected(true);
      setError(null);
      console.log('[ExtensionBridge] Connected to extension');

    } catch (err) {
      console.error('[ExtensionBridge] Connection error:', err);
      setError('Failed to connect to extension');
      setIsConnected(false);
    }

    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
      }
    };
  }, []);

  // Request page capture from extension
  const capturePage = useCallback((): Promise<PageData | null> => {
    return new Promise((resolve) => {
      if (!portRef.current) {
        console.log('[ExtensionBridge] Not connected, cannot capture');
        resolve(null);
        return;
      }

      // Set up pending resolve
      pendingResolveRef.current = resolve;

      // Request capture
      portRef.current.postMessage({ type: 'CAPTURE_PAGE' });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (pendingResolveRef.current === resolve) {
          pendingResolveRef.current = null;
          resolve(null);
        }
      }, 30000);
    });
  }, []);

  // Request form fill
  const fillForm = useCallback((fieldMappings: Record<string, string>): void => {
    if (!portRef.current) {
      console.log('[ExtensionBridge] Not connected, cannot fill form');
      return;
    }

    portRef.current.postMessage({ 
      type: 'FILL_FORM', 
      fieldMappings 
    });
  }, []);

  // Format page data for the AI agent
  const formatPageDataForAgent = useCallback((data: PageData): string => {
    const lines: string[] = [];
    
    lines.push(`📄 **Page:** ${data.title}`);
    lines.push(`🔗 **URL:** ${data.url}`);
    lines.push('');

    // Show any errors first
    if (data.errors.length > 0) {
      lines.push('⚠️ **Validation Errors:**');
      data.errors.forEach(err => lines.push(`  - ${err}`));
      lines.push('');
    }

    // Show headings for context
    if (data.headings.length > 0) {
      lines.push('📑 **Page Sections:**');
      data.headings.forEach(h => {
        lines.push(`  ${h.level}: ${h.text}`);
      });
      lines.push('');
    }

    // Show forms and fields
    if (data.forms.length > 0) {
      data.forms.forEach((form, i) => {
        lines.push(`📝 **Form ${i + 1}** (${form.fields.length} fields):`);
        form.fields.forEach(field => {
          const required = field.required ? ' *required*' : '';
          const value = field.value ? ` [current: "${field.value}"]` : '';
          lines.push(`  - **${field.label || field.name || field.id}** (${field.type})${required}${value}`);
          
          if (field.options) {
            lines.push(`    Options: ${field.options.map(o => o.text).join(', ')}`);
          }
        });
        lines.push('');
      });
    }

    // Show standalone inputs
    if (data.inputs.length > 0) {
      lines.push('🔤 **Other Input Fields:**');
      data.inputs.forEach(field => {
        const required = field.required ? ' *required*' : '';
        lines.push(`  - **${field.label || field.name || field.id}** (${field.type})${required}`);
      });
      lines.push('');
    }

    // Show buttons
    if (data.buttons.length > 0) {
      lines.push('🔘 **Buttons:**');
      data.buttons.forEach(btn => {
        lines.push(`  - ${btn.text}${btn.disabled ? ' (disabled)' : ''}`);
      });
    }

    return lines.join('\n');
  }, []);

  return {
    isConnected,
    lastCapture,
    error,
    capturePage,
    fillForm,
    formatPageDataForAgent,
  };
}
