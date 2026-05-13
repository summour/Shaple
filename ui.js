/* ============================================================
   UI.JS — Screen Render Functions
   ============================================================ */

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  void t.offsetWidth;
  t.classList.add('show');
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, duration);
}

// ── Render History ────────────────────────────────────────
function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  list.innerHTML = '';

  AppState.entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-item-main">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="history-date">${AppState.formatDate(entry.date)}</span>
          <span class="history-weight">${entry.weight} kg</span>
        </div>
        <div class="history-metrics">
          Waist ${entry.waist} cm &nbsp;·&nbsp; Belly ${entry.belly} cm &nbsp;·&nbsp; Hips ${entry.hips} cm
        </div>
      </div>
      <span class="arrow">›</span>
    `;
    list.appendChild(div);
  });
}

// ── Render Entry Form ─────────────────────────────────────
function renderEntryForm() {
  const container = document.getElementById('entryFields');
  if (!container) return;
  container.innerHTML = '';

  FIELDS.forEach(f => {
    const row = document.createElement('div');
    row.className = 'field-row';
    row.innerHTML = `
      <span class="field-icon">${f.icon}</span>
      <span class="field-label">${f.label}</span>
      <input type="number" class="field-input" id="field-${f.key}"
             step="0.1" min="0" placeholder="—" />
      <span class="field-unit">${f.unit}</span>
    `;
    container.appendChild(row);
  });
}

// Fill form with last entry values
function fillLastEntry() {
  const last = AppState.getLatest();
  if (!last) return;
  FIELDS.forEach(f => {
    const inp = document.getElementById('field-' + f.key);
    if (inp && last[f.key] !== undefined) inp.value = last[f.key];
  });
  const noteInp = document.getElementById('noteInput');
  if (noteInp) noteInp.value = '';
}

// Collect form values into entry object
function collectEntry() {
  const entry = { date: new Date().toISOString().split('T')[0] };
  FIELDS.forEach(f => {
    const inp = document.getElementById('field-' + f.key);
    entry[f.key] = inp ? parseFloat(inp.value) || 0 : 0;
  });
  const noteInp = document.getElementById('noteInput');
  entry.note = noteInp ? noteInp.value : '';
  return entry;
}

// Clear the form
function clearEntryForm() {
  FIELDS.forEach(f => {
    const inp = document.getElementById('field-' + f.key);
    if (inp) inp.value = '';
  });
  const noteInp = document.getElementById('noteInput');
  if (noteInp) noteInp.value = '';
}

// ── Render Stats Chart ────────────────────────────────────
function renderStatsChart() {
  const entries = [...AppState.entries].reverse(); // oldest → newest
  const labels  = entries.map(e => {
    const d = new Date(e.date);
    return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`;
  });
  const vals = entries.map(e => e.waist);
  setTimeout(() => drawLineChart('waistChart', labels, vals, '#3b82f6'), 50);
}

// ── Render Home (update latest values) ───────────────────
function renderHome() {
  // No dynamic update needed; values are static defaults
  // but could be extended to show latest entry data here
}

// ── Body Map interactions ─────────────────────────────────
function initBodyMap() {
  const dots   = document.querySelectorAll('.body-dot');
  const labels = document.querySelectorAll('.bm-label');

  dots.forEach((dot, i) => {
    dot.style.setProperty('--i', i);

    dot.addEventListener('mouseenter', (e) => {
      const tip    = document.getElementById('bodymap-tooltip');
      const svgEl  = dot.closest('svg');
      const svgRect = svgEl.getBoundingClientRect();
      const cx     = parseFloat(dot.getAttribute('cx'));
      const cy     = parseFloat(dot.getAttribute('cy'));

      // Convert SVG coords to screen
      const pt     = svgEl.createSVGPoint();
      pt.x = cx; pt.y = cy;
      const screen = pt.matrixTransform(svgEl.getScreenCTM());

      const wrap     = document.querySelector('.bodymap-svg-wrap');
      const wrapRect = wrap.getBoundingClientRect();

      tip.textContent = `${dot.dataset.label}: ${dot.dataset.val}`;
      tip.classList.remove('hidden');
      tip.style.left = (screen.x - wrapRect.left + 10) + 'px';
      tip.style.top  = (screen.y - wrapRect.top  - 28) + 'px';
    });

    dot.addEventListener('mouseleave', () => {
      document.getElementById('bodymap-tooltip').classList.add('hidden');
    });
  });

  labels.forEach(lbl => {
    lbl.addEventListener('click', () => {
      labels.forEach(l => l.classList.remove('active'));
      lbl.classList.add('active');
      const dotId = lbl.dataset.dot;
      document.querySelectorAll('.body-dot').forEach(d => {
        d.setAttribute('fill', '#3b82f6');
      });
      const target = document.getElementById(dotId);
      if (target) target.setAttribute('fill', '#22c55e');
    });
  });
}

// ── Period Tabs (Stats) ───────────────────────────────────
function initPeriodTabs() {
  document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderStatsChart();
    });
  });
}
