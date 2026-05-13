/* ============================================================
   DATA.JS — App State & Default Data
   ============================================================ */

const FIELDS = [
  { key: 'weight',    label: 'Weight',    icon: '⚖️',  unit: 'kg' },
  { key: 'neck',      label: 'Neck',      icon: '👔',  unit: 'cm' },
  { key: 'shoulder',  label: 'Shoulder',  icon: '🤷',  unit: 'cm' },
  { key: 'bust',      label: 'Bust',      icon: '👙',  unit: 'cm' },
  { key: 'underbust', label: 'Underbust', icon: '〰️', unit: 'cm' },
  { key: 'upperArm',  label: 'Upper Arm', icon: '💪',  unit: 'cm' },
  { key: 'waist',     label: 'Waist',     icon: '👗',  unit: 'cm' },
  { key: 'belly',     label: 'Belly',     icon: '🫃',  unit: 'cm' },
  { key: 'upperHip',  label: 'Upper Hip', icon: '🔻',  unit: 'cm' },
  { key: 'hips',      label: 'Hips',      icon: '🍑',  unit: 'cm' },
  { key: 'thigh',     label: 'Thigh',     icon: '🦵',  unit: 'cm' },
  { key: 'calf',      label: 'Calf',      icon: '🦶',  unit: 'cm' },
];

const DEFAULT_ENTRIES = [
  {
    id: 1, date: '2026-01-24',
    weight: 60.0, neck: 31.5, shoulder: 36.0, bust: 92.0, underbust: 76.0,
    upperArm: 29.0, waist: 69.0, belly: 72.0, upperHip: 89.0, hips: 92.0,
    thigh: 50.0, calf: 36.0, note: ''
  },
  {
    id: 2, date: '2026-01-17',
    weight: 60.6, neck: 31.8, shoulder: 36.2, bust: 92.5, underbust: 76.4,
    upperArm: 29.3, waist: 70.5, belly: 73.5, upperHip: 89.5, hips: 92.5,
    thigh: 50.5, calf: 36.3, note: ''
  },
  {
    id: 3, date: '2026-01-10',
    weight: 61.2, neck: 32.0, shoulder: 36.5, bust: 93.0, underbust: 77.0,
    upperArm: 29.8, waist: 71.5, belly: 74.5, upperHip: 90.0, hips: 93.0,
    thigh: 51.0, calf: 36.5, note: ''
  },
  {
    id: 4, date: '2026-01-03',
    weight: 61.6, neck: 32.2, shoulder: 36.8, bust: 93.5, underbust: 77.5,
    upperArm: 30.1, waist: 72.0, belly: 75.0, upperHip: 90.5, hips: 93.5,
    thigh: 51.5, calf: 36.8, note: 'Start of January'
  },
];

// ── App State ──────────────────────────────────────────────
const AppState = {
  entries: JSON.parse(localStorage.getItem('shaple_entries') || 'null') || DEFAULT_ENTRIES,
  currentScreen: 'home',

  save() {
    localStorage.setItem('shaple_entries', JSON.stringify(this.entries));
  },

  addEntry(entry) {
    entry.id = Date.now();
    this.entries.unshift(entry);
    this.save();
  },

  getLatest() {
    return this.entries[0] || null;
  },

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.entries, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'shaple-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};
