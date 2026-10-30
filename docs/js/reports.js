/**
 * FleetIQ Reports & Analytics Logic
 */

let reportChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loadVehicles();
  generateReportData();
});

async function loadVehicles() {
  try {
    const list = await API.get('/api/vehicles');
    const select = document.getElementById('report-vehicle-id');
    if (select) {
      select.innerHTML = '<option value="">All Fleet Vehicles</option>' +
        list.map(v => `<option value="${v.id}">${escapeHtml(v.registrationNumber)} (${escapeHtml(v.model)})</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

async function generateReportData() {
  const type = document.getElementById('report-type').value;
  const range = document.getElementById('report-date-range').value;
  const vehicleId = document.getElementById('report-vehicle-id').value;

  let url = `/api/reports?type=${type}&dateRange=${range}`;
  if (vehicleId) url += `&vehicleId=${vehicleId}`;

  try {
    const report = await API.get(url);

    // Populate KPIs
    document.getElementById('rep-total-cost').textContent = `$${(report.totalFleetCost || 0).toLocaleString()}`;
    document.getElementById('rep-maint-cost').textContent = `$${(report.totalMaintenanceCost || 0).toLocaleString()}`;
    document.getElementById('rep-repair-cost').textContent = `$${(report.totalRepairCost || 0).toLocaleString()}`;
    document.getElementById('rep-fuel-cost').textContent = `$${(report.totalFuelCost || 0).toLocaleString()}`;

    // Render Chart
    renderReportChart(report.chartLabels || [], report.chartValues || []);

    // Render Table
    renderReportTable(report.tableData || []);

  } catch (err) {
    showToast('Failed to compile report: ' + err.message, 'danger');
  }
}

function renderReportChart(labels, values) {
  const ctx = document.getElementById('reportChart');
  if (!ctx) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94A3B8' : '#737373';
  const gridColor = isDark ? '#334155' : '#E5E5E5';

  if (reportChartInstance) reportChartInstance.destroy();

  reportChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Vehicle Expenditure ($)',
        data: values,
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
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `$${v}` } }
      }
    }
  });
}

function renderReportTable(rows) {
  const tbody = document.getElementById('report-tbody');
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--text-muted);">No records found for the selected filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="font-weight:700;">
        <a href="vehicle-details.html?id=${r.vehicleId}" style="color:var(--primary-orange);">
          ${escapeHtml(r.registrationNumber)}
        </a>
      </td>
      <td>${escapeHtml(r.model)}</td>
      <td>${escapeHtml(r.type)}</td>
      <td><span class="badge badge-secondary">${escapeHtml(r.status)}</span></td>
      <td>${r.odometer}</td>
      <td style="color:var(--text-primary);">${r.maintenanceCost}</td>
      <td style="color:var(--text-primary);">${r.repairCost}</td>
      <td style="color:var(--text-primary);">${r.fuelCost}</td>
      <td style="font-weight:800;color:var(--primary-orange);">${r.totalExpense}</td>
    </tr>
  `).join('');
}

async function exportCsvReport() {
  const type = document.getElementById('report-type').value;
  const range = document.getElementById('report-date-range').value;
  const vehicleId = document.getElementById('report-vehicle-id').value;

  let url = `/api/reports/export?type=${type}&dateRange=${range}`;
  if (vehicleId) url += `&vehicleId=${vehicleId}`;

  try {
    showToast('Exporting verified fleet CSV ledger...', 'info');
    const token = Auth.getToken();
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) {
      throw new Error(`Export failed with HTTP status ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `FleetIQ_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    showToast('CSV ledger exported successfully!', 'success');
  } catch (err) {
    console.error('CSV Export Error:', err);
    showToast('Failed to export CSV: ' + err.message, 'danger');
  }
}
