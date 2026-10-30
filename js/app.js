/**
 * FleetIQ Main Application Framework
 * Handles layout rendering, sidebar state, theme switching, notifications, and Lucide icons
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check auth first
  if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('qr-view.html')) {
    if (!Auth.checkAuth()) return;
  }

  // Initialize theme
  initTheme();

  // If page contains sidebar container, render sidebar & header
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    renderSidebar(sidebarContainer);
  }

  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    renderHeader(headerContainer);
  }

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Poll notifications
  if (Auth.isAuthenticated()) {
    updateNotificationBadge();
    setInterval(updateNotificationBadge, 30000);
  }
});

function initTheme() {
  const savedTheme = localStorage.getItem('fleetiq_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('fleetiq_theme', next);

  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    icon.setAttribute('data-lucide', next === 'dark' ? 'sun' : 'moon');
    if (window.lucide) lucide.createIcons();
  }
}

function getNavItemsForRole(role, currentPath) {
  if (role === 'ROLE_DRIVER') {
    return `
      <div class="nav-section-title">Driver Operations</div>
      <a href="dashboard.html" class="nav-item ${currentPath.includes('dashboard.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="layout-dashboard"></i></span>
        <span class="nav-text">Driver Hub</span>
      </a>
      <a href="inspections.html" class="nav-item ${currentPath.includes('inspections.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="clipboard-check"></i></span>
        <span class="nav-text">Pre-Trip Inspection</span>
      </a>
      <a href="fuel.html" class="nav-item ${currentPath.includes('fuel.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="fuel"></i></span>
        <span class="nav-text">Fuel Stop Log</span>
      </a>
      <a href="maintenance.html" class="nav-item ${currentPath.includes('maintenance.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="sparkles"></i></span>
        <span class="nav-text">Service Countdown</span>
      </a>
      <a href="qr-history.html" class="nav-item ${currentPath.includes('qr-history.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="qr-code"></i></span>
        <span class="nav-text">Vehicle QR Pass</span>
      </a>

      <div class="nav-section-title">Support & Alerts</div>
      <a href="ai-assistant.html" class="nav-item ${currentPath.includes('ai-assistant.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="bot"></i></span>
        <span class="nav-text">AI Assistant</span>
        <span class="nav-badge" style="background:var(--primary-orange);">AI</span>
      </a>
      <a href="notifications.html" class="nav-item ${currentPath.includes('notifications.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="bell"></i></span>
        <span class="nav-text">Notifications</span>
        <span class="nav-badge" id="sidebar-notif-count" style="display:none;">0</span>
      </a>
    `;
  }

  if (role === 'ROLE_MANAGER') {
    return `
      <div class="nav-section-title">Operations</div>
      <a href="dashboard.html" class="nav-item ${currentPath.includes('dashboard.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="layout-dashboard"></i></span>
        <span class="nav-text">Operations Dashboard</span>
      </a>

      <div class="nav-section-title">Fleet Dispatch</div>
      <a href="vehicles.html" class="nav-item ${currentPath.includes('vehicles.html') || currentPath.includes('vehicle-details.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="truck"></i></span>
        <span class="nav-text">Vehicles & Drivers</span>
      </a>
      <a href="qr-history.html" class="nav-item ${currentPath.includes('qr-history.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="qr-code"></i></span>
        <span class="nav-text">QR Vehicle Passports</span>
      </a>

      <div class="nav-section-title">Maintenance</div>
      <a href="maintenance.html" class="nav-item ${currentPath.includes('maintenance.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="sparkles"></i></span>
        <span class="nav-text">Predictive Service</span>
      </a>
      <a href="repairs.html" class="nav-item ${currentPath.includes('repairs.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="wrench"></i></span>
        <span class="nav-text">Repair Tracker</span>
      </a>

      <div class="nav-section-title">Monitoring</div>
      <a href="fuel.html" class="nav-item ${currentPath.includes('fuel.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="fuel"></i></span>
        <span class="nav-text">Fuel Analytics</span>
      </a>
      <a href="inspections.html" class="nav-item ${currentPath.includes('inspections.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="clipboard-check"></i></span>
        <span class="nav-text">Daily Inspections</span>
      </a>
      <a href="health.html" class="nav-item ${currentPath.includes('health.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="activity"></i></span>
        <span class="nav-text">Health Scores</span>
      </a>

      <div class="nav-section-title">Intelligence & Reports</div>
      <a href="ai-assistant.html" class="nav-item ${currentPath.includes('ai-assistant.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="bot"></i></span>
        <span class="nav-text">AI Assistant</span>
        <span class="nav-badge" style="background:var(--primary-orange);">AI</span>
      </a>
      <a href="reports.html" class="nav-item ${currentPath.includes('reports.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="bar-chart-3"></i></span>
        <span class="nav-text">Fleet Reports</span>
      </a>

      <div class="nav-section-title">Alerts</div>
      <a href="notifications.html" class="nav-item ${currentPath.includes('notifications.html') ? 'active' : ''}">
        <span class="nav-icon"><i data-lucide="bell"></i></span>
        <span class="nav-text">Notifications</span>
        <span class="nav-badge" id="sidebar-notif-count" style="display:none;">0</span>
      </a>
    `;
  }

  // ROLE_ADMIN: Total Access
  return `
    <div class="nav-section-title">Executive Overview</div>
    <a href="dashboard.html" class="nav-item ${currentPath.includes('dashboard.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="layout-dashboard"></i></span>
      <span class="nav-text">Admin Dashboard</span>
    </a>

    <div class="nav-section-title">Fleet Management</div>
    <a href="vehicles.html" class="nav-item ${currentPath.includes('vehicles.html') || currentPath.includes('vehicle-details.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="truck"></i></span>
      <span class="nav-text">All Vehicles</span>
    </a>
    <a href="qr-history.html" class="nav-item ${currentPath.includes('qr-history.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="qr-code"></i></span>
      <span class="nav-text">QR Vehicle History</span>
    </a>

    <div class="nav-section-title">Maintenance & Workshop</div>
    <a href="maintenance.html" class="nav-item ${currentPath.includes('maintenance.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="sparkles"></i></span>
      <span class="nav-text">Predictive Service</span>
    </a>
    <a href="repairs.html" class="nav-item ${currentPath.includes('repairs.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="wrench"></i></span>
      <span class="nav-text">Repair Tracker</span>
    </a>

    <div class="nav-section-title">Monitoring & Telematics</div>
    <a href="fuel.html" class="nav-item ${currentPath.includes('fuel.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="fuel"></i></span>
      <span class="nav-text">Fuel Analytics</span>
    </a>
    <a href="inspections.html" class="nav-item ${currentPath.includes('inspections.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="clipboard-check"></i></span>
      <span class="nav-text">Daily Inspection</span>
    </a>
    <a href="health.html" class="nav-item ${currentPath.includes('health.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="activity"></i></span>
      <span class="nav-text">Health Scores</span>
    </a>

    <div class="nav-section-title">Intelligence & Financials</div>
    <a href="ai-assistant.html" class="nav-item ${currentPath.includes('ai-assistant.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="bot"></i></span>
      <span class="nav-text">AI Assistant</span>
      <span class="nav-badge" style="background:var(--primary-orange);">AI</span>
    </a>
    <a href="reports.html" class="nav-item ${currentPath.includes('reports.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="bar-chart-3"></i></span>
      <span class="nav-text">Reports & Ledger</span>
    </a>

    <div class="nav-section-title">System Administration</div>
    <a href="notifications.html" class="nav-item ${currentPath.includes('notifications.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="bell"></i></span>
      <span class="nav-text">Notifications</span>
      <span class="nav-badge" id="sidebar-notif-count" style="display:none;">0</span>
    </a>
    <a href="settings.html" class="nav-item ${currentPath.includes('settings.html') ? 'active' : ''}">
      <span class="nav-icon"><i data-lucide="settings"></i></span>
      <span class="nav-text">Settings & Rules</span>
    </a>
  `;
}

function renderSidebar(container) {
  const currentPath = window.location.pathname;
  const user = Auth.getUser() || { fullName: 'Fleet User', role: 'ROLE_MANAGER' };
  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FI';
  const roleDisplay = user.role ? user.role.replace('ROLE_', '').toLowerCase() : 'user';

  const isCollapsed = localStorage.getItem('fleetiq_sidebar_collapsed') === 'true';
  if (isCollapsed) {
    container.classList.add('collapsed');
    document.body.classList.add('sidebar-collapsed');
  } else {
    container.classList.remove('collapsed');
    document.body.classList.remove('sidebar-collapsed');
  }

  container.innerHTML = `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="app-sidebar">
      <div class="sidebar-header">
        <a href="dashboard.html" class="brand-logo">
          <div class="brand-icon">
            <i data-lucide="shield-check" style="width:20px;height:20px;"></i>
          </div>
          <span class="brand-text">Fleet<span class="brand-tag">IQ</span></span>
        </a>
        <button class="sidebar-toggle-btn" id="sidebar-collapse-btn" title="Toggle Sidebar">
          <i data-lucide="panel-left-close" style="width:18px;height:18px;"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        ${getNavItemsForRole(user.role, currentPath)}
      </nav>

      <div class="sidebar-footer">
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
          <div class="user-name">${user.fullName || user.username}</div>
          <div class="user-role">${roleDisplay}</div>
        </div>
        <button class="sidebar-toggle-btn" onclick="Auth.logout()" title="Sign Out">
          <i data-lucide="log-out" style="width:18px;height:18px;"></i>
        </button>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `;

  // Attach toggle listeners
  const toggleBtn = document.getElementById('sidebar-collapse-btn');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      const isColl = sidebar.classList.toggle('collapsed');
      container.classList.toggle('collapsed', isColl);
      document.body.classList.toggle('sidebar-collapsed', isColl);
      localStorage.setItem('fleetiq_sidebar_collapsed', isColl);
      // Trigger Chart.js and responsive elements resize reflow
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
  }
}

function renderHeader(container) {
  const pageTitle = container.getAttribute('data-title') || 'Dashboard';
  const breadcrumb = container.getAttribute('data-breadcrumb') || 'FleetIQ / Overview';
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const themeIcon = currentTheme === 'dark' ? 'sun' : 'moon';

  container.innerHTML = `
    <header class="top-header">
      <div class="header-left">
        <button class="mobile-menu-btn" id="mobile-drawer-btn" title="Open Menu">
          <i data-lucide="menu" style="width:22px;height:22px;"></i>
        </button>
        <div class="page-title-box">
          <h1>${pageTitle}</h1>
          <div class="breadcrumbs">${breadcrumb}</div>
        </div>
      </div>

      <div class="header-right">
        <div class="search-box">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="global-search-input" placeholder="Search vehicles, VIN..." onkeydown="handleGlobalSearch(event)" />
        </div>

        <button class="icon-button" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
          <i data-lucide="${themeIcon}" id="theme-toggle-icon" style="width:18px;height:18px;"></i>
        </button>

        <div style="position:relative;">
          <button class="icon-button" id="notif-bell-btn" title="Notifications" onclick="toggleNotificationDropdown()">
            <i data-lucide="bell" style="width:18px;height:18px;"></i>
            <span class="badge-dot" id="header-notif-dot" style="display:none;"></span>
          </button>

          <div class="notification-dropdown" id="notification-dropdown">
            <div class="notif-header">
              <span style="font-weight:700;font-size:0.9rem;">Fleet Alerts</span>
              <a href="notifications.html" style="font-size:0.75rem;font-weight:600;">View All</a>
            </div>
            <div class="notif-list" id="notif-dropdown-list">
              <div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Loading alerts...</div>
            </div>
            <div style="padding:8px 16px;border-top:1px solid var(--border-color);text-align:center;">
              <button class="btn btn-sm btn-secondary" style="width:100%;" onclick="markAllNotificationsRead()">Mark All Read</button>
            </div>
          </div>
        </div>

        <div class="user-avatar" style="cursor:pointer;" onclick="window.location.href='settings.html'" title="User Profile">
          <i data-lucide="user" style="width:18px;height:18px;"></i>
        </div>
      </div>
    </header>
  `;

  const mobileBtn = document.getElementById('mobile-drawer-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('app-sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar && overlay) {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
      }
    });
  }
}

function handleGlobalSearch(event) {
  if (event.key === 'Enter') {
    const query = event.target.value.trim();
    if (query) {
      window.location.href = `/vehicles.html?search=${encodeURIComponent(query)}`;
    }
  }
}

async function updateNotificationBadge() {
  try {
    const data = await API.get('/api/notifications/unread-count');
    const count = data.unreadCount || 0;
    const dot = document.getElementById('header-notif-dot');
    const sidebarCount = document.getElementById('sidebar-notif-count');

    if (dot) dot.style.display = count > 0 ? 'block' : 'none';
    if (sidebarCount) {
      sidebarCount.style.display = count > 0 ? 'inline-block' : 'none';
      sidebarCount.textContent = count > 9 ? '9+' : count;
    }
  } catch (e) {
    // Ignore in background
  }
}

async function toggleNotificationDropdown() {
  const dd = document.getElementById('notification-dropdown');
  if (!dd) return;
  dd.classList.toggle('active');

  if (dd.classList.contains('active')) {
    loadDropdownNotifications();
  }
}

async function loadDropdownNotifications() {
  const list = document.getElementById('notif-dropdown-list');
  if (!list) return;

  try {
    const items = await API.get('/api/notifications/recent');
    if (!items || items.length === 0) {
      list.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No new notifications.</div>`;
      return;
    }

    list.innerHTML = items.slice(0, 5).map(n => `
      <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="openNotificationDetail(${n.id}, ${n.vehicleId})">
        <div>
          <div class="notif-title">${escapeHtml(n.title)}</div>
          <div class="notif-msg">${escapeHtml(n.message)}</div>
          <div class="notif-time">${formatTimeAgo(n.createdAt)}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = `<div style="padding:16px;text-align:center;color:var(--status-danger);font-size:0.85rem;">Failed to load alerts</div>`;
  }
}

async function markAllNotificationsRead() {
  try {
    await API.post('/api/notifications/mark-all-read', {});
    updateNotificationBadge();
    loadDropdownNotifications();
    showToast('All notifications marked as read', 'success');
  } catch (e) {
    showToast('Failed to mark notifications', 'danger');
  }
}

function openNotificationDetail(notifId, vehicleId) {
  API.patch(`/api/notifications/${notifId}/read`, {}).then(() => {
    updateNotificationBadge();
    if (vehicleId) {
      window.location.href = `/vehicle-details.html?id=${vehicleId}`;
    } else {
      window.location.href = 'notifications.html';
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
