// MigrantAI Extension - Background Service Worker

// Badge colors
const BADGE_COLORS = {
  connected: '#22c55e',  // green
  warning: '#eab308',    // yellow
  error: '#ef4444',      // red
  neutral: '#3b82f6'     // blue
};

function setBadge(text, color) {
  chrome.action.setBadgeText({ text: text || '' });
  chrome.action.setBadgeBackgroundColor({ color: color || BADGE_COLORS.neutral });
}

function setBadgeStatus(status) {
  const color = BADGE_COLORS[status] || BADGE_COLORS.neutral;
  chrome.action.setBadgeBackgroundColor({ color });
}

// Handle messages from web app (externally_connectable)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('External message received:', message, 'from:', sender.origin);

  if (message.type === 'PING') {
    setBadge('', BADGE_COLORS.connected);
    sendResponse({ success: true, version: '1.0.0' });
    return true;
  }

  if (message.type === 'CAPTURE_FORM') {
    // Forward to content script in active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        setBadge('!', BADGE_COLORS.error);
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CAPTURE_FORM' }, (response) => {
        if (chrome.runtime.lastError) {
          setBadge('!', BADGE_COLORS.error);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else if (response?.success && response.schema) {
          const count = response.schema.fields.length;
          setBadge(count > 0 ? String(count) : '', BADGE_COLORS.connected);
          sendResponse(response);
        } else {
          setBadge('!', BADGE_COLORS.warning);
          sendResponse(response);
        }
      });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'FILL_FORM') {
    // Forward fill request to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        setBadge('!', BADGE_COLORS.error);
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'FILL_FORM', 
        fillMap: message.fillMap 
      }, (response) => {
        if (chrome.runtime.lastError) {
          setBadge('!', BADGE_COLORS.error);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else if (response?.success) {
          const filledCount = response.results?.filter(r => r.status === 'filled').length || 0;
          setBadge('✓', BADGE_COLORS.connected);
          // Clear badge after 5 seconds
          setTimeout(() => setBadge('', BADGE_COLORS.connected), 5000);
          sendResponse(response);
        } else {
          setBadge('!', BADGE_COLORS.warning);
          sendResponse(response);
        }
      });
    });
    return true;
  }

  sendResponse({ success: false, error: 'Unknown message type' });
  return true;
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Internal message received:', message);

  if (message.type === 'CAPTURE_FORM_FROM_POPUP') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        setBadge('!', BADGE_COLORS.error);
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CAPTURE_FORM' }, (response) => {
        if (chrome.runtime.lastError) {
          setBadge('!', BADGE_COLORS.error);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          // Store the schema for the web app to retrieve
          if (response?.success && response.schema) {
            chrome.storage.local.set({ lastSchema: response.schema });
            const count = response.schema.fields.length;
            setBadge(count > 0 ? String(count) : '', BADGE_COLORS.connected);
          }
          sendResponse(response);
        }
      });
    });
    return true;
  }

  return false;
});

// Initialize with neutral state
setBadge('', BADGE_COLORS.neutral);

console.log('MigrantAI background service worker loaded');
