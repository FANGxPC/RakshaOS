// RakshaOS Chrome Extension — Content Script
// Runs on every page. Scans links and text for scam indicators.

(function() {
  'use strict';

  const API_BASE = 'http://localhost:8000/api';
  const SUSPICIOUS_TLDS = ['.top', '.xyz', '.click', '.vip', '.online', '.shop', '.buzz', '.live', '.club', '.work'];
  const URGENCY_KEYWORDS = ['immediately', 'urgent', 'act now', 'limited time', 'expires today', 'last chance', 'final warning', 'your account', 'suspended', 'blocked', 'verify now', 'update kyc'];

  let pageRiskScore = 0;
  let detectedThreats = 0;
  let scanComplete = false;

  // ─── Link Scanner ───────────────────────────────────────────
  function scanLinks() {
    const links = document.querySelectorAll('a[href]');
    let suspicious = 0;

    links.forEach(link => {
      const href = link.href.toLowerCase();
      
      // Check suspicious TLDs
      const isSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => {
        try {
          const url = new URL(href);
          return url.hostname.endsWith(tld);
        } catch { return false; }
      });

      // Check for IP-based URLs
      const isIPUrl = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(href);

      // Check for data URIs or javascript:
      const isDangerous = href.startsWith('javascript:') || href.startsWith('data:');

      if (isSuspiciousTLD || isIPUrl || isDangerous) {
        suspicious++;
        highlightLink(link, isSuspiciousTLD ? 'Suspicious domain' : isIPUrl ? 'IP-based URL' : 'Potentially dangerous link');
      }
    });

    return suspicious;
  }

  // ─── Text Scanner ──────────────────────────────────────────
  function scanText() {
    const bodyText = document.body.innerText.toLowerCase();
    let urgencyCount = 0;

    URGENCY_KEYWORDS.forEach(keyword => {
      if (bodyText.includes(keyword)) urgencyCount++;
    });

    return urgencyCount;
  }

  // ─── Highlight Suspicious Links ────────────────────────────
  function highlightLink(link, reason) {
    link.style.outline = '2px solid #ff4444';
    link.style.outlineOffset = '2px';
    link.style.position = 'relative';
    
    // Add tooltip on hover
    link.setAttribute('data-rakshaos-warning', `⚠️ RakshaOS: ${reason}`);
    link.title = `⚠️ RakshaOS Warning: ${reason}`;
  }

  // ─── Warning Overlay ──────────────────────────────────────
  function showWarningOverlay(score, threats) {
    if (score < 40) return; // Only show for significant threats

    const overlay = document.createElement('div');
    overlay.id = 'rakshaos-warning-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
        background: linear-gradient(135deg, rgba(220,38,38,0.95), rgba(190,18,60,0.95));
        color: white; padding: 12px 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex; align-items: center; justify-content: space-between;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: rakshaos-slide-down 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">🛡️</span>
          <div>
            <strong style="font-size: 14px;">RakshaOS Warning — This page has ${threats} suspicious element${threats > 1 ? 's' : ''}</strong>
            <p style="margin: 2px 0 0; font-size: 12px; opacity: 0.9;">Risk Score: ${score}/100. Proceed with extreme caution. Do not enter personal details or make payments.</p>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
          color: white; padding: 6px 16px; border-radius: 6px; cursor: pointer;
          font-size: 12px; font-weight: 600;
        ">Dismiss</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // ─── Send to Backend ──────────────────────────────────────
  async function analyzePageWithBackend() {
    // Extract meaningful page content (first 500 chars of visible text + all URLs)
    const pageText = document.body.innerText.substring(0, 500);
    const currentUrl = window.location.href;
    
    // Skip internal/safe pages
    if (['google.com', 'github.com', 'stackoverflow.com', 'youtube.com', 'localhost'].some(d => currentUrl.includes(d))) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: 'text',
          content: `Page URL: ${currentUrl}\n\nPage Content:\n${pageText}`,
          channel: 'chrome',
          language_hint: 'auto'
        })
      });

      if (response.ok) {
        const result = await response.json();
        pageRiskScore = result.risk_score || 0;
        
        // Update badge
        chrome.runtime.sendMessage({
          type: 'update_badge',
          score: pageRiskScore,
          threats: detectedThreats,
          verdict: result.verdict,
          url: currentUrl
        });

        if (result.verdict === 'HIGH_RISK' || result.verdict === 'EMERGENCY') {
          showWarningOverlay(pageRiskScore, detectedThreats);
        }
      }
    } catch (err) {
      // Backend may not be running; that's okay for offline scanning
      console.log('RakshaOS: Backend not available, using local scan only.');
    }
  }

  // ─── Main Scan ────────────────────────────────────────────
  function runScan() {
    if (scanComplete) return;
    scanComplete = true;

    const suspiciousLinks = scanLinks();
    const urgencySignals = scanText();
    detectedThreats = suspiciousLinks + urgencySignals;
    
    // Simple local risk score
    pageRiskScore = Math.min(100, suspiciousLinks * 20 + urgencySignals * 10);

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'update_badge',
      score: pageRiskScore,
      threats: detectedThreats,
      url: window.location.href
    });

    // If local scan finds issues, also run full backend analysis
    if (detectedThreats > 0 || pageRiskScore > 20) {
      analyzePageWithBackend();
    } else {
      // Even safe pages get a quick backend check
      analyzePageWithBackend();
    }

    // Show overlay for locally-detected high risk
    if (pageRiskScore >= 40) {
      showWarningOverlay(pageRiskScore, detectedThreats);
    }
  }

  // Run after page loads
  if (document.readyState === 'complete') {
    runScan();
  } else {
    window.addEventListener('load', runScan);
  }
})();
