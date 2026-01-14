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

const perfomance_site = document.getElementById('site');
const perfomance_small = document.getElementById('toosmall');
const perfomance_main = document.getElementById('main');

const advertise_container = document.getElementById('advertise-container');
const button_generator = document.getElementById('button-generator');
const button_close_generator = document.getElementById('button-close-generator');
const info_generator = document.getElementById('generator-info');
const left_panel = document.getElementById('daily');
const right_panel = document.getElementById('profile');
const panel_background = document.getElementById('background');
const panel_scenery = document.getElementById('scenery');

// Нижний пользовательский интерфейс
const star_image = document.getElementById('bottom-ui-star');
const home_image = document.getElementById('bottom-ui-home');
const home_targetSection = document.getElementById('scenery-home');
const income_image = document.getElementById('bottom-ui-income');
const income_targetSection = document.getElementById('scenery-income');
const daily_image = document.getElementById('bottom-ui-daily');
const user_image = document.getElementById('bottom-ui-user');

// Элементы и слои параллакса
const scroll_parallax_stars = document.getElementById('scenery-stars-parallax');
const scroll_postlayer_stars = document.getElementById('scenery-postlayer-image');
const scroll_parallax_home = document.getElementById('scenery-home-parallax');
const scroll_prelayer_home = document.getElementById('scenery-home-prelayer');

const scroll_scenery_stars = document.getElementById('scenery-stars');
const scroll_scenery_home = document.getElementById('scenery-home');

// Отчет о запуске приложения вне или в телеграмме 
const tg = window.Telegram && window.Telegram.WebApp;
if (tg) { 
    perfomance_site.style.display = `none`;
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
    perfomance_site.style.display = `none`;/*
    perfomance_main.style.display = `none`;
    perfomance_small.style.display = `none`*/
    console.log('Запущено вне Telegram Web App, запускаем сайт для ознакомления с приложением...');
}

// ======================================== Декорации и интерфейс ======================================== \\

// ✓ Функция отображения уведомлений
function showNotification(notif_id) {
    const notification = document.getElementById(notif_id);
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}

// Функция рассчета параллакса (отклик на прокрутку)
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    // Рассчитываем новые значения положения элементов параллакса
    const newPosition_parallax_stars = scrollPosition * (-0.2);
    const newPosition_postlayer_stars = 40 - (scrollPosition * 0.1);
    const newPosition_prelayer_home  = scrollPosition * (-0.05);

    // Применение значений новых положений
    scroll_parallax_stars.style.bottom = `${newPosition_parallax_stars}px`;
    scroll_postlayer_stars.style.padding = `${newPosition_postlayer_stars}px 0 0 0`;
    scroll_prelayer_home.style.top = `${newPosition_prelayer_home}px`;
});

document.addEventListener('DOMContentLoaded', function() {
    // Функции обработки нажатий на нижний пользовательский интерфейс
    star_image.addEventListener('click', function() {
        returnOnPage();
        window.scroll({ top: 0, behavior: 'smooth' });
    });
    home_image.addEventListener('click', function() {
        returnOnPage();
        home_targetSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    income_image.addEventListener('click', function() {
        returnOnPage();
        income_targetSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    daily_image.addEventListener('click', function() {
        right_panel.classList.remove('panel_bottom_shown');
        left_panel.classList.add('panel_bottom_shown');
        panel_background.classList.add('page_moved');
        panel_scenery.classList.add('page_moved');
    });
    user_image.addEventListener('click', function() {
        left_panel.classList.remove('panel_bottom_shown');
        right_panel.classList.add('panel_bottom_shown');
        panel_background.classList.add('page_moved');
        panel_scenery.classList.add('page_moved');
    });

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
function returnOnPage() {
    if (left_panel.classList.contains('panel_bottom_shown')) {left_panel.classList.remove('panel_bottom_shown');}
    if (right_panel.classList.contains('panel_bottom_shown')) {right_panel.classList.remove('panel_bottom_shown');}
    if (panel_background.classList.contains('page_moved')) {
        panel_background.classList.remove('page_moved');
        panel_scenery.classList.remove('page_moved');
    }
}


// Функция отображения информации генератора звездопада при нажатии
button_generator.addEventListener('click', () => {
    if (info_generator.classList.contains('visible')) {
        advertise_container.classList.remove('ad-container-opened');
        setTimeout(() => {
            info_generator.classList.remove('visible');
        }, 500);
        info_generator.classList.remove('visible_block');
    } else {
        advertise_container.classList.add('ad-container-opened');
        setTimeout(() => {
            info_generator.classList.add('visible');
        }, 10);
        info_generator.classList.add('visible_block');
    }
});
button_close_generator.addEventListener('click', () => {
    advertise_container.classList.remove('ad-container-opened');
    setTimeout(() => {
        info_generator.classList.remove('visible');
    }, 500);
    info_generator.classList.remove('visible_block');
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

  // Сторонние функции обновления
  updateDaily(state);
  //updateAnimations();
}