/**
 * FleetIQ Daily Vehicle Health Inspection Logic
 */

const CHECKLIST_ITEMS = [
  { name: 'Brake Condition', icon: 'disc', hint: 'Pedal firmness, pad wear, no grinding noise' },
  { name: 'Tyre Condition', icon: 'circle', hint: 'Tread depth, pressure, no sidewall bulging' },
  { name: 'Engine Oil', icon: 'droplet', hint: 'Dipstick level between min/max marks' },
  { name: 'Battery Condition', icon: 'battery-charging', hint: 'Terminals clean, voltage healthy' },
  { name: 'Headlights', icon: 'sun', hint: 'High and low beams operational' },
  { name: 'Indicators', icon: 'arrow-right-circle', hint: 'Turn signals and hazard lights working' },
  { name: 'Coolant Level', icon: 'thermometer', hint: 'Fluid in overflow reservoir full' },
  { name: 'Steering Condition', icon: 'compass', hint: 'No excessive play, hydraulic assist smooth' },
];

let allVehicles = [];
const itemStates = {};

document.addEventListener('DOMContentLoaded', () => {
  renderChecklist();
  loadVehicles();
  loadRecentInspections();

  const params = new URLSearchParams(window.location.search);
  if (params.get('vehicleId')) {
    setTimeout(() => {
      document.getElementById('insp-vehicle-id').value = params.get('vehicleId');
    }, 400);
  }
});

function renderChecklist() {
  const container = document.getElementById('checklist-container');
  if (!container) return;

  container.innerHTML = CHECKLIST_ITEMS.map((item, index) => {
    itemStates[item.name] = { status: 'GOOD', notes: '' };

    return `
      <div class="checklist-card" id="card-${index}">
        <div style="flex:1;min-width:180px;">
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:0.92rem;color:var(--text-primary);">
            <i data-lucide="${item.icon}" style="width:16px;height:16px;color:var(--primary-orange);"></i>
            ${item.name}
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${item.hint}</div>
        </div>

        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <input type="text" class="form-control" style="width:150px;padding:5px 8px;font-size:0.8rem;" placeholder="Notes (optional)" oninput="updateItemNotes('${item.name}', this.value)" />

          <div class="status-btn-group">
            <button type="button" class="status-pill-btn selected-good" id="btn-good-${index}" onclick="setItemStatus('${item.name}', 'GOOD', ${index})">
              Good
            </button>
            <button type="button" class="status-pill-btn" id="btn-att-${index}" onclick="setItemStatus('${item.name}', 'NEEDS_ATTENTION', ${index})">
              Attention
            </button>
            <button type="button" class="status-pill-btn" id="btn-crit-${index}" onclick="setItemStatus('${item.name}', 'CRITICAL', ${index})">
              Critical 🚨
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function setItemStatus(itemName, status, index) {
  itemStates[itemName].status = status;

  const btnGood = document.getElementById(`btn-good-${index}`);
  const btnAtt = document.getElementById(`btn-att-${index}`);
  const btnCrit = document.getElementById(`btn-crit-${index}`);

  btnGood.className = 'status-pill-btn';
  btnAtt.className = 'status-pill-btn';
  btnCrit.className = 'status-pill-btn';

  if (status === 'GOOD') btnGood.classList.add('selected-good');
  if (status === 'NEEDS_ATTENTION') btnAtt.classList.add('selected-attention');
  if (status === 'CRITICAL') btnCrit.classList.add('selected-critical');
}

function updateItemNotes(itemName, notes) {
  if (itemStates[itemName]) {
    itemStates[itemName].notes = notes;
  }
}

async function loadVehicles() {
  try {
    allVehicles = await API.get('/api/vehicles');
    const select = document.getElementById('insp-vehicle-id');
    if (select) {
      select.innerHTML = '<option value="">Choose vehicle...</option>' +
        allVehicles.map(v => `<option value="${v.id}">${escapeHtml(v.registrationNumber)} (${escapeHtml(v.model)}) - Current: ${v.status}</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

function formatTimeAgoSafe(dateString) {
  if (typeof formatTimeAgo === 'function') {
    try { return formatTimeAgo(dateString); } catch (e) {}
  }
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {}
  return String(dateString);
}

async function loadRecentInspections() {
  const container = document.getElementById('recent-inspections-list');
  if (!container) return;

  try {
    const rawList = await API.get('/api/inspections/recent');
    const list = Array.isArray(rawList) ? rawList : [];
    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No inspections logged yet.</div>`;
      return;
    }

    container.innerHTML = list.map(i => {
      let statusBadge = '<span class="badge badge-success">Passed</span>';
      if (i.hasCriticalIssue || i.overallStatus === 'FAILED_UNSAFE') {
        statusBadge = '<span class="badge badge-danger">FAILED (UNSAFE)</span>';
      } else if (i.overallStatus === 'NEEDS_ATTENTION') {
        statusBadge = '<span class="badge badge-warning">Needs Attention</span>';
      }

      const notes = i.generalNotes || i.comments || 'Pre-trip checklist completed';
      const timeStr = formatTimeAgoSafe(i.inspectionDate);

      return `
        <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:14px;border:1px solid var(--border-light);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <a href="vehicle-details.html?id=${i.vehicleId}" style="font-weight:700;color:var(--text-primary);font-size:0.92rem;">
              ${escapeHtml(i.vehicleRegistration)}
            </a>
            ${statusBadge}
          </div>
          <div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:6px;">
            ${escapeHtml(notes)}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);">
            <span>Inspector: ${escapeHtml(i.inspectorName || 'Driver')}</span>
            <span>${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<div style="text-align:center;color:var(--status-danger);">Failed to load inspections.</div>`;
  }
}

async function handleInspectionSubmit(e) {
  e.preventDefault();
  const vId = document.getElementById('insp-vehicle-id').value;
  if (!vId) {
    showToast('Please select a vehicle to inspect', 'warning');
    return;
  }

  const items = Object.keys(itemStates).map(name => ({
    itemName: name,
    status: itemStates[name].status,
    notes: itemStates[name].notes,
  }));

  const hasCrit = items.some(it => it.status === 'CRITICAL');

  const payload = {
    vehicleId: parseInt(vId),
    generalNotes: document.getElementById('insp-general-notes').value.trim(),
    items: items,
  };

  try {
    const res = await API.post('/api/inspections', payload);

    if (hasCrit) {
      showToast('CRITICAL DEFECT DETECTED: Vehicle marked UNSAFE and grounded!', 'danger', 6000);
    } else {
      showToast('Daily inspection submitted successfully!', 'success');
    }

    document.getElementById('insp-general-notes').value = '';
    renderChecklist();
    loadRecentInspections();
    loadVehicles();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
