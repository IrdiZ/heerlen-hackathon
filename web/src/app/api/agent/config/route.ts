import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT, AGENT_TOOLS, SUPPORTED_LANGUAGES } from '@/lib/elevenlabs-config';

// GET /api/agent/config - Returns agent configuration
// This can be used to configure the ElevenLabs agent via their API
export async function GET() {
  return NextResponse.json({
    systemPrompt: SYSTEM_PROMPT,
    tools: AGENT_TOOLS,
    supportedLanguages: SUPPORTED_LANGUAGES,
    // Configuration hints for ElevenLabs dashboard
    hints: {
      llm: 'Claude 3.5 Sonnet (via OpenRouter if not built-in)',
      voice: 'Any multilingual voice',
      firstMessage: 'Hello! I\'m MigrantAI, here to help you navigate Dutch bureaucracy. What can I help you with today?',
      webSearch: true,
    }
  });
}
