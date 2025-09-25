// PERSONAL ASSISTANT mobile frontend app.js
// The app will persist backend URL in localStorage under key 'pa_api_base'.
// If not set, it falls back to http://10.0.2.2:8000 (emulator).

function getSavedBase() {
  return localStorage.getItem('pa_api_base') || 'http://10.0.2.2:8000';
}

let API_BASE = getSavedBase();
let sessionId = null;

async function newSession() {
  const res = await fetch(API_BASE + "/api/v1/session/create", {method:"POST"});
  if (!res.ok) throw new Error('Failed to create session: ' + await res.text());
  const j = await res.json();
  sessionId = j.session_id;
  renderHistory([]);
}

async function sendMessage() {
  const msg = document.getElementById('message').value.trim();
  if (!msg) return;
  const persona = document.getElementById('persona').value;
  const provider = document.getElementById('provider').value || null;
  const payload = { session_id: sessionId, message: msg, persona: persona, provider: provider };
  const r = await fetch(API_BASE + "/api/v1/chat/send", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const text = await r.text();
    alert("Server error: " + text);
    return;
  }
  const j = await r.json();
  document.getElementById('message').value = '';
  await loadHistory();
}

async function loadHistory() {
  if (!sessionId) return;
  const r = await fetch(API_BASE + "/api/v1/session/" + sessionId + "/history");
  if (!r.ok) return;
  const j = await r.json();
  renderHistory(j.history || []);
}

function renderHistory(history) {
  const el = document.getElementById('history');
  el.innerHTML = '';
  history.forEach(h => {
    const d = document.createElement('div');
    d.className = 'bubble ' + (h.role === 'user' ? 'user' : 'assistant');
    d.innerText = h.text;
    el.appendChild(d);
  });
  el.scrollTop = el.scrollHeight;
}

// Settings modal logic
const modal = document.getElementById('modal');
const settingsBtn = document.getElementById('settingsBtn');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const backendInput = document.getElementById('backendUrl');
const testResult = document.getElementById('testResult');

settingsBtn.addEventListener('click', () => {
  backendInput.value = localStorage.getItem('pa_api_base') || 'http://10.0.2.2:8000';
  modal.classList.add('open');
  testResult.innerText = '';
});

saveBtn.addEventListener('click', () => {
  const v = backendInput.value.trim();
  if (!v) return alert('Please enter a backend URL');
  localStorage.setItem('pa_api_base', v);
  API_BASE = v;
  modal.classList.remove('open');
  // Recreate session with new API if possible
  newSession().catch(e => console.warn('Session not created', e));
});

testBtn.addEventListener('click', async () => {
  const v = backendInput.value.trim();
  if (!v) return alert('Please enter a backend URL to test');
  testResult.innerText = 'Testing...';
  try {
    const r = await fetch(v + '/api/v1/session/create', {method:'POST'});
    if (r.ok) {
      testResult.innerText = '✅ Connection OK';
    } else {
      testResult.innerText = '❌ Failed: ' + (await r.text()).slice(0,120);
    }
  } catch (e) {
    testResult.innerText = '❌ Error: ' + e.message;
  }
});

// close modal when tapping outside
modal.addEventListener('click', (e)=>{ if (e.target===modal) modal.classList.remove('open'); });

document.getElementById('sendBtn').addEventListener('click', sendMessage);

(async ()=>{
  try { await newSession(); } catch (e) { console.warn('no session', e); }
  setTimeout(()=>{ if (sessionId) loadHistory(); }, 400);
})();
