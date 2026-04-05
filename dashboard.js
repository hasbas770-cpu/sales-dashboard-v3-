/* ═══════════════════════════════════════
   API.JS — Google Sheets JSONP
═══════════════════════════════════════ */

let _cbIdx = 0;

function jsonpRequest(url, cb) {
  const name = `__cb_${++_cbIdx}`;
  window[name] = function(d) { cb(d); delete window[name]; document.getElementById(`s-${name}`)?.remove(); };
  const s = document.createElement('script');
  s.id = `s-${name}`;
  s.src = `${url}&callback=${name}`;
  s.onerror = function() { cb(null); delete window[name]; s.remove(); };
  document.head.appendChild(s);
}

function apiGet(action, params, cb) {
  let url = `${SHEETS_URL}?action=${action}`;
  if (params) Object.entries(params).forEach(([k,v]) => url += `&${k}=${encodeURIComponent(v)}`);
  jsonpRequest(url, cb);
}

function apiPost(body) {
  return fetch(SHEETS_URL, {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(r => r.json());
}
