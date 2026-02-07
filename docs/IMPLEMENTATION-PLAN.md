# MigrantAI Voice Agent + Extension Integration
## Implementation Plan (PLANNER-001)

**Date:** 2026-02-07  
**Status:** Ready for Review  
**Reviewer:** Pending assignment

---

## Executive Summary

Three core problems need to be solved:
1. Agent says "I don't have access to the forms" even after capture
2. Captured fields not showing in UI panel
3. Field labels are sometimes cryptic HTML names

This plan provides a detailed analysis of root causes and proposes specific, prioritized fixes.

---

## 1. Data Flow Analysis

### Current Architecture
```
User Speech → ElevenLabs Agent → Tool Call (capture_page) 
                                        ↓
                                 VoiceAgent.handleCapturePage()
                                        ↓
                                 chrome.runtime.sendMessage(EXTENSION_ID, {type: 'CAPTURE_FORM'})
                                        ↓
                                 background.js.captureCurrentTab()
                                        ↓
                                 chrome.scripting.executeScript(capturePageContent)
                                        ↓
                                 Response flows back up
                                        ↓
                                 Tool returns formatted string to agent
                                        ↓
                                 Agent speaks response
```

### Critical Gap Identified

The agent receives the form schema as a one-shot tool response, but **does not persist this context** for subsequent turns. When the user later asks to fill fields, the agent has "forgotten" what fields exist.

**The fix:** Use `sendContextualUpdate()` to inject form schema into the agent's ongoing context, separate from the tool response.

---

## 2. Root Cause Analysis

### Problem 1: "Agent says I don't have access to the forms"

**Root Causes (in order of likelihood):**

| # | Cause | Evidence | Impact |
|---|-------|----------|--------|
| 1 | **Tool name mismatch** | VoiceAgent.tsx uses `capture_page`, but AGENT_SETUP.md specifies `request_form_schema` | Agent calls wrong tool name, gets no handler |
| 2 | **Tool not set as "blocking"** | ElevenLabs UI config unknown | Agent doesn't wait for response |
| 3 | **No context persistence** | Tool returns string, but agent forgets on next turn | Agent loses form data between utterances |
| 4 | **Parameter name mismatch** | `fill_form` expects `field_mappings` in code but `fieldMappings` in docs | Fill tool may fail silently |

### Problem 2: "Captured fields not showing in UI panel"

**Root Causes:**

| # | Cause | Evidence | Impact |
|---|-------|----------|--------|
| 1 | **State not updating** | `setVoiceAgentSchema()` is called, but React might not re-render | FormStatus shows stale/empty |
| 2 | **Schema format mismatch** | Extension returns `{ success, schema }`, code expects correct format | Type misalignment |
| 3 | **Extension not responding** | CAPTURE_FORM message may fail silently | Promise rejects but not handled well |

### Problem 3: "Field labels are sometimes cryptic HTML names"

**Root Causes:**

| # | Cause | Evidence | Impact |
|---|-------|----------|--------|
| 1 | **Label detection fallback** | `findLabelForField()` falls back to `name`/`id` attributes | "strPostcode" instead of "Postal Code" |
| 2 | **Dutch forms use technical names** | Government forms often have cryptic field names | Poor UX |
| 3 | **No human-readable mapping** | No dictionary to translate known field patterns | Lost opportunity |

---

## 3. ElevenLabs Client Tools Configuration

### Required Dashboard Configuration

The ElevenLabs agent dashboard must have these exact tool definitions:

#### Tool 1: `capture_page` (rename from `request_form_schema`)

```json
{
  "name": "capture_page",
  "description": "Captures the form schema from the user's current browser tab. Returns a list of form fields that can be filled. Call this when the user is on a form and needs help filling it.",
  "type": "client",
  "wait_for_response": true,
  "blocking": true,
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

**Critical:** `blocking: true` ensures agent waits for response.

#### Tool 2: `fill_form`

```json
{
  "name": "fill_form", 
  "description": "Fills form fields with values. Use placeholder tokens like [FIRST_NAME], [LAST_NAME] instead of real data. The extension will swap them locally.",
  "type": "client",
  "wait_for_response": true,
  "blocking": true,
  "parameters": {
    "type": "object",
    "properties": {
      "field_mappings": {
        "type": "object",
        "description": "Map of field IDs to placeholder tokens or values",
        "additionalProperties": { "type": "string" }
      }
    },
    "required": ["field_mappings"]
  }
}
```

### SDK Tool Response Format

From `@elevenlabs/react` documentation:
- Tool functions return **string** values
- Return value is passed back to agent as tool response
- Agent uses this to formulate next speech

**Current Implementation:** ✅ Correct (returns formatted string)

### Missing Feature: Context Injection

The SDK provides `sendContextualUpdate()` which can inject information without triggering a response:

```typescript
conversation.sendContextualUpdate(
  "User's form was captured. Available fields: firstName (required), lastName (required), email, phone. Remember this for filling requests."
);
```

**This is key for solving Problem 1.**

---

## 4. Extension Architecture Analysis

### When Should Capture Happen?

| Trigger | Pros | Cons | Recommendation |
|---------|------|------|----------------|
| **Voice command** | Natural flow | Agent needs to call tool | ✅ Primary method |
| **Extension popup click** | User control | Requires manual action | ✅ Backup method |
| **Auto on form focus** | Seamless | Noisy, privacy concerns | ❌ Not recommended |
| **Tab change detection** | Proactive | Unreliable, performance hit | ❌ Not recommended |

**Recommendation:** Keep current dual approach (voice + popup), but improve reliability.

### Handling Different Tab Than App

**Current Problem:** Extension captures the **active tab**, but user might have the MigrantAI app in a different tab.

**Current Behavior:** Works correctly - `chrome.tabs.query({ active: true })` gets the focused tab (the form), not the app tab.

**Edge Case:** If user has app in foreground, capture gets wrong page.

**Solution:** Add instruction in UI: "Keep the form tab active when asking to capture."

### Screenshot + Vision vs HTML Extraction

| Approach | Accuracy | Speed | Cost | Privacy | Dutch Form Support |
|----------|----------|-------|------|---------|-------------------|
| HTML extraction | 85% | Fast | Free | Good | ✅ Works |
| GPT-4V screenshot | 95% | Slow (2-5s) | $0.01-0.03/image | Moderate | ✅ Better for complex layouts |
| Hybrid | 98% | Medium | Variable | Good | ✅ Best |

**Current:** HTML extraction with optional GPT-4V visual capture.

**Recommendation:** Keep hybrid. Use HTML as primary, offer "Visual Capture" button for complex forms.

---

## 5. UI State Management

### Current State Flow Issue

```
VoiceAgent captures schema
      ↓
onFormCaptured(schema) → setVoiceAgentSchema(schema)  [page.tsx]
      ↓
formSchema = voiceAgentSchema || extensionFormSchema
      ↓
FormStatus receives formSchema
```

**Problem:** Two sources of truth (`voiceAgentSchema` and `extensionFormSchema`).

### Proposed Single Source of Truth

```
                    ┌─────────────────────────┐
                    │   FormSchemaContext     │
                    │   (React Context)       │
                    └─────────────────────────┘
                              ↑
           ┌──────────────────┼──────────────────┐
           │                  │                  │
    VoiceAgent         useExtension       Manual Capture
    (tool call)        (hook state)       (popup button)
```

**Implementation:** Create a `FormSchemaContext` provider that all components read from.

---

## 6. Recommended Changes (Priority Order)

### 🔴 P0 - Critical (Fix Problems 1 & 2)

#### Change 1: Rename tool in VoiceAgent to match dashboard expectation
**OR** Update ElevenLabs dashboard to use `capture_page`

**File:** `web/src/components/VoiceAgent.tsx`

```typescript
// Line ~172: Ensure tool names match dashboard
clientTools: {
  capture_page: handleCapturePage,  // ← Must match dashboard
  fill_form: handleFillForm,        // ← Must match dashboard
},
```

#### Change 2: Verify ElevenLabs dashboard has "blocking" enabled

**Action:** Log into ElevenLabs → Agent → Tools → Each tool → Enable "Wait for response"

#### Change 3: Inject context after capture

**File:** `web/src/components/VoiceAgent.tsx`

```typescript
const handleCapturePage = useCallback(async (): Promise<string> => {
  // ... existing capture logic ...
  
  const formatted = formatSchemaForAgent(schema);
  
  // NEW: Inject as persistent context
  if (conversation.sendContextualUpdate) {
    conversation.sendContextualUpdate(
      `FORM CONTEXT: The user is on "${schema.title}" with these fields: ${
        schema.fields.map(f => f.label).join(', ')
      }. Reference this when they ask to fill fields.`
    );
  }
  
  return formatted;
}, [conversation]);
```

**Problem:** `conversation` object may not be accessible inside `clientTools` callbacks.

**Solution:** Store schema in a ref and use `useEffect` to send contextual update:

```typescript
const lastCapturedSchemaRef = useRef<FormSchema | null>(null);

useEffect(() => {
  if (lastCapturedSchemaRef.current && conversation.status === 'connected') {
    const schema = lastCapturedSchemaRef.current;
    conversation.sendContextualUpdate(
      `Form captured: ${schema.title}. Fields: ${schema.fields.map(f => f.label).join(', ')}`
    );
    lastCapturedSchemaRef.current = null;
  }
}, [lastCapturedSchemaRef.current, conversation.status]);
```

#### Change 4: Fix parameter name in fill_form handler

**File:** `web/src/components/VoiceAgent.tsx`

```typescript
// Line ~133: Handle both parameter names for robustness
const handleFillForm = useCallback(async (params: { 
  field_mappings?: Record<string, string>;
  fieldMappings?: Record<string, string>;  // ← Add fallback
}): Promise<string> => {
  const fieldMappings = params.field_mappings || params.fieldMappings;
  // ... rest unchanged
}, []);
```

### 🟡 P1 - High (Fix Problem 3 - Cryptic Labels)

#### Change 5: Add Dutch field name dictionary

**New File:** `web/src/lib/dutch-field-names.ts`

```typescript
export const DUTCH_FIELD_PATTERNS: Record<string, string> = {
  // Common government form patterns
  'voornaam': 'First Name',
  'voorletters': 'Initials',
  'achternaam': 'Last Name',
  'tussenvoegsel': 'Prefix (van/de/etc)',
  'geboortedatum': 'Date of Birth',
  'geboorteplaats': 'Place of Birth',
  'geslacht': 'Gender',
  'nationaliteit': 'Nationality',
  'bsn': 'BSN (Citizen Service Number)',
  'straat': 'Street',
  'huisnummer': 'House Number',
  'postcode': 'Postal Code',
  'woonplaats': 'City',
  'telefoon': 'Phone',
  'email': 'Email',
  'iban': 'Bank Account (IBAN)',
  'paspoort': 'Passport',
  // IND specific
  'verblijf': 'Residence',
  'visum': 'Visa',
  'mvv': 'MVV (Entry Visa)',
  // Add more as discovered
};

export function humanizeFieldName(rawName: string): string {
  const lower = rawName.toLowerCase();
  
  // Check exact match
  if (DUTCH_FIELD_PATTERNS[lower]) {
    return DUTCH_FIELD_PATTERNS[lower];
  }
  
  // Check contains
  for (const [pattern, label] of Object.entries(DUTCH_FIELD_PATTERNS)) {
    if (lower.includes(pattern)) {
      return label;
    }
  }
  
  // Fallback: convert camelCase/snake_case to Title Case
  return rawName
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}
```

#### Change 6: Apply humanization in extension capture

**File:** `extension/background.js`

Update the CAPTURE_FORM handler to humanize labels:

```javascript
// In the schema transformation section
schema.fields.push({
  id: field.id || field.name,
  name: field.name,
  label: humanizeLabel(field.label || field.placeholder || field.name || field.id),
  // ... rest
});

function humanizeLabel(raw) {
  if (!raw) return 'Unknown Field';
  
  const patterns = {
    'voornaam': 'First Name',
    'achternaam': 'Last Name',
    'geboortedatum': 'Date of Birth',
    // ... add more
  };
  
  const lower = raw.toLowerCase();
  for (const [pattern, label] of Object.entries(patterns)) {
    if (lower.includes(pattern)) return label;
  }
  
  return raw.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
}
```

### 🟢 P2 - Medium (UX Improvements)

#### Change 7: Create FormSchemaContext for single source of truth

**New File:** `web/src/contexts/FormSchemaContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  capturedAt?: Date;
  source?: 'voice' | 'extension' | 'manual';
}

interface FormSchemaContextValue {
  schema: FormSchema | null;
  setSchema: (schema: FormSchema, source: 'voice' | 'extension' | 'manual') => void;
  clearSchema: () => void;
  isStale: boolean; // True if captured > 5 minutes ago
}

const FormSchemaContext = createContext<FormSchemaContextValue | null>(null);

export function FormSchemaProvider({ children }: { children: ReactNode }) {
  const [schema, setSchemaState] = useState<FormSchema | null>(null);

  const setSchema = useCallback((newSchema: FormSchema, source: 'voice' | 'extension' | 'manual') => {
    setSchemaState({
      ...newSchema,
      capturedAt: new Date(),
      source,
    });
  }, []);

  const clearSchema = useCallback(() => setSchemaState(null), []);

  const isStale = schema?.capturedAt 
    ? Date.now() - schema.capturedAt.getTime() > 5 * 60 * 1000
    : false;

  return (
    <FormSchemaContext.Provider value={{ schema, setSchema, clearSchema, isStale }}>
      {children}
    </FormSchemaContext.Provider>
  );
}

export function useFormSchema() {
  const ctx = useContext(FormSchemaContext);
  if (!ctx) throw new Error('useFormSchema must be used within FormSchemaProvider');
  return ctx;
}
```

#### Change 8: Add visual feedback for capture status

**File:** `web/src/components/VoiceAgent.tsx`

Add capture status indicator:

```tsx
{isCapturing && (
  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center rounded-xl">
    <div className="animate-pulse text-blue-600 font-medium">
      📸 Capturing form...
    </div>
  </div>
)}
```

#### Change 9: Improve extension error handling

**File:** `web/src/components/VoiceAgent.tsx`

```typescript
async function capturePageViaExtension(): Promise<FormSchema> {
  // Add timeout
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Extension timeout - is it installed?')), 10000)
  );
  
  const capturePromise = new Promise<FormSchema>((resolve, reject) => {
    // ... existing logic
  });
  
  return Promise.race([capturePromise, timeoutPromise]);
}
```

---

## 7. Testing Plan

### Unit Tests Needed

1. `humanizeFieldName()` with various Dutch patterns
2. Tool handler parameter parsing (both `field_mappings` and `fieldMappings`)
3. Schema format transformations

### Integration Tests Needed

1. Full capture flow: Voice command → Extension → Schema returned
2. Fill flow: Voice command → Extension → Fields populated
3. Context persistence: Capture → New utterance → Agent remembers fields

### Manual Test Script

```
1. Load extension in chrome://extensions (developer mode)
2. Start web app: npm run dev
3. Open demo form in new tab
4. Click "Start Voice Chat"
5. Say: "I need help filling this form"
6. Verify: Agent calls capture_page tool
7. Verify: FormStatus panel shows captured fields
8. Say: "Fill in my first name and last name"
9. Verify: Agent calls fill_form with correct mappings
10. Verify: Form fields are populated
```

---

## 8. Architectural Decisions (For Human Review)

### Decision 1: Tool Naming
**Options:**
- A) Rename code tools to match docs (`request_form_schema`, `fill_form`)
- B) Update ElevenLabs dashboard to match code (`capture_page`, `fill_form`)

**Recommendation:** Option B - `capture_page` is more intuitive and already in code.

### Decision 2: Context Injection Method
**Options:**
- A) Use `sendContextualUpdate()` after capture
- B) Append context to tool response string
- C) Store in system prompt override

**Recommendation:** Option A - cleanest separation of concerns.

### Decision 3: Schema Source of Truth
**Options:**
- A) Keep dual state (voiceAgentSchema + extensionFormSchema)
- B) Create shared FormSchemaContext

**Recommendation:** Option B for cleaner architecture, but A is acceptable for hackathon speed.

### Decision 4: Label Humanization Location
**Options:**
- A) In extension (background.js)
- B) In web app (after receive)
- C) Both (extension does basic, app refines)

**Recommendation:** Option A - do it once at source.

---

## 9. Implementation Order

```
Phase 1 (30 min) - Fix blocking issues
├── Verify/fix tool names in ElevenLabs dashboard
├── Enable "blocking" for both tools
└── Fix parameter name handling in fill_form

Phase 2 (1 hour) - Add context persistence  
├── Implement sendContextualUpdate after capture
├── Test agent remembers fields across turns
└── Add capture status indicator

Phase 3 (1 hour) - Improve label quality
├── Create dutch-field-names.ts dictionary
├── Integrate into extension capture
└── Test with real Dutch government forms

Phase 4 (30 min) - Polish
├── Add timeout/error handling
├── Create FormSchemaContext (if time)
└── Update documentation
```

---

## 10. Files to Modify

| Priority | File | Changes |
|----------|------|---------|
| P0 | ElevenLabs Dashboard | Enable blocking, verify tool names |
| P0 | `web/src/components/VoiceAgent.tsx` | Fix param names, add context injection |
| P1 | `extension/background.js` | Add label humanization |
| P1 | `web/src/lib/dutch-field-names.ts` | NEW - Dutch field dictionary |
| P2 | `web/src/contexts/FormSchemaContext.tsx` | NEW - Single source of truth |
| P2 | `web/src/app/page.tsx` | Use FormSchemaContext |
| P2 | `docs/AGENT_SETUP.md` | Update tool configuration |

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ElevenLabs dashboard changes break things | Medium | High | Document current config, test after changes |
| `sendContextualUpdate` not available in version | Low | High | Fallback to appending context to tool response |
| Extension store policies block functionality | Low | Medium | Use "unlisted" distribution for demo |
| Dutch field dictionary incomplete | High | Low | Keep fallback to raw names, iterate |

---

## Summary

**Problem 1 (Agent forgets forms):** Fix by (1) matching tool names, (2) enabling blocking, (3) using `sendContextualUpdate()`.

**Problem 2 (UI not showing fields):** Fix by ensuring schema flows through single state, adding visual feedback.

**Problem 3 (Cryptic labels):** Fix by adding Dutch field name dictionary at capture time.

**Estimated Time:** 3-4 hours for full implementation.

---

*Plan created by PLANNER-001. Ready for REVIEWER assignment.*
