// Owner UI: fetch published Google Sheet CSV and render as table
(function(){
  const REFRESH_MS = 3 * 60 * 60 * 1000; // 3 hours

  const elNotice = document.getElementById('notice');
  const elTableWrap = document.getElementById('tableWrap');
  const elLast = document.getElementById('lastUpdated');
  const elRefresh = document.getElementById('refreshBtn');

  function showNotice(txt){ if(elNotice) elNotice.textContent = txt; }

  function parseCSV(text){
    const lines = text.trim().split(/\r?\n/);
    if(lines.length === 0) return [];
    const headers = lines[0].split(',').map(h=>h.replace(/^"|"$/g,'').trim());
    const rows = lines.slice(1).map(line=>{
      // simple CSV parse assuming values are quoted if containing commas
      const parts = [];
      let cur = '';
      let inQuotes = false;
      for(let i=0;i<line.length;i++){
        const ch = line[i];
        if(ch === '"') { inQuotes = !inQuotes; continue; }
        if(ch === ',' && !inQuotes){ parts.push(cur); cur = ''; continue; }
        cur += ch;
      }
      parts.push(cur);
      const obj = {};
      headers.forEach((h,idx)=>{ obj[h]= (parts[idx]||'').trim(); });
      return obj;
    });
    return rows;
  }

  function renderTable(rows){
    if(!rows || rows.length===0){ elTableWrap.innerHTML = '<div class="empty">No orders found.</div>'; return; }
    const headers = Object.keys(rows[0]);
    const thead = '<tr>' + headers.map(h=>`<th>${h}</th>`).join('') + '</tr>';
    const body = rows.map(r=>'<tr>'+headers.map(h=>`<td>${(r[h]||'')}</td>`).join('')+'</tr>').join('');
    elTableWrap.innerHTML = `<table><thead>${thead}</thead><tbody>${body}</tbody></table>`;
  }

  async function fetchAndRender(){
    const url = (window.CRAVE_CONFIG && window.CRAVE_CONFIG.ownerFeedUrl) || '';
    if(!url){ showNotice('No ownerFeedUrl is set in config.discount.js. Paste the published CSV URL into ownerFeedUrl.'); elTableWrap.innerHTML=''; return; }
    showNotice('Fetching orders…');
    try{
      const res = await fetch(url, {cache: 'no-store'});
      if(!res.ok) throw new Error('Fetch failed: '+res.status);
      const text = await res.text();
      const rows = parseCSV(text);
      renderTable(rows);
      const now = new Date();
      elLast.textContent = 'Last: ' + now.toLocaleString();
      showNotice('');
    }catch(err){
      showNotice('Error loading orders: '+err.message);
      elTableWrap.innerHTML = '';
    }
  }

  elRefresh.addEventListener('click', ()=>{ fetchAndRender(); });

  // initial load
  fetchAndRender();
  // auto-refresh every 3 hours
  setInterval(fetchAndRender, REFRESH_MS);
})();
