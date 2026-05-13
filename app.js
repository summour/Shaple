/* ============================================================
   APP.JS — Main Controller, Navigation, Events
   ============================================================ */

// ── Navigation ────────────────────────────────────────────
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) target.classList.add('active');

  // Update sidebar
  document.querySelectorAll('.sidenav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screenId);
  });

  // Update bottom nav
  document.querySelectorAll('.bnav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screenId);
  });

  AppState.currentScreen = screenId;

  // Screen-specific init
  if (screenId === 'history') renderHistory();
  if (screenId === 'add')     { renderEntryForm(); }
  if (screenId === 'stats')   { renderStatsChart(); }
  if (screenId === 'bodymap') initBodyMap();
}

// ── Wire up nav buttons ───────────────────────────────────
function initNav() {
  // Sidebar
  document.querySelectorAll('.sidenav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  // Bottom nav
  document.querySelectorAll('.bnav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.screen) navigateTo(btn.dataset.screen);
    });
  });
}

// ── Add Entry Screen Events ───────────────────────────────
function initAddEntry() {
  const cancelBtn  = document.getElementById('cancelAdd');
  const copyBtn    = document.getElementById('copyLastBtn');
  const saveBtn    = document.getElementById('saveEntryBtn');

  cancelBtn?.addEventListener('click', () => navigateTo('home'));

  copyBtn?.addEventListener('click', () => {
    fillLastEntry();
    showToast('✓ Filled with last entry values');
  });

  saveBtn?.addEventListener('click', () => {
    const entry = collectEntry();
    const hasData = FIELDS.some(f => entry[f.key] > 0);
    if (!hasData) {
      showToast('⚠️ Please enter at least one measurement');
      return;
    }
    AppState.addEntry(entry);
    clearEntryForm();
    showToast('✅ Entry saved!');
    setTimeout(() => navigateTo('history'), 600);
  });
}

// ── Export / Backup ───────────────────────────────────────
function initExport() {
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    AppState.exportJSON();
    showToast('📦 Backup downloaded!');
  });
}

// ── Body Map link from Home ───────────────────────────────
function initHomeLinks() {
  document.getElementById('goToBodyMap')?.addEventListener('click', () => {
    navigateTo('bodymap');
  });
}

// ── Privacy Toggle ────────────────────────────────────────
function initProfileToggles() {
  const toggle = document.getElementById('privacyToggle');
  toggle?.addEventListener('click', () => {
    const isOn = toggle.textContent === 'On';
    toggle.textContent = isOn ? 'Off' : 'On';
    toggle.classList.toggle('green', !isOn);
    showToast(isOn ? '🔓 Privacy Lock off' : '🔒 Privacy Lock on');
  });
}

// ── Resize: redraw chart ──────────────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (AppState.currentScreen === 'stats') renderStatsChart();
  }, 200);
});

// ── Bootstrap ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initAddEntry();
  initExport();
  initHomeLinks();
  initProfileToggles();
  initPeriodTabs();

  // Render initial screen
  navigateTo('home');
});
