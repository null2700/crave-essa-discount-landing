// Owner private dashboard - uses simple Basic auth via password entered in UI
(function(){
  const REFRESH_MS = 3 * 60 * 60 * 1000; // 3 hours
  const cardsEl = document.getElementById('cards');
  const lastEl = document.getElementById('lastUpdated');
  const refreshBtn = document.getElementById('refreshBtn');
  const loginOverlay = document.getElementById('loginOverlay');
  const loginBtn = document.getElementById('loginBtn');
  const userInput = document.getElementById('ownerUser');
  const passInput = document.getElementById('ownerPass');
  const twoFaInput = document.getElementById('owner2fa');

  function showLogin(){ loginOverlay.style.display = 'flex'; }
  function hideLogin(){ loginOverlay.style.display = 'none'; }

  async function fetchOrders(){
    try{
      const res = await fetch('/api/orders');
      if(res.status === 401){ showLogin(); return; }
      const data = await res.json();
      if(!data.ok){ throw new Error(data.error || 'Unknown'); }
      renderCards(data.rows || []);
      lastEl.textContent = new Date().toLocaleString();
    }catch(err){
      console.error('fetch orders err', err);
      cardsEl.innerHTML = '<div class="meta">Error loading orders: '+err.message+'</div>';
    }
  }

  function renderCards(rows){
    if(!rows || rows.length === 0){ cardsEl.innerHTML = '<div class="meta">No orders yet.</div>'; return; }
    const html = rows.map(r => {
      const collectedClass = r.collected && Number(r.collected) ? 'collected' : '';
      return `<div class="card ${collectedClass}" data-id="${r.id}">
        <div class="left">
          <div style="font-weight:600">${escapeHtml(r.fullName || '—')} &nbsp; <span class="meta">#${r.id}</span></div>
          <div class="meta">WhatsApp: ${escapeHtml(r.whatsappNumber||'')}</div>
          <div>Size: ${escapeHtml(r.cakeSize||'')} — Flavor: ${escapeHtml(r.flavor||'')}</div>
          <div>Occasion: ${escapeHtml(r.occasion||'')} — Needed: ${escapeHtml(r.neededBy||'')}</div>
          <div class="meta">Area: ${escapeHtml(r.deliveryArea||'')} — Code: ${escapeHtml(r.discountCode||'')}</div>
        </div>
        <div class="actions">
          <div class="meta">Created: ${escapeHtml(r.createdAt||'')}</div>
          <button data-action="toggle" data-id="${r.id}">${r.collected && Number(r.collected) ? 'Mark Uncollected' : 'Mark Collected'}</button>
        </div>
      </div>`;
    }).join('');
    cardsEl.innerHTML = html;
    // attach handlers
    Array.from(cardsEl.querySelectorAll('button[data-action="toggle"]')).forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = btn.getAttribute('data-id');
        const card = cardsEl.querySelector('.card[data-id="'+id+'"]');
        const isCollected = card.classList.contains('collected');
        await toggleCollected(id, !isCollected);
        await fetchOrders();
      });
    });
  }

  async function toggleCollected(id, collected){
    const hdr = authHeader();
    if(!hdr) { showLogin(); return; }
    try{
      const res = await fetch('/api/orders/' + encodeURIComponent(id) + '/collect', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': hdr },
        body: JSON.stringify({ collected: !!collected })
      });
      if(res.status === 401){ sessionStorage.removeItem('ownerPass'); showLogin(); return; }
      const j = await res.json();
      if(!j.ok) throw new Error(j.error || 'failed');
    }catch(err){ console.error('toggle err', err); }
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // login flow uses server session; supports 2FA
  loginBtn.addEventListener('click', async ()=>{
    const username = (userInput.value||'').trim();
    const p = (passInput.value||'').trim();
    const code = (twoFaInput.value||'').trim();
    if(!username || !p) { alert('Enter username and password'); return; }
    try{
      // if 2FA code is present, call verify endpoint
      if (code) {
        const res = await fetch('/owner/login-2fa', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ code }) });
        if (res.ok) { hideLogin(); fetchOrders(); } else { alert('Invalid 2FA code'); }
        return;
      }

      const res = await fetch('/owner/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username, password: p }) });
      const j = await res.json();
      if (res.ok && j.ok) {
        if (j.needs2fa) {
          twoFaInput.style.display = 'block';
          alert('Enter your 2FA code and press Login again');
        } else {
          hideLogin(); fetchOrders();
        }
      } else {
        alert('Login failed');
      }
    }catch(err){ alert('Login failed'); }
  });

  refreshBtn.addEventListener('click', ()=> fetchOrders());

  // auto-refresh every REFRESH_MS
  fetchOrders();
  setInterval(fetchOrders, REFRESH_MS);
})();
