// ---------------------------------------------------------------------------
// Local history and settings, stored ONLY in this browser's localStorage.
// Nothing is uploaded, synced or encrypted. Clearing browser data removes it.
//
// By default we store a SUMMARY of each analysis (date, category, assessment,
// tactic names). The full message text and evidence phrases are stored only
// if the user turns on "Save full message text" in Privacy & Method.
// ---------------------------------------------------------------------------

export const HISTORY_KEY = 'scamshield.history.v1';
export const SETTINGS_KEY = 'scamshield.settings.v1';
export const MAX_RECORDS = 50;

export const DEFAULT_SETTINGS = {
  saveHistory: true,
  saveFullText: false,
};

function safeRead(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings() {
  const stored = safeRead(SETTINGS_KEY, {});
  const s = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  return {
    saveHistory: typeof s.saveHistory === 'boolean' ? s.saveHistory : DEFAULT_SETTINGS.saveHistory,
    saveFullText: typeof s.saveFullText === 'boolean' ? s.saveFullText : DEFAULT_SETTINGS.saveFullText,
  };
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function saveSettings(settings) {
  // Default settings are not written, so "Delete all data" leaves storage truly empty.
  const isDefault = Object.keys(DEFAULT_SETTINGS).every((k) => settings[k] === DEFAULT_SETTINGS[k]);
  return isDefault ? safeRemove(SETTINGS_KEY) : safeWrite(SETTINGS_KEY, settings);
}

const BAND_KEYS = ['low', 'medium', 'high'];
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

/**
 * localStorage can be edited by anyone with access to the browser (or by a
 * browser extension). Rebuild every record from a fixed list of fields with
 * type and length limits, and drop anything that does not look like a record.
 */
export function sanitizeRecord(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const bandKey = BAND_KEYS.includes(raw.bandKey) ? raw.bandKey : null;
  const date = typeof raw.date === 'string' && !Number.isNaN(Date.parse(raw.date)) ? raw.date : null;
  if (!bandKey || !date || typeof raw.id !== 'string') return null;
  const record = {
    id: str(raw.id, 60),
    date,
    categoryKey: str(raw.categoryKey, 60),
    category: str(raw.category, 120),
    bandKey,
    band: str(raw.band, 120),
    matchedChecks: Number.isFinite(raw.matchedChecks) ? Math.max(0, Math.min(1000, Math.trunc(raw.matchedChecks))) : 0,
    tactics: Array.isArray(raw.tactics) ? raw.tactics.slice(0, 20).map((t) => str(t, 80)).filter(Boolean) : [],
    source: str(raw.source, 30) || null,
    language: str(raw.language, 40) || null,
    rulesVersion: str(raw.rulesVersion, 20) || null,
    hasText: false,
  };
  if (raw.hasText === true && typeof raw.text === 'string') {
    record.hasText = true;
    record.text = raw.text.slice(0, 5000);
    record.phrases = Array.isArray(raw.phrases)
      ? raw.phrases.slice(0, 50).map((p) => ({ quote: str(p && p.quote, 500), tactic: str(p && p.tactic, 80) }))
      : [];
  }
  return record;
}

export function loadHistory() {
  const stored = safeRead(HISTORY_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.slice(0, MAX_RECORDS).map(sanitizeRecord).filter(Boolean);
}

export function saveHistory(records) {
  if (!records.length) return safeRemove(HISTORY_KEY);
  return safeWrite(HISTORY_KEY, records.slice(0, MAX_RECORDS));
}

/** Turn an analysis result into a history record. */
export function toRecord(result, settings) {
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: result.analyzedAt,
    categoryKey: result.category.key,
    category: result.category.label,
    bandKey: result.band.key,
    band: result.band.label,
    matchedChecks: result.matchedChecks,
    tactics: [...new Set(result.signals.map((s) => s.tacticLabel))],
    source: result.source,
    language: result.language.label,
    rulesVersion: result.rulesVersion,
    hasText: false,
  };
  if (settings.saveFullText) {
    record.hasText = true;
    record.text = result.text;
    record.phrases = result.signals.map((s) => ({ quote: s.quote, tactic: s.tacticLabel }));
  }
  return record;
}

export function clearAllScamShieldData() {
  const a = safeRemove(HISTORY_KEY);
  const b = safeRemove(SETTINGS_KEY);
  return a && b;
}
