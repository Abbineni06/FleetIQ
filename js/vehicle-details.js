/**
 * FleetIQ Vehicle Profile & History Details Logic
 */

let currentVehicleId = null;
let currentVehicle = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentVehicleId = params.get('id');

  if (!currentVehicleId) {
    showToast('No vehicle ID specified', 'danger');
    window.location.href = 'vehicles.html';
    return;
  }

  loadVehicleData();

  if (params.get('tab')) {
    switchTab(params.get('tab'));
  }
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

  const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick')?.includes(tabName));
  const targetPane = document.getElementById(`tab-${tabName}`);

  if (targetBtn) targetBtn.classList.add('active');
  if (targetPane) targetPane.classList.add('active');

  if (tabName === 'maintenance') loadMaintenanceTab();
  if (tabName === 'repairs') loadRepairsTab();
  if (tabName === 'fuel') loadFuelTab();
  if (tabName === 'inspections') loadInspectionsTab();
  if (tabName === 'health') loadHealthTab();
  if (tabName === 'qr') loadQrTab();
}

async function loadVehicleData() {
  try {
    currentVehicle = await API.get(`/api/vehicles/${currentVehicleId}`);

    // Update Hero Card
    const defaultImg = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80';
    document.getElementById('v-hero-img').src = currentVehicle.imageUrl || defaultImg;
    document.getElementById('v-hero-reg').textContent = currentVehicle.registrationNumber;
    document.getElementById('v-hero-model').textContent = `${currentVehicle.make} ${currentVehicle.model} (${currentVehicle.manufactureYear}) • ${currentVehicle.vehicleType} • ${currentVehicle.fuelType}`;
    document.getElementById('v-hero-vin').textContent = currentVehicle.vin || 'N/A';
    document.getElementById('v-hero-driver').textContent = currentVehicle.assignedDriverName || 'Unassigned';

    // Status badge
    const statusEl = document.getElementById('v-hero-status');
    statusEl.className = 'badge';
    if (currentVehicle.status === 'ACTIVE') { statusEl.classList.add('badge-success'); statusEl.textContent = 'Active'; }
    else if (currentVehicle.status === 'MAINTENANCE_DUE') { statusEl.classList.add('badge-warning'); statusEl.textContent = 'Maintenance Due'; }
    else if (currentVehicle.status === 'IN_SHOP') { statusEl.classList.add('badge-info'); statusEl.textContent = 'In Shop'; }
    else if (currentVehicle.status === 'UNSAFE') { statusEl.classList.add('badge-danger'); statusEl.textContent = 'UNSAFE / Grounded'; }
    else { statusEl.classList.add('badge-secondary'); statusEl.textContent = currentVehicle.status; }

    // Health widget
    const health = currentVehicle.healthScore != null ? currentVehicle.healthScore : 90;
    document.getElementById('v-hero-health-val').textContent = health;
    document.getElementById('v-hero-health-cat').textContent = currentVehicle.healthCategory || 'Good';

    // Quick links
    document.getElementById('btn-schedule-maint-link').href = `maintenance.html?vehicleId=${currentVehicleId}&action=schedule`;
    document.getElementById('btn-log-repair-link').href = `repairs.html?vehicleId=${currentVehicleId}&action=add`;
    document.getElementById('btn-add-fuel-link').href = `fuel.html?vehicleId=${currentVehicleId}&action=add`;
    document.getElementById('btn-new-insp-link').href = `inspections.html?vehicleId=${currentVehicleId}&action=new`;

    // Render Overview Specs
    renderOverviewSpecs();

  } catch (err) {
    showToast('Failed to load vehicle details: ' + err.message, 'danger');
  }
}

function renderOverviewSpecs() {
  const v = currentVehicle;
  const grid = document.getElementById('v-spec-grid');
  if (!grid || !v) return;

  const remaining = (v.remainingKm !== undefined && v.remainingKm !== null)
    ? v.remainingKm
    : ((v.nextServiceKm != null && v.currentOdometer != null) ? (v.nextServiceKm - v.currentOdometer) : 0);
  const isOverdue = remaining <= 0 || v.status === 'MAINTENANCE_DUE';
  const remainingColor = (remaining <= 500 || isOverdue) ? 'var(--status-danger)' : 'var(--text-primary)';
  const remText = isOverdue
    ? (remaining < 0 ? `${Math.abs(remaining).toLocaleString()} KM OVERDUE` : 'MAINTENANCE DUE')
    : `${(remaining || 0).toLocaleString()} KM`;

  grid.innerHTML = `
    <div class="spec-box">
      <div class="spec-title">Current Odometer</div>
      <div class="spec-val">${(v.currentOdometer || 0).toLocaleString()} KM</div>
    </div>
    <div class="spec-box">
      <div class="spec-title">Last Service KM</div>
      <div class="spec-val">${(v.lastServiceKm || 0).toLocaleString()} KM</div>
    </div>
    <div class="spec-box">
      <div class="spec-title">Service Interval</div>
      <div class="spec-val">${(v.serviceIntervalKm || 10000).toLocaleString()} KM</div>
    </div>
    <div class="spec-box">
      <div class="spec-title">Next Scheduled Service</div>
      <div class="spec-val">${(v.nextServiceKm || 0).toLocaleString()} KM</div>
    </div>
    <div class="spec-box">
      <div class="spec-title">Remaining to Service</div>
      <div class="spec-val" style="color:${remainingColor};font-weight:700;">${remText}</div>
    </div>
    <div class="spec-box">
      <div class="spec-title">Registration Date</div>
      <div class="spec-val">${v.registrationDate || 'N/A'}</div>
    </div>
  `;
}

async function loadMaintenanceTab() {
  const tbody = document.getElementById('v-maint-tbody');
  if (!tbody) return;

  try {
    const list = await API.get(`/api/maintenance/vehicle/${currentVehicleId}`);
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted);">No maintenance records logged yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr>
        <td style="font-weight:600;">${m.serviceDate}</td>
        <td><span class="badge badge-orange">${escapeHtml(m.maintenanceType)}</span></td>
        <td>${(m.odometerKm || 0).toLocaleString()} KM</td>
        <td>${escapeHtml(m.workPerformed)}</td>
        <td>${escapeHtml(m.partsReplaced || 'None')}</td>
        <td style="font-weight:700;">$${(m.cost || 0).toLocaleString()}</td>
        <td>${escapeHtml(m.mechanicName || 'N/A')}</td>
        <td>${(m.nextServiceKm || 0).toLocaleString()} KM</td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--status-danger);">Failed to load maintenance records.</td></tr>`;
  }
}

async function loadRepairsTab() {
  const tbody = document.getElementById('v-repair-tbody');
  if (!tbody) return;

  try {
    const list = await API.get(`/api/repairs/vehicle/${currentVehicleId}`);
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">No repairs logged for this vehicle.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(r => {
      let stBadge = '<span class="badge badge-warning">Pending</span>';
      if (r.repairStatus === 'IN_PROGRESS') stBadge = '<span class="badge badge-info">In Progress</span>';
      if (r.repairStatus === 'COMPLETED') stBadge = '<span class="badge badge-success">Completed</span>';

      return `
        <tr>
          <td style="font-weight:600;">${r.repairDate}</td>
          <td><span class="badge badge-secondary">${escapeHtml(r.repairCategory)}</span></td>
          <td>${escapeHtml(r.problemDescription)}</td>
          <td>${escapeHtml(r.partsReplaced || 'None')}</td>
          <td style="font-weight:700;">$${(r.cost || 0).toLocaleString()}</td>
          <td>${stBadge}</td>
          <td>${escapeHtml(r.mechanicName || 'N/A')}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--status-danger);">Failed to load repair records.</td></tr>`;
  }
}

async function loadFuelTab() {
  const tbody = document.getElementById('v-fuel-tbody');
  if (!tbody) return;

  try {
    const list = await API.get(`/api/fuel/vehicle/${currentVehicleId}`);
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted);">No fuel logs recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(f => `
      <tr>
        <td style="font-weight:600;">${f.fuelDate}</td>
        <td>${(f.odometerKm || 0).toLocaleString()} KM</td>
        <td>${f.fuelQuantity} L</td>
        <td>$${f.pricePerLitre}</td>
        <td style="font-weight:700;">$${f.totalCost}</td>
        <td>${escapeHtml(f.fuelStation || 'N/A')}</td>
        <td>${f.fullTank ? '<span class="badge badge-success">Full</span>' : '<span class="badge badge-secondary">Partial</span>'}</td>
        <td style="font-weight:700;color:var(--primary-orange);">${f.mileageKml ? f.mileageKml + ' KM/L' : 'Calculated next full fill'}</td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--status-danger);">Failed to load fuel records.</td></tr>`;
  }
}

async function loadInspectionsTab() {
  const tbody = document.getElementById('v-inspection-tbody');
  if (!tbody) return;

  try {
    const list = await API.get(`/api/inspections/vehicle/${currentVehicleId}`);
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">No daily inspections recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(i => {
      let stBadge = '<span class="badge badge-success">Passed</span>';
      if (i.overallStatus === 'FAILED_UNSAFE' || i.hasCriticalIssue) stBadge = '<span class="badge badge-danger">FAILED (UNSAFE)</span>';
      else if (i.overallStatus === 'NEEDS_ATTENTION') stBadge = '<span class="badge badge-warning">Needs Attention</span>';

      const itemsSummary = (i.items || []).map(it => {
        let col = 'var(--status-success)';
        if (it.status === 'CRITICAL') col = 'var(--status-danger)';
        if (it.status === 'NEEDS_ATTENTION') col = 'var(--status-warning)';
        return `<span style="font-size:0.75rem;padding:2px 6px;border-radius:4px;border:1px solid ${col};color:${col};margin-right:4px;">${escapeHtml(it.itemName)}</span>`;
      }).join(' ');

      return `
        <tr>
          <td style="font-weight:600;">${i.inspectionDate ? i.inspectionDate.replace('T', ' ').substring(0, 16) : 'N/A'}</td>
          <td>${escapeHtml(i.inspectorName || 'Assigned Driver')}</td>
          <td>${stBadge}</td>
          <td>${i.hasCriticalIssue ? '<strong style="color:var(--status-danger);">YES 🚨</strong>' : 'No'}</td>
          <td>${escapeHtml(i.generalNotes || 'Pre-trip checklist verified')}</td>
          <td>${itemsSummary}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--status-danger);">Failed to load inspections.</td></tr>`;
  }
}

async function loadHealthTab() {
  try {
    const h = await API.get(`/api/health/vehicle/${currentVehicleId}`);
    const score = h.overallScore || 90;

    document.getElementById('health-score-big').textContent = score;
    const catBadge = document.getElementById('health-cat-badge');
    catBadge.textContent = h.category || 'Good';
    catBadge.className = 'badge';
    if (score >= 85) catBadge.classList.add('badge-success');
    else if (score >= 70) catBadge.classList.add('badge-info');
    else if (score >= 50) catBadge.classList.add('badge-warning');
    else catBadge.classList.add('badge-danger');

    // Circular bar math (perimeter = 2 * PI * 54 = ~339.29)
    const circle = document.getElementById('health-circle-bar');
    if (circle) {
      const offset = 339.29 - (339.29 * score / 100);
      circle.style.strokeDashoffset = offset;
    }

    const box = document.getElementById('health-breakdown-box');
    if (box) {
      box.innerHTML = `
        <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:700;">
            <span>Maintenance Compliance (30%)</span>
            <span>${h.maintenanceComplianceScore || 100}/100</span>
          </div>
          <div style="height:6px;background:var(--border-color);border-radius:3px;margin-top:6px;overflow:hidden;">
            <div style="height:100%;width:${h.maintenanceComplianceScore || 100}%;background:var(--primary-orange);"></div>
          </div>
        </div>

        <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:700;">
            <span>Inspection Results (30%)</span>
            <span>${h.inspectionScore || 100}/100</span>
          </div>
          <div style="height:6px;background:var(--border-color);border-radius:3px;margin-top:6px;overflow:hidden;">
            <div style="height:100%;width:${h.inspectionScore || 100}%;background:var(--primary-orange);"></div>
          </div>
        </div>

        <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:700;">
            <span>Repair History Stability (20%)</span>
            <span>${h.repairFrequencyScore || 100}/100</span>
          </div>
          <div style="height:6px;background:var(--border-color);border-radius:3px;margin-top:6px;overflow:hidden;">
            <div style="height:100%;width:${h.repairFrequencyScore || 100}%;background:var(--primary-orange);"></div>
          </div>
        </div>

        <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:700;">
            <span>Overdue Penalty Deduction (20%)</span>
            <span style="color:${(h.overduePenalty || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">
              -${h.overduePenalty || 0} pts
            </span>
          </div>
        </div>

        ${h.reasons ? `
          <div style="padding:12px;background:var(--status-warning-bg);border-radius:var(--radius-md);font-size:0.82rem;color:var(--text-primary);">
            <strong>Deduction Factors:</strong> ${escapeHtml(h.reasons)}
          </div>
        ` : ''}

        ${h.recommendedActions ? `
          <div style="padding:12px;background:var(--light-orange);border-radius:var(--radius-md);font-size:0.82rem;color:var(--text-primary);">
            <strong>Recommended Manager Actions:</strong> ${escapeHtml(h.recommendedActions)}
          </div>
        ` : ''}
      `;
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadQrTab() {
  try {
    const qrData = await API.get(`/api/qr/vehicle/${currentVehicleId}`);
    const token = qrData.token || `QR-FI-${currentVehicle ? currentVehicle.registrationNumber : currentVehicleId}-SECURE`;
    const reg = currentVehicle ? currentVehicle.registrationNumber : 'FIQ';
    let qrSrc = qrData.qrCodeBase64;
    if (!qrSrc || !qrSrc.startsWith('data:image')) {
      qrSrc = generateSvgQrDataUri(token, reg);
    }
    document.getElementById('qr-image-display').src = qrSrc;
    document.getElementById('qr-token-text').textContent = token;
    document.getElementById('btn-download-qr').href = qrSrc;
    document.getElementById('btn-open-public-profile').href = `qr-view.html?token=${encodeURIComponent(token)}`;
  } catch (e) {
    showToast('Failed to load QR token: ' + e.message, 'danger');
  }
}

function generateSvgQrDataUri(token, regNumber) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="160" height="160">
    <rect width="200" height="200" fill="#ffffff" rx="8"/>
    <g fill="#171717">
      <rect x="20" y="20" width="45" height="45" rx="4"/>
      <rect x="26" y="26" width="33" height="33" fill="#ffffff" rx="2"/>
      <rect x="33" y="33" width="19" height="19" fill="#F97316" rx="2"/>
      <rect x="135" y="20" width="45" height="45" rx="4"/>
      <rect x="141" y="26" width="33" height="33" fill="#ffffff" rx="2"/>
      <rect x="148" y="33" width="19" height="19" fill="#F97316" rx="2"/>
      <rect x="20" y="135" width="45" height="45" rx="4"/>
      <rect x="26" y="141" width="33" height="33" fill="#ffffff" rx="2"/>
      <rect x="33" y="148" width="19" height="19" fill="#F97316" rx="2"/>
      <rect x="80" y="22" width="12" height="12"/>
      <rect x="98" y="22" width="16" height="12"/>
      <rect x="118" y="26" width="10" height="14"/>
      <rect x="80" y="42" width="16" height="10"/>
      <rect x="104" y="42" width="12" height="14"/>
      <rect x="86" y="68" width="28" height="10"/>
      <rect x="24" y="80" width="12" height="14"/>
      <rect x="44" y="80" width="16" height="10"/>
      <rect x="70" y="90" width="14" height="14"/>
      <rect x="94" y="90" width="14" height="20"/>
      <rect x="120" y="85" width="18" height="10"/>
      <rect x="150" y="80" width="14" height="14"/>
      <rect x="174" y="85" width="10" height="14"/>
      <rect x="80" y="120" width="14" height="14"/>
      <rect x="104" y="120" width="18" height="10"/>
      <rect x="135" y="120" width="10" height="24"/>
      <rect x="155" y="125" width="24" height="10"/>
      <rect x="80" y="145" width="18" height="10"/>
      <rect x="110" y="140" width="14" height="18"/>
      <rect x="135" y="155" width="18" height="10"/>
      <rect x="165" y="145" width="14" height="14"/>
      <rect x="80" y="165" width="34" height="14"/>
      <rect x="124" y="170" width="14" height="10"/>
      <rect x="150" y="165" width="24" height="14"/>
    </g>
    <rect x="85" y="85" width="30" height="30" fill="#FFF7ED" rx="4" stroke="#F97316" stroke-width="2"/>
    <text x="100" y="104" font-family="Inter,sans-serif" font-size="10" font-weight="900" fill="#F97316" text-anchor="middle">FIQ</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function printQrSheet() {
  window.print();
}

function openOdometerModal() {
  if (!currentVehicle) return;
  const curr = currentVehicle.currentOdometer || 0;
  document.getElementById('odo-current-val').value = curr;
  document.getElementById('odo-new-val').value = curr + 100;
  document.getElementById('odo-new-val').min = curr;
  document.getElementById('odo-notes').value = '';
  document.getElementById('odometer-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('odo-new-val').focus(), 100);
}

function closeOdometerModal() {
  const modal = document.getElementById('odometer-modal');
  if (modal) modal.style.display = 'none';
}

async function handleOdometerSubmit(e) {
  e.preventDefault();
  const newKm = parseInt(document.getElementById('odo-new-val').value);
  const notes = document.getElementById('odo-notes').value.trim();
  const curr = currentVehicle.currentOdometer || 0;

  if (isNaN(newKm) || newKm < curr) {
    showToast(`New odometer (${newKm} KM) must be ≥ current reading (${curr.toLocaleString()} KM)`, 'warning');
    return;
  }

  const saveBtn = document.getElementById('btn-save-odo');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const updated = await API.post(`/api/vehicles/${currentVehicleId}/odometer`, {
      readingKm: newKm,
      notes: notes || 'Odometer update via vehicle profile'
    });
    showToast('Odometer updated successfully!', 'success');
    closeOdometerModal();

    currentVehicle.currentOdometer = updated.currentOdometer || newKm;
    if (updated.remainingKm !== undefined) currentVehicle.remainingKm = updated.remainingKm;
    if (updated.status) currentVehicle.status = updated.status;

    renderOverviewSpecs();

    const statusEl = document.getElementById('v-hero-status');
    if (statusEl && currentVehicle.status) {
      statusEl.className = 'badge';
      if (currentVehicle.status === 'ACTIVE') { statusEl.classList.add('badge-success'); statusEl.textContent = 'Active'; }
      else if (currentVehicle.status === 'MAINTENANCE_DUE') { statusEl.classList.add('badge-warning'); statusEl.textContent = 'Maintenance Due'; }
      else if (currentVehicle.status === 'IN_SHOP') { statusEl.classList.add('badge-info'); statusEl.textContent = 'In Shop'; }
      else if (currentVehicle.status === 'UNSAFE') { statusEl.classList.add('badge-danger'); statusEl.textContent = 'UNSAFE / Grounded'; }
    }
  } catch (err) {
    showToast('Failed to update odometer: ' + err.message, 'danger');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Reading';
  }
}
