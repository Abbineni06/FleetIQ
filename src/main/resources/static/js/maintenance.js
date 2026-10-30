/**
 * FleetIQ Predictive Maintenance System Logic
 */

let allPredictions = [];
let allVehicles = [];

document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  const dateInput = document.getElementById('maint-service-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  loadVehicles();
  loadPredictions();
  loadRecentMaintenance();

  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'schedule') {
    setTimeout(() => {
      openRecordMaintenanceModal(params.get('vehicleId'));
    }, 400);
  }
});

async function loadVehicles() {
  try {
    allVehicles = await API.get('/api/vehicles');
    const select = document.getElementById('maint-vehicle-id');
    if (select) {
      select.innerHTML = '<option value="">Choose vehicle...</option>' +
        allVehicles.map(v => `<option value="${v.id}">${escapeHtml(v.registrationNumber)} - ${escapeHtml(v.make)} ${escapeHtml(v.model)}</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadPredictions() {
  try {
    allPredictions = await API.get('/api/maintenance/predictions');

    let overdue = 0, dueSoon = 0, upcoming = 0, normal = 0;
    allPredictions.forEach(p => {
      if (p.urgency === 'OVERDUE') overdue++;
      else if (p.urgency === 'DUE_SOON') dueSoon++;
      else if (p.urgency === 'UPCOMING') upcoming++;
      else normal++;
    });

    document.getElementById('count-overdue').textContent = overdue;
    document.getElementById('count-due-soon').textContent = dueSoon;
    document.getElementById('count-upcoming').textContent = upcoming;
    document.getElementById('count-normal').textContent = normal;

    renderPredictions();
  } catch (err) {
    showToast('Failed to calculate maintenance predictions: ' + err.message, 'danger');
  }
}

function renderPredictions() {
  const tbody = document.getElementById('predictive-tbody');
  const filter = document.getElementById('urgency-filter')?.value || '';
  if (!tbody) return;

  const filtered = filter ? allPredictions.filter(p => p.urgency === filter) : allPredictions;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--text-muted);">No predictive records match the selected urgency level.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    let urgencyBadge = '<span class="badge badge-success">Normal</span>';
    if (p.urgency === 'OVERDUE') urgencyBadge = '<span class="badge badge-danger">OVERDUE</span>';
    else if (p.urgency === 'DUE_SOON') urgencyBadge = '<span class="badge badge-warning">Due Soon (<500 KM)</span>';
    else if (p.urgency === 'UPCOMING') urgencyBadge = '<span class="badge badge-orange">Upcoming</span>';

    const avgDaily = p.hasSufficientData && p.avgDailyDistanceKm ? `${p.avgDailyDistanceKm} KM/day` : '<span style="color:var(--text-muted);font-style:italic;">Insufficient history</span>';

    let forecast = 'Insufficient data for prediction';
    if (p.hasSufficientData && p.predictedServiceDate) {
      forecast = `<strong>${p.predictedServiceDate}</strong> <span style="font-size:0.75rem;color:var(--text-muted);">(~${p.estimatedDaysRemaining} days)</span>`;
    } else if (p.remainingKm <= 0) {
      forecast = `<strong style="color:var(--status-danger);">Immediate Action</strong>`;
    }

    const isOverdue = p.remainingKm <= 0 || p.urgency === 'OVERDUE';
    const remainingText = isOverdue
      ? `<span style="color:var(--status-danger);font-weight:700;">${Math.abs(p.remainingKm || 0).toLocaleString()} KM Overdue</span>`
      : `<span style="font-weight:600;">${(p.remainingKm || 0).toLocaleString()} KM</span>`;

    return `
      <tr>
        <td>
          <a href="/vehicle-details.html?id=${p.vehicleId}" style="font-weight:700;color:var(--text-primary);">
            ${escapeHtml(p.registrationNumber)}
          </a>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(p.vehicleModel)}</div>
        </td>
        <td style="font-weight:600;">${(p.currentOdometer || 0).toLocaleString()} KM</td>
        <td>${(p.lastServiceKm || 0).toLocaleString()} KM</td>
        <td>${(p.nextServiceKm || 0).toLocaleString()} KM</td>
        <td>${remainingText}</td>
        <td>${avgDaily}</td>
        <td>${forecast}</td>
        <td>${urgencyBadge}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openRecordMaintenanceModal(${p.vehicleId})">
            Record Svc
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadRecentMaintenance() {
  const tbody = document.getElementById('recent-maint-tbody');
  if (!tbody) return;

  try {
    const list = await API.get('/api/maintenance/recent');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted);">No maintenance logs recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr>
        <td style="font-weight:600;">${m.serviceDate}</td>
        <td>
          <a href="/vehicle-details.html?id=${m.vehicleId}" style="font-weight:700;color:var(--primary-orange);">
            ${escapeHtml(m.vehicleRegistration)}
          </a>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(m.vehicleModel)}</div>
        </td>
        <td><span class="badge badge-orange">${escapeHtml(m.maintenanceType)}</span></td>
        <td>${(m.odometerKm || 0).toLocaleString()} KM</td>
        <td>${escapeHtml(m.workPerformed)}</td>
        <td>${escapeHtml(m.partsReplaced || 'None')}</td>
        <td style="font-weight:700;">$${(m.cost || 0).toLocaleString()}</td>
        <td>${escapeHtml(m.mechanicName || 'N/A')}</td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--status-danger);">Failed to load recent service logs.</td></tr>`;
  }
}

function openRecordMaintenanceModal(vehicleId) {
  document.getElementById('record-maint-form').reset();
  document.getElementById('maint-service-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('maint-interval').value = 10000;

  if (vehicleId) {
    document.getElementById('maint-vehicle-id').value = vehicleId;
    populateVehicleCurrentKm();
  }

  document.getElementById('record-maint-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeRecordMaintenanceModal() {
  document.getElementById('record-maint-modal').classList.remove('active');
}

function populateVehicleCurrentKm() {
  const vId = document.getElementById('maint-vehicle-id').value;
  const v = allVehicles.find(x => x.id == vId);
  if (v) {
    document.getElementById('maint-odometer').value = v.currentOdometer || 0;
    document.getElementById('maint-interval').value = v.serviceIntervalKm || 10000;
  }
}

async function handleMaintSubmit(e) {
  e.preventDefault();
  const payload = {
    vehicleId: parseInt(document.getElementById('maint-vehicle-id').value),
    serviceDate: document.getElementById('maint-service-date').value,
    odometerKm: parseInt(document.getElementById('maint-odometer').value),
    maintenanceType: document.getElementById('maint-type').value,
    workPerformed: document.getElementById('maint-work').value.trim(),
    partsReplaced: document.getElementById('maint-parts').value.trim(),
    cost: parseFloat(document.getElementById('maint-cost').value),
    mechanicName: document.getElementById('maint-mechanic').value.trim(),
    serviceIntervalKm: parseInt(document.getElementById('maint-interval').value) || 10000,
  };

  try {
    await API.post('/api/maintenance', payload);
    showToast('Maintenance recorded! Service thresholds and vehicle health recalculated.', 'success');
    closeRecordMaintenanceModal();
    loadVehicles();
    loadPredictions();
    loadRecentMaintenance();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
