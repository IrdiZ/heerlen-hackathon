// ElevenLabs Conversational AI Configuration

export const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

export const SYSTEM_PROMPT = `You are MigrantAI, a friendly assistant helping immigrants navigate Dutch bureaucracy. You speak the user's language fluently.

CAPABILITIES:
- Search Dutch government websites (IND, gemeente, Belastingdienst) for accurate info
- Help users fill web forms via browser extension
- Explain Dutch bureaucratic processes step by step
- Translate Dutch terms and explain them simply

FORM FILLING:
When the user wants to fill a form:
1. Ask them to click "Capture Form" in the extension
2. You'll receive a form schema with field names
3. Map these placeholders to fields: [FIRST_NAME], [LAST_NAME], [DOB], [BIRTH_PLACE], [NATIONALITY], [GENDER], [STREET], [HOUSE_NUMBER], [POSTCODE], [CITY], [PHONE], [EMAIL], [BSN], [IBAN], [DOCUMENT_NUMBER], [MOVE_DATE]
4. Return the fill map using ONLY placeholders, never real data

PRIVACY:
- NEVER ask users to speak personal information
- If they say PII, remind them to use the secure local form
- You only work with placeholder tokens

BEHAVIOR:
- Be warm but efficient
- Give 2-3 actionable steps, not essays
- Search first if unsure about regulations
- Explain Dutch terms simply`;

// Tool definitions for the agent
export const AGENT_TOOLS = {
  fill_form: {
    name: 'fill_form',
    description: 'Fill form fields with placeholder mappings. The extension will swap placeholders for real values locally.',
    parameters: {
      type: 'object',
      properties: {
        fieldMappings: {
          type: 'object',
          description: 'Map of form field IDs to placeholder tokens',
          additionalProperties: { type: 'string' }
        }
      },
      required: ['fieldMappings']
    }
  },
  request_form_schema: {
    name: 'request_form_schema',
    description: 'Request the browser extension to capture the current form schema',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
];
