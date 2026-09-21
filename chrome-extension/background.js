// RakshaOS Chrome Extension — Service Worker (Background)
// Manages badge updates, scan history, and cross-tab coordination.

const scanHistory = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'update_badge') {
    const { score, threats, verdict, url } = message;

    // Update badge
    let color = '#22c55e'; // green
    let text = '';

    if (score > 60) {
      color = '#ef4444'; // red
      text = String(threats || '!');
    } else if (score > 25) {
      color = '#f59e0b'; // amber
      text = String(threats || '?');
    }

    if (threats > 0) {
      chrome.action.setBadgeText({ text: text, tabId: sender.tab?.id });
      chrome.action.setBadgeBackgroundColor({ color: color, tabId: sender.tab?.id });
    } else {
      chrome.action.setBadgeText({ text: '✓', tabId: sender.tab?.id });
      chrome.action.setBadgeBackgroundColor({ color: '#22c55e', tabId: sender.tab?.id });
    }

    // Store in history
    scanHistory.unshift({
      url: url || sender.tab?.url,
      score: score,
      threats: threats,
      verdict: verdict || (score > 60 ? 'HIGH_RISK' : score > 25 ? 'WARNING' : 'SAFE'),
      timestamp: new Date().toISOString()
    });

    // Keep only last 20
    if (scanHistory.length > 20) scanHistory.pop();

    // Save to storage for popup
    chrome.storage.local.set({ scanHistory: scanHistory });
  }

  if (message.type === 'get_history') {
    sendResponse({ history: scanHistory });
    return true;
  }
});

// Set default badge on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
  console.log('RakshaOS Shield extension installed.');
});
