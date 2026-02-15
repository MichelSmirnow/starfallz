// ✓ Главные элементы структуры приложения
const perfomance_site = document.getElementById('site');
const perfomance_toosmall = document.getElementById('toosmall');
const perfomance_main = document.getElementById('main');
const perfomance_load = document.getElementById('load');

// ✓ Боковая страница профиля
const profile = document.getElementById('profile');
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

// ✓ Настройки приложения
const settings_audio = document.getElementById('settings-audio');
const settings_music = document.getElementById('settings-music');
const settings_notif = document.getElementById('settings-notif');
const settings_nika = document.getElementById('settings-nika');
const settings_graphics_best = document.getElementById('settings-graphics-best');
const settings_graphics_economy = document.getElementById('settings-graphics-economy');
const settings_graphics_low = document.getElementById('settings-graphics-low');
const settings_animations = document.getElementById('settings-animations');
const settings_parallax = document.getElementById('settings-parallax');
const settings_effects = document.getElementById('settings-effects');
const settings_notifcount_0 = document.getElementById('settings-notifcount-0');
const settings_notifcount_1 = document.getElementById('settings-notifcount-1');
const settings_notifcount_2 = document.getElementById('settings-notifcount-2');
const settings_notifcount_3 = document.getElementById('settings-notifcount-3');
const settings_reset = document.getElementById('button-settings-reset');

// Боковая страница ежедневника
const daily = document.getElementById('daily');
const daily_button_ad = document.getElementById('daily-button-ad');
const daily_nika = document.getElementById('daily-nika');
const daily_enabled = document.getElementById('daily-enabled');
const daily_button_1 = document.getElementById('daily-button-1');
const daily_button_2 = document.getElementById('daily-button-2');
const daily_button_3 = document.getElementById('daily-button-3');
const daily_button_4 = document.getElementById('daily-button-4');
const daily_button_5 = document.getElementById('daily-button-5');
const daily_button_6 = document.getElementById('daily-button-6');
const daily_button_7 = document.getElementById('daily-button-7');

// Элементы интерфейса #scenery-stars
const scenery_stars = document.getElementById('scenery-stars');
const scenery_button_ad = document.getElementById('scenery-button-ad');

// Элементы интерфейса #scenery-home
const scenery_home = document.getElementById('scenery-home');

// Элементы интерфейса #scenery-income
const scenery_income = document.getElementById('scenery-income');


// ✓ Верхний пользовательский интерфейс
const top_ui_star = document.getElementById('top-ui-star');
const top_ui_stars = document.getElementById('top-ui-stars');
const top_ui_token = document.getElementById('top-ui-token');
const top_ui_tokens = document.getElementById('top-ui-tokens');


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
    perfomance_small.style.display = `none`*/
    console.log('Запущено вне Telegram Web App, запускаем сайт для ознакомления с приложением...');
}

// ======================================== Пользовательский интерфейс ======================================== \\

// Функция отображения уведомлений
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
}


/*const achivement = {
    // Достижения звездопадов
    : {url: "images/achivements/", title: "Запускаем генератор", desc: "С чего-то же нужно начинать?", spoiler: "Первый раз начать звездопад"},
    mania: {url: "images/achivements/achiv_mania.png", title: "Звездная мания", desc: "Цикл получения бесплатных звезд запущен - теперь меня не остановить!", spoiler: "Запустить звездопад 5 раз"},
    factory: {url: "images/achivements/achiv_factory.png", title: "Фабрика звезд", desc: "Промышленное производство звезд в масштабах страны", spoiler: "Запустить звездопад 25 раз"},
    : {url: "images/achivements/", title: "Звездопад", desc: "", spoiler: "Запустить звездопад 50 раз"},
    stargazes: {url: "images/achivements/", title: "Звездные грезы", desc: "", spoiler: "Запустить звездопад 100 раз"},

    // Достижения вывода звезд
    : {url: "images/achivements/", title: "Малый бизнес", desc: "", spoiler: "Вывести из приложения первую звезду"},
    business: {url: "images/achivements/achiv_business.png", title: "Предприниматель", desc: "", spoiler: "Вывести из приложения 25 звезд"},
    : {url: "images/achivements/", title: "Звездная мануфактура", desc: "", spoiler: "Вывести из приложения 100 звезд"},

    // Достижения вывода подарков
    firstgift: {url: "images/achivements/achiv_firstgift.png", title: "Первый подарок", desc: "", spoiler: "Вывести из приложения первый подарок"},
    collector: {url: "images/achivements/achiv_collector.png", title: "Коллекционер", desc: "", spoiler: "Вывести из приложения 5 подарков"},
    : {url: "images/achivements/", title: "NFT-Провайдер", desc: "", spoiler: "Вывести из приложения 25 подарков"},

    // Достижения ежедневника
    : {url: "images/achivements/", title: "", desc: "", spoiler: "Забрать первую ежедневную награду в ежедневнике"},
    : {url: "images/achivements/", title: "", desc: "", spoiler: "Забрать награду за серию из трех дней в ежедневнике"},
    : {url: "images/achivements/", title: "Недельное испытание", desc: "", spoiler: "Забрать недельную награду в ежедневнике"},
    : {url: "images/achivements/", title: "Ни дня без звезд", desc: "", spoiler: "Получать ежедневные награды в течении 30 дней"},

    // Достижения событий
    event_year: {url: "images/achivements/achiv_event_year.png", title: "С Новым Годом!", desc: "Вы приняли участие в Новогоднем событии и добились в нем высоких результатов!", spoiler: "Принять участие в Новогоднем событии"},
    event_love: {url: "images/achivements/achiv_event_love.png", title: "Вместо тысячи слов...", desc: "Вы приняли участие в событии Дня всех влюбленных и добились в нем высоких результатов!", spoiler: "Принять участие в событии Дня всех влюбленных"},
    event_beach: {url: "images/achivements/achiv_event_beach.png", title: "Пляжный переполох", desc: "Вы приняли участие в Пляжном событии и добились в нем высоких результатов!", spoiler: "Принять участие в Пляжном событии"},
    event_hallo: {url: "images/achivements/achiv_event_hallo.png", title: "Темная ночь", desc: "Вы приняли участие в Хэллоунском событии и добились в нем высоких результатов!", spoiler: "Принять участие в Хэллоунском событии"},
    event_birth: {url: "images/achivements/achiv_event_birth.png", title: "День Рождения Starfallz", desc: "Вы приняли участие в событии Дня Рождения Starfallz!", spoiler: "Принять участие в событии Дня Рождения Starfallz"},

    // Секретные достижения
    nikafun: {url: "images/achivements/achiv_nikafun.png", title: "Фанат Ники", desc: "Нажать на Нику на всех страницах приложения", spoiler: "Секретное достижение. Продолжайте играть, чтобы получить его!"},
    zcount: {url: "images/achivements/", title: "Звездочет", desc: "Нажать на все звезды на всех страницах приложения", spoiler: "Секретное достижение. Продолжайте играть, чтобы получить его!"},
    subscriber: {url: "images/achivements/achiv_subscriber.png", title: "Подписчик", desc:"Подписаться на официальный телеграмм-канал приложения", spoiler: "Секретное достижение. Продолжайте играть, чтобы получить его!"}

    // Достижения тестрования
    alpha: {url: "images/achivements/achiv_alpha.png", title: "Альфа-тестировщик", desc: "Спасибо за альфа-тестирование приложения starfallz! (Лимитированный период получения с 22 декабря 2025г. по 1 марта 2026г.)", spoiler: "Невыполнимое достижение (Период получения истек)"},
    beta: {url: "images/achivements/achiv_beta.png", title: "Бета-тестировщик", desc: "Спасибо за бета-тестирование приложения starfallz! (Лимитированный период получения)", spoiler: "Невыполнимое достижение (Период получения истек)"},
    wellcome: {url: "images/achivements/achiv_wellcome.png", title: "Добро пожаловать!", desc: "Спасибо за использование приложения starfallz! Приятной игры!", spoiler: "Это достижение автоматически присваивается пользователю при первом посещении приложения"}
};*/


// Функция рассчета параллакса (отклик на прокрутку)
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


// Функции обработки нажатий на нижний пользовательский интерфейс
const bottom_ui_star = document.getElementById('bottom-ui-star');
const bottom_ui_home = document.getElementById('bottom-ui-home');
const bottom_ui_income = document.getElementById('bottom-ui-income');
const bottom_ui_daily = document.getElementById('bottom-ui-daily');
const bottom_ui_user = document.getElementById('bottom-ui-user');
bottom_ui_star.addEventListener('click', function() {
    returnOnPage();
    window.scroll({ top: 0, behavior: 'smooth' });
});
bottom_ui_home.addEventListener('click', function() {
    returnOnPage();
    setTimeout(() => { scenery_home.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 200);
    scenery_home.scrollIntoView({ behavior: 'smooth', block: 'end' });
});
bottom_ui_income.addEventListener('click', function() {
    returnOnPage();
    setTimeout(() => { scenery_income.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 200);
    scenery_income.scrollIntoView({ behavior: 'smooth', block: 'end' });
});
bottom_ui_daily.addEventListener('click', function() {
    right_panel.classList.remove('panel_bottom_shown');
    left_panel.classList.add('panel_bottom_shown');
    panel_background.classList.add('page_moved');
    panel_scenery.classList.add('page_moved');
});
bottom_ui_user.addEventListener('click', function() {
    left_panel.classList.remove('panel_bottom_shown');
    right_panel.classList.add('panel_bottom_shown');
    panel_background.classList.add('page_moved');
    panel_scenery.classList.add('page_moved');
});
function returnOnPage() {/*
    if (left_panel.classList.contains('panel_bottom_shown')) {left_panel.classList.remove('panel_bottom_shown');}
    if (right_panel.classList.contains('panel_bottom_shown')) {right_panel.classList.remove('panel_bottom_shown');}
    if (background.classList.contains('page_moved')) {
        panel_background.classList.remove('page_moved');
        panel_scenery.classList.remove('page_moved');
    }*/
}


// Функции обработки нажатий на кнопки открытия и закрытия окон scenery
const scenery_stars_button = document.getElementById('scenery-stars-button');
const scenery_stars_container = document.getElementById('scenery-stars-container');
const scenery_stars_container_close = document.getElementById('scenery-stars-container-close');
scenery_stars_button.addEventListener('click', () => {
    if (scenery_stars_container.classList.contains('visible')) {
        //scenery_button_ad.style.top = "7%";
        scenery_stars_container.classList.remove('visible_block');
        setTimeout(() => { scenery_stars_container.classList.remove('visible'); }, 500);
    } else {
        //scenery_button_ad.style.top = `-40vh`;
        setTimeout(() => { scenery_stars_container.classList.add('visible_block'); }, 10);
        scenery_stars_container.classList.add('visible');
    }
});
scenery_stars_container_close.addEventListener('click', () => {
    //scenery_button_ad.style.top = "7%";
    scenery_stars_container.classList.remove('visible_block');
    setTimeout(() => { scenery_stars_container.classList.remove('visible'); }, 500);
});

const scenery_home_button = document.getElementById('scenery-home-button');
const scenery_home_container = document.getElementById('scenery-home-container');
const scenery_home_container_close = document.getElementById('scenery-home-container-close');
scenery_home_button.addEventListener('click', () => {
    if (scenery_home_container.classList.contains('visible')) {
        scenery_home_container.classList.remove('visible_block');
        setTimeout(() => { scenery_home_container.classList.remove('visible'); }, 500);
    } else {
        setTimeout(() => { scenery_home_container.classList.add('visible_block'); }, 10);
        scenery_home_container.classList.add('visible');
    }
});
scenery_home_container_close.addEventListener('click', () => {
    scenery_home_container.classList.remove('visible_block');
    setTimeout(() => { scenery_home_container.classList.remove('visible'); }, 500);
});

const scenery_income_button = document.getElementById('scenery-income-button');
const scenery_income_container_main = document.getElementById('scenery-income-container-main');
const scenery_income_container_stars = document.getElementById('scenery-income-container-stars');
const scenery_income_container_giftslist = document.getElementById('scenery-income-container-giftslist');
const scenery_income_container_giftsout = document.getElementById('scenery-income-container-giftsout');
const scenery_income_container_close = document.getElementById('scenery-income-container-close');
scenery_income_button.addEventListener('click', () => {
    if (scenery_income_container_main.classList.contains('visible')) {
        scenery_income_container_main.classList.remove('visible_block');
        setTimeout(() => { scenery_income_container_main.classList.remove('visible'); }, 500);
    } else {
        setTimeout(() => { scenery_income_container_main.classList.add('visible_block'); }, 10);
        scenery_income_container_main.classList.add('visible');
    }
});
scenery_income_container_close.addEventListener('click', () => {
    scenery_income_container_main.classList.remove('visible_block');
    setTimeout(() => { scenery_income_container_main.classList.remove('visible'); }, 500);
});


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

/*

document.addEventListener('DOMContentLoaded', function() {
    // Применение настроек
    const settings_animations = document.getElementById('settings-animations');
    const settings_animations_daily = document.getElementById('daily-nika');
    const settings_animations_daily_original = 'images/daily-nika.png';
    const settings_animations_daily_animated = 'animations/daily-nika.gif';
    function updateAnimations() {
        if (settings_animations.checked) { settings_animations_daily.setAttribute('src', settings_animations_daily_animated); } else { settings_animations_daily.setAttribute('src', settings_animations_daily_original); } 
    }
    updateAnimations();
    settings_animations.addEventListener('change', updateAnimations);
});


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
  advertise_status.textContent = `${state.charge} / ${MAX_CHARGE} просмотров доступно`;
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
  updateDaily(state);
  //updateAnimations();
} */