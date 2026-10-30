/**
 * FleetIQ QR Code Hub Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadVehicleQrCards();
});

async function loadVehicleQrCards() {
  const container = document.getElementById('qr-cards-grid');
  if (!container) return;

  try {
    const vehicles = await API.get('/api/vehicles');

    if (vehicles.length === 0) {
      container.innerHTML = `<div style="text-align:center;grid-column:1/-1;padding:40px;color:var(--text-muted);">No vehicles registered.</div>`;
      return;
    }

    container.innerHTML = vehicles.map(v => {
      const publicUrl = `/qr-view.html?token=${v.qrToken}`;

      return `
        <div class="qr-badge-card">
          <div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--text-primary);letter-spacing:-0.5px;">
              ${escapeHtml(v.registrationNumber)}
            </div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">
              ${escapeHtml(v.make)} ${escapeHtml(v.model)}
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(v.vehicleType)}</div>
          </div>

          <div class="qr-img-wrapper">
            <img src="${v.qrCodeBase64}" alt="QR ${escapeHtml(v.registrationNumber)}" style="width:160px;height:160px;display:block;" />
          </div>

          <div style="width:100%;">
            <div style="font-size:0.7rem;font-family:monospace;color:var(--text-muted);margin-bottom:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              Token: ${v.qrToken || '...'}
            </div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <a href="${v.qrCodeBase64}" download="${v.registrationNumber}-qr.png" class="btn btn-sm btn-primary" title="Download QR PNG">
                <i data-lucide="download" style="width:14px;height:14px;"></i> Download
              </a>
              <a href="${publicUrl}" target="_blank" class="btn btn-sm btn-secondary" title="View Public Profile">
                <i data-lucide="external-link" style="width:14px;height:14px;"></i> Open Pass
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    showToast('Failed to load QR tokens: ' + err.message, 'danger');
  }
}
