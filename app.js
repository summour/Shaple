const demoEntry = {
  dateLabel: "24 Jan 2026",
  heightCm: 157,
  weightKg: 60.0,
  reminderDays: 3,
  measurements: {
    neck: 31.5,
    bust: 92,
    waist: 69,
    belly: 72,
    hips: 92,
    thigh: 50,
    calf: 36
  },
  changes: {
    waist: -1.0,
    belly: -0.5,
    hips: 0,
    thigh: -0.5,
    calf: 0
  }
};

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.textContent = value;
}

function setAllText(selector, value) {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    element.textContent = value;
  });
}

function formatChange(value) {
  if (value === 0) {
    return "— 0 cm";
  }

  return `${value.toFixed(1)} cm`;
}

function renderSummary(entry) {
  setText("[data-current-weight]", entry.weightKg.toFixed(1));
  setText("[data-height]", entry.heightCm);
  setText("[data-latest-date]", entry.dateLabel);
  setText("[data-reminder-days]", `${entry.reminderDays} days`);
}

function renderMeasurements(entry) {
  Object.entries(entry.measurements).forEach(([key, value]) => {
    setAllText(`[data-measurement="${key}"]`, value);
  });
}

function renderChanges(entry) {
  Object.entries(entry.changes).forEach(([key, value]) => {
    const element = document.querySelector(`[data-change="${key}"]`);

    if (!element) {
      return;
    }

    element.textContent = formatChange(value);
    element.classList.toggle("is-good", value < 0);
  });
}

function renderHome(entry) {
  renderSummary(entry);
  renderMeasurements(entry);
  renderChanges(entry);
}

renderHome(demoEntry);
