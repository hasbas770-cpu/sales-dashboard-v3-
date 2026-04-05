/* ═══════════════════════════════════════
   DASHBOARD.JS — Main Dashboard
═══════════════════════════════════════ */

function renderDashboard(el) {
  const year = new Date().getFullYear();
  const ps   = DB.getObj('primarySales');
  const wf   = DB.getObj('warehouseFlow');

  const psTotal  = Object.entries(ps).filter(([k]) => k.startsWith(year+'__')).reduce((s,[,v]) => s+Number(v), 0);
  const secTotal = Object.entries(wf).filter(([k]) => k.startsWith(year+'__') && !k.includes('__prim') && k.split('__').length === 4).reduce((s,[,v]) => s+Number(v), 0);
  const flowRate = psTotal > 0 ? (secTotal / psTotal * 100).toFixed(1) : '—';

  el.innerHTML = `
    <div class="fade-up">
      <div class="kpi-grid" style="margin-bottom:20px">
        <div class="kpi-card">
          <div class="kpi-label">Primary Sales YTD</div>
          <div class="kpi-value">${fmt(psTotal)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Secondary Sales YTD</div>
          <div class="kpi-value" style="color:var(--accent)">${fmtSec(secTotal)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Flow Rate%</div>
          <div class="kpi-value" style="color:${flowRate>=80?'var(--accent2)':flowRate>=50?'var(--warn)':'var(--danger)'}">${flowRate}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">أوردرات المجمعات</div>
          <div class="kpi-value" id="kpi-orders">⏳</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">قيمة الأوردرات</div>
          <div class="kpi-value" id="kpi-orders-val">⏳</div>
        </div>
      </div>

      <div class="card">
        <h2>📦 آخر الأوردرات</h2>
        <div id="dash-orders">
          <div class="loader"><div class="spinner"></div></div>
        </div>
      </div>
    </div>`;

  apiGet('getOrders', {}, function(data) {
    if (!data || !data.success) return;
    const orders = data.orders;

    document.getElementById('kpi-orders').textContent = fmt(orders.length);
    const totalVal = orders.reduce((s,o) => {
      return s + (Number(o.quantity||0) + Number(o.bonusQty||0)) * Number(o.unitPrice||0);
    }, 0);
    document.getElementById('kpi-orders-val').textContent = fmtV(totalVal);

    // Group and show last 5
    const grouped = {};
    orders.forEach(o => {
      const d   = formatDate(o.date);
      const key = `${d}__${o.pharmacy}__${o.rep}`;
      if (!grouped[key]) grouped[key] = { date:d, pharmacy:o.pharmacy, rep:o.rep, total:0, lines:new Set() };
      const line = o.line || getLineByProduct(o.product);
      grouped[key].lines.add(line);
      grouped[key].total += (Number(o.quantity||0) + Number(o.bonusQty||0)) * Number(o.unitPrice||0);
    });

    const recent = Object.values(grouped).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);

    document.getElementById('dash-orders').innerHTML = recent.map(o => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:600;font-size:13px">${o.pharmacy}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px">👤 ${o.rep||'—'} • 📅 ${o.date}</div>
        </div>
        <div style="text-align:left">
          ${[...o.lines].filter(Boolean).map(l =>
            `<span style="background:${lc(l)}18;color:${lc(l)};border-radius:999px;padding:2px 8px;font-size:10px;font-weight:600;border:1px solid ${lc(l)}30;margin-right:4px">${l}</span>`
          ).join('')}
          <div style="font-size:13px;font-weight:700;color:var(--accent2);margin-top:4px">${fmtV(o.total)}</div>
        </div>
      </div>`).join('') || '<div class="empty">لا توجد بيانات</div>';
  });
}
