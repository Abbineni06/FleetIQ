/**
 * FleetIQ Notifications Management Logic
 */

let allNotifications = [];
let currentPriorityFilter = '';

document.addEventListener('DOMContentLoaded', () => {
  loadNotifications();
});

async function loadNotifications() {
  try {
    allNotifications = await API.get('/api/notifications');
    renderNotifications();
  } catch (err) {
    showToast('Failed to load notifications: ' + err.message, 'danger');
  }
}

function filterPriority(pri) {
  currentPriorityFilter = pri;
  renderNotifications();
}

function renderNotifications() {
  const container = document.getElementById('notifications-full-list');
  if (!container) return;

  const filtered = currentPriorityFilter
    ? allNotifications.filter(n => n.priority === currentPriorityFilter)
    : allNotifications;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);">No notifications match the filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(n => {
    let priBadge = '<span class="badge badge-info">Medium</span>';
    if (n.priority === 'CRITICAL') priBadge = '<span class="badge badge-danger">CRITICAL 🚨</span>';
    else if (n.priority === 'HIGH') priBadge = '<span class="badge badge-warning">High</span>';
    else if (n.priority === 'LOW') priBadge = '<span class="badge badge-secondary">Low</span>';

    const unreadStyle = !n.read ? 'border-left: 4px solid var(--primary-orange);background:var(--light-orange);' : 'background:var(--bg-subtle);';

    return `
      <div style="padding:16px;border-radius:var(--radius-md);${unreadStyle}display:flex;align-items:start;justify-content:space-between;gap:16px;">
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
            <span style="font-weight:700;font-size:0.95rem;color:var(--text-primary);">${escapeHtml(n.title)}</span>
            ${priBadge}
            ${!n.read ? '<span style="font-size:0.7rem;font-weight:700;color:var(--primary-orange);">NEW</span>' : ''}
          </div>
          <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.4;margin-bottom:8px;">
            ${escapeHtml(n.message)}
          </p>
          <div style="font-size:0.75rem;color:var(--text-muted);display:flex;gap:16px;">
            <span>${n.createdAt ? n.createdAt.replace('T', ' ').substring(0, 16) : ''}</span>
            ${n.vehicleRegistration ? `<span>Vehicle: <strong style="color:var(--primary-orange);">${escapeHtml(n.vehicleRegistration)}</strong></span>` : ''}
          </div>
        </div>

        <div style="display:flex;gap:8px;align-items:center;">
          ${n.vehicleId ? `
            <a href="vehicle-details.html?id=${n.vehicleId}" class="btn btn-sm btn-secondary">
              View Vehicle
            </a>
          ` : ''}
          ${!n.read ? `
            <button class="btn btn-sm btn-primary" onclick="markSingleRead(${n.id})">
              Mark Read
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function markSingleRead(id) {
  try {
    await API.patch(`/api/notifications/${id}/read`, {});
    const target = allNotifications.find(n => n.id === id);
    if (target) target.read = true;
    renderNotifications();
    updateNotificationBadge();
    showToast('Notification marked as read', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function markAllAsRead() {
  try {
    await API.post('/api/notifications/mark-all-read', {});
    allNotifications.forEach(n => n.read = true);
    renderNotifications();
    updateNotificationBadge();
    showToast('All notifications marked as read', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
