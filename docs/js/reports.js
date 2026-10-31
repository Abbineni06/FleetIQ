/**
 * FleetIQ Reports & Analytics Logic
 */

let reportChartInstance = null;
let currentReportData = null;

document.addEventListener('DOMContentLoaded', () => {
  loadVehicles();
  generateReportData();
});

async function loadVehicles() {
  try {
    const list = await API.get('/api/vehicles');
    const select = document.getElementById('report-vehicle-id');
    if (select && Array.isArray(list)) {
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
    currentReportData = report;

    // Populate KPIs
    document.getElementById('rep-total-cost').textContent = `$${(report.totalFleetCost || 0).toLocaleString()}`;
    document.getElementById('rep-maint-cost').textContent = `$${(report.totalMaintenanceCost || 0).toLocaleString()}`;
    document.getElementById('rep-repair-cost').textContent = `$${(report.totalRepairCost || 0).toLocaleString()}`;
    document.getElementById('rep-fuel-cost').textContent = `$${(report.totalFuelCost || 0).toLocaleString()}`;

    // Update Titles & Labels
    updateReportHeadings(type);

    // Render Chart
    renderReportChart(report.chartLabels || [], report.chartValues || [], type);

    // Render Table
    renderReportTable(report.tableData || [], type);

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    showToast('Failed to compile report: ' + err.message, 'danger');
  }
}

function updateReportHeadings(type) {
  const chartTitle = document.getElementById('report-chart-title');
  const tableTitle = document.getElementById('report-table-title');

  if (type === 'FUEL_EXPENSE') {
    if (chartTitle) chartTitle.innerHTML = '<i data-lucide="fuel" style="color:var(--primary-orange);width:18px;height:18px;"></i> Vehicle Fuel Consumption & Expense Breakdown ($)';
    if (tableTitle) tableTitle.innerHTML = '<i data-lucide="table" style="color:var(--primary-orange);width:18px;height:18px;"></i> Dedicated Vehicle Fuel Ledger';
  } else if (type === 'ANNUAL_MAINTENANCE') {
    if (chartTitle) chartTitle.innerHTML = '<i data-lucide="sparkles" style="color:var(--primary-orange);width:18px;height:18px;"></i> Scheduled Preventive Maintenance Expenses ($)';
    if (tableTitle) tableTitle.innerHTML = '<i data-lucide="table" style="color:var(--primary-orange);width:18px;height:18px;"></i> Scheduled Maintenance Service Ledger';
  } else if (type === 'ANNUAL_REPAIRS') {
    if (chartTitle) chartTitle.innerHTML = '<i data-lucide="wrench" style="color:var(--primary-orange);width:18px;height:18px;"></i> Unscheduled Breakdown & Repair Expenses ($)';
    if (tableTitle) tableTitle.innerHTML = '<i data-lucide="table" style="color:var(--primary-orange);width:18px;height:18px;"></i> Workshop Repair Work Order Ledger';
  } else {
    if (chartTitle) chartTitle.innerHTML = '<i data-lucide="bar-chart" style="color:var(--primary-orange);width:18px;height:18px;"></i> Total Vehicle Expenditure Distribution ($)';
    if (tableTitle) tableTitle.innerHTML = '<i data-lucide="table" style="color:var(--primary-orange);width:18px;height:18px;"></i> Detailed Fleet Financial Ledger';
  }
}

function renderReportChart(labels, values, type) {
  const ctx = document.getElementById('reportChart');
  if (!ctx) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94A3B8' : '#737373';
  const gridColor = isDark ? '#334155' : '#E5E5E5';

  let datasetLabel = 'Total Expenditure ($)';
  if (type === 'FUEL_EXPENSE') datasetLabel = 'Fuel Expense ($)';
  else if (type === 'ANNUAL_MAINTENANCE') datasetLabel = 'Maintenance Cost ($)';
  else if (type === 'ANNUAL_REPAIRS') datasetLabel = 'Repair Cost ($)';

  if (reportChartInstance) reportChartInstance.destroy();

  reportChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: datasetLabel,
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
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor, callback: v => `$${v}` }
        }
      }
    }
  });
}

function renderReportTable(rows, type) {
  const thead = document.getElementById('report-thead');
  const tbody = document.getElementById('report-tbody');
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--text-muted);">No records found for the selected filter criteria.</td></tr>`;
    return;
  }

  // 1. FUEL_EXPENSE: Show only fuel relevant columns
  if (type === 'FUEL_EXPENSE') {
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>Registration</th>
          <th>Vehicle Model</th>
          <th>Vehicle Type</th>
          <th>Fuel Type</th>
          <th>Status</th>
          <th>Current Odometer</th>
          <th>Average Mileage</th>
          <th>Fuel Expense</th>
        </tr>
      `;
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
        <td><span class="badge badge-secondary">${escapeHtml(r.fuelType || 'Diesel')}</span></td>
        <td><span class="badge badge-secondary">${escapeHtml(r.status)}</span></td>
        <td>${escapeHtml(r.odometer)}</td>
        <td style="font-weight:600;color:var(--text-primary);">${escapeHtml(r.avgMileageKml || '4.50 KM/L')}</td>
        <td style="font-weight:800;color:var(--primary-orange);">${escapeHtml(r.fuelCost)}</td>
      </tr>
    `).join('');
    return;
  }

  // 2. ANNUAL_MAINTENANCE: Show maintenance relevant columns
  if (type === 'ANNUAL_MAINTENANCE') {
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>Registration</th>
          <th>Vehicle Model</th>
          <th>Vehicle Type</th>
          <th>Status</th>
          <th>Current Odometer</th>
          <th>Maintenance Cost</th>
        </tr>
      `;
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
        <td>${escapeHtml(r.odometer)}</td>
        <td style="font-weight:800;color:var(--primary-orange);">${escapeHtml(r.maintenanceCost)}</td>
      </tr>
    `).join('');
    return;
  }

  // 3. ANNUAL_REPAIRS: Show repair relevant columns
  if (type === 'ANNUAL_REPAIRS') {
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>Registration</th>
          <th>Vehicle Model</th>
          <th>Vehicle Type</th>
          <th>Status</th>
          <th>Current Odometer</th>
          <th>Repair Cost</th>
        </tr>
      `;
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
        <td>${escapeHtml(r.odometer)}</td>
        <td style="font-weight:800;color:var(--primary-orange);">${escapeHtml(r.repairCost)}</td>
      </tr>
    `).join('');
    return;
  }

  // 4. TOTAL_EXPENDITURE: Show comprehensive columns
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th>Registration</th>
        <th>Vehicle Model</th>
        <th>Vehicle Type</th>
        <th>Status</th>
        <th>Current Odometer</th>
        <th>Maintenance Cost</th>
        <th>Repair Cost</th>
        <th>Fuel Cost</th>
        <th>Total Cost</th>
      </tr>
    `;
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
      <td>${escapeHtml(r.odometer)}</td>
      <td style="color:var(--text-primary);">${escapeHtml(r.maintenanceCost)}</td>
      <td style="color:var(--text-primary);">${escapeHtml(r.repairCost)}</td>
      <td style="color:var(--text-primary);">${escapeHtml(r.fuelCost)}</td>
      <td style="font-weight:800;color:var(--primary-orange);">${escapeHtml(r.totalExpense)}</td>
    </tr>
  `).join('');
}

async function exportCsvReport() {
  const type = document.getElementById('report-type').value;
  const range = document.getElementById('report-date-range').value;
  const vehicleId = document.getElementById('report-vehicle-id').value;

  const isStaticSite = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';

  // Client-Side CSV Generator
  function downloadClientCsv() {
    if (!currentReportData || !currentReportData.tableData) {
      showToast('No report data available to export', 'warning');
      return;
    }

    let csvContent = "";
    const rows = currentReportData.tableData;

    if (type === 'FUEL_EXPENSE') {
      csvContent += "Registration Number,Vehicle Model,Type,Fuel Type,Status,Current Odometer,Average Mileage,Fuel Expense\n";
      rows.forEach(r => {
        csvContent += `"${r.registrationNumber}","${r.model}","${r.type}","${r.fuelType || 'Diesel'}","${r.status}","${r.odometer}","${r.avgMileageKml || 'N/A'}","${r.fuelCost}"\n`;
      });
    } else if (type === 'ANNUAL_MAINTENANCE') {
      csvContent += "Registration Number,Vehicle Model,Type,Status,Current Odometer,Maintenance Cost\n";
      rows.forEach(r => {
        csvContent += `"${r.registrationNumber}","${r.model}","${r.type}","${r.status}","${r.odometer}","${r.maintenanceCost}"\n`;
      });
    } else if (type === 'ANNUAL_REPAIRS') {
      csvContent += "Registration Number,Vehicle Model,Type,Status,Current Odometer,Repair Cost\n";
      rows.forEach(r => {
        csvContent += `"${r.registrationNumber}","${r.model}","${r.type}","${r.status}","${r.odometer}","${r.repairCost}"\n`;
      });
    } else {
      csvContent += "Registration Number,Vehicle Model,Type,Status,Current Odometer,Maintenance Cost,Repair Cost,Fuel Cost,Total Cost\n";
      rows.forEach(r => {
        csvContent += `"${r.registrationNumber}","${r.model}","${r.type}","${r.status}","${r.odometer}","${r.maintenanceCost}","${r.repairCost}","${r.fuelCost}","${r.totalExpense}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `FleetIQ_${type}_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    showToast('Verified CSV report downloaded successfully!', 'success');
  }

  if (isStaticSite) {
    downloadClientCsv();
    return;
  }

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
      throw new Error(`Export returned status ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `FleetIQ_${type}_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    showToast('CSV ledger exported successfully!', 'success');
  } catch (err) {
    console.warn('Backend CSV export error, falling back to client CSV generator:', err);
    downloadClientCsv();
  }
}
