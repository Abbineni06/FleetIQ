/**
 * FleetIQ Vehicles Management Logic
 */

let allVehicles = [];
let debounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDrivers();
  loadVehicles();

  // Check URL params for action=register or search
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'register') {
    openRegisterModal();
  }
  if (params.get('search')) {
    const input = document.getElementById('vehicle-search');
    if (input) {
      input.value = params.get('search');
    }
  }
});

async function loadDrivers() {
  try {
    const drivers = await API.get('/api/auth/drivers');
    const select = document.getElementById('assigned-driver');
    if (select) {
      select.innerHTML = '<option value="">Unassigned</option>' +
        drivers.map(d => `<option value="${d.id}">${escapeHtml(d.fullName)} (${escapeHtml(d.username)})</option>`).join('');
    }
  } catch (e) {
    console.warn('Could not load drivers list', e);
  }
}

async function loadVehicles() {
  try {
    allVehicles = await API.get('/api/vehicles');
    applyFilters();
  } catch (err) {
    showToast('Failed to load vehicles: ' + err.message, 'danger');
  }
}

function debounceSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    applyFilters();
  }, 250);
}

function applyFilters() {
  const searchQuery = (document.getElementById('vehicle-search')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('status-filter')?.value || '';
  const typeFilter = document.getElementById('type-filter')?.value || '';

  const filtered = allVehicles.filter(v => {
    const matchesSearch = !searchQuery ||
      v.registrationNumber.toLowerCase().includes(searchQuery) ||
      v.make.toLowerCase().includes(searchQuery) ||
      v.model.toLowerCase().includes(searchQuery) ||
      (v.vin && v.vin.toLowerCase().includes(searchQuery));

    const matchesStatus = !statusFilter || v.status === statusFilter;
    const matchesType = !typeFilter || v.vehicleType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  renderVehiclesTable(filtered);
}

function renderVehiclesTable(vehicles) {
  const tbody = document.getElementById('vehicles-tbody');
  const countLabel = document.getElementById('vehicle-count-label');
  if (!tbody) return;

  if (countLabel) {
    countLabel.textContent = `Showing ${vehicles.length} of ${allVehicles.length} fleet vehicles`;
  }

  if (vehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">No vehicles match your search criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = vehicles.map(v => {
    let statusBadge = '<span class="badge badge-success">Active</span>';
    if (v.status === 'MAINTENANCE_DUE') statusBadge = '<span class="badge badge-warning">Service Due</span>';
    if (v.status === 'IN_SHOP') statusBadge = '<span class="badge badge-info">In Shop</span>';
    if (v.status === 'UNSAFE') statusBadge = '<span class="badge badge-danger">UNSAFE</span>';
    if (v.status === 'RETIRED') statusBadge = '<span class="badge badge-secondary">Retired</span>';

    const health = v.healthScore != null ? v.healthScore : 90;
    let healthColor = 'var(--status-success)';
    if (v.status === 'UNSAFE' || health < 50) healthColor = 'var(--status-danger)';
    else if (health < 70) healthColor = 'var(--status-warning)';
    else if (health < 85) healthColor = 'var(--status-info)';

    const defaultImg = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80';
    const thumb = v.imageUrl || defaultImg;

    const remKm = (v.remainingKm !== undefined && v.remainingKm !== null)
      ? v.remainingKm
      : ((v.nextServiceKm != null && v.currentOdometer != null) ? (v.nextServiceKm - v.currentOdometer) : 0);
    const isOverdue = remKm <= 0 || v.status === 'MAINTENANCE_DUE';
    const remColor = (remKm <= 500 || isOverdue) ? 'var(--status-danger)' : 'var(--text-muted)';
    const remWeight = (remKm <= 500 || isOverdue) ? '700' : '400';
    const remText = isOverdue
      ? (remKm < 0 ? `${Math.abs(remKm).toLocaleString()} KM OVERDUE` : 'MAINTENANCE DUE')
      : `${(remKm || 0).toLocaleString()} KM left`;

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${thumb}" alt="${escapeHtml(v.model)}" style="width:48px;height:36px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border-color);" onerror="this.src='${defaultImg}'" />
            <div>
              <a href="vehicle-details.html?id=${v.id}" style="font-weight:700;color:var(--text-primary);font-size:0.95rem;">
                ${escapeHtml(v.registrationNumber)}
              </a>
              <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(v.make)} ${escapeHtml(v.model)} (${v.manufactureYear})</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:500;">${escapeHtml(v.vehicleType)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(v.fuelType)}</div>
        </td>
        <td>
          ${v.assignedDriverName ? `<span style="font-weight:500;">${escapeHtml(v.assignedDriverName)}</span>` : '<span style="color:var(--text-muted);font-style:italic;">Unassigned</span>'}
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-weight:600;">${(v.currentOdometer || 0).toLocaleString()} KM</span>
            <button class="btn btn-sm btn-secondary" style="padding:2px 6px;" title="Update Odometer" onclick="openOdometerModal(${v.id}, '${escapeHtml(v.registrationNumber)}', ${v.currentOdometer || 0})">
              <i data-lucide="gauge" style="width:12px;height:12px;"></i>
            </button>
          </div>
        </td>
        <td>
          <div>${(v.nextServiceKm || 0).toLocaleString()} KM</div>
          <div style="font-size:0.72rem;color:${remColor};font-weight:${remWeight};">
            ${remText}
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:36px;height:36px;border-radius:50%;border:3px solid ${healthColor};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.78rem;color:${healthColor};">
              ${health}
            </div>
            <div style="font-size:0.75rem;color:var(--text-secondary);">${v.healthCategory || 'Good'}</div>
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <a href="vehicle-details.html?id=${v.id}" class="btn btn-sm btn-secondary" title="View Full Details">
              <i data-lucide="eye" style="width:14px;height:14px;"></i>
            </a>
            <a href="vehicle-details.html?id=${v.id}&tab=qr" class="btn btn-sm btn-secondary" title="View QR Code">
              <i data-lucide="qr-code" style="width:14px;height:14px;"></i>
            </a>
            <button class="btn btn-sm btn-secondary" title="Edit Vehicle" onclick="editVehicle(${v.id})">
              <i data-lucide="edit-2" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function openRegisterModal() {
  document.getElementById('edit-vehicle-id').value = '';
  document.getElementById('modal-title-text').innerHTML = `<i data-lucide="truck" style="color:var(--primary-orange);"></i> Register New Vehicle`;
  document.getElementById('vehicle-form').reset();
  document.getElementById('reg-number').disabled = false;
  document.getElementById('register-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeRegisterModal() {
  document.getElementById('register-modal').classList.remove('active');
}

function editVehicle(id) {
  const v = allVehicles.find(x => x.id === id);
  if (!v) return;

  document.getElementById('edit-vehicle-id').value = v.id;
  document.getElementById('modal-title-text').innerHTML = `<i data-lucide="edit-2" style="color:var(--primary-orange);"></i> Edit Vehicle ${escapeHtml(v.registrationNumber)}`;
  document.getElementById('reg-number').value = v.registrationNumber;
  document.getElementById('reg-number').disabled = true;
  document.getElementById('vin').value = v.vin || '';
  document.getElementById('make').value = v.make;
  document.getElementById('model').value = v.model;
  document.getElementById('year').value = v.manufactureYear;
  document.getElementById('vehicle-type').value = v.vehicleType;
  document.getElementById('fuel-type').value = v.fuelType;
  document.getElementById('assigned-driver').value = v.assignedDriverId || '';
  document.getElementById('current-odometer').value = v.currentOdometer;
  document.getElementById('last-service-km').value = v.lastServiceKm || '';
  document.getElementById('service-interval').value = v.serviceIntervalKm || 10000;
  document.getElementById('image-url').value = v.imageUrl || '';

  document.getElementById('register-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

async function handleVehicleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-vehicle-id').value;

  const payload = {
    registrationNumber: document.getElementById('reg-number').value.trim(),
    vin: document.getElementById('vin').value.trim(),
    make: document.getElementById('make').value.trim(),
    model: document.getElementById('model').value.trim(),
    manufactureYear: parseInt(document.getElementById('year').value),
    vehicleType: document.getElementById('vehicle-type').value,
    fuelType: document.getElementById('fuel-type').value,
    assignedDriverId: document.getElementById('assigned-driver').value ? parseInt(document.getElementById('assigned-driver').value) : null,
    currentOdometer: parseInt(document.getElementById('current-odometer').value),
    lastServiceKm: document.getElementById('last-service-km').value ? parseInt(document.getElementById('last-service-km').value) : 0,
    serviceIntervalKm: parseInt(document.getElementById('service-interval').value),
    imageUrl: document.getElementById('image-url').value.trim(),
  };

  try {
    if (id) {
      await API.put(`/api/vehicles/${id}`, payload);
      showToast('Vehicle successfully updated', 'success');
    } else {
      await API.post('/api/vehicles', payload);
      showToast('Vehicle registered with automatic QR code', 'success');
    }
    closeRegisterModal();
    loadVehicles();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openOdometerModal(id, regNumber, currentKm) {
  document.getElementById('odo-vehicle-id').value = id;
  document.getElementById('odo-vehicle-reg').textContent = regNumber;
  document.getElementById('odo-current-val').textContent = (currentKm || 0).toLocaleString();
  const input = document.getElementById('new-odometer-val');
  input.value = currentKm || 0;
  input.min = currentKm || 0;
  document.getElementById('odo-notes').value = '';
  document.getElementById('odometer-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeOdometerModal() {
  document.getElementById('odometer-modal').classList.remove('active');
}

async function handleOdometerSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('odo-vehicle-id').value;
  const newKm = parseInt(document.getElementById('new-odometer-val').value);
  const notes = document.getElementById('odo-notes').value.trim();

  try {
    await API.post(`/api/vehicles/${id}/odometer`, { readingKm: newKm, notes });
    showToast('Odometer updated and service thresholds synchronized', 'success');
    closeOdometerModal();
    loadVehicles();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
