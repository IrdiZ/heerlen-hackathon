// MigrantAI Extension - Popup Script

const APP_URL = 'http://localhost:3000';

// Elements
const captureBtn = document.getElementById('captureBtn');
const openAppBtn = document.getElementById('openAppBtn');
const connectionDot = document.getElementById('connectionDot');
const connectionStatus = document.getElementById('connectionStatus');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');

// Check connection status on load
checkConnection();

// Capture button click - use background script
captureBtn.addEventListener('click', async () => {
  captureBtn.disabled = true;
  captureBtn.innerHTML = '<span class="spinner"></span>Capturing...';
  
  try {
    // Send message to BACKGROUND script (not content script)
    const response = await chrome.runtime.sendMessage({ type: 'MANUAL_CAPTURE' });
    
    if (response && response.success) {
      showResult(response.data);
      captureBtn.innerHTML = '✅ Captured!';
      
      // Store for the app to retrieve
      await chrome.storage.local.set({ lastCapture: response.data });
      
      setTimeout(() => {
        captureBtn.innerHTML = '📸 Capture This Page';
        captureBtn.disabled = false;
      }, 2000);
    } else {
      throw new Error(response?.error || 'Capture failed');
    }
  } catch (error) {
    console.error('Capture error:', error);
    captureBtn.innerHTML = '❌ Error';
    showResult({ error: error.message });
    setTimeout(() => {
      captureBtn.innerHTML = '📸 Capture This Page';
      captureBtn.disabled = false;
    }, 2000);
  }
});

// Open app button
openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: APP_URL });
});

// Check if extension is working (not persistent connection - just self-test)
async function checkConnection() {
  try {
    // Just check if background script responds
    const response = await chrome.runtime.sendMessage({ type: 'PING' });
    updateConnectionUI(response?.success === true);
  } catch (e) {
    updateConnectionUI(false);
  }
}

// Update connection UI
function updateConnectionUI(connected) {
  if (connected) {
    connectionDot.classList.add('connected');
    connectionStatus.textContent = 'Ready';
  } else {
    connectionDot.classList.remove('connected');
    connectionStatus.textContent = 'Error';
  }
}

// Show capture result
function showResult(data) {
  resultDiv.classList.add('show');
  
  if (data.error) {
    resultText.textContent = `Error: ${data.error}`;
    return;
  }
  
  const summary = [
    `📄 ${data.title || data.url || 'Page captured'}`,
    `📝 Forms: ${data.forms?.length || 0}`,
    `🔤 Fields: ${countFields(data)}`,
    `🔘 Buttons: ${data.buttons?.length || 0}`
  ];
  
  if (data.errors?.length > 0) {
    summary.push(`⚠️ Errors: ${data.errors.length}`);
  }
  
  resultText.textContent = summary.join('\n');
}

// Count total fields
function countFields(data) {
  let count = data.inputs?.length || 0;
  data.forms?.forEach(f => {
    count += f.fields?.length || 0;
  });
  return count;
}

// Listen for connection status updates
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.appConnected) {
    updateConnectionUI(changes.appConnected.newValue);
  }
});
