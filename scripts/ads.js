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
const MAX_CHARGE = 5;
const RECOVER_MINUTES = 25;
const RECOVER_MS = RECOVER_MINUTES * 60 * 1000;
const FULL_RECOVER_MS = RECOVER_MS * MAX_FUEL;
const MAX_DAILY = 2;

const advertise_fuel = document.getElementById('advertise-fuel');
const advertise_charge = document.getElementById('advertise-charge');
const advertise_status = document.getElementById('status');
const advertise_lasttime = document.getElementById('advertise-lasttime');

const InitAdButton = window.Adsgram.init({ blockId: "int-20487" }); // Для adsgram_ai
const InitAdDaily = window.Adsgram.init({ blockId: "int-20619" });  // Для adsgram_ai


// ✓ Обработка нажатия кнопок просмотра рекламы
const advertise_button = document.getElementById('scenery-button-ad');
const ad_main_int = window.Adsgram.init({ blockId: "int-35719" });
advertise_button.addEventListener('click', () => {
  if (state.fuel <= 0) {                                    // Если не хватает топлива, блокируем показ
    showNotification('notif-question');
    return;
  } else if (state.charge >= MAX_CHARGE) {                  // Если набрана шкала генератора, запускаем генератор
    generatorStart(state); return;
  } else if (state.fuel > 0 && state.charge < MAX_CHARGE) { // Если топлива хватает и шкала генератора не собрана, показываем рекламный ролик
    ad_main_int.show();
    /*
    switch (state.fuel % 2) {
      case 1: InitAdButton.show().then((result) => { 
        giveReward(state); 
      }).catch((result) => { 
        alert('Произошла ошибка во время просмотра рекламного видеоролика: ', result); 
      }); break;
      default: RewarderAdButton.show();
    } return;
    */
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

// Общие таймеры
let uiTimer = setInterval(() => {
  state = applyRecovery(state);
  updateUI(state);
}, 1000);

let saveTimer = setInterval(() => {
  saveState(state);
}, 10000);