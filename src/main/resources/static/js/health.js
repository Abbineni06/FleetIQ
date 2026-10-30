/**
 * FleetIQ Vehicle Health Scoring Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadFleetHealthSummary();
});

async function loadFleetHealthSummary() {
  try {
    const data = await API.get('/api/health/summary');

    document.getElementById('health-avg-score').textContent = `${data.averageFleetHealth || 88}%`;
    document.getElementById('count-excellent').textContent = data.excellentCount || 0;
    document.getElementById('count-good').textContent = data.goodCount || 0;
    document.getElementById('count-attention').textContent = data.needsAttentionCount || 0;
    document.getElementById('count-poor').textContent = (data.poorCount || 0) + (data.unsafeCount || 0);

    renderHealthTable(data.vehicleScores || []);
  } catch (err) {
    showToast('Failed to load health audit: ' + err.message, 'danger');
  }
}

function renderHealthTable(scores) {
  const tbody = document.getElementById('health-tbody');
  if (!tbody) return;

  if (scores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-muted);">No vehicle health records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = scores.map(h => {
    const score = h.overallScore || 0;
    let badgeClass = 'badge-success';
    let ringColor = 'var(--status-success)';

    if (h.unsafe || score < 50) {
      badgeClass = 'badge-danger';
      ringColor = 'var(--status-danger)';
    } else if (score < 70) {
      badgeClass = 'badge-warning';
      ringColor = 'var(--status-warning)';
    } else if (score < 85) {
      badgeClass = 'badge-info';
      ringColor = 'var(--status-info)';
    }

    const catLabel = h.unsafe ? 'CRITICAL UNSAFE' : (h.category || 'Good');

    return `
      <tr>
        <td>
          <a href="vehicle-details.html?id=${h.vehicleId}" style="font-weight:700;color:var(--text-primary);font-size:0.95rem;">
            ${escapeHtml(h.vehicleRegistration)}
          </a>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(h.vehicleModel)}</div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:40px;height:40px;border-radius:50%;border:3px solid ${ringColor};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.95rem;color:${ringColor};">
              ${score}
            </div>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${catLabel}</span></td>
        <td>
          <div style="font-weight:600;">${h.maintenanceComplianceScore || 100}%</div>
          <div style="height:4px;width:70px;background:var(--border-color);border-radius:2px;margin-top:3px;overflow:hidden;">
            <div style="height:100%;width:${h.maintenanceComplianceScore || 100}%;background:var(--primary-orange);"></div>
          </div>
        </td>
        <td>
          <div style="font-weight:600;">${h.inspectionScore || 100}%</div>
          <div style="height:4px;width:70px;background:var(--border-color);border-radius:2px;margin-top:3px;overflow:hidden;">
            <div style="height:100%;width:${h.inspectionScore || 100}%;background:var(--primary-orange);"></div>
          </div>
        </td>
        <td>
          <div style="font-weight:600;">${h.repairFrequencyScore || 100}%</div>
          <div style="height:4px;width:70px;background:var(--border-color);border-radius:2px;margin-top:3px;overflow:hidden;">
            <div style="height:100%;width:${h.repairFrequencyScore || 100}%;background:var(--primary-orange);"></div>
          </div>
        </td>
        <td style="color:${(h.overduePenalty || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'};font-weight:600;">
          ${(h.overduePenalty || 0) > 0 ? `-${h.overduePenalty} pts` : '0 pts (Compliant)'}
        </td>
        <td style="max-width:300px;">
          <div style="font-size:0.78rem;color:var(--text-primary);line-height:1.3;">
            ${h.reasons ? `<strong>Factors:</strong> ${escapeHtml(h.reasons)}` : '<span style="color:var(--text-muted);">None</span>'}
          </div>
          ${h.recommendedActions ? `
            <div style="font-size:0.75rem;color:var(--primary-orange);margin-top:3px;font-weight:500;">
              <strong>Action:</strong> ${escapeHtml(h.recommendedActions)}
            </div>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}
