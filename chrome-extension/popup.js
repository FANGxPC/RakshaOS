// RakshaOS Extension Popup Logic
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['scanHistory'], (data) => {
    const history = data.scanHistory || [];
    const list = document.getElementById('historyList');
    const pagesScanned = document.getElementById('pagesScanned');
    const threatsFound = document.getElementById('threatsFound');
    const safePages = document.getElementById('safePages');

    pagesScanned.textContent = history.length;
    threatsFound.textContent = history.filter(h => h.verdict === 'HIGH_RISK' || h.verdict === 'EMERGENCY').length;
    safePages.textContent = history.filter(h => h.verdict === 'SAFE').length;

    if (history.length === 0) return;

    list.innerHTML = '';
    history.slice(0, 10).forEach(scan => {
      let badgeClass = 'safe';
      let badgeText = 'SAFE';
      if (scan.verdict === 'HIGH_RISK' || scan.verdict === 'EMERGENCY') {
        badgeClass = 'danger';
        badgeText = scan.verdict.replace('_', ' ');
      } else if (scan.verdict === 'WARNING') {
        badgeClass = 'warning';
        badgeText = 'WARNING';
      }

      const item = document.createElement('div');
      item.className = 'scan-item';
      item.innerHTML = `
        <span class="url">${new URL(scan.url || 'http://unknown').hostname}</span>
        <span class="badge ${badgeClass}">${badgeText}</span>
      `;
      list.appendChild(item);
    });
  });
});
