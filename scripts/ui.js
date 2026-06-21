// ✓ Главные элементы структуры приложения
const perfomance_site = document.getElementById('site');
const perfomance_toosmall = document.getElementById('toosmall');
const perfomance_main = document.getElementById('main');
const perfomance_load = document.getElementById('load');

// Консанты для генератора звездопада
const MAX_FUEL = 7;
const MAX_CHARGE = 5;
const RECOVER_MINUTES = 25;
const RECOVER_MS = RECOVER_MINUTES * 60 * 1000;
const FULL_RECOVER_MS = RECOVER_MS * MAX_FUEL;
const MAX_DAILY = 2;
const STORAGE_KEY = "aboba";
/* 
const InitAdButton = window.Adsgram.init({ blockId: "int-20487" }); // Для adsgram_ai
const InitAdDaily = window.Adsgram.init({ blockId: "int-20619" });  // Для adsgram_ai
*/

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
ad_main_int.addEventListener('onReward', () => { giveReward(state); });
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
  // showNotification('notif-starfall');
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

// ✓ Боковая страница профиля
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

// Боковая страница ежедневника
const daily_button_ad = document.getElementById('daily-button-ad');
const daily_enabled = document.getElementById('daily-enabled');
const daily_button_1 = document.getElementById('daily-button-1');
const daily_button_2 = document.getElementById('daily-button-2');
const daily_button_3 = document.getElementById('daily-button-3');
const daily_button_4 = document.getElementById('daily-button-4');
const daily_button_5 = document.getElementById('daily-button-5');
const daily_button_6 = document.getElementById('daily-button-6');
const daily_button_7 = document.getElementById('daily-button-7');


const scenery_button_ad = document.getElementById('scenery-button-ad');

// ✓ Верхний пользовательский интерфейс
const top_ui_star = document.getElementById('top-ui-star');
const top_ui_stars = document.getElementById('top-ui-stars');
const top_ui_token = document.getElementById('top-ui-token');
const top_ui_tokens = document.getElementById('top-ui-tokens');

/*
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

// ======================================== Пользовательский интерфейс ======================================== \\

// Функция отображения уведомлений 
/*
let notifications_count, notifications_current = 0;
function showNotification(notification_name) {
    notifications_count += 1; 
    notifications_current += 1;
    const notification = {
        achivement: {url: "images/notifications/notif_achivement.png", desc: "Получено новое достижение! Нажмите для просмотра дополнительной информации"},
        dailyalready: {url: "images/notifications/notif_dailyalready.png", desc: "Награда за этот день уже взята"},
        dailydecline: {url: "images/notifications/notif_dailydecline.png", desc: "Награда за этот день еще недоступна"},
        dailyno: {url: "images/notifications/notif_dailyno.png", desc: "Ежедневная реклама уже просмотрена"},
        dailysuccess: {url: "images/notifications/notif_dailysuccess.png", desc: "Награда за этот день успешно засчитана!"},
        decline: {url: "images/notifications/notif_decline.png", desc: "Просмотр прерван пользователем"},
        incomegift: {url: "images/notifications/notif_incomegift.png", desc: "Подарок успешно выведен из игры!"},
        incomestar: {url: "images/notifications/notif_incomestar.png", desc: "Звезды успешно выведены из игры!"},
        nofuel: {url: "images/notifications/notif_nofuel.png", desc: "Недостаточно топлива"},
        question: {url: "images/notifications/notif_question.png", desc: "Во время загрузки произошла ошибка"},
        starfall: {url: "images/notifications/notif_starfall.png", desc: "Звездопад завершен, +1 жетон на балланс"},
        success: {url: "images/notifications/notif_success.png", desc: "Рекламный видеоролик просмотрен успешно!"},
    };

    // Проверка на заполение шторки уведомлений
    if (notifications_count > setting.notifcount) {
    const todelete = notifications_current - notifications_count;
    notification_container.deleteChild(`notification-${todelete}`);
    notifications_count -= 1; }

    // Создаем уведомление из элементов
    const notification_container = document.getElementById('notifications');
    const notification_dom_div = document.createElement('div');
    notification_dom_div.setAttribute("class", "notification-dom-container"); notification_dom_div.setAttribute("id", `notification-${notifications_current}`);
    const notification_dom_img = document.createElement('img');
    notification_dom_div.setAttribute("src", notification[notification_name].url); notification_dom_div.setAttribute("class", "notification-dom-image");
    
    // Строим уведомление в контейнере
    notification_container.appendChild(notification_dom_div);
    notification_dom_div.appendChild(notification_dom_img);
    
    // Удаляем старое уведомление
    setTimeout(() => { 
        notification_container.deleteChild(notification_dom_div);
        notifications_count -= 1;
    }, 2500);
} */


// ✓ Функция рассчета параллакса (отклик на прокрутку)
window.addEventListener('scroll', function() {
    const scroll_parallax_stars = document.getElementById('scenery-stars-parallax');
    const scroll_postlayer_stars = document.getElementById('scenery-stars-postlayer');
    const scroll_parallax_home = document.getElementById('scenery-home-parallax');
    const scroll_postlayer_home = document.getElementById('scenery-home-postlayer');
    const scrollPosition = window.scrollY;
    
    // Рассчитываем новые значения положения элементов параллакса
    const newPosition_parallax_stars = scrollPosition * (-0.2);
    const newPosition_postlayer_stars = (scrollPosition * 0.5);
    const newPosition_parallax_home = Math.floor(this.window.innerHeight / 4.5) + scrollPosition * (-0.2);
    const newPosition_postlayer_home =  - Math.floor(this.window.innerHeight / 2) + scrollPosition * 0.5;

    // Применение значений новых положений
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
const profile = document.getElementById('profile');
const daily = document.getElementById('daily');
const background = document.getElementById('background');
const scenery = document.getElementById('scenery');
bottom_ui_star.addEventListener('click', function() {
    returnOnPage();
    window.scroll({ top: 0, behavior: 'smooth' });
});
bottom_ui_home.addEventListener('click', function() {
    const scenery_home = document.getElementById('scenery-home');
    returnOnPage();
    scenery_home.scrollIntoView({ behavior: 'smooth', block: 'end' });
});
bottom_ui_income.addEventListener('click', function() {
    const scenery_income = document.getElementById('scenery-income');
    returnOnPage();
    scenery_income.scrollIntoView({ behavior: 'smooth', block: 'end' });
});
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
        //scenery_button_ad.style.top = "7%";
        scenery_stars_container.classList.add('hidden');
        scenery_stars_container.classList.remove('visible');
    } else {
        //scenery_button_ad.style.top = `-40vh`;
        scenery_stars_container.classList.remove('hidden');
        scenery_stars_container.classList.add('visible');
    }
});
scenery_stars_container_close.addEventListener('click', () => {
    //scenery_button_ad.style.top = "7%";
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


// ✓ Функция изменения уровня шкалы
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
const setting = {
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
document.addEventListener('DOMContentLoaded', function() {
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
        if (setting.update.basic_theme.checked == true) return "basic";
        if (setting.update.winter_theme.checked == true) return "winter";
        if (setting.update.angel_theme.checked == true) return "angel";
        if (setting.update.summer_theme.checked == true) return "summer";
        if (setting.update.halloween_theme.checked == true) return "halloween";
        if (setting.update.birth_theme.checked == true) return "birth";
        return "basic";
    }
    function getThemeNika() {
        if (setting.update.basic_nika.checked == true) return "basic";
        if (setting.update.winter_nika.checked == true) return "winter";
        if (setting.update.christmas_nika.checked == true) return "christmas";
        if (setting.update.angel_nika.checked == true) return "angel";
        if (setting.update.summer_nika.checked == true) return "summer";
        if (setting.update.halloween_nika.checked == true) return "halloween";
        if (setting.update.sexy_nika.checked == true) return "sexy";
        if (setting.update.birth_nika.checked == true) return "birth";
        return "basic";
    }
    function getThemeSound() {
        if (setting.update.basic_sound.checked == true) return "basic";
        if (setting.update.winter_sound.checked == true) return "winter";
        if (setting.update.angel_sound.checked == true) return "angel";
        if (setting.update.summer_sound.checked == true) return "summer";
        if (setting.update.halloween_sound.checked == true) return "halloween";
        if (setting.update.birth_sound.checked == true) return "birth";
        return "basic";
    }
    function updateImages(t_theme, t_nika, t_sound) {
        /*if (!setting.nika.checked) {
            daily_nika.setAttribute('src', ""); 
            scenery_stars_nika.setAttribute('src', ""); 
            scenery_home_nika.setAttribute('src', "");
            return; 
        }*/
        if (setting.animations.checked) {
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
    setting.animations.addEventListener('change', updateImages(getThemeTheme(), getThemeNika(), getThemeSound()));
    document.querySelectorAll('.update-theme-input').forEach(element => { element.addEventListener('change', (event) => { updateImages(getThemeTheme(), getThemeNika(), getThemeSound()); }); });

});

// Обновление пользовательского интерфейса (данными из струкруры state)
const advertise_fuel = document.getElementById('stars-advertise-fuel');
const advertise_charge = document.getElementById('stars-advertise-charge');
// const advertise_status = document.getElementById('status');
const advertise_lasttime = document.getElementById('stars-bar-fuel-lasttime');
const balance_tokens = document.getElementById('top-ui-token');
const balance_stars= document.getElementById('top-ui-star');
function updateUI(state) {
  // Шкалы генератора
  const fuel_percentage = (state.fuel / MAX_FUEL) * 100;
  const charge_percentage = (state.charge / MAX_CHARGE) * 100;
  setBar(fuel_percentage, 'stars-bar-fuel');
  setBar(charge_percentage, 'stars-bar-charge');

  // Надписи с данными
  balance_tokens.textContent = `${state.tokens}`;
  balance_stars.textContent = `${state.stars}`;
  advertise_fuel.textContent = `${state.fuel} / ${MAX_FUEL}`;
  advertise_charge.textContent = `${state.charge} / ${MAX_CHARGE}`;
  // advertise_status.textContent = `${state.charge} / ${MAX_CHARGE} просмотров доступно`;
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

  // Сторонние функции обновления
  // updateDaily(state);
  //updateAnimations();
}

// ✓ Инициализация и периодическое обновление
let state = loadState();
state = applyRecovery(state);
updateUI(state);
window.addEventListener('beforeunload', () => saveState(state));
let uiTimer = setInterval(() => {
  state = applyRecovery(state);
  updateUI(state);
}, 1000);
let saveTimer = setInterval(() => {
  saveState(state);
}, 10000);