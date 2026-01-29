/* =====================================================
   B2C DASHBOARD PRO MAX PLUS
   ULTRA PREMIUM • ANIMATED • RESPONSIVE
===================================================== */

window.B2C24KPI = window.B2C24KPI || (function () {

  const GROWTH_DROP_ALERT = 5;

  /* ===============================
     HELPERS
  =============================== */
  const fmt = v => (v === null || v === undefined || isNaN(v)) ? '-' : Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const isGood = (val, target) => typeof val === 'number' && typeof target === 'number' && val >= target;
  const isReverseKPI = key => /q gangguan|unspec non warranty/i.test(key);

  const isNotAch = (val, target, indikator) => {
    if (isNaN(val) || isNaN(target)) return false;
    return isReverseKPI(indikator) ? val > target : val < target;
  };

  const getGrowthMeta = (today, yesterday) => {
    if (isNaN(today) || isNaN(yesterday)) return { icon: '-', color: 'secondary', tooltip: 'Data tidak tersedia' };
    const diff = +(today - yesterday).toFixed(2);
    if (diff > 0) return { icon: '🔼', color: 'success', tooltip: `Naik +${diff}% (${today}% vs ${yesterday}%)` };
    if (diff < 0) return { icon: '🔽', color: Math.abs(diff) >= GROWTH_DROP_ALERT ? 'danger' : 'warning', tooltip: `Turun ${diff}% (${today}% vs ${yesterday}%)` };
    return { icon: '↔️', color: 'secondary', tooltip: `Stagnan (${today}%)` };
  };

  const getPujiImage = percent => percent > 99 ? 'puji_senang.png' : percent < 98 ? 'puji_nangis.png' : 'puji_cemberut.png';
  const getPujiText = percent => percent >= 99 ? "🔥 GOKIL! Tinggal dikit lagi 100% 😎" : percent >= 98 ? "💪 Ayo dikit lagi, pasti bisa!" : percent >= 95 ? "⚠️ Masih aman, tapi jangan lengah" : "🚨 Ayo kejar target! Jangan menyerah 😭";

  /* ===============================
     SKELETON LOADER
  =============================== */
  const showSkeleton = () => {
    document.getElementById('b2cSummary').innerHTML = '<div class="col-md-4 skeleton-card"></div>'.repeat(3);
    document.getElementById('b2cKpiGrid').innerHTML = '<div id="b2cKpiSkeleton" class="row g-3">' + '<div class="col-md-3 skeleton-kpi"></div>'.repeat(8) + '</div>';
  };
  const hideSkeleton = () => document.getElementById('b2cKpiSkeleton')?.remove();

  /* ===============================
     GROUP BY KATEGORI
  =============================== */
  const groupByKategori = data => data.reduce((acc, i) => (acc[i.kategori] = acc[i.kategori] || [], acc[i.kategori].push(i), acc), {});

  /* ===============================
     RENDER SUMMARY
  =============================== */
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
      ${renderSummaryCard({ title:'TANGERANG', icon:'🏙️', ach:summary?.totalAch?.tangerang, good:goodTgr, bad:badTgr, theme:'blue' })}
      ${renderSummaryCard({ title:'BANTEN', icon:'🌄', ach:summary?.totalAch?.banten, good:goodBtn, bad:badBtn, theme:'green' })}
    `;
  }

  function renderSummaryCard({ title, icon, ach, good, bad, theme }) {
    const percent = Number(ach) || 0;
    const img = getPujiImage(percent);
    const quote = getPujiText(percent);

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

  /* ===============================
     RENDER KPI GRID
  =============================== */
  function renderKpiGrid(data) {
    const container = document.getElementById('b2cKpiGrid');
    container.innerHTML = '<div class="b2c-kpi-wrapper"></div>';
    const wrapper = container.querySelector('.b2c-kpi-wrapper');
    const grouped = groupByKategori(data);

    Object.entries(grouped).forEach(([kategori, items]) => {
      const row = document.createElement('div'); row.className='kpi-category-row';
      const title = document.createElement('div'); title.className='kpi-category-title'; title.textContent=kategori;
      const cards = document.createElement('div'); cards.className='kpi-category-cards';
      items.forEach(kpi=>{
        const card=document.createElement('div'); card.className='kpi-card mini';
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

  /* ===============================
     KPI HIGHLIGHT + TOOLTIP ULTRA
  =============================== */
  function applyKpiHighlightAndTooltip() {
    document.querySelectorAll('#b2cKpiGrid .kpi-card').forEach(card=>{
      card.classList.remove('good','bad'); card.style.boxShadow='';
      card.querySelector('.kpi-tooltip')?.remove();

      const rows = Array.from(card.querySelectorAll('.kpi-row'));
      const getRow = label => rows.find(r=>r.querySelector('span:first-child')?.innerText.toLowerCase().includes(label));
      const targetRow = getRow('target'), tgrRow = getRow('tangerang'), btnRow = getRow('banten');
      if(!targetRow||!tgrRow||!btnRow)return;

      const parseVal = r=>Number(r.querySelector('span:last-child').innerText.replace(/\./g,'').replace(',', '.'));
      const target=parseVal(targetRow), tgr=parseVal(tgrRow), btn=parseVal(btnRow);
      if(isNaN(target)||isNaN(tgr)||isNaN(btn)return;

      const badTgr=isNotAch(tgr,target,card.querySelector('.indikator-badge').innerText);
      const badBtn=isNotAch(btn,target,card.querySelector('.indikator-badge').innerText);
      const isBad=badTgr||badBtn;

      card.classList.add(isBad?'bad':'good');
      card.style.boxShadow=isBad?'0 0 18px rgba(239,68,68,.75)':'0 0 18px rgba(34,197,94,.55)';

      [ [tgrRow,badTgr],[btnRow,badBtn] ].forEach(([r,b])=>{
        const el=r.querySelector('span:last-child'); el.style.fontWeight='700'; el.style.color=b?'#ef4444':'#22c55e';
      });

      const tooltip=document.createElement('div'); tooltip.className='kpi-tooltip ultra-tooltip';
      tooltip.innerHTML=`
        <strong>${card.querySelector('.kpi-title').innerText}</strong><br>
        Target : ${target}<br>
        Tangerang : ${tgr} ${badTgr?'❌':'✅'}<br>
        Banten : ${btn} ${badBtn?'❌':'✅'}<br>
        <strong>Status :</strong> ${isBad?'❌ BELOW TARGET':'✅ ACH'}
      `;
      card.appendChild(tooltip);
    });
  }

  /* ===============================
     MAIN RENDER
  =============================== */
  const render = api => {
    if(!api||!Array.isArray(api.data))return;
    renderSummary(api);
    renderKpiGrid(api.data);
    applyKpiHighlightAndTooltip();
    hideSkeleton();
    document.getElementById('b2cKpiLoading')?.classList.add('d-none');
    document.getElementById('b2cKpiGrid')?.classList.remove('d-none');
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el=>new bootstrap.Tooltip(el));
  };

  /* ===============================
     INIT DASHBOARD
  =============================== */
  const init = async () => {
    showSkeleton();
    try{
      const res = await fetch(`${B2B_API_URL}?type=b2c_24kpi_banten`);
      const json = await res.json();
      render(json);
    }catch(e){console.error('Main KPI API failed',e);}
  };

  return { init };

})();

window.initDashboardB2C24KPI = () => B2C24KPI.init();
