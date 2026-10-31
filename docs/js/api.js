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
    // Immediate mock intercept for static deployment on GitHub Pages or local file access
    if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
      return handleGitHubPagesMock(endpoint, options);
    }

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
 * Client-Side Mock Telemetry & Operations Provider for GitHub Pages
 */

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
  try {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  } catch (e) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
}

// Persistent Mock In-Memory DB for Client Experience
const _MOCK_DB = {
  vehicles: [
    { id: 1, registrationNumber: 'FL-101', vin: '1FT8W3BT9NED12001', make: 'Freightliner', model: 'Cascadia 126', manufactureYear: 2022, vehicleType: 'Heavy Truck', fuelType: 'Diesel', assignedDriverName: 'David Miller', currentOdometer: 82400, lastServiceKm: 75000, serviceIntervalKm: 15000, nextServiceKm: 90000, remainingKm: 7600, status: 'ACTIVE', healthScore: 92, healthCategory: 'Good', registrationDate: '2022-03-15', qrToken: 'QR-FI-FL-101-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-101-SECURE', 'FL-101'), imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80' },
    { id: 2, registrationNumber: 'FL-102', vin: 'WD3PF4CD6KP088219', make: 'Mercedes-Benz', model: 'Sprinter 3500', manufactureYear: 2023, vehicleType: 'Cargo Van', fuelType: 'Diesel', assignedDriverName: 'Elena Gomez', currentOdometer: 39580, lastServiceKm: 30000, serviceIntervalKm: 10000, nextServiceKm: 40000, remainingKm: 420, status: 'MAINTENANCE_DUE', healthScore: 78, healthCategory: 'Needs Attention', registrationDate: '2023-01-20', qrToken: 'QR-FI-FL-102-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-102-SECURE', 'FL-102'), imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80' },
    { id: 3, registrationNumber: 'FL-103', vin: '1FTYR1Y84MKA44901', make: 'Ford', model: 'Transit-250 High Roof', manufactureYear: 2021, vehicleType: 'Delivery Van', fuelType: 'Gasoline', assignedDriverName: 'James Wilson', currentOdometer: 54200, lastServiceKm: 50000, serviceIntervalKm: 10000, nextServiceKm: 60000, remainingKm: 5800, status: 'ACTIVE', healthScore: 89, healthCategory: 'Good', registrationDate: '2021-06-11', qrToken: 'QR-FI-FL-103-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-103-SECURE', 'FL-103'), imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80' },
    { id: 4, registrationNumber: 'FL-104', vin: '4UZAC2FC9LC781204', make: 'Isuzu', model: 'NPR-HD Box Truck', manufactureYear: 2020, vehicleType: 'Box Truck', fuelType: 'Diesel', assignedDriverName: 'Unassigned', currentOdometer: 68900, lastServiceKm: 60000, serviceIntervalKm: 10000, nextServiceKm: 70000, remainingKm: 1100, status: 'IN_SHOP', healthScore: 68, healthCategory: 'Needs Attention', registrationDate: '2020-09-05', qrToken: 'QR-FI-FL-104-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-104-SECURE', 'FL-104'), imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80' },
    { id: 5, registrationNumber: 'FL-105', vin: '3C6UR5DL7NE149203', make: 'Ram', model: 'ProMaster 3500', manufactureYear: 2022, vehicleType: 'Cargo Van', fuelType: 'Gasoline', assignedDriverName: 'Unassigned', currentOdometer: 41500, lastServiceKm: 30000, serviceIntervalKm: 10000, nextServiceKm: 40000, remainingKm: -1500, status: 'MAINTENANCE_DUE', healthScore: 64, healthCategory: 'Needs Attention', registrationDate: '2022-04-18', qrToken: 'QR-FI-FL-105-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-105-SECURE', 'FL-105'), imageUrl: 'https://images.unsplash.com/photo-1586191582056-a19f67a288c1?auto=format&fit=crop&w=600&q=80' },
    { id: 6, registrationNumber: 'FL-106', vin: '4V4NC9EH5PN892011', make: 'Volvo', model: 'VNL 860 Sleeper', manufactureYear: 2023, vehicleType: 'Heavy Truck', fuelType: 'Diesel', assignedDriverName: 'David Miller', currentOdometer: 115000, lastServiceKm: 105000, serviceIntervalKm: 20000, nextServiceKm: 125000, remainingKm: 10000, status: 'ACTIVE', healthScore: 94, healthCategory: 'Excellent', registrationDate: '2023-02-14', qrToken: 'QR-FI-FL-106-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-106-SECURE', 'FL-106'), imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80' },
    { id: 7, registrationNumber: 'FL-107', vin: '1GC1GUEG5K1189203', make: 'Chevrolet', model: 'Express 3500', manufactureYear: 2019, vehicleType: 'Passenger Van', fuelType: 'Gasoline', assignedDriverName: 'Elena Gomez', currentOdometer: 92100, lastServiceKm: 85000, serviceIntervalKm: 10000, nextServiceKm: 95000, remainingKm: 2900, status: 'UNSAFE', healthScore: 42, healthCategory: 'Poor', registrationDate: '2019-11-20', qrToken: 'QR-FI-FL-107-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-107-SECURE', 'FL-107'), imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
    { id: 8, registrationNumber: 'FL-108', vin: '1NKDX4EX8PJ902188', make: 'Kenworth', model: 'T680 Next Gen', manufactureYear: 2024, vehicleType: 'Heavy Truck', fuelType: 'Diesel', assignedDriverName: 'James Wilson', currentOdometer: 12000, lastServiceKm: 0, serviceIntervalKm: 15000, nextServiceKm: 15000, remainingKm: 3000, status: 'ACTIVE', healthScore: 98, healthCategory: 'Excellent', registrationDate: '2024-01-10', qrToken: 'QR-FI-FL-108-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-FL-108-SECURE', 'FL-108'), imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80' },
    { id: 9, registrationNumber: 'BUS-901', vin: '1BZ4TRANSIT99801', make: 'Volvo', model: '7900 Electric City Bus', manufactureYear: 2024, vehicleType: 'Transit / City Bus', fuelType: 'Electric', assignedDriverName: 'David Miller', currentOdometer: 25050, lastServiceKm: 25050, serviceIntervalKm: 5000, nextServiceKm: 30050, remainingKm: 5000, status: 'ACTIVE', healthScore: 96, healthCategory: 'Excellent', registrationDate: '2024-05-01', qrToken: 'QR-FI-BUS-901-SECURE', qrCodeBase64: generateSvgQrDataUri('QR-FI-BUS-901-SECURE', 'BUS-901'), imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80' }
  ],
  repairs: [
    { id: 1, vehicleId: 4, vehicleRegistration: 'FL-104', vehicleModel: 'Isuzu NPR-HD', repairDate: '2026-10-28', problemDescription: 'Transmission hard shifting in 2nd gear and check engine light P0700', repairCategory: 'TRANSMISSION', priority: 'HIGH', repairStatus: 'IN_PROGRESS', cost: 1310.00, mechanicName: 'Midwest Drivetrain Specialists', partsReplaced: 'Shift Solenoid Pack, Transmission Fluid Flush' },
    { id: 2, vehicleId: 7, vehicleRegistration: 'FL-107', vehicleModel: 'Chevrolet Express', repairDate: '2026-10-30', problemDescription: 'Steering high-pressure hydraulic line burst; loss of power steering assist', repairCategory: 'STEERING', priority: 'HIGH', repairStatus: 'PENDING', cost: 480.00, mechanicName: 'FleetIQ Internal Bay', partsReplaced: 'High-Pressure Hydraulic Line, Power Steering Fluid' },
    { id: 3, vehicleId: 1, vehicleRegistration: 'FL-101', vehicleModel: 'Freightliner Cascadia', repairDate: '2026-09-04', problemDescription: 'Air brake compressor relief valve leakage', repairCategory: 'BRAKES', priority: 'MEDIUM', repairStatus: 'COMPLETED', cost: 650.00, mechanicName: 'Apex Truck Services', partsReplaced: 'Relief Valve Assembly, Air Dryer Cartridge' }
  ],
  fuel: [
    { id: 1, vehicleId: 1, vehicleRegistration: 'FL-101', fuelDate: '2026-10-29', odometerKm: 82400, fuelQuantity: 180.0, pricePerUnit: 3.85, totalCost: 693.00, fuelType: 'Diesel', stationName: 'Pilot Travel Center #44', mileageKml: 4.1 },
    { id: 2, vehicleId: 2, vehicleRegistration: 'FL-102', fuelDate: '2026-10-28', odometerKm: 39580, fuelQuantity: 65.0, pricePerUnit: 3.90, totalCost: 253.50, fuelType: 'Diesel', stationName: 'Love\'s #18', mileageKml: 9.8 },
    { id: 3, vehicleId: 3, vehicleRegistration: 'FL-103', fuelDate: '2026-10-27', odometerKm: 54200, fuelQuantity: 70.0, pricePerUnit: 3.45, totalCost: 241.50, fuelType: 'Gasoline', stationName: 'Shell Express', mileageKml: 8.5 },
    { id: 4, vehicleId: 6, vehicleRegistration: 'FL-106', fuelDate: '2026-10-30', odometerKm: 115000, fuelQuantity: 120.0, pricePerUnit: 3.88, totalCost: 465.60, fuelType: 'Diesel', stationName: 'TA Travel Center', mileageKml: 3.9 }
  ],
  inspections: [
    { id: 1, vehicleId: 1, vehicleRegistration: 'FL-101', vehicleModel: 'Freightliner Cascadia', inspectorName: 'David Miller', inspectionDate: '2026-10-30T07:30:00', odometerKm: 82400, overallStatus: 'PASSED', hasCriticalIssue: false, generalNotes: 'Pre-trip checklist 100% verified. Brakes, tires, and lighting nominal.' },
    { id: 2, vehicleId: 7, vehicleRegistration: 'FL-107', vehicleModel: 'Chevrolet Express', inspectorName: 'Elena Gomez', inspectionDate: '2026-10-30T08:15:00', odometerKm: 92100, overallStatus: 'FAILED_UNSAFE', hasCriticalIssue: true, generalNotes: 'Steering fluid leaking heavily onto front axle. Vehicle grounded.' },
    { id: 3, vehicleId: 2, vehicleRegistration: 'FL-102', vehicleModel: 'Mercedes-Benz Sprinter', inspectorName: 'Elena Gomez', inspectionDate: '2026-10-29T16:40:00', odometerKm: 39580, overallStatus: 'NEEDS_ATTENTION', hasCriticalIssue: false, generalNotes: 'Left rear brake pad lining approaching minimum wear limit.' }
  ],
  maintenance: [
    { id: 1, vehicleId: 9, vehicleRegistration: 'BUS-901', vehicleModel: 'Volvo 7900 Electric Bus', serviceDate: '2026-10-25', maintenanceType: 'PREVENTIVE', odometerKm: 25050, workPerformed: 'High voltage system isolation test, brake regeneration calibration', partsReplaced: 'Cabin HEPA Filter, Inverter Coolant', cost: 650.00, mechanicName: 'Metro Transit Tech' },
    { id: 2, vehicleId: 1, vehicleRegistration: 'FL-101', vehicleModel: 'Freightliner Cascadia', serviceDate: '2026-09-12', maintenanceType: 'OIL_CHANGE', odometerKm: 75000, workPerformed: 'Full synthetic 15W-40 engine oil swap, lube chassis', partsReplaced: 'Dual Oil Filter, Fuel Filter Water Separator', cost: 420.00, mechanicName: 'Apex Truck Services' },
    { id: 3, vehicleId: 3, vehicleRegistration: 'FL-103', vehicleModel: 'Ford Transit-250', serviceDate: '2026-08-30', maintenanceType: 'TIRE_ROTATION', odometerKm: 50000, workPerformed: 'Four wheel rotation and alignment verification', partsReplaced: 'Valve stems', cost: 120.00, mechanicName: 'FleetIQ Depot #2' }
  ],
  users: [
    { id: 1, username: 'admin', fullName: 'Alex Morgan', email: 'admin@fleetiq.io', phone: '+1 (555) 019-2831', role: 'ROLE_ADMIN', active: true },
    { id: 2, username: 'manager', fullName: 'Sarah Jenkins', email: 'manager@fleetiq.io', phone: '+1 (555) 019-4822', role: 'ROLE_MANAGER', active: true },
    { id: 3, username: 'driver1', fullName: 'David Miller', email: 'driver1@fleetiq.io', phone: '+1 (555) 019-7714', role: 'ROLE_DRIVER', active: true },
    { id: 4, username: 'driver2', fullName: 'Elena Gomez', email: 'driver2@fleetiq.io', phone: '+1 (555) 019-9923', role: 'ROLE_DRIVER', active: true },
    { id: 5, username: 'driver3', fullName: 'James Wilson', email: 'driver3@fleetiq.io', phone: '+1 (555) 019-3388', role: 'ROLE_DRIVER', active: true }
  ]
};

function handleGitHubPagesMock(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth Login
  if (endpoint.includes('/api/auth/login')) {
    const u = body.username || 'admin';
    let role = 'ROLE_ADMIN';
    let name = 'Alex Morgan';
    if (u === 'manager') { role = 'ROLE_MANAGER'; name = 'Sarah Jenkins'; }
    else if (u.startsWith('driver')) { role = 'ROLE_DRIVER'; name = 'David Miller'; }
    return { token: 'gh-mock-jwt-token', userId: 1, username: u, fullName: name, role: role, email: `${u}@fleetiq.io` };
  }

  // Drivers List
  if (endpoint.includes('/api/auth/drivers')) {
    return _MOCK_DB.users.filter(u => u.role === 'ROLE_DRIVER' && u.active);
  }

  // Single Vehicle by ID
  const vehicleMatch = endpoint.match(/\/api\/vehicles\/(\d+)/);
  if (vehicleMatch && method === 'GET') {
    const vid = parseInt(vehicleMatch[1]);
    return _MOCK_DB.vehicles.find(v => v.id === vid) || _MOCK_DB.vehicles[0];
  }

  // Odometer Update (POST or PATCH)
  if (endpoint.includes('/odometer') && (method === 'POST' || method === 'PATCH')) {
    const vidMatch = endpoint.match(/\/api\/vehicles\/(\d+)\/odometer/);
    if (vidMatch) {
      const vid = parseInt(vidMatch[1]);
      const target = _MOCK_DB.vehicles.find(v => v.id === vid);
      const newOdo = parseInt(body.readingKm || body.currentOdometer);
      if (target && !isNaN(newOdo)) {
        target.currentOdometer = newOdo;
        target.remainingKm = target.nextServiceKm - target.currentOdometer;
        if (target.remainingKm <= 0) target.status = 'MAINTENANCE_DUE';
        return target;
      }
    }
  }

  // Vehicles list & Create
  if (endpoint === '/api/vehicles' || endpoint.startsWith('/api/vehicles?')) {
    if (method === 'POST') {
      const newV = {
        id: _MOCK_DB.vehicles.length + 1,
        registrationNumber: body.registrationNumber || `FL-NEW`,
        vin: body.vin || 'VIN999999999',
        make: body.make || 'Freightliner',
        model: body.model || 'Cascadia',
        manufactureYear: body.manufactureYear || 2024,
        vehicleType: body.vehicleType || 'Heavy Truck',
        fuelType: body.fuelType || 'Diesel',
        assignedDriverName: 'David Miller',
        currentOdometer: parseInt(body.currentOdometer) || 0,
        lastServiceKm: parseInt(body.lastServiceKm) || 0,
        serviceIntervalKm: parseInt(body.serviceIntervalKm) || 10000,
        nextServiceKm: (parseInt(body.lastServiceKm) || 0) + (parseInt(body.serviceIntervalKm) || 10000),
        status: 'ACTIVE',
        healthScore: 95,
        healthCategory: 'Excellent',
        registrationDate: body.registrationDate || new Date().toISOString().split('T')[0],
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
      };
      newV.remainingKm = newV.nextServiceKm - newV.currentOdometer;
      newV.qrToken = `QR-FI-${newV.registrationNumber}-SECURE`;
      newV.qrCodeBase64 = generateSvgQrDataUri(newV.qrToken, newV.registrationNumber);
      _MOCK_DB.vehicles.push(newV);
      return newV;
    }
    return _MOCK_DB.vehicles;
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
        poorHealthCount: 1,
        healthDistribution: {
          'Excellent': 5,
          'Good': 2,
          'Needs Attention': 1,
          'Poor': 0,
          'Unsafe': 1
        },
        statusDistribution: {
          'Active': 4,
          'Service Due': 2,
          'In Workshop': 1,
          'Unsafe': 1
        }
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

  // Maintenance Predictions
  if (endpoint.includes('/api/maintenance/predictions')) {
    return [
      { vehicleId: 5, registrationNumber: 'FL-105', vehicleModel: 'Ram ProMaster', currentOdometer: 41500, lastServiceKm: 30000, nextServiceKm: 40000, remainingKm: -1500, avgDailyDistanceKm: 85.0, estimatedDaysRemaining: 0, predictedServiceDate: '2026-10-30', urgency: 'OVERDUE', hasSufficientData: true },
      { vehicleId: 2, registrationNumber: 'FL-102', vehicleModel: 'Mercedes-Benz Sprinter', currentOdometer: 39580, lastServiceKm: 30000, nextServiceKm: 40000, remainingKm: 420, avgDailyDistanceKm: 62.0, estimatedDaysRemaining: 7, predictedServiceDate: '2026-11-04', urgency: 'DUE_SOON', hasSufficientData: true },
      { vehicleId: 9, registrationNumber: 'BUS-901', vehicleModel: 'Volvo 7900 Electric Bus', currentOdometer: 25050, lastServiceKm: 25050, nextServiceKm: 30050, remainingKm: 5000, avgDailyDistanceKm: 180.0, estimatedDaysRemaining: 28, predictedServiceDate: '2026-11-28', urgency: 'NORMAL', hasSufficientData: true },
      { vehicleId: 1, registrationNumber: 'FL-101', vehicleModel: 'Freightliner Cascadia', currentOdometer: 82400, lastServiceKm: 75000, nextServiceKm: 90000, remainingKm: 7600, avgDailyDistanceKm: 120.0, estimatedDaysRemaining: 63, predictedServiceDate: '2026-12-30', urgency: 'NORMAL', hasSufficientData: true }
    ];
  }

  // Maintenance Recent & Vehicle Records
  if (endpoint.includes('/api/maintenance/recent') || endpoint.includes('/api/maintenance/vehicle')) {
    return _MOCK_DB.maintenance;
  }

  if (endpoint === '/api/maintenance' && method === 'POST') {
    const v = _MOCK_DB.vehicles.find(x => x.id === parseInt(body.vehicleId)) || _MOCK_DB.vehicles[0];
    const rec = {
      id: _MOCK_DB.maintenance.length + 1,
      vehicleId: v.id,
      vehicleRegistration: v.registrationNumber,
      vehicleModel: `${v.make} ${v.model}`,
      serviceDate: body.serviceDate || new Date().toISOString().split('T')[0],
      maintenanceType: body.maintenanceType || 'PREVENTIVE',
      odometerKm: parseInt(body.odometerKm) || v.currentOdometer,
      workPerformed: body.workPerformed || 'Scheduled maintenance service completed',
      partsReplaced: body.partsReplaced || 'Filters, Lubricants',
      cost: parseFloat(body.cost) || 450.00,
      mechanicName: body.mechanicName || 'Apex Workshop'
    };
    if (v) {
      v.lastServiceKm = rec.odometerKm;
      v.serviceIntervalKm = parseInt(body.serviceIntervalKm) || v.serviceIntervalKm || 10000;
      v.nextServiceKm = v.lastServiceKm + v.serviceIntervalKm;
      v.remainingKm = v.nextServiceKm - v.currentOdometer;
      if (v.status === 'MAINTENANCE_DUE' && v.remainingKm > 0) {
        v.status = 'ACTIVE';
        v.healthScore = Math.min(100, v.healthScore + 20);
        v.healthCategory = v.healthScore >= 90 ? 'Excellent' : 'Good';
      }
    }
    _MOCK_DB.maintenance.unshift(rec);
    return rec;
  }

  // Fuel Comparison
  if (endpoint.includes('/api/fuel/comparison')) {
    return [
      { registrationNumber: 'FL-101', vehicleModel: 'Freightliner Cascadia', avgMileageKml: 4.1, averageKml: 4.1 },
      { registrationNumber: 'FL-102', vehicleModel: 'Mercedes-Benz Sprinter', avgMileageKml: 9.8, averageKml: 9.8 },
      { registrationNumber: 'FL-103', vehicleModel: 'Ford Transit-250', avgMileageKml: 8.5, averageKml: 8.5 },
      { registrationNumber: 'FL-104', vehicleModel: 'Isuzu NPR-HD', avgMileageKml: 6.5, averageKml: 6.5 },
      { registrationNumber: 'FL-106', vehicleModel: 'Volvo VNL 860', avgMileageKml: 3.9, averageKml: 3.9 }
    ];
  }

  // Fuel Logs & Vehicle Fuel
  if (endpoint.includes('/api/fuel/vehicle') || endpoint === '/api/fuel' || endpoint.startsWith('/api/fuel?')) {
    if (method === 'POST') {
      const v = _MOCK_DB.vehicles.find(x => x.id === parseInt(body.vehicleId)) || _MOCK_DB.vehicles[0];
      const rec = {
        id: _MOCK_DB.fuel.length + 1,
        vehicleId: v.id,
        vehicleRegistration: v.registrationNumber,
        fuelDate: body.fuelDate || new Date().toISOString().split('T')[0],
        odometerKm: parseInt(body.odometerKm) || v.currentOdometer,
        fuelQuantity: parseFloat(body.fuelQuantity) || 100.0,
        pricePerUnit: parseFloat(body.pricePerUnit) || 3.85,
        totalCost: (parseFloat(body.fuelQuantity) || 100.0) * (parseFloat(body.pricePerUnit) || 3.85),
        fuelType: body.fuelType || v.fuelType,
        stationName: body.stationName || 'Pilot Travel Center',
        mileageKml: 4.5
      };
      _MOCK_DB.fuel.unshift(rec);
      return rec;
    }
    return _MOCK_DB.fuel;
  }

  // Repair Status Update PATCH
  if (endpoint.includes('/status') && endpoint.includes('/api/repairs')) {
    const repMatch = endpoint.match(/\/api\/repairs\/(\d+)\/status/);
    if (repMatch) {
      const repId = parseInt(repMatch[1]);
      const target = _MOCK_DB.repairs.find(r => r.id === repId);
      if (target) {
        if (body.repairStatus) target.repairStatus = body.repairStatus;
        if (body.finalCost) target.cost = parseFloat(body.finalCost);
        const v = _MOCK_DB.vehicles.find(x => x.id === target.vehicleId);
        if (v && target.repairStatus === 'COMPLETED') {
          if (v.status === 'IN_SHOP' || v.status === 'UNSAFE') {
            v.status = 'ACTIVE';
            v.healthScore = Math.min(100, v.healthScore + 25);
            v.healthCategory = v.healthScore >= 90 ? 'Excellent' : 'Good';
          }
        }
        return target;
      }
    }
  }

  // Repairs & Vehicle Repairs
  if (endpoint.includes('/api/repairs/vehicle') || endpoint === '/api/repairs' || endpoint.startsWith('/api/repairs?')) {
    if (method === 'POST') {
      const v = _MOCK_DB.vehicles.find(x => x.id === parseInt(body.vehicleId)) || _MOCK_DB.vehicles[0];
      const rep = {
        id: _MOCK_DB.repairs.length + 1,
        vehicleId: v.id,
        vehicleRegistration: v.registrationNumber,
        vehicleModel: `${v.make} ${v.model}`,
        repairDate: body.repairDate || new Date().toISOString().split('T')[0],
        problemDescription: body.issueDescription || body.problemDescription || 'Unscheduled breakdown service',
        repairCategory: body.repairCategory || 'MECHANICAL',
        priority: body.priority || 'MEDIUM',
        repairStatus: body.repairStatus || 'PENDING',
        cost: parseFloat(body.cost) || 350.00,
        mechanicName: body.mechanicName || 'FleetIQ Bay #1',
        partsReplaced: body.partsReplaced || 'Service items'
      };
      if (v && (rep.repairStatus === 'IN_PROGRESS' || rep.priority === 'HIGH')) {
        v.status = 'IN_SHOP';
        v.healthScore = Math.max(40, v.healthScore - 15);
      }
      _MOCK_DB.repairs.unshift(rep);
      return rep;
    }
    return _MOCK_DB.repairs;
  }

  // Daily Inspections & Vehicle Inspections
  if (endpoint.includes('/api/inspections/recent') || endpoint.includes('/api/inspections/vehicle') || endpoint === '/api/inspections') {
    if (method === 'POST') {
      const v = _MOCK_DB.vehicles.find(x => x.id === parseInt(body.vehicleId)) || _MOCK_DB.vehicles[0];
      const hasCrit = (body.items || []).some(it => it.status === 'CRITICAL');
      const insp = {
        id: _MOCK_DB.inspections.length + 1,
        vehicleId: v.id,
        vehicleRegistration: v.registrationNumber,
        vehicleModel: `${v.make} ${v.model}`,
        inspectorName: 'Alex Morgan',
        inspectionDate: new Date().toISOString(),
        odometerKm: v.currentOdometer,
        overallStatus: hasCrit ? 'FAILED_UNSAFE' : 'PASSED',
        hasCriticalIssue: hasCrit,
        generalNotes: body.generalNotes || 'Daily pre-trip inspection submitted'
      };
      if (hasCrit) {
        v.status = 'UNSAFE';
        v.healthScore = Math.max(30, v.healthScore - 40);
        v.healthCategory = 'Poor';
      }
      _MOCK_DB.inspections.unshift(insp);
      return insp;
    }
    return _MOCK_DB.inspections;
  }

  // Health Summary & Vehicle Health
  if (endpoint.includes('/api/health/summary')) {
    return {
      averageFleetHealth: 81.6,
      excellentCount: 5,
      goodCount: 2,
      needsAttentionCount: 1,
      poorCount: 0,
      unsafeCount: 1,
      vehicleScores: _MOCK_DB.vehicles.map(v => ({
        vehicleId: v.id,
        vehicleRegistration: v.registrationNumber,
        vehicleModel: `${v.make} ${v.model}`,
        overallScore: v.healthScore,
        category: v.healthCategory,
        maintenanceComplianceScore: v.status === 'MAINTENANCE_DUE' ? 55 : 98,
        inspectionScore: v.status === 'UNSAFE' ? 25 : 95,
        repairFrequencyScore: v.status === 'IN_SHOP' ? 60 : 92,
        overduePenalty: v.status === 'MAINTENANCE_DUE' ? 15 : 0,
        unsafe: v.status === 'UNSAFE',
        reasons: v.status === 'UNSAFE'
          ? 'CRITICAL safety defect flagged during recent pre-trip inspection!'
          : (v.status === 'MAINTENANCE_DUE' ? `Vehicle is overdue for scheduled service by ${Math.abs(v.remainingKm || 1500)} KM.` : 'All operational parameters within manufacturer tolerance.'),
        recommendedActions: v.status === 'UNSAFE'
          ? 'Ground vehicle immediately; dispatch to hydraulic steering technician.'
          : (v.status === 'MAINTENANCE_DUE' ? 'Route vehicle to maintenance bay for primary oil & multipoint service.' : 'Continue routine daily pre-trip inspections.')
      }))
    };
  }

  if (endpoint.includes('/api/health/vehicle')) {
    const vid = parseInt(endpoint.split('/').pop()) || 1;
    const v = _MOCK_DB.vehicles.find(x => x.id === vid) || _MOCK_DB.vehicles[0];
    return {
      vehicleId: v.id,
      overallScore: v.healthScore,
      category: v.healthCategory,
      maintenanceScore: v.status === 'MAINTENANCE_DUE' ? 55 : 95,
      inspectionScore: v.status === 'UNSAFE' ? 30 : 92,
      repairScore: v.status === 'IN_SHOP' ? 50 : 88,
      unsafe: v.status === 'UNSAFE',
      penaltyReasons: v.status === 'UNSAFE' ? ['Active critical safety inspection failure'] : (v.status === 'MAINTENANCE_DUE' ? ['Service mileage overdue'] : [])
    };
  }

  // QR Token & Details
  if (endpoint.includes('/api/qr/vehicle')) {
    const vid = parseInt(endpoint.split('/').pop()) || 1;
    const v = _MOCK_DB.vehicles.find(x => x.id === vid) || _MOCK_DB.vehicles[0];
    return {
      token: v.qrToken,
      qrCodeBase64: v.qrCodeBase64,
      registrationNumber: v.registrationNumber,
      make: v.make,
      model: v.model,
      status: v.status,
      currentOdometer: v.currentOdometer,
      healthScore: v.healthScore
    };
  }

  // Public QR Pass by Token
  if (endpoint.includes('/api/qr/public/')) {
    const tok = endpoint.split('/api/qr/public/')[1];
    const v = _MOCK_DB.vehicles.find(x => x.qrToken === tok) || _MOCK_DB.vehicles[0];
    return {
      registrationNumber: v.registrationNumber,
      make: v.make,
      model: v.model,
      manufactureYear: v.manufactureYear,
      vehicleType: v.vehicleType,
      healthScore: v.healthScore,
      currentOdometer: v.currentOdometer,
      nextServiceKm: v.nextServiceKm,
      status: v.status,
      unsafe: v.status === 'UNSAFE',
      recentMaintenance: _MOCK_DB.maintenance.filter(m => m.vehicleId === v.id || m.vehicleRegistration === v.registrationNumber),
      recentRepairs: _MOCK_DB.repairs.filter(r => r.vehicleId === v.id || r.vehicleRegistration === v.registrationNumber)
    };
  }

  // Reports Financials
  if (endpoint.includes('/api/reports')) {
    const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
    const type = (urlParams.get('type') || 'TOTAL_EXPENDITURE').toUpperCase();
    const vehicleId = urlParams.get('vehicleId');

    let rawTable = [
      { vehicleId: 1, registrationNumber: 'FL-101', model: 'Freightliner Cascadia 126', type: 'Heavy Truck', fuelType: 'Diesel', status: 'ACTIVE', odometer: '82,400 KM', maintenanceCost: '$780.00', repairCost: '$650.00', fuelCost: '$540.00', totalExpense: '$1,970.00', fuelQuantity: '180 L', avgMileageKml: '4.10 KM/L', rawFuelCost: 540, rawMaintCost: 780, rawRepairCost: 650, rawTotalCost: 1970 },
      { vehicleId: 2, registrationNumber: 'FL-102', model: 'Mercedes-Benz Sprinter 3500', type: 'Cargo Van', fuelType: 'Diesel', status: 'MAINTENANCE_DUE', odometer: '39,580 KM', maintenanceCost: '$450.00', repairCost: '$0.00', fuelCost: '$140.00', totalExpense: '$590.00', fuelQuantity: '65 L', avgMileageKml: '9.80 KM/L', rawFuelCost: 140, rawMaintCost: 450, rawRepairCost: 0, rawTotalCost: 590 },
      { vehicleId: 3, registrationNumber: 'FL-103', model: 'Ford Transit-250 High Roof', type: 'Delivery Van', fuelType: 'Gasoline', status: 'ACTIVE', odometer: '54,200 KM', maintenanceCost: '$250.00', repairCost: '$0.00', fuelCost: '$280.00', totalExpense: '$530.00', fuelQuantity: '70 L', avgMileageKml: '8.50 KM/L', rawFuelCost: 280, rawMaintCost: 250, rawRepairCost: 0, rawTotalCost: 530 },
      { vehicleId: 4, registrationNumber: 'FL-104', model: 'Isuzu NPR-HD Box Truck', type: 'Box Truck', fuelType: 'Diesel', status: 'IN_SHOP', odometer: '68,900 KM', maintenanceCost: '$320.00', repairCost: '$1,310.00', fuelCost: '$310.00', totalExpense: '$1,940.00', fuelQuantity: '75 L', avgMileageKml: '6.50 KM/L', rawFuelCost: 310, rawMaintCost: 320, rawRepairCost: 1310, rawTotalCost: 1940 },
      { vehicleId: 5, registrationNumber: 'FL-105', model: 'Ram ProMaster 3500', type: 'Cargo Van', fuelType: 'Gasoline', status: 'MAINTENANCE_DUE', odometer: '41,500 KM', maintenanceCost: '$680.00', repairCost: '$0.00', fuelCost: '$190.00', totalExpense: '$870.00', fuelQuantity: '45 L', avgMileageKml: '7.80 KM/L', rawFuelCost: 190, rawMaintCost: 680, rawRepairCost: 0, rawTotalCost: 870 },
      { vehicleId: 6, registrationNumber: 'FL-106', model: 'Volvo VNL 860 Sleeper', type: 'Heavy Truck', fuelType: 'Diesel', status: 'ACTIVE', odometer: '115,000 KM', maintenanceCost: '$510.00', repairCost: '$0.00', fuelCost: '$650.00', totalExpense: '$1,160.00', fuelQuantity: '120 L', avgMileageKml: '3.90 KM/L', rawFuelCost: 650, rawMaintCost: 510, rawRepairCost: 0, rawTotalCost: 1160 },
      { vehicleId: 7, registrationNumber: 'FL-107', model: 'Chevrolet Express 3500', type: 'Passenger Van', fuelType: 'Gasoline', status: 'UNSAFE', odometer: '92,100 KM', maintenanceCost: '$0.00', repairCost: '$480.00', fuelCost: '$210.00', totalExpense: '$690.00', fuelQuantity: '50 L', avgMileageKml: '6.20 KM/L', rawFuelCost: 210, rawMaintCost: 0, rawRepairCost: 480, rawTotalCost: 690 },
      { vehicleId: 8, registrationNumber: 'FL-108', model: 'Kenworth T680 Next Gen', type: 'Heavy Truck', fuelType: 'Diesel', status: 'ACTIVE', odometer: '12,000 KM', maintenanceCost: '$0.00', repairCost: '$0.00', fuelCost: '$310.00', totalExpense: '$310.00', fuelQuantity: '80 L', avgMileageKml: '4.20 KM/L', rawFuelCost: 310, rawMaintCost: 0, rawRepairCost: 0, rawTotalCost: 310 },
      { vehicleId: 9, registrationNumber: 'BUS-901', model: 'Volvo 7900 Electric City Bus', type: 'Transit / City Bus', fuelType: 'Electric', status: 'ACTIVE', odometer: '25,050 KM', maintenanceCost: '$650.00', repairCost: '$0.00', fuelCost: '$0.00', totalExpense: '$650.00', fuelQuantity: '0 L (EV)', avgMileageKml: 'N/A (EV)', rawFuelCost: 0, rawMaintCost: 650, rawRepairCost: 0, rawTotalCost: 650 }
    ];

    if (vehicleId) {
      const vid = parseInt(vehicleId);
      rawTable = rawTable.filter(r => r.vehicleId === vid);
    }

    let chartLabels = rawTable.map(r => r.registrationNumber);
    let chartValues = [];

    if (type === 'FUEL_EXPENSE') {
      chartValues = rawTable.map(r => r.rawFuelCost);
    } else if (type === 'ANNUAL_MAINTENANCE') {
      chartValues = rawTable.map(r => r.rawMaintCost);
    } else if (type === 'ANNUAL_REPAIRS') {
      chartValues = rawTable.map(r => r.rawRepairCost);
    } else {
      chartValues = rawTable.map(r => r.rawTotalCost);
    }

    const totalFuel = rawTable.reduce((acc, r) => acc + r.rawFuelCost, 0);
    const totalMaint = rawTable.reduce((acc, r) => acc + r.rawMaintCost, 0);
    const totalRepair = rawTable.reduce((acc, r) => acc + r.rawRepairCost, 0);
    const totalFleet = totalFuel + totalMaint + totalRepair;

    return {
      reportType: type,
      totalVehicles: rawTable.length,
      totalFleetCost: totalFleet,
      totalMaintenanceCost: totalMaint,
      totalRepairCost: totalRepair,
      totalFuelCost: totalFuel,
      avgFleetMileage: 7.4,
      avgFleetHealth: 81.6,
      chartLabels: chartLabels,
      chartValues: chartValues,
      tableData: rawTable
    };
  }

  // AI Assistant History & Chat
  if (endpoint.includes('/api/ai/history')) {
    return [
      { role: 'assistant', message: 'Hello! I am your FleetIQ AI Maintenance Assistant. I monitor your entire fleet telemetry, scheduled service windows, fuel performance, and daily inspection flags. How can I assist your fleet management team today?' }
    ];
  }

  if (endpoint.includes('/api/ai/chat')) {
    const q = (body.message || '').toLowerCase();
    let reply = "";

    if (q.includes('next') || (q.includes('which') && q.includes('maintenance'))) {
      reply = "Based on real-time fleet telemetry, unit **FL-105 (Ram ProMaster 3500)** requires immediate action (currently **1,500 KM OVERDUE**). Next in line is **FL-102 (Mercedes-Benz Sprinter)** with **420 KM remaining** until scheduled 40,000 KM maintenance. Unit **BUS-901 (Electric Bus)** is scheduled at 30,050 KM (5,000 KM remaining).";
    } else if (q.includes('overdue')) {
      reply = "Currently, **1 vehicle is strictly overdue**: Unit **FL-105 (Ram ProMaster 3500)** is **1,500 KM past due** (current odometer: 41,500 KM vs service threshold: 40,000 KM). Recommended action: Schedule urgent engine lubrication and multipoint inspection immediately.";
    } else if (q.includes('highest repair') || (q.includes('highest') && q.includes('cost'))) {
      reply = "Unit **FL-104 (Isuzu NPR-HD Box Truck)** has accumulated the highest single repair cost of **$1,310.00** due to transmission hard shifting and diagnostic code P0700. Unit **FL-101** follows with **$650.00** for brake relief compressor repairs.";
    } else if (q.includes('poor health') || (q.includes('health') && (q.includes('score') || q.includes('low')))) {
      reply = "Fleet health audit summary: **FL-107 (Chevrolet Express)** has the lowest score at **42/100 (CRITICAL UNSAFE)** due to high-pressure hydraulic steering line failure. **FL-105** is at **64/100** due to overdue maintenance, and **FL-104** is at **68/100** due to active transmission repairs. 5 vehicles maintain **Excellent (90-98%)** scores.";
    } else if (q.includes('repair expense') || q.includes('total repair') || (q.includes('repair') && q.includes('month'))) {
      reply = "Total fleet repair expenses for the current month stand at **$2,440.00** across 3 recorded repair work orders: $1,310.00 on FL-104 (Transmission), $650.00 on FL-101 (Air brakes), and $480.00 pending on FL-107 (Steering hydraulic line).";
    } else if (q.includes('breakdown') || q.includes('frequent')) {
      reply = "Diagnostic breakdown records identify **FL-104 (Isuzu NPR-HD)** and **FL-107 (Chevrolet Express)** as requiring elevated attention. Both units have experienced drivetrain and hydraulic faults within the last 60 days. Proactive replacement of wear items is recommended.";
    } else if (q.includes('fuel') || q.includes('mileage') || q.includes('consumption')) {
      reply = "Fleet fuel economy comparison:\n• **Most Efficient:** Mercedes-Benz Sprinter (FL-102) at **9.8 KM/L**\n• **City Delivery:** Ford Transit-250 (FL-103) at **8.5 KM/L**\n• **Box Truck:** Isuzu NPR-HD (FL-104) at **6.5 KM/L**\n• **Heavy Duty:** Freightliner Cascadia (FL-101) at **4.1 KM/L** and Volvo VNL 860 (FL-106) at **3.9 KM/L**\n• **Electric Transit Bus (BUS-901):** 0 Fuel / 1.15 kWh/km energy efficiency.";
    } else if (q.includes('recommend') || q.includes('priority') || q.includes('priorities')) {
      reply = "FleetIQ Priority Recommendations:\n1. **IMMEDIATE GROUNDING:** Keep FL-107 out of service until steering line repair is signed off.\n2. **URGENT SERVICE:** Route FL-105 into depot bay for 40,000 KM overdue service.\n3. **PRE-SCHEDULE:** Book FL-102 for 40,000 KM service in 7 days (420 KM remaining).\n4. **TIRE AUDIT:** Verify left rear brake pads on FL-102 noted in pre-trip inspection.";
    } else if (q.includes('bus') || q.includes('901')) {
      reply = "Unit **BUS-901 (Volvo 7900 Electric City Bus)** is operating at **96% health (Excellent)**. Current odometer: 25,050 KM. Regenerative braking is operating normally with next battery and inverter inspection scheduled at 30,050 KM.";
    } else {
      reply = "FleetIQ AI Maintenance Engine: Systems nominal across 9 fleet units. Unit FL-105 is currently 1,500 KM overdue for primary service. Unit FL-107 is grounded due to a steering pressure fault. All telemetry and maintenance logs are fully synchronized.";
    }

    return { reply: reply, threadId: 'gh-thread-1' };
  }

  // Notifications Read & Mark All
  if (endpoint.includes('/api/notifications') && endpoint.includes('/read')) {
    return { success: true };
  }
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

  // System Settings
  if (endpoint.includes('/api/settings')) {
    if (method === 'POST') {
      return { success: true, message: 'Settings saved' };
    }
    return {
      upcoming_service_threshold_km: 1000,
      due_soon_threshold_km: 500,
      weight_maintenance_compliance: 30,
      weight_inspection_results: 30,
      weight_repair_frequency: 20,
      weight_overdue_penalty: 20
    };
  }

  // User Management
  if (endpoint.includes('/toggle-status')) {
    const uidMatch = endpoint.match(/\/api\/users\/(\d+)\/toggle-status/);
    if (uidMatch) {
      const uid = parseInt(uidMatch[1]);
      const target = _MOCK_DB.users.find(u => u.id === uid);
      if (target) {
        target.active = !target.active;
        return target;
      }
    }
    return { success: true };
  }

  if (endpoint === '/api/users' || endpoint.startsWith('/api/users?')) {
    if (method === 'POST') {
      const newU = {
        id: _MOCK_DB.users.length + 1,
        username: body.username || `user${_MOCK_DB.users.length + 1}`,
        fullName: body.fullName || 'New Fleet Operator',
        email: body.email || 'user@fleetiq.io',
        phone: body.phone || '+1 (555) 000-0000',
        role: body.role || 'ROLE_DRIVER',
        active: true
      };
      _MOCK_DB.users.push(newU);
      return newU;
    }
    return _MOCK_DB.users;
  }

  return { success: true, message: 'Simulated operation on GitHub Pages' };
}
