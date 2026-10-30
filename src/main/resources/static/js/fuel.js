/**
 * FleetIQ Fuel Monitoring & Analytics Logic
 */

let allFuelRecords = [];
let allVehicles = [];
let comparisonChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('fuel-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  loadVehicles();
  loadFuelData();

  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'add') {
    setTimeout(() => {
      openAddFuelModal(params.get('vehicleId'));
    }, 400);
  }
});

async function loadVehicles() {
  try {
    allVehicles = await API.get('/api/vehicles');
    const select = document.getElementById('fuel-vehicle-id');
    if (select) {
      select.innerHTML = '<option value="">Select vehicle...</option>' +
        allVehicles.map(v => `<option value="${v.id}">${escapeHtml(v.registrationNumber)} (${escapeHtml(v.model)})</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadFuelData() {
  try {
    allFuelRecords = await API.get('/api/fuel');
    const comparison = await API.get('/api/fuel/comparison');

    // Aggregate KPIs
    let totalL = 0;
    let totalCost = 0;
    allFuelRecords.forEach(f => {
      totalL += parseFloat(f.fuelQuantity || 0);
      totalCost += parseFloat(f.totalCost || 0);
    });

    const avgPrice = totalL > 0 ? (totalCost / totalL) : 0;
    const validMileages = allFuelRecords.filter(f => f.mileageKml > 0).map(f => f.mileageKml);
    const avgKml = validMileages.length > 0 ? (validMileages.reduce((a, b) => a + b, 0) / validMileages.length) : 0;

    document.getElementById('kpi-avg-kml').textContent = avgKml > 0 ? `${avgKml.toFixed(2)} KM/L` : 'N/A';
    document.getElementById('kpi-total-litres').textContent = `${Math.round(totalL).toLocaleString()} L`;
    document.getElementById('kpi-total-fuel-cost').textContent = `$${Math.round(totalCost).toLocaleString()}`;
    document.getElementById('kpi-avg-price').textContent = `$${avgPrice.toFixed(2)}`;

    // Render comparison chart
    renderComparisonChart(comparison);

    // Render table
    renderFuelTable(allFuelRecords);

  } catch (err) {
    showToast('Failed to load fuel records: ' + err.message, 'danger');
  }
}

function renderComparisonChart(comparisonData) {
  const ctx = document.getElementById('fuelComparisonChart');
  if (!ctx || !comparisonData) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94A3B8' : '#737373';
  const gridColor = isDark ? '#334155' : '#E5E5E5';

  if (comparisonChartInstance) comparisonChartInstance.destroy();

  comparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: comparisonData.map(c => c.registrationNumber),
      datasets: [{
        label: 'Average Mileage (KM/L)',
        data: comparisonData.map(c => c.avgMileageKml || 0),
        backgroundColor: '#F97316',
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Inter', weight: 500 } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, callback: v => `${v} KM/L` }
        }
      }
    }
  });
}

function renderFuelTable(records) {
  const tbody = document.getElementById('fuel-records-tbody');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--text-muted);">No fuel logs recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(f => `
    <tr>
      <td style="font-weight:600;">${f.fuelDate}</td>
      <td>
        <a href="/vehicle-details.html?id=${f.vehicleId}" style="font-weight:700;color:var(--primary-orange);">
          ${escapeHtml(f.vehicleRegistration)}
        </a>
        <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(f.vehicleModel)}</div>
      </td>
      <td>${(f.odometerKm || 0).toLocaleString()} KM</td>
      <td>${f.fuelQuantity} L</td>
      <td>$${f.pricePerLitre}</td>
      <td style="font-weight:700;">$${f.totalCost}</td>
      <td>${escapeHtml(f.fuelStation || 'N/A')}</td>
      <td>${f.fullTank ? '<span class="badge badge-success">Full</span>' : '<span class="badge badge-secondary">Partial</span>'}</td>
      <td style="font-weight:700;color:var(--primary-orange);">
        ${f.mileageKml ? `${f.mileageKml} KM/L` : '<span style="color:var(--text-muted);font-weight:400;font-size:0.8rem;">Pending next fill</span>'}
      </td>
    </tr>
  `).join('');
}

function openAddFuelModal(vehicleId) {
  document.getElementById('fuel-form').reset();
  document.getElementById('fuel-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('fuel-full-tank').checked = true;

  if (vehicleId) {
    document.getElementById('fuel-vehicle-id').value = vehicleId;
    updateFuelCurrentOdo();
  }

  document.getElementById('fuel-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeAddFuelModal() {
  document.getElementById('fuel-modal').classList.remove('active');
}

function updateFuelCurrentOdo() {
  const vId = document.getElementById('fuel-vehicle-id').value;
  const v = allVehicles.find(x => x.id == vId);
  const hint = document.getElementById('fuel-current-odo-hint');
  const input = document.getElementById('fuel-odometer');

  if (v) {
    if (hint) hint.textContent = (v.currentOdometer || 0).toLocaleString();
    if (input) {
      input.value = v.currentOdometer || 0;
      input.min = v.currentOdometer || 0;
    }
  }
}

function calculateTotalFuelCost() {
  const qty = parseFloat(document.getElementById('fuel-qty').value) || 0;
  const price = parseFloat(document.getElementById('fuel-price').value) || 0;
  const total = (qty * price).toFixed(2);
  document.getElementById('fuel-total-cost').value = total;
}

async function handleFuelSubmit(e) {
  e.preventDefault();
  const payload = {
    vehicleId: parseInt(document.getElementById('fuel-vehicle-id').value),
    fuelDate: document.getElementById('fuel-date').value,
    odometerKm: parseInt(document.getElementById('fuel-odometer').value),
    fuelQuantity: parseFloat(document.getElementById('fuel-qty').value),
    pricePerLitre: parseFloat(document.getElementById('fuel-price').value),
    fuelStation: document.getElementById('fuel-station').value.trim(),
    fullTank: document.getElementById('fuel-full-tank').checked,
    notes: document.getElementById('fuel-notes').value.trim(),
  };

  try {
    await API.post('/api/fuel', payload);
    showToast('Fuel log saved successfully! Vehicle odometer updated.', 'success');
    closeAddFuelModal();
    loadVehicles();
    loadFuelData();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
