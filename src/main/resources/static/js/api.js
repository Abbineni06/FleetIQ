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
          window.location.href = '/login.html';
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
