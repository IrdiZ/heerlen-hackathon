'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import { AGENT_ID } from '@/lib/elevenlabs-config';

interface VoiceAgentProps {
  onFormSchemaRequest: () => void;
  onFillForm: (fieldMappings: Record<string, string>) => void;
  onMessage?: (message: { role: string; content: string }) => void;
}

interface ElevenLabsMessage {
  message: string;
  role: string;
}

// Animated loading dots component
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

export function VoiceAgent({ onFormSchemaRequest, onFillForm, onMessage }: VoiceAgentProps) {
  const [isStarting, setIsStarting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setIsStarting(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
    },
    onMessage: (message: ElevenLabsMessage) => {
      console.log('Message:', message);
      // Map ElevenLabs message format to our format
      onMessage?.({ role: message.role, content: message.message });
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setIsStarting(false);
    },
  });

  const handleStart = useCallback(async () => {
    if (!AGENT_ID) {
      alert('Please configure NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local');
      return;
    }

    setIsStarting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation with the agent
      await conversation.startSession({
        agentId: AGENT_ID,
        clientTools: {
          // Client tool: request form schema from extension
          request_form_schema: async () => {
            console.log('Agent requested form schema');
            onFormSchemaRequest();
            return 'Form capture requested. Please click "Capture Form" in the extension.';
          },
          // Client tool: fill form with placeholder mappings
          fill_form: async ({ fieldMappings }: { fieldMappings: Record<string, string> }) => {
            console.log('Agent wants to fill form:', fieldMappings);
            onFillForm(fieldMappings);
            return 'Form fill initiated successfully.';
          },
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsStarting(false);
    }
  }, [conversation, onFormSchemaRequest, onFillForm]);

  const handleStop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const getStatusIndicatorClasses = () => {
    const baseClasses = 'w-4 h-4 rounded-full transition-all duration-300';
    if (conversation.status === 'connected') {
      if (conversation.isSpeaking) {
        // Active pulse with glow when speaking
        return `${baseClasses} bg-green-500 animate-pulse shadow-lg shadow-green-500/50`;
      }
      // Gentle pulse when listening
      return `${baseClasses} bg-blue-500 animate-pulse`;
    }
    if (isStarting) {
      return `${baseClasses} bg-yellow-500 animate-pulse`;
    }
    return `${baseClasses} bg-gray-400`;
  };

  const getStatusText = () => {
    if (isStarting) return 'Connecting';
    if (conversation.status === 'connected') {
      return conversation.isSpeaking ? 'Agent speaking...' : 'Listening...';
    }
    return 'Ready';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status indicator */}
      <div className="flex items-center gap-3 transition-all duration-300">
        <div className={getStatusIndicatorClasses()} />
        <span className="text-lg font-medium text-gray-700 transition-all duration-200">
          {getStatusText()}
          {isStarting && <LoadingDots />}
        </span>
      </div>

      {/* Main control button */}
      {conversation.status !== 'connected' ? (
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-100 shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg"
        >
          {isStarting ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Connecting<LoadingDots /></span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Conversation
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 active:bg-red-800 transition-all duration-200 transform hover:scale-105 active:scale-100 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            End Conversation
          </span>
        </button>
      )}

      {/* Language hint */}
      <p className="text-gray-500 text-sm text-center px-4 transition-opacity duration-200 hover:text-gray-600">
        🌍 Speak in any language — I&apos;ll respond in yours
      </p>
    </div>
  );
}
