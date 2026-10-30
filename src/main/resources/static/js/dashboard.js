/**
 * FleetIQ Dashboard Module Logic
 * Fetches verified fleet summary data, renders 6 Chart.js graphs, upcoming maintenance, and activity logs
 */

let expensesChartInstance = null;
let fuelChartInstance = null;
let healthDistChartInstance = null;
let statusDistChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Update personalized greeting & subtitle by role
  const user = Auth.getUser() || { role: 'ROLE_ADMIN', fullName: 'Fleet User' };
  const greetingEl = document.getElementById('greeting-title');
  const subtitleEl = document.getElementById('greeting-subtitle');
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : (hour < 18 ? 'Good Afternoon' : 'Good Evening');

  if (greetingEl) {
    greetingEl.textContent = `${timeGreeting}, ${user.fullName || user.username}`;
  }

  if (subtitleEl) {
    if (user.role === 'ROLE_DRIVER') {
      subtitleEl.textContent = "Driver Dispatch Hub: Complete pre-trip inspections, record fuel stops, and monitor service countdowns.";
    } else if (user.role === 'ROLE_MANAGER') {
      subtitleEl.textContent = "Operations Command: Monitor driver assignments, schedule services, and prevent vehicle downtime.";
    } else {
      subtitleEl.textContent = "Enterprise Fleet Overview: Real-time predictive maintenance, health scoring, and financial operations.";
    }
  }

  renderQuickActions(user.role);
  loadDashboardData();
});

function renderQuickActions(role) {
  const container = document.getElementById('dashboard-actions');
  if (!container) return;

  if (role === 'ROLE_DRIVER') {
    container.innerHTML = `
      <a href="inspections.html?action=new" class="btn btn-primary btn-sm">
        <i data-lucide="clipboard-check" style="width:16px;height:16px;"></i> Pre-Trip Inspection
      </a>
      <a href="fuel.html?action=add" class="btn btn-secondary btn-sm">
        <i data-lucide="fuel" style="width:16px;height:16px;"></i> Log Fuel Stop
      </a>
      <a href="maintenance.html" class="btn btn-secondary btn-sm">
        <i data-lucide="sparkles" style="width:16px;height:16px;"></i> Service Countdown
      </a>
      <a href="qr-history.html" class="btn btn-secondary btn-sm">
        <i data-lucide="qr-code" style="width:16px;height:16px;"></i> My QR Pass
      </a>
    `;
  } else if (role === 'ROLE_MANAGER') {
    container.innerHTML = `
      <a href="vehicles.html" class="btn btn-primary btn-sm">
        <i data-lucide="users" style="width:16px;height:16px;"></i> Assign Drivers
      </a>
      <a href="maintenance.html?action=schedule" class="btn btn-secondary btn-sm">
        <i data-lucide="calendar" style="width:16px;height:16px;"></i> Schedule Maintenance
      </a>
      <a href="repairs.html" class="btn btn-secondary btn-sm">
        <i data-lucide="wrench" style="width:16px;height:16px;"></i> Workshop Repairs
      </a>
      <a href="inspections.html" class="btn btn-secondary btn-sm">
        <i data-lucide="clipboard-check" style="width:16px;height:16px;"></i> Inspect Fleet
      </a>
    `;
  } else {
    // Admin
    container.innerHTML = `
      <a href="vehicles.html?action=register" class="btn btn-primary btn-sm">
        <i data-lucide="plus-circle" style="width:16px;height:16px;"></i> Register Vehicle
      </a>
      <a href="maintenance.html?action=schedule" class="btn btn-secondary btn-sm">
        <i data-lucide="calendar" style="width:16px;height:16px;"></i> Schedule Service
      </a>
      <a href="fuel.html?action=add" class="btn btn-secondary btn-sm">
        <i data-lucide="fuel" style="width:16px;height:16px;"></i> Add Fuel Record
      </a>
      <a href="reports.html" class="btn btn-secondary btn-sm">
        <i data-lucide="bar-chart-3" style="width:16px;height:16px;"></i> Executive Ledger
      </a>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

async function loadDashboardData() {
  try {
    const data = await API.get('/api/dashboard/summary');

    // 1. Populate KPIs
    if (data.kpis) {
      document.getElementById('kpi-total-vehicles').textContent = data.kpis.totalVehicles || 0;
      document.getElementById('kpi-active-vehicles').textContent = data.kpis.activeVehicles || 0;
      document.getElementById('kpi-due-vehicles').textContent = data.kpis.maintenanceDueVehicles || 0;
      document.getElementById('kpi-shop-vehicles').textContent = data.kpis.inShopVehicles || 0;
      document.getElementById('kpi-avg-health').textContent = `${data.kpis.averageFleetHealth || 88}%`;
      document.getElementById('kpi-monthly-expenses').textContent = `$${(data.kpis.monthlyExpenses || 0).toLocaleString()}`;
    }

    // 2. Render Charts
    if (data.charts) {
      renderCharts(data.charts);
    }

    // 3. Render Upcoming Maintenance
    renderUpcomingMaintenance(data.upcomingMaintenance || []);

    // 4. Render Recent Activities
    renderRecentActivities(data.recentActivities || []);

  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    showToast('Failed to load live dashboard statistics', 'danger');
  }
}

function renderCharts(charts) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94A3B8' : '#737373';
  const gridColor = isDark ? '#334155' : '#E5E5E5';

  // Chart 1: Maintenance vs Repair Expenses
  const expCtx = document.getElementById('expensesChart');
  if (expCtx) {
    if (expensesChartInstance) expensesChartInstance.destroy();
    expensesChartInstance = new Chart(expCtx, {
      type: 'bar',
      data: {
        labels: charts.monthLabels,
        datasets: [
          {
            label: 'Scheduled Maintenance',
            data: charts.monthlyMaintenanceExpenses,
            backgroundColor: '#F97316',
            borderRadius: 6,
          },
          {
            label: 'Unscheduled Repairs',
            data: charts.monthlyRepairExpenses,
            backgroundColor: '#FB923C',
            borderRadius: 6,
          }
        ]
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

  // Chart 2: Fuel Expenditure
  const fuelCtx = document.getElementById('fuelChart');
  if (fuelCtx) {
    if (fuelChartInstance) fuelChartInstance.destroy();
    fuelChartInstance = new Chart(fuelCtx, {
      type: 'line',
      data: {
        labels: charts.monthLabels,
        datasets: [
          {
            label: 'Fuel Expenses ($)',
            data: charts.monthlyFuelExpenses,
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#F97316',
            pointRadius: 4,
          }
        ]
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

  // Chart 3: Health Distribution (Doughnut)
  const healthCtx = document.getElementById('healthDistChart');
  if (healthCtx && charts.healthDistribution) {
    if (healthDistChartInstance) healthDistChartInstance.destroy();
    healthDistChartInstance = new Chart(healthCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(charts.healthDistribution),
        datasets: [{
          data: Object.values(charts.healthDistribution),
          backgroundColor: ['#16A34A', '#0284C7', '#EAB308', '#F97316', '#DC2626'],
          borderWidth: 2,
          borderColor: isDark ? '#1E293B' : '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: textColor, font: { family: 'Inter', size: 11 } } }
        },
        cutout: '65%'
      }
    });
  }

  // Chart 4: Operational Status Distribution
  const statusCtx = document.getElementById('statusDistChart');
  if (statusCtx && charts.statusDistribution) {
    if (statusDistChartInstance) statusDistChartInstance.destroy();
    statusDistChartInstance = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(charts.statusDistribution),
        datasets: [{
          data: Object.values(charts.statusDistribution),
          backgroundColor: ['#16A34A', '#EAB308', '#0284C7', '#DC2626'],
          borderWidth: 2,
          borderColor: isDark ? '#1E293B' : '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: textColor, font: { family: 'Inter', size: 11 } } }
        },
        cutout: '65%'
      }
    });
  }
}

function renderUpcomingMaintenance(items) {
  const tbody = document.getElementById('upcoming-maint-tbody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--text-muted);">No immediate maintenance due. All vehicles operational.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(m => {
    let urgencyBadge = '<span class="badge badge-info">Normal</span>';
    if (m.urgency === 'OVERDUE') urgencyBadge = '<span class="badge badge-danger">OVERDUE</span>';
    else if (m.urgency === 'DUE_SOON') urgencyBadge = '<span class="badge badge-warning">Due Soon</span>';
    else if (m.urgency === 'UPCOMING') urgencyBadge = '<span class="badge badge-orange">Upcoming</span>';

    const remKm = (m.remainingKm !== undefined && m.remainingKm !== null)
      ? m.remainingKm
      : ((m.nextServiceKm != null && m.currentOdometer != null) ? (m.nextServiceKm - m.currentOdometer) : 0);
    const isOverdue = remKm <= 0 || m.urgency === 'OVERDUE';
    const remainingText = isOverdue
      ? `<span style="color:var(--status-danger);font-weight:700;">${Math.abs(remKm || 0).toLocaleString()} KM Overdue</span>`
      : `<span style="font-weight:600;">${(remKm || 0).toLocaleString()} KM</span>`;

    const predictedDateStr = isOverdue
      ? `<span style="color:var(--status-danger);font-weight:700;">Immediate</span>`
      : (m.hasSufficientData && m.predictedServiceDate ? m.predictedServiceDate : '<span style="color:var(--text-muted);">Upcoming</span>');

    return `
      <tr>
        <td>
          <a href="vehicle-details.html?id=${m.vehicleId}" style="font-weight:700;color:var(--text-primary);display:block;">
            ${escapeHtml(m.registrationNumber)}
          </a>
          <span style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(m.vehicleModel)}</span>
        </td>
        <td style="font-weight:600;">${(m.currentOdometer || 0).toLocaleString()} KM</td>
        <td style="color:var(--text-secondary);">${(m.nextServiceKm || 0).toLocaleString()} KM</td>
        <td>${remainingText}</td>
        <td>${predictedDateStr}</td>
        <td>${urgencyBadge}</td>
        <td style="text-align:right;">
          <a href="maintenance.html?vehicleId=${m.vehicleId}&action=schedule" class="btn btn-sm btn-primary" style="white-space:nowrap;padding:5px 12px;font-size:0.8rem;font-weight:600;">
            Schedule
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function renderRecentActivities(activities) {
  const container = document.getElementById('recent-activities-list');
  if (!container) return;

  if (activities.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No recent activities logged yet.</div>`;
    return;
  }

  container.innerHTML = activities.map(a => {
    let icon = 'activity';
    let iconColor = 'var(--primary-orange)';
    if (a.type === 'MAINTENANCE_COMPLETED') { icon = 'wrench'; iconColor = 'var(--status-success)'; }
    if (a.type === 'REPAIR_RECORDED') { icon = 'tool'; iconColor = 'var(--status-info)'; }
    if (a.type === 'CRITICAL_ISSUE') { icon = 'alert-octagon'; iconColor = 'var(--status-danger)'; }
    if (a.type === 'FUEL_RECORDED') { icon = 'fuel'; iconColor = 'var(--secondary-orange)'; }

    return `
      <div style="display:flex;gap:12px;padding:10px 12px;border-radius:var(--radius-md);background:var(--bg-subtle);">
        <div style="width:34px;height:34px;border-radius:var(--radius-sm);background:var(--bg-card);display:flex;align-items:center;justify-content:center;color:${iconColor};flex-shrink:0;">
          <i data-lucide="${icon}" style="width:18px;height:18px;"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${escapeHtml(a.title)}
            </span>
            <span style="font-size:0.7rem;color:var(--text-muted);">${formatTimeAgo(a.timestamp)}</span>
          </div>
          <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">
            <span style="font-weight:600;color:var(--primary-orange);">${escapeHtml(a.vehicleRegistration)}</span> - ${escapeHtml(a.description)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}
