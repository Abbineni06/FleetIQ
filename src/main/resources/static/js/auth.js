/**
 * FleetIQ Authentication Module
 * Manages user session, JWT storage, role verification, and login/logout flows
 */

const Auth = {
  getToken() {
    return localStorage.getItem('fleetiq_token');
  },

  getUser() {
    const raw = localStorage.getItem('fleetiq_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },

  isAdmin() {
    return this.hasRole('ROLE_ADMIN');
  },

  isManager() {
    return this.hasRole('ROLE_MANAGER') || this.isAdmin();
  },

  isDriver() {
    return this.hasRole('ROLE_DRIVER');
  },

  setSession(token, user) {
    localStorage.setItem('fleetiq_token', token);
    localStorage.setItem('fleetiq_user', JSON.stringify(user));
  },

  async login(username, password) {
    const res = await API.post('/api/auth/login', { username, password });
    this.setSession(res.token, {
      userId: res.userId,
      username: res.username,
      fullName: res.fullName,
      email: res.email,
      role: res.role,
    });
    return res;
  },

  logout() {
    localStorage.removeItem('fleetiq_token');
    localStorage.removeItem('fleetiq_user');
    window.location.href = '/login.html';
  },

  checkAuth(allowedRoles = []) {
    const path = window.location.pathname;
    const isPublicPage = path.includes('login.html') || path.includes('qr-view.html') || path === '/';

    if (!this.isAuthenticated() && !isPublicPage) {
      window.location.href = '/login.html';
      return false;
    }

    if (this.isAuthenticated() && path.includes('login.html')) {
      window.location.href = '/dashboard.html';
      return false;
    }

    if (allowedRoles.length > 0 && this.isAuthenticated()) {
      const user = this.getUser();
      if (!allowedRoles.includes(user.role)) {
        showToast('Access restricted for your user role.', 'warning');
        return false;
      }
    }

    return true;
  }
};
