'use client';

/**
 * Voice Agent Component
 * ElevenLabs Conversational AI with extension integration
 */

import { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';

interface VoiceAgentProps {
  onFormSchemaRequest?: () => Promise<void>;
  onFillForm?: (fieldMappings: Record<string, string>) => Promise<void>;
  onMessage?: (msg: { role: string; content: string }) => void;
}

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || '';

// Direct extension communication
async function capturePageViaExtension(): Promise<any> {
  if (!EXTENSION_ID) {
    throw new Error('Extension ID not configured');
  }
  
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    throw new Error('Chrome extension API not available');
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(EXTENSION_ID, { type: 'CAPTURE_FORM' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.success) {
        resolve(response.schema);
      } else {
        reject(new Error(response?.error || 'Capture failed'));
      }
    });
  });
}

async function fillFormViaExtension(fillMap: Record<string, string>): Promise<any> {
  if (!EXTENSION_ID || typeof chrome === 'undefined') {
    throw new Error('Extension not available');
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(EXTENSION_ID, { type: 'FILL_FORM', fillMap }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

async function pingExtension(): Promise<boolean> {
  if (!EXTENSION_ID || typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    return false;
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(EXTENSION_ID, { type: 'PING' }, (response) => {
      if (chrome.runtime.lastError) {
        resolve(false);
      } else {
        resolve(response?.success === true);
      }
    });
  });
}

export function VoiceAgent({ onFormSchemaRequest, onFillForm, onMessage }: VoiceAgentProps) {
  const [error, setError] = useState<string | null>(null);
  const [extensionConnected, setExtensionConnected] = useState(false);

  // Check extension on mount
  useState(() => {
    pingExtension().then(setExtensionConnected);
  });

  // Emit message to parent
  const emitMessage = useCallback((role: string, content: string) => {
    if (content) {
      onMessage?.({ role, content });
    }
  }, [onMessage]);

  // Format captured schema for the agent
  const formatSchemaForAgent = (schema: any): string => {
    const lines: string[] = [];
    lines.push(`📄 **Page:** ${schema.title}`);
    lines.push(`🔗 **URL:** ${schema.url}`);
    lines.push('');
    
    if (schema.fields && schema.fields.length > 0) {
      lines.push(`📝 **Form Fields (${schema.fields.length}):**`);
      schema.fields.forEach((field: any) => {
        const required = field.required ? ' *required*' : '';
        lines.push(`  - **${field.label || field.name || field.id}** (${field.type})${required}`);
        if (field.options && field.options.length > 0) {
          lines.push(`    Options: ${field.options.map((o: any) => o.text || o.label || o.value).join(', ')}`);
        }
      });
    } else {
      lines.push('No form fields detected on this page.');
    }
    
    return lines.join('\n');
  };

  // Handle capture_page tool call from agent
  const handleCapturePage = useCallback(async (): Promise<string> => {
    console.log('[VoiceAgent] Agent requested page capture');
    emitMessage('system', '📸 Capturing current page...');
    
    try {
      const schema = await capturePageViaExtension();
      const formatted = formatSchemaForAgent(schema);
      emitMessage('system', `✅ Page captured: ${schema.title} (${schema.fields?.length || 0} fields)`);
      
      // Also trigger parent's handler if provided
      if (onFormSchemaRequest) {
        onFormSchemaRequest();
      }
      
      return formatted;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[VoiceAgent] Capture failed:', errorMsg);
      emitMessage('system', `❌ Capture failed: ${errorMsg}`);
      
      // Fallback message for agent
      return `Could not capture the page automatically. Error: ${errorMsg}. Ask the user to click the MigrantAI extension icon on their browser toolbar while on the form page.`;
    }
  }, [emitMessage, onFormSchemaRequest]);

  // Handle fill_form tool call from agent
  const handleFillForm = useCallback(async (params: { field_mappings?: Record<string, string> }): Promise<string> => {
    console.log('[VoiceAgent] Agent requested form fill:', params);
    
    const fieldMappings = params.field_mappings;
    
    if (!fieldMappings || Object.keys(fieldMappings).length === 0) {
      return 'No field mappings provided. Specify fields using placeholder tokens like [FIRST_NAME].';
    }

    emitMessage('system', `📝 Filling ${Object.keys(fieldMappings).length} fields...`);

    try {
      // Try parent's handler first (handles PII substitution)
      if (onFillForm) {
        await onFillForm(fieldMappings);
        return `Sent fill request for ${Object.keys(fieldMappings).length} fields. Ask the user if the fields were filled correctly.`;
      }

      // Direct extension fill
      const result = await fillFormViaExtension(fieldMappings);
      const filledCount = result?.results?.filter((r: any) => r.status === 'filled').length || 0;
      return `Filled ${filledCount} of ${Object.keys(fieldMappings).length} fields.`;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return `Form fill failed: ${errorMsg}`;
    }
  }, [onFillForm, emitMessage]);

  // Initialize conversation
  const conversation = useConversation({
    clientTools: {
      capture_page: handleCapturePage,
      fill_form: handleFillForm,
    },
    onConnect: () => {
      console.log('[VoiceAgent] Connected');
      emitMessage('system', '✅ Voice agent connected. Start speaking!');
      // Re-check extension
      pingExtension().then(setExtensionConnected);
    },
    onDisconnect: () => {
      console.log('[VoiceAgent] Disconnected');
      emitMessage('system', '👋 Voice agent disconnected.');
    },
    onMessage: (message) => {
      console.log('[VoiceAgent] Message:', message);
      if (message.message) {
        emitMessage(message.source === 'user' ? 'user' : 'assistant', message.message);
      }
    },
    onError: (err) => {
      console.error('[VoiceAgent] Error:', err);
      setError(err.message || 'Unknown error');
      emitMessage('system', `❌ Error: ${err.message || 'Unknown error'}`);
    },
  });

  const { status, isSpeaking } = conversation;

  // Start conversation
  const startConversation = useCallback(async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    
    if (!agentId) {
      setError('No agent ID configured');
      emitMessage('system', '❌ Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID');
      return;
    }

    setError(null);
    emitMessage('system', '🔄 Connecting...');

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId });
    } catch (err) {
      console.error('[VoiceAgent] Failed to start:', err);
      setError(err instanceof Error ? err.message : 'Failed to start');
      emitMessage('system', `❌ Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [conversation, emitMessage]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div className="voice-agent">
      {/* Status indicators */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full transition-colors ${
            isConnected ? 'bg-green-500' :
            isConnecting ? 'bg-yellow-500 animate-pulse' :
            error ? 'bg-red-500' :
            'bg-gray-300'
          } ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? (isSpeaking ? '🔊 Speaking...' : '🎤 Listening...') :
             isConnecting ? 'Connecting...' :
             error ? 'Error' :
             'Ready to start'}
          </span>
        </div>
        
        {/* Extension status */}
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${extensionConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-400">
            {extensionConnected ? 'Extension' : 'No extension'}
          </span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={isConnected ? endConversation : startConversation}
        disabled={isConnecting}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg
          transition-all duration-200 transform
          ${isConnected 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30'
          }
          ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        `}
      >
        {isConnected ? (
          <span className="flex items-center justify-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
            End Conversation
          </span>
        ) : isConnecting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🎤 Start Voice Chat
          </span>
        )}
      </button>

      {/* Quick tips */}
      {!isConnected && !isConnecting && !error && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>💡 Tips:</strong> Say &quot;I&apos;m stuck&quot; when on a government form, and I&apos;ll help you fill it out. 
            {!extensionConnected && (
              <span className="block mt-1 text-blue-600">
                Install the MigrantAI Helper extension for form assistance.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Active conversation indicator */}
      {isConnected && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm text-green-800">
              {isSpeaking ? 'MigrantAI is speaking...' : 'MigrantAI is listening. Speak naturally in any language.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceAgent;
