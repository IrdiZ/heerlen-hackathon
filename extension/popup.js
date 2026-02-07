// MigrantAI Extension - Popup Script

const captureBtn = document.getElementById('captureBtn');
const statusEl = document.getElementById('status');
const fieldCountEl = document.getElementById('fieldCount');

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
  fieldCountEl.textContent = '';

  try {
    // Send message to background script
    chrome.runtime.sendMessage({ type: 'CAPTURE_FORM_FROM_POPUP' }, (response) => {
      setLoading(false);
      
      if (chrome.runtime.lastError) {
        setStatus('error', `Error: ${chrome.runtime.lastError.message}`);
        return;
      }

      if (!response) {
        setStatus('error', 'No response from content script. Is the page fully loaded?');
        return;
      }

      if (response.success && response.schema) {
        const count = response.schema.fields.length;
        if (count === 0) {
          setStatus('info', 'No form fields found on this page.');
        } else {
          setStatus('success', `✓ Captured ${count} form field${count !== 1 ? 's' : ''}!`);
          fieldCountEl.textContent = `From: ${response.schema.title || response.schema.url}`;
          
          // Log the schema for debugging
          console.log('Captured schema:', response.schema);
        }
      } else {
        setStatus('error', response.error || 'Failed to capture form');
      }
    });
  } catch (e) {
    setLoading(false);
    setStatus('error', `Error: ${e.message}`);
  }
});

// Check connection on popup open
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url?.startsWith('chrome://')) {
    setStatus('info', 'Cannot capture forms on Chrome system pages.');
    captureBtn.disabled = true;
  }
});
