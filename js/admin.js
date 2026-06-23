/* ============================================
   ADMIN CONTROL PANEL AND MODEL METRICS
   ============================================ */

let rocChartInstance = null;
let confusionChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Access Guard
  const currentUser = AppState.getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  // Load Admin Data Tables
  renderUsersTable();
  renderAllReportsTable();

  // Draw Model performance charts
  renderPerformanceCharts();

  // Setup Dataset Uploader drag and drop
  setupDatasetUploader();
});

// Render User Accounts Database Management Table
function renderUsersTable() {
  const tableBody = document.getElementById('admin-users-table-body');
  if (!tableBody) return;

  const users = AppState.getUsers();

  tableBody.innerHTML = users.map(user => `
    <tr id="admin-user-row-${user.username}">
      <td>
        <div class="flex items-center gap-3">
          <div class="avatar" style="width: 28px; height: 28px; font-size: 0.7rem; background: var(--gradient-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
            ${user.fullName.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <div class="font-medium">${user.fullName}</div>
            <div class="text-xs text-tertiary">@${user.username}</div>
          </div>
        </div>
      </td>
      <td>${user.email}</td>
      <td>${user.joinedDate}</td>
      <td><span class="badge ${user.role === 'admin' ? 'badge-info' : 'badge-neutral'}">${user.role}</span></td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-icon sm" onclick="editUserRole('${user.username}')" title="Change Role">⚙️</button>
          <button class="btn btn-danger btn-icon sm" onclick="deactivateUser('${user.username}')" title="Deactivate user" ${user.username === 'admin' ? 'disabled' : ''}>🚫</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.editUserRole = function(username) {
  const users = AppState.getUsers();
  const index = users.findIndex(u => u.username === username);
  if (index === -1) return;

  const newRole = users[index].role === 'admin' ? 'user' : 'admin';
  
  if (confirm(`Change role of @${username} to "${newRole.toUpperCase()}"?`)) {
    users[index].role = newRole;
    AppState.setUsers(users);
    renderUsersTable();
    Toast.show('Role Updated', `@${username} is now an ${newRole}.`, 'success');
  }
};

window.deactivateUser = function(username) {
  if (confirm(`Are you sure you want to deactivate user @${username}?`)) {
    Toast.show('User Deactivated', `The account for @${username} has been suspended.`, 'info');
  }
};

// Render Global Analysis Logs Table
let reportsFilter = 'all';

function renderAllReportsTable() {
  const tableBody = document.getElementById('admin-reports-table-body');
  if (!tableBody) return;

  let reports = AppState.getHistory();

  if (reportsFilter === 'real') {
    reports = reports.filter(r => r.verdict === 'REAL');
  } else if (reportsFilter === 'fake') {
    reports = reports.filter(r => r.verdict === 'FAKE');
  }

  tableBody.innerHTML = reports.map(item => `
    <tr>
      <td>${new Date(item.date).toLocaleDateString()}</td>
      <td class="text-tertiary">@${item.username}</td>
      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        <strong>${item.title}</strong>
      </td>
      <td><span class="badge ${item.verdict === 'REAL' ? 'badge-success' : 'badge-danger'}">${item.verdict}</span></td>
      <td class="font-mono font-semibold">${item.confidence}%</td>
      <td>
        <button class="btn btn-danger btn-icon sm" onclick="adminDeleteReport('${item.id}')" title="Delete report">🗑️</button>
      </td>
    </tr>
  `).join('');
}

window.setReportsFilter = function(filterVal) {
  reportsFilter = filterVal;
  
  const filterBtns = document.querySelectorAll('.reports-filter-panel .btn');
  filterBtns.forEach(btn => {
    btn.className = 'btn btn-secondary btn-sm';
  });
  
  event.target.className = 'btn btn-primary btn-sm';
  renderAllReportsTable();
};

window.adminDeleteReport = function(id) {
  if (!confirm('Are you sure you want to delete this news analysis record from system database?')) return;

  let history = AppState.getHistory();
  history = history.filter(h => h.id !== id);
  AppState.setHistory(history);

  renderAllReportsTable();
  Toast.show('Report Cleared', 'The analysis report record was purged.', 'info');
};

// Draw ML Model Performance ROC and Confusion Matrix Charts
function renderPerformanceCharts() {
  if (typeof Chart === 'undefined') return;

  // 1. ROC Curve chart
  const rocCtx = document.getElementById('rocChart');
  if (rocCtx) {
    if (rocChartInstance) rocChartInstance.destroy();
    rocChartInstance = new Chart(rocCtx, {
      type: 'line',
      data: {
        labels: ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'],
        datasets: [{
          label: 'Model ROC (AUC = 0.97)',
          data: [0.0, 0.75, 0.91, 0.95, 0.98, 1.0],
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.05)',
          fill: true,
          tension: 0.1,
          borderWidth: 3
        }, {
          label: 'Random Guess (AUC = 0.50)',
          data: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
          borderColor: '#64748b',
          borderDash: [6, 6],
          fill: false,
          tension: 0,
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'var(--text-secondary)' } } },
        scales: {
          x: { title: { display: true, text: 'False Positive Rate', color: 'var(--text-secondary)' }, ticks: { color: 'var(--text-tertiary)' } },
          y: { title: { display: true, text: 'True Positive Rate', color: 'var(--text-secondary)' }, ticks: { color: 'var(--text-tertiary)' } }
        }
      }
    });
  }

  // 2. Confusion Matrix Heatmap (using custom styled bar charts as heatmap proxy)
  const confCtx = document.getElementById('confusionChart');
  if (confCtx) {
    if (confusionChartInstance) confusionChartInstance.destroy();
    confusionChartInstance = new Chart(confCtx, {
      type: 'bar',
      data: {
        labels: ['True Positives', 'False Positives', 'True Negatives', 'False Negatives'],
        datasets: [{
          label: 'Prediction Counts (Testing Dataset)',
          data: [482, 18, 476, 24],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)', // TP (Green)
            'rgba(239, 68, 68, 0.8)',  // FP (Red)
            'rgba(16, 185, 129, 0.8)', // TN (Green)
            'rgba(239, 68, 68, 0.8)'   // FN (Red)
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: 'var(--text-tertiary)' } },
          x: { ticks: { color: 'var(--text-tertiary)' } }
        }
      }
    });
  }
}

// Drag & Drop dataset training logic simulation
function setupDatasetUploader() {
  const zone = document.getElementById('dataset-upload-zone');
  const fileInput = document.getElementById('dataset-file-input');
  
  if (!zone || !fileInput) return;

  zone.addEventListener('click', () => fileInput.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.borderColor = 'var(--primary-500)';
    zone.style.background = 'rgba(67, 97, 238, 0.05)';
  });

  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = 'var(--border-primary)';
    zone.style.background = 'transparent';
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.style.borderColor = 'var(--border-primary)';
    zone.style.background = 'transparent';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleDatasetFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleDatasetFile(fileInput.files[0]);
    }
  });
}

function handleDatasetFile(file) {
  // Validate extension
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'csv' && ext !== 'xlsx') {
    Toast.show('Unsupported File', 'Please select a valid dataset in .csv or .xlsx format.', 'error');
    return;
  }

  // Launch Simulated model training sequence progress
  const zone = document.getElementById('dataset-upload-zone');
  zone.innerHTML = `
    <div class="flex flex-col items-center gap-3">
      <div class="spinner"></div>
      <p class="font-semibold text-primary">Training NLP Classifier Model...</p>
      <p class="text-xs text-secondary">Processing ${file.name} (reading records)</p>
    </div>
  `;

  // Simulate weights updating after completion
  setTimeout(() => {
    zone.innerHTML = `
      <p class="text-4xl mb-2">📁</p>
      <p class="font-semibold text-primary">Upload Dataset File</p>
      <p class="text-xs text-secondary">Drag & drop dataset (.csv, .xlsx) or click to browse</p>
    `;

    // Dynamic model upgrade metrics update
    updateTextById('admin-metric-accuracy', '96.2%');
    updateTextById('admin-metric-precision', '96.4%');
    updateTextById('admin-metric-recall', '95.9%');
    updateTextById('admin-metric-f1', '96.1%');

    Toast.show('Model Updated', 'Dataset parsed successfully. AI classifier weights updated.', 'success');

    // Trigger notification record updates
    const notifications = AppState.getNotifications();
    notifications.unshift({
      id: Date.now().toString(),
      message: `System model weights updated after training on new dataset: ${file.name}`,
      time: 'Just now',
      read: false
    });
    AppState.setNotifications(notifications);

    // Refresh Performance Charts
    renderPerformanceCharts();
  }, 3500);
}
