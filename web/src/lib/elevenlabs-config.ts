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
1. FIRST call get_current_capture - the user may have already captured a form via the browser extension
2. If no capture exists, THEN call capture_page to scan the current page
3. Review the form fields and page context
4. Ask what information they need help with
5. Use fill_form with placeholder tokens: [FIRST_NAME], [LAST_NAME], [DOB], [BIRTH_PLACE], [NATIONALITY], [GENDER], [STREET], [HOUSE_NUMBER], [POSTCODE], [CITY], [PHONE], [EMAIL], [BSN], [IBAN], [DOCUMENT_NUMBER], [MOVE_DATE]
6. Never ask for actual personal data - the extension handles that locally

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
2. Call create_roadmap with this EXACT structure:
   {
     "name": "HSM Visa Journey - Turkey to NL",
     "steps": [
       {"title": "Step title", "description": "What to do", "estimatedTime": "2 weeks"},
       {"title": "Next step", "description": "Details here", "estimatedTime": "1 week"}
     ]
   }
3. IMPORTANT: The "steps" array MUST have at least 1 step with title and description
4. Use update_roadmap to mark steps complete as user progresses

Example for Turkish software developer with €60k job offer:
- name: "HSM Visa Journey - Turkey to Netherlands"  
- steps:
  1. title: "Employer submits IND application", description: "Your employer files the residence permit request", estimatedTime: "2-4 weeks"
  2. title: "Receive IND approval", description: "Wait for decision letter from IND", estimatedTime: "2-3 weeks"
  3. title: "Apply for MVV at consulate", description: "Book appointment at Dutch consulate in Turkey", estimatedTime: "1-2 weeks"
  4. title: "Travel to Netherlands", description: "Enter NL with MVV sticker in passport"
  5. title: "Register at gemeente", description: "Register address within 5 days of arrival", estimatedTime: "1 day"
  6. title: "Collect residence permit", description: "Pick up at IND desk", estimatedTime: "1-2 weeks"
  7. title: "Complete TB test", description: "Required within 3 months", estimatedTime: "1 day"
  8. title: "Apply for 30% ruling", description: "Tax benefit for skilled migrants", estimatedTime: "2-4 weeks"`;

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
  get_current_capture: {
    name: 'get_current_capture',
    description: 'Check if user already captured a form via the browser extension. Call this FIRST before capture_page - if they already captured, you will get the form data immediately.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  capture_page: {
    name: 'capture_page',
    description: 'Capture the current page - gets form fields, headings, and page context. Use this if get_current_capture returns nothing.',
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
