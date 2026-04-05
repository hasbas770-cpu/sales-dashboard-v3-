/* ═══════════════════
   CSS VARIABLES
═══════════════════ */
:root {
  --bg:        #080e1e;
  --bg2:       #0d1428;
  --sidebar:   #0c1226;
  --sidebar-w: 260px;
  --surface:   rgba(18,26,50,.9);
  --surface2:  rgba(26,38,68,.8);
  --border:    rgba(148,163,184,.12);
  --border-s:  rgba(148,163,184,.22);
  --accent:    #4f8ef7;
  --accent2:   #34d399;
  --accent3:   #a78bfa;
  --warn:      #f59e0b;
  --danger:    #ef4444;
  --text:      #e5edf8;
  --muted:     #7489a8;
  --radius:    16px;
  --shadow:    0 8px 32px rgba(0,0,0,.32);
  --grad:      linear-gradient(135deg,#4f8ef7,#7c3aed);
  --grad-g:    linear-gradient(135deg,#059669,#34d399);
  --grad-w:    linear-gradient(135deg,#d97706,#fbbf24);
}

* { box-sizing:border-box; margin:0; padding:0; }

body {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  overflow: hidden;
}

/* ═══════════════════
   SIDEBAR
═══════════════════ */
.sidebar {
  width: var(--sidebar-w);
  height: 100vh;
  background: var(--sidebar);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-logo {
  padding: 20px 18px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width:40px; height:40px; border-radius:12px;
  background: var(--grad);
  display: grid; place-items: center;
  font-size: 20px; flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(79,142,247,.3);
}

.logo-text h2  { font-size:15px; font-weight:700; color:#fff; }
.logo-text p   { font-size:10px; color:var(--muted); margin-top:2px; }

.sidebar-nav   { flex:1; padding:12px 10px; display:flex; flex-direction:column; gap:2px; }

.nav-link {
  display: flex; align-items: center; gap:10px;
  padding: 11px 12px; border-radius: 12px;
  cursor: pointer; font-size: 13px; font-weight: 500;
  color: var(--muted); transition: all .2s;
  border: none; background: none;
  width: 100%; text-align: right;
  font-family: inherit;
}
.nav-link:hover               { background:rgba(255,255,255,.05); color:var(--text); }
.nav-link.active               { background:rgba(79,142,247,.12); color:var(--accent); font-weight:600; }
.nav-link .icon                { width:32px; height:32px; border-radius:9px; display:grid; place-items:center; font-size:16px; flex-shrink:0; background:rgba(255,255,255,.04); }
.nav-link.active .icon         { background:rgba(79,142,247,.18); }
.nav-link .arrow               { margin-right:auto; font-size:10px; transition:transform .2s; color:var(--muted); }
.nav-link.open .arrow          { transform:rotate(90deg); }

.sub-menu                      { display:none; padding:4px 0 4px 8px; }
.sub-menu.open                 { display:block; }

.sub-link {
  display: flex; align-items: center; gap:8px;
  padding: 9px 12px 9px 14px; border-radius: 10px;
  cursor: pointer; font-size: 12px; color: var(--muted);
  transition: all .2s; border:none; background:none;
  width: 100%; text-align: right; font-family: inherit;
}
.sub-link:hover                { background:rgba(255,255,255,.04); color:var(--text); }
.sub-link.active               { color:var(--accent2); font-weight:600; }
.sub-link::before              { content:""; width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; opacity:.5; }
.sub-link.active::before       { opacity:1; }

.sidebar-footer                { padding:14px; border-top:1px solid var(--border); }
.user-chip                     { display:flex; align-items:center; gap:10px; padding:10px 12px; background:rgba(255,255,255,.04); border-radius:12px; border:1px solid var(--border); }
.user-avatar                   { width:32px; height:32px; border-radius:50%; background:var(--grad); display:grid; place-items:center; font-size:14px; flex-shrink:0; }
.user-info p                   { font-size:12px; font-weight:600; color:var(--text); }
.user-info span                { font-size:10px; color:var(--muted); }

/* ═══════════════════
   MAIN
═══════════════════ */
.main                          { margin-right:var(--sidebar-w); flex:1; height:100vh; overflow-y:auto; display:flex; flex-direction:column; }

.topbar {
  position: sticky; top:0; z-index:50;
  display: flex; align-items:center; justify-content:space-between;
  padding: 14px 20px;
  background: rgba(8,14,30,.85); backdrop-filter:blur(16px);
  border-bottom: 1px solid var(--border);
}
.page-title    { font-size:16px; font-weight:700; color:#fff; }
.page-subtitle { font-size:11px; color:var(--muted); margin-top:2px; }

.content       { flex:1; padding:20px; }

/* ═══════════════════
   COMPONENTS
═══════════════════ */
.card {
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius); padding:18px; margin-bottom:16px;
  backdrop-filter:blur(14px); box-shadow:var(--shadow);
  position:relative; overflow:hidden; transition:all .2s;
}
.card:hover      { transform:translateY(-2px); box-shadow:0 14px 36px rgba(0,0,0,.28); }
.card::before    { content:""; position:absolute; inset:0 0 auto 0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent); pointer-events:none; }
.card h2         { font-size:14px; font-weight:700; color:#dbe7ff; margin-bottom:14px; display:flex; align-items:center; gap:8px; }

.kpi-grid        { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; }
.kpi-card        { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px; backdrop-filter:blur(14px); transition:all .2s; }
.kpi-card:hover  { transform:translateY(-3px); border-color:var(--border-s); }
.kpi-label       { font-size:11px; color:var(--muted); margin-bottom:8px; font-weight:500; }
.kpi-value       { font-size:24px; font-weight:700; color:#fff; letter-spacing:.3px; }

.table-wrap      { overflow:auto; border:1px solid var(--border); border-radius:14px; }
table            { width:100%; border-collapse:collapse; font-size:12px; min-width:500px; }
th,td            { padding:10px 12px; text-align:center; border-bottom:1px solid var(--border); }
th               { background:rgba(255,255,255,.04); color:var(--muted); font-weight:600; position:sticky; top:0; z-index:1; }
tr:last-child td { border-bottom:none; }
tbody tr:hover   { background:rgba(79,142,247,.04); }

.form-grid       { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }
.form-group label { display:block; font-size:11px; color:var(--muted); margin-bottom:6px; }
.form-group select,
.form-group input,
.form-group textarea {
  width:100%; background:rgba(255,255,255,.04); border:1px solid var(--border);
  color:var(--text); padding:11px 12px; border-radius:12px;
  font-size:13px; font-family:inherit; outline:none; transition:all .18s;
}
.form-group select option { background:#0d1428; color:var(--text); }
.form-group select:focus,
.form-group input:focus  { border-color:var(--accent); background:rgba(255,255,255,.07); box-shadow:0 0 0 3px rgba(79,142,247,.14); }

.btn { display:inline-flex; align-items:center; gap:7px; padding:10px 18px; font-size:13px; font-family:inherit; border-radius:12px; border:none; cursor:pointer; font-weight:600; transition:all .2s; }
.btn:hover           { transform:translateY(-2px); }
.btn:active          { transform:scale(.98); }
.btn-primary         { background:var(--grad); color:#fff; box-shadow:0 10px 22px rgba(79,142,247,.22); }
.btn-success         { background:var(--grad-g); color:#fff; }
.btn-danger          { background:linear-gradient(135deg,#ef4444,#f87171); color:#fff; padding:6px 12px; font-size:11px; }
.btn-ghost           { background:rgba(255,255,255,.04); color:var(--text); border:1px solid var(--border); }
.btn-ghost:hover     { background:rgba(255,255,255,.07); border-color:var(--border-s); }
.btn-sm              { padding:7px 12px; font-size:11px; }
.btn-warn            { background:var(--grad-w); color:#000; }

.stats-row           { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:16px; }
.stat-mini           { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:14px; font-size:11px; color:var(--muted); transition:all .2s; }
.stat-mini:hover     { transform:translateY(-2px); }
.stat-mini span      { color:#dbe7ff; font-weight:700; font-size:20px; display:block; margin-top:5px; }

.order-card          { background:var(--surface); border:1px solid var(--border); border-radius:18px; margin-bottom:10px; overflow:hidden; transition:all .2s; }
.order-card:hover    { transform:translateY(-2px); box-shadow:0 14px 32px rgba(0,0,0,.22); }
.order-head          { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; cursor:pointer; gap:12px; transition:.15s; }
.order-head:hover    { background:rgba(255,255,255,.03); }
.order-info          { display:flex; flex-wrap:wrap; gap:8px; align-items:center; flex:1; }
.pill                { font-size:11px; color:var(--muted); background:rgba(255,255,255,.04); padding:4px 10px; border-radius:999px; border:1px solid rgba(255,255,255,.04); }
.order-body          { display:none; border-top:1px solid var(--border); padding:14px 16px; background:rgba(0,0,0,.1); }
.order-body.open     { display:block; }

.empty               { color:var(--muted); font-size:13px; padding:40px 0; text-align:center; background:var(--surface); border:1px dashed var(--border-s); border-radius:16px; }
.loader              { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 0; gap:16px; }
.spinner             { width:44px; height:44px; border:4px solid rgba(79,142,247,.15); border-top-color:var(--accent); border-radius:50%; animation:spin .8s linear infinite; }

#toast {
  position:fixed; bottom:22px; left:50%;
  transform:translateX(-50%) translateY(90px);
  background:var(--grad-g); color:#fff;
  padding:12px 24px; border-radius:999px;
  font-size:13px; font-weight:700;
  transition:transform .3s; z-index:999;
  box-shadow:0 12px 28px rgba(16,185,129,.28);
}
#toast.show          { transform:translateX(-50%) translateY(0); }

.sidebar-toggle      { display:none; }

@keyframes spin      { to { transform:rotate(360deg); } }
@keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.fade-up             { animation:fadeUp .35s ease both; }

/* ═══════════════════
   MOBILE
═══════════════════ */
@media(max-width:900px){
  .sidebar         { transform:translateX(100%); transition:transform .3s ease; }
  .sidebar.open    { transform:translateX(0); }
  .main            { margin-right:0; }
  .sidebar-toggle  { display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,.06); border:1px solid var(--border); cursor:pointer; font-size:18px; }
  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:99; }
  .sidebar-overlay.open { display:block; }
}
