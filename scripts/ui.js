const DEBUG = true;
const ADMIN = true;
// ======================================== База данных и настройки ======================================== \\

// ✓ Консанты для генератора звездопада
const MAX_FUEL = 7;
const MAX_CHARGE = 5;
const RECOVER_MINUTES = 25;
const RECOVER_MS = RECOVER_MINUTES * 60 * 1000;
const FULL_RECOVER_MS = RECOVER_MS * MAX_FUEL;
const MAX_DAILY = 2;

// ✓ Функция загрузки пользовательских данных (реализовано на локальном уровне)
const STATE_KEY = "starfall";
const STATE_DEFAULTS = { 
  stars: 0, tokens: 0, fuel: MAX_FUEL, charge: 0, 
  dailyEnabled: MAX_DAILY, dailyClaimed: 0, dailyDay: 0, recoverStart: Date.now(), dailyNextMidnight: Infinity,
  level: { Adsgram: 10, TADS: 10, },
};
function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return STATE_DEFAULTS;
  try {
    const s = JSON.parse(raw);
    return {
      stars: Math.max(0, Math.floor(s.stars || 0)),   // Текущее количество выведенных звезд
      tokens: Math.max(0, Math.floor(s.tokens || 0)), // Текущее количество токенов
      fuel: Math.min(MAX_FUEL, Math.max(0, Math.floor(s.fuel || 0))),       // Текущее количество топлива
      charge: Math.min(MAX_CHARGE, Math.max(0, Math.floor(s.charge || 0))), // Текущее количество зарядов генератора
      
      dailyEnabled: Math.min(MAX_DAILY, Math.max(0, Math.floor(s.dailyEnabled || 0))), // Текущее количество доступных к просмотру реклам ежедневника
      dailyClaimed: Math.min(7, Math.max(0, Math.floor(s.dailyClaimed || 0))),         // Текущее количество забранных ежедневных наград
      dailyDay: Math.min(7, Math.max(0, Math.floor(s.dailyDay || 0))),                 // Текущий день в ежедневной серии
      recoverStart: Math.max(0, Math.max(0, Math.floor(s.recoverStart || 0))),         // Время начала обновления, если количество зарядов меньше максимального
      dailyNextMidnight: Math.min(s.dailyNextMidnight, Infinity),                      // Время ближайшей полуночи обновления ежедневника
    
      level: (s.level === undefined || typeof s.level !== 'object') ? STATE_DEFAULTS.level : s.level,  // Словарь успешно просмотренных рекламных видеороликов от каждой рекламной компании
    };
  } catch { return STATE_DEFAULTS; }
}

// ✓ Функция сохранения пользовательских данных (реализовано на локальном уровне)
function saveState(state) { 
  localStorage.setItem(STATE_KEY, JSON.stringify(state)); 
}

// Загрузка локально сохраненных настроек (так и останется на локальном уровне)
const SETTINGS_KEY = 'starfall_settings';
const SETTINGS_DEFAULTS = { 
  audio: true, music: true 
};
function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return SETTINGS_DEFAULTS;
  try {
    const parsed = JSON.parse(raw) || {};
    return {
      audio: typeof parsed.audio === 'boolean' ? parsed.audio : SETTINGS_DEFAULTS.audio,
      music: typeof parsed.music === 'boolean' ? parsed.music : SETTINGS_DEFAULTS.music
    }
  } catch { return SETTINGS_DEFAULTS; }
}

// ✓ Функция сохранения пользовательских настроек (Работает исключительно на локальном уровне)
function saveSettings(setting) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(setting)); 
}

// Функция сброса настроек до стандартных
function resetSettings() { 
  setting = SETTINGS_DEFAULTS;
  saveSettings(setting);
  updateUI(state);
}

// ======================================== Функции показа рандомизированной рекламы ======================================== \\

// ✓ Функция выбора случайного числа из промежутка [Nstart, Nend]
function randomInt(Nstart, Nend) {
  const start = Math.ceil(Nstart);
  const end = Math.floor(Nend);
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

// ✓ Функция возврата ошибки просмотра рекламного видеоролика
function returnError(returnKey) {
  Object.keys(state.level).forEach(k => { if (k != returnKey) { state.level[k] = Math.max(0, Math.floor(state.level[k] || 0) + 1)}; });
  state.level[returnKey] = Math.max(0, Math.floor(state.level[returnKey] || 0) - 1);
  return { error: true, reward: false, declined: false };
}

// ✓ Функция возврата успешного просмотра рекламного видеоролика
function returnReward(returnKey) {
  state.level[returnKey] = Math.max(0, Math.floor(state.level[returnKey] || 0) + 1);
  return { error: false, reward: true, declined: false };
}

// ✓ Функция возврата пользовательского отказа от просмотра рекламного видеоролика
function returnDecline() {
  return { error: false, reward: false, declined: true};
}

// ✓ Функция возврата отсутствия доступных к просмотру реклам
function returnNoAds() {
  return { error: true, reward: false, declined: true};
}

// ✓ Принудительная инициализация рекламных блоков при загрузке страницы
const advertise_button = document.getElementById('scenery-button-ad');
const daily_button = document.getElementById('daily-button-ad');
document.addEventListener("DOMContentLoaded", function () {
  let tadsReady = false;
  function waitForTadsReady(timeout = 5000) { // ✓ Ожидание загрузки модуля рекламы TADS
    return new Promise((resolve, reject) => {
      if (window.tads && typeof window.tads.init === "function") { return resolve(); }
      const start = performance.now();
      const iv = setInterval(() => {
        if (window.tads && typeof window.tads.init === "function") {
          clearInterval(iv);
          resolve();
        } else if (performance.now() - start > timeout) {
          clearInterval(iv);
          reject(new Error("TADS widget script not loaded"));
        }
      }, 50);
    });
  }

  // ✓ Функция рандомизированного показа рекламы
  async function showAdvertise() {
    return new Promise(async (resolve) => {
      // ✓ Дополнительные методы завершения промиса
      const onShowRewardCallback = (result) => { resolve(returnReward(result)); };
      const onAdsNotFound = () => { resolve(returnNoAds()); };

      // ✓ Инициализация рекламных блоков (Настраивается в соответствии с данными личного кабинета поставщика рекламы)
      const adCompanies = ["Adsgram", "TADS"];
      const adBlock = {
        Adsgram1: window.Adsgram.init({ blockId: "int-36550" }),
        Adsgram2: window.Adsgram.init({ blockId: "int-36551" }),
        TADS1: "10255",
        TADS2: "10260",

        // Adsgram1: window.Adsgram.init({ blockId: "int-36327" }),
        // Adsgram2: window.Adsgram.init({ blockId: "int-36328" }),
        // Adsgram3: window.Adsgram.init({ blockId: "36333" }),
        // Adsgram4: window.Adsgram.init({ blockId: "int-36329" }),
        // Adsgram5: window.Adsgram.init({ blockId: "int-36334" }),
      };

      // ✓ Рандомизатор показа рекламы
      async function showAdvertiseHelper() {
        const levelSum = Object.values(state.level).reduce((acc, v) => acc + v, 0);
        const statement = Object.assign({}, state.level);
        for (let i = 0; i <= adCompanies.length; i++) { statement[adCompanies[i]] = Math.ceil((state.level[adCompanies[i]] / levelSum) * 100); }
        delete statement.undefined;
        const statementSum = Object.values(statement).reduce((acc, v) => acc + v, 0);
        const randomAd = randomInt(1, statementSum);
        let conditionCounter = 0;
        for (let i = 0; i < adCompanies.length; i++) {
          const key = adCompanies[i]; 
          const condition = (conditionCounter < randomAd && randomAd <= (conditionCounter + statement[key]));
          conditionCounter += statement[key];
          if (!condition) continue;
          const variationsCount = Object.keys(adBlock).filter(k => k.startsWith(key)).length;
          const randomBlock = randomInt(1, variationsCount);
          const companyRandom = adBlock[`${key}${randomBlock}`];

          if (key === "Adsgram") { // ✓ Особенности показа рекламы adsgram
            try {
              await companyRandom.show(); } catch(result) { 
              if (result.error == true) { resolve(returnError(key)); return; }
              if (result.done == true) { resolve(returnReward(key)); return; }
            } resolve(returnReward(key)); return;
            
          } else if (key === "TADS") { // ✓ Особенности показа рекламы TADS
            try {
              if (!tadsReady) { await waitForTadsReady(); tadsReady = true; }
              const adController = window.tads.controllers?.[WIDGET_ID] || window.tads.init({
                widgetId: companyRandom, type: "fullscreen", debug: DEBUG,
                onShowReward: onShowRewardCallback,
                onAdsNotFound: onAdsNotFound,
              });
              if (!adController) { resolve(returnError(key)); return; }
              if (adController && typeof adController.showAd === "function") {
                adController.showAd().catch(() => { resolve(returnError(key)); return; });
              } else { resolve(returnError(key)); return; }
            } catch (err) { resolve(returnError(key)); return; }
          }
        } return { error: true, reward: false, declined: false };
      }

      await showAdvertiseHelper(); // Показ рекламы и resolve по результатам работы функции
    });
  }

  // ✓ Обработка нажатия кнопок просмотра рекламы
  advertise_button.addEventListener('click', async() => {
    if (state.charge >= MAX_CHARGE) {  // Если набрана шкала генератора, запускаем генератор
      generatorStart(); showNotification('starfall'); return;
    } else if (state.fuel <= 0) {      // Если не хватает топлива, блокируем показ
      showNotification('nofuel'); return;
    } else if (state.fuel > 0 && state.charge < MAX_CHARGE) { // Если топлива хватает и шкала генератора не собрана, показываем рекламный ролик
      editBanner(true);
      const resultAd = await showAdvertise();
      editBanner(false);
      if (resultAd.declined === true && resultAd.error === false) { // Если просмотр рекламы был отклонен
        showNotification('declined'); return; 
      } else if (resultAd.error === true && resultAd.declined === false) { // Если во время загрузки рекламы произошла ошибка
        showNotification('question'); return; 
      } else if (resultAd.error === true && resultAd.declined === true) {
        showNotification('noads'); return; 
      } else if (resultAd.reward === true) { // Успешный просмотр рекламы
        giveReward(); showNotification('success'); return; 
      } else { showNotification('question'); return; }
    } else { showNotification('question'); return; } 
  });

  // ✓ Обработка нажатия на кнопку ежедневной рекламы
  daily_button.addEventListener('click', async() => {
    if (state.dailyEnabled <= 0) { // Если ежедневная выделенная реклама закончилась
      showNotification('dailyno'); return;
    } else if (state.dailyEnabled > 0 && state.dailyEnabled <= 2) { // Если есть доступные ежедневные рекламы, показываем их
      editBanner(true);
      const resultAd = await showAdvertise();
      editBanner(false);
      if (resultAd.declined === true && resultAd.error === false) { // Если просмотр рекламы был отклонен
        showNotification('declined'); return; 
      } else if (resultAd.error === true && resultAd.declined === false) { // Если во время загрузки рекламы произошла ошибка
        showNotification('question'); return; 
      } else if (resultAd.error === true && resultAd.declined === true) {
        showNotification('noads'); return; 
      } else if (resultAd.reward === true) { // Успешный просмотр рекламы
        giveDailyReward(); showNotification('success'); return; 
      } else { showNotification('question'); return; }
    } else { showNotification('question'); return; }
  });
}, { once: true });

// ======================================== ✓ Реклама на главной странице ======================================== \\

// ✓ Функция награждения за просмотр рекламы
function giveReward() {
  state.fuel = Math.max(0, Math.floor(state.fuel || 0) - 1);
  if (ADMIN) state.fuel = 7;
  state.charge = Math.min(MAX_CHARGE, Math.floor(state.charge || 0) + 1);
  if (state.recoverStart <= 0 || state.recoverStart == null) { state.recoverStart = Date.now(); }
  saveState(state);
  updateUI(state);
}

// ✓ Функция запуска звездопада
function generatorStart() {
  state.charge = 0;
  state.tokens = Math.max(0, (Math.floor(state.tokens || 0) + 1));
  saveState(state);
  updateUI(state);
}

// ✓ Функция для добавления топливных единиц (восстановление по 1 единице каждые 25 минут)
function applyRecovery() {
  if (state.fuel >= MAX_FUEL) {
    state.recoverStart = 0;
    return state;
  } else {
    const now = Date.now();
    let start = state.recoverStart;
    const elapsed = now - start;
    const recovered = Math.floor(elapsed / RECOVER_MS);
    if (recovered > 0) {
      state.fuel = Math.min(MAX_FUEL, state.fuel + recovered);
      if (state.fuel >= MAX_FUEL) {
        state.recoverStart = null;
      } else {
        state.recoverStart = start + recovered * RECOVER_MS;
      }
    }
  }
}

// ======================================== ✓ Ежедневник ======================================== \\

// ✓ Награда за просмотр ежедневной рекламы
function giveDailyReward() {
  state.dailyEnabled = Math.min(MAX_DAILY, Math.floor(state.dailyEnabled || 0) - 1);
  if (state.dailyEnabled <= 0) { state.dailyDay = Math.max(0, Math.floor(state.dailyDay || 0) + 1); } 
  saveState(state);
  updateUI(state);
}

// ✓ Обработка нажатия на кнопку с карточки
function fetchDaily(button_number) {
  if (button_number === state.dailyClaimed || button_number < state.dailyDay) {
    showNotification('dailyalready');
  } if (button_number === state.dailyDay && state.dailyEnabled <= 0 && button_number != state.dailyClaimed) {
    // ✓ Обновляем счетчик до полуночи
    state.dailyClaimed = Math.max(0, Math.floor(state.dailyClaimed || 0) + 1);
    const now = Date.now();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    state.dailyNextMidnight = nextMidnight.getTime();

    // ✓ Проверка текущего дня серии
    if (state.dailyDay >= 7) { 
      state.dailyClaimed = 0; state.dailyDay = 0;
      state.tokens = Math.max(0, (Math.floor(state.tokens || 0) + 5));
      showNotification('dailygift');
    } else { 
      showNotification('dailysuccess'); 
    } 
  } if (button_number > state.dailyDay) {
    showNotification('dailydecline');
  }
}

// ✓ Автоматическое восстановление ежедневной доступной рекламы
function applyDailyRecovery() {
  const now = Date.now();
  // Если прошла полночь, обновляем лимит
  if (state.dailyNextMidnight < now) {
    state.dailyEnabled = MAX_DAILY;
    // Если награда не была забрана до последней полуночи, то серия нарушена
    const elapsed = ((now - state.dailyNextMidnight) / (24*60*60*1000));
    if (elapsed > 1) {
      state.dailyDay = 0;
      state.dailyClaimed = 0;
    }
    state.dailyNextMidnight = Infinity;
  }
}

// ✓ Обновление стилей карточек
const daily_enabled = document.getElementById('daily-enabled');
function updateDaily() {
  daily_enabled.textContent = `${state.dailyEnabled}`;
  for (let i = 1; i <= 7; i++) {
    const updateDaily_card = `daily-day-${i}`;
    const updateDaily_button = `daily-button-${i}`;
    const updateDaily_container = document.getElementById(updateDaily_card);
    if (i <= state.dailyClaimed) {
      changeDaily(updateDaily_card, updateDaily_button, 'done');
    } else if ((i > state.dailyDay) || (state.dailyDays <= 0)) {
      changeDaily(updateDaily_card, updateDaily_button, 'closed');
    } else if (i === state.dailyDay) {
      changeDaily(updateDaily_card, updateDaily_button, 'ready');
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
    } else if (card_mode === 'closed') {
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
daily_button_1.addEventListener('click', () => { fetchDaily(1); });
daily_button_2.addEventListener('click', () => { fetchDaily(2); });
daily_button_3.addEventListener('click', () => { fetchDaily(3); });
daily_button_4.addEventListener('click', () => { fetchDaily(4); });
daily_button_5.addEventListener('click', () => { fetchDaily(5); });
daily_button_6.addEventListener('click', () => { fetchDaily(6); });
daily_button_7.addEventListener('click', () => { fetchDaily(7); });


// ======================================== Профиль ======================================== \\

// Боковая страница профиля
const profile_info_avatar = document.getElementById('profile-info-avatar');
const profile_info_name = document.getElementById('profile-info-name');
const profile_info_id = document.getElementById('profile-info-id');
const profile_info_date = document.getElementById('profile-info-date');
const profile_stats_tokens = document.getElementById('profile-stats-tokens');
const profile_stats_stars = document.getElementById('profile-stats-stars');
const profile_stats_gifts = document.getElementById('profile-stats-gifts');
const profile_stats_serials = document.getElementById('profile-stats-serials');
const profile_stats_maxserial = document.getElementById('profile-stats-maxserial');
const profile_stats_events = document.getElementById('profile-stats-events');
const profile_stats_days = document.getElementById('profile-stats-days');
const profile_achiv_container = document.getElementById('profile-achiv-container');

// ======================================== Побочные окна приложения ======================================== \\
/*
// Главные элементы структуры приложения
const perfomance_site = document.getElementById('site');
const perfomance_toosmall = document.getElementById('toosmall');
const perfomance_main = document.getElementById('main');
const perfomance_load = document.getElementById('load');

// Отчет о запуске приложения вне или в телеграмме 
const tg = window.Telegram && window.Telegram.WebApp;
if (tg) { 
    //perfomance_site.style.display = `none`;
    perfomance_main.style.display = `block`;
    console.log('Запущено в Telegram Web App, запускаем мини-приложение...');
    tg.ready();
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (user) {
        console.log('ID пользователя:', user.id);
        console.log('Имя пользователя:', user.first_name);
        console.log('Username:', user.username);
        const themeParams = Telegram.WebApp.themeParams;
        console.log('Цвет фона:', themeParams.bg_color);
        console.log('Необработанные данные инициализации:', Telegram.WebApp.initData);
    }
} else {
    /*perfomance_site.style.display = `none`;
    perfomance_main.style.display = `none`;
    perfomance_small.style.display = `none`*//*
    console.log('Запущено вне Telegram Web App, запускаем сайт для ознакомления с приложением...');
}
*/

// ======================================== ✓ Параллакс и позиционирование ======================================== \\

// Верхний пользовательский интерфейс
const top_ui_star = document.getElementById('top-ui-star');
const top_ui_stars = document.getElementById('top-ui-stars');
const top_ui_token = document.getElementById('top-ui-token');
const top_ui_tokens = document.getElementById('top-ui-tokens');

// ✓ Функция рассчета параллакса (отклик на прокрутку)
const scroll_parallax_stars = document.getElementById('scenery-stars-parallax');
const scroll_postlayer_stars = document.getElementById('scenery-stars-postlayer');
const scroll_parallax_home = document.getElementById('scenery-home-parallax');
const scroll_postlayer_home = document.getElementById('scenery-home-postlayer');
window.addEventListener('scroll', function() {
  const scrollPosition = window.scrollY;
    
  // ✓ Рассчитываем новые значения положения элементов параллакса
  const newPosition_parallax_stars = scrollPosition * (-0.2);
  const newPosition_postlayer_stars = (scrollPosition * 0.5);
  const newPosition_parallax_home = Math.floor(this.window.innerHeight / 4.5) + scrollPosition * (-0.2);
  const newPosition_postlayer_home =  - Math.floor(this.window.innerHeight / 2) + scrollPosition * 0.5;

  // ✓ Применение значений новых положений
  scroll_parallax_stars.style.bottom = `${newPosition_parallax_stars}px`;
  scroll_postlayer_stars.style.padding = `${newPosition_postlayer_stars}px 0 0 0`;
  scroll_postlayer_stars.style.margin = `0 0 -${newPosition_postlayer_stars * 1.3}px 0`;
  scroll_parallax_home.style.bottom = `${newPosition_parallax_home}px`;
  scroll_postlayer_home.style.padding = `${newPosition_postlayer_home}px 0 0 0`;
  scroll_postlayer_home.style.margin = `0 0 -${newPosition_postlayer_home * 1.3}px 0`;
});

// ✓ Функции обработки нажатий на нижний пользовательский интерфейс
const bottom_ui_star = document.getElementById('bottom-ui-star');
const bottom_ui_home = document.getElementById('bottom-ui-home');
const bottom_ui_income = document.getElementById('bottom-ui-income');
const bottom_ui_daily = document.getElementById('bottom-ui-daily');
const bottom_ui_user = document.getElementById('bottom-ui-user');
const scenery_home = document.getElementById('scenery-home');
const scenery_income = document.getElementById('scenery-income');
const profile = document.getElementById('profile');
const daily = document.getElementById('daily');
const background = document.getElementById('background');
const scenery = document.getElementById('scenery');
bottom_ui_star.addEventListener('click', function() { returnOnPage(); window.scroll({ top: 0, behavior: 'smooth' }); });
bottom_ui_home.addEventListener('click', function() { returnOnPage(); scenery_home.scrollIntoView({ behavior: 'smooth', block: 'end' }); });
bottom_ui_income.addEventListener('click', function() { returnOnPage(); scenery_income.scrollIntoView({ behavior: 'smooth', block: 'end' }); });
bottom_ui_daily.addEventListener('click', function() {
  profile.classList.remove('panel_bottom_shown');
  daily.classList.add('panel_bottom_shown');
  background.classList.add('page_moved');
  scenery.classList.add('page_moved');
});
bottom_ui_user.addEventListener('click', function() {
  daily.classList.remove('panel_bottom_shown');
  profile.classList.add('panel_bottom_shown');
  background.classList.add('page_moved');
  scenery.classList.add('page_moved');
});
function returnOnPage() {
    if (daily.classList.contains('panel_bottom_shown')) daily.classList.remove('panel_bottom_shown');
    if (profile.classList.contains('panel_bottom_shown')) profile.classList.remove('panel_bottom_shown');
    if (background.classList.contains('page_moved') || scenery.classList.contains('page_moved')) {
        background.classList.remove('page_moved');
        scenery.classList.remove('page_moved');
    }
}

// ✓ Функции обработки нажатий на кнопки открытия и закрытия окон scenery
const scenery_stars_button = document.getElementById('scenery-stars-button');
const scenery_stars_container = document.getElementById('scenery-stars-container');
const scenery_stars_container_close = document.getElementById('scenery-stars-container-close');
scenery_stars_button.addEventListener('click', () => {
    if (scenery_stars_container.classList.contains('visible')) {
        scenery_stars_container.classList.add('hidden');
        scenery_stars_container.classList.remove('visible');
    } else {
        scenery_stars_container.classList.remove('hidden');
        scenery_stars_container.classList.add('visible');
    }
});
scenery_stars_container_close.addEventListener('click', () => {
    scenery_stars_container.classList.add('hidden');
    scenery_stars_container.classList.remove('visible');
});
const scenery_home_button = document.getElementById('scenery-home-button');
const scenery_home_container = document.getElementById('scenery-home-container');
const scenery_home_container_close = document.getElementById('scenery-home-container-close');
scenery_home_button.addEventListener('click', () => {
    if (scenery_home_container.classList.contains('visible')) {
        scenery_home_container.classList.remove('visible'); 
        scenery_home_container.classList.add('hidden');
    } else {
        scenery_home_container.classList.remove('hidden');
        scenery_home_container.classList.add('visible');
    }
});
scenery_home_container_close.addEventListener('click', () => {
    scenery_home_container.classList.remove('visible');
    scenery_home_container.classList.add('hidden');
});
const scenery_income_button = document.getElementById('scenery-income-button');
const income_button_stars = document.getElementById('income-button-stars');
const income_button_gifts = document.getElementById('income-button-gifts');
const scenery_income_container_main = document.getElementById('scenery-income-container-main');
const scenery_income_container_stars = document.getElementById('scenery-income-container-stars');
const scenery_income_container_giftslist = document.getElementById('scenery-income-container-giftslist');
const scenery_income_container_giftsout = document.getElementById('scenery-income-container-giftsout');
const scenery_income_container_close = document.getElementById('scenery-income-container-close');
const scenery_income_container_stars_close = document.getElementById('scenery-income-container-stars-close');
const scenery_income_container_giftslist_close = document.getElementById('scenery-income-container-giftslist-close');
const scenery_income_container_giftsout_close = document.getElementById('scenery-income-container-giftsout-close');
scenery_income_button.addEventListener('click', () => {
    if (scenery_income_container_main.classList.contains('visible')) {
        scenery_income_container_main.classList.add('hidden');
        scenery_income_container_main.classList.remove('visible');
    } else {
        scenery_income_container_main.classList.add('visible');
        scenery_income_container_main.classList.remove('hidden');
    }
});
income_button_stars.addEventListener('click', () => {
    scenery_income_container_main.classList.add('hidden');
    scenery_income_container_main.classList.remove('visible');
    setTimeout(() => { scenery_income_container_stars.classList.remove('hidden'); 
        scenery_income_container_stars.classList.add('visible'); }, 150);
});
income_button_gifts.addEventListener('click', () => {
    scenery_income_container_main.classList.add('hidden');
    scenery_income_container_main.classList.remove('visible');
    setTimeout(() => { scenery_income_container_giftslist.classList.remove('hidden'); 
        scenery_income_container_giftslist.classList.add('visible'); }, 150);
});
scenery_income_container_close.addEventListener('click', () => {
    scenery_income_container_main.classList.add('hidden');
    scenery_income_container_main.classList.remove('visible');
});
scenery_income_container_stars_close.addEventListener('click', () => {
    scenery_income_container_stars.classList.add('hidden');
    scenery_income_container_stars.classList.remove('visible');
    setTimeout(() => { scenery_income_container_main.classList.remove('hidden'); 
        scenery_income_container_main.classList.add('visible'); }, 150);
});
scenery_income_container_giftslist_close.addEventListener('click', () => {
    scenery_income_container_giftslist.classList.add('hidden');
    scenery_income_container_giftslist.classList.remove('visible');
    setTimeout(() => { scenery_income_container_main.classList.remove('hidden'); 
        scenery_income_container_main.classList.add('visible'); }, 150);
});
scenery_income_container_giftsout_close.addEventListener('click', () => {
    scenery_income_container_giftsout.classList.add('hidden');
    scenery_income_container_giftsout.classList.remove('visible');
    setTimeout(() => { scenery_income_container_giftslist.classList.remove('hidden'); 
        scenery_income_container_giftslist.classList.add('visible'); }, 150);
});

/*

// Функция применения тем приложения
const update_basic_nika = document.getElementById('update-basic-nika');
const update_winter_nika = document.getElementById('update-winter-nika');
const update_christmas_nika = document.getElementById('update-christmas-nika');
const update_angel_nika = document.getElementById('update-angel-nika');
const update_summer_nika = document.getElementById('update-summer-nika');
const update_halloween_nika = document.getElementById('update-halloween-nika');
const update_sexy_nika = document.getElementById('update-sexy-nika');
const update_birth_nika = document.getElementById('update-birth-nika');


// Функция однократного показа gif анимации
function showAnimation(id, src, lengh) {
  const img = document.getElementById(id); if (!img) return;
  const cacheBuster = Date.now() + Math.random().toString(36).slice(2);
  const sep = src.includes('?') ? '&' : '?';
  const newSrc = src + sep + 'cb=' + cacheBuster;
  img.src = newSrc;

  if (img._gifTimeout) clearTimeout(img._gifTimeout);
  img._gifTimeout = setTimeout(() => {
    img.style.display = 'none';
    img.removeAttribute('src');
    delete img._gifTimeout;
  }, lengh);
}

// Функции фокусирования на блоках scenery
const anim_lengh_comein = 5280;
const anim_lengh_sitdown = 4920;
function onEnterStars(from) { 
    console.log('Entered stars', {from}); 
    showAnimation("scenery-stars-nika", "animations/nika_stars_comein.gif", anim_lengh_comein);
    setTimeout(() => { showAnimation("scenery-stars-nika", "animations/nika_stars_sitdown.gif", anim_lengh_sitdown); }, anim_lengh_comein);
}
function onEnterHome(from) { 
    console.log('Entered home', {from}); 
}
function onEnterIncome(from) { 
    console.log('Entered income', {from}); 
}

const BLOCK_SELECTOR = '.scenery-container';
const CENTER_OFFSET_VH = 10;
const THROTTLE_MS = 100;

function throttle(fn, wait) {
  let last = 0, timeout = null, lastArgs = null;
  return function(...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    lastArgs = args;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      last = now;
      fn.apply(this, lastArgs);
      lastArgs = null;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        last = Date.now();
        timeout = null;
        fn.apply(this, lastArgs);
        lastArgs = null;
      }, remaining);
    }
  };
}

function updateVH() { vh = window.innerHeight / 100; }

function checkFocus() {
updateVH();
const list = getBlocks();
if (list.length === 0) return;

const centerY = window.scrollY + window.innerHeight / 2;
const offsetPx = CENTER_OFFSET_VH * vh;
const zoneTop = centerY - offsetPx;
const zoneBottom = centerY + offsetPx;

let foundIndex = -1;
for (let i = 0; i < list.length; i++) {
    const el = list[i];
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = rect.bottom + window.scrollY;
    if (!(bottom < zoneTop || top > zoneBottom)) {
    foundIndex = i;
    break;
    }
}

if (foundIndex !== currentIndex) {
    const prev = currentIndex;
    currentIndex = foundIndex;
    if (foundIndex === 0) onEnterBlock1(prev, foundIndex);
    else if (foundIndex === 1) onEnterBlock2(prev, foundIndex);
    else if (foundIndex === 2) onEnterBlock3(prev, foundIndex);
}
}

*/

// ======================================== ✓ Уведомления ======================================== \\

// ✓ Функция отображения уведомлений 
let notifications_count = 0;
let notifications_current = 0;
const notification_container = document.getElementById('notifications');
function showNotification(notification_name) {
    notifications_count += 1; 
    notifications_current += 1;
    const notification = {
        achivement: {url: "images/notifications/notif_achivement.png", desc: "Получено новое достижение! Нажмите для просмотра дополнительной информации", remain: 5000},
        dailyalready: {url: "images/notifications/notif_dailyalready.png", desc: "Награда за этот день уже взята", remain: 3000},
        dailydecline: {url: "images/notifications/notif_dailydecline.png", desc: "Награда за этот день еще недоступна", remain: 3000},
        dailyno: {url: "images/notifications/notif_dailyno.png", desc: "Ежедневная реклама уже просмотрена", remain: 2500},
        dailysuccess: {url: "images/notifications/notif_dailysuccess.png", desc: "Награда за этот день успешно засчитана!", remain: 4000},
        decline: {url: "images/notifications/notif_decline.png", desc: "Просмотр прерван пользователем", remain: 3000},
        incomegift: {url: "images/notifications/notif_incomegift.png", desc: "Подарок успешно выведен из игры!", remain: 5000},
        incomestar: {url: "images/notifications/notif_incomestar.png", desc: "Звезды успешно выведены из игры!", remain: 5000},
        nofuel: {url: "images/notifications/notif_nofuel.png", desc: "Недостаточно топлива", remain: 2500},
        question: {url: "images/notifications/notif_question.png", desc: "Во время загрузки произошла ошибка", remain: 3000},
        starfall: {url: "images/notifications/notif_starfall.png", desc: "Звездопад завершен, +1 жетон на балланс", remain: 5000},
        success: {url: "images/notifications/notif_success.png", desc: "Рекламный видеоролик просмотрен успешно!", remain: 3000},
        dailygift: {url: "images/notifications/notif_dailygift.png", desc: "Подарок ежедневника успешно получен!", remain: 5000},
        critical: {url: "images/notifications/notif_critical.png", desc: "Критическая ошибка приложения", remain: 10000},
        noads: {url: "images/notifications/notif_noads.png", desc: "Нет доступной рекламы. Попробуйте еще раз", remain: 3000},
    };

    // ✓ Создаем уведомление из элементов
    const notification_dom_div = document.createElement('div');
    notification_dom_div.setAttribute("class", "notification-dom-container notification-hidden "); 
    notification_dom_div.setAttribute("id", `notification-${notifications_current}`);
    const notification_dom_img = document.createElement('img');
    notification_dom_img.setAttribute("src", notification[notification_name].url); 
    notification_dom_img.setAttribute("class", "notification-dom-image");
    notification_container.appendChild(notification_dom_div);
    notification_dom_div.appendChild(notification_dom_img);
    setTimeout(() => {
        notification_dom_div.classList.remove('notification-hidden');
        notification_dom_div.classList.add('notification-visible');
    }, 10);

    // ✓ Удаляем устаревшее уведомление
    setTimeout(() => {
        notification_dom_div.classList.remove('notification-visible');
        notification_dom_div.classList.add('notification-hidden');
        setTimeout(() => { notification_container.removeChild(notification_dom_div); }, 500);
        notifications_count -= 1;
    }, notification[notification_name].remain);
}

// ======================================== Пользовательский интерфейс ======================================== \\

// ✓ Отображение и скрытие заблюренной подложки для загрузки/рекламы
const banner = document.getElementById('banner');
function editBanner(show) {
  if (show) {
    banner.classList.remove('hidden');
    banner.classList.add('visible');
  } else {
    banner.classList.remove('visible');
    banner.classList.add('hidden');
  }
}

// ✓ Функция изменения уровня шкалы .bar
function setBar(percent, bar_id) {
  const bar = document.getElementById(bar_id);
  if (!bar) return;
  let p = Number(percent);
  if (!isFinite(p)) p = 0;
  p = Math.max(0, Math.min(100, p));
  let fill = bar.querySelector('.fill');
  if (!fill) {
    fill = document.createElement('div');
    fill.className = 'fill';
    bar.appendChild(fill);
  }
  let label = bar.querySelector('.label');
  if (!label) {
    label = document.createElement('div');
    label.className = 'label';
    bar.appendChild(label);
  }
  // Устанавливаем высоту заливки
  fill.style.height = p + '%';
  label.textContent = Math.round(p) + '%';
  label.style.color = '#fff';
  label.style.top = '12px';
}

// Настройки приложения
/*
const settingElement = {
    audio: document.getElementById('settings-audio'),
    music: document.getElementById('settings-music'),
    notif: document.getElementById('settings-notif'),
    nika: document.getElementById('settings-nika'),
    graphics_best: document.getElementById('settings-graphics-best'),
    graphics_economy: document.getElementById('settings-graphics-economy'),
    graphics_low: document.getElementById('settings-graphics-low'),
    animations: document.getElementById('settings-animations'),
    parallax: document.getElementById('settings-parallax'),
    effects: document.getElementById('settings-effects'),
    notifcount_0: document.getElementById('settings-notifcount-0'),
    notifcount_1: document.getElementById('settings-notifcount-1'),
    notifcount_2: document.getElementById('settings-notifcount-2'),
    notifcount_3: document.getElementById('settings-notifcount-3'),
    reset: document.getElementById('button-settings-reset'),
    update: {
        basic_theme: document.getElementById('update-basic-theme'),
        basic_nika: document.getElementById('update-basic-nika'),
        basic_sound: document.getElementById('update-basic-sound'),
        winter_theme: document.getElementById('update-winter-theme'),
        winter_nika: document.getElementById('update-winter-nika'),
        christmas_nika: document.getElementById('update-christmas-nika'),
        winter_sound: document.getElementById('update-winter-sound'),
        angel_theme: document.getElementById('update-angel-theme'),
        angel_nika: document.getElementById('update-angel-nika'),
        angel_sound: document.getElementById('update-angel-sound'),
        summer_theme: document.getElementById('update-summer-theme'),
        summer_nika: document.getElementById('update-summer-nika'),
        summer_sound: document.getElementById('update-summer-sound'),
        halloween_theme: document.getElementById('update-halloween-theme'),
        halloween_nika: document.getElementById('update-halloween-nika'),
        sexy_nika: document.getElementById('update-sexy-nika'),
        halloween_sound: document.getElementById('update-halloween-sound'),
        birth_theme: document.getElementById('update-birth-theme'),
        birth_nika: document.getElementById('update-birth-nika'),
        birth_sound: document.getElementById('update-birth-sound') 
    }
};
const daily_nika = document.getElementById('daily-nika');
const scenery_stars_nika = document.getElementById('scenery-stars-nika');
const scenery_home_nika = document.getElementById('scenery-home-nika');
const scenery_stars_nika_img = document.getElementById('scenery-stars-nika-img');
const scenery_home_nika_img = document.getElementById('scenery-home-nika-img');
// const scenery_income_nika = document.getElementById('scenery-income-nika-img');
document.addEventListener("DOMContentLoaded", function () {
  const image = {
      nika: {
          basic: {
              stars: {
                  sit: "images/nika/nika_stars_classic_sit.png",
                  stand: "images/nika/nika_stars_classic_stand.png",
                  comein: "animations/basic-nika/nika_stars_comein.gif",
                  sitdown: "animations/basic-nika/nika_stars_sitdown.gif",
                  state: "animations/basic-nika/nika_stars_state.gif",
                  comeout: "animations/basic-nika/nika_stars_comeout.gif"
              }, home: {
                  stand: "images/nika/nika_home_classic.png",
                  comein: "animations/basic-nika/",
                  state: "animations/basic-nika/",
                  comeout: "animations/basic-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/basic-nika/",
                  state: "animations/basic-nika/",
                  comeout: "animations/basic-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_classic.png",
                  state: "animations/basic-nika/nika_daily.gif"
              }
          }, winter: {
              stars: {
                  sit: "images/nika/nika_stars_year_sit.png",
                  stand: "images/nika/nika_stars_year_stand.png",
                  comein: "animations/winter-nika/",
                  state: "animations/winter-nika/",
                  comeout: "animations/winter-nika/"
              }, home: {
                  stand: "images/nika/nika_home_year.png",
                  comein: "animations/winter-nika/",
                  state: "animations/winter-nika/",
                  comeout: "animations/winter-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/winter-nika/",
                  state: "animations/winter-nika/",
                  comeout: "animations/winter-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_winter.png",
                  state: "animations/winter-nika/nika_daily.gif"
              }
          }, christmas: {
              stars: {
                  sit: "images/nika/nika_stars_christmas_sit.png",
                  stand: "images/nika/nika_stars_christmas_stand.png",
                  comein: "animations/christmas-nika/",
                  state: "animations/christmas-nika/",
                  comeout: "animations/christmas-nika/"
              }, home: {
                  stand: "images/nika/nika_home_christmas.png",
                  comein: "animations/christmas-nika/",
                  state: "animations/christmas-nika/",
                  comeout: "animations/christmas-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/christmas-nika/",
                  state: "animations/christmas-nika/",
                  comeout: "animations/christmas-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_christmas.png",
                  state: "animations/christmas-nika/nika_daily.gif"
              }
          }, angel: {
              stars: {
                  sit: "images/nika/nika_stars_angel_sit.png",
                  stand: "images/nika/nika_stars_angel_stand.png",
                  comein: "animations/angel-nika/",
                  state: "animations/angel-nika/",
                  comeout: "animations/angel-nika/"
              }, home: {
                  stand: "images/nika/nika_home_angel.png",
                  comein: "animations/angel-nika/",
                  state: "animations/angel-nika/",
                  comeout: "animations/angel-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/angel-nika/",
                  state: "animations/angel-nika/",
                  comeout: "animations/angel-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_angel.png",
                  state: "animations/angel-nika/nika_daily.gif"
              }
          }, summer: {
              stars: {
                  sit: "images/nika/nika_stars_summer_sit.png",
                  stand: "images/nika/nika_stars_summer_stand.png",
                  comein: "animations/summer-nika/",
                  state: "animations/summer-nika/",
                  comeout: "animations/summer-nika/"
              }, home: {
                  stand: "images/nika/nika_home_summer.png",
                  comein: "animations/summer-nika/",
                  state: "animations/summer-nika/",
                  comeout: "animations/summer-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/summer-nika/",
                  state: "animations/summer-nika/",
                  comeout: "animations/summer-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_summer.png",
                  state: "animations/summer-nika/nika_daily.gif"
              }
          }, halloween: {
              stars: {
                  sit: "images/nika/nika_stars_halloween_sit.png",
                  stand: "images/nika/nika_stars_halloween_stand.png",
                  comein: "animations/halloween-nika/",
                  state: "animations/halloween-nika/",
                  comeout: "animations/halloween-nika/"
              }, home: {
                  stand: "images/nika/nika_home_halloween.png",
                  comein: "animations/halloween-nika/",
                  state: "animations/halloween-nika/",
                  comeout: "animations/halloween-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/halloween-nika/",
                  state: "animations/halloween-nika/",
                  comeout: "animations/halloween-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_halloween.png",
                  state: "animations/halloween-nika/nika_daily.gif"
              }
          }, sexy: {
              stars: {
                  sit: "images/nika/nika_stars_sexy_sit.png",
                  stand: "images/nika/nika_stars_sexy_stand.png",
                  comein: "animations/sexy-nika/",
                  state: "animations/sexy-nika/",
                  comeout: "animations/sexy-nika/"
              }, home: {
                  stand: "images/nika/nika_home_sexy.png",
                  comein: "animations/sexy-nika/",
                  state: "animations/sexy-nika/",
                  comeout: "animations/sexy-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/sexy-nika/",
                  state: "animations/sexy-nika/",
                  comeout: "animations/sexy-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_sexy.png",
                  state: "animations/sexy-nika/nika_daily.gif"
              }
          }, birth: {
              stars: {
                  sit: "images/nika/nika_stars_birth_sit.png",
                  stand: "images/nika/nika_stars_birth_stand.png",
                  comein: "animations/birth-nika/",
                  state: "animations/birth-nika/",
                  comeout: "animations/birth-nika/"
              }, home: {
                  stand: "images/nika/nika_home_birth.png",
                  comein: "animations/birth-nika/",
                  state: "animations/birth-nika/",
                  comeout: "animations/birth-nika/"
              }, income: {
                  stand: "images/nika/",
                  comein: "animations/birth-nika/",
                  state: "animations/birth-nika/",
                  comeout: "animations/birth-nika/"
              }, daily: {
                  stand: "images/nika/nika_daily_birth.png",
                  state: "animations/birth-nika/nika_daily.gif"
              }
          }
      }
  };
  function getThemeTheme() {
      if (settingElement.update.basic_theme.checked == true) return "basic";
      if (settingElement.update.winter_theme.checked == true) return "winter";
      if (settingElement.update.angel_theme.checked == true) return "angel";
      if (settingElement.update.summer_theme.checked == true) return "summer";
      if (settingElement.update.halloween_theme.checked == true) return "halloween";
      if (settingElement.update.birth_theme.checked == true) return "birth";
      return "basic";
  }
  function getThemeNika() {
      if (settingElement.update.basic_nika.checked == true) return "basic";
      if (settingElement.update.winter_nika.checked == true) return "winter";
      if (settingElement.update.christmas_nika.checked == true) return "christmas";
      if (settingElement.update.angel_nika.checked == true) return "angel";
      if (settingElement.update.summer_nika.checked == true) return "summer";
      if (settingElement.update.halloween_nika.checked == true) return "halloween";
      if (settingElement.update.sexy_nika.checked == true) return "sexy";
      if (settingElement.update.birth_nika.checked == true) return "birth";
      return "basic";
  }
  function getThemeSound() {
      if (settingElement.update.basic_sound.checked == true) return "basic";
      if (settingElement.update.winter_sound.checked == true) return "winter";
      if (settingElement.update.angel_sound.checked == true) return "angel";
      if (settingElement.update.summer_sound.checked == true) return "summer";
      if (settingElement.update.halloween_sound.checked == true) return "halloween";
      if (settingElement.update.birth_sound.checked == true) return "birth";
      return "basic";
  }
  function updateImages(t_theme, t_nika, t_sound) {
      if (!settingElement.nika.checked) {
          daily_nika.setAttribute('src', ""); 
          scenery_stars_nika.setAttribute('src', ""); 
          scenery_home_nika.setAttribute('src', "");
          return; 
      }
      if (settingElement.animations.checked) {
          scenery_stars_nika.classList.remove('stated');
          scenery_home_nika.classList.remove('stated');
          scenery_stars_nika.classList.add('animated');
          scenery_home_nika.classList.add('animated');
          daily_nika.setAttribute('src', image.nika[t_nika].daily.state); 
          scenery_stars_nika_img.setAttribute('src', image.nika[t_nika].stars.state); 
          scenery_home_nika_img.setAttribute('src', image.nika[t_nika].home.state);
          return;
      } else {
          scenery_stars_nika.classList.remove('animated');
          scenery_home_nika.classList.remove('animated');
          scenery_stars_nika.classList.add('stated');
          scenery_home_nika.classList.add('stated');
          daily_nika.setAttribute('src', image.nika[t_nika].daily.stand); 
          scenery_stars_nika_img.setAttribute('src', image.nika[t_nika].stars.stand); 
          scenery_home_nika_img.setAttribute('src', image.nika[t_nika].home.stand);
          return;
      }
  }
  updateImages(getThemeTheme(), getThemeNika(), getThemeSound());
  settingElement.animations.addEventListener('change', updateImages(getThemeTheme(), getThemeNika(), getThemeSound()));
  document.querySelectorAll('.update-theme-input').forEach(element => { element.addEventListener('change', (event) => { updateImages(getThemeTheme(), getThemeNika(), getThemeSound()); }); });
}, { once: true }); */

// Обновление пользовательского интерфейса (данными из струкруры state)
const advertise_fuel = document.getElementById('stars-advertise-fuel');
const advertise_charge = document.getElementById('stars-advertise-charge');
const advertise_lasttime = document.getElementById('stars-bar-fuel-lasttime');
const advertise_status = document.getElementById('scenery-button-ad-status-span');
const advertise_status_fuel = document.getElementById('scenery-button-ad-fuel-span');
const advertise_status_fuel_container = document.getElementById('scenery-button-ad-status-container');
const daily_button_status = document.getElementById('daily-button-ad-status');
const balance_tokens = document.getElementById('top-ui-tokens');
const balance_stars= document.getElementById('top-ui-stars');
function updateUI(state) {
  // ✓ Шкалы генератора
  const fuel_percentage = (state.fuel / MAX_FUEL) * 100;
  const charge_percentage = (state.charge / MAX_CHARGE) * 100;
  setBar(fuel_percentage, 'stars-bar-fuel');
  setBar(charge_percentage, 'stars-bar-charge');

  // ✓ Надписи с данными
  balance_tokens.textContent = `${state.tokens}`;
  balance_stars.textContent = `${state.stars}`;
  advertise_fuel.textContent = `${state.fuel} / ${MAX_FUEL}`;
  advertise_charge.textContent = `${state.charge} / ${MAX_CHARGE}`;

  // ✓ Топливо и заряд генератора
  if (state.fuel >= MAX_FUEL) {
    advertise_lasttime.textContent = `Полный бак`;
    advertise_status_fuel_container.classList.add('hidden');
    advertise_status_fuel_container.classList.remove('visible');
  } else {
    const now = Date.now();
    let start = state.recoverStart;
    const elapsed = RECOVER_MS - (now - start);
    const totalSec = Math.floor(elapsed / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    advertise_lasttime.textContent = `До новой топливной единицы: ${m}мин ${s}сек`;
    advertise_status.textContent = `До обновления лимита: ${m}мин ${s}сек`;
    advertise_status_fuel_container.classList.add('visible');
    advertise_status_fuel_container.classList.remove('hidden');
  }
  advertise_status_fuel.textContent = `Доступно к просмотру: ${state.fuel}/${MAX_FUEL}`;

  // ✓ Режимы кнопки просмотра рекламы на главной странице
  if (state.charge >= MAX_CHARGE) {
    advertise_button.classList.add('starfall');
    advertise_button.classList.remove('disabled'); 
    advertise_button.textContent = `Начать звездопад`; 
  } else if ((state.fuel <= 0) && state.charge < MAX_CHARGE) { 
    advertise_button.classList.add('disabled');
    advertise_button.classList.remove('starfall'); 
    advertise_button.textContent = `Нет топлива`; 
  } else { 
    advertise_button.classList.remove('starfall'); 
    advertise_button.classList.remove('disabled'); 
    advertise_button.textContent = `Смотреть рекламу`;
  }

  // ✓ Режимы кнопки просмотра рекламы в ежедневнике
  if (state.dailyEnabled > 0) {
    daily_button.classList.remove('disabled');
    daily_button.textContent = `Смотреть рекламу`;
    daily_button_status.textContent = ``;
  } else {
    daily_button.classList.add('disabled');
    daily_button.textContent = `Реклама закончилась`;
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const elapsed = nextMidnight - now;
    const remainder = Math.floor(elapsed / 1000);
    const hd = Math.floor(remainder / 3600);
    const md = Math.floor((remainder - (hd * 3600)) / 60);
    const sd = remainder % 60;
    daily_button_status.textContent = `До обновления лимита осталось: ${hd}ч ${md}мин ${sd}сек`;
  }

  // Сторонние функции обновления
  updateDaily(state);
  // updateAnimations();
}

/*

window.addEventListener("error", (e) => {
  showNotification('critical');
}, true); */

// ✓ Инициализация и периодическое обновление
let state = loadState();
function tick() { applyRecovery(); applyDailyRecovery(); updateUI(state); } 
tick();
saveState(state);
window.addEventListener('beforeunload', () => { saveState(state); });
let uiTimer = setInterval(tick, 500);
let saveTimer = setInterval(() => { saveState(state); }, 5000 );