const STORAGE_KEY = "shaple:croakle:v1";
const METRIC_KEYS = ["neck", "bust", "waist", "belly", "hips", "thigh", "calf"];

const DEFAULT_STATE = {
  settings: {
    goalLabel: "Lose 5 kg",
    startWeight: 77.4,
    targetWeight: 72.4
  },
  entries: []
};

const DEMO_ENTRIES = [
  makeEntry("2025-04-03", 76.4, 170, 36, 92, 80, 89, 100, 58, 37),
  makeEntry("2025-04-10", 75.6, 170, 36, 92, 79, 88, 99.5, 58, 37),
  makeEntry("2025-04-17", 75.0, 170, 36, 92, 78, 87.5, 99, 57, 36.5),
  makeEntry("2025-04-24", 74.2, 170, 36, 92, 77.5, 87, 98.5, 57, 36.5),
  makeEntry("2025-05-01", 73.6, 170, 36, 92, 77, 86.5, 98, 56.5, 36),
  makeEntry("2025-05-08", 73.0, 170, 36, 92, 76.5, 86, 98, 56, 36),
  makeEntry("2025-05-13", 72.4, 170, 36, 92, 76, 86, 98, 56, 36)
];

let state = loadState();

function makeEntry(date, weight, height, neck, bust, waist, belly, hips, thigh, calf) {
  return {
    id: date,
    date,
    weight,
    height,
    note: "",
    metrics: { neck, bust, waist, belly, hips, thigh, calf }
  };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!stored) return structuredClone(DEFAULT_STATE);

    return {
      settings: { ...DEFAULT_STATE.settings, ...stored.settings },
      entries: Array.isArray(stored.entries) ? stored.entries : []
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function setText(selector, value) {
  qsa(selector).forEach((node) => {
    node.textContent = value;
  });
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
}

function formatNumber(value, digits = 1) {
  if (value === null || value === undefined) return "—";

  return Number(value).toFixed(digits).replace(/\.0$/, "");
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function sortedEntries() {
  return [...state.entries].sort((a, b) => b.date.localeCompare(a.date));
}

function latestEntry() {
  return sortedEntries()[0] ?? null;
}

function oldestEntry() {
  return [...state.entries].sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
}

function setView(viewName) {
  qsa("[data-view]").forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === viewName);
  });

  qsa("[data-nav]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.nav === viewName);
  });

  window.scrollTo({ top: 0, behavior: "instant" });
}

function setMetricText(entry) {
  METRIC_KEYS.forEach((key) => {
    setText(`[data-metric="${key}"]`, formatNumber(entry?.metrics?.[key]));
  });
}

function renderHome() {
  const entry = latestEntry();

  setText("[data-goal-title]", state.settings.goalLabel);

  if (!entry) {
    setText("[data-weight]", "—");
    setText("[data-height]", "—");
    setText("[data-latest-date]", "No data");
    setMetricText(null);
    renderGoal(null);
    renderHistory();
    renderStats();
    return;
  }

  setText("[data-weight]", formatNumber(entry.weight));
  setText("[data-height]", formatNumber(entry.height, 0));
  setText("[data-latest-date]", "Today");
  setMetricText(entry);
  renderGoal(entry);
  renderHistory();
  renderStats();
}

function renderGoal(entry) {
  if (!entry || !state.settings.startWeight || !state.settings.targetWeight) {
    setText("[data-goal-percent]", "0%");
    setText("[data-goal-left]", "Save entries to track progress");
    qs("[data-goal-bar]").style.width = "0%";
    return;
  }

  const total = state.settings.startWeight - state.settings.targetWeight;
  const done = state.settings.startWeight - entry.weight;
  const percent = Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  const left = Math.max(0, entry.weight - state.settings.targetWeight);

  setText("[data-goal-percent]", `${percent}%`);
  setText("[data-goal-left]", `${formatNumber(left)} kg to go`);
  qs("[data-goal-bar]").style.width = `${percent}%`;
}

function createEntryFromForm(form) {
  const metrics = {};

  METRIC_KEYS.forEach((key) => {
    metrics[key] = numberOrNull(form.elements[key].value);
  });

  return {
    id: form.date.value,
    date: form.date.value,
    weight: numberOrNull(form.weight.value),
    height: numberOrNull(form.height.value),
    note: form.note.value.trim(),
    metrics
  };
}

function saveEntry(entry) {
  const existingIndex = state.entries.findIndex((item) => item.date === entry.date);

  if (existingIndex >= 0) state.entries[existingIndex] = entry;
  else state.entries.push(entry);

  saveState();
  renderHome();
}

function fillForm(entry) {
  const form = qs("[data-entry-form]");
  const source = entry ?? latestEntry();

  form.date.value = new Date().toISOString().slice(0, 10);

  if (!source) return;

  form.weight.value = source.weight ?? "";
  form.height.value = source.height ?? "";
  form.note.value = source.note ?? "";
  METRIC_KEYS.forEach((key) => {
    form.elements[key].value = source.metrics[key] ?? "";
  });
}

function renderHistory() {
  const list = qs("[data-history-list]");
  const entries = sortedEntries();

  if (!list) return;

  if (!entries.length) {
    list.innerHTML = '<p class="empty">No entries yet. Tap + to save your first entry.</p>';
    return;
  }

  list.innerHTML = entries.map((entry) => `
    <article class="history-item">
      <strong>${formatDate(entry.date)}</strong>
      <span>${formatNumber(entry.weight)} kg ›</span>
    </article>
  `).join("");
}

function monthlyEntries() {
  const latest = latestEntry();
  if (!latest) return [];

  const month = latest.date.slice(0, 7);
  return sortedEntries().filter((entry) => entry.date.startsWith(month)).reverse();
}

function rangeChange(entries, getter) {
  if (entries.length < 2) return null;
  return getter(entries.at(-1)) - getter(entries[0]);
}

function formatChange(value, unit) {
  if (value === null || value === undefined) return "—";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatNumber(value)} ${unit}`;
}

function renderStats() {
  const entries = monthlyEntries();
  const weightChange = rangeChange(entries, (entry) => entry.weight);
  const waistChange = rangeChange(entries, (entry) => entry.metrics.waist);

  setText("[data-weight-change]", formatChange(weightChange, "kg"));
  setText("[data-waist-change]", formatChange(waistChange, "cm"));
  setText("[data-month-weight]", formatChange(weightChange, "kg"));
  setText("[data-month-waist]", formatChange(waistChange, "cm"));
  setText("[data-month-entries]", entries.length);
  renderChart(entries, "weight", "[data-weight-line]", "[data-weight-points]");
  renderChart(entries, "waist", "[data-waist-line]", "[data-waist-points]");
}

function valueForChart(entry, key) {
  return key === "weight" ? entry.weight : entry.metrics[key];
}

function renderChart(entries, key, lineSelector, pointsSelector) {
  const line = qs(lineSelector);
  const points = qs(pointsSelector);
  const valid = entries.filter((entry) => valueForChart(entry, key) !== null);

  if (!line || !points) return;

  if (!valid.length) {
    line.setAttribute("d", "");
    points.innerHTML = "";
    return;
  }

  const values = valid.map((entry) => valueForChart(entry, key));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const xStep = valid.length > 1 ? 290 / (valid.length - 1) : 0;
  const coords = valid.map((entry, index) => {
    const x = 15 + xStep * index;
    const y = 125 - ((valueForChart(entry, key) - min) / range) * 92;
    return { x, y };
  });

  line.setAttribute("d", coords.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" "));
  points.innerHTML = coords.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5"></circle>`).join("");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `shaple-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function fillSettings() {
  const form = qs("[data-settings-form]");
  form.goalLabel.value = state.settings.goalLabel;
  form.startWeight.value = state.settings.startWeight ?? "";
  form.targetWeight.value = state.settings.targetWeight ?? "";
}

function bindEvents() {
  qsa("[data-view-button]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.viewButton === "add") fillForm();
      if (button.dataset.viewButton === "profile") fillSettings();
      setView(button.dataset.viewButton);
    });
  });

  qs("[data-entry-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    saveEntry(createEntryFromForm(event.currentTarget));
    event.currentTarget.reset();
    setView("home");
  });

  qs("[data-copy-last]").addEventListener("click", () => fillForm(latestEntry()));

  qsa("[data-export]").forEach((button) => {
    button.addEventListener("click", exportData);
  });

  qs("[data-fill-demo]").addEventListener("click", () => {
    state.entries = structuredClone(DEMO_ENTRIES);
    saveState();
    renderHome();
    fillSettings();
  });

  qs("[data-settings-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings.goalLabel = event.currentTarget.goalLabel.value.trim() || "Lose 5 kg";
    state.settings.startWeight = numberOrNull(event.currentTarget.startWeight.value);
    state.settings.targetWeight = numberOrNull(event.currentTarget.targetWeight.value);
    saveState();
    renderHome();
    setView("home");
  });

  qs("[data-clear]").addEventListener("click", () => {
    state = structuredClone(DEFAULT_STATE);
    saveState();
    renderHome();
    fillSettings();
  });
}

bindEvents();
if (!state.entries.length) {
  state.entries = structuredClone(DEMO_ENTRIES);
  saveState();
}
renderHome();
