/**
 * FleetIQ API Client
 * Centralized HTTP request handling with JWT Bearer authentication and toast alerts
 */

const API = {
  baseUrl: '',

  getToken() {
    return localStorage.getItem('fleetiq_token');
  },

  getHeaders(isJson = true) {
    const headers = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options.isJson !== false);

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // If unauthorized and not on login page, redirect
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('qr-view.html')) {
          localStorage.removeItem('fleetiq_token');
          localStorage.removeItem('fleetiq_user');
          window.location.href = 'login.html';
        }
        throw new Error('Session expired or unauthorized');
      }

      if (!response.ok) {
        let errorMsg = 'An error occurred';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || response.statusText;
        } catch (e) {
          errorMsg = await response.text() || response.statusText;
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (err) {
      if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:' || err.message.includes('Failed to fetch')) {
        console.warn(`[FleetIQ GitHub Pages Mode] Serving demo mock response for: ${endpoint}`);
        return handleGitHubPagesMock(endpoint, options);
      }
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

// Toast notification helper
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'danger') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width:20px;height:20px;flex-shrink:0;"></i>
    <div style="flex:1;">${message}</div>
    <button style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;" onclick="this.parentElement.remove()">
      <i data-lucide="x" style="width:16px;height:16px;"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Interactive Client-Side Mock Provider for GitHub Pages static hosting
 */
function handleGitHubPagesMock(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth
  if (endpoint.includes('/api/auth/login')) {
    const u = body.username || 'admin';
    let role = 'ROLE_ADMIN';
    let name = 'Alex Morgan';
    if (u === 'manager') { role = 'ROLE_MANAGER'; name = 'Sarah Jenkins'; }
    else if (u.startsWith('driver')) { role = 'ROLE_DRIVER'; name = 'David Miller'; }
    return { token: 'gh-mock-jwt-token', userId: 1, username: u, fullName: name, role: role, email: `${u}@fleetiq.io` };
  }

  // Dashboard summary
  if (endpoint.includes('/api/dashboard/summary')) {
    return {
      kpis: {
        totalVehicles: 9,
        activeVehicles: 4,
        maintenanceDueVehicles: 2,
        inShopVehicles: 1,
        averageFleetHealth: 81.6,
        monthlyExpenses: 3576.22,
        monthlyMaintenanceCost: 650.00,
        monthlyRepairCost: 1310.00,
        monthlyFuelCost: 1616.22
      },
      charts: {
        monthLabels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        monthlyMaintenanceExpenses: [1200, 450, 780, 520, 1100, 650],
        monthlyRepairExpenses: [650, 490, 820, 240, 680, 820],
        monthlyFuelExpenses: [1100, 1250, 1420, 1380, 1510, 1616.22],
        fuelEfficiencyKml: [6.8, 7.1, 7.4, 7.2, 7.5, 7.6],
        activeVehiclesCount: 4,
        maintenanceDueCount: 2,
        inShopCount: 1,
        unsafeCount: 1,
        excellentHealthCount: 5,
        goodHealthCount: 2,
        needsAttentionHealthCount: 1,
        poorHealthCount: 1
      },
      upcomingMaintenance: [
        { vehicleId: 5, registrationNumber: 'FL-105', vehicleModel: 'Ram ProMaster 3500', currentOdometer: 41500, nextServiceKm: 40000, remainingKm: -1500, predictedServiceDate: '2026-10-30', urgency: 'OVERDUE', hasSufficientData: true },
        { vehicleId: 2, registrationNumber: 'FL-102', vehicleModel: 'Mercedes-Benz Sprinter', currentOdometer: 39580, nextServiceKm: 40000, remainingKm: 420, predictedServiceDate: '2026-11-04', urgency: 'DUE_SOON', hasSufficientData: true },
        { vehicleId: 9, registrationNumber: 'BUS-901', vehicleModel: 'Volvo 7900 Electric Bus', currentOdometer: 25050, nextServiceKm: 30050, remainingKm: 5000, predictedServiceDate: '2026-11-28', urgency: 'NORMAL', hasSufficientData: true }
      ],
      recentActivities: [
        { type: 'MAINTENANCE', description: 'Comprehensive 25K service completed on BUS-901 ($650.00)', time: '20 mins ago', status: 'COMPLETED' },
        { type: 'INSPECTION', description: 'Daily pre-trip inspection submitted for FL-101 (All passed)', time: '1 hour ago', status: 'PASSED' },
        { type: 'FUEL', description: 'Refueled FL-106 at Love\'s Travel Stop (120L Diesel)', time: '3 hours ago', status: 'RECORDED' },
        { type: 'ALERT', description: 'Power steering pressure line defect reported on FL-107 (Grounded)', time: '5 hours ago', status: 'CRITICAL' }
      ]
    };
  }

  // Vehicles
  if (endpoint.includes('/api/vehicles')) {
    return [
      { id: 1, registrationNumber: 'FL-101', vin: '1FT8W3BT9NED12001', make: 'Freightliner', model: 'Cascadia 126', manufactureYear: 2022, vehicleType: 'Heavy Truck', fuelType: 'Diesel', assignedDriverName: 'David Miller', currentOdometer: 82400, lastServiceKm: 75000, serviceIntervalKm: 15000, nextServiceKm: 90000, status: 'ACTIVE', healthScore: 92, imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80' },
      { id: 2, registrationNumber: 'FL-102', vin: 'WD3PF4CD6KP088219', make: 'Mercedes-Benz', model: 'Sprinter 3500', manufactureYear: 2023, vehicleType: 'Cargo Van', fuelType: 'Diesel', assignedDriverName: 'Elena Gomez', currentOdometer: 39580, lastServiceKm: 30000, serviceIntervalKm: 10000, nextServiceKm: 40000, status: 'MAINTENANCE_DUE', healthScore: 78, imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80' },
      { id: 3, registrationNumber: 'FL-103', vin: '1FTYR1Y84MKA44901', make: 'Ford', model: 'Transit-250 High Roof', manufactureYear: 2021, vehicleType: 'Delivery Van', fuelType: 'Gasoline', assignedDriverName: 'James Wilson', currentOdometer: 54200, lastServiceKm: 50000, serviceIntervalKm: 10000, nextServiceKm: 60000, status: 'ACTIVE', healthScore: 89, imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80' },
      { id: 4, registrationNumber: 'FL-104', vin: '4UZAC2FC9LC781204', make: 'Isuzu', model: 'NPR-HD Box Truck', manufactureYear: 2020, vehicleType: 'Box Truck', fuelType: 'Diesel', assignedDriverName: 'Unassigned', currentOdometer: 68900, lastServiceKm: 60000, serviceIntervalKm: 10000, nextServiceKm: 70000, status: 'IN_SHOP', healthScore: 68, imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80' },
      { id: 5, registrationNumber: 'FL-105', vin: '3C6UR5DL7NE149203', make: 'Ram', model: 'ProMaster 3500', manufactureYear: 2022, vehicleType: 'Cargo Van', fuelType: 'Gasoline', assignedDriverName: 'Unassigned', currentOdometer: 41500, lastServiceKm: 30000, serviceIntervalKm: 10000, nextServiceKm: 40000, status: 'MAINTENANCE_DUE', healthScore: 64, imageUrl: 'https://images.unsplash.com/photo-1586191582056-a19f67a288c1?auto=format&fit=crop&w=600&q=80' },
      { id: 6, registrationNumber: 'FL-106', vin: '4V4NC9EH5PN892011', make: 'Volvo', model: 'VNL 860 Sleeper', manufactureYear: 2023, vehicleType: 'Heavy Truck', fuelType: 'Diesel', assignedDriverName: 'David Miller', currentOdometer: 115000, lastServiceKm: 105000, serviceIntervalKm: 20000, nextServiceKm: 125000, status: 'ACTIVE', healthScore: 94, imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80' },
      { id: 7, registrationNumber: 'FL-107', vin: '1GC1GUEG5K1189203', make: 'Chevrolet', model: 'Express 3500', manufactureYear: 2019, vehicleType: 'Passenger Van', fuelType: 'Gasoline', assignedDriverName: 'Elena Gomez', currentOdometer: 92100, lastServiceKm: 85000, serviceIntervalKm: 10000, nextServiceKm: 95000, status: 'UNSAFE', healthScore: 42, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
      { id: 8, registrationNumber: 'FL-108', vin: '1NKDX4EX8PJ902188', make: 'Kenworth', model: 'T680 Next Gen', manufactureYear: 2024, vehicleType: 'Heavy Truck', fuelType: 'Diesel', assignedDriverName: 'James Wilson', currentOdometer: 12000, lastServiceKm: 0, serviceIntervalKm: 15000, nextServiceKm: 15000, status: 'ACTIVE', healthScore: 98, imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80' },
      { id: 9, registrationNumber: 'BUS-901', vin: '1BZ4TRANSIT99801', make: 'Volvo', model: '7900 Electric City Bus', manufactureYear: 2024, vehicleType: 'Transit / City Bus', fuelType: 'Electric', assignedDriverName: 'David Miller', currentOdometer: 25050, lastServiceKm: 25050, serviceIntervalKm: 5000, nextServiceKm: 30050, status: 'ACTIVE', healthScore: 96, imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80' }
    ];
  }

  // Predictive maintenance
  if (endpoint.includes('/api/maintenance/predictions')) {
    return [
      { vehicleId: 5, registrationNumber: 'FL-105', vehicleModel: 'Ram ProMaster', currentOdometer: 41500, lastServiceKm: 30000, nextServiceKm: 40000, remainingKm: -1500, avgDailyDistanceKm: 85.0, estimatedDaysRemaining: 0, predictedServiceDate: '2026-10-30', urgency: 'OVERDUE', hasSufficientData: true },
      { vehicleId: 2, registrationNumber: 'FL-102', vehicleModel: 'Mercedes-Benz Sprinter', currentOdometer: 39580, lastServiceKm: 30000, nextServiceKm: 40000, remainingKm: 420, avgDailyDistanceKm: 62.0, estimatedDaysRemaining: 7, predictedServiceDate: '2026-11-04', urgency: 'DUE_SOON', hasSufficientData: true },
      { vehicleId: 9, registrationNumber: 'BUS-901', vehicleModel: 'Volvo 7900 Electric Bus', currentOdometer: 25050, lastServiceKm: 25050, nextServiceKm: 30050, remainingKm: 5000, avgDailyDistanceKm: 180.0, estimatedDaysRemaining: 28, predictedServiceDate: '2026-11-28', urgency: 'NORMAL', hasSufficientData: true },
      { vehicleId: 1, registrationNumber: 'FL-101', vehicleModel: 'Freightliner Cascadia', currentOdometer: 82400, lastServiceKm: 75000, nextServiceKm: 90000, remainingKm: 7600, avgDailyDistanceKm: 120.0, estimatedDaysRemaining: 63, predictedServiceDate: '2026-12-30', urgency: 'NORMAL', hasSufficientData: true }
    ];
  }

  // Reports
  if (endpoint.includes('/api/reports')) {
    return {
      totalVehicles: 9,
      totalFleetCost: 8106.22,
      totalMaintenanceCost: 3640.00,
      totalRepairCost: 2850.00,
      totalFuelCost: 1616.22,
      avgFleetMileage: 7.4,
      avgFleetHealth: 81.6,
      chartLabels: ['FL-101', 'FL-102', 'FL-103', 'FL-104', 'FL-105', 'FL-106', 'FL-107', 'FL-108', 'BUS-901'],
      chartValues: [1430, 525, 760, 1460, 680, 1700, 490, 411, 650],
      tableData: [
        { vehicleId: 1, registrationNumber: 'FL-101', model: 'Freightliner Cascadia', type: 'Heavy Truck', status: 'ACTIVE', odometer: '82,400 KM', maintenanceCost: '$780.00', repairCost: '$650.00', fuelCost: '$540.00', totalExpense: '$1,970.00' },
        { vehicleId: 2, registrationNumber: 'FL-102', model: 'Mercedes-Benz Sprinter', type: 'Cargo Van', status: 'MAINTENANCE_DUE', odometer: '39,580 KM', maintenanceCost: '$450.00', repairCost: '$0.00', fuelCost: '$140.00', totalExpense: '$590.00' },
        { vehicleId: 9, registrationNumber: 'BUS-901', model: 'Volvo 7900 Electric Bus', type: 'Transit / City Bus', status: 'ACTIVE', odometer: '25,050 KM', maintenanceCost: '$650.00', repairCost: '$0.00', fuelCost: '$0.00', totalExpense: '$650.00' }
      ]
    };
  }

  // AI Chat
  if (endpoint.includes('/api/ai/chat')) {
    const q = (body.message || '').toLowerCase();
    let reply = "FleetIQ AI Maintenance Engine: Systems nominal across 9 fleet units. Unit FL-105 is currently 1,500 KM overdue for primary service. Unit FL-107 is grounded due to a steering pressure fault.";
    if (q.includes('bus')) reply = "Unit BUS-901 (Volvo 7900 Electric City Bus) is operating at 96% health with next battery inspection scheduled at 30,050 KM.";
    return { reply: reply, threadId: 'gh-thread-1' };
  }

  // Notifications
  if (endpoint.includes('/api/notifications/unread-count')) {
    return { unreadCount: 3 };
  }
  if (endpoint.includes('/api/notifications')) {
    return [
      { id: 1, title: 'Service Overdue: FL-105', message: 'Vehicle exceeded 40,000 KM threshold.', priority: 'HIGH', read: false, createdAt: '2026-10-30T10:00:00' },
      { id: 2, title: 'Grounding Override: FL-107', message: 'Power steering defect flagged as UNSAFE.', priority: 'HIGH', read: false, createdAt: '2026-10-30T09:00:00' },
      { id: 3, title: 'Service Due Soon: FL-102', message: 'Within 420 KM of scheduled service.', priority: 'MEDIUM', read: false, createdAt: '2026-10-29T14:00:00' }
    ];
  }

  return { success: true, message: 'Simulated operation on GitHub Pages' };
}
