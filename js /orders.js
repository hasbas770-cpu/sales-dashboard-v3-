
/* ═══════════════════════════════════════
   ORDERS.JS — Pharmacy Orders
═══════════════════════════════════════ */

let _allOrders = [];

function renderOrders(el) {
  const whs = DB.get('warehouses') || [];

  el.innerHTML = `
    <div class="fade-up">
      <!-- Stats -->
      <div class="stats-row" id="ord-stats"></div>

      <!-- Filters -->
      <div class="card" style="margin-bottom:14px">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:14px">
          <div class="form-group"><label>From</label>
            <input type="date" id="f-date-from" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:12px;font-size:12px;font-family:inherit;outline:none">
          </div>
          <div class="form-group"><label>To</label>
            <input type="date" id="f-date-to" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:12px;font-size:12px;font-family:inherit;outline:none">
          </div>
          <div class="form-group"><label>Rep</label>
            <select id="f-rep" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:12px;font-size:12px;font-family:inherit;outline:none">
              <option value="">All Reps</option>
            </select>
          </div>
          <div class="form-group"><label>Pharmacy</label>
            <select id="f-ph" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:12px;font-size:12px;font-family:inherit;outline:none">
              <option value="">All Pharmacies</option>
            </select>
          </div>
          <div class="form-group"><label>Line</label>
            <select id="f-line" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:12px;font-size:12px;font-family:inherit;outline:none">
              <option value="">All Lines</option>
              <option>Derma</option><option>Optha</option><option>General Line</option><option>CM Line</option>
            </select>
          </div>
          <div class="form-group"><label>Warehouse</label>
            <select id="f-warehouse" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:12px;font-size:12px;font-family:inherit;outline:none">
              <option value="">All Warehouses</option>
              ${whs.map(w=>`<option>${w.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Region</label>
            <select id="f-region" style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:12px;font-size:12px;font-family:inherit;outline:none">
              <option value="">All Regions</option>
              ${DB.get('areas').map(a=>`<option>${a}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="clearOrdFilters()">Clear</button>
          <button class="btn btn-primary" onclick="applyOrderFilters()">Apply Filters</button>
        </div>
      </div>

      <!-- List -->
      <div id="ord-list">
        <div class="loader">
          <div class="spinner"></div>
          <span style="color:var(--muted);font-size:12px;margin-top:8px">Loading orders...</span>
        </div>
      </div>
    </div>`;

  _loadOrders();
}

function _loadOrders() {
  apiGet('getOrders', {}, function(data) {
    if (!data || !data.success) {
      document.getElementById('ord-list').innerHTML = '<div class="empty">⚠ Failed to load orders</div>';
      return;
    }

    // Group by date+pharmacy+rep+warehouse
    const grouped = {};
    data.orders.forEach(o => {
      const d   = formatDate(o.date);
      const key = `${d}__${o.pharmacy}__${o.rep}__${o.warehouse}`;
      if (!grouped[key]) grouped[key] = { id:key, date:d, rep:o.rep, pharmacy:o.pharmacy, warehouse:o.warehouse, items:[] };
      const line = o.line || getLineByProduct(o.product);
      grouped[key].items.push({
        product:o.product, line,
        qty:Number(o.quantity||0), price:Number(o.unitPrice||0),
        bonusPct:o.bonusPct, bonusQty:Number(o.bonusQty||0),
      });
    });

    _allOrders = Object.values(grouped).sort((a,b) => b.date.localeCompare(a.date));

    // Populate filter dropdowns
    const reps = [...new Set(_allOrders.map(o => o.rep).filter(Boolean))];
    const phs  = [...new Set(_allOrders.map(o => o.pharmacy).filter(Boolean))];
    const repEl = document.getElementById('f-rep');
    const phEl  = document.getElementById('f-ph');
    if (repEl) repEl.innerHTML = '<option value="">All Reps</option>' + reps.map(r=>`<option>${r}</option>`).join('');
    if (phEl)  phEl.innerHTML  = '<option value="">All Pharmacies</option>' + phs.map(p=>`<option>${p}</option>`).join('');

    applyOrderFilters();
  });
}

function applyOrderFilters() {
  const repF  = document.getElementById('f-rep')?.value       || '';
  const phF   = document.getElementById('f-ph')?.value        || '';
  const lineF = document.getElementById('f-line')?.value      || '';
  const whF   = document.getElementById('f-warehouse')?.value || '';
  const from  = document.getElementById('f-date-from')?.value || '';
  const to    = document.getElementById('f-date-to')?.value   || '';

  const filtered = _allOrders.filter(o => {
    if (repF  && o.rep       !== repF)  return false;
    if (phF   && o.pharmacy  !== phF)   return false;
    if (lineF && !o.items.some(i => i.line === lineF)) return false;
    if (whF   && o.warehouse !== whF)   return false;
    if (from  && o.date < from)         return false;
    if (to    && o.date > to)           return false;
    return true;
  });

  // Stats
  const tQty  = filtered.reduce((s,o) => o.items.reduce((ss,i) => ss+i.qty, 0)+s, 0);
  const tBon  = filtered.reduce((s,o) => o.items.reduce((ss,i) => ss+i.bonusQty, 0)+s, 0);
  const tOrd  = filtered.reduce((s,o) => o.items.reduce((ss,i) => ss+(i.qty*i.price), 0)+s, 0);
  const tBonV = filtered.reduce((s,o) => o.items.reduce((ss,i) => ss+(i.bonusQty*i.price), 0)+s, 0);

  const statsEl = document.getElementById('ord-stats');
  if (statsEl) statsEl.innerHTML = `
    <div class="stat-mini">Orders <span>${filtered.length}</span></div>
    <div class="stat-mini">Qty <span>${fmt(tQty)}</span></div>
    <div class="stat-mini">Bonus Qty <span>${fmt(tBon)}</span></div>
    <div class="stat-mini">Order Value <span>${fmtV(tOrd)}</span></div>
    <div class="stat-mini">Bonus Value <span>${fmtV(tBonV)}</span></div>
    <div class="stat-mini">Total <span>${fmtV(tOrd+tBonV)}</span></div>
  `;

  const container = document.getElementById('ord-list');
  if (!container) return;
  if (!filtered.length) { container.innerHTML = '<div class="empty">No orders found</div>'; return; }

  // Table view for single pharmacy or warehouse
  if (phF || whF) {
    const label = phF || whF;
    const icon  = phF ? '🏪' : '🏭';
    const items = [];
    filtered.forEach(o => {
      o.items.forEach(i => items.push({...i, date:o.date, rep:o.rep, pharmacy:o.pharmacy, warehouse:o.warehouse}));
    });
    const totOrd = items.reduce((s,i) => s+(i.qty*i.price), 0);
    const totBon = items.reduce((s,i) => s+(i.bonusQty*i.price), 0);

    container.innerHTML = `
      <div class="card fade-up">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
          <h2 style="margin:0">${icon} ${label}</h2>
          <div style="display:flex;gap:14px;font-size:12px;flex-wrap:wrap">
            <span style="color:var(--accent2)">Order Value: <strong>${fmtV(totOrd)}</strong></span>
            <span style="color:var(--warn)">Bonus: <strong>${fmtV(totBon)}</strong></span>
            <span style="color:#fff;font-weight:700">Total: ${fmtV(totOrd+totBon)}</span>
          </div>
        </div>
        <div class="table-wrap">
          <table><thead><tr>
            <th>Date</th>
            ${!phF ? '<th style="text-align:right">Pharmacy</th>' : ''}
            <th style="text-align:right">Product</th>
            <th>Line</th><th>Rep</th>
            ${!whF ? '<th>Warehouse</th>' : ''}
            <th>Qty</th><th>Price</th><th>Order Value</th>
            <th>Bonus%</th><th>Bonus Qty</th><th>Bonus Value</th><th>Total</th>
          </tr></thead><tbody>
            ${items.map(i => {
              const iOrd = i.qty * i.price;
              const iBon = i.bonusQty * i.price;
              return `<tr>
                <td style="color:var(--muted);white-space:nowrap">${i.date}</td>
                ${!phF ? `<td style="text-align:right;font-weight:600;white-space:nowrap">${i.pharmacy}</td>` : ''}
                <td style="text-align:right;font-weight:600;white-space:nowrap">${i.product}</td>
                <td>${i.line ? `<span style="background:${lc(i.line)}18;color:${lc(i.line)};border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600">${i.line}</span>` : '—'}</td>
                <td style="color:var(--muted);font-size:11px">${i.rep||'—'}</td>
                ${!whF ? `<td style="color:var(--muted);font-size:11px">${i.warehouse||'—'}</td>` : ''}
                <td style="font-weight:700">${fmt(i.qty)}</td>
                <td>${fmtV(i.price)}</td>
                <td style="color:var(--accent2);font-weight:700">${fmtV(iOrd)}</td>
                <td style="color:var(--muted)">${i.bonusPct||0}%</td>
                <td style="color:var(--warn);font-weight:700">${fmt(i.bonusQty||0)}</td>
                <td style="color:var(--warn);font-weight:700">${fmtV(iBon)}</td>
                <td style="color:#fff;font-weight:700;background:rgba(255,255,255,.04)">${fmtV(iOrd+iBon)}</td>
              </tr>`;
            }).join('')}
            <tr style="background:rgba(255,255,255,.06);font-weight:700">
              <td colspan="${4 + (!phF?1:0) + (!whF?1:0)}" style="text-align:right;color:var(--muted)">Total</td>
              <td style="color:var(--accent2)">${fmtV(totOrd)}</td>
              <td></td>
              <td style="color:var(--warn)">${fmt(items.reduce((s,i)=>s+i.bonusQty,0))}</td>
              <td style="color:var(--warn)">${fmtV(totBon)}</td>
              <td style="color:#fff">${fmtV(totOrd+totBon)}</td>
            </tr>
          </tbody></table>
        </div>
      </div>`;
    return;
  }

  // Cards view
  container.innerHTML = filtered.map((o, oi) => {
    const lines   = [...new Set(o.items.map(i => i.line).filter(Boolean))];
    const ordVal  = o.items.reduce((s,i) => s+(i.qty*i.price), 0);
    const bonVal  = o.items.reduce((s,i) => s+(i.bonusQty*i.price), 0);
    const id      = `ord_${oi}`;
    return `<div class="order-card">
      <div class="order-head" onclick="document.getElementById('ob-${id}').classList.toggle('open')">
        <div class="order-info">
          <span style="font-size:14px;font-weight:700;color:#fff">${o.pharmacy}</span>
          ${o.rep       ? `<span class="pill">👤 ${o.rep}</span>`       : ''}
          ${o.warehouse ? `<span class="pill">🏭 ${o.warehouse}</span>` : ''}
          <span class="pill">📅 ${o.date}</span>
          ${lines.map(l => `<span style="background:${lc(l)}18;color:${lc(l)};border:1px solid ${lc(l)}33;border-radius:999px;padding:3px 8px;font-size:10px;font-weight:700">${l}</span>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0">
          <span style="font-size:11px;color:var(--accent2)">Order: <strong>${fmtV(ordVal)}</strong></span>
          <span style="font-size:11px;color:var(--warn)">Bonus: <strong>${fmtV(bonVal)}</strong></span>
          <span style="font-size:12px;color:#fff;font-weight:700">Total: ${fmtV(ordVal+bonVal)}</span>
        </div>
      </div>
      <div class="order-body" id="ob-${id}">
        <div class="table-wrap">
          <table><thead><tr>
            <th style="text-align:right">Product</th><th>Line</th>
            <th>Qty</th><th>Price</th><th>Order Value</th>
            <th>Bonus%</th><th>Bonus Qty</th><th>Bonus Value</th><th>Total</th>
          </tr></thead><tbody>
            ${o.items.map(i => {
              const iOrd = i.qty * i.price;
              const iBon = i.bonusQty * i.price;
              return `<tr>
                <td style="text-align:right;font-weight:600;white-space:nowrap">${i.product}</td>
                <td>${i.line ? `<span style="background:${lc(i.line)}18;color:${lc(i.line)};border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600">${i.line}</span>` : '—'}</td>
                <td style="font-weight:700">${fmt(i.qty)}</td>
                <td>${fmtV(i.price)}</td>
                <td style="color:var(--accent2);font-weight:700">${fmtV(iOrd)}</td>
                <td style="color:var(--muted)">${i.bonusPct||0}%</td>
                <td style="color:var(--warn);font-weight:700">${fmt(i.bonusQty||0)}</td>
                <td style="color:var(--warn);font-weight:700">${fmtV(iBon)}</td>
                <td style="color:#fff;font-weight:700;background:rgba(255,255,255,.04)">${fmtV(iOrd+iBon)}</td>
              </tr>`;
            }).join('')}
            <tr style="background:rgba(255,255,255,.04);font-weight:700">
              <td colspan="4" style="text-align:right;color:var(--muted)">Total</td>
              <td style="color:var(--accent2)">${fmtV(ordVal)}</td>
              <td></td>
              <td style="color:var(--warn)">${fmt(o.items.reduce((s,i)=>s+i.bonusQty,0))}</td>
              <td style="color:var(--warn)">${fmtV(bonVal)}</td>
              <td style="color:#fff">${fmtV(ordVal+bonVal)}</td>
            </tr>
          </tbody></table>
        </div>
      </div>
    </div>`;
  }).join('');
}

function clearOrdFilters() {
  ['f-rep','f-ph','f-line','f-warehouse','f-region','f-date-from','f-date-to'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  applyOrderFilters();
}
