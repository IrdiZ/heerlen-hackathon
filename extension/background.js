// MigrantAI Extension - Background Service Worker

// Handle messages from web app (externally_connectable)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('External message received:', message, 'from:', sender.origin);

  if (message.type === 'PING') {
    sendResponse({ success: true, version: '1.0.0' });
    return true;
  }

  if (message.type === 'CAPTURE_FORM') {
    // Forward to content script in active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CAPTURE_FORM' }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
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
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'FILL_FORM', 
        fillMap: message.fillMap 
      }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
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
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CAPTURE_FORM' }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          // Store the schema for the web app to retrieve
          if (response?.success && response.schema) {
            chrome.storage.local.set({ lastSchema: response.schema });
          }
          sendResponse(response);
        }
      });
    });
    return true;
  }

  return false;
});

console.log('MigrantAI background service worker loaded');
