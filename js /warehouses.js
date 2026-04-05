
/* ═══════════════════════════════════════
   WAREHOUSES.JS — Warehouses Management
═══════════════════════════════════════ */

/* ── Stats helpers ── */
function getWhStats(whName) {
  const stock = DB.getObj('stockEntry');
  const wf    = DB.getObj('warehouseFlow');
  const ps    = DB.getObj('primarySales');
  const year  = new Date().getFullYear();

  let latestStock = 0, latestMonth = 0, secondary = 0, primary = 0;

  // آخر closing stock
  Object.entries(stock).forEach(([k,v]) => {
    if (k.includes(`__${whName}`) && !k.endsWith('__prim')) {
      const parts = k.split('__');
      const m = Number(parts[3]);
      if (Number(parts[0]) === year && m >= latestMonth) {
        latestMonth = m;
        latestStock = Number(v.close || 0);
      }
    }
  });

  // Secondary YTD
  Object.entries(wf).forEach(([k,v]) => {
    if (k.startsWith(year+'__') && k.includes(`__${whName}`)) secondary += Number(v||0);
  });

  // Primary YTD
  Object.entries(ps).forEach(([k,v]) => {
    if (k.startsWith(year+'__')) primary += Number(v||0);
  });

  const flow       = primary > 0 ? (secondary / primary * 100) : 0;
  const avgMonthly = latestMonth > 0 ? secondary / latestMonth : 0;
  const forecast   = avgMonthly > 0 ? Math.round(latestStock / avgMonthly * 30) : 0;

  return { stock:latestStock, secondary, primary, flow, forecast };
}

function getWhGroupStats(whNames) {
  let stock = 0, secondary = 0, primary = 0;
  whNames.forEach(n => {
    const s = getWhStats(n);
    stock += s.stock; secondary += s.secondary; primary += s.primary;
  });
  const flow = primary > 0 ? (secondary / primary * 100) : 0;
  return { stock, secondary, primary, flow };
}

function flowColor(f) {
  return f >= 80 ? 'var(--accent2)' : f >= 50 ? 'var(--warn)' : 'var(--danger)';
}

/* ── Warehouses List ── */
function renderWarehouses(el) {
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 style="margin:0">🏭 المخازن</h2>
          <button class="btn btn-primary btn-sm" onclick="showWhForm()">➕ إضافة مخزن</button>
        </div>
        <div id="wh-form" style="display:none;margin-bottom:16px;padding:14px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:12px">
          <div class="form-grid">
            <div class="form-group"><label>اسم المخزن</label><input type="text" id="wh-name" placeholder="مثال: منهل"></div>
            <div class="form-group"><label>النوع</label>
              <select id="wh-type" onchange="toggleWhGroup()">
                <option value="standalone">مستقل</option>
                <option value="branch">فرعي (ضمن مجموعة)</option>
              </select>
            </div>
            <div class="form-group" id="wh-group-wrap" style="display:none">
              <label>المجموعة</label><input type="text" id="wh-group" placeholder="مثال: سيادة Group">
            </div>
            <div class="form-group"><label>المنطقة</label>
              <select id="wh-area">${DB.get('areas').map(a=>`<option>${a}</option>`).join('')||'<option>Basra</option>'}</select>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-success btn-sm" onclick="addWarehouse()">✓ حفظ</button>
            <button class="btn btn-ghost btn-sm" onclick="document.getElementById('wh-form').style.display='none'">إلغاء</button>
          </div>
        </div>
        <div id="wh-list"></div>
      </div>
    </div>`;
  renderWhList();
}

function showWhForm() { document.getElementById('wh-form').style.display = 'block'; }
function toggleWhGroup() {
  document.getElementById('wh-group-wrap').style.display =
    document.getElementById('wh-type').value === 'branch' ? 'block' : 'none';
}

function addWarehouse() {
  const name  = document.getElementById('wh-name').value.trim();
  const type  = document.getElementById('wh-type').value;
  const group = document.getElementById('wh-group')?.value.trim() || '';
  const area  = document.getElementById('wh-area').value;
  if (!name) return alert('ادخل اسم المخزن');
  const whs = DB.get('warehouses') || [];
  if (whs.find(w => w.name === name)) return alert('المخزن موجود');
  whs.push({ name, type, group: type==='branch' ? group : '', area });
  DB.set('warehouses', whs);
  document.getElementById('wh-form').style.display = 'none';
  document.getElementById('wh-name').value = '';
  renderWhList();
  toast('✓ تم الحفظ');
}

function deleteWarehouse(i) {
  const whs = DB.get('warehouses') || [];
  if (!confirm(`حذف ${whs[i].name}؟`)) return;
  whs.splice(i, 1);
  DB.set('warehouses', whs);
  renderWhList();
  toast('✓ تم الحذف');
}

function editWarehouse(i) {
  const whs = DB.get('warehouses') || [];
  const w   = whs[i]; if (!w) return;
  const newName  = prompt('اسم المخزن:', w.name);    if (newName === null) return;
  const newType  = prompt('النوع (standalone/branch):', w.type); if (newType === null) return;
  let   newGroup = '';
  if (newType === 'branch') newGroup = prompt('المجموعة:', w.group) || '';
  const newArea  = prompt('المنطقة:', w.area || 'Basra'); if (newArea === null) return;
  whs[i] = { name:newName.trim(), type:newType, group:newGroup, area:newArea };
  DB.set('warehouses', whs);
  renderWhList();
  toast('✓ تم التحديث');
}

function renderWhList() {
  const whs  = DB.get('warehouses') || [];
  const cont = document.getElementById('wh-list');
  if (!whs.length) { cont.innerHTML = '<div class="empty">لا توجد مخازن</div>'; return; }

  const groups = {}, standalone = [];
  whs.forEach((w,i) => {
    if (w.type === 'branch' && w.group) {
      if (!groups[w.group]) groups[w.group] = [];
      groups[w.group].push({...w, idx:i});
    } else standalone.push({...w, idx:i});
  });

  let html = '';

  // Groups
  Object.entries(groups).forEach(([gName, members]) => {
    const gs = getWhGroupStats(members.map(m => m.name));
    html += `
      <div style="margin-bottom:16px">
        <div onclick="navigate('wh_group_${encodeURIComponent(gName)}',null)"
          style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
          background:linear-gradient(135deg,rgba(79,142,247,.1),rgba(139,92,246,.08));
          border:1px solid rgba(79,142,247,.25);border-radius:14px;cursor:pointer;margin-bottom:8px;transition:all .2s"
          onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">📦</span>
            <div>
              <div style="font-weight:700;font-size:14px;color:#fff">${gName}</div>
              <div style="font-size:11px;color:var(--muted)">${members.length} مخازن فرعية</div>
            </div>
          </div>
          <div style="display:flex;gap:16px;align-items:center">
            <div style="text-align:center"><div style="font-size:10px;color:var(--muted)">Stock</div><div style="font-weight:700;color:var(--accent2)">${fmt(gs.stock)}</div></div>
            <div style="text-align:center"><div style="font-size:10px;color:var(--muted)">Secondary</div><div style="font-weight:700;color:var(--accent)">${fmt(gs.secondary)}</div></div>
            <div style="text-align:center"><div style="font-size:10px;color:var(--muted)">Flow%</div><div style="font-weight:700;color:${flowColor(gs.flow)}">${gs.flow.toFixed(0)}%</div></div>
            <span style="color:var(--muted);font-size:18px">›</span>
          </div>
        </div>
        <div style="padding-right:16px;border-right:2px solid rgba(79,142,247,.2)">
          ${members.map(w => _whRow(w)).join('')}
        </div>
      </div>`;
  });

  // Standalone
  if (standalone.length) {
    html += `<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:8px">🏬 مخازن مستقلة</div>`;
    standalone.forEach(w => { html += _whRow(w); });
  }

  cont.innerHTML = html;
}

function _whRow(w) {
  const ws = getWhStats(w.name);
  return `<div style="display:flex;align-items:center;justify-content:space-between;
    padding:10px 12px;background:rgba(255,255,255,.03);border:1px solid var(--border);
    border-radius:10px;margin-bottom:6px;cursor:pointer;transition:all .2s"
    onclick="navigate('wh_${encodeURIComponent(w.name)}',null)"
    onmouseover="this.style.background='rgba(255,255,255,.06)'"
    onmouseout="this.style.background='rgba(255,255,255,.03)'">
    <div style="display:flex;align-items:center;gap:8px">
      <span>🏭</span>
      <span style="font-weight:600">${w.name}</span>
      <span style="font-size:10px;color:var(--muted)">${w.area||''}</span>
    </div>
    <div style="display:flex;gap:14px;align-items:center">
      <div style="text-align:center"><div style="font-size:10px;color:var(--muted)">Stock</div><div style="font-weight:700;color:var(--accent2)">${fmt(ws.stock)}</div></div>
      <div style="text-align:center"><div style="font-size:10px;color:var(--muted)">Secondary</div><div style="font-weight:700;color:var(--accent)">${fmtSec(ws.secondary)}</div></div>
      <div style="text-align:center"><div style="font-size:10px;color:var(--muted)">Flow%</div><div style="font-weight:700;color:${flowColor(ws.flow)}">${ws.flow.toFixed(0)}%</div></div>
      <div style="text-align:center"><div style="font-size:10px;color:var(--muted)">Forecast</div><div style="font-weight:700;color:var(--warn)">${ws.forecast>0?ws.forecast+'d':'—'}</div></div>
      <div style="display:flex;gap:4px">
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();editWarehouse(${w.idx})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteWarehouse(${w.idx})">🗑</button>
      </div>
    </div>
  </div>`;
}

/* ── Warehouse Detail ── */
function renderWhDetail(el, whName) {
  const stats = getWhStats(whName);
  const prods = DB.get('products');
  const stock = DB.getObj('stockEntry');
  const wf    = DB.getObj('warehouseFlow');
  const ps    = DB.getObj('primarySales');
  const year  = new Date().getFullYear();

  const prodData = prods.map(p => {
    let closing = 0, opening = 0, lastMonth = 0;
    Object.entries(stock).forEach(([k,v]) => {
      if (k.includes(`__${p.name}__`) && k.includes(`__${whName}`) && !k.endsWith('__prim')) {
        const parts = k.split('__');
        const m = Number(parts[3]);
        if (Number(parts[0]) === year && m >= lastMonth) {
          lastMonth = m; closing = Number(v.close||0); opening = Number(v.open||0);
        }
      }
    });
    let sec = 0;
    Object.entries(wf).forEach(([k,v]) => {
      if (k.startsWith(`${year}__${p.name}__`) && k.includes(`__${whName}`)) sec += Number(v||0);
    });
    let pri = 0;
    Object.entries(ps).forEach(([k,v]) => {
      if (k.startsWith(`${year}__${p.name}__`)) pri += Number(v||0);
    });
    const flow = pri > 0 ? (sec / pri * 100) : 0;
    const avg  = lastMonth > 0 ? sec / lastMonth : 0;
    const fore = avg > 0 ? Math.round(closing / avg * 30) : 0;
    return { name:p.name, line:p.line, opening, closing, sec, pri, flow, fore };
  }).filter(p => p.closing > 0 || p.sec !== 0 || p.pri > 0);

  el.innerHTML = `
    <div class="fade-up">
      <button class="btn btn-ghost btn-sm" onclick="navigate('warehouses',null)" style="margin-bottom:14px">← رجوع</button>
      <div class="kpi-grid" style="margin-bottom:16px">
        <div class="kpi-card"><div class="kpi-label">Current Stock</div><div class="kpi-value">${fmt(stats.stock)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Secondary YTD</div><div class="kpi-value" style="color:var(--accent)">${fmtSec(stats.secondary)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Primary YTD</div><div class="kpi-value" style="color:var(--muted)">${fmt(stats.primary)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Flow%</div><div class="kpi-value" style="color:${flowColor(stats.flow)}">${stats.flow.toFixed(1)}%</div></div>
        <div class="kpi-card"><div class="kpi-label">Forecast</div><div class="kpi-value" style="color:var(--warn)">${stats.forecast > 0 ? stats.forecast+'d' : '—'}</div></div>
      </div>
      <div class="card">
        <h2>💊 تفاصيل المواد</h2>
        ${prodData.length ? `
        <div class="table-wrap"><table>
          <thead><tr>
            <th style="text-align:right">المادة</th><th>Line</th>
            <th>Opening</th><th>Closing</th><th>Secondary</th><th>Primary</th><th>Flow%</th><th>Forecast</th>
          </tr></thead><tbody>
          ${prodData.map(p => `<tr>
            <td style="text-align:right;font-weight:600">${p.name}</td>
            <td><span style="background:${lc(p.line)}18;color:${lc(p.line)};border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600">${p.line}</span></td>
            <td>${fmt(p.opening)}</td>
            <td style="color:var(--accent2);font-weight:700">${fmt(p.closing)}</td>
            <td style="color:${p.sec<0?'var(--danger)':p.sec>0?'var(--accent)':'var(--muted)'};font-weight:700">${fmtSec(p.sec)}</td>
            <td style="color:var(--muted)">${fmt(p.pri)}</td>
            <td style="color:${flowColor(p.flow)}">${p.flow.toFixed(1)}%</td>
            <td style="color:var(--warn);font-weight:600">${p.fore > 0 ? p.fore+'d' : '—'}</td>
          </tr>`).join('')}
          </tbody></table></div>`
        : '<div class="empty">لا توجد بيانات — أدخل Stock Entry لهذا المخزن</div>'}
      </div>
    </div>`;
}

/* ── Group Detail ── */
function renderWhGroupDetail(el, groupName) {
  const whs     = DB.get('warehouses') || [];
  const members = whs.filter(w => w.group === groupName);
  const gs      = getWhGroupStats(members.map(m => m.name));

  el.innerHTML = `
    <div class="fade-up">
      <button class="btn btn-ghost btn-sm" onclick="navigate('warehouses',null)" style="margin-bottom:14px">← رجوع</button>
      <div class="kpi-grid" style="margin-bottom:16px">
        <div class="kpi-card"><div class="kpi-label">إجمالي Stock</div><div class="kpi-value">${fmt(gs.stock)}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي Secondary</div><div class="kpi-value" style="color:var(--accent)">${fmtSec(gs.secondary)}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي Primary</div><div class="kpi-value" style="color:var(--muted)">${fmt(gs.primary)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Flow%</div><div class="kpi-value" style="color:${flowColor(gs.flow)}">${gs.flow.toFixed(1)}%</div></div>
      </div>
      <div style="display:grid;gap:12px">
        ${members.map(w => {
          const ws = getWhStats(w.name);
          return `<div class="card" style="cursor:pointer" onclick="navigate('wh_${encodeURIComponent(w.name)}',null)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <h2 style="margin:0">🏭 ${w.name}</h2>
              <span style="color:var(--muted)">› تفاصيل</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px">
              <div><div style="font-size:10px;color:var(--muted)">Stock</div><div style="font-weight:700;font-size:18px;color:var(--accent2)">${fmt(ws.stock)}</div></div>
              <div><div style="font-size:10px;color:var(--muted)">Secondary</div><div style="font-weight:700;font-size:18px;color:${ws.secondary<0?'var(--danger)':'var(--accent)'}">${fmtSec(ws.secondary)}</div></div>
              <div><div style="font-size:10px;color:var(--muted)">Flow%</div><div style="font-weight:700;font-size:18px;color:${flowColor(ws.flow)}">${ws.flow.toFixed(1)}%</div></div>
              <div><div style="font-size:10px;color:var(--muted)">Forecast</div><div style="font-weight:700;font-size:18px;color:var(--warn)">${ws.forecast > 0 ? ws.forecast+'d' : '—'}</div></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}
