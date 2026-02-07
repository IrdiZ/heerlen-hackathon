# MigrantAI Chrome Extension - Robust Architecture Plan

## Executive Summary

This plan addresses the core problems with the current extension and proposes a robust, production-ready architecture for form capture and filling on Dutch government websites.

---

## 1. Field Label Extraction - Multi-Strategy Approach

### Current Problem
Fields show cryptic IDs like `field_123` instead of "First Name" because:
- Dutch government sites often use generated IDs
- Labels may be in `<span>`, `<div>`, or table cells, not proper `<label>`
- Accessibility markup (aria-*) is inconsistent

### Proposed Solution: LabelResolver Class

```javascript
// NEW FILE: label-resolver.js

class LabelResolver {
  constructor(field) {
    this.field = field;
    this.rect = field.getBoundingClientRect();
  }

  resolve() {
    // Execute strategies in priority order
    const strategies = [
      this.fromExplicitLabel,      // Best: <label for="id">
      this.fromAriaLabel,          // Good: aria-label attribute
      this.fromAriaLabelledBy,     // Good: aria-labelledby reference
      this.fromParentLabel,        // Common: nested in <label>
      this.fromFieldset,           // Group context: <legend>
      this.fromTableHeader,        // Government pattern: <th> above/left
      this.fromPrecedingSibling,   // Adjacent sibling text
      this.fromVisualProximity,    // DOM elements visually above
      this.fromTitle,              // title attribute
      this.fromPlaceholder,        // placeholder (last resort)
      this.fromNameHeuristics,     // Parse field name/id
    ];

    for (const strategy of strategies) {
      const label = strategy.call(this);
      if (label && this.isValidLabel(label)) {
        return {
          text: this.normalizeLabel(label.text),
          confidence: label.confidence,
          source: label.source,
        };
      }
    }

    return { text: 'Unknown Field', confidence: 0.1, source: 'fallback' };
  }

  // Strategy 1: Explicit label[for="id"]
  fromExplicitLabel() {
    if (!this.field.id) return null;
    const label = document.querySelector(`label[for="${CSS.escape(this.field.id)}"]`);
    if (label) {
      return { text: label.textContent.trim(), confidence: 1.0, source: 'label-for' };
    }
    return null;
  }

  // Strategy 2: aria-label
  fromAriaLabel() {
    const label = this.field.getAttribute('aria-label');
    if (label) {
      return { text: label, confidence: 0.95, source: 'aria-label' };
    }
    return null;
  }

  // Strategy 3: aria-labelledby (can reference multiple elements)
  fromAriaLabelledBy() {
    const ids = this.field.getAttribute('aria-labelledby');
    if (!ids) return null;
    
    const texts = ids.split(/\s+/)
      .map(id => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean);
    
    if (texts.length > 0) {
      return { text: texts.join(' '), confidence: 0.95, source: 'aria-labelledby' };
    }
    return null;
  }

  // Strategy 4: Parent label element
  fromParentLabel() {
    const label = this.field.closest('label');
    if (!label) return null;
    
    // Clone and remove input elements to get only label text
    const clone = label.cloneNode(true);
    clone.querySelectorAll('input, select, textarea, button').forEach(el => el.remove());
    const text = clone.textContent.trim();
    
    if (text) {
      return { text, confidence: 0.9, source: 'parent-label' };
    }
    return null;
  }

  // Strategy 5: Fieldset legend (for grouped fields)
  fromFieldset() {
    const fieldset = this.field.closest('fieldset');
    if (!fieldset) return null;
    
    const legend = fieldset.querySelector('legend');
    if (legend) {
      // Combine legend with local label if available
      const localLabel = this.fromPrecedingSibling();
      const legendText = legend.textContent.trim();
      
      if (localLabel) {
        return { 
          text: `${legendText}: ${localLabel.text}`, 
          confidence: 0.85, 
          source: 'fieldset-legend' 
        };
      }
      return { text: legendText, confidence: 0.7, source: 'fieldset-legend' };
    }
    return null;
  }

  // Strategy 6: Table header (common in government forms)
  fromTableHeader() {
    const td = this.field.closest('td');
    if (!td) return null;
    
    const tr = td.closest('tr');
    const table = td.closest('table');
    if (!tr || !table) return null;
    
    const cellIndex = Array.from(tr.cells).indexOf(td);
    
    // Check for th in same column
    const headerRows = table.querySelectorAll('thead tr, tr:first-child');
    for (const headerRow of headerRows) {
      const th = headerRow.cells[cellIndex];
      if (th && (th.tagName === 'TH' || th.querySelector('strong, b'))) {
        const text = th.textContent.trim();
        if (text) {
          return { text, confidence: 0.8, source: 'table-header' };
        }
      }
    }
    
    // Check for th/label in same row but different cell (row label pattern)
    for (const cell of tr.cells) {
      if (cell === td) continue;
      if (cell.tagName === 'TH' || cell.querySelector('label, strong')) {
        const text = cell.textContent.trim();
        if (text && text.length < 100) {
          return { text, confidence: 0.75, source: 'table-row-header' };
        }
      }
    }
    
    return null;
  }

  // Strategy 7: Preceding sibling elements
  fromPrecedingSibling() {
    let sibling = this.field.previousElementSibling;
    let attempts = 0;
    
    while (sibling && attempts < 3) {
      if (['LABEL', 'SPAN', 'DIV', 'P', 'STRONG', 'B'].includes(sibling.tagName)) {
        const text = sibling.textContent.trim();
        if (text && text.length > 1 && text.length < 100) {
          return { text, confidence: 0.7, source: 'preceding-sibling' };
        }
      }
      sibling = sibling.previousElementSibling;
      attempts++;
    }
    
    // Also check parent's preceding sibling (nested wrapper pattern)
    const parent = this.field.parentElement;
    if (parent && parent.previousElementSibling) {
      const text = parent.previousElementSibling.textContent.trim();
      if (text && text.length > 1 && text.length < 100) {
        return { text, confidence: 0.65, source: 'parent-preceding-sibling' };
      }
    }
    
    return null;
  }

  // Strategy 8: Visual proximity (elements directly above the field)
  fromVisualProximity() {
    const rect = this.rect;
    if (!rect.width) return null; // Hidden field
    
    // Sample points above the field
    const checkPoints = [
      { x: rect.left + 5, y: rect.top - 10 },
      { x: rect.left + 5, y: rect.top - 25 },
      { x: rect.left + rect.width / 2, y: rect.top - 15 },
    ];
    
    for (const point of checkPoints) {
      if (point.y < 0) continue;
      
      const elements = document.elementsFromPoint(point.x, point.y);
      for (const el of elements) {
        // Skip if it's the field itself or its container
        if (el.contains(this.field) || this.field.contains(el)) continue;
        
        // Skip structural elements
        if (['HTML', 'BODY', 'FORM', 'MAIN', 'SECTION', 'DIV'].includes(el.tagName) && 
            !el.textContent.trim().length < 100) continue;
        
        const text = el.textContent.trim();
        if (text && text.length > 1 && text.length < 100) {
          // Verify this element is actually above (not just overlapping)
          const elRect = el.getBoundingClientRect();
          if (elRect.bottom <= rect.top + 5) {
            return { text, confidence: 0.6, source: 'visual-proximity' };
          }
        }
      }
    }
    
    return null;
  }

  // Strategy 9: title attribute
  fromTitle() {
    const title = this.field.getAttribute('title');
    if (title) {
      return { text: title, confidence: 0.5, source: 'title' };
    }
    return null;
  }

  // Strategy 10: placeholder (often contains the question)
  fromPlaceholder() {
    const placeholder = this.field.placeholder;
    if (placeholder && placeholder.length > 2) {
      return { text: placeholder, confidence: 0.4, source: 'placeholder' };
    }
    return null;
  }

  // Strategy 11: Parse field name/id into human-readable text
  fromNameHeuristics() {
    const value = this.field.name || this.field.id;
    if (!value) return null;
    
    // Skip clearly auto-generated IDs
    if (/^(field_?\d+|input_?\d+|q\d+|[a-f0-9]{8,})$/i.test(value)) {
      return null;
    }
    
    // Convert camelCase/snake_case/kebab-case to words
    const humanized = value
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase
      .replace(/[_-]/g, ' ')                  // snake_case, kebab-case
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    
    // Capitalize first letter
    const text = humanized.charAt(0).toUpperCase() + humanized.slice(1);
    
    return { text, confidence: 0.3, source: 'name-heuristics' };
  }

  // Validate label quality
  isValidLabel(label) {
    if (!label || !label.text) return false;
    const text = label.text.trim();
    
    // Too short or too long
    if (text.length < 2 || text.length > 150) return false;
    
    // Just symbols or numbers
    if (/^[\d\s\-_:*]+$/.test(text)) return false;
    
    // Common non-label patterns
    if (/^(required|optional|verplicht|optioneel|\*)$/i.test(text)) return false;
    
    return true;
  }

  // Normalize label text
  normalizeLabel(text) {
    return text
      .replace(/\*+$/, '')           // Remove trailing asterisks (required markers)
      .replace(/:\s*$/, '')          // Remove trailing colons
      .replace(/\s+/g, ' ')          // Normalize whitespace
      .trim();
  }
}
```

### Dutch-Specific Enhancements

```javascript
// ADDITION TO label-resolver.js

// Dutch to English field name mappings (common government form fields)
const DUTCH_FIELD_TRANSLATIONS = {
  // Personal information
  'voornaam': 'First name',
  'voornamen': 'First names',
  'achternaam': 'Last name / Surname',
  'familienaam': 'Family name',
  'tussenvoegsel': 'Name prefix (e.g., van, de)',
  'geboortedatum': 'Date of birth',
  'geboorteplaats': 'Place of birth',
  'geboorteland': 'Country of birth',
  'geslacht': 'Gender',
  'nationaliteit': 'Nationality',
  
  // Identification
  'bsn': 'BSN (Citizen Service Number)',
  'burgerservicenummer': 'BSN (Citizen Service Number)',
  'documentnummer': 'Document number',
  'paspoortnummer': 'Passport number',
  'verblijfsdocument': 'Residence permit',
  
  // Contact
  'straat': 'Street',
  'straatnaam': 'Street name',
  'huisnummer': 'House number',
  'toevoeging': 'House number addition',
  'postcode': 'Postal code',
  'woonplaats': 'City / Place of residence',
  'gemeente': 'Municipality',
  'land': 'Country',
  'telefoonnummer': 'Phone number',
  'mobiel': 'Mobile phone',
  'emailadres': 'Email address',
  'e-mailadres': 'Email address',
  
  // Employment
  'werkgever': 'Employer',
  'beroep': 'Profession / Occupation',
  'inkomen': 'Income',
  'dienstverband': 'Employment contract',
  
  // Family
  'burgerlijke staat': 'Marital status',
  'partner': 'Partner / Spouse',
  'kinderen': 'Children',
  'gezinsleden': 'Family members',
  
  // Dates and times
  'datum': 'Date',
  'begindatum': 'Start date',
  'einddatum': 'End date',
  'aankomstdatum': 'Arrival date',
  
  // Actions
  'handtekening': 'Signature',
  'akkoord': 'Agreement / Accept',
  'verzenden': 'Submit / Send',
  'opslaan': 'Save',
  'annuleren': 'Cancel',
};

// Add bilingual label enhancement
enhanceWithDutchTranslation(label) {
  if (!label || !label.text) return label;
  
  const lowerText = label.text.toLowerCase();
  
  // Check if any Dutch term is in the label
  for (const [dutch, english] of Object.entries(DUTCH_FIELD_TRANSLATIONS)) {
    if (lowerText.includes(dutch)) {
      return {
        ...label,
        text: label.text,
        textEN: english,
        bilingual: true,
      };
    }
  }
  
  return label;
}
```

---

## 2. Capture Modes Architecture

### 2.1 Quick Capture (HTML Extraction)

**When to use:**
- Default for all initial captures
- Government forms (IND, DUO, Belastingdienst, gemeentes)
- Forms with standard HTML structure
- When user doesn't have OpenAI API key

**Cost:** Free

**Accuracy:** ~70-85% for well-structured forms

```javascript
// background.js - Enhanced Quick Capture

async function quickCapture(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: captureFormData,
    world: 'MAIN', // Access page context
  });
  
  return processCapture(result[0]?.result);
}

function processCapture(rawData) {
  const processed = {
    ...rawData,
    fields: rawData.fields.map(field => ({
      ...field,
      label: field.resolvedLabel || field.label,
      labelConfidence: field.labelConfidence || 0.5,
      // Flag low-confidence labels for potential Visual Capture
      needsVisualVerification: field.labelConfidence < 0.6,
    })),
  };
  
  // Calculate overall quality score
  const avgConfidence = processed.fields.reduce((sum, f) => sum + (f.labelConfidence || 0), 0) / 
                         Math.max(processed.fields.length, 1);
  
  processed.captureQuality = {
    score: avgConfidence,
    lowConfidenceFields: processed.fields.filter(f => f.needsVisualVerification).length,
    recommendation: avgConfidence < 0.6 ? 'visual-capture-recommended' : 'quick-capture-sufficient',
  };
  
  return processed;
}
```

### 2.2 Visual Capture (Screenshot + GPT-4o)

**When to use:**
- User explicitly requests it
- Quick Capture suggests visual verification
- Forms with many low-confidence labels
- Complex multi-step forms with progress indicators
- PDF-embedded forms or canvas-based forms

**Cost:** ~$0.01-0.03 per capture (based on image size)

**Accuracy:** ~90-98%

```javascript
// background.js - Enhanced Visual Capture

async function visualCapture(tabId, options = {}) {
  // Step 1: Capture screenshot
  const screenshot = await chrome.tabs.captureVisibleTab(null, {
    format: 'jpeg',
    quality: options.quality || 85,
  });
  
  // Step 2: Get Quick Capture data as context
  const quickData = await quickCapture(tabId);
  
  // Step 3: Get API key
  const { openaiApiKey } = await chrome.storage.local.get('openaiApiKey');
  if (!openaiApiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      quickCapture: quickData, // Still return quick capture data
    };
  }
  
  // Step 4: Send to GPT-4o with enhanced prompt
  const analysis = await analyzeFormWithVision(screenshot, quickData, openaiApiKey);
  
  // Step 5: Merge results
  return mergeResults(quickData, analysis);
}

async function analyzeFormWithVision(screenshot, quickData, apiKey) {
  // Build context from quick capture
  const knownFields = quickData.fields
    .map(f => `- "${f.label}" (${f.type}, ID: ${f.id || f.name || 'unknown'})`)
    .join('\n');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a form analysis expert helping immigrants understand Dutch government forms.

Your task: Analyze this screenshot and identify ALL visible form fields with their human-readable labels.

Context - DOM extraction found these fields:
${knownFields || 'No fields detected from HTML'}

For each visible field, provide:
1. The exact visible label text (in the original language, usually Dutch)
2. English translation of the label
3. Field type (text, date, select, checkbox, radio, etc.)
4. Whether it appears required (asterisk, red, "verplicht")
5. Any visible validation errors
6. Helpful hint about what to enter

Also identify:
- The form title/purpose
- Any instructions or help text
- Submit/navigation buttons
- Progress indicators (step X of Y)

Output strict JSON only, no markdown:
{
  "formTitle": "...",
  "formPurpose": "Brief English explanation of what this form is for",
  "currentStep": { "current": 1, "total": 3 } or null,
  "fields": [
    {
      "visibleLabel": "Achternaam",
      "labelEN": "Last name / Surname",
      "fieldType": "text",
      "required": true,
      "currentValue": "" or "visible value",
      "error": null or "visible error message",
      "hint": "Your family name as shown on passport",
      "position": { "top": 120, "left": 50 }
    }
  ],
  "errors": ["List of any visible error messages"],
  "instructions": ["Any visible help text or instructions"],
  "buttons": [{ "text": "Verzenden", "textEN": "Submit", "type": "submit" }]
}`,
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: screenshot } },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for consistent extraction
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  // Parse JSON from response
  try {
    return JSON.parse(content);
  } catch (e) {
    // Try to extract JSON from markdown code block
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}

function mergeResults(quickData, visualData) {
  // Create a map of visual fields by approximate position
  const visualFieldMap = new Map();
  visualData.fields?.forEach(vf => {
    // Key by label for matching
    visualFieldMap.set(vf.visibleLabel?.toLowerCase(), vf);
  });
  
  // Enhance quick capture fields with visual data
  const enhancedFields = quickData.fields.map(qf => {
    // Try to find matching visual field
    const labelKey = qf.label?.toLowerCase();
    const visualMatch = visualFieldMap.get(labelKey);
    
    if (visualMatch) {
      return {
        ...qf,
        label: visualMatch.visibleLabel,
        labelEN: visualMatch.labelEN,
        labelConfidence: 0.95,
        hint: visualMatch.hint,
        error: visualMatch.error,
        visualVerified: true,
      };
    }
    
    return qf;
  });
  
  // Add any visual-only fields (detected by vision but not in DOM)
  visualData.fields?.forEach(vf => {
    const exists = enhancedFields.some(ef => 
      ef.label?.toLowerCase() === vf.visibleLabel?.toLowerCase()
    );
    
    if (!exists) {
      enhancedFields.push({
        id: `visual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        label: vf.visibleLabel,
        labelEN: vf.labelEN,
        type: vf.fieldType,
        required: vf.required,
        hint: vf.hint,
        visualOnly: true, // Can't fill this programmatically
        labelConfidence: 0.9,
      });
    }
  });
  
  return {
    ...quickData,
    fields: enhancedFields,
    formTitle: visualData.formTitle,
    formPurpose: visualData.formPurpose,
    currentStep: visualData.currentStep,
    instructions: visualData.instructions,
    buttons: visualData.buttons,
    captureType: 'visual',
    captureQuality: {
      score: 0.95,
      visualVerified: true,
    },
  };
}
```

### 2.3 Hybrid Strategy (Recommended Default)

```javascript
// Automatic capture mode selection

async function smartCapture(tabId) {
  // Always start with Quick Capture (free)
  const quickResult = await quickCapture(tabId);
  
  // Evaluate quality
  const quality = quickResult.captureQuality;
  
  if (quality.score >= 0.7 && quality.lowConfidenceFields <= 2) {
    // Quick capture is sufficient
    return { ...quickResult, mode: 'quick' };
  }
  
  // Check if Visual Capture is available
  const { openaiApiKey } = await chrome.storage.local.get('openaiApiKey');
  
  if (!openaiApiKey) {
    // Return quick capture with warning
    return {
      ...quickResult,
      mode: 'quick',
      warning: 'Some field labels may be unclear. Add OpenAI API key for better accuracy.',
    };
  }
  
  // Check user preference
  const { autoVisualCapture } = await chrome.storage.local.get('autoVisualCapture');
  
  if (!autoVisualCapture) {
    // Return quick capture with recommendation
    return {
      ...quickResult,
      mode: 'quick',
      recommendation: 'visual-capture-available',
    };
  }
  
  // Auto-trigger Visual Capture
  return visualCapture(tabId);
}
```

---

## 3. Cross-Tab Communication Architecture

### The Problem
- User has MigrantAI app open in Tab A
- User navigates to IND.nl form in Tab B
- Voice agent needs to capture Tab B while running in Tab A
- Current implementation uses persistent connection which breaks often

### Solution: Message-Based Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   MigrantAI     │     │   Background.js     │     │   Form Tab      │
│   App Tab       │     │   (Service Worker)  │     │   (IND.nl)      │
└────────┬────────┘     └──────────┬──────────┘     └────────┬────────┘
         │                         │                          │
         │  sendMessageExternal    │                          │
         │ ───────────────────────>│                          │
         │   { type: 'CAPTURE' }   │                          │
         │                         │  executeScript           │
         │                         │ ─────────────────────────>
         │                         │                          │
         │                         │<─────────────────────────│
         │                         │   form data              │
         │<───────────────────────│                          │
         │   { schema, fields }    │                          │
         │                         │                          │
         ▼                         ▼                          ▼
```

### Implementation

```javascript
// background.js - Robust Message Broker

// Track active form tabs for quick access
let activeFormTabs = new Map();

// Handle external messages from web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  handleExternalMessage(message, sender)
    .then(sendResponse)
    .catch(err => sendResponse({ success: false, error: err.message }));
  
  return true; // Keep channel open for async response
});

async function handleExternalMessage(message, sender) {
  console.log('[Background] External message:', message.type);
  
  switch (message.type) {
    case 'PING':
      return { success: true, version: chrome.runtime.getManifest().version };
    
    case 'CAPTURE_ACTIVE_TAB':
      return await captureActiveTab();
    
    case 'CAPTURE_SPECIFIC_TAB':
      return await captureSpecificTab(message.tabId);
    
    case 'LIST_FORM_TABS':
      return await listFormTabs();
    
    case 'FILL_FORM':
      return await fillFormFields(message.tabId || null, message.fillMap);
    
    case 'HIGHLIGHT_FIELD':
      return await highlightField(message.tabId, message.fieldId);
    
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

// Find and capture the active tab (most common use case)
async function captureActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    throw new Error('No active tab found');
  }
  
  if (isInternalPage(tab.url)) {
    throw new Error('Cannot capture browser pages. Navigate to a website first.');
  }
  
  return await executeCapture(tab.id);
}

// Capture a specific tab by ID
async function captureSpecificTab(tabId) {
  const tab = await chrome.tabs.get(tabId);
  
  if (isInternalPage(tab.url)) {
    throw new Error('Cannot capture this page type.');
  }
  
  return await executeCapture(tabId);
}

// List all tabs that might contain forms
async function listFormTabs() {
  const tabs = await chrome.tabs.query({});
  
  const formTabs = tabs
    .filter(tab => !isInternalPage(tab.url))
    .filter(tab => isLikelyFormPage(tab.url))
    .map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      isActive: tab.active,
      domain: new URL(tab.url).hostname,
    }));
  
  return { success: true, tabs: formTabs };
}

// Execute capture with retry logic
async function executeCapture(tabId) {
  const maxRetries = 2;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: capturePageContent,
        world: 'MAIN',
      });
      
      const data = results[0]?.result;
      
      if (!data) {
        throw new Error('No data returned from capture');
      }
      
      // Cache this tab as a known form tab
      activeFormTabs.set(tabId, {
        url: data.url,
        capturedAt: Date.now(),
      });
      
      return { success: true, data };
      
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait a bit and retry (page might be loading)
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  
  throw lastError;
}

// Helper: Check if URL is internal browser page
function isInternalPage(url) {
  return !url || 
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('file://');
}

// Helper: Check if URL likely has a form
function isLikelyFormPage(url) {
  const formDomains = [
    'ind.nl',
    'duo.nl',
    'belastingdienst.nl',
    'gemeente',
    'uwv.nl',
    'cjib.nl',
    'rijksoverheid.nl',
    'mijnoverheid.nl',
    'digid.nl',
  ];
  
  const formKeywords = [
    '/form',
    '/aanvraag',
    '/application',
    '/register',
    '/apply',
    'form=',
    'step=',
    '/inschrijven',
  ];
  
  const urlLower = url.toLowerCase();
  
  return formDomains.some(d => urlLower.includes(d)) ||
         formKeywords.some(k => urlLower.includes(k));
}
```

### Web App Integration (useExtension hook rewrite)

```typescript
// hooks/useExtension.ts - Simplified, Robust Version

'use client';

import { useState, useCallback, useRef } from 'react';

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || '';

interface FormField {
  id: string;
  name?: string;
  label: string;
  labelEN?: string;
  type: string;
  required?: boolean;
  value?: string;
  options?: Array<{ value: string; text: string }>;
  hint?: string;
  error?: string;
  labelConfidence?: number;
}

interface CaptureResult {
  success: boolean;
  data?: {
    url: string;
    title: string;
    fields: FormField[];
    formTitle?: string;
    formPurpose?: string;
    currentStep?: { current: number; total: number };
    captureQuality?: { score: number };
  };
  error?: string;
  warning?: string;
}

export function useExtension() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [lastCapture, setLastCapture] = useState<CaptureResult['data'] | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce to prevent double-clicks
  const captureInProgress = useRef(false);

  // Check if extension is installed and responding
  const checkExtension = useCallback(async (): Promise<boolean> => {
    if (!EXTENSION_ID || typeof chrome === 'undefined' || !chrome.runtime) {
      setIsAvailable(false);
      return false;
    }

    try {
      const response = await sendMessage({ type: 'PING' });
      const available = response?.success === true;
      setIsAvailable(available);
      return available;
    } catch {
      setIsAvailable(false);
      return false;
    }
  }, []);

  // Send message to extension with timeout
  const sendMessage = useCallback((message: unknown, timeoutMs = 10000): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!EXTENSION_ID) {
        reject(new Error('Extension ID not configured'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Extension did not respond (timeout)'));
      }, timeoutMs);

      chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  // Main capture function
  const captureForm = useCallback(async (): Promise<CaptureResult> => {
    if (captureInProgress.current) {
      return { success: false, error: 'Capture already in progress' };
    }

    captureInProgress.current = true;
    setIsCapturing(true);
    setError(null);

    try {
      // First ensure extension is available
      const available = await checkExtension();
      if (!available) {
        throw new Error('Extension not installed or not responding');
      }

      const response = await sendMessage({ type: 'CAPTURE_ACTIVE_TAB' }, 30000);
      
      if (!response.success) {
        throw new Error(response.error || 'Capture failed');
      }

      setLastCapture(response.data);
      return { success: true, data: response.data };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsCapturing(false);
      captureInProgress.current = false;
    }
  }, [checkExtension, sendMessage]);

  // Fill form fields
  const fillForm = useCallback(async (fillMap: Record<string, string>): Promise<boolean> => {
    try {
      const response = await sendMessage({ type: 'FILL_FORM', fillMap });
      return response?.success === true;
    } catch {
      return false;
    }
  }, [sendMessage]);

  return {
    isAvailable,
    isCapturing,
    lastCapture,
    error,
    checkExtension,
    captureForm,
    fillForm,
  };
}
```

---

## 4. Extension State Management

### Service Worker Lifecycle Challenges

Chrome MV3 service workers can go dormant after 30 seconds of inactivity. This causes:
- Lost connections
- Failed message responses
- "Extension context invalidated" errors

### Solution: Stateless Design + Wake-On-Demand

```javascript
// background.js - Stateless Architecture

// DON'T store state in variables (lost on dormancy)
// DO use chrome.storage for persistence

// Wake-up ping mechanism
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Extension installed/updated');
  initializeStorage();
});

async function initializeStorage() {
  const defaults = {
    settings: {
      autoVisualCapture: false,
      captureQualityThreshold: 0.7,
    },
    cache: {
      lastCaptures: [], // Circular buffer of last 5 captures
    },
    stats: {
      totalCaptures: 0,
      visualCaptures: 0,
    },
  };
  
  // Only set defaults if not already configured
  const existing = await chrome.storage.local.get(Object.keys(defaults));
  
  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in existing)) {
      await chrome.storage.local.set({ [key]: value });
    }
  }
}

// Cache last captures for quick retrieval
async function cacheCapture(capture) {
  const { cache } = await chrome.storage.local.get('cache');
  const lastCaptures = cache?.lastCaptures || [];
  
  // Add to front, keep only last 5
  lastCaptures.unshift({
    timestamp: Date.now(),
    url: capture.url,
    fieldCount: capture.fields?.length || 0,
  });
  
  if (lastCaptures.length > 5) {
    lastCaptures.pop();
  }
  
  await chrome.storage.local.set({
    cache: { ...cache, lastCaptures },
  });
}
```

### Popup Status Display Fix

The "Checking..." stuck state happens because the popup doesn't retry properly.

```javascript
// popup.js - Fixed Status Check

const connectionDot = document.getElementById('connectionDot');
const connectionStatus = document.getElementById('connectionStatus');

// Check status immediately and with retries
checkStatus();

async function checkStatus() {
  updateUI('checking');
  
  const maxAttempts = 3;
  const delayMs = 300;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await sendPing();
      
      if (response?.success) {
        updateUI('ready');
        return;
      }
    } catch (err) {
      console.log(`[Popup] Ping attempt ${attempt} failed:`, err.message);
    }
    
    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }
  
  updateUI('error');
}

function sendPing() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout'));
    }, 2000);
    
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      clearTimeout(timeout);
      
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

function updateUI(status) {
  const states = {
    checking: { class: '', text: 'Checking...' },
    ready: { class: 'connected', text: 'Ready' },
    error: { class: 'error', text: 'Error - Reload extension' },
  };
  
  const state = states[status] || states.error;
  
  connectionDot.className = 'dot ' + state.class;
  connectionStatus.textContent = state.text;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
```

### Settings Storage

```javascript
// storage-schema.js - Type-safe settings

const STORAGE_SCHEMA = {
  // User settings
  openaiApiKey: { type: 'string', encrypted: true },
  autoVisualCapture: { type: 'boolean', default: false },
  captureQualityThreshold: { type: 'number', default: 0.7, min: 0, max: 1 },
  
  // Internal state
  lastCaptureTimestamp: { type: 'number' },
  captureHistory: { type: 'array', maxLength: 10 },
  
  // Stats
  stats: {
    type: 'object',
    properties: {
      totalCaptures: { type: 'number', default: 0 },
      visualCaptures: { type: 'number', default: 0 },
      lastUsed: { type: 'number' },
    },
  },
};

// Helper to get typed settings
async function getSettings() {
  const result = await chrome.storage.local.get(null);
  
  return {
    openaiApiKey: result.openaiApiKey || null,
    autoVisualCapture: result.autoVisualCapture ?? false,
    captureQualityThreshold: result.captureQualityThreshold ?? 0.7,
  };
}

// Helper to update settings with validation
async function updateSettings(updates) {
  const validated = {};
  
  for (const [key, value] of Object.entries(updates)) {
    const schema = STORAGE_SCHEMA[key];
    if (!schema) continue;
    
    // Type validation
    if (schema.type === 'boolean' && typeof value === 'boolean') {
      validated[key] = value;
    } else if (schema.type === 'number' && typeof value === 'number') {
      const clamped = Math.max(schema.min ?? -Infinity, Math.min(schema.max ?? Infinity, value));
      validated[key] = clamped;
    } else if (schema.type === 'string' && typeof value === 'string') {
      validated[key] = value;
    }
  }
  
  await chrome.storage.local.set(validated);
}
```

---

## 5. Security Architecture

### Data Flow Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    What Data Leaves the Browser?                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Quick Capture: NOTHING leaves the browser                      │
│  ─────────────────────────────────────────────────────          │
│  • DOM parsing happens locally                                  │
│  • Form schema sent only to localhost/MigrantAI app             │
│  • No external API calls                                        │
│                                                                 │
│  Visual Capture: Screenshot → OpenAI                            │
│  ───────────────────────────────────────────                    │
│  • Screenshot (JPEG) sent to api.openai.com                     │
│  • Contains visible page content                                │
│  • User's API key used directly (not stored on our servers)     │
│  • OpenAI's data handling policies apply                        │
│                                                                 │
│  Form Fill: NOTHING leaves the browser                          │
│  ─────────────────────────────────────────                      │
│  • Fill commands executed locally via content script            │
│  • User data never transmitted                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### API Key Storage Best Practices

```javascript
// CURRENT (Risky): Plain storage
chrome.storage.local.set({ openaiApiKey: 'sk-...' });

// BETTER: Minimal exposure
// Option 1: Memory-only (lost on restart, but most secure)
let apiKeyCache = null;

// Option 2: Obfuscated storage (not truly encrypted, but deters casual access)
async function storeApiKey(key) {
  // Basic obfuscation (NOT encryption - determined attacker can reverse)
  const obfuscated = btoa(key.split('').reverse().join(''));
  await chrome.storage.local.set({ 
    _k: obfuscated,
    _t: Date.now(), // timestamp for rotation reminder
  });
}

async function getApiKey() {
  const { _k } = await chrome.storage.local.get('_k');
  if (!_k) return null;
  
  try {
    return atob(_k).split('').reverse().join('');
  } catch {
    return null;
  }
}

// Option 3: WebCrypto encryption (proper security, but adds complexity)
// See: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
```

### Permission Minimization

Current manifest has `<all_urls>` host permission. This is broad but necessary for our use case.

```json
// CURRENT manifest.json
{
  "host_permissions": ["<all_urls>"]
}

// ALTERNATIVE: Explicit government sites (more restrictive, less flexible)
{
  "host_permissions": [
    "https://*.ind.nl/*",
    "https://*.duo.nl/*",
    "https://*.belastingdienst.nl/*",
    "https://*.uwv.nl/*",
    "https://*.rijksoverheid.nl/*",
    "https://*.mijnoverheid.nl/*",
    "https://*.gemeente.nl/*",
    "https://*.gemeentewebsite.nl/*"
  ],
  "optional_host_permissions": ["<all_urls>"]  // User can grant more
}
```

**Recommendation:** Keep `<all_urls>` for now. Immigrants may encounter forms on unexpected sites (housing, banking, utilities). The permission prompt at install is clear about this.

### Content Script Sandboxing

```javascript
// content.js - Security headers check

// Don't execute on pages that might be malicious
function shouldCapture() {
  // Skip if in an iframe (potential clickjacking)
  if (window.self !== window.top) {
    console.log('[MigrantAI] Skipping capture in iframe');
    return false;
  }
  
  // Skip data: URLs
  if (location.protocol === 'data:') {
    return false;
  }
  
  return true;
}

// Sanitize output to prevent XSS in popup/app
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .slice(0, 1000); // Limit length
}

function capturePageData() {
  if (!shouldCapture()) {
    return { error: 'Capture not allowed on this page type' };
  }
  
  // ... rest of capture logic with sanitizeText() on all text values
}
```

---

## 6. Implementation Roadmap

### Phase 1: Core Fixes (Day 1)
1. **Fix popup "Checking..." stuck state**
   - Implement retry logic with timeout
   - Add clear error states
   
2. **Improve label extraction**
   - Add the LabelResolver class
   - Add Dutch translation mappings
   - Test on IND.nl, DUO.nl, Belastingdienst.nl

3. **Stabilize background script**
   - Remove persistent connection dependency
   - Use one-shot message pattern exclusively

### Phase 2: Enhanced Capture (Day 2)
4. **Visual Capture improvements**
   - Better GPT-4o prompt
   - Merge visual + quick capture results
   - Add quality scoring

5. **Cross-tab communication**
   - Implement `LIST_FORM_TABS`
   - Allow capture of non-active tabs
   - Add tab highlighting/focus

### Phase 3: Polish (Day 3)
6. **Settings & Storage**
   - Proper API key handling
   - User preferences (auto visual, thresholds)
   - Capture history

7. **Error handling**
   - Clear user-friendly error messages
   - Retry logic everywhere
   - Graceful degradation

---

## 7. File Change Summary

| File | Changes |
|------|---------|
| `background.js` | Rewrite message handling, add smart capture, fix async patterns |
| `content.js` | Add LabelResolver class, Dutch mappings, sanitization |
| `popup.js` | Fix status check, add retry logic, better error states |
| `popup.html` | Add loading states, improve error display |
| `manifest.json` | No changes needed (permissions are correct) |
| NEW: `label-resolver.js` | Extracted class for label detection |
| NEW: `dutch-mappings.js` | Dutch→English field translations |
| `useExtension.ts` | Simplify, add proper error handling |
| `useExtensionBridge.ts` | Deprecate (merge into useExtension) |

---

## 8. Testing Checklist

### Manual Tests
- [ ] Open extension popup → shows "Ready" within 2 seconds
- [ ] Click "Quick Capture" on IND application form → fields have readable labels
- [ ] Click "Visual Capture" with API key → get enhanced field info
- [ ] Open MigrantAI in one tab, form in another → voice agent can capture form
- [ ] Close and reopen popup → status still works (service worker wake)
- [ ] Try capture on chrome:// page → get clear error message

### Government Sites to Test
1. **IND.nl** - Immigration applications
2. **DUO.nl** - Student loans/education
3. **Belastingdienst.nl** - Tax forms
4. **Any gemeente website** - Municipal registrations
5. **DigiD login page** - Authentication flow

---

## 9. Architectural Decision Points for Review

### Decision 1: Persistent Connection vs Message-Based
**Current:** Uses `chrome.runtime.connect()` for persistent port
**Proposed:** Switch to `chrome.runtime.sendMessage()` exclusively

**Pros of change:**
- More resilient to service worker dormancy
- Simpler state management
- Better error recovery

**Cons:**
- Slightly higher latency per message
- No real-time push from extension to app

**Recommendation:** Switch to message-based. The voice agent doesn't need real-time push—it polls when the user says "I'm stuck."

### Decision 2: API Key Storage Location
**Options:**
- A) Extension storage (current) - Simple but exposed
- B) Web app server-side - More secure but adds latency
- C) User enters each session - Most secure, worst UX

**Recommendation:** Keep A with obfuscation. Users own their API keys; we're not liable for their security. Add a warning in UI.

### Decision 3: Auto vs Manual Visual Capture
**Options:**
- A) Always auto-trigger if quality < threshold
- B) Ask user when quality is low
- C) Only on explicit button click

**Recommendation:** C with suggestion. Show "⚠️ Some labels unclear. Try Visual Capture?" message but don't auto-spend their API credits.

---

This plan provides a clear path to a robust, production-ready extension. Want me to proceed with implementation or discuss any decisions first?
