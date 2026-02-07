// MigrantAI Extension - Background Service Worker

// Store the connected app port
let appPort = null;
let lastCapturedData = null;

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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[MigrantAI] Message from content script:', message);
  
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
    mainContent: ''
  };
  
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
  
  // Helper to find label for a field
  function findLabelForField(field) {
    // Check for associated label
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent?.trim();
    }
    
    // Check for parent label
    const parentLabel = field.closest('label');
    if (parentLabel) return parentLabel.textContent?.trim();
    
    // Check for aria-label
    if (field.getAttribute('aria-label')) {
      return field.getAttribute('aria-label');
    }
    
    // Check preceding sibling or text
    const prev = field.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN')) {
      return prev.textContent?.trim();
    }
    
    return null;
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
    sendResponse({ success: true, version: '1.0.0' });
    return true;
  }
  
  if (message.type === 'CAPTURE_FORM') {
    captureCurrentTab().then(data => {
      if (data.error) {
        sendResponse({ success: false, error: data.error });
      } else {
        // Transform to expected schema format
        const schema = {
          url: data.url,
          title: data.title,
          fields: []
        };
        
        // Flatten form fields
        data.forms?.forEach(form => {
          form.fields?.forEach(field => {
            schema.fields.push({
              id: field.id || field.name,
              name: field.name,
              label: field.label || field.placeholder || field.name || field.id,
              type: field.type,
              tag: field.type === 'select' ? 'SELECT' : 'INPUT',
              required: field.required,
              options: field.options
            });
          });
        });
        
        // Add standalone inputs
        data.inputs?.forEach(field => {
          schema.fields.push({
            id: field.id || field.name,
            name: field.name,
            label: field.label || field.placeholder || field.name || field.id,
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
  
  sendResponse({ success: false, error: 'Unknown message type' });
  return true;
});

console.log('[MigrantAI] Background script loaded');
