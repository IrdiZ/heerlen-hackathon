// MigrantAI Extension - Background Service Worker

// Store the connected app port
let appPort = null;
let lastCapturedData = null;

// Dutch field name patterns → English human-readable labels
const DUTCH_FIELD_PATTERNS = {
  // Personal info
  'voornaam': 'First Name',
  'voorletters': 'Initials',
  'achternaam': 'Last Name',
  'familienaam': 'Family Name',
  'tussenvoegsel': 'Prefix (van/de)',
  'geboortedatum': 'Date of Birth',
  'geboorteplaats': 'Place of Birth',
  'geslacht': 'Gender',
  'nationaliteit': 'Nationality',
  'burgerservicenummer': 'BSN',
  'bsn': 'BSN (Citizen Service Number)',
  
  // Address
  'straat': 'Street',
  'straatnaam': 'Street Name',
  'huisnummer': 'House Number',
  'toevoeging': 'Addition',
  'postcode': 'Postal Code',
  'woonplaats': 'City',
  'plaats': 'City',
  'gemeente': 'Municipality',
  'land': 'Country',
  
  // Contact
  'telefoon': 'Phone',
  'telefoonnummer': 'Phone Number',
  'mobiel': 'Mobile',
  'email': 'Email',
  'emailadres': 'Email Address',
  
  // Documents
  'paspoort': 'Passport',
  'paspoortnummer': 'Passport Number',
  'documentnummer': 'Document Number',
  'geldigheid': 'Validity',
  'verloopdatum': 'Expiry Date',
  'afgiftedatum': 'Issue Date',
  
  // Immigration specific
  'verblijf': 'Residence',
  'verblijfsdoel': 'Purpose of Stay',
  'verblijfstitel': 'Residence Permit',
  'visum': 'Visa',
  'mvv': 'MVV (Entry Visa)',
  'aankomstdatum': 'Arrival Date',
  'werkgever': 'Employer',
  'sponsor': 'Sponsor',
  
  // Financial
  'iban': 'Bank Account (IBAN)',
  'rekeningnummer': 'Account Number',
  'inkomen': 'Income',
  'salaris': 'Salary',
  
  // Common form words
  'datum': 'Date',
  'handtekening': 'Signature',
  'opmerkingen': 'Comments',
  'toelichting': 'Explanation',
  'bijlage': 'Attachment',
  'akkoord': 'Agreement',
  'ja': 'Yes',
  'nee': 'No',
};

// Humanize a field label using Dutch patterns
function humanizeLabel(rawLabel) {
  if (!rawLabel) return 'Unknown Field';
  
  const lower = rawLabel.toLowerCase().trim();
  
  // Check exact match first
  if (DUTCH_FIELD_PATTERNS[lower]) {
    return DUTCH_FIELD_PATTERNS[lower];
  }
  
  // Check if label contains any pattern
  for (const [pattern, label] of Object.entries(DUTCH_FIELD_PATTERNS)) {
    if (lower.includes(pattern)) {
      return label;
    }
  }
  
  // Fallback: convert camelCase/snake_case to Title Case
  return rawLabel
    .replace(/([A-Z])/g, ' $1')      // camelCase → camel Case
    .replace(/[_-]/g, ' ')           // snake_case → snake case
    .replace(/\b\w/g, c => c.toUpperCase())  // capitalize words
    .replace(/\s+/g, ' ')            // clean up spaces
    .trim();
}

// Listen for connections from our web app
chrome.runtime.onConnectExternal.addListener((port) => {
  console.log('[MigrantAI] Web app connected');
  appPort = port;
  
  port.onMessage.addListener(async (message) => {
    console.log('[MigrantAI] Message from app:', message);
    
    if (message.type === 'CAPTURE_PAGE') {
      // App is requesting page capture (triggered by voice agent)
      const data = await captureCurrentTab();
      port.postMessage({ type: 'PAGE_CAPTURED', data });
    }
    
    if (message.type === 'FILL_FORM') {
      // App wants to fill form fields
      const result = await fillFormFields(message.fieldMappings);
      port.postMessage({ type: 'FORM_FILLED', result });
    }
  });
  
  port.onDisconnect.addListener(() => {
    console.log('[MigrantAI] Web app disconnected');
    appPort = null;
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[MigrantAI] Internal message:', message);
  
  // Respond to PING from popup
  if (message.type === 'PING') {
    sendResponse({ success: true, version: chrome.runtime.getManifest().version });
    return true;
  }
  
  // Visual capture from popup
  if (message.type === 'VISUAL_CAPTURE') {
    handleVisualCapture().then(sendResponse);
    return true;
  }
  
  if (message.type === 'PAGE_DATA') {
    lastCapturedData = message.data;
    
    // If app is connected, forward the data
    if (appPort) {
      appPort.postMessage({ type: 'PAGE_CAPTURED', data: message.data });
    }
    
    sendResponse({ success: true });
  }
  
  if (message.type === 'MANUAL_CAPTURE') {
    // User clicked the extension button manually
    captureCurrentTab().then(data => {
      lastCapturedData = data;
      if (appPort) {
        appPort.postMessage({ type: 'PAGE_CAPTURED', data, manual: true });
      }
      sendResponse({ success: true, data });
    });
    return true; // Keep channel open for async response
  }
  
  return true;
});

// Capture the current active tab
async function captureCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      return { error: 'No active tab found' };
    }
    
    // Can't capture chrome:// or extension pages
    if (tab.url?.startsWith('chrome://') || 
        tab.url?.startsWith('chrome-extension://') ||
        tab.url?.startsWith('about:') ||
        tab.url?.startsWith('edge://')) {
      return { error: 'Cannot capture browser internal pages. Navigate to a website first.' };
    }
    
    // Inject and execute capture script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: capturePageContent
    });
    
    if (results && results[0]) {
      return {
        url: tab.url,
        title: tab.title,
        ...results[0].result
      };
    }
    
    return { error: 'Failed to capture page content' };
  } catch (error) {
    console.error('[MigrantAI] Capture error:', error);
    return { error: error.message };
  }
}

// Fill form fields on current tab
async function fillFormFields(fieldMappings) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      return { error: 'No active tab found' };
    }
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: fillFields,
      args: [fieldMappings]
    });
    
    return results[0]?.result || { error: 'Failed to fill fields' };
  } catch (error) {
    return { error: error.message };
  }
}

// This function runs in the page context to capture content
function capturePageContent() {
  const data = {
    forms: [],
    inputs: [],
    buttons: [],
    links: [],
    headings: [],
    mainContent: '',
    pageDescription: ''
  };
  
  // Get page description from meta or first paragraph
  const metaDesc = document.querySelector('meta[name="description"]')?.content;
  const firstP = document.querySelector('main p, article p, .content p')?.textContent?.slice(0, 200);
  data.pageDescription = metaDesc || firstP || '';
  
  // Capture all forms
  document.querySelectorAll('form').forEach((form, formIndex) => {
    const formData = {
      id: form.id || `form-${formIndex}`,
      action: form.action,
      method: form.method,
      fields: []
    };
    
    // Get all input fields in the form
    form.querySelectorAll('input, select, textarea').forEach((field, fieldIndex) => {
      const label = findLabelForField(field);
      formData.fields.push({
        id: field.id || `field-${formIndex}-${fieldIndex}`,
        name: field.name,
        type: field.type || field.tagName.toLowerCase(),
        label: label,
        placeholder: field.placeholder,
        required: field.required,
        value: field.type === 'password' ? '[hidden]' : field.value,
        options: field.tagName === 'SELECT' ? 
          Array.from(field.options).map(o => ({ value: o.value, text: o.text })) : 
          undefined
      });
    });
    
    data.forms.push(formData);
  });
  
  // Capture standalone inputs (not in forms)
  document.querySelectorAll('input:not(form input), select:not(form select), textarea:not(form textarea)').forEach((field, index) => {
    const label = findLabelForField(field);
    data.inputs.push({
      id: field.id || `standalone-${index}`,
      name: field.name,
      type: field.type || field.tagName.toLowerCase(),
      label: label,
      placeholder: field.placeholder,
      required: field.required,
      value: field.type === 'password' ? '[hidden]' : field.value
    });
  });
  
  // Capture buttons
  document.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach((btn, index) => {
    data.buttons.push({
      id: btn.id || `btn-${index}`,
      text: btn.textContent?.trim() || btn.value,
      type: btn.type
    });
  });
  
  // Capture main headings for context
  document.querySelectorAll('h1, h2, h3').forEach(h => {
    data.headings.push({
      level: h.tagName,
      text: h.textContent?.trim()
    });
  });
  
  // Get main content text (for context)
  const main = document.querySelector('main, article, [role="main"], .content, #content');
  if (main) {
    data.mainContent = main.textContent?.slice(0, 2000).trim();
  }
  
  // Helper to find label for a field - tries multiple strategies
  function findLabelForField(field) {
    let label = null;
    
    // 1. Check for associated label via for=""
    if (field.id) {
      const labelEl = document.querySelector(`label[for="${field.id}"]`);
      if (labelEl) label = labelEl.textContent?.trim();
    }
    
    // 2. Check for parent label
    if (!label) {
      const parentLabel = field.closest('label');
      if (parentLabel) {
        // Get label text excluding the input value
        const clone = parentLabel.cloneNode(true);
        clone.querySelectorAll('input, select, textarea').forEach(el => el.remove());
        label = clone.textContent?.trim();
      }
    }
    
    // 3. aria-label or aria-labelledby
    if (!label && field.getAttribute('aria-label')) {
      label = field.getAttribute('aria-label');
    }
    if (!label && field.getAttribute('aria-labelledby')) {
      const labelledBy = document.getElementById(field.getAttribute('aria-labelledby'));
      if (labelledBy) label = labelledBy.textContent?.trim();
    }
    
    // 4. Check preceding siblings (common pattern: label/span before input)
    if (!label) {
      let prev = field.previousElementSibling;
      while (prev && !label) {
        if (['LABEL', 'SPAN', 'DIV', 'P'].includes(prev.tagName)) {
          const text = prev.textContent?.trim();
          if (text && text.length < 100) {
            label = text;
            break;
          }
        }
        prev = prev.previousElementSibling;
      }
    }
    
    // 5. Check parent's previous sibling (nested structures)
    if (!label) {
      const parent = field.parentElement;
      const parentPrev = parent?.previousElementSibling;
      if (parentPrev) {
        const text = parentPrev.textContent?.trim();
        if (text && text.length < 100) label = text;
      }
    }
    
    // 6. Look for nearby visible text above the field
    if (!label) {
      const rect = field.getBoundingClientRect();
      const elementsAbove = document.elementsFromPoint(rect.left + 10, rect.top - 20);
      for (const el of elementsAbove) {
        if (['LABEL', 'SPAN', 'DIV', 'P', 'TD', 'TH'].includes(el.tagName)) {
          const text = el.textContent?.trim();
          if (text && text.length > 2 && text.length < 80) {
            label = text;
            break;
          }
        }
      }
    }
    
    // 7. Fallback to placeholder or name (make it human-readable)
    if (!label) {
      label = field.placeholder || 
              field.name?.replace(/[_-]/g, ' ').replace(/([A-Z])/g, ' $1').trim() ||
              field.id?.replace(/[_-]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
    }
    
    return label || 'Unnamed field';
  }
  
  return data;
}

// This function runs in page context to fill fields
function fillFields(mappings) {
  const results = { filled: [], errors: [] };
  
  for (const [selector, value] of Object.entries(mappings)) {
    try {
      // Try multiple ways to find the field
      let field = document.getElementById(selector) ||
                  document.querySelector(`[name="${selector}"]`) ||
                  document.querySelector(selector);
      
      if (field) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        results.filled.push(selector);
      } else {
        results.errors.push({ selector, error: 'Field not found' });
      }
    } catch (e) {
      results.errors.push({ selector, error: e.message });
    }
  }
  
  return results;
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This triggers when there's no popup
  // With popup.html, this won't fire
});

// Handle one-shot messages from web app (chrome.runtime.sendMessage)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[MigrantAI] External message:', message, 'from:', sender);
  
  if (message.type === 'PING') {
    sendResponse({ success: true, version: chrome.runtime.getManifest().version });
    return true;
  }
  
  // Get last capture from storage (for polling from web app)
  if (message.type === 'GET_LAST_CAPTURE') {
    console.log('[MigrantAI] GET_LAST_CAPTURE requested');
    chrome.storage.local.get('lastCapture', ({ lastCapture }) => {
      console.log('[MigrantAI] lastCapture from storage:', lastCapture ? 'exists' : 'null');
      if (lastCapture) {
        // Transform to schema format with full context
        const schema = {
          url: lastCapture.url,
          title: lastCapture.title,
          fields: [],
          // Extra context
          headings: lastCapture.headings || [],
          mainContent: lastCapture.mainContent || '',
          pageDescription: lastCapture.pageDescription || '',
          buttons: lastCapture.buttons || []
        };
        
        lastCapture.forms?.forEach(form => {
          form.fields?.forEach(field => {
            const rawLabel = field.label || field.placeholder || field.name || field.id;
            schema.fields.push({
              id: field.id || field.name,
              name: field.name,
              label: humanizeLabel(rawLabel),
              type: field.type,
              tag: field.type === 'select' ? 'SELECT' : 'INPUT',
              required: field.required,
              options: field.options
            });
          });
        });
        
        lastCapture.inputs?.forEach(field => {
          const rawLabel = field.label || field.placeholder || field.name || field.id;
          schema.fields.push({
            id: field.id || field.name,
            name: field.name,
            label: humanizeLabel(rawLabel),
            type: field.type,
            tag: field.type === 'select' ? 'SELECT' : 'INPUT',
            required: field.required,
            options: field.options
          });
        });
        
        sendResponse({ success: true, schema });
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  }
  
  // Clear last capture from storage
  if (message.type === 'CLEAR_LAST_CAPTURE') {
    chrome.storage.local.remove('lastCapture', () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.type === 'CAPTURE_FORM') {
    captureCurrentTab().then(data => {
      if (data.error) {
        sendResponse({ success: false, error: data.error });
      } else {
        // Transform to expected schema format with full context
        const schema = {
          url: data.url,
          title: data.title,
          fields: [],
          // Extra context
          headings: data.headings || [],
          mainContent: data.mainContent || '',
          pageDescription: data.pageDescription || '',
          buttons: data.buttons || []
        };
        
        // Flatten form fields with humanized labels
        data.forms?.forEach(form => {
          form.fields?.forEach(field => {
            const rawLabel = field.label || field.placeholder || field.name || field.id;
            schema.fields.push({
              id: field.id || field.name,
              name: field.name,
              label: humanizeLabel(rawLabel),
              type: field.type,
              tag: field.type === 'select' ? 'SELECT' : 'INPUT',
              required: field.required,
              options: field.options
            });
          });
        });
        
        // Add standalone inputs with humanized labels
        data.inputs?.forEach(field => {
          const rawLabel = field.label || field.placeholder || field.name || field.id;
          schema.fields.push({
            id: field.id || field.name,
            name: field.name,
            label: humanizeLabel(rawLabel),
            type: field.type,
            tag: field.type === 'select' ? 'SELECT' : 'INPUT',
            required: field.required,
            options: field.options
          });
        });
        
        sendResponse({ success: true, schema });
      }
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'FILL_FORM') {
    fillFormFields(message.fillMap).then(result => {
      const results = [];
      result.filled?.forEach(f => results.push({ field: f, status: 'filled' }));
      result.errors?.forEach(e => results.push({ field: e.selector, status: 'error' }));
      sendResponse({ success: true, results });
    });
    return true;
  }
  
  if (message.type === 'VISUAL_CAPTURE') {
    handleVisualCapture().then(sendResponse);
    return true;
  }
  
  sendResponse({ success: false, error: 'Unknown message type' });
  return true;
});

// Handle VISUAL_CAPTURE - screenshot + GPT-4V analysis
async function handleVisualCapture() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      return { success: false, error: 'No active tab found' };
    }
    
    // Can't capture browser pages
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
      return { success: false, error: 'Cannot capture browser pages. Navigate to a website first.' };
    }
    
    // Capture screenshot
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 80 });
    
    // Get API key from storage
    const { openaiApiKey } = await chrome.storage.local.get('openaiApiKey');
    
    if (!openaiApiKey) {
      // Return screenshot but no analysis
      return { 
        success: true, 
        screenshot,
        analysis: 'No OpenAI API key configured. Add your key in extension settings to enable AI analysis.',
        fields: []
      };
    }
    
    // Send to GPT-4V for analysis
    const analysis = await analyzeScreenshot(screenshot, openaiApiKey);
    
    return {
      success: true,
      screenshot,
      analysis: analysis.description,
      fields: analysis.fields,
      url: tab.url,
      title: tab.title
    };
  } catch (error) {
    console.error('[MigrantAI] Visual capture error:', error);
    return { success: false, error: error.message };
  }
}

// Analyze screenshot with GPT-4V
async function analyzeScreenshot(imageDataUrl, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a form analysis assistant helping immigrants fill out Dutch government forms. Analyze the screenshot and:
1. Describe what type of form this is
2. List all visible form fields with their labels
3. Identify which fields are required
4. Note any validation errors visible
5. Suggest what information is needed for each field

Return JSON format:
{
  "description": "Brief description of the form",
  "formType": "e.g., BSN registration, IND application",
  "fields": [
    {"label": "Field name", "type": "text/select/date/etc", "required": true/false, "hint": "What to enter"}
  ],
  "errors": ["Any visible error messages"],
  "tips": ["Helpful tips for filling this form"]
}`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this form screenshot and extract the field information:' },
            { type: 'image_url', image_url: { url: imageDataUrl } }
          ]
        }
      ],
      max_tokens: 1500
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  try {
    // Try to parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // If JSON parsing fails, return raw description
  }
  
  return { description: content, fields: [] };
}

console.log('[MigrantAI] Background script loaded');
