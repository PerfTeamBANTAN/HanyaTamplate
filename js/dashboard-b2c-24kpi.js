/* =====================================================
   B2C DASHBOARD PRO MAX PLUS ULTRA READY FINAL
   FULL FEATURED • SAFE PRODUCTION
===================================================== */

window.B2C24KPI = (function () {

  const GROWTH_DROP_ALERT = 5; // % threshold turun → danger

  // ================= HELPERS =================
  const fmt = v => (v == null || isNaN(v)) ? '-' : Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const isReverseKPI = key => /q gangguan|unspec non warranty/i.test(key);
  const isNotAch = (val, target, indikator) => isNaN(val) || isNaN(target) ? false : (isReverseKPI(indikator) ? val > target : val < target);
  const getGrowthMeta = (today, yesterday) => {
    if (isNaN(today) || isNaN(yesterday)) return { icon: '-', color: 'secondary', tooltip: 'Data tidak tersedia' };
    const diff = +(today - yesterday).toFixed(2);
    if (diff > 0) return { icon: '🔼', color: 'success', tooltip: `Naik +${diff}% (${today}% vs ${yesterday}%)` };
    if (diff < 0) return { icon: '🔽', color: Math.abs(diff) >= GROWTH_DROP_ALERT ? 'danger' : 'warning', tooltip: `Turun ${diff}% (${today}% vs ${yesterday}%)` };
    return { icon: '↔️', color: 'secondary', tooltip: `Stagnan (${today}%)` };
  };

  const getPujiImage = percent => percent > 99 ? 'puji_senang.png' : percent < 98 ? 'puji_nangis.png' : 'puji_cemberut.png';
  const getPujiText = percent => percent >= 99 ? "🔥 GOKIL! Tinggal dikit lagi 100% 😎" : percent >= 98 ? "💪 Ayo dikit lagi, pasti bisa!" : percent >= 95 ? "⚠️ Masih aman, tapi jangan lengah" : "🚨 Ayo kejar target! Jangan menyerah 😭";

  const showSkeleton = () => {
    document.getElementById('b2cSummary').innerHTML = '<div class="col-md-4 skeleton-card"></div>'.repeat(3);
    document.getElementById('b2cKpiGrid').innerHTML = '<div id="b2cKpiSkeleton" class="row g-3">' + '<div class="col-md-3 skeleton-kpi"></div>'.repeat(8) + '</div>';
  };
  const hideSkeleton = () => document.getElementById('b2cKpiSkeleton')?.remove();
  const groupByKategori = data => data.reduce((acc, i) => (acc[i.kategori] = acc[i.kategori] || [], acc[i.kategori].push(i), acc), {});

  // ================= RENDER SUMMARY =================
  function renderSummary(api) {
    const { data, summary, lastUpdate } = api;
    document.getElementById('b2cLastUpdate').innerText = `Last Update : ${lastUpdate}`;
    let goodTgr = 0, badTgr = 0, goodBtn = 0, badBtn = 0;
    data.forEach(kpi => {
      const t = Number(kpi.target);
      if (!isNaN(kpi.tangerang)) isNotAch(kpi.tangerang, t, kpi.indikator) ? badTgr++ : goodTgr++;
      if (!isNaN(kpi.banten)) isNotAch(kpi.banten, t, kpi.indikator) ? badBtn++ : goodBtn++;
    });
    document.getElementById('b2cSummary').innerHTML = `
      ${renderSummaryCard({ title: 'TANGERANG', icon: '🏙️', ach: summary?.totalAch?.tangerang, good: goodTgr, bad: badTgr, theme: 'blue' })}
      ${renderSummaryCard({ title: 'BANTEN', icon: '🌄', ach: summary?.totalAch?.banten, good: goodBtn, bad: badBtn, theme: 'green' })}
    `;
  }

  function renderSummaryCard({ title, icon, ach, good, bad, theme }) {
    const percent = Number(ach) || 0, img = getPujiImage(percent), quote = getPujiText(percent);
    return `
      <div class="col-md-6">
        <div class="summary-card-v3 ${theme} animate-fade-in hover-glow">
          <div class="summary-left">
            <h5>${icon} ${title}</h5>
            <div class="summary-quote glow-text">${quote}</div>
            <div class="summary-progress mt-2">
              <div class="summary-progress-bar ultra-smooth" style="width:${percent}%"></div>
            </div>
            <div class="summary-percent">${percent.toFixed(2)}%</div>
            <div class="summary-footer">
              <span class="text-success fw-bold">Ach ${good}</span>
              <span class="text-danger fw-bold">Not Ach ${bad}</span>
            </div>
          </div>
          <div class="summary-right">
            <img src="./assets/img/${img}" alt="puji" class="summary-avatar bounce tilt">
          </div>
        </div>
      </div>
    `;
  }

  // ================= KPI GRID =================
  function renderKpiGrid(data) {
    const container = document.getElementById('b2cKpiGrid'); container.innerHTML = '<div class="b2c-kpi-wrapper"></div>';
    const wrapper = container.querySelector('.b2c-kpi-wrapper');
    const grouped = groupByKategori(data);
    Object.entries(grouped).forEach(([kategori, items]) => {
      const row = document.createElement('div'); row.className = 'kpi-category-row';
      const title = document.createElement('div'); title.className = 'kpi-category-title'; title.textContent = kategori;
      const cards = document.createElement('div'); cards.className = 'kpi-category-cards';
      items.forEach(kpi => {
        const card = document.createElement('div'); card.className = 'kpi-card mini';
        card.innerHTML = `
          <div class="kpi-title"><span class="indikator-badge">${kpi.indikator}</span></div>
          <div class="kpi-row"><span>Target :</span><span>${fmt(kpi.target)}</span></div>
          <div class="kpi-row"><span>Tangerang :</span><span>${fmt(kpi.tangerang)}</span></div>
          <div class="kpi-row"><span>Banten :</span><span>${fmt(kpi.banten)}</span></div>
        `;
        cards.appendChild(card);
      });
      row.appendChild(title); row.appendChild(cards); wrapper.appendChild(row);
    });
  }

  // ================= HIGHLIGHT & TOOLTIP =================
  function applyKpiHighlightAndTooltip() {
    document.querySelectorAll('#b2cKpiGrid .kpi-card').forEach(card => {
      card.classList.remove('good', 'bad'); card.style.boxShadow = ''; card.querySelector('.kpi-tooltip')?.remove();
      const rows = Array.from(card.querySelectorAll('.kpi-row'));
      const getRow = label => rows.find(r => r.querySelector('span:first-child')?.innerText.toLowerCase().includes(label));
      const targetRow = getRow('target'), tgrRow = getRow('tangerang'), btnRow = getRow('banten');
      if (!targetRow || !tgrRow || !btnRow) return;
      const parseVal = r => Number(r.querySelector('span:last-child').innerText.replace(/\./g, '').replace(',', '.'));
      const target = parseVal(targetRow), tgr = parseVal(tgrRow), btn = parseVal(btnRow);
      if (isNaN(target) || isNaN(tgr) || isNaN(btn)) return;
      const badTgr = isNotAch(tgr, target, card.querySelector('.indikator-badge').innerText);
      const badBtn = isNotAch(btn, target, card.querySelector('.indikator-badge').innerText);
      const isBad = badTgr || badBtn;
      card.classList.add(isBad ? 'bad' : 'good');
      card.style.boxShadow = isBad ? '0 0 18px rgba(239,68,68,.75)' : '0 0 18px rgba(34,197,94,.55)';
      [[tgrRow, badTgr], [btnRow, badBtn]].forEach(([r, b]) => { const el = r.querySelector('span:last-child'); el.style.fontWeight = '700'; el.style.color = b ? '#ef4444' : '#22c55e'; });
      const tooltip = document.createElement('div'); tooltip.className = 'kpi-tooltip ultra-tooltip';
      tooltip.innerHTML = `<strong>${card.querySelector('.kpi-title').innerText}</strong><br>Target : ${target}<br>Tangerang : ${tgr} ${badTgr ? '❌' : '✅'}<br>Banten : ${btn} ${badBtn ? '❌' : '✅'}<br><strong>Status :</strong> ${isBad ? '❌ BELOW TARGET' : '✅ ACH'}`;
      card.appendChild(tooltip);
    });
  }

  // ================= RENDER BAD KPI TABLE =================
  function renderBadKpiTable(data) {
    const tgrBody = document.getElementById('b2cKpiTableTgr');
    const btnBody = document.getElementById('b2cKpiTableBtn');
    if (!tgrBody || !btnBody) return;

    tgrBody.innerHTML = ''; btnBody.innerHTML = '';
    let hasBadTgr = false, hasBadBtn = false;

    data.forEach(kpi => {
      const target = Number(kpi.target), tgr = Number(kpi.tangerang), btn = Number(kpi.banten), tgrY = Number(kpi.tangerang_yesterday), btnY = Number(kpi.banten_yesterday);

      if (isNotAch(tgr, target, kpi.indikator)) {
        hasBadTgr = true; const g = getGrowthMeta(tgr, tgrY);
        tgrBody.innerHTML += `<tr class="${g.color==='danger'?'table-danger':''}">
          <td>${kpi.indikator}</td><td>${fmt(target)}</td><td class="fw-bold text-danger">${fmt(tgr)}</td>
          <td><span class="badge bg-danger">Not Ach</span></td>
          <td class="text-center"><span class="badge bg-${g.color}" title="${g.tooltip}">${g.icon}</span></td>
          <td>${fmt(tgrY)}</td>
          <td><span class="badge ${isNotAch(tgrY,target,kpi.indikator)?'bg-danger':'bg-success'}">${isNotAch(tgrY,target,kpi.indikator)?'Not Ach':'Ach'}</span></td>
        </tr>`;
      }

      if (isNotAch(btn, target, kpi.indikator)) {
        hasBadBtn = true; const g = getGrowthMeta(btn, btnY);
        btnBody.innerHTML += `<tr class="${g.color==='danger'?'table-danger':''}">
          <td>${kpi.indikator}</td><td>${fmt(target)}</td><td class="fw-bold text-danger">${fmt(btn)}</td>
          <td><span class="badge bg-danger">Not Ach</span></td>
          <td class="text-center"><span class="badge bg-${g.color}" title="${g.tooltip}">${g.icon}</span></td>
          <td>${fmt(btnY)}</td>
          <td><span class="badge ${isNotAch(btnY,target,kpi.indikator)?'bg-danger':'bg-success'}">${isNotAch(btnY,target,kpi.indikator)?'Not Ach':'Ach'}</span></td>
        </tr>`;
      }
    });

    document.getElementById('b2cTableLoadingTgr')?.classList.add('d-none');
    document.getElementById('b2cTableLoadingBtn')?.classList.add('d-none');
    if (hasBadTgr) document.getElementById('b2cTableWrapperTgr')?.classList.remove('d-none');
    if (hasBadBtn) document.getElementById('b2cTableWrapperBtn')?.classList.remove('d-none');
  }

  // ================= KPI GRID DETAIL TABLE =================
  function renderKpiGridDetailTable(headers, data, wrapperId, loadingId, contentId) {
    const wrapper = document.getElementById(wrapperId), loading = document.getElementById(loadingId), content = document.getElementById(contentId), thead = wrapper?.querySelector('thead'), tbody = wrapper?.querySelector('tbody');
    if (!wrapper || !thead || !tbody) return;
    thead.innerHTML = ''; tbody.innerHTML = '';
    const kpiStartIndex = headers.indexOf('Target') + 1;
    const trHead = document.createElement('tr');
    headers.forEach((h, i) => { const th = document.createElement('th'); th.textContent = h; th.className = `text-center fw-semibold kpi-th ${i >= kpiStartIndex ? 'kpi-col' : ''}`; trHead.appendChild(th); }); 
    thead.appendChild(trHead);

    data.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach((h, i) => {
        const td = document.createElement('td'); const val = row[h];
        td.textContent = val ?? '-'; td.classList.add('kpi-td');
        if (i >= kpiStartIndex) {
          const num = Number(val), target = Number(row.Target);
          if (!isNaN(num)) { td.classList.add('text-end'); if (isNotAch(num, target, row.Indikator)) td.classList.add('kpi-not-ach'); }
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    loading?.classList.add('d-none'); content?.classList.remove('d-none'); wrapper?.classList.remove('d-none');
  }

  async function loadKpiGridDetailTableTgr() { try { const res = await fetch(`${B2B_API_URL}?type=kpi_grid_table`); const json = await res.json(); if (!json || !Array.isArray(json.data)) return; renderKpiGridDetailTable(json.headers,json.data,'b2cKpiGridTableWrapper','b2cKpiGridTableLoading','b2cKpiGridTableContent'); } catch(e){console.error(e);} }
  async function loadKpiGridDetailTableBtn() { try { const res = await fetch(`${B2B_API_URL}?type=kpi_grid_table_btn`); const json = await res.json(); if (!json || !Array.isArray(json.data)) return; renderKpiGridDetailTable(json.headers,json.data,'b2cKpiGridTableBtnWrapper','b2cKpiGridTableBtnLoading','b2cKpiGridTableBtnContent'); } catch(e){console.error(e);} }

  // ================= KPI RANKING =================
  function renderRankingTable({ data, bodyId, loadingId, wrapperId, labelKey, valueKey, showPhoto = false }) {
    const tbody = document.getElementById(bodyId), loading = document.getElementById(loadingId), wrapper = document.getElementById(wrapperId);
    if (!tbody || !loading || !wrapper) return;
    tbody.innerHTML = '';

    const hsaFileMap = { 'dady': 'dady', 'eka': 'eka', 'eka (cpd)': 'eka', 'herlando': 'herlando', 'vicky': 'viki', 'elri': 'elri', 'zulfa': 'zulfa', 'yanto cilegon': 'yanto', 'yanto lebak': 'yanto', 'guntur': 'guntur', 'danang': 'danang' };

    data.forEach((row, index) => {
      let num = parseFloat(String(row[valueKey]).replace('%','').replace(',', '.')) || 0;
      const isLow = num < 95;
      let badge = index===0?'🥇':index===1?'🥈':index===2?'🥉':'';
      let nameHtml = row[labelKey]??'-';
      if(showPhoto){const baseFileName = hsaFileMap[(row[labelKey]??'').toLowerCase().trim()]??null; let photoFile = baseFileName?(index<=2?`${baseFileName}_juara.png`:`${baseFileName}_kalah.png`):'default.png'; nameHtml = `<img src="assets/img/${photoFile}" alt="${row[labelKey]??'-'}" class="rounded-circle me-2" style="width:30px;height:30px;object-fit:cover;">${row[labelKey]??'-'}`;}
      const tr = document.createElement('tr'); tr.innerHTML = `<td class="fw-semibold d-flex align-items-center">${badge?`<span class="badge">${badge}</span>`:''}<span class="text-muted me-2">${index+1}.</span>${nameHtml}</td><td class="text-end fw-bold ${isLow?'text-danger':'text-success'}">${num.toFixed(2)}%</td>`; tbody.appendChild(tr);
    });

    loading.classList.add('d-none'); wrapper.classList.remove('d-none');
  }

  async function loadKpiRankingHSA(){try{const res=await fetch(`${B2B_API_URL}?type=kpi_ranking_table_hsa`);const json=await res.json();if(!json?.headers || !json?.data?.length)return; renderRankingTable({data:json.data,bodyId:'b2bTable1Body',loadingId:'b2bTable1Loading',wrapperId:'b2bTable1Wrapper',labelKey:json.headers[0],valueKey:json.headers[1],showPhoto:true});}catch(err){console.error(err);document.getElementById('b2bTable1Loading')?.classList.add('d-none');}}
  async function loadKpiRankingMitra(){try{const res=await fetch(`${B2B_API_URL}?type=kpi_ranking_table_mitra`);const json=await res.json();if(!json?.headers || !Array.isArray(json.data))return; renderRankingTable({data:json.data,bodyId:'b2bTable2Body',loadingId:'b2bTable2Loading',wrapperId:'b2bTable2Wrapper',labelKey:json.headers[0],valueKey:json.headers[1],showPhoto:false});}catch(err){console.error(err);document.getElementById('b2bTable2Loading')?.classList.add('d-none');}}

  // ================= MAIN INIT =================
  function render(api){if(!api || !Array.isArray(api.data))return; renderSummary(api); renderKpiGrid(api.data); applyKpiHighlightAndTooltip(); renderBadKpiTable(api.data); document.getElementById('b2cKpiLoading')?.classList.add('d-none'); document.getElementById('b2cKpiGrid')?.classList.remove('d-none'); document.getElementById('content-area')?.classList.add('safe-scroll'); hideSkeleton(); document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el=>new bootstrap.Tooltip(el));}

  async function init(){showSkeleton(); try{const res=await fetch(`${B2B_API_URL}?type=b2c_24kpi_banten`);const json=await res.json();render(json);}catch(err){console.error(err);} await loadKpiGridDetailTableTgr(); await loadKpiGridDetailTableBtn(); await loadKpiRankingHSA(); await loadKpiRankingMitra();}

  return { init };

})();

window.initDashboardB2C24KPI = () => B2C24KPI.init();
