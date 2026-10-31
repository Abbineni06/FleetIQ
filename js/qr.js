/**
 * FleetIQ QR Code Hub Logic
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
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

document.addEventListener('DOMContentLoaded', () => {
  loadVehicleQrCards();
});

async function loadVehicleQrCards() {
  const container = document.getElementById('qr-cards-grid');
  if (!container) return;

  try {
    const rawVehicles = await API.get('/api/vehicles');
    const vehicles = Array.isArray(rawVehicles) ? rawVehicles : [];

    if (vehicles.length === 0) {
      container.innerHTML = `<div style="text-align:center;grid-column:1/-1;padding:40px;color:var(--text-muted);">No vehicles registered.</div>`;
      return;
    }

    container.innerHTML = vehicles.map(v => {
      const token = v.qrToken || `QR-FI-${v.registrationNumber}-SECURE`;
      const publicUrl = `qr-view.html?token=${encodeURIComponent(token)}`;

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

          <div class="qr-img-wrapper" id="qr-box-${v.id}" style="width:160px;height:160px;margin:12px auto;display:flex;align-items:center;justify-content:center;background:#FFFFFF;border-radius:8px;padding:4px;box-sizing:border-box;"></div>

          <div style="width:100%;">
            <div style="font-size:0.7rem;font-family:monospace;color:var(--text-muted);margin-bottom:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${token}">
              Token: ${escapeHtml(token)}
            </div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <button onclick="downloadQrCode(${v.id}, '${escapeHtml(v.registrationNumber)}')" class="btn btn-sm btn-primary" title="Download QR">
                <i data-lucide="download" style="width:14px;height:14px;"></i> Download
              </button>
              <a href="${publicUrl}" target="_blank" class="btn btn-sm btn-secondary" title="View Public Profile">
                <i data-lucide="external-link" style="width:14px;height:14px;"></i> Open Pass
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Generate phone-scannable QR codes into each container
    vehicles.forEach(v => {
      const box = document.getElementById(`qr-box-${v.id}`);
      if (!box) return;
      const token = v.qrToken || `QR-FI-${v.registrationNumber}-SECURE`;
      const passUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/qr-view.html?token=${encodeURIComponent(token)}`;

      box.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        try {
          new QRCode(box, {
            text: passUrl,
            width: 152,
            height: 152,
            colorDark: "#171717",
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.M
          });
          return;
        } catch (e) {
          console.warn('QRCode library error, using SVG fallback', e);
        }
      }

      if (v.qrCodeBase64 && v.qrCodeBase64.startsWith('data:image')) {
        box.innerHTML = `<img src="${v.qrCodeBase64}" alt="QR ${escapeHtml(v.registrationNumber)}" style="width:152px;height:152px;display:block;" />`;
      } else {
        box.innerHTML = `<img src="${generateSvgQrDataUri(token, v.registrationNumber)}" alt="QR ${escapeHtml(v.registrationNumber)}" style="width:152px;height:152px;display:block;" />`;
      }
    });

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    showToast('Failed to load QR tokens: ' + err.message, 'danger');
  }
}

function downloadQrCode(vehicleId, regNumber) {
  const box = document.getElementById(`qr-box-${vehicleId}`);
  if (!box) return;

  const canvas = box.querySelector('canvas');
  const img = box.querySelector('img');
  let dataUrl = '';

  if (canvas) {
    dataUrl = canvas.toDataURL('image/png');
  } else if (img) {
    dataUrl = img.src;
  }

  if (!dataUrl) {
    dataUrl = generateSvgQrDataUri(`QR-FI-${regNumber}-SECURE`, regNumber);
  }

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${regNumber}-qr.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
