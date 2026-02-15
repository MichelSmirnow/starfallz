

// ✓ Функция загрузки пользовательских данных
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { stars: 0, tokens: 0, fuel: MAX_FUEL, charge: 0, lastUpdate: Date.now(), dailyEnabled: MAX_DAILY, dailyDay: 0, recoverStart: null };
  try {
    const s = JSON.parse(raw);
    return {
      stars: Math.max(0, Math.floor(s.stars || 0)),  // Текущее количество выведенных звезд
      tokens: Math.max(0, Math.floor(s.tokens || 0)), // Текущее количество токенов
      fuel: Math.min(MAX_FUEL, Math.max(0, Math.floor(s.fuel || 0))),        // Текущее количество топлива
      charge: Math.min(MAX_CHARGE, Math.max(0, Math.floor(s.charge || 0))), // Текущее количество зарядов генератора
      lastUpdate: s.lastUpdate || Date.now(), // Время последнего обновления
      dailyEnabled: Math.min(MAX_DAILY, Math.max(0, Math.floor(s.dailyEnabled || 0))),
      dailyDay: Math.min(7, Math.max(0, Math.floor(s.dailyDay || 0))),
      dailyUpdTime: s.dailyUpdTime || Date.now(),
      recoverStart: s.recoverStart || null    // Время начала обновления, если количество зарядов меньше максимального
    };
  } catch {
    return { stars: 0, tokens: 0, fuel: MAX_FUEL, charge: 0, lastUpdate: Date.now(), dailyEnabled: MAX_DAILY, dailyDay: 0, recoverStart: null };
  }
}

// ✓ Функция сохранения пользовательских данных
function saveState(state) { 
  state.lastUpdate = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); 
}




// Загрузка локально сохраненных настроек
const SETTINGS_KEY = 'starfallz_settings';
const SETTINGS_DEFAULTS = {audio: true, music: true};
function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return {SETTINGS_DEFAULTS};
  try {
    const parsed = JSON.parse(raw) || {};
    return {
      audio: typeof parsed.audio === 'boolean' ? parsed.audio : SETTINGS_DEFAULTS.audio,
      music: typeof parsed.music === 'boolean' ? parsed.music : SETTINGS_DEFAULTS.music
    }
  } catch {return {SETTINGS_DEFAULTS};}
}