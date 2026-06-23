/* ============================================
   PERSONAL DASHBOARD LOGIC AND CHARTS
   ============================================ */

let activityChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Authentication Guard
  const currentUser = AppState.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Load and Render Stats
  updateDashboardStats();

  // Draw Activity Chart (Chart.js)
  renderActivityChart();

  // Render History Table List
  renderHistoryTable();

  // Render Saved Reports Cards
  renderSavedReports();

  // Render Trending Feed
  renderTrendingFeed();

  // Setup History Table Filters
  setupTableFilters();
});

// Calculate metrics from current user's past records
function updateDashboardStats() {
  const currentUser = AppState.getCurrentUser();
  const history = AppState.getHistory().filter(h => h.username === currentUser.username);
  
  const totalCount = history.length;
  const fakeCount = history.filter(h => h.verdict === 'FAKE').length;
  const realCount = history.filter(h => h.verdict === 'REAL').length;
  
  let avgConfidence = 0;
  if (totalCount > 0) {
    const sum = history.reduce((acc, curr) => acc + curr.confidence, 0);
    avgConfidence = Number((sum / totalCount).toFixed(1));
  }

  // Inject into DOM
  updateTextById('stat-total-analyses', totalCount);
  updateTextById('stat-fake-detected', fakeCount);
  updateTextById('stat-real-detected', realCount);
  updateTextById('stat-avg-confidence', totalCount > 0 ? `${avgConfidence}%` : '0.0%');
}

function updateTextById(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

// Render monthly analytics using Chart.js
function renderActivityChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  // Import Chart.js programmatically if not loaded, or use standard options
  // For safety, let's verify if Chart is loaded globally
  if (typeof Chart === 'undefined') return;

  // Setup monthly analysis mock weights
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const dataFake = [3, 2, 4, 1, 5, 2];
  const dataReal = [5, 4, 6, 8, 4, 5];

  if (activityChartInstance) {
    activityChartInstance.destroy();
  }

  activityChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Real News Verified',
          data: dataReal,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2
        },
        {
          label: 'Fake News Detected',
          data: dataFake,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: 'var(--text-secondary)', font: { family: 'Inter' } }
        }
      },
      scales: {
        y: {
          grid: { color: 'var(--border-secondary)' },
          ticks: { color: 'var(--text-tertiary)' }
        },
        x: {
          grid: { display: false },
          ticks: { color: 'var(--text-tertiary)' }
        }
      }
    }
  });
}

// History Table rendering with filter/delete/export triggers
let activeFilter = 'all';
let searchQuery = '';

function renderHistoryTable() {
  const currentUser = AppState.getCurrentUser();
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;

  let historyList = AppState.getHistory().filter(h => h.username === currentUser.username);

  // Apply Search
  if (searchQuery) {
    historyList = historyList.filter(h => 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply Category Filter
  if (activeFilter === 'real') {
    historyList = historyList.filter(h => h.verdict === 'REAL');
  } else if (activeFilter === 'fake') {
    historyList = historyList.filter(h => h.verdict === 'FAKE');
  }

  if (historyList.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-secondary" style="padding: var(--space-8) 0;">
          No matching analyses records found.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = historyList.map(item => {
    const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const badgeClass = item.verdict === 'REAL' ? 'badge-success' : 'badge-danger';
    
    return `
      <tr>
        <td>${formattedDate}</td>
        <td class="font-medium" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <a href="result.html?id=${item.id}" class="text-primary hover:underline">${item.title}</a>
        </td>
        <td><span class="badge ${badgeClass}">${item.verdict}</span></td>
        <td class="font-mono font-semibold">${item.confidence}%</td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-icon sm" onclick="exportHistoryRow('${item.id}')" title="Download Report">📥</button>
            <button class="btn btn-danger btn-icon sm" onclick="deleteHistoryRow('${item.id}')" title="Delete record">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupTableFilters() {
  const searchInput = document.getElementById('history-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderHistoryTable();
    });
  }

  const filterBtns = document.querySelectorAll('.filter-actions .btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.className = 'btn btn-secondary btn-sm');
      btn.className = 'btn btn-primary btn-sm';
      activeFilter = btn.getAttribute('data-filter');
      renderHistoryTable();
    });
  });
}

// Delete analysis item
window.deleteHistoryRow = function(id) {
  if (!confirm('Are you sure you want to permanently delete this report record?')) return;

  let history = AppState.getHistory();
  history = history.filter(h => h.id !== id);
  AppState.setHistory(history);

  // Update lists
  updateDashboardStats();
  renderHistoryTable();
  Toast.show('Record Cleared', 'The analysis report record was deleted.', 'info');
};

// Export row to CSV
window.exportHistoryRow = function(id) {
  const report = AppState.getHistory().find(h => h.id === id);
  if (!report) return;

  const rows = [
    ['Field', 'Value'],
    ['Report ID', report.id],
    ['Date Analyzed', report.date],
    ['Article Title', report.title],
    ['ML Classifier Verdict', report.verdict],
    ['Confidence Rating (%)', report.confidence],
    ['Source Credibility score', report.sourceScore]
  ];

  let csvContent = 'data:text/csv;charset=utf-8,' 
    + rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `AnalysisReport_${report.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  Toast.show('Export Successful', `Downloaded report: ${report.title.substring(0, 15)}...`, 'success');
};

// Render saved bookmarks items
function renderSavedReports() {
  const container = document.getElementById('saved-reports-grid');
  if (!container) return;

  const saved = AppState.getSaved();

  if (saved.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">📁</div>
        <h3>No Saved Reports</h3>
        <p>Analyze articles and click "Save Analysis Report" to keep key highlights here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = saved.map(item => `
    <div class="card flex flex-col justify-between" id="saved-card-${item.id}">
      <div>
        <div class="flex justify-between items-start mb-4">
          <span class="badge ${item.verdict === 'REAL' ? 'badge-success' : 'badge-danger'}">${item.verdict}</span>
          <span class="text-xs text-tertiary">${new Date(item.date).toLocaleDateString()}</span>
        </div>
        <h4 class="text-sm font-semibold mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${item.title}
        </h4>
        <p class="text-xs text-secondary mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${item.summary}
        </p>
      </div>
      <div class="flex gap-2 mt-4 pt-4" style="border-top: 1px solid var(--border-secondary);">
        <a href="result.html?id=${item.id}" class="btn btn-secondary btn-sm flex-1">View Result</a>
        <button class="btn btn-secondary btn-sm" onclick="downloadSavedArticle('${item.id}')" title="Download Article" style="padding: var(--space-1-5) var(--space-3); font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">📥 Download</button>
        <button class="btn btn-danger btn-icon sm" onclick="removeSavedReport('${item.id}')" title="Remove bookmark">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.downloadSavedArticle = function(id) {
  const saved = AppState.getSaved();
  const report = saved.find(s => s.id === id);
  if (!report) return;

  const content = report.content || report.summary || "No content available.";
  const title = report.title || "Untitled Article";
  const verdict = report.verdict || "UNVERIFIED";
  const confidence = report.confidence || 0;
  const date = report.date || new Date().toISOString();

  const fileContent = `==================================================
VERITAS AI - NEWS CREDIBILITY REPORT
==================================================
Title: ${title}
Date Analyzed: ${new Date(date).toLocaleString()}
AI Verdict: ${verdict} (${confidence}% Confidence)
--------------------------------------------------
Original Article Content / Summary:
--------------------------------------------------
${content}
--------------------------------------------------
Generated by Veritas AI
==================================================`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_report.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  Toast.show('Article Downloaded', 'The article and its analysis details were downloaded.', 'success');
};

window.removeSavedReport = function(id) {
  let saved = AppState.getSaved();
  saved = saved.filter(s => s.id !== id);
  AppState.setSaved(saved);
  
  renderSavedReports();
  Toast.show('Report Removed', 'Removed the bookmarked report.', 'info');
};

// Render trending news alerts list feed
function renderTrendingFeed() {
  const container = document.getElementById('trending-feed-list');
  if (!container) return;

  const trendingItems = [
    { title: 'Global Tech Summit Announces New Quantum Computing Standards', verified: true, time: '12m ago' },
    { title: 'Rumor: Alien Crafts Spotted Hovering Over London Skies Disproved', verified: false, time: '40m ago' },
    { title: 'Medical Breakthrough: Gene Therapy Cures Rare Blindness Strain', verified: true, time: '1h ago' },
    { title: 'Fake Message claiming free iPhones from WhatsApp is circulating', verified: false, time: '3h ago' }
  ];

  container.innerHTML = trendingItems.map(item => {
    const badgeType = item.verified ? 'verified' : 'fake';
    const icon = item.verified ? '🛡️' : '⚠️';
    
    return `
      <div class="news-item">
        <div class="news-item-icon ${badgeType}">${icon}</div>
        <div class="news-item-content">
          <div class="news-item-title">${item.title}</div>
          <div class="news-item-meta">
            <span class="badge ${item.verified ? 'badge-success' : 'badge-danger'}">${item.verified ? 'Verified News' : 'Hoax Alert'}</span>
            <span>${item.time}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
