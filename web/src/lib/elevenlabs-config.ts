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
When discussing immigration, create a COMPREHENSIVE personalized roadmap for the user.

⚠️ CRITICAL RULES:
1. ALWAYS create 7-10 steps minimum. Immigration is complex - 2 steps is NOT enough.
2. Include sources with CORRECT official URLs for each step
3. Each step needs: title, description, estimatedTime, and sources array
4. Gather key info first: nationality, visa type, job offer status, salary, education

SOURCES - USE THESE EXACT URLs:
- IND general: https://ind.nl/en
- IND HSM info: https://ind.nl/en/residence-permits/work/highly-skilled-migrant
- IND application portal: https://ind.nl/en/forms/7528
- MVV info: https://ind.nl/en/short-stay/the-provisional-residence-permit-mvv
- Gemeente registration: https://www.government.nl/topics/registration-with-a-municipality-brp
- BSN info: https://www.government.nl/topics/personal-data/citizen-service-number-bsn
- 30% ruling: https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/individuals/moving_to_the_netherlands/30-percent-ruling/
- TB test: https://www.ggd.nl/tuberculose
- Health insurance: https://www.rijksoverheid.nl/onderwerpen/zorgverzekering
- DigiD: https://www.digid.nl/en

COMPLETE EXAMPLE - Brazilian engineer with job offer:
{
  "name": "HSM Visa Journey - Brazil to Netherlands",
  "steps": [
    {
      "title": "Employer submits IND application",
      "description": "Your employer (must be IND-recognized sponsor) files the residence permit application on your behalf. They need your passport copy, diploma, signed employment contract, and antecedents certificate.",
      "estimatedTime": "2-4 weeks",
      "sources": [{"label": "IND Official", "url": "https://ind.nl/en/residence-permits/work/highly-skilled-migrant"}]
    },
    {
      "title": "Receive IND approval",
      "description": "IND processes the application. If approved, you receive a positive decision letter. Your employer receives notification to proceed with MVV.",
      "estimatedTime": "2-3 weeks",
      "sources": [{"label": "IND Processing Times", "url": "https://ind.nl/en/service-and-contact/processing-times-and-delivery-periods"}]
    },
    {
      "title": "Apply for MVV at consulate",
      "description": "Book appointment at Dutch Consulate in São Paulo or Brasília. Bring passport, IND approval letter, passport photos. MVV is a provisional residence permit sticker in your passport.",
      "estimatedTime": "1-2 weeks",
      "sources": [{"label": "Dutch Embassy Brazil", "url": "https://www.netherlandsworldwide.nl/countries/brazil"}]
    },
    {
      "title": "Travel to Netherlands",
      "description": "Enter NL with your MVV sticker. MVV is valid for 90 days - travel before it expires. Bring all original documents.",
      "estimatedTime": "1 day",
      "sources": [{"label": "MVV Info", "url": "https://ind.nl/en/short-stay/the-provisional-residence-permit-mvv"}]
    },
    {
      "title": "Register at gemeente",
      "description": "Register your address at the municipality within 5 days of arrival. Bring passport, rental contract/proof of address, birth certificate. You'll receive your BSN (citizen service number).",
      "estimatedTime": "1-2 weeks",
      "sources": [{"label": "BRP Registration", "url": "https://www.government.nl/topics/registration-with-a-municipality-brp"}]
    },
    {
      "title": "Collect residence permit (VVR)",
      "description": "Pick up your physical residence permit card at IND desk. Bring passport and appointment letter. The card is valid for the duration stated (usually 5 years for HSM).",
      "estimatedTime": "1-2 weeks",
      "sources": [{"label": "IND Desk Appointment", "url": "https://ind.nl/en/service-and-contact/ind-desks"}]
    },
    {
      "title": "Open Dutch bank account",
      "description": "Open a Dutch bank account (ING, ABN AMRO, Rabobank, or Bunq). Need BSN, passport, proof of address. Required for salary payment.",
      "estimatedTime": "1-2 weeks",
      "sources": [{"label": "Banking Guide", "url": "https://www.iamexpat.nl/expat-info/banking-netherlands"}]
    },
    {
      "title": "Get health insurance",
      "description": "Mandatory within 4 months of arrival. Basic package (basispakket) costs ~€130/month. Compare at Zorgwijzer or Independer.",
      "estimatedTime": "1 day",
      "sources": [{"label": "Health Insurance Info", "url": "https://www.rijksoverheid.nl/onderwerpen/zorgverzekering"}]
    },
    {
      "title": "Apply for 30% ruling",
      "description": "Tax benefit - 30% of salary is tax-free for up to 5 years. Employer must apply together with you to Belastingdienst within 4 months of start date.",
      "estimatedTime": "4-8 weeks",
      "sources": [{"label": "Belastingdienst Official", "url": "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/individuals/moving_to_the_netherlands/30-percent-ruling/"}]
    }
  ]
}

IMPORTANT: Always include the sources array with correct URLs. Users need direct links to official info.`;

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
    description: 'Create a COMPREHENSIVE personalized immigration roadmap. MUST include 7-10 steps minimum with sources. Use after gathering nationality, visa type, job offer, salary.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Roadmap name, e.g., "HSM Visa Journey - Brazil to Netherlands"'
        },
        steps: {
          type: 'array',
          minItems: 7,
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Short step title (e.g., "Register at gemeente")' },
              description: { type: 'string', description: 'Detailed description: what to do, what to bring, where to go' },
              estimatedTime: { type: 'string', description: 'e.g., "2-4 weeks", "1 day"' },
              tips: { type: 'array', items: { type: 'string' }, description: 'Helpful tips for this step' },
              sources: { 
                type: 'array', 
                items: { 
                  type: 'object',
                  properties: {
                    label: { type: 'string', description: 'Source name (e.g., "IND Official")' },
                    url: { type: 'string', description: 'Direct URL to official source' }
                  },
                  required: ['label', 'url']
                }, 
                description: 'Official sources with correct URLs - REQUIRED for each step' 
              }
            },
            required: ['title', 'description', 'estimatedTime', 'sources']
          },
          description: 'Ordered list of 7-10 steps. MUST include sources with URLs for each step.'
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
// force rebuild Sat Feb  7 19:11:52 UTC 2026
