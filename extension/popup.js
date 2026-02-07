// MigrantAI Extension - Popup Script

const captureBtn = document.getElementById('captureBtn');
const statusEl = document.getElementById('status');
const fieldCountEl = document.getElementById('fieldCount');
const toastEl = document.getElementById('toast');
const connectionIndicator = document.getElementById('connectionIndicator');
const templateBadge = document.getElementById('templateBadge');
const templateIcon = document.getElementById('templateIcon');
const templateName = document.getElementById('templateName');
const templateNameNL = document.getElementById('templateNameNL');

let toastTimeout = null;

const CATEGORY_ICONS = {
  government: '🏛️',
  finance: '🏦',
  healthcare: '🏥',
  utilities: '🔌',
};

function showTemplate(template) {
  if (!template) {
    templateBadge.classList.remove('visible', 'government', 'finance', 'healthcare', 'utilities');
    return;
  }
  
  templateIcon.textContent = CATEGORY_ICONS[template.category] || '📋';
  templateName.textContent = template.nameEN;
  templateNameNL.textContent = template.nameNL;
  
  templateBadge.classList.remove('government', 'finance', 'healthcare', 'utilities');
  templateBadge.classList.add('visible', template.category);
}

function showToast(type, message) {
  if (toastTimeout) clearTimeout(toastTimeout);
  
  toastEl.className = `toast ${type}`;
  toastEl.textContent = message;
  
  // Trigger reflow for animation
  toastEl.offsetHeight;
  toastEl.classList.add('visible');
  
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 3000);
}

function setConnectionStatus(status) {
  connectionIndicator.className = `connection-indicator ${status}`;
  const titles = {
    connected: 'Connected to page',
    warning: 'Limited access',
    error: 'Cannot access page'
  };
  connectionIndicator.title = titles[status] || 'Unknown status';
}

function setStatus(type, message) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
}

function setLoading(loading) {
  if (loading) {
    captureBtn.disabled = true;
    captureBtn.innerHTML = '<div class="spinner"></div> Capturing...';
  } else {
    captureBtn.disabled = false;
    captureBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      Capture Form
    `;
  }
}

captureBtn.addEventListener('click', async () => {
  setLoading(true);
  setStatus('info', 'Scanning page for forms...');
  fieldCountEl.innerHTML = '';

  try {
    // Send message to background script
    chrome.runtime.sendMessage({ type: 'CAPTURE_FORM_FROM_POPUP' }, (response) => {
      setLoading(false);
      
      if (chrome.runtime.lastError) {
        setStatus('error', `Error: ${chrome.runtime.lastError.message}`);
        showToast('error', 'Failed to capture form');
        setConnectionStatus('error');
        return;
      }

      if (!response) {
        setStatus('error', 'No response from content script. Is the page fully loaded?');
        showToast('error', 'Page not responding');
        setConnectionStatus('warning');
        return;
      }

      if (response.success && response.schema) {
        const count = response.schema.fields.length;
        const template = response.schema.detectedTemplate;
        
        if (count === 0) {
          setStatus('info', 'No form fields found on this page.');
          showToast('info', 'No form fields found');
          setConnectionStatus('connected');
          showTemplate(null);
        } else {
          setStatus('success', `✓ Captured ${count} form field${count !== 1 ? 's' : ''}!`);
          fieldCountEl.innerHTML = `<span class="badge">${count}</span> fields from: ${response.schema.title || response.schema.url}`;
          showToast('success', `Captured ${count} field${count !== 1 ? 's' : ''}!`);
          setConnectionStatus('connected');
          
          // Show detected template if any
          showTemplate(template);
          
          // Log the schema for debugging
          console.log('Captured schema:', response.schema);
        }
      } else {
        setStatus('error', response.error || 'Failed to capture form');
        showToast('error', response.error || 'Capture failed');
        setConnectionStatus('error');
      }
    });
  } catch (e) {
    setLoading(false);
    setStatus('error', `Error: ${e.message}`);
    showToast('error', 'Unexpected error');
    setConnectionStatus('error');
  }
});

// Check connection on popup open
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0]?.url || '';
  
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    setStatus('info', 'Cannot capture forms on Chrome system pages.');
    captureBtn.disabled = true;
    setConnectionStatus('error');
  } else if (url.startsWith('https://') || url.startsWith('http://')) {
    // Try to ping content script
    chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        setConnectionStatus('warning');
        connectionIndicator.title = 'Content script not loaded - try refreshing the page';
      } else {
        setConnectionStatus('connected');
      }
    });
  } else {
    setConnectionStatus('warning');
    connectionIndicator.title = 'Unsupported page type';
  }
});
