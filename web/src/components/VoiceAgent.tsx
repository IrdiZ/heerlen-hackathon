'use client';

/**
 * Voice Agent Component
 * ElevenLabs Conversational AI widget with extension integration
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useExtensionBridge } from '@/hooks/useExtensionBridge';

interface VoiceAgentProps {
  onFormSchemaRequest?: () => Promise<void>;
  onFillForm?: (fieldMappings: Record<string, string>) => Promise<void>;
  onMessage?: (msg: { role: string; content: string }) => void;
}

export function VoiceAgent({ onFormSchemaRequest, onFillForm, onMessage }: VoiceAgentProps) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const conversationRef = useRef<any>(null);
  
  const { 
    isConnected: extensionConnected, 
    capturePage, 
    fillForm: extensionFillForm, 
    formatPageDataForAgent,
    lastCapture
  } = useExtensionBridge();

  // Emit message to parent
  const emitMessage = useCallback((role: string, content: string) => {
    onMessage?.({ role, content });
  }, [onMessage]);

  // Handle capture_page tool call from agent
  const handleCapturePage = useCallback(async (): Promise<string> => {
    console.log('[VoiceAgent] Agent requested page capture');
    emitMessage('system', '📸 Capturing current page...');
    
    // First try the extension bridge
    if (extensionConnected) {
      const pageData = await capturePage();
      if (pageData) {
        const formatted = formatPageDataForAgent(pageData);
        emitMessage('system', `✅ Page captured: ${pageData.title}`);
        return formatted;
      }
    }
    
    // Fallback: trigger parent's form schema request
    if (onFormSchemaRequest) {
      await onFormSchemaRequest();
      emitMessage('system', '📋 Form schema requested from extension');
      return JSON.stringify({
        message: 'Form capture requested. The user may need to click the extension icon.',
        instructions: 'Ask the user if they can see the form fields now.'
      });
    }
    
    return JSON.stringify({
      error: 'Extension not connected',
      instructions: 'Ask the user to install the MigrantAI Helper extension and click its icon on the page they need help with.'
    });
  }, [extensionConnected, capturePage, formatPageDataForAgent, onFormSchemaRequest, emitMessage]);

  // Handle fill_form tool call from agent
  const handleFillForm = useCallback(async (params: Record<string, unknown>): Promise<string> => {
    console.log('[VoiceAgent] Agent requested form fill:', params);
    
    const fieldMappings = params.field_mappings as Record<string, string>;
    
    if (!fieldMappings || Object.keys(fieldMappings).length === 0) {
      return JSON.stringify({
        error: 'No field mappings provided',
        instructions: 'Specify which fields to fill with what values using placeholder tokens like [FIRST_NAME], [LAST_NAME], etc.'
      });
    }

    emitMessage('system', `📝 Filling ${Object.keys(fieldMappings).length} fields...`);

    // Use parent's fill form handler if available (handles PII substitution)
    if (onFillForm) {
      await onFillForm(fieldMappings);
      return JSON.stringify({
        success: true,
        message: `Sent fill request for ${Object.keys(fieldMappings).length} fields`,
        fields: Object.keys(fieldMappings)
      });
    }

    // Fallback to direct extension fill
    if (extensionConnected) {
      extensionFillForm(fieldMappings);
      return JSON.stringify({
        success: true,
        message: `Attempting to fill ${Object.keys(fieldMappings).length} fields via extension`,
        fields: Object.keys(fieldMappings)
      });
    }
    
    return JSON.stringify({
      error: 'Cannot fill form - extension not connected',
      instructions: 'The form filling feature requires the MigrantAI Helper extension.'
    });
  }, [onFillForm, extensionConnected, extensionFillForm, emitMessage]);

  // Start conversation
  const startConversation = useCallback(async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    
    if (!agentId) {
      console.error('[VoiceAgent] No agent ID configured');
      setStatus('error');
      emitMessage('system', '❌ Voice agent not configured. Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID.');
      return;
    }

    setStatus('connecting');
    emitMessage('system', '🔄 Connecting to voice agent...');

    try {
      // Dynamic import of ElevenLabs SDK
      const { Conversation } = await import('@11labs/client');
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const conversation = await Conversation.startSession({
        agentId,
        clientTools: {
          capture_page: handleCapturePage,
          fill_form: handleFillForm,
        },
        onConnect: () => {
          console.log('[VoiceAgent] Connected');
          setStatus('connected');
          setIsActive(true);
          emitMessage('system', '✅ Voice agent connected. Start speaking!');
        },
        onDisconnect: () => {
          console.log('[VoiceAgent] Disconnected');
          setStatus('idle');
          setIsActive(false);
          emitMessage('system', '👋 Voice agent disconnected.');
        },
        onMessage: (message: { role: string; content: string }) => {
          console.log('[VoiceAgent] Message:', message);
          emitMessage(message.role === 'user' ? 'user' : 'assistant', message.content);
        },
        onError: (error: Error) => {
          console.error('[VoiceAgent] Error:', error);
          setStatus('error');
          emitMessage('system', `❌ Error: ${error.message}`);
        },
      });

      conversationRef.current = conversation;
    } catch (error) {
      console.error('[VoiceAgent] Failed to start:', error);
      setStatus('error');
      emitMessage('system', `❌ Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [handleCapturePage, handleFillForm, emitMessage]);

  // End conversation
  const endConversation = useCallback(async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  }, []);

  return (
    <div className="voice-agent">
      {/* Status indicators */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full transition-colors ${
            status === 'connected' ? 'bg-green-500 animate-pulse' :
            status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            status === 'error' ? 'bg-red-500' :
            'bg-gray-300'
          }`} />
          <span className="text-sm text-gray-600">
            {status === 'connected' ? '🎤 Listening...' :
             status === 'connecting' ? 'Connecting...' :
             status === 'error' ? 'Error' :
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

      {/* Main button */}
      <button
        onClick={isActive ? endConversation : startConversation}
        disabled={status === 'connecting'}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg
          transition-all duration-200 transform
          ${isActive 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30'
          }
          ${status === 'connecting' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        `}
      >
        {isActive ? (
          <span className="flex items-center justify-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
            End Conversation
          </span>
        ) : status === 'connecting' ? (
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
      {!isActive && status === 'idle' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>💡 Tips:</strong> Say "I'm stuck" when on a government form, and I'll help you fill it out. 
            {!extensionConnected && (
              <span className="block mt-1 text-blue-600">
                Install the MigrantAI Helper extension for form assistance.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Active conversation indicator */}
      {isActive && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm text-green-800">
              MigrantAI is listening. Speak naturally in any language.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceAgent;
