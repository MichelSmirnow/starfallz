/***********************************************************************************************************\
     ____  _             _____     _ _                 _       _                     
    / ___|| |_ __ _ _ __|  ___|_ _| | |____  _ __ ___ (_)_ __ (_)   __ _ _ __  _ __  
    \___ \| __/ _` | '__| |_ / _` | | |_  / | '_ ` _ \| | '_ \| |  / _` | '_ \| '_ \ 
     ___) | || (_| | |  |  _| (_| | | |/ /  | | | | | | | | | | | | (_| | |_) | |_) |
    |____/ \__\__,_|_|  |_|  \__,_|_|_/___| |_| |_| |_|_|_| |_|_|  \__,_| .__/| .__/ 
                                                                        |_|   |_|    
    Скрипт для мини-приложения телеграмм @starfallz_bot
    MichelSmirnow, Михаил Смирнов - Россия, 2025г.
    https://github.com/MichelSmirnow

\***********************************************************************************************************/
// =========================================== Просмотр рекламы ========================================== \\

// Настройки заряда шкалы просмотра рекламы
const MAX_FUEL = 7;                               // Максимальное количество зарядов
const MAX_CHARGE = 4;                            // Количество рекламы, необходимой для запуска звездопада
const RECOVER_MINUTES = 25;                       // Время восстановления просмотра одной рекламы в минутах
const RECOVER_MS = RECOVER_MINUTES * 60 * 1000;   // Время восстановления просмотра одной рекламы в миллисекундах
const FULL_RECOVER_MS = RECOVER_MS * MAX_FUEL; // Полное время восстановления заряда в миллисекундах

// Элементы балланса
const balance_tokens = document.getElementById('tokens-count');  // Балланс токенов
const balance_stars = document.getElementById('released-count'); // Балланс выведенных звезд

// Связанные с рекламой элементы страницы
const advertise_fuel = document.getElementById('advertise-fuel');     // <p> с доступным к просмотру количеством рекламы
const advertise_charge = document.getElementById('advertise-charge'); // <p> с зарядом генератора
/*const advertise_status = document.getElementById('status');           // <p> для надписи под кнопкой просмотра рекламы*/
const advertise_lasttime = document.getElementById('advertise-lasttime'); // <p> с оставшимся временем заряда топливной единицы
const advertise_button = document.getElementById('button-ad');        // Кнопка просмотра рекламы
const advertise_watched = document.getElementById('ad-count');        // Общее количество просмотренной рекламы

const STORAGE_KEY = 'ad_state'; // Ключ локального хранилища данных

// ✓ Функция загрузки пользовательских данных
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { stars: 0, tokens: 0, fuel: MAX_FUEL, charge: 0, lastUpdate: Date.now(), recoverStart: null };
  try {
    const s = JSON.parse(raw);
    return {
      stars: Math.max(0, Math.floor(s.tokens || 0)),  // Текущее количество выведенных звезд
      tokens: Math.max(0, Math.floor(s.tokens || 0)), // Текущее количество токенов
      fuel: Math.min(MAX_FUEL, Math.max(0, Math.floor(s.fuel || 0))),        // Текущее количество топлива
      charge: Math.min(MAX_CHARGE, Math.max(0, Math.floor(s.charge || 0))), // Текущее количество зарядов генератора
      lastUpdate: s.lastUpdate || Date.now(), // Время последнего обновления
      recoverStart: s.recoverStart || null    // Время начала обновления, если количество зарядов меньше максимального
    };
  } catch {
    return { stars: 0, tokens: 0, fuel: MAX_FUEL, charge: 0, lastUpdate: Date.now(), recoverStart: null };
  }
}

// ✓ Функция сохранения пользовательских данных
function saveState(state) { 
  state.lastUpdate = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); 
}

// ✓ Обработка нажатия кнопки просмотра рекламы
const AdController = window.Adsgram.init({ blockId: "20435" }); // Для adsgram_ai
advertise_button.addEventListener('click', () => {
  if (state.fuel <= 0) { // Если не хватает топлива в генераторе
    showNotification('notif_notenoughfuel');
    alert('В данный момент просмотр рекламных видеороликов недоступен. Чтобы снять ограничение, требуется подождать восстановления');
    return;
  } else if (state.charge >= MAX_CHARGE) { // Если накоплена шкала генератора
    generatorStart();
    return;
  } else {
    /*advertise_button.disabled = true; // Блокируем кнопку, пока идет загрузка и показ*/
    AdController.show();
    /*advertise_button.disabled = false;*/
  }
});

AdController.addEventListener('onReward', () => {
    giveReward(state);
});

function giveReward(state) {
  state.fuel = Math.max(0, state.fuel - 1);
  state.charge = Math.min(MAX_CHARGE, state.charge + 1);
  showNotification('notif_success');
  alert('Рекламный видеоролик просмотрен успешно: ', result.description);
  if (state.charges < MAX_CHARGES && !state.recoverStart) { state.recoverStart = Date.now(); }
  saveState(state);
  updateUI(state);
}

// ✓ Функция запуска звездопада
function generatorStart(state) {
  state.tokens = Math.min(0, Math.floor(state.tokens || 0) + 1);
  saveState(state);
  updateUI(state);
}

// Обновление пользовательского интерфейса (данными из струкруры state)
function updateUI(state) {
  // Шкалы генератора
  const fuel_percentage = (state.fuel / MAX_FUEL) * 100;
  const charge_percentage = (state.charge / MAX_CHARGE) * 100;
  setBar(fuel_percentage, 'generator-bar-fuel');
  setBar(charge_percentage, 'generator-bar-charge');

  // Надписи с данными
  balance_tokens.textContent = `${state.tokens}`;
  balance_stars.textContent = `${state.stars}`;
  advertise_fuel.textContent = `${state.fuel} / ${MAX_FUEL}`;
  advertise_charge.textContent = `${state.charge} / ${MAX_CHARGE}`;
  /*advertise_status.textContent = `${state.charge} / ${MAX_CHARGE} просмотров доступно`;*/
  advertise_button.disabled = state.fuel === 0; // Блокировка кнопки при недостаточном уровне топлива

  // Время до заряда топливной единицы
  if (state.fuel >= MAX_FUEL) {
    advertise_lasttime.textContent = `Полный бак`;
  } else {
    const now = Date.now();
    const start = state.recoverStart || state.lastUpdate || now;
    const elapsed = now - start;
    const remainder = RECOVER_MS - (elapsed % RECOVER_MS);
    const totalSec = Math.floor(remainder / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    advertise_lasttime.textContent = `До заряда следующей единицы: ${m}мин ${s}сек`;
  }
}

// ✓ Функция для добавления топливных единиц (восстановление по 1 единице каждые 25 минут)
function applyRecovery(state) {
  if (state.fuel >= MAX_FUEL) {
    state.recoverStart = null;
    return state;
  } else {
    const now = Date.now();
    let start = state.recoverStart || state.lastUpdate || now;
    const elapsed = now - start;
    const recovered = Math.floor(elapsed / RECOVER_MS);
    if (recovered > 0) {
      state.fuel = Math.min(MAX_FUEL, state.charges + recovered);
      if (state.fuel >= MAX_FUEL) {
        state.recoverStart = null;
      } else {
        state.recoverStart = start + recovered * RECOVER_MS;
      }
      saveState(state);
    }
    return state;
  }
}

// ✓ Инициализация и периодическое обновление
let state = loadState();
state = applyRecovery(state);
updateUI(state);
window.addEventListener('beforeunload', () => saveState(state));

// Таймеры обновления пользовательского интерфейса 
let uiTimer = setInterval(() => {
  state = applyRecovery(state);
  updateUI(state);
}, 1000);
