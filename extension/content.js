// MigrantAI Extension - Content Script
// Runs on every page to enable capture

console.log('[MigrantAI] Content script loaded on:', window.location.href);

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_NOW') {
    const data = capturePageData();
    sendResponse({ success: true, data });
  }
  
  if (message.type === 'HIGHLIGHT_FIELD') {
    highlightField(message.selector);
    sendResponse({ success: true });
  }
  
  if (message.type === 'FILL_FIELD') {
    const result = fillField(message.selector, message.value);
    sendResponse(result);
  }
  
  return true;
});

// Capture all relevant page data
function capturePageData() {
  const data = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    forms: [],
    inputs: [],
    buttons: [],
    headings: [],
    errors: [],
    mainContent: ''
  };
  
  // Find all forms
  document.querySelectorAll('form').forEach((form, formIndex) => {
    const formData = {
      id: form.id || `form-${formIndex}`,
      name: form.name,
      action: form.action,
      fields: []
    };
    
    // Get fields in this form
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      if (field.type === 'hidden') return; // Skip hidden fields
      
      formData.fields.push(extractFieldInfo(field));
    });
    
    data.forms.push(formData);
  });
  
  // Find standalone inputs
  document.querySelectorAll('input:not(form input), select:not(form select), textarea:not(form textarea)').forEach((field) => {
    if (field.type === 'hidden') return;
    data.inputs.push(extractFieldInfo(field));
  });
  
  // Find buttons
  document.querySelectorAll('button, [role="button"], input[type="submit"]').forEach((btn) => {
    data.buttons.push({
      text: btn.textContent?.trim() || btn.value || btn.getAttribute('aria-label'),
      type: btn.type || 'button',
      id: btn.id,
      disabled: btn.disabled
    });
  });
  
  // Get headings for context
  document.querySelectorAll('h1, h2, h3').forEach((h) => {
    const text = h.textContent?.trim();
    if (text) {
      data.headings.push({ level: h.tagName, text });
    }
  });
  
  // Find error messages
  document.querySelectorAll('.error, .alert-error, [role="alert"], .validation-error, .field-error').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) {
      data.errors.push(text);
    }
  });
  
  // Get main content for context
  const mainEl = document.querySelector('main, article, [role="main"], .main-content, #main');
  if (mainEl) {
    // Get text but limit length
    data.mainContent = mainEl.textContent?.replace(/\s+/g, ' ').slice(0, 1500).trim();
  }
  
  return data;
}

// Extract info from a form field
function extractFieldInfo(field) {
  return {
    id: field.id,
    name: field.name,
    type: field.type || field.tagName.toLowerCase(),
    label: findLabel(field),
    placeholder: field.placeholder,
    required: field.required || field.getAttribute('aria-required') === 'true',
    value: field.type === 'password' ? '' : (field.value || ''),
    checked: field.type === 'checkbox' || field.type === 'radio' ? field.checked : undefined,
    options: field.tagName === 'SELECT' ? 
      Array.from(field.options).map(o => ({ value: o.value, text: o.text, selected: o.selected })) :
      undefined,
    validation: field.getAttribute('pattern') || field.getAttribute('data-validation'),
    maxLength: field.maxLength > 0 ? field.maxLength : undefined,
    disabled: field.disabled,
    readonly: field.readOnly
  };
}

// Find the label for a field
function findLabel(field) {
  // Method 1: label[for="id"]
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) return label.textContent?.trim();
  }
  
  // Method 2: parent label
  const parentLabel = field.closest('label');
  if (parentLabel) {
    // Get text excluding the input's value
    const clone = parentLabel.cloneNode(true);
    clone.querySelectorAll('input, select, textarea').forEach(el => el.remove());
    return clone.textContent?.trim();
  }
  
  // Method 3: aria-label
  const ariaLabel = field.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;
  
  // Method 4: aria-labelledby
  const labelledBy = field.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.textContent?.trim();
  }
  
  // Method 5: preceding element
  const prev = field.previousElementSibling;
  if (prev && ['LABEL', 'SPAN', 'DIV'].includes(prev.tagName)) {
    const text = prev.textContent?.trim();
    if (text && text.length < 100) return text;
  }
  
  // Method 6: placeholder as last resort
  return field.placeholder || field.name || null;
}

// Highlight a field (for visual feedback)
function highlightField(selector) {
  const field = document.getElementById(selector) || 
                document.querySelector(`[name="${selector}"]`) ||
                document.querySelector(selector);
  
  if (field) {
    const originalOutline = field.style.outline;
    field.style.outline = '3px solid #4CAF50';
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      field.style.outline = originalOutline;
    }, 3000);
    
    return true;
  }
  return false;
}

// Fill a specific field
function fillField(selector, value) {
  const field = document.getElementById(selector) || 
                document.querySelector(`[name="${selector}"]`) ||
                document.querySelector(selector);
  
  if (!field) {
    return { success: false, error: 'Field not found' };
  }
  
  try {
    if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = Boolean(value);
    } else if (field.tagName === 'SELECT') {
      field.value = value;
    } else {
      field.value = value;
    }
    
    // Trigger events for frameworks that listen
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
    
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Notify that content script is ready
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY', url: window.location.href });
