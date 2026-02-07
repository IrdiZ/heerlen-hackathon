// MigrantAI Extension - Content Script
// Runs on every page to extract form schemas and fill forms

console.log('MigrantAI content script loaded');

// ============ TOAST NOTIFICATION ============

let toastContainer = null;

function createToastContainer() {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'migrantai-toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    pointer-events: none;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

function showPageToast(message, type = 'success') {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
  
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    margin-top: 8px;
    pointer-events: auto;
  `;
  
  toast.innerHTML = `
    <span style="font-size: 16px;">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ============ FORM SCHEMA EXTRACTION ============

function extractFormSchema() {
  const fields = [];
  const selector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea';
  const elements = document.querySelectorAll(selector);

  const processedNames = new Set();

  elements.forEach((el, index) => {
    // Skip if already processed (for radio/checkbox groups)
    if ((el.type === 'radio' || el.type === 'checkbox') && processedNames.has(el.name)) {
      return;
    }

    // Find label
    const labelFor = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
    const ariaLabel = el.getAttribute('aria-label');
    const closestLabel = el.closest('label');
    const placeholder = el.getAttribute('placeholder');
    const title = el.getAttribute('title');

    const label = labelFor?.textContent?.trim()
      || ariaLabel
      || closestLabel?.textContent?.trim()
      || placeholder
      || title
      || el.name 
      || el.id 
      || `field_${index}`;

    const field = {
      id: el.id || el.name || `field_${index}`,
      name: el.name || null,
      label: label.replace(/\s+/g, ' ').substring(0, 100), // Clean up whitespace
      type: el.type || el.tagName.toLowerCase(),
      tag: el.tagName.toLowerCase(),
      required: el.required || el.getAttribute('aria-required') === 'true'
    };

    // Handle SELECT elements
    if (el.tagName === 'SELECT') {
      field.options = [...el.options]
        .filter(o => o.value) // Skip empty options
        .slice(0, 50) // Limit options to avoid huge payloads
        .map(o => ({ 
          value: o.value, 
          text: o.textContent.trim() 
        }));
    }

    // Handle RADIO and CHECKBOX groups
    if (el.type === 'radio' || el.type === 'checkbox') {
      processedNames.add(el.name);
      const group = document.querySelectorAll(`input[name="${el.name}"]`);
      field.options = [...group].map(g => {
        const gLabel = document.querySelector(`label[for="${g.id}"]`);
        return {
          value: g.value,
          label: gLabel?.textContent?.trim() || g.value
        };
      });
    }

    fields.push(field);
  });

  return {
    url: window.location.href,
    title: document.title,
    fields: fields,
    extractedAt: new Date().toISOString()
  };
}

// ============ FORM FILLING ============

function fillForm(fillMap) {
  const results = [];

  Object.entries(fillMap).forEach(([fieldId, value]) => {
    // Try to find element by ID first, then by name
    let el = document.getElementById(fieldId);
    if (!el) {
      el = document.querySelector(`[name="${fieldId}"]`);
    }
    if (!el) {
      // Try case-insensitive match
      el = document.querySelector(`[id="${fieldId}" i], [name="${fieldId}" i]`);
    }

    if (!el) {
      results.push({ field: fieldId, status: 'not_found' });
      return;
    }

    try {
      fillElement(el, value);
      highlightElement(el);
      results.push({ field: fieldId, status: 'filled' });
    } catch (e) {
      console.error(`Error filling ${fieldId}:`, e);
      results.push({ field: fieldId, status: 'error', error: e.message });
    }
  });

  // Show toast notification with result
  const filledCount = results.filter(r => r.status === 'filled').length;
  const errorCount = results.filter(r => r.status === 'error' || r.status === 'not_found').length;
  
  if (filledCount > 0 && errorCount === 0) {
    showPageToast(`MigrantAI filled ${filledCount} field${filledCount !== 1 ? 's' : ''}`, 'success');
  } else if (filledCount > 0) {
    showPageToast(`Filled ${filledCount} field${filledCount !== 1 ? 's' : ''} (${errorCount} failed)`, 'info');
  } else {
    showPageToast('Could not fill any fields', 'error');
  }

  return results;
}

function fillElement(el, value) {
  const tagName = el.tagName.toLowerCase();
  const type = el.type?.toLowerCase();

  if (tagName === 'select') {
    fillSelect(el, value);
  } else if (type === 'radio') {
    fillRadio(el.name, value);
  } else if (type === 'checkbox') {
    fillCheckbox(el, value);
  } else if (type === 'date') {
    fillDate(el, value);
  } else {
    fillInput(el, value);
  }
}

function fillInput(el, value) {
  // Use native setter to bypass React's controlled input
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set || Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  )?.set;

  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }

  // Dispatch events to trigger framework updates
  el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
}

function fillSelect(el, value) {
  // Try exact match first
  let option = [...el.options].find(o => o.value === value || o.text === value);
  
  // Try case-insensitive match
  if (!option) {
    const lowerValue = value.toLowerCase();
    option = [...el.options].find(o => 
      o.value.toLowerCase() === lowerValue || 
      o.text.toLowerCase() === lowerValue ||
      o.text.toLowerCase().includes(lowerValue) ||
      lowerValue.includes(o.text.toLowerCase())
    );
  }

  if (option) {
    el.value = option.value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function fillRadio(name, value) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  radios.forEach(radio => {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    const labelText = label?.textContent?.trim().toLowerCase() || '';
    const radioValue = radio.value.toLowerCase();
    const targetValue = value.toLowerCase();

    if (radioValue === targetValue || labelText === targetValue || labelText.includes(targetValue)) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

function fillCheckbox(el, value) {
  const shouldCheck = value === true || value === 'true' || value === '1' || value === 'yes';
  el.checked = shouldCheck;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function fillDate(el, value) {
  // Handle various date formats
  let dateValue = value;
  
  // If it's DD-MM-YYYY (Dutch format), convert to YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split('-');
    dateValue = `${year}-${month}-${day}`;
  }
  
  fillInput(el, dateValue);
}

function highlightElement(el) {
  const originalOutline = el.style.outline;
  const originalOutlineOffset = el.style.outlineOffset;
  const originalTransition = el.style.transition;

  el.style.transition = 'outline 0.3s ease';
  el.style.outline = '3px solid #22c55e';
  el.style.outlineOffset = '2px';

  // Remove highlight after 10 seconds (longer for demo)
  setTimeout(() => {
    el.style.outline = originalOutline;
    el.style.outlineOffset = originalOutlineOffset;
    el.style.transition = originalTransition;
  }, 10000);
}

// ============ MESSAGE HANDLING ============

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received:', message);

  if (message.type === 'PING') {
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CAPTURE_FORM') {
    try {
      const schema = extractFormSchema();
      console.log('Extracted schema:', schema);
      sendResponse({ success: true, schema });
    } catch (e) {
      console.error('Schema extraction error:', e);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }

  if (message.type === 'FILL_FORM') {
    try {
      const results = fillForm(message.fillMap);
      console.log('Fill results:', results);
      sendResponse({ success: true, results });
    } catch (e) {
      console.error('Form fill error:', e);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }

  return false;
});
