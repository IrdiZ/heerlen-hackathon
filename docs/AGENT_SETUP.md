# ElevenLabs Conversational AI Agent Setup

This guide walks you through setting up the MigrantAI voice agent on ElevenLabs.

## Prerequisites

- ElevenLabs account with Conversational AI access
- Access to this repository

## Step 1: Access the Conversational AI Dashboard

1. Go to [ElevenLabs](https://elevenlabs.io) and log in
2. Navigate to **Conversational AI** in the left sidebar
3. Click **Create Agent** or **+ New Agent**

## Step 2: Create New Agent

1. Give your agent a name: `MigrantAI`
2. Select the agent type: **Conversational**

## Step 3: Configure the System Prompt

Copy and paste this system prompt into the agent configuration:

```
You are MigrantAI, a friendly assistant helping immigrants navigate Dutch bureaucracy. You speak the user's language fluently.

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
- Explain Dutch terms simply
```

## Step 4: Configure Voice

1. Go to the **Voice** tab in agent settings
2. Select a **multilingual voice** (required for multi-language support)
3. Recommended voices:
   - **Rachel** (multilingual) - Warm, friendly
   - **Aria** (multilingual) - Professional, clear
   - Or any voice with "multilingual" capability

> **Important:** The voice must support multiple languages since MigrantAI serves users in English, Dutch, Arabic, Turkish, Polish, Ukrainian, German, and French.

## Step 5: Configure LLM

1. Go to the **LLM** tab
2. Select **Claude** as the model (recommended)
3. If Claude is not available, see [OpenRouter Fallback](#openrouter-fallback) below

## Step 6: Enable Web Search Tool

1. Go to the **Tools** tab
2. Find **Web Search** in the built-in tools
3. Enable it
4. This allows the agent to search for current Dutch regulations and procedures

## Step 7: Add Client Tools

Add two custom client tools. These are handled by the browser extension.

### Tool 1: request_form_schema

| Field | Value |
|-------|-------|
| **Name** | `request_form_schema` |
| **Description** | Request the browser extension to capture the current form schema |
| **Type** | Client Tool |
| **Parameters** | None (empty object `{}`) |
| **Returns** | `string` - The captured form schema |

JSON Schema for parameters:
```json
{
  "type": "object",
  "properties": {},
  "required": []
}
```

### Tool 2: fill_form

| Field | Value |
|-------|-------|
| **Name** | `fill_form` |
| **Description** | Fill form fields with placeholder mappings. The extension will swap placeholders for real values locally. |
| **Type** | Client Tool |
| **Parameters** | See below |
| **Returns** | `string` - Confirmation of fill action |

JSON Schema for parameters:
```json
{
  "type": "object",
  "properties": {
    "fieldMappings": {
      "type": "object",
      "description": "Map of form field IDs to placeholder tokens",
      "additionalProperties": {
        "type": "string"
      }
    }
  },
  "required": ["fieldMappings"]
}
```

Example `fieldMappings` value:
```json
{
  "firstName": "[FIRST_NAME]",
  "lastName": "[LAST_NAME]",
  "email": "[EMAIL]",
  "dateOfBirth": "[DOB]"
}
```

## Step 8: Get Your Agent ID

1. Save your agent configuration
2. The Agent ID is shown:
   - In the URL: `https://elevenlabs.io/app/conversational-ai/{AGENT_ID}`
   - In the agent settings under **Agent ID**
   - It looks like: `agent_xxxxxxxxxxxxxxxxxxxx`

## Step 9: Configure Environment Variable

1. Copy your Agent ID
2. In the `web/` directory, create or edit `.env.local`:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxx
```

3. Restart the development server if running

## OpenRouter Fallback

If Claude is not available as a built-in LLM option in ElevenLabs:

1. Go to [OpenRouter](https://openrouter.ai) and create an account
2. Generate an API key
3. In ElevenLabs agent settings, go to **LLM** tab
4. Select **Custom LLM** or **OpenAI-compatible**
5. Configure:
   - **Base URL**: `https://openrouter.ai/api/v1`
   - **API Key**: Your OpenRouter API key
   - **Model**: `anthropic/claude-3.5-sonnet` (or `anthropic/claude-3-haiku` for faster/cheaper)
6. Save the configuration

> **Note:** OpenRouter charges per token. Monitor usage at openrouter.ai/activity

## Testing Your Agent

1. Start the web app: `cd web && npm run dev`
2. Open `http://localhost:3000`
3. Click the microphone button to start a conversation
4. Test in multiple languages
5. Test form capture with a sample form

## Troubleshooting

### Agent doesn't respond
- Check that `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` is set correctly
- Verify the agent is published/active in ElevenLabs dashboard

### Voice sounds wrong
- Ensure you selected a multilingual voice
- Check voice settings for speed/stability

### Tools not working
- Verify tool names match exactly: `request_form_schema`, `fill_form`
- Check browser console for tool call errors
- Ensure the extension is installed and active

### Web search not finding info
- Verify web search tool is enabled
- Check that the agent has permission to use tools

## Related Files

- System prompt source: `web/src/lib/elevenlabs-config.ts`
- Tool definitions: Same file, `AGENT_TOOLS` export
- Supported languages: Same file, `SUPPORTED_LANGUAGES` export
