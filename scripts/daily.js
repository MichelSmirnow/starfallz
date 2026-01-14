/***********************************************************************************************************\
     ____  _             _____     _ _                 _       _                     
    / ___|| |_ __ _ _ __|  ___|_ _| | |____  _ __ ___ (_)_ __ (_)   __ _ _ __  _ __  
    \___ \| __/ _` | '__| |_ / _` | | |_  / | '_ ` _ \| | '_ \| |  / _` | '_ \| '_ \ 
     ___) | || (_| | |  |  _| (_| | | |/ /  | | | | | | | | | | | | (_| | |_) | |_) |
    |____/ \__\__,_|_|  |_|  \__,_|_|_/___| |_| |_| |_|_|_| |_|_|  \__,_| .__/| .__/ 
                                                                        |_|   |_|    
    Скрипт для мини-приложения телеграмм @starfallz_bot

\***********************************************************************************************************/
const daily_button = document.getElementById('button-daily');
const daily_enabled = document.getElementById('daily-enabled');

// ✓ обработка нажатия на кнопку
daily_button.addEventListener('click', () => {
  if (state.dailyEnabled > 0 && state.dailyEnabled <= 2) {
    switch (state.dailyEnabled % 2) {
      case 1: InitAdDaily.show().then((result) => {giveDailyReward(state);}).catch((result) => {alert('Произошла ошибка во время просмотра рекламного видеоролика: ', result);}); 
        break;
      default: InitAdDaily.show().then((result) => {giveDailyReward(state);}).catch((result) => {alert('Произошла ошибка во время просмотра рекламного видеоролика: ', result);});
    }
  } else {
    
  }
});

// ✓ Обработка нажатия на кнопку с карточки
function fetchDaily(button_number) {
  if (button_number < state.dailyDay) {
    showNotification('notif-dailyalready');
  } if (button_number === state.dailyDay && state.dailyEnabled <= 0) {
    if (state.dailyDay >= 7 && state.dailyEnabled <= 0) { state.dailyDay = 0; } else {
      state.dailyDay = Math.min(7, Math.floor(state.dailyDay || 0) + 1);
    } showNotification('notif-dailysuccess');
    saveState(state); 
    updateUI(state);
    return;
  } if (button_number > state.dailyDay) {
    showNotification('notif-dailydecline');
  } saveState(state); updateUI(state);
}

// ✓ Обновление стилей карточек
function updateDaily(state) {
  daily_enabled.textContent = `${state.dailyEnabled}`;
  for (let i = 1; i <= 7; i++) {
    const updateDaily_card = `daily-day-${i}`;
    const updateDaily_button = `daily-button-${i}`;
    const updateDaily_container = document.getElementById(updateDaily_card);
    if (i < state.dailyDays) {
      changeDaily(updateDaily_card, updateDaily_button, 'done');

    } if ((i > state.dailyDays) || (state.dailyDays <= 0)) {
      changeDaily(updateDaily_card, updateDaily_button, 'closed');

    } if (i === state.dailyDays) {
      if (!updateDaily_container.classList.contains('activated')) {
        changeDaily(updateDaily_card, updateDaily_button, 'ready');
      } else { changeDaily(updateDaily_card, updateDaily_button, 'done'); }
    }
  }
}

// ✓ Изменение стиля кнопки на карточке и самой карточки
function changeDaily(card_id, button_id, card_mode) {
    const daily_card = document.getElementById(card_id);
    const daily_button = document.getElementById(button_id);
    daily_card.classList.remove('disabled');
    daily_button.classList.remove('disabled');
    daily_card.classList.remove('activated');
    daily_button.classList.remove('activated');
    if (card_mode === 'ready') {
      daily_button.textContent = `Открыть`;
      daily_card.classList.add('activated');
      daily_button.classList.add('activated');
    } else if (card_mode === 'done') {
      daily_button.textContent = `Забрано`;
      daily_card.classList.add('disabled');
      daily_button.classList.add('disabled');
    } else {
      daily_button.textContent = `Закрыто`;
    }
}
const daily_button_1 = document.getElementById('daily-button-1');
const daily_button_2 = document.getElementById('daily-button-2');
const daily_button_3 = document.getElementById('daily-button-3');
const daily_button_4 = document.getElementById('daily-button-4');
const daily_button_5 = document.getElementById('daily-button-5');
const daily_button_6 = document.getElementById('daily-button-6');
const daily_button_7 = document.getElementById('daily-button-7');
daily_button_1.addEventListener('click', () => {fetchDaily(1)});
daily_button_2.addEventListener('click', () => {fetchDaily(2)});
daily_button_3.addEventListener('click', () => {fetchDaily(3)});
daily_button_4.addEventListener('click', () => {fetchDaily(4)});
daily_button_5.addEventListener('click', () => {fetchDaily(5)});
daily_button_6.addEventListener('click', () => {fetchDaily(6)});
daily_button_7.addEventListener('click', () => {fetchDaily(7)});

// Награда за просмотр ежедневной рекламы
function giveDailyReward(state) {
  state.dailyEnabled = Math.min(MAX_DAILY, Math.floor(state.dailyEnabled || 0) - 1);
  if (state.dailyEnabled <= 0) {
    state.dailyDay = Math.max(0, Math.floor(state.dailyDay || 0) + 1);
  } showNotification('notif-success');
  alert('Рекламный видеоролик просмотрен успешно: ', result.description);
  saveState(state);
  updateUI(state);
}

/*
function shouldResetDailyDays(lastSeenAt, effectiveUpdateTime, nextUpdateTime) {
  if (!lastSeenAt) return true;
  const last = (typeof lastSeenAt === 'number') ? new Date(lastSeenAt) : new Date(lastSeenAt);
  if (isNaN(last)) return true;
  return !(last > effectiveUpdateTime && last <= nextUpdateTime);
}

function applyDailyUpdate(state, now = new Date()) {
  const updTime = (typeof state.dailyUpdTime === 'string') ? state.dailyUpdTime : '00:00';
  const [updHourStr, updMinStr] = updTime.split(':');
  const updHour = parseInt(updHourStr || '0', 10);
  const updMin = parseInt(updMinStr || '0', 10);

  const scheduled = new Date(now);
  scheduled.setHours(updHour, updMin, 0, 0);

  let effectiveUpdateTime = scheduled;
  if (now < scheduled) {
    effectiveUpdateTime = new Date(scheduled);
    effectiveUpdateTime.setDate(scheduled.getDate() - 1);
  }

  const nextUpdateTime = new Date(effectiveUpdateTime);
  nextUpdateTime.setDate(effectiveUpdateTime.getDate() + 1);

  const newState = Object.assign({}, state);
  state.dailyEnabled = 2;

  if (shouldResetDailyDays(state.lastSeenAt, effectiveUpdateTime, nextUpdateTime)) { state.dailyDays = 0; }
  saveState(newState);
  return newState;
}*/
