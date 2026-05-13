const STORAGE_KEY = "shaple:v1";

const DEFAULT_STATE = {
  settings: {
    goalLabel: "Hourglass",
    goalWeight: 55,
    goalWaist: 64
  },
  entries: []
};

const MEASUREMENT_KEYS = [
  "neck",
  "shoulder",
  "bust",
  "underbust",
  "upperArm",
  "waist",
  "belly",
  "upperHip",
  "hips",
  "thigh",
  "calf"
];

const state = loadState();

function loadState() {
  const rawState = localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return structuredClone(DEFAULT_STATE);
  }

  try {
    const parsedState = JSON.parse(rawState);

    return {
      settings: { ...DEFAULT_STATE.settings, ...parsedState.settings },
      entries: Array.isArray(parsedState.entries) ? parsedState.entries : []
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
  qsa(selector).forEach((element) => {
    element.textContent = value;
  });
}

function toNumber(value) {
  if (value === "") {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return Number(value).toFixed(digits).replace(/\.0$/, "");
}

function formatDateLabel(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getSortedEntries() {
  return [...state.entries].sort((a, b) => b.date.localeCompare(a.date));
}

function getLatestEntry() {
  return getSortedEntries()[0] ?? null;
}

function getPreviousEntry(latestEntry) {
  return getSortedEntries().find((entry) => entry.id !== latestEntry.id) ?? null;
}

function getChange(latestEntry, previousEntry, key) {
  if (!latestEntry || !previousEntry) {
    return null;
  }

  const latestValue = latestEntry[key] ?? latestEntry.measurements?.[key];
  const previousValue = previousEntry[key] ?? previousEntry.measurements?.[key];

  if (latestValue === null || previousValue === null) {
    return null;
  }

  if (latestValue === undefined || previousValue === undefined) {
    return null;
  }

  return Number(latestValue) - Number(previousValue);
}

function formatChange(value) {
  if (value === null) {
    return "—";
  }

  if (value === 0) {
    return "— 0 cm";
  }

  const prefix = value > 0 ? "+" : "";

  return `${prefix}${value.toFixed(1).replace(/\.0$/, "")} cm`;
}

function renderChange(selector, value) {
  qsa(selector).forEach((element) => {
    element.textContent = formatChange(value);
    element.classList.toggle("is-good", value !== null && value < 0);
    element.classList.toggle("is-bad", value !== null && value > 0);
  });
}

function renderEmptyHome() {
  setText("[data-current-weight]", "—");
  setText("[data-height]", "—");
  setText("[data-latest-date]", "No data");
  setText("[data-entry-count]", "0 records");
  setText("[data-last-change]", "Tap + to add first entry");

  MEASUREMENT_KEYS.forEach((key) => {
    setText(`[data-measurement="${key}"]`, "—");
  });

  ["waist", "belly", "hips", "thigh", "calf"].forEach((key) => {
    renderChange(`[data-change="${key}"]`, null);
  });
}

function renderHome() {
  const latestEntry = getLatestEntry();

  setText("[data-goal-label]", state.settings.goalLabel);

  if (!latestEntry) {
    renderEmptyHome();
    renderHistory();
    return;
  }

  const previousEntry = getPreviousEntry(latestEntry);

  setText("[data-current-weight]", formatNumber(latestEntry.weight, 1));
  setText("[data-height]", formatNumber(latestEntry.height, 0));
  setText("[data-latest-date]", formatDateLabel(latestEntry.date));
  setText("[data-entry-count]", `${state.entries.length} record${state.entries.length > 1 ? "s" : ""}`);
  setText("[data-last-change]", previousEntry ? "Compared with previous entry" : "First entry saved");

  MEASUREMENT_KEYS.forEach((key) => {
    setText(`[data-measurement="${key}"]`, formatNumber(latestEntry.measurements[key], 1));
  });

  ["waist", "belly", "hips", "thigh", "calf"].forEach((key) => {
    renderChange(`[data-change="${key}"]`, getChange(latestEntry, previousEntry, key));
  });

  renderHistory();
}

function openSheet(selector) {
  const sheet = qs(selector);

  if (!sheet) {
    return;
  }

  sheet.hidden = false;
  document.body.classList.add("is-sheet-open");
}

function closeSheets() {
  qsa(".sheet").forEach((sheet) => {
    sheet.hidden = true;
  });

  document.body.classList.remove("is-sheet-open");
}

function setDefaultEntryDate() {
  const dateInput = qs('[data-entry-form] input[name="date"]');

  if (!dateInput || dateInput.value) {
    return;
  }

  dateInput.value = new Date().toISOString().slice(0, 10);
}

function fillFormFromEntry(entry) {
  const form = qs("[data-entry-form]");

  if (!form || !entry) {
    return;
  }

  form.date.value = new Date().toISOString().slice(0, 10);
  form.height.value = entry.height ?? "";
  form.weight.value = entry.weight ?? "";
  form.note.value = entry.note ?? "";

  MEASUREMENT_KEYS.forEach((key) => {
    if (!form.elements[key]) {
      return;
    }

    form.elements[key].value = entry.measurements[key] ?? "";
  });
}

function createEntryFromForm(form) {
  const measurements = {};

  MEASUREMENT_KEYS.forEach((key) => {
    measurements[key] = toNumber(form.elements[key]?.value ?? "");
  });

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: form.date.value,
    height: toNumber(form.height.value),
    weight: toNumber(form.weight.value),
    measurements,
    note: form.note.value.trim(),
    createdAt: Date.now()
  };
}

function saveEntry(entry) {
  const existingIndex = state.entries.findIndex((item) => item.date === entry.date);

  if (existingIndex >= 0) {
    state.entries[existingIndex] = { ...state.entries[existingIndex], ...entry };
  } else {
    state.entries.push(entry);
  }

  saveState();
  renderHome();
}

function renderHistory() {
  const list = qs("[data-history-list]");

  if (!list) {
    return;
  }

  const entries = getSortedEntries();

  if (entries.length === 0) {
    list.innerHTML = '<p class="empty-state">No entries yet. Tap + to save your first measurement.</p>';
    return;
  }

  list.innerHTML = entries.map((entry) => {
    const waist = formatNumber(entry.measurements.waist, 1);
    const belly = formatNumber(entry.measurements.belly, 1);
    const hips = formatNumber(entry.measurements.hips, 1);
    const weight = formatNumber(entry.weight, 1);

    return `
      <article class="history-item">
        <span>
          <strong>${formatDateLabel(entry.date)}</strong>
          <span class="history-meta">
            <small>${weight} kg</small>
            <small>Waist ${waist} cm</small>
            <small>Belly ${belly} cm</small>
            <small>Hips ${hips} cm</small>
          </span>
        </span>
        <strong>›</strong>
      </article>
    `;
  }).join("");
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `shaple-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function fillSettingsForm() {
  const form = qs("[data-settings-form]");

  if (!form) {
    return;
  }

  form.goalLabel.value = state.settings.goalLabel;
  form.goalWeight.value = state.settings.goalWeight ?? "";
  form.goalWaist.value = state.settings.goalWaist ?? "";
}

function bindEvents() {
  qsa("[data-open-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      setDefaultEntryDate();
      openSheet("[data-entry-sheet]");
    });
  });

  qsa("[data-open-history]").forEach((button) => {
    button.addEventListener("click", () => openSheet("[data-history-sheet]"));
  });

  qsa("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      fillSettingsForm();
      openSheet("[data-settings-sheet]");
    });
  });

  qsa("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", closeSheets);
  });

  qs("[data-copy-last]")?.addEventListener("click", () => {
    fillFormFromEntry(getLatestEntry());
  });

  qs("[data-entry-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEntry(createEntryFromForm(event.currentTarget));
    event.currentTarget.reset();
    closeSheets();
  });

  qs("[data-export-json]")?.addEventListener("click", exportJson);

  qs("[data-clear-data]")?.addEventListener("click", () => {
    state.entries = [];
    saveState();
    renderHome();
  });

  qs("[data-settings-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings.goalLabel = event.currentTarget.goalLabel.value.trim() || "Hourglass";
    state.settings.goalWeight = toNumber(event.currentTarget.goalWeight.value);
    state.settings.goalWaist = toNumber(event.currentTarget.goalWaist.value);
    saveState();
    renderHome();
    closeSheets();
  });
}

bindEvents();
renderHome();
