
/* ═══════════════════════════════════════
   DB.JS — Storage + Helpers
═══════════════════════════════════════ */

const DB = {
  get:    k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } },
  getObj: k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } },
  set:    (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  setObj: (k,v) => localStorage.setItem(k, JSON.stringify(v)),
};

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw0aMQZrN7xu19d1_V0p9iCSMrTENUdmhC_qzmnVn3_fGha5ZN2ei4n71AZVmdvAJw3fQ/exec';

/* ── Formatters ── */
function fmt(n)  { return Number(n||0).toLocaleString('en'); }
function fmtV(n) { return Number(n||0).toLocaleString('en', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fmtSec(n) {
  if (n === '—' || n == null) return '—';
  const abs = Math.abs(n);
  return (n < 0 ? '-' : '') + fmt(abs);
}

/* ── Line color ── */
function lc(line) {
  const m = { Derma:'#4f8ef7', Optha:'#34d399', 'General Line':'#f59e0b', 'CM Line':'#a78bfa' };
  return m[line] || '#64748b';
}

/* ── Detect line from product name ── */
function getLineByProduct(name) {
  name = String(name).toLowerCase();
  if (['acretin','elica','fusibact','hi-quin','hiquin','lamifen','lican','promax','surecure','elicasal'].some(k => name.includes(k))) return 'Derma';
  if (['arox','brimo','brofix','fluca','hyfresh','latano','loxtra','olopat','optidex','optiflox','optifresh','optilone','optipred','tymer','xola','xolamol'].some(k => name.includes(k))) return 'Optha';
  if (['azi-once','azionce','feroton','maxim','prima','fast-flam','relaxon','dompy','fixit','meva','zoron'].some(k => name.includes(k))) return 'General Line';
  if (['vittoria','dapazin','sitagen','sitavic','vildus','lintra'].some(k => name.includes(k))) return 'CM Line';
  return '';
}

/* ── Format date string ── */
function formatDate(d) {
  if (!d) return '—';
  if (d.includes('GMT') || d.includes('00:00:00')) {
    try {
      const x = new Date(d);
      return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
    } catch(e) { return d; }
  }
  return d;
}

/* ── Toast ── */
let _toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ── Seed default data if empty ── */
function seedDefaults() {
  if (!DB.get('areas').length) {
    DB.set('areas', ['Basra']);
  }
  if (!DB.get('warehouses').length) {
    DB.set('warehouses', [
      { name:'سيادة',           type:'branch',     group:'سيادة Group', area:'Basra' },
      { name:'خضراء',           type:'branch',     group:'سيادة Group', area:'Basra' },
      { name:'لافندر',          type:'branch',     group:'سيادة Group', area:'Basra' },
      { name:'منهل',            type:'standalone', group:'',            area:'Basra' },
      { name:'اندلس',           type:'standalone', group:'',            area:'Basra' },
      { name:'ساوة',            type:'standalone', group:'',            area:'Basra' },
      { name:'لافقدر',          type:'standalone', group:'',            area:'Basra' },
      { name:'ركن الرافدين',    type:'standalone', group:'',            area:'Basra' },
    ]);
  }
}
