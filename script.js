// Инициализация частиц
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#4A6FA5" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#4A6FA5",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true
        }
    }
});

// Прелоадер
window.addEventListener('load', function() {
    setTimeout(() => {
        document.querySelector('.preloader').classList.add('fade-out');
        setTimeout(() => {
            document.querySelector('.preloader').style.display = 'none';
        }, 500);
    }, 2000);
});

// Долгая анимация дождя Robux
function createExtendedRobuxRain(robuxCount) {
    const container = document.getElementById('robux-rain');
    container.style.display = 'block';
    
    // Создаем много Robux для долгой анимации
    const robuxDropCount = 200;
    const duration = 8; // 8 секунд
    
    for (let i = 0; i < robuxDropCount; i++) {
        setTimeout(() => {
            createRobuxDrop(container, duration);
        }, i * 100); // Растягиваем генерацию на 20 секунд
    }
    
    // Скрываем контейнер после завершения анимации
    setTimeout(() => {
        container.style.display = 'none';
        container.innerHTML = '';
    }, (robuxDropCount * 100) + (duration * 1000));
}

function createRobuxDrop(container, duration) {
    const robux = document.createElement('div');
    robux.className = 'robux-drop';
    robux.textContent = 'R$';
    robux.style.fontSize = `${Math.random() * 20 + 20}px`;
    
    // Случайная позиция сверху
    const posX = Math.random() * window.innerWidth;
    const delay = Math.random() * 2;
    
    robux.style.left = `${posX}px`;
    robux.style.animation = `robuxFall ${duration}s linear ${delay}s forwards`;
    
    // Случайный цвет из золотой палитры
    const goldColors = ['#FFD700', '#FFEC8B', '#EEE8AA', '#F0E68C', '#FFDEAD'];
    const color = goldColors[Math.floor(Math.random() * goldColors.length)];
    robux.style.color = color;
    
    container.appendChild(robux);
    
    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        if (robux.parentNode) {
            robux.parentNode.removeChild(robux);
        }
    }, (duration + delay) * 1000);
}

// Конфетти анимация
function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.style.display = 'block';
    
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            createConfettiPiece(container);
        }, i * 20);
    }
    
    setTimeout(() => {
        container.style.display = 'none';
        container.innerHTML = '';
    }, 5000);
}

function createConfettiPiece(container) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const posX = Math.random() * window.innerWidth;
    const duration = Math.random() * 3 + 2;
    const size = Math.random() * 10 + 5;
    
    confetti.style.left = `${posX}px`;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.animation = `confettiFall ${duration}s linear forwards`;
    
    container.appendChild(confetti);
    
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, duration * 1000);
}

// API функции
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    // Загрузка данных с сервера
    const data = await apiRequest('/data');
    if (data) {
        // Инициализация данных
        window.siteData = data;
        
        // Обновление статистики
        document.getElementById('total-sold').textContent = data.stats?.total_sold?.toLocaleString() || '15,847';
        document.getElementById('happy-clients').textContent = data.stats?.happy_clients?.toLocaleString() || '2,394';
        
        // Рендеринг отзывов
        renderReviews();
        
        // Рендеринг акций
        renderPromotions();
    }
    
    // Инициализация остального функционала...
});

// Обработка покупки с улучшенными анимациями
async function processPurchase(orderData) {
    // Показываем анимации
    createExtendedRobuxRain(orderData.robux);
    createConfetti();
    createFireworks(orderData.robux);
    
    // Отправляем данные на сервер
    const result = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
    
    if (result) {
        // Обновляем локальные данные
        window.siteData.orders.push(result.order);
        window.siteData.stats.total_sold += orderData.robux;
        window.siteData.stats.happy_clients += 1;
        
        // Обновляем UI
        updateStats();
        renderPurchaseHistory();
    }
}