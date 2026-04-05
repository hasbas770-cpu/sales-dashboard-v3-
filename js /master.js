
/* ═══════════════════════════════════════
   MASTER.JS — Master Data Pages
═══════════════════════════════════════ */

/* ──────────────────────────────────────
   PRODUCTS
────────────────────────────────────── */
function renderProducts(el) {
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <h2>💊 المنتجات والأهداف</h2>
        <div class="form-grid" style="margin-bottom:14px">
          <div class="form-group"><label>السنة</label>
            <select id="cfg-year" onchange="renderProductsTable()">
              ${[2024,2025,2026,2027,2028].map(y=>`<option${y===2026?' selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>المنطقة</label>
            <select id="cfg-area" onchange="renderProductsTable()">
              ${DB.get('areas').map(a=>`<option>${a}</option>`).join('')||'<option>Basra</option>'}
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table><thead><tr>
            <th style="text-align:right">المنتج</th><th>Line</th><th>الهدف السنوي</th><th>السعر</th><th>حذف</th>
          </tr></thead><tbody id="prod-tbody"></tbody></table>
        </div>
      </div>
    </div>`;
  renderProductsTable();
}

function renderProductsTable() {
  const year    = document.getElementById('cfg-year')?.value || 2026;
  const area    = document.getElementById('cfg-area')?.value || 'Basra';
  const prods   = DB.get('products');
  const targets = DB.getObj('productTargets');
  const tbody   = document.getElementById('prod-tbody');
  if (!tbody) return;
  if (!prods.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty">لا توجد منتجات</td></tr>`; return; }
  tbody.innerHTML = prods.map((p,i) => {
    const key    = `${year}__${p.name}__${area}`;
    const target = targets[key] !== undefined ? targets[key] : (area==='Basra' && Number(year)===2026 ? p.annualTarget||0 : 0);
    return `<tr>
      <td style="text-align:right;font-weight:600">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${lc(p.line)};margin-left:6px"></span>${p.name}
      </td>
      <td><span style="background:${lc(p.line)}18;color:${lc(p.line)};border-radius:999px;padding:2px 8px;font-size:10px;font-weight:600">${p.line}</span></td>
      <td><input type="number" value="${target}" min="0"
        style="width:90px;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:8px;font-size:12px;text-align:center;font-family:inherit;outline:none"
        onchange="saveTarget('${p.name.replace(/'/g,"\\'")}','${year}','${area}',this.value)"></td>
      <td style="color:var(--accent2)">${p.price ? Number(p.price).toLocaleString()+' IQD' : '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteProd(${i})">🗑</button></td>
    </tr>`;
  }).join('');
}

function saveTarget(product, year, area, val) {
  const targets = DB.getObj('productTargets');
  targets[`${year}__${product}__${area}`] = Number(val)||0;
  DB.setObj('productTargets', targets);
  toast('✓ تم حفظ الهدف');
}

function deleteProd(i) {
  const prods = DB.get('products');
  if (!prods[i] || !confirm(`حذف ${prods[i].name}؟`)) return;
  prods.splice(i, 1);
  DB.set('products', prods);
  renderProductsTable();
  toast('✓ تم الحذف');
}

/* ──────────────────────────────────────
   PHARMACIES
────────────────────────────────────── */
function renderPharmacies(el) {
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0">🏪 الصيدليات</h2>
          <button class="btn btn-primary btn-sm" onclick="showAddPharmacy()">➕ إضافة</button>
        </div>
        <div id="ph-form" style="display:none;margin-bottom:14px;padding:14px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:12px">
          <div class="form-grid">
            <div class="form-group"><label>الاسم</label><input type="text" id="ph-name" placeholder="اسم الصيدلية"></div>
            <div class="form-group"><label>المنطقة</label>
              <select id="ph-area">${DB.get('areas').map(a=>`<option>${a}</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>الموقع</label><input type="text" id="ph-loc" placeholder="محلة/شارع"></div>
          </div>
          <button class="btn btn-success btn-sm" onclick="addPharmacy()">✓ حفظ</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('ph-form').style.display='none'">إلغاء</button>
        </div>
        <div class="table-wrap">
          <table><thead><tr>
            <th style="text-align:right">الصيدلية</th><th>المنطقة</th><th>الموقع</th><th>حذف</th>
          </tr></thead><tbody id="ph-tbody"></tbody></table>
        </div>
      </div>
    </div>`;
  renderPhTable();
}

function showAddPharmacy() { document.getElementById('ph-form').style.display = 'block'; }

function addPharmacy() {
  const name = document.getElementById('ph-name').value.trim();
  const area = document.getElementById('ph-area').value;
  const loc  = document.getElementById('ph-loc').value.trim();
  if (!name) return alert('ادخل اسم الصيدلية');
  const phs = DB.get('pharmacies');
  if (phs.find(p => p.name === name)) return alert('الصيدلية موجودة');
  phs.push({ name, area, location:loc, doctors:[] });
  DB.set('pharmacies', phs);
  document.getElementById('ph-form').style.display = 'none';
  document.getElementById('ph-name').value = '';
  renderPhTable();
  toast('✓ تم الحفظ');
}

function renderPhTable() {
  const phs   = DB.get('pharmacies');
  const tbody = document.getElementById('ph-tbody');
  if (!phs.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty">لا توجد صيدليات</td></tr>`; return; }
  tbody.innerHTML = phs.map((p,i) => `<tr>
    <td style="text-align:right;font-weight:600">${p.name}</td>
    <td>${p.area||'—'}</td>
    <td style="color:var(--muted);font-size:11px">${p.location||'—'}</td>
    <td><button class="btn btn-danger btn-sm" onclick="deletePh(${i})">🗑</button></td>
  </tr>`).join('');
}

function deletePh(i) {
  const phs = DB.get('pharmacies');
  if (!confirm(`حذف ${phs[i].name}؟`)) return;
  phs.splice(i, 1);
  DB.set('pharmacies', phs);
  renderPhTable();
  toast('✓ تم الحذف');
}

/* ──────────────────────────────────────
   DOCTORS
────────────────────────────────────── */
let _docFilter = 'all';

function renderDoctors(el) {
  const lines = ['all','Derma','Optha','General Line','CM Line'];
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
          <h2 style="margin:0">👨‍⚕️ الأطباء</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${lines.map(l => `<button class="btn btn-ghost btn-sm" onclick="filterDocs('${l}',this)">${l==='all'?'الكل':l}</button>`).join('')}
          </div>
        </div>
        <div class="table-wrap">
          <table><thead><tr>
            <th style="text-align:right">الطبيب</th><th>Line</th><th>المنطقة</th><th>حذف</th>
          </tr></thead><tbody id="doc-tbody"></tbody></table>
        </div>
      </div>
    </div>`;
  renderDocTable('all');
}

function filterDocs(line, btn) {
  _docFilter = line;
  document.querySelectorAll('#content .btn-ghost').forEach(b => b.style.borderColor = '');
  if (btn) btn.style.borderColor = 'var(--accent)';
  renderDocTable(line);
}

function renderDocTable(line) {
  let docs = DB.get('doctors');
  if (line !== 'all') docs = docs.filter(d => d.line === line);
  const tbody = document.getElementById('doc-tbody');
  if (!docs.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty">لا توجد بيانات</td></tr>`; return; }
  tbody.innerHTML = docs.map(d => `<tr>
    <td style="text-align:right;font-weight:600">${d.name}</td>
    <td><span style="background:${lc(d.line)}18;color:${lc(d.line)};border-radius:999px;padding:2px 8px;font-size:10px;font-weight:600">${d.line}</span></td>
    <td style="color:var(--muted)">${d.area||'—'}</td>
    <td><button class="btn btn-danger btn-sm" onclick="deleteDoc('${d.name.replace(/'/g,"\\'")}')">🗑</button></td>
  </tr>`).join('');
}

function deleteDoc(name) {
  if (!confirm(`حذف ${name}؟`)) return;
  DB.set('doctors', DB.get('doctors').filter(d => d.name !== name));
  renderDocTable(_docFilter);
  toast('✓ تم الحذف');
}

/* ──────────────────────────────────────
   REPS
────────────────────────────────────── */
function renderReps(el) {
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <h2>👥 المندوبين</h2>
        <div id="reps-content"><div class="loader"><div class="spinner"></div></div></div>
      </div>
    </div>`;
  apiGet('getOrders', {}, function(data) {
    if (!data || !data.success) {
      document.getElementById('reps-content').innerHTML = '<div class="empty">تعذر التحميل</div>';
      return;
    }
    const reps = [...new Set(data.orders.map(o => o.rep).filter(Boolean))];
    const stats = {};
    data.orders.forEach(o => {
      if (!stats[o.rep]) stats[o.rep] = { orders:0, value:0 };
      stats[o.rep].orders++;
      stats[o.rep].value += Number(o.quantity||0) * Number(o.unitPrice||0);
    });
    let rows = reps.map(r =>
      '<tr><td style="text-align:right;font-weight:600">👤 '+r+'</td><td>'+fmt(stats[r].orders)+'</td><td style="color:var(--accent2);font-weight:600">'+fmtV(stats[r].value)+'</td></tr>'
    ).join('');
    document.getElementById('reps-content').innerHTML =
      '<div class="table-wrap"><table><thead><tr><th style="text-align:right">المندوب</th><th>الفواتير</th><th>القيمة</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  });
}

/* ──────────────────────────────────────
   REGIONS
────────────────────────────────────── */
function renderRegions(el) {
  el.innerHTML = `
    <div class="fade-up">
      <div class="card">
        <h2>📍 المناطق</h2>
        <div style="display:flex;gap:10px;margin-bottom:14px">
          <input type="text" id="area-input" placeholder="اسم المنطقة"
            style="background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:12px;font-size:13px;font-family:inherit;outline:none;flex:1">
          <button class="btn btn-primary" onclick="addArea()">➕ إضافة</button>
        </div>
        <div id="areas-list" style="display:flex;flex-wrap:wrap;gap:8px"></div>
      </div>
    </div>`;
  renderAreasList();
}

function renderAreasList() {
  const areas = DB.get('areas');
  document.getElementById('areas-list').innerHTML = areas.map((a,i) => `
    <div style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:999px;padding:7px 14px">
      <span>📍 ${a}</span>
      <button onclick="deleteArea(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px;line-height:1">✕</button>
    </div>`).join('') || '<span style="color:var(--muted);font-size:12px">لا توجد مناطق</span>';
}

function addArea() {
  const val = document.getElementById('area-input').value.trim();
  if (!val) return;
  const areas = DB.get('areas');
  if (areas.includes(val)) return alert('المنطقة موجودة');
  areas.push(val);
  DB.set('areas', areas);
  document.getElementById('area-input').value = '';
  renderAreasList();
  toast('✓ تم الحفظ');
}

function deleteArea(i) {
  const areas = DB.get('areas');
  if (!confirm(`حذف ${areas[i]}؟`)) return;
  areas.splice(i, 1);
  DB.set('areas', areas);
  renderAreasList();
}
