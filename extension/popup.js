// MigrantAI Extension - Popup Script

const APP_URL = 'http://localhost:3000'; // Change for production

// Elements
const captureBtn = document.getElementById('captureBtn');
const openAppBtn = document.getElementById('openAppBtn');
const connectionDot = document.getElementById('connectionDot');
const connectionStatus = document.getElementById('connectionStatus');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');

// Check connection status on load
checkConnection();

// Capture button click
captureBtn.addEventListener('click', async () => {
  captureBtn.disabled = true;
  captureBtn.innerHTML = '<span class="spinner"></span>Capturing...';
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to capture
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_NOW' });
    
    if (response && response.success) {
      // Store the captured data
      await chrome.storage.local.set({ lastCapture: response.data });
      
      // Send to background to forward to app
      chrome.runtime.sendMessage({ 
        type: 'PAGE_DATA', 
        data: response.data 
      });
      
      // Show result
      showResult(response.data);
      
      captureBtn.innerHTML = '✅ Captured!';
      setTimeout(() => {
        captureBtn.innerHTML = '📸 Capture This Page';
        captureBtn.disabled = false;
      }, 2000);
    } else {
      throw new Error('Capture failed');
    }
  } catch (error) {
    console.error('Capture error:', error);
    captureBtn.innerHTML = '❌ Error - Try Again';
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

// Check if app is connected
async function checkConnection() {
  try {
    // Try to get stored connection status
    const { appConnected } = await chrome.storage.local.get('appConnected');
    updateConnectionUI(appConnected);
  } catch (e) {
    updateConnectionUI(false);
  }
}

// Update connection UI
function updateConnectionUI(connected) {
  if (connected) {
    connectionDot.classList.add('connected');
    connectionStatus.textContent = 'Connected';
  } else {
    connectionDot.classList.remove('connected');
    connectionStatus.textContent = 'Not connected';
  }
}

// Show capture result
function showResult(data) {
  resultDiv.classList.add('show');
  
  if (data.error) {
    resultText.textContent = `Error: ${data.error}`;
    return;
  }
  
  // Format summary
  const summary = [
    `📄 Page: ${data.title || data.url}`,
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
