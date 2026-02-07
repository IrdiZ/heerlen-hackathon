# MigrantAI — Buildathon Spec (Final)

## Overview
Voice-first AI assistant helping immigrants in the Netherlands navigate bureaucracy. User speaks in their language → agent explains processes, searches Dutch gov sources, and fills web forms via a Chrome extension. Personal data never leaves the browser.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER                              │
│                                                          │
│  ┌──────────────┐    chrome.runtime     ┌─────────────┐ │
│  │  Web App     │◄────message passing───►│  Extension  │ │
│  │  (Next.js)   │                        │  content.js │ │
│  │              │                        │             │ │
│  │  ElevenLabs  │                        │  Extracts   │ │
│  │  Voice Widget│                        │  form schema│ │
│  │  + PII Form  │                        │  Fills form │ │
│  └──────┬───────┘                        └─────────────┘ │
│         │                                                │
└─────────┼────────────────────────────────────────────────┘
          │ WebSocket
          ▼
┌──────────────────┐
│  ElevenLabs      │
│  Conversational  │
│  AI Platform     │
│                  │
│  - Voice STT/TTS │
│  - LLM (Claude)  │
│  - Web Search    │
│  - Client Tools  │
└──────────────────┘
```

No backend. No database. No extra API keys beyond ElevenLabs.

---

## Core Data Flows

### Voice Conversation
User speaks any language → ElevenLabs STT → Claude LLM (with web search for Dutch gov info) → ElevenLabs TTS → User hears response in their language.

### Form Fill (Placeholder Model)

```
1. User types PII into local form in web app
   → stored in chrome.storage.local, never sent anywhere

2. User navigates to gemeente form, clicks "Capture Form" in extension

3. Extension extracts form schema (field names, types, labels only):
   { fields: [{ id: "voornaam", label: "Voornaam", type: "text" }, ...] }

4. Schema sent to web app → injected into ElevenLabs conversation

5. Agent maps PLACEHOLDERS to fields (never sees real data):
   { "voornaam": "[FIRST_NAME]", "geboortedatum": "[DOB]" }

6. Extension receives fill map, swaps placeholders for real values
   from local storage, fills form fields, highlights them green

7. User reviews and submits manually
```

### Privacy

```
SENT TO SERVER:                     STAYS LOCAL:
- Voice audio (Q&A only, no PII)   - Actual PII values
- Form schema (field names only)    - Final fill map with real values
- Placeholder tokens                - All form filling
```

---

## Components

### 1. Web App (Next.js)
**Path:** `/web`

```
app/
├── page.tsx                  # Landing → Active → Form Mode
├── components/
│   ├── VoiceAgent.tsx        # ElevenLabs widget wrapper
│   ├── Transcript.tsx        # Live conversation display
│   ├── PIIForm.tsx           # Local-only form for personal details
│   ├── FormStatus.tsx        # Captured fields + fill state
│   └── LanguageHint.tsx      # "Speak in any language"
├── hooks/
│   ├── useExtension.ts       # Message passing with Chrome extension
│   └── useLocalPII.ts        # PII in local storage only
├── lib/
│   ├── elevenlabs.ts         # Config, client tool handlers
│   └── placeholders.ts       # Token definitions + swap logic
└── styles/
    └── globals.css
```

**Three UI states:**
1. **Landing** — "Start Conversation" button, language hint, clean design
2. **Active** — ElevenLabs voice widget, live transcript, PII form panel
3. **Form Mode** — Captured form schema, fill progress, status indicators

**ElevenLabs Integration:**
- `@11labs/react` SDK
- Client tool: `fill_form` — receives placeholder fill map from agent
- Client tool: `request_form_schema` — triggers extension to capture

### 2. ElevenLabs Voice Agent

**LLM:** Claude (via ElevenLabs built-in)

**System Prompt:**
```
You are MigrantAI, an assistant helping immigrants navigate Dutch
bureaucracy. You speak the user's language fluently and naturally.

CAPABILITIES:
- Search Dutch government websites for immigration info
- Help users fill web forms via browser extension
- Explain Dutch bureaucratic processes step by step
- Translate Dutch letters and documents the user describes

FORM FILLING FLOW:
1. When the user wants to fill a form, ask them to click
   "Capture Form" in the extension
2. You will receive a form schema with field names and types
3. You have access to placeholder tokens: [FIRST_NAME],
   [LAST_NAME], [DOB], [NATIONALITY], [ADDRESS], [POSTCODE],
   [CITY], [PHONE], [EMAIL], etc.
4. Map the correct placeholder to each form field based on the
   field's label and type
5. For dropdowns, match the placeholder's meaning to the closest
   option. Ask the user via voice which option to select if
   ambiguous.
6. Return the fill map using placeholders only:
   { "voornaam": "[FIRST_NAME]", "geboortedatum": "[DOB]" }

CRITICAL PRIVACY RULE:
- NEVER ask the user to speak personal information out loud.
- If the user volunteers PII via voice, remind them to enter it
  in the secure local form instead.
- You only work with placeholder tokens for PII.

BEHAVIOR:
- Be warm but efficient. Users are often stressed.
- Give 2-3 actionable steps, not essays.
- If unsure about a regulation, search first, don't guess.
- For dates, confirm Dutch format (DD-MM-YYYY).
- Explain Dutch terms simply when users seem confused.
```

**Tools:**
| Tool | Type | Input | Output |
|------|------|-------|--------|
| `web_search` | Built-in | query | Search results |
| `fill_form` | Client | `{ fieldId: placeholder, ... }` | Success/failure |
| `request_form_schema` | Client | none | Triggers extension capture |

**Languages:** Auto-detected. Targets: Arabic, English, Turkish, Polish, Ukrainian, Dutch.

### 3. Chrome Extension (Manifest V3)
**Path:** `/extension`

```
extension/
├── manifest.json
├── background.js          # Service worker — relay messages
├── content.js             # Schema extractor + form filler
├── popup.html             # "Capture Form" button
├── popup.js
└── icons/
```

**manifest.json:**
```json
{
  "manifest_version": 3,
  "name": "MigrantAI Form Filler",
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["<all_urls>"],
  "action": { "default_popup": "popup.html" },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "externally_connectable": {
    "matches": ["http://localhost:*/*", "https://migrant-ai.vercel.app/*"]
  }
}
```

**content.js — Schema Extractor:**
```javascript
function extractFormSchema() {
  const fields = [];
  const elements = document.querySelectorAll(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'
  );

  elements.forEach(el => {
    const labelFor = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
    const ariaLabel = el.getAttribute('aria-label');
    const closestLabel = el.closest('label');
    const placeholder = el.getAttribute('placeholder');

    const label = labelFor?.textContent?.trim()
      || ariaLabel
      || closestLabel?.textContent?.trim()
      || placeholder
      || el.name || el.id || 'unknown';

    const field = {
      id: el.id || el.name || `field_${fields.length}`,
      name: el.name,
      label,
      type: el.type || el.tagName.toLowerCase(),
      tag: el.tagName,
      required: el.required
    };

    if (el.tagName === 'SELECT') {
      field.options = [...el.options]
        .filter(o => o.value)
        .map(o => ({ value: o.value, text: o.textContent.trim() }));
    }

    if (el.type === 'radio' || el.type === 'checkbox') {
      if (fields.some(f => f.name === el.name)) return;
      const group = document.querySelectorAll(`input[name="${el.name}"]`);
      field.options = [...group].map(g => ({
        value: g.value,
        label: document.querySelector(`label[for="${g.id}"]`)?.textContent?.trim() || g.value
      }));
    }

    fields.push(field);
  });

  return { url: window.location.href, title: document.title, fields };
}
```

**content.js — Form Filler:**
```javascript
function fillForm(fillMap) {
  const results = [];

  Object.entries(fillMap).forEach(([fieldId, value]) => {
    const el = document.getElementById(fieldId)
      || document.querySelector(`[name="${fieldId}"]`);

    if (!el) { results.push({ field: fieldId, status: 'not_found' }); return; }

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;

    if (el.tagName === 'SELECT') {
      el.value = value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el.type === 'radio' || el.type === 'checkbox') {
      const target = document.querySelector(`input[name="${fieldId}"][value="${value}"]`);
      if (target) { target.checked = true; target.dispatchEvent(new Event('change', { bubbles: true })); }
    } else {
      nativeSetter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    el.style.outline = '2px solid #22c55e';
    el.style.outlineOffset = '2px';
    setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 3000);

    results.push({ field: fieldId, status: 'filled' });
  });

  return results;
}
```

**Message Passing:**
```
Web App ──chrome.runtime.sendMessage──► Background.js ──tabs.sendMessage──► Content.js
Web App ◄──chrome.runtime.sendMessage── Background.js ◄──sendResponse────── Content.js
```

---

## Target Form (MVP)

**Gemeente Registration (Verhuizing Doorgeven)**

For demo: realistic HTML replica of a gemeente form. Same styling, Dutch labels, proper field types.

| Field | Type | Dutch Label | Example |
|-------|------|-------------|---------|
| voornaam | text | Voornaam | Ahmed |
| achternaam | text | Achternaam | Hassan |
| geboortedatum | date | Geboortedatum | 1990-01-05 |
| geboorteplaats | text | Geboorteplaats | Cairo |
| nationaliteit | select | Nationaliteit | Egyptische |
| geslacht | radio | Geslacht | Man / Vrouw / Onbekend |
| straatnaam | text | Straat | Keizersgracht |
| huisnummer | text | Huisnummer | 42 |
| postcode | text | Postcode | 1015 AA |
| woonplaats | text | Woonplaats | Amsterdam |
| telefoonnummer | tel | Telefoonnummer | 06-12345678 |
| email | email | E-mailadres | ahmed@example.com |

---

## Build Order

| Phase | Task | Owner | Time |
|-------|------|-------|------|
| **0** | **Validate ElevenLabs client tools** — register a tool, get structured JSON back. If this fails, everything changes. Test FIRST. | Zen | 1h |
| **1** | Scaffold Next.js app, integrate ElevenLabs widget, get voice working. | Zen | 2h |
| **2** | Build Chrome extension: popup + schema extractor. Test on a real page. | Magdy | 2h |
| **3** | Build gemeente form replica (static HTML). | Magdy | 1h |
| **4** | Wire message passing: extension ↔ web app. | Both | 2h |
| **5** | Configure ElevenLabs agent: system prompt, tools, web search. | Zen | 1h |
| **6** | Implement form filler in content.js + PII form in web app. | Magdy | 1h |
| **7** | End-to-end test: Arabic voice → schema capture → placeholder fill. | Both | 2h |
| **8** | UI polish + demo rehearsal (3x minimum). | Both | 1h |
| | **Total** | | **~13h** |

**Phase 0 is non-negotiable.** If ElevenLabs client tools can't return structured JSON, fallback: parse agent text response client-side for JSON, or add a single Vercel serverless function as webhook.

---

## Demo Script (2 minutes)

**Lead with the story, not the tech.**

1. **[0:00]** "When you move to the Netherlands, every form is in Dutch, every website assumes you know the system, and there's nobody to help you in your language."
2. **[0:10]** Open web app. Click Start. Agent greets in English.
3. **[0:15]** User speaks Arabic: "أحتاج أسجل عنواني في البلدية"
4. **[0:25]** Agent responds IN ARABIC — explains gemeente registration step by step, what documents to bring.
5. **[0:40]** User types personal details into secure local form. Quick callout: "This stays in your browser."
6. **[0:50]** Switch to gemeente form tab. Click "Capture Form."
7. **[1:00]** Agent maps fields, asks about nationality dropdown in Arabic.
8. **[1:15]** Form fills automatically. Fields highlight green.
9. **[1:30]** "Your data never left the browser. The AI only saw placeholders."
10. **[1:40]** "MigrantAI — your voice, your language, your guide to the Netherlands."

**Have a backup screen recording. Rehearse 3 times. Script the Arabic input exactly so the agent handles it perfectly.**

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Next.js + TypeScript | Familiar, fast, Vercel-native |
| Voice/AI | ElevenLabs Conversational AI (Claude LLM) | STT, TTS, LLM, web search, client tools — all-in-one |
| Extension | Chrome Manifest V3 | `externally_connectable` for message passing |
| Hosting | Vercel | Free tier, instant deploys, Next.js native |
| Form Replica | Static HTML | Reliable demo, no auth dependency |

---

## Post-Buildathon (if this becomes real)

1. **Curated knowledge base** — verified Dutch immigration info via RAG, not just web search
2. **Document scanning** — photo of Dutch letter → OCR → agent explains it
3. **Real form support** — generic extractor for SPAs, iframes, DigiD auth
4. **Guided workflows** — stateful immigration journey checklist, not just Q&A
5. **Mobile app** — voice-first makes mobile natural
6. **Multi-country** — same architecture, different gov sources

---

Built for Buildathon by Zen & Magdy
