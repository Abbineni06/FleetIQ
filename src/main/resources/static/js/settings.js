/**
 * FleetIQ Settings & User Management Logic
 */

let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  renderMyProfile();
  loadSettings();

  if (Auth.isAdmin()) {
    document.getElementById('user-mgmt-card').style.display = 'block';
    loadUsers();
  }
});

function renderMyProfile() {
  const user = Auth.getUser();
  if (!user) return;

  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FI';
  document.getElementById('my-avatar').textContent = initials;
  document.getElementById('my-fullname').textContent = user.fullName || user.username;
  document.getElementById('my-username-email').textContent = `@${user.username} • ${user.email}`;
  document.getElementById('my-role-badge').textContent = user.role.replace('ROLE_', '');
}

async function loadSettings() {
  try {
    const settings = await API.get('/api/settings');

    if (settings.upcoming_service_threshold_km) {
      document.getElementById('set-upcoming-km').value = settings.upcoming_service_threshold_km;
    }
    if (settings.due_soon_threshold_km) {
      document.getElementById('set-due-soon-km').value = settings.due_soon_threshold_km;
    }
    if (settings.weight_maintenance_compliance !== undefined) {
      const val = parseFloat(settings.weight_maintenance_compliance);
      document.getElementById('set-weight-maint').value = val <= 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
    }
    if (settings.weight_inspection_results !== undefined) {
      const val = parseFloat(settings.weight_inspection_results);
      document.getElementById('set-weight-insp').value = val <= 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
    }
    if (settings.weight_repair_frequency !== undefined) {
      const val = parseFloat(settings.weight_repair_frequency);
      document.getElementById('set-weight-repair').value = val <= 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
    }
    if (settings.weight_overdue_penalty !== undefined) {
      const val = parseFloat(settings.weight_overdue_penalty);
      document.getElementById('set-weight-overdue').value = val <= 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
    }
  } catch (e) {
    console.error('Could not load settings', e);
  }
}

async function handleSettingsSave(e) {
  e.preventDefault();

  const wMaint = parseInt(document.getElementById('set-weight-maint').value) || 0;
  const wInsp = parseInt(document.getElementById('set-weight-insp').value) || 0;
  const wRep = parseInt(document.getElementById('set-weight-repair').value) || 0;
  const wOver = parseInt(document.getElementById('set-weight-overdue').value) || 0;

  if (wMaint + wInsp + wRep + wOver !== 100) {
    showToast(`Health weights must sum to 100% (Current sum: ${wMaint + wInsp + wRep + wOver}%)`, 'warning');
    return;
  }

  const payload = {
    upcoming_service_threshold_km: document.getElementById('set-upcoming-km').value,
    due_soon_threshold_km: document.getElementById('set-due-soon-km').value,
    weight_maintenance_compliance: document.getElementById('set-weight-maint').value,
    weight_inspection_results: document.getElementById('set-weight-insp').value,
    weight_repair_frequency: document.getElementById('set-weight-repair').value,
    weight_overdue_penalty: document.getElementById('set-weight-overdue').value,
  };

  try {
    await API.post('/api/settings', payload);
    showToast('System thresholds updated successfully', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function loadUsers() {
  try {
    allUsers = await API.get('/api/users');
    renderUsersTable();
  } catch (err) {
    showToast('Failed to load users: ' + err.message, 'danger');
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (allUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = allUsers.map(u => {
    let roleBadge = '<span class="badge badge-secondary">Driver</span>';
    if (u.role === 'ROLE_ADMIN') roleBadge = '<span class="badge badge-orange">Admin</span>';
    if (u.role === 'ROLE_MANAGER') roleBadge = '<span class="badge badge-info">Manager</span>';

    return `
      <tr>
        <td style="font-weight:700;">${escapeHtml(u.fullName)}</td>
        <td>@${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || 'N/A')}</td>
        <td>${roleBadge}</td>
        <td>
          ${u.active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Disabled</span>'}
        </td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="toggleUser(${u.id})">
            ${u.active ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openCreateUserModal() {
  document.getElementById('create-user-form').reset();
  document.getElementById('create-user-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeCreateUserModal() {
  document.getElementById('create-user-modal').classList.remove('active');
}

async function handleCreateUserSubmit(e) {
  e.preventDefault();
  const payload = {
    fullName: document.getElementById('new-user-fullname').value.trim(),
    username: document.getElementById('new-user-username').value.trim(),
    password: document.getElementById('new-user-password').value,
    email: document.getElementById('new-user-email').value.trim(),
    phone: document.getElementById('new-user-phone').value.trim(),
    role: document.getElementById('new-user-role').value,
  };

  try {
    await API.post('/api/users', payload);
    showToast('User created successfully', 'success');
    closeCreateUserModal();
    loadUsers();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function toggleUser(id) {
  try {
    await API.put(`/api/users/${id}/toggle-status`, {});
    showToast('User status updated', 'success');
    loadUsers();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
