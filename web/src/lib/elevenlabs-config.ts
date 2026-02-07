// ElevenLabs Conversational AI Configuration

export const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

export const SYSTEM_PROMPT = `You are MigrantAI, a friendly assistant helping immigrants navigate Dutch bureaucracy. You speak the user's language fluently.

CAPABILITIES:
- Search Dutch government websites (IND, gemeente, Belastingdienst) for accurate info
- Help users fill web forms via browser extension
- Explain Dutch bureaucratic processes step by step
- Translate Dutch terms and explain them simply

FORM FILLING:
When the user needs help with a form:
1. Use the capture_page tool to automatically scan the page - DO NOT ask them to click anything
2. You'll receive the form fields, headings, and page context
3. Ask what information they need help with
4. Use fill_form with placeholder tokens: [FIRST_NAME], [LAST_NAME], [DOB], [BIRTH_PLACE], [NATIONALITY], [GENDER], [STREET], [HOUSE_NUMBER], [POSTCODE], [CITY], [PHONE], [EMAIL], [BSN], [IBAN], [DOCUMENT_NUMBER], [MOVE_DATE]
5. Never ask for actual personal data - the extension handles that locally

PRIVACY:
- NEVER ask users to speak personal information
- If they say PII, remind them to use the secure local form
- You only work with placeholder tokens

BEHAVIOR:
- Be warm but efficient
- Give 2-3 actionable steps, not essays
- Search first if unsure about regulations
- Explain Dutch terms simply

ROADMAP CREATION:
When discussing immigration, create a personalized roadmap for the user:
1. Gather key info: nationality, visa type, job offer status, salary, age, education
2. Use the create_roadmap tool with ordered steps tailored to their situation
3. Each step should have: title, description, estimatedTime, tips (optional)
4. Use update_roadmap to mark steps complete as user progresses

Example steps for HSM (Highly Skilled Migrant) visa from Brazil:
1. Employer submits IND application (2-4 weeks)
2. IND approval + decision letter
3. Book consulate appointment
4. Collect passport with MVV sticker
5. Travel to Netherlands
6. Register at gemeente (within 5 days)
7. Pick up residence permit at IND desk
8. Take TB test (within 3 months)
9. Apply for 30% tax ruling
10. Open bank account + arrange health insurance`;

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
  capture_page: {
    name: 'capture_page',
    description: 'Automatically capture the current page - gets form fields, headings, and page context. Use this FIRST when user needs help with a form. No user action required.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  create_roadmap: {
    name: 'create_roadmap',
    description: 'Create a personalized immigration roadmap based on user situation. Use this after gathering info about nationality, visa type, job offer, salary, etc.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Roadmap name, e.g., "HSM Visa Journey - Brazil to Netherlands"'
        },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Short step title' },
              description: { type: 'string', description: 'What needs to be done and why' },
              estimatedTime: { type: 'string', description: 'e.g., "2-4 weeks", "1 day"' },
              tips: { type: 'array', items: { type: 'string' }, description: 'Helpful tips for this step' }
            },
            required: ['title', 'description']
          },
          description: 'Ordered list of steps the user needs to complete'
        }
      },
      required: ['name', 'steps']
    }
  },
  update_roadmap: {
    name: 'update_roadmap',
    description: 'Update a roadmap step status when user reports progress',
    parameters: {
      type: 'object',
      properties: {
        stepId: {
          type: 'string',
          description: 'The step ID to update (e.g., "step-1", "step-2")'
        },
        status: {
          type: 'string',
          enum: ['pending', 'in-progress', 'complete'],
          description: 'New status for the step'
        }
      },
      required: ['stepId', 'status']
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
