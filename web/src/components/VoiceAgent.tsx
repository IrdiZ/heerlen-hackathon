'use client';

/**
 * Voice Agent Component
 * ElevenLabs Conversational AI with extension integration
 */

import { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { CreateRoadmapParams, UpdateRoadmapParams } from '@/lib/roadmap-types';

interface FormField {
  id: string;
  name?: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Array<{ value: string; text?: string }>;
}

interface FormSchema {
  url: string;
  title: string;
  fields: FormField[];
}

interface VoiceAgentProps {
  onFormSchemaRequest?: () => Promise<void>;
  onFormCaptured?: (schema: FormSchema) => void;  // NEW: sync to UI
  onFillForm?: (fieldMappings: Record<string, string>) => Promise<void>;
  onMessage?: (msg: { role: string; content: string }) => void;
  onCreateRoadmap?: (params: CreateRoadmapParams) => Promise<string>;
  onUpdateRoadmap?: (params: UpdateRoadmapParams) => Promise<string>;
  currentSchema?: FormSchema | null;  // Schema captured via extension popup
}

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || '';

// Debug: Log extension ID status on load
if (typeof window !== 'undefined') {
  console.log('[VoiceAgent] Extension ID configured:', EXTENSION_ID ? `${EXTENSION_ID.slice(0, 8)}...` : '❌ MISSING - set NEXT_PUBLIC_EXTENSION_ID in .env.local');
}

// Direct extension communication
async function capturePageViaExtension(): Promise<FormSchema> {
  if (!EXTENSION_ID) {
    throw new Error('Extension ID not configured. Go to chrome://extensions, load the unpacked extension, copy its ID, and add NEXT_PUBLIC_EXTENSION_ID=<id> to .env.local');
  }

  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    throw new Error('Chrome extension API not available');
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(EXTENSION_ID, { type: 'CAPTURE_FORM' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.success && response.schema) {
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

export function VoiceAgent({ onFormSchemaRequest, onFormCaptured, onFillForm, onMessage, onCreateRoadmap, onUpdateRoadmap, currentSchema }: VoiceAgentProps) {
  const [error, setError] = useState<string | null>(null);
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [lastSchema, setLastSchema] = useState<FormSchema | null>(null);
  const [extensionIdMissing] = useState(!EXTENSION_ID);

  // Check extension on mount
  useEffect(() => {
    if (EXTENSION_ID) {
      pingExtension().then(setExtensionConnected);
    }
  }, []);

  // Emit message to parent
  const emitMessage = useCallback((role: string, content: string) => {
    if (content) {
      onMessage?.({ role, content });
    }
  }, [onMessage]);

  // Format captured schema for the agent - plain text, no markdown
  const formatSchemaForAgent = (schema: FormSchema): string => {
    const lines: string[] = [];
    lines.push(`Page: ${schema.title}`);
    lines.push(`URL: ${schema.url}`);
    lines.push('');

    if (schema.fields && schema.fields.length > 0) {
      lines.push(`Found ${schema.fields.length} form fields:`);
      lines.push('');
      schema.fields.forEach((field, index) => {
        const required = field.required ? ' (required)' : '';
        const label = field.label || field.name || field.id || `Field ${index + 1}`;
        lines.push(`${index + 1}. ${label} - type: ${field.type}${required}`);
        if (field.options && field.options.length > 0) {
          const optionsList = field.options.slice(0, 5).map(o => o.text || o.value).join(', ');
          lines.push(`   Options: ${optionsList}${field.options.length > 5 ? '...' : ''}`);
        }
      });
    } else {
      lines.push('No form fields were detected on this page.');
    }

    return lines.join('\n');
  };

  // Handle get_current_capture - returns schema already captured via extension popup
  const handleGetCurrentCapture = useCallback(async (): Promise<string> => {
    console.log('[VoiceAgent] get_current_capture tool called');

    // Check if there's a schema from extension popup
    if (currentSchema && currentSchema.fields?.length > 0) {
      console.log('[VoiceAgent] Returning existing schema from extension:', currentSchema);
      emitMessage('system', `📋 Found existing capture: ${currentSchema.title}`);
      return formatSchemaForAgent(currentSchema);
    }

    // No existing capture
    return 'No form has been captured yet. Use capture_page to scan the current page, or ask the user to capture a form using the browser extension.';
  }, [currentSchema, emitMessage, formatSchemaForAgent]);

  // Handle capture_page tool call from agent
  const handleCapturePage = useCallback(async (): Promise<string> => {
    console.log('[VoiceAgent] capture_page tool called');
    emitMessage('system', '📸 Capturing page...');

    try {
      const schema = await capturePageViaExtension();
      console.log('[VoiceAgent] Captured schema:', schema);

      // Store locally
      setLastSchema(schema);

      // Sync to parent UI
      if (onFormCaptured) {
        onFormCaptured(schema);
      }

      // Format for agent
      const formatted = formatSchemaForAgent(schema);
      console.log('[VoiceAgent] Returning to agent:', formatted);

      emitMessage('system', `✅ Captured: ${schema.title} (${schema.fields?.length || 0} fields)`);

      return formatted;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[VoiceAgent] Capture error:', err);
      emitMessage('system', `❌ Capture failed: ${errorMsg}`);

      return `Failed to capture page: ${errorMsg}. The user should click the MigrantAI extension icon in their browser toolbar while viewing the form.`;
    }
  }, [emitMessage, onFormCaptured]);

  // Handle fill_form tool call from agent
  const handleFillForm = useCallback(async (params: { fieldMappings?: Record<string, string>; field_mappings?: Record<string, string> }): Promise<string> => {
    console.log('[VoiceAgent] fill_form tool called:', params);
    
    // Handle both camelCase and snake_case (ElevenLabs may use either)
    const fieldMappings = params.fieldMappings || params.field_mappings;

    if (!fieldMappings || Object.keys(fieldMappings).length === 0) {
      return 'No field mappings provided. Please specify which fields to fill.';
    }

    emitMessage('system', `📝 Filling ${Object.keys(fieldMappings).length} fields...`);

    try {
      if (onFillForm) {
        await onFillForm(fieldMappings);
        return `Filled ${Object.keys(fieldMappings).length} fields. Ask the user to verify the values are correct.`;
      }

      const result = await fillFormViaExtension(fieldMappings);
      const filledCount = result?.results?.filter((r: any) => r.status === 'filled').length || 0;
      return `Filled ${filledCount} fields successfully.`;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to fill form: ${errorMsg}`;
    }
  }, [onFillForm, emitMessage]);

  // Handle create_roadmap tool call from agent
  const handleCreateRoadmap = useCallback(async (rawParams: unknown): Promise<string> => {
    console.log('[VoiceAgent] create_roadmap called with:', rawParams);
    console.log('[VoiceAgent] Type:', typeof rawParams);

    // Handle string parameters (JSON parsing)
    let parsed = rawParams;
    if (typeof rawParams === 'string') {
      try {
        parsed = JSON.parse(rawParams);
        console.log('[VoiceAgent] Parsed from string');
      } catch {
        console.error('[VoiceAgent] Failed to parse string params');
      }
    }

    // ElevenLabs client tools might pass params in different ways
    let raw: Record<string, unknown> = {};

    if (parsed && typeof parsed === 'object') {
      raw = parsed as Record<string, unknown>;
      // Check if params are wrapped in common wrapper keys
      const wrapperKeys = ['parameters', 'args', 'input', 'arguments', 'params', 'data'];
      for (const key of wrapperKeys) {
        if (raw[key] && typeof raw[key] === 'object') {
          raw = raw[key] as Record<string, unknown>;
          console.log(`[VoiceAgent] Unwrapped from '${key}'`);
          break;
        }
      }
    }

    console.log('[VoiceAgent] Keys available:', Object.keys(raw));

    // Try to extract name from various possible keys
    const name = (raw.name || raw.roadmap_name || raw.roadmapName || raw.title || 'Immigration Roadmap') as string;
    
    // Try to extract steps from various possible keys
    let steps: Array<Record<string, unknown>> | undefined;
    const stepKeys = ['steps', 'roadmap_steps', 'roadmapSteps', 'items', 'milestones'];
    
    for (const key of stepKeys) {
      const candidate = raw[key];
      if (Array.isArray(candidate) && candidate.length > 0) {
        steps = candidate as Array<Record<string, unknown>>;
        console.log(`[VoiceAgent] Found steps at '${key}':`, steps.length);
        break;
      }
    }
    
    // Also check nested roadmap object
    if (!steps) {
      const roadmapObj = raw.roadmap as Record<string, unknown> | undefined;
      if (roadmapObj) {
        for (const key of stepKeys) {
          const candidate = roadmapObj[key];
          if (Array.isArray(candidate) && candidate.length > 0) {
            steps = candidate as Array<Record<string, unknown>>;
            console.log(`[VoiceAgent] Found steps at roadmap.${key}:`, steps.length);
            break;
          }
        }
      }
    }

    console.log('[VoiceAgent] Extracted - name:', name, 'steps:', steps?.length ?? 0);

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      console.error('[VoiceAgent] Invalid steps. Raw params were:', JSON.stringify(rawParams, null, 2));

      // Try to find steps in any nested structure
      const findSteps = (obj: unknown): Array<Record<string, unknown>> | null => {
        if (!obj || typeof obj !== 'object') return null;
        const o = obj as Record<string, unknown>;
        if (Array.isArray(o.steps) && o.steps.length > 0) return o.steps;
        for (const key of Object.keys(o)) {
          if (typeof o[key] === 'object') {
            const found = findSteps(o[key]);
            if (found) return found;
          }
        }
        return null;
      };

      steps = findSteps(rawParams);

      if (!steps || steps.length === 0) {
        emitMessage('system', `❌ Roadmap creation failed: No steps received from agent`);
        return 'Failed to create roadmap: No steps were provided. Please describe the immigration journey steps you want me to create, for example: "Create a roadmap with steps for getting a work visa"';
      }
    }

    // Normalize steps structure
    const params: CreateRoadmapParams = {
      name,
      steps: steps.map((step) => ({
        title: step.title as string || step.step_title as string || 'Step',
        description: step.description as string || step.step_description as string || '',
        estimatedTime: step.estimatedTime as string || step.estimated_time as string || step.time as string,
        tips: step.tips as string[] || [],
      })),
    };

    console.log('[VoiceAgent] Final params:', JSON.stringify(params, null, 2));
    emitMessage('system', `📍 Creating roadmap: ${params.name}`);

    try {
      if (onCreateRoadmap) {
        const result = await onCreateRoadmap(params);
        emitMessage('system', `✅ Roadmap created with ${params.steps.length} steps`);
        return result;
      }
      return 'Roadmap handler not configured';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[VoiceAgent] Roadmap creation error:', err);
      emitMessage('system', `❌ Failed to create roadmap: ${errorMsg}`);
      return `Failed to create roadmap: ${errorMsg}`;
    }
  }, [onCreateRoadmap, emitMessage]);

  // Handle update_roadmap tool call from agent
  const handleUpdateRoadmap = useCallback(async (params: UpdateRoadmapParams): Promise<string> => {
    console.log('[VoiceAgent] Agent requested roadmap update:', params);

    try {
      if (onUpdateRoadmap) {
        const result = await onUpdateRoadmap(params);
        if (params.status) {
          emitMessage('system', `✅ Step marked as ${params.status}`);
        }
        return result;
      }
      return 'Roadmap update handler not configured';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to update roadmap: ${errorMsg}`;
    }
  }, [onUpdateRoadmap, emitMessage]);

  // Initialize conversation with client tools
  const conversation = useConversation({
    clientTools: {
      get_current_capture: handleGetCurrentCapture,
      capture_page: handleCapturePage,
      fill_form: handleFillForm,
      create_roadmap: handleCreateRoadmap,
      update_roadmap: handleUpdateRoadmap,
    },
    onConnect: () => {
      console.log('[VoiceAgent] Connected to ElevenLabs');
      emitMessage('system', '✅ Voice connected. Start speaking!');
      pingExtension().then(setExtensionConnected);
    },
    onDisconnect: () => {
      console.log('[VoiceAgent] Disconnected');
      emitMessage('system', '👋 Voice disconnected.');
    },
    onMessage: (message) => {
      console.log('[VoiceAgent] Message:', message);
      if (message.message) {
        emitMessage(message.source === 'user' ? 'user' : 'assistant', message.message);
      }
    },
    onError: (err) => {
      console.error('[VoiceAgent] Error:', err);
      const errorMsg = typeof err === 'string' ? err : (err as Error)?.message || 'Unknown error';
      setError(errorMsg);
      emitMessage('system', `❌ Error: ${errorMsg}`);
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
      await conversation.startSession({ agentId, connectionType: 'websocket' as const });
    } catch (err) {
      console.error('[VoiceAgent] Start failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to start');
      emitMessage('system', `❌ ${err instanceof Error ? err.message : 'Failed to start'}`);
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
             'Ready'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${extensionConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-400">
            {extensionConnected ? 'Extension ✓' : 'No extension'}
          </span>
        </div>
      </div>

      {extensionIdMissing && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
          <strong>⚠️ Extension ID missing!</strong>
          <ol className="mt-2 ml-4 list-decimal text-xs space-y-1">
            <li>Go to <code className="bg-yellow-100 px-1 rounded">chrome://extensions</code></li>
            <li>Load unpacked → select <code className="bg-yellow-100 px-1 rounded">extension/</code> folder</li>
            <li>Copy the extension ID</li>
            <li>Add <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_EXTENSION_ID=&lt;id&gt;</code> to <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
            <li>Restart dev server</li>
          </ol>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

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
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : (
          <span>🎤 Start Voice Chat</span>
        )}
      </button>

      {!isConnected && !isConnecting && !error && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Say &quot;I&apos;m stuck&quot; when on a form and I&apos;ll help you fill it.
          </p>
        </div>
      )}

      {isConnected && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm text-green-800">
              {isSpeaking ? 'Speaking...' : 'Listening...'}
            </span>
          </div>
        </div>
      )}

      {/* Show last captured schema */}
      {lastSchema && lastSchema.fields && lastSchema.fields.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-xs">
          <div className="font-medium text-gray-700 mb-1">Last capture: {lastSchema.title}</div>
          <div className="text-gray-500">{lastSchema.fields.length} fields detected</div>
        </div>
      )}
    </div>
  );
}

export default VoiceAgent;
