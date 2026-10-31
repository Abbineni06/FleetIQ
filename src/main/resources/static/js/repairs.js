/**
 * FleetIQ Repairs & Breakdown Tracker Logic
 */

let allRepairs = [];
let allVehicles = [];

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('repair-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  loadVehicles();
  loadRepairs();

  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'add') {
    setTimeout(() => {
      openLogRepairModal(params.get('vehicleId'));
    }, 400);
  }
});

async function loadVehicles() {
  try {
    allVehicles = await API.get('/api/vehicles');
    const select = document.getElementById('repair-vehicle-id');
    if (select) {
      select.innerHTML = '<option value="">Select vehicle...</option>' +
        allVehicles.map(v => `<option value="${v.id}">${escapeHtml(v.registrationNumber)} - ${escapeHtml(v.make)} ${escapeHtml(v.model)}</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadRepairs() {
  try {
    const rawRepairs = await API.get('/api/repairs');
    allRepairs = Array.isArray(rawRepairs) ? rawRepairs : [];
    applyRepairFilters();
  } catch (err) {
    allRepairs = [];
    applyRepairFilters();
    showToast('Failed to load repairs: ' + err.message, 'danger');
  }
}

function applyRepairFilters() {
  const statusFilter = document.getElementById('repair-status-filter')?.value || '';
  const catFilter = document.getElementById('repair-cat-filter')?.value || '';
  const list = Array.isArray(allRepairs) ? allRepairs : [];

  const filtered = list.filter(r => {
    const matchesStatus = !statusFilter || r.repairStatus === statusFilter;
    const matchesCat = !catFilter || r.repairCategory === catFilter;
    return matchesStatus && matchesCat;
  });

  renderRepairsTable(filtered);
}

function renderRepairsTable(repairs) {
  const tbody = document.getElementById('repairs-tbody');
  const countLabel = document.getElementById('repairs-count-label');
  if (!tbody) return;

  const list = Array.isArray(repairs) ? repairs : [];

  if (countLabel) {
    const totalCount = Array.isArray(allRepairs) ? allRepairs.length : list.length;
    countLabel.textContent = `Showing ${list.length} of ${totalCount} repairs`;
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--text-muted);">No repair logs match the selected filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => {
    let stBadge = '<span class="badge badge-warning">Pending</span>';
    if (r.repairStatus === 'IN_PROGRESS') stBadge = '<span class="badge badge-info">In Shop (In Progress)</span>';
    if (r.repairStatus === 'COMPLETED') stBadge = '<span class="badge badge-success">Completed</span>';
    if (r.repairStatus === 'CANCELLED') stBadge = '<span class="badge badge-secondary">Cancelled</span>';

    return `
      <tr>
        <td>
          <a href="vehicle-details.html?id=${r.vehicleId}" style="font-weight:700;color:var(--primary-orange);">
            ${escapeHtml(r.vehicleRegistration)}
          </a>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(r.vehicleModel)}</div>
        </td>
        <td style="font-weight:600;">${r.repairDate}</td>
        <td><span class="badge badge-secondary">${escapeHtml(r.repairCategory)}</span></td>
        <td>${escapeHtml(r.problemDescription)}</td>
        <td>${escapeHtml(r.partsReplaced || 'None')}</td>
        <td style="font-weight:700;">$${(r.cost || 0).toLocaleString()}</td>
        <td>${escapeHtml(r.mechanicName || 'N/A')}</td>
        <td>${stBadge}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="openStatusModal(${r.id}, '${r.repairStatus}', ${r.cost})">
            Update
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openLogRepairModal(vehicleId) {
  document.getElementById('repair-form').reset();
  document.getElementById('repair-date').value = new Date().toISOString().split('T')[0];
  if (vehicleId) {
    document.getElementById('repair-vehicle-id').value = vehicleId;
  }
  document.getElementById('repair-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeLogRepairModal() {
  document.getElementById('repair-modal').classList.remove('active');
}

async function handleRepairSubmit(e) {
  e.preventDefault();
  const payload = {
    vehicleId: parseInt(document.getElementById('repair-vehicle-id').value),
    repairDate: document.getElementById('repair-date').value,
    repairCategory: document.getElementById('repair-category').value,
    repairStatus: document.getElementById('repair-status').value,
    problemDescription: document.getElementById('repair-problem').value.trim(),
    partsReplaced: document.getElementById('repair-parts').value.trim(),
    cost: parseFloat(document.getElementById('repair-cost').value),
    mechanicName: document.getElementById('repair-mechanic').value.trim(),
  };

  try {
    await API.post('/api/repairs', payload);
    showToast('Repair logged successfully! Vehicle status synchronized.', 'success');
    closeLogRepairModal();
    loadRepairs();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openStatusModal(id, currentStatus, currentCost) {
  document.getElementById('status-repair-id').value = id;
  document.getElementById('update-new-status').value = currentStatus;
  document.getElementById('update-final-cost').value = currentCost || '';
  document.getElementById('update-notes').value = '';
  document.getElementById('status-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeStatusModal() {
  document.getElementById('status-modal').classList.remove('active');
}

async function handleStatusSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('status-repair-id').value;
  const newStatus = document.getElementById('update-new-status').value;
  const finalCost = document.getElementById('update-final-cost').value ? parseFloat(document.getElementById('update-final-cost').value) : null;
  const notes = document.getElementById('update-notes').value.trim();

  try {
    await API.patch(`/api/repairs/${id}/status`, {
      repairStatus: newStatus,
      finalCost: finalCost,
      notes: notes,
    });
    showToast('Repair status updated and vehicle health recomputed', 'success');
    closeStatusModal();
    loadRepairs();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
