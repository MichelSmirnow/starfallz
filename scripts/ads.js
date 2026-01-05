/***********************************************************************************************************\
     ____  _             _____     _ _                 _       _                     
    / ___|| |_ __ _ _ __|  ___|_ _| | |____  _ __ ___ (_)_ __ (_)   __ _ _ __  _ __  
    \___ \| __/ _` | '__| |_ / _` | | |_  / | '_ ` _ \| | '_ \| |  / _` | '_ \| '_ \ 
     ___) | || (_| | |  |  _| (_| | | |/ /  | | | | | | | | | | | | (_| | |_) | |_) |
    |____/ \__\__,_|_|  |_|  \__,_|_|_/___| |_| |_| |_|_|_| |_|_|  \__,_| .__/| .__/ 
                                                                        |_|   |_|    
    Скрипт для мини-приложения телеграмм @starfallz_bot

\***********************************************************************************************************/
const MAX_FUEL = 7;
const MAX_CHARGE = 4;
const RECOVER_MINUTES = 25;
const RECOVER_MS = RECOVER_MINUTES * 60 * 1000;
const FULL_RECOVER_MS = RECOVER_MS * MAX_FUEL;
const MAX_DAILY = 2;

const balance_tokens = document.getElementById('tokens-count');  // Балланс токенов
const balance_stars = document.getElementById('released-count'); // Балланс выведенных звезд

const advertise_fuel = document.getElementById('advertise-fuel');
const advertise_charge = document.getElementById('advertise-charge');
const advertise_status = document.getElementById('status');
const advertise_lasttime = document.getElementById('advertise-lasttime');
const advertise_button = document.getElementById('button-ad');

const daily_button = document.getElementById('button-daily');

const STORAGE_KEY = 'ad_state';

// ✓ Функция загрузки пользовательских данных
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { stars: 0, tokens: 0, fuel: MAX_FUEL, charge: 0, lastUpdate: Date.now(), dailyEnabled: MAX_DAILY, recoverStart: null };
  try {
    const s = JSON.parse(raw);
    return {
      stars: Math.max(0, Math.floor(s.stars || 0)),  // Текущее количество выведенных звезд
      tokens: Math.max(0, Math.floor(s.tokens || 0)), // Текущее количество токенов
      fuel: Math.min(MAX_FUEL, Math.max(0, Math.floor(s.fuel || 0))),        // Текущее количество топлива
      charge: Math.min(MAX_CHARGE, Math.max(0, Math.floor(s.charge || 0))), // Текущее количество зарядов генератора
      lastUpdate: s.lastUpdate || Date.now(), // Время последнего обновления
      dailyEnabled: Math.min(MAX_DAILY, Math.max(0, Math.floor(s.dailyEnabled || 0))),
      recoverStart: s.recoverStart || null    // Время начала обновления, если количество зарядов меньше максимального
    };
  } catch {
    return { stars: 0, tokens: 0, fuel: MAX_FUEL, charge: 0, lastUpdate: Date.now(), dailyEnabled: MAX_DAILY, recoverStart: null };
  }
}

// ✓ Функция сохранения пользовательских данных
function saveState(state) { 
  state.lastUpdate = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); 
}

// ✓ Обработка нажатия кнопок просмотра рекламы
const RewarderAdButton = window.Adsgram.init({ blockId: "20435" }); // Для adsgram_ai
const InitAdButton = window.Adsgram.init({ blockId: "int-20487" }); // Для adsgram_ai
const InitAdDaily = window.Adsgram.init({ blockId: "int-20619" });  // Для adsgram_ai
advertise_button.addEventListener('click', () => {
  if (state.fuel <= 0) {
    showNotification('notif-question');
    return;
  } else if (state.charge >= MAX_CHARGE) {
    generatorStart(state); return;
  } else if (state.fuel > 0 && state.charge < MAX_CHARGE) {
    switch (state.fuel % 2) {
      case 1: InitAdButton.show()
      .then((result) => { giveReward(state); 
      }).catch((result) => { alert('Произошла ошибка во время просмотра рекламного видеоролика: ', result); }); 
      break;
      default: RewarderAdButton.show();
    } return;
  }
});
daily_button.addEventListener('click', () => {
  if (state.dailyEnabled >= 0) {
    switch (state.dailyEnabled % 2) {
      case 1: InitAdDaily.show().then((result) => {

      }).catch((result) => {alert('Произошла ошибка во время просмотра рекламного видеоролика: ', result);}); 
      break;
      default: InitAdDaily.show().then((result) => {
        
      }).catch((result) => {alert('Произошла ошибка во время просмотра рекламного видеоролика: ', result);});
    }
  }
});

// Функции награждения за просмотр рекламы (Только для type reward!)
RewarderAdButton.addEventListener('onReward', () => { giveReward(state); });
function giveReward(state) {
  state.fuel = Math.max(0, Math.floor(state.fuel || 0) - 1);
  state.charge = Math.min(MAX_CHARGE, Math.floor(state.charge || 0) + 1);
  showNotification('notif-success');
  alert('Рекламный видеоролик просмотрен успешно: ', result.description);
  if (state.charges < MAX_CHARGES && !state.recoverStart) { state.recoverStart = Date.now(); }
  saveState(state);
  updateUI(state);
}

// ✓ Функция запуска звездопада
function generatorStart(state) {
  state.charge = 0;
  state.tokens = Math.max(0, (Math.floor(state.tokens || 0) + 1));
  showNotification('notif-starfall');
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

  // Топливо и заряд генератора
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
    advertise_lasttime.textContent = `До новой топливной единицы: ${m}мин ${s}сек`;
  }

  // Режимы кнопки просмотра рекламы
  if ((state.fuel <= 0 || advertise_button.disabled === true) && state.charge < MAX_CHARGE) { 
    advertise_button.classList.add('button-disabled'); 
    advertise_button.textContent = `Нет топлива`;
  } else { 
    advertise_button.classList.remove('button-disabled');
    advertise_button.textContent = `Смотреть рекламу`; 
  }
  if (state.charge >= MAX_CHARGE) { 
    advertise_button.classList.add('starfall');
    advertise_button.textContent = `Начать звездопад`; 
  } else { 
    advertise_button.classList.remove('starfall'); 
    advertise_button.textContent = `Смотреть рекламу`;
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
      state.fuel = Math.min(MAX_FUEL, state.fuel + recovered);
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