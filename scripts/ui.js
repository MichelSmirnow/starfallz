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
const perfomance_main = document.getElementById('main');
const left_panel = document.getElementById('daily');
const right_panel = document.getElementById('profile');
const panel_background = document.getElementById('background');
const panel_scenery = document.getElementById('bg-container');

// Отчет о запуске приложения вне или в телеграмме 
const tg = window.Telegram && window.Telegram.WebApp;
if (tg) { 
    perfomance_site.style.display = `none`;
    perfomance_main.style.display = `block`;
    console.log('Запущено в Telegram Web App, запускаем мини-приложение...');
    tg.ready();
} else {
    /* perfomance_site.style.display = `block`;
    perfomance_main.style.display = `none`;*/
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

    // Находим элементы и слои параллакса
    const scroll_parallax_city = document.getElementById('parallax-city');
    /*const scroll_parallax_city_bottom = document.getElementById('parallax-city-bottom');
    const scroll_parallax_mountain = document.getElementById('parallax-mountain');*/
    const scroll_advertise_container = document.getElementById('advertise-container');
    
    // Рассчитываем новые значения положения элементов параллакса
    const newPosition_parallax_city = scrollPosition * 0.2;
    /*const newPosition_parallax_city_bottom = scrollPosition * 0.2;
    const newPosition_parallax_mountain = scrollPosition * 0.2;*/
    const newPosition_advertise_container = scrollPosition * 0.07;

    // Применение значений новых положений
    scroll_parallax_city.style.margin = `${newPosition_parallax_city}px 0 0 0`;
    /*scroll_parallax_city_bottom.style.margin = `${newPosition_parallax_city_bottom}px 0 0 0`;
    scroll_parallax_mountain.style.margin = `${newPosition_parallax_mountain}px 0 0 0`;*/
    scroll_advertise_container.style.margin = `${newPosition_advertise_container}px 0 0 0`;
});

document.addEventListener('DOMContentLoaded', function() {
    // Функции использования bottom-ui
    const star_image = document.getElementById('bottom-ui-star');
    const home_image = document.getElementById('bottom-ui-home');
    const home_targetSection = document.getElementById('bottom-ui-home-index');
    const income_image = document.getElementById('bottom-ui-income');
    const income_targetSection = document.getElementById('bottom-ui-income-index');
    const daily_image = document.getElementById('bottom-ui-daily');
    const user_image = document.getElementById('bottom-ui-user');
    star_image.addEventListener('click', function() {
        returnOnPage();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    home_image.addEventListener('click', function() {
        returnOnPage();
        home_targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
    income_image.addEventListener('click', function() {
        returnOnPage();
        income_targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
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
});

// Функция для возврата на главную линию страницы после посещения боковых панелей
function returnOnPage() {
    left_panel.classList.remove('panel_bottom_shown');
    right_panel.classList.remove('panel_bottom_shown');
    panel_background.classList.remove('page_moved');
    panel_scenery.classList.remove('page_moved');
}

// Функция отображения информации генератора звездопада при нажатии
const advertise_container = document.getElementById('advertise-container');
const button_generator = document.getElementById('button-generator');
const button_close_generator = document.getElementById('button-close-generator');
const info_generator = document.getElementById('generator-info');
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

// Функция изменения уровня шкалы
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
