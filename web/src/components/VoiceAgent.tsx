'use client';

/**
 * Voice Agent Component
 * ElevenLabs Conversational AI with extension integration
 */

import { useCallback, useState, useEffect, useRef } from 'react';
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
  // Extra context from page
  headings?: Array<{ level: string; text: string }>;
  mainContent?: string;
  pageDescription?: string;
  buttons?: Array<{ id: string; text: string; type: string }>;
  capturedAt?: string;
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

  // Refs so ElevenLabs client-tool closures always read the latest values
  const currentSchemaRef = useRef(currentSchema);
  const onFillFormRef = useRef(onFillForm);
  const onFormCapturedRef = useRef(onFormCaptured);
  const onCreateRoadmapRef = useRef(onCreateRoadmap);
  const onUpdateRoadmapRef = useRef(onUpdateRoadmap);

  useEffect(() => { currentSchemaRef.current = currentSchema; }, [currentSchema]);
  useEffect(() => { onFillFormRef.current = onFillForm; }, [onFillForm]);
  useEffect(() => { onFormCapturedRef.current = onFormCaptured; }, [onFormCaptured]);
  useEffect(() => { onCreateRoadmapRef.current = onCreateRoadmap; }, [onCreateRoadmap]);
  useEffect(() => { onUpdateRoadmapRef.current = onUpdateRoadmap; }, [onUpdateRoadmap]);

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

    // Include page description if available
    if (schema.pageDescription) {
      lines.push('PAGE SUMMARY:');
      lines.push(schema.pageDescription);
      lines.push('');
    }

    // Include headings for context
    if (schema.headings && schema.headings.length > 0) {
      lines.push('PAGE SECTIONS:');
      schema.headings.forEach(h => {
        const prefix = h.level === 'H1' ? '# ' : h.level === 'H2' ? '## ' : '### ';
        lines.push(`${prefix}${h.text}`);
      });
      lines.push('');
    }

    // Include main content text (for requirements pages, explanations, etc.)
    if (schema.mainContent) {
      lines.push('PAGE CONTENT:');
      // Limit to 3000 chars to avoid overwhelming the agent
      const content = schema.mainContent.slice(0, 3000);
      lines.push(content);
      if (schema.mainContent.length > 3000) {
        lines.push('... (content truncated)');
      }
      lines.push('');
    }

    // Form fields
    if (schema.fields && schema.fields.length > 0) {
      lines.push(`FORM FIELDS (${schema.fields.length} found):`);
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
      lines.push('No form fields were detected on this page (this may be an info/requirements page).');
    }

    return lines.join('\n');
  };

  // Handle get_current_capture - returns schema already captured via extension popup
  const handleGetCurrentCapture = useCallback(async (): Promise<string> => {
    console.log('[VoiceAgent] get_current_capture tool called');

    // Read from ref so we always get the latest schema, even in a stale closure
    const schema = currentSchemaRef.current;
    if (schema && schema.fields?.length > 0) {
      console.log('[VoiceAgent] Returning existing schema from extension:', schema);
      emitMessage('system', `📋 Found existing capture: ${schema.title}`);
      return formatSchemaForAgent(schema);
    }

    // No existing capture
    return 'No form has been captured yet. Use capture_page to scan the current page, or ask the user to capture a form using the browser extension.';
  }, [emitMessage]);

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
      if (onFormCapturedRef.current) {
        onFormCapturedRef.current(schema);
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
  }, [emitMessage]);

  // Handle fill_form tool call from agent
  const handleFillForm = useCallback(async (rawParams: unknown): Promise<string> => {
    console.log('[VoiceAgent] fill_form tool called:', rawParams);
    
    // Handle string parameters (JSON parsing)
    let parsed = rawParams;
    if (typeof rawParams === 'string') {
      try { parsed = JSON.parse(rawParams); } catch {}
    }
    
    // Unwrap ElevenLabs wrappers
    let raw: Record<string, unknown> = parsed && typeof parsed === 'object' 
      ? parsed as Record<string, unknown> 
      : {};
    
    for (const key of ['parameters', 'args', 'input', 'arguments', 'params', 'data']) {
      if (raw[key] && typeof raw[key] === 'object') {
        raw = raw[key] as Record<string, unknown>;
        break;
      }
    }
    
    // Handle both camelCase and snake_case (ElevenLabs may use either)
    const fieldMappings = (raw.fieldMappings || raw.field_mappings || raw.fields) as Record<string, string> | undefined;

    if (!fieldMappings || Object.keys(fieldMappings).length === 0) {
      return 'No field mappings provided. Please specify which fields to fill.';
    }

    emitMessage('system', `📝 Filling ${Object.keys(fieldMappings).length} fields...`);

    try {
      if (onFillFormRef.current) {
        await onFillFormRef.current(fieldMappings);
        return `Filled ${Object.keys(fieldMappings).length} fields. Ask the user to verify the values are correct.`;
      }

      const result = await fillFormViaExtension(fieldMappings);
      const filledCount = result?.results?.filter((r: any) => r.status === 'filled').length || 0;
      return `Filled ${filledCount} fields successfully.`;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to fill form: ${errorMsg}`;
    }
  }, [emitMessage]);

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
      const findSteps = (obj: unknown): Array<Record<string, unknown>> | undefined => {
        if (!obj || typeof obj !== 'object') return undefined;
        const o = obj as Record<string, unknown>;
        if (Array.isArray(o.steps) && o.steps.length > 0) return o.steps;
        for (const key of Object.keys(o)) {
          if (typeof o[key] === 'object') {
            const found = findSteps(o[key]);
            if (found) return found;
          }
        }
        return undefined;
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
        sources: (step.sources as Array<{label: string; url?: string}>) || [],
      })),
    };

    console.log('[VoiceAgent] Final params:', JSON.stringify(params, null, 2));
    emitMessage('system', `📍 Creating roadmap: ${params.name}`);

    try {
      if (onCreateRoadmapRef.current) {
        const result = await onCreateRoadmapRef.current(params);
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
  }, [emitMessage]);

  // Handle update_roadmap tool call from agent
  const handleUpdateRoadmap = useCallback(async (rawParams: unknown): Promise<string> => {
    console.log('[VoiceAgent] Agent requested roadmap update:', rawParams);

    // Handle string parameters (JSON parsing)
    let parsed = rawParams;
    if (typeof rawParams === 'string') {
      try { parsed = JSON.parse(rawParams); } catch {}
    }
    
    // Unwrap ElevenLabs wrappers
    let raw: Record<string, unknown> = parsed && typeof parsed === 'object' 
      ? parsed as Record<string, unknown> 
      : {};
    
    for (const key of ['parameters', 'args', 'input', 'arguments', 'params', 'data']) {
      if (raw[key] && typeof raw[key] === 'object') {
        raw = raw[key] as Record<string, unknown>;
        break;
      }
    }
    
    // Normalize snake_case to camelCase
    const params: UpdateRoadmapParams = {
      stepId: (raw.stepId || raw.step_id) as string,
      status: raw.status as 'pending' | 'in-progress' | 'complete',
      notes: raw.notes as string | undefined,
    };

    try {
      if (onUpdateRoadmapRef.current) {
        const result = await onUpdateRoadmapRef.current(params);
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
  }, [emitMessage]);

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

  // Determine orb animation class
  const getOrbClass = () => {
    if (isConnecting) return 'connecting-animation';
    if (isSpeaking) return 'orb-speaking';
    if (isConnected) return 'orb-listening';
    return 'orb-idle';
  };

  // Determine orb gradient colors
  const getOrbGradient = () => {
    if (error) return 'from-red-500 via-rose-500 to-red-600';
    if (isSpeaking) return 'from-emerald-400 via-green-500 to-teal-500';
    if (isConnected) return 'from-orange-400 via-indigo-500 to-purple-500';
    if (isConnecting) return 'from-amber-400 via-yellow-500 to-orange-500';
    return 'from-indigo-400 via-purple-500 to-pink-500';
  };

  return (
    <div className="voice-agent voice-agent-container rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 shimmer-effect opacity-20 pointer-events-none" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-4 left-8 w-2 h-2 bg-indigo-400/30 rounded-full float-animation" style={{ animationDelay: '0s' }} />
        <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-purple-400/40 rounded-full float-animation" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-16 left-16 w-1 h-1 bg-orange-400/30 rounded-full float-animation" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-8 right-8 w-2 h-2 bg-pink-400/20 rounded-full float-animation" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Central Orb Section */}
      <div className="relative flex flex-col items-center mb-6">
        {/* Glow rings */}
        {isConnected && (
          <>
            <div className={`absolute w-24 h-24 rounded-full border-2 ${isSpeaking ? 'border-emerald-400/40' : 'border-orange-400/40'} glow-ring`} />
            <div className={`absolute w-24 h-24 rounded-full border-2 ${isSpeaking ? 'border-emerald-400/30' : 'border-orange-400/30'} glow-ring`} style={{ animationDelay: '0.5s' }} />
            <div className={`absolute w-24 h-24 rounded-full border-2 ${isSpeaking ? 'border-emerald-400/20' : 'border-orange-400/20'} glow-ring`} style={{ animationDelay: '1s' }} />
          </>
        )}
        
        {/* Main Orb */}
        <div 
          className={`
            relative w-24 h-24 rounded-full 
            bg-gradient-to-br ${getOrbGradient()}
            flex items-center justify-center
            transition-all duration-500 ease-out
            ${getOrbClass()}
          `}
        >
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-white/20 blur-sm" />
          
          {/* Microphone Icon */}
          <div className={`relative z-10 ${isConnected && !isSpeaking ? 'mic-animated' : ''}`}>
            {isConnecting ? (
              <svg className="w-10 h-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : isSpeaking ? (
              <svg className="w-10 h-10 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h3v2H8v-2h3v-3.09A6 6 0 0 1 6 12h2z"/>
                <circle cx="12" cy="8" r="1" className="animate-ping" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h3v2H8v-2h3v-3.09A6 6 0 0 1 6 12h2z"/>
              </svg>
            )}
          </div>
        </div>

        {/* Audio Waveform Visualization */}
        <div className="flex items-end justify-center gap-1 h-10 mt-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`
                w-1 rounded-full transition-all duration-150
                ${isConnected 
                  ? isSpeaking 
                    ? 'bg-gradient-to-t from-emerald-500 to-teal-400 waveform-bar-speaking' 
                    : 'bg-gradient-to-t from-orange-500 to-indigo-400 waveform-bar'
                  : 'bg-gray-300/50 h-2'
                }
              `}
              style={{ 
                animationDelay: `${i * 0.1}s`,
                height: isConnected ? undefined : '8px'
              }}
            />
          ))}
        </div>

        {/* Status Text */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`
            w-2.5 h-2.5 rounded-full transition-all duration-500
            ${isConnected 
              ? isSpeaking 
                ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 status-dot-animated' 
                : 'bg-orange-400 shadow-lg shadow-blue-400/50 status-dot-animated'
              : isConnecting 
                ? 'bg-amber-400 shadow-lg shadow-amber-400/50 status-dot-animated' 
                : error 
                  ? 'bg-red-400 shadow-lg shadow-red-400/50' 
                  : 'bg-gray-400/50'
            }
          `} />
          <span className={`
            text-sm font-medium tracking-wide transition-colors duration-500
            ${isConnected 
              ? isSpeaking ? 'text-emerald-300' : 'text-blue-300'
              : isConnecting ? 'text-amber-300' 
              : error ? 'text-red-300' : 'text-gray-400'
            }
          `}>
            {isConnected ? (isSpeaking ? 'Speaking...' : 'Listening...') :
             isConnecting ? 'Connecting...' :
             error ? 'Error' :
             'Ready to chat'}
          </span>
        </div>
      </div>

      {/* Extension Status - Subtle */}
      <div className="flex justify-center mb-4">
        <div className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
          transition-all duration-300
          ${extensionConnected 
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }
        `}>
          <div className={`w-1.5 h-1.5 rounded-full ${extensionConnected ? 'bg-emerald-400' : 'bg-gray-500'}`} />
          {extensionConnected ? 'Extension connected' : 'No extension'}
        </div>
      </div>

      {extensionIdMissing && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-sm text-amber-200 backdrop-blur-sm">
          <strong className="flex items-center gap-2 text-amber-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Extension ID missing
          </strong>
          <ol className="mt-2 ml-4 list-decimal text-xs space-y-1 text-amber-200/80">
            <li>Go to <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">chrome://extensions</code></li>
            <li>Load unpacked → select <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">extension/</code> folder</li>
            <li>Copy the extension ID</li>
            <li>Add to <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">.env.local</code></li>
            <li>Restart dev server</li>
          </ol>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-200 backdrop-blur-sm flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Main Action Button */}
      <button
        onClick={isConnected ? endConversation : startConversation}
        disabled={isConnecting}
        className={`
          relative w-full py-4 px-6 rounded-2xl font-semibold text-lg
          transition-all duration-300 ease-out transform
          overflow-hidden group
          ${isConnected
            ? 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 text-white shadow-xl shadow-red-500/25 hover:shadow-red-500/40'
            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40'
          }
          ${isConnecting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-0.5'}
        `}
      >
        {/* Button shimmer effect */}
        <div className="absolute inset-0 shimmer-effect opacity-30 group-hover:opacity-50 transition-opacity" />
        
        {isConnected ? (
          <span className="relative flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            End Conversation
          </span>
        ) : isConnecting ? (
          <span className="relative flex items-center justify-center gap-3">
            <svg className="w-5 h-5 connecting-animation" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Connecting...
          </span>
        ) : (
          <span className="relative flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h3v2H8v-2h3v-3.09A6 6 0 0 1 6 12h2z"/>
            </svg>
            Start Voice Chat
          </span>
        )}
      </button>

      {/* Tip Card */}
      {!isConnected && !isConnecting && !error && (
        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
          <p className="text-sm text-indigo-200/90 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong className="text-indigo-200">Tip:</strong> Say &quot;I&apos;m stuck&quot; when on a form and I&apos;ll help you fill it.
            </span>
          </p>
        </div>
      )}

      {/* Active Session Indicator */}
      {isConnected && (
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <span 
                    key={i}
                    className={`
                      w-1.5 h-1.5 rounded-full 
                      ${isSpeaking ? 'bg-emerald-400' : 'bg-orange-400'}
                      animate-bounce
                    `} 
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className={`text-sm font-medium ${isSpeaking ? 'text-emerald-300' : 'text-blue-300'}`}>
                {isSpeaking ? 'AI is speaking...' : 'Listening to you...'}
              </span>
            </div>
            <div className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${isSpeaking 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-orange-500/20 text-blue-300 border border-orange-500/30'
              }
            `}>
              LIVE
            </div>
          </div>
        </div>
      )}

      {/* Last Captured Schema */}
      {lastSchema && lastSchema.fields && lastSchema.fields.length > 0 && (
        <div className="mt-4 p-4 bg-gray-500/10 rounded-2xl border border-gray-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gray-300 mb-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium">{lastSchema.title}</span>
          </div>
          <div className="text-xs text-gray-500">{lastSchema.fields.length} fields detected</div>
        </div>
      )}
    </div>
  );
}

export default VoiceAgent;
