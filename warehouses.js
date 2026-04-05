/* ═══════════════════════════════════════
   SALES.JS — Primary + Secondary + Stock Entry
═══════════════════════════════════════ */

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

/* ──────────────────────────────────────
   PRIMARY SALES
────────────────────────────────────── */
function renderPrimary(el) {
  const cur = new Date();
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <h2>📥 Primary Sales — إدخال شهري</h2>
        <div class="form-grid" style="margin-bottom:12px">
          <div class="form-group"><label>Year</label>
            <select id="ps-year" onchange="renderPSGrid()">
              ${[2024,2025,2026,2027,2028].map(y=>`<option${y===cur.getFullYear()?' selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Month</label>
            <select id="ps-month" onchange="renderPSGrid()">
              ${MONTHS.map((m,i)=>`<option value="${i+1}"${i===cur.getMonth()?' selected':''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Region</label>
            <select id="ps-area" onchange="renderPSGrid()">
              ${DB.get('areas').map(a=>`<option>${a}</option>`).join('')||'<option>Basra</option>'}
            </select>
          </div>
          <div class="form-group"><label>Line</label>
            <select id="ps-line" onchange="renderPSGrid()">
              <option value="all">All Lines</option>
              <option>Derma</option><option>Optha</option><option>General Line</option><option>CM Line</option>
            </select>
          </div>
        </div>
        <input type="text" id="ps-search" placeholder="🔍 Search product..." oninput="filterPS()"
          style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:9px 14px;border-radius:10px;font-size:13px;font-family:inherit;outline:none;margin-bottom:10px">
        <button class="btn btn-primary btn-sm" onclick="savePSGrid()" style="margin-bottom:12px">💾 Save All</button>
        <div class="table-wrap">
          <table><thead><tr>
            <th style="text-align:right">Product</th><th>Line</th><th>Monthly Target</th><th>Qty</th>
          </tr></thead><tbody id="ps-tbody"></tbody></table>
        </div>
      </div>
    </div>`;
  renderPSGrid();
}

function renderPSGrid() {
  const year  = document.getElementById('ps-year')?.value;
  const month = document.getElementById('ps-month')?.value;
  const area  = document.getElementById('ps-area')?.value || 'Basra';
  const line  = document.getElementById('ps-line')?.value || 'all';
  if (!year || !month) return;
  const prods   = DB.get('products').filter(p => line==='all' || p.line===line);
  const ps      = DB.getObj('primarySales');
  const targets = DB.getObj('productTargets');
  const tbody   = document.getElementById('ps-tbody');
  if (!tbody) return;
  tbody.innerHTML = prods.map(p => {
    const key    = `${year}__${p.name}__${area}__${month}`;
    const val    = ps[key] || 0;
    const tKey   = `${year}__${p.name}__${area}`;
    const ann    = targets[tKey] !== undefined ? targets[tKey] : (area==='Basra' && Number(year)===2026 ? p.annualTarget||0 : 0);
    const mTarget = Math.round(ann / 12);
    return `<tr>
      <td style="text-align:right;font-weight:600">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${lc(p.line)};margin-left:6px"></span>${p.name}
      </td>
      <td><span style="background:${lc(p.line)}18;color:${lc(p.line)};border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600">${p.line}</span></td>
      <td style="color:var(--muted)">${fmt(mTarget)}</td>
      <td><input type="number" class="ps-input" data-key="${key}" value="${val}" min="0"
        style="width:90px;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:6px 8px;border-radius:8px;font-size:12px;text-align:center;font-family:inherit;outline:none"
        placeholder="0"></td>
    </tr>`;
  }).join('');
}

function filterPS() {
  const q = document.getElementById('ps-search')?.value.toLowerCase() || '';
  document.querySelectorAll('#ps-tbody tr').forEach(row => {
    row.style.display = row.querySelector('td')?.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function savePSGrid() {
  const data = DB.getObj('primarySales');
  document.querySelectorAll('.ps-input').forEach(inp => {
    const val = Number(inp.value || 0);
    if (val > 0) data[inp.dataset.key] = val;
    else delete data[inp.dataset.key];
  });
  DB.setObj('primarySales', data);
  toast('✓ Primary Sales saved');
}

/* ──────────────────────────────────────
   SECONDARY SALES (view only — calculated from stock)
────────────────────────────────────── */
function renderSecondary(el) {
  const cur = new Date();
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <h2>📤 Secondary Sales</h2>
        <p style="color:var(--muted);font-size:12px;margin-bottom:14px">تحسب تلقائياً من Stock Entry — Opening + Primary - Closing</p>
        <div class="form-grid" style="margin-bottom:12px">
          <div class="form-group"><label>Year</label>
            <select id="sec-year" onchange="renderSecGrid()">
              ${[2024,2025,2026,2027,2028].map(y=>`<option${y===cur.getFullYear()?' selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Month</label>
            <select id="sec-month" onchange="renderSecGrid()">
              ${MONTHS.map((m,i)=>`<option value="${i+1}"${i===cur.getMonth()?' selected':''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Region</label>
            <select id="sec-area" onchange="renderSecGrid()">
              ${DB.get('areas').map(a=>`<option>${a}</option>`).join('')||'<option>Basra</option>'}
            </select>
          </div>
          <div class="form-group"><label>Line</label>
            <select id="sec-line" onchange="renderSecGrid()">
              <option value="all">All Lines</option>
              <option>Derma</option><option>Optha</option><option>General Line</option><option>CM Line</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table><thead><tr>
            <th style="text-align:right">Product</th><th>Line</th><th>Primary</th>
            ${(DB.get('warehouses')||[]).map(w=>`<th>${w.name}</th>`).join('')}
            <th style="color:var(--accent2)">Total Secondary</th><th>Flow%</th>
          </tr></thead><tbody id="sec-tbody"></tbody></table>
        </div>
      </div>
    </div>`;
  renderSecGrid();
}

function renderSecGrid() {
  const year  = document.getElementById('sec-year')?.value;
  const month = document.getElementById('sec-month')?.value;
  const area  = document.getElementById('sec-area')?.value || 'Basra';
  const line  = document.getElementById('sec-line')?.value || 'all';
  if (!year || !month) return;

  const prods = DB.get('products').filter(p => line==='all' || p.line===line);
  const stock = DB.getObj('stockEntry');
  const ps    = DB.getObj('primarySales');
  const whs   = DB.get('warehouses') || [];
  const tbody = document.getElementById('sec-tbody');
  if (!tbody) return;

  tbody.innerHTML = prods.map(p => {
    const psKey  = `${year}__${p.name}__${area}__${month}`;
    const primary = Number(ps[psKey] || 0);

    // Secondary per warehouse
    const whSecs = whs.map(w => {
      const stKey = `${year}__${p.name}__${area}__${month}__${w.name}`;
      const saved = stock[stKey] || { open:null, close:null };
      const primStKey = `${stKey}__prim`;
      const whPrim = stock[primStKey] != null ? stock[primStKey] : primary;
      if (saved.open == null && saved.close == null) return null;
      return Number(saved.open||0) + whPrim - Number(saved.close||0);
    });

    const totalSec = whSecs.reduce((s,v) => s + (v != null ? v : 0), 0);
    const flow = primary > 0 ? (totalSec / primary * 100) : 0;

    return `<tr>
      <td style="text-align:right;font-weight:600">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${lc(p.line)};margin-left:6px"></span>${p.name}
      </td>
      <td><span style="background:${lc(p.line)}18;color:${lc(p.line)};border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600">${p.line}</span></td>
      <td style="color:var(--muted)">${fmt(primary)}</td>
      ${whSecs.map(v => `<td style="color:${v==null?'var(--muted)':v<0?'var(--danger)':v>0?'var(--accent)':'var(--muted)'};font-weight:600">${v==null?'—':fmtSec(v)}</td>`).join('')}
      <td style="color:${totalSec<0?'var(--danger)':totalSec>0?'var(--accent2)':'var(--muted)'};font-weight:700;font-size:14px">${fmtSec(totalSec)}</td>
      <td style="color:${flow>=80?'var(--accent2)':flow>=50?'var(--warn)':'var(--danger)'}">${flow.toFixed(1)}%</td>
    </tr>`;
  }).join('');
}

/* ──────────────────────────────────────
   STOCK ENTRY
────────────────────────────────────── */
function renderStock(el) {
  const cur = new Date();
  const whs = DB.get('warehouses') || [];

  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <h2>📦 Stock Entry</h2>
        <p style="color:var(--muted);font-size:12px;margin-bottom:14px">
          Secondary = Opening + Primary − Closing &nbsp;|&nbsp; Opening يتعبأ تلقائياً من Closing الشهر السابق
        </p>
        <div class="form-grid" style="margin-bottom:12px">
          <div class="form-group"><label>Year</label>
            <select id="st-year" onchange="renderStockGrid()">
              ${[2024,2025,2026,2027,2028].map(y=>`<option${y===cur.getFullYear()?' selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Month</label>
            <select id="st-month" onchange="renderStockGrid()">
              ${MONTHS.map((m,i)=>`<option value="${i+1}"${i===cur.getMonth()?' selected':''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Region</label>
            <select id="st-area" onchange="renderStockGrid()">
              ${DB.get('areas').map(a=>`<option>${a}</option>`).join('')||'<option>Basra</option>'}
            </select>
          </div>
          <div class="form-group"><label>Warehouse</label>
            <select id="st-warehouse" onchange="renderStockGrid()">
              <option value="">— اختر مخزن —</option>
              ${whs.map(w=>`<option value="${w.name}">${w.name}${w.group?' ('+w.group+')':''}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Line</label>
            <select id="st-line" onchange="renderStockGrid()">
              <option value="all">All Lines</option>
              <option>Derma</option><option>Optha</option><option>General Line</option><option>CM Line</option>
            </select>
          </div>
        </div>
        <div id="st-warn" style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:10px;padding:8px 14px;font-size:12px;color:var(--warn);margin-bottom:10px">
          ⚠ اختر مخزناً حتى تحفظ الأرصدة
        </div>
        <input type="text" id="st-search" placeholder="🔍 Search product..." oninput="filterStock()"
          style="width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:9px 14px;border-radius:10px;font-size:13px;font-family:inherit;outline:none;margin-bottom:10px">
        <button class="btn btn-primary btn-sm" onclick="saveStockGrid()" style="margin-bottom:12px">💾 Save & Calculate</button>
        <div class="table-wrap">
          <table><thead><tr>
            <th style="text-align:right">Product</th>
            <th>Line</th>
            <th>Opening</th>
            <th title="اختياري — لو فارغ يأخذ من Primary Sales">Primary <span style="color:var(--muted);font-size:10px">(opt)</span></th>
            <th>Closing</th>
            <th style="color:var(--accent2)">Secondary</th>
          </tr></thead><tbody id="st-tbody"></tbody></table>
        </div>
      </div>
    </div>`;
  renderStockGrid();
}

function renderStockGrid() {
  const year      = document.getElementById('st-year')?.value;
  const month     = document.getElementById('st-month')?.value;
  const area      = document.getElementById('st-area')?.value || 'Basra';
  const warehouse = document.getElementById('st-warehouse')?.value || '';
  const line      = document.getElementById('st-line')?.value || 'all';
  if (!year || !month) return;

  const warn = document.getElementById('st-warn');
  if (warn) warn.style.display = warehouse ? 'none' : 'block';

  const prods = DB.get('products').filter(p => line==='all' || p.line===line);
  const stock = DB.getObj('stockEntry');
  const ps    = DB.getObj('primarySales');
  const tbody = document.getElementById('st-tbody');
  if (!tbody) return;

  tbody.innerHTML = prods.map(p => {
    const psKey  = `${year}__${p.name}__${area}__${month}`;
    const primary = Number(ps[psKey] || 0);
    const stKey  = warehouse ? `${year}__${p.name}__${area}__${month}__${warehouse}` : `${year}__${p.name}__${area}__${month}`;
    const saved  = stock[stKey] || { open:null, close:null };

    // Auto-fill opening from previous month closing
    let autoOpen = null;
    if (saved.open == null) {
      const prevMonth = Number(month) === 1 ? 12 : Number(month) - 1;
      const prevYear  = Number(month) === 1 ? Number(year) - 1 : year;
      const prevKey   = warehouse ? `${prevYear}__${p.name}__${area}__${prevMonth}__${warehouse}` : `${prevYear}__${p.name}__${area}__${prevMonth}`;
      const prev = stock[prevKey];
      if (prev?.close != null) autoOpen = prev.close;
    }

    const open  = saved.open  != null ? saved.open  : autoOpen;
    const close = saved.close != null ? saved.close : null;

    // Saved warehouse-specific primary
    const primStKey = `${stKey}__prim`;
    const savedPrim = stock[primStKey] != null ? stock[primStKey] : null;
    const effPrim   = savedPrim != null ? savedPrim : primary;

    const secondary = open != null && close != null ? open + effPrim - close : '—';

    return `<tr data-key="${stKey}" data-pskey="${psKey}" data-primkey="${primStKey}">
      <td style="text-align:right;font-weight:600">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${lc(p.line)};margin-left:6px"></span>${p.name}
      </td>
      <td><span style="background:${lc(p.line)}18;color:${lc(p.line)};border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600">${p.line}</span></td>
      <td>
        <input type="number" class="st-open" value="${open != null ? open : ''}" min="0"
          style="width:80px;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:6px 8px;border-radius:8px;font-size:12px;text-align:center;font-family:inherit;outline:none"
          placeholder="0" oninput="calcSec(this,'${stKey}','${psKey}','${primStKey}')">
      </td>
      <td>
        <input type="number" class="st-primary" value="${savedPrim != null ? savedPrim : ''}" min="0"
          style="width:80px;background:rgba(79,142,247,.06);border:1px solid rgba(79,142,247,.2);color:var(--text);padding:6px 8px;border-radius:8px;font-size:12px;text-align:center;font-family:inherit;outline:none"
          placeholder="${fmt(primary)}" oninput="calcSec(this,'${stKey}','${psKey}','${primStKey}')">
      </td>
      <td>
        <input type="number" class="st-close" value="${close != null ? close : ''}" min="0"
          style="width:80px;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:6px 8px;border-radius:8px;font-size:12px;text-align:center;font-family:inherit;outline:none"
          placeholder="0" oninput="calcSec(this,'${stKey}','${psKey}','${primStKey}')">
      </td>
      <td id="sec-${stKey.replace(/[^a-zA-Z0-9]/g,'_')}"
        style="font-weight:700;font-size:14px;color:${secondary==='—'?'var(--muted)':secondary<0?'var(--danger)':secondary>0?'var(--accent2)':'var(--muted)'}">
        ${secondary === '—' ? '—' : fmtSec(secondary)}
      </td>
    </tr>`;
  }).join('');
}

function calcSec(inp, stKey, psKey, primStKey) {
  const row      = inp.closest('tr');
  const openVal  = row.querySelector('.st-open')?.value;
  const closeVal = row.querySelector('.st-close')?.value;
  const primVal  = row.querySelector('.st-primary')?.value;
  const safeId   = stKey.replace(/[^a-zA-Z0-9]/g, '_');
  const el       = document.getElementById(`sec-${safeId}`);
  if (!el) return;
  if (openVal === '' || closeVal === '') {
    el.textContent = '—';
    el.style.color = 'var(--muted)';
    return;
  }
  const ps      = DB.getObj('primarySales');
  const primary = Number(ps[psKey] || 0);
  const effPrim = primVal !== '' ? Number(primVal) : primary;
  const sec     = Number(openVal) + effPrim - Number(closeVal);
  el.textContent = fmtSec(sec);
  el.style.color = sec > 0 ? 'var(--accent2)' : sec < 0 ? 'var(--danger)' : 'var(--muted)';
}

function filterStock() {
  const q = document.getElementById('st-search')?.value.toLowerCase() || '';
  document.querySelectorAll('#st-tbody tr').forEach(row => {
    row.style.display = row.querySelector('td')?.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function saveStockGrid() {
  const stock   = DB.getObj('stockEntry');
  const wf      = DB.getObj('warehouseFlow');
  const ps      = DB.getObj('primarySales');
  const year    = document.getElementById('st-year')?.value;
  const month   = document.getElementById('st-month')?.value;
  const area    = document.getElementById('st-area')?.value || 'Basra';
  const wh      = document.getElementById('st-warehouse')?.value || '';
  const entries = [];

  document.querySelectorAll('#st-tbody tr').forEach(row => {
    const stKey    = row.dataset.key;
    const psKey    = row.dataset.pskey;
    const primStKey= row.dataset.primkey;
    if (!stKey) return;

    const openVal  = row.querySelector('.st-open')?.value;
    const closeVal = row.querySelector('.st-close')?.value;
    const primVal  = row.querySelector('.st-primary')?.value;
    if ((openVal === '' || openVal == null) && (closeVal === '' || closeVal == null)) return;

    const openNum  = openVal  !== '' && openVal  != null ? Number(openVal)  : null;
    const closeNum = closeVal !== '' && closeVal != null ? Number(closeVal) : null;
    const primNum  = primVal  !== '' && primVal  != null ? Number(primVal)  : null;

    // Save primary override
    if (primNum != null) stock[primStKey] = primNum;
    else delete stock[primStKey];

    const defPrimary = Number(ps[psKey] || 0);
    const effPrimary = primNum != null ? primNum : defPrimary;
    const secondary  = openNum != null && closeNum != null ? openNum + effPrimary - closeNum : 0;

    stock[stKey] = { open:openNum, close:closeNum };

    // Update warehouseFlow — sum this warehouse's contribution
    wf[`${psKey}__${wh}`] = secondary;

    // Recalculate total secondary for this product/month (all warehouses)
    const allWhKeys = Object.keys(wf).filter(k => k.startsWith(psKey + '__'));
    const totalSec  = allWhKeys.reduce((s, k) => s + Number(wf[k] || 0), 0);
    wf[psKey] = totalSec;

    // Prepare for Sheets
    const productName = row.cells[row.cells.length - 1]?.textContent?.trim().replace(/^\W+/, '').trim() || '';
    entries.push({
      year, month, area,
      warehouse: wh,
      product:   productName,
      line:      row.querySelector('span[style*="border-radius"]')?.textContent || '',
      opening:   openNum  || 0,
      closing:   closeNum || 0,
      primary:   effPrimary,
      secondary,
    });
  });

  DB.setObj('stockEntry', stock);
  DB.setObj('warehouseFlow', wf);

  // Send to Sheets
  if (entries.length) {
    apiPost({ action:'saveStock', entries })
      .then(d => {
        if (d.success) toast(`✓ Saved — ${d.rowsAdded} added, ${d.rowsUpdated} updated`);
        else toast('⚠ Sheets error: ' + d.error);
      })
      .catch(() => toast('✓ Saved locally (Sheets offline)'));
  } else {
    toast('✓ Saved locally');
  }

  renderStockGrid();
}
