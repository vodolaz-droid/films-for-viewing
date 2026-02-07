// ФИЛЬМЫ ДЛЯ ПРОСМОТРА - ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
function initApp() {
    // Загружаем фильмы из localStorage
    loadFilmsData();
    
    // Если фильмов нет в localStorage - начинаем с чистого листа
    if (films.length === 0) {
        films = []; // Пустой массив
        saveFilms(); // Сохраняем пустой массив
    }
    
    // Загружаем оценки пользователей
    loadUserRatings();
    
    // Загружаем фильмы на страницу
    loadFilms();
    
    // Обновляем статистику
    updateStats();
    
    // Добавляем обработчик для кнопки добавления фильма
    const addButton = document.getElementById('add-film-btn');
    if (addButton) {
        addButton.addEventListener('click', addFilm);
    }
}

// БАЗА ФИЛЬМОВ (ПУСТАЯ)
let films = [];

// ЗАГРУЗКА И ОТОБРАЖЕНИЕ ФИЛЬМОВ
function loadFilms() {
    const container = document.getElementById('films-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Если фильмов нет - показываем сообщение
    if (films.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <h3>Каталог пуст</h3>
                <p>Добавьте первый фильм, нажав кнопку ниже</p>
            </div>
        `;
        return;
    }
    
    // Сортируем фильмы: с оценками вверху
    const sortedFilms = [...films].sort((a, b) => {
        if (a.votes === 0 && b.votes > 0) return 1;
        if (b.votes === 0 && a.votes > 0) return -1;
        return b.rating - a.rating;
    });
    
    sortedFilms.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.className = 'film-card';
        filmCard.setAttribute('data-film-id', film.id);
        
        filmCard.innerHTML = `
            <div class="film-poster">
                <img src="${film.image}" alt="${film.title}" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop'">
                <button class="delete-btn" data-film-id="${film.id}" title="Удалить фильм">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="film-info">
                <div class="film-header">
                    <div class="film-title">
                        <h3>${film.title}</h3>
                        <span class="film-year">${film.year}</span>
                    </div>
                    <div class="film-rating-badge">
                        <i class="fas fa-user-friends"></i>
                        <span>${getVotesText(film.votes)}</span>
                    </div>
                </div>
                
                <p class="film-description">${film.description}</p>
                
                <div class="film-rating">
                    <div class="rating-display">
                        <div class="rating-value">
                            <i class="fas fa-star"></i>
                            <span class="rating-number">${film.votes > 0 ? film.rating.toFixed(1) : '—'}</span>
                            <span>/5.0</span>
                        </div>
                        <div class="rating-label">
                            Рейтинг друзей
                        </div>
                    </div>
                    
                    <div class="user-rating">
                        <div class="rate-label">Твоя оценка:</div>
                        
                        ${film.userRated ? `
                            <div class="already-rated">
                                <i class="fas fa-check-circle"></i>
                                <span>Ты поставил ${film.userRating} ${getStarWord(film.userRating)}</span>
                            </div>
                        ` : `
                            <div class="stars-container">
                                ${generateStars(film.userRating, film.userRated)}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(filmCard);
    });
    
    // Добавляем обработчики кликов на звёзды
    document.querySelectorAll('.star.clickable').forEach(star => {
        star.addEventListener('click', function() {
            const filmCard = this.closest('.film-card');
            const filmId = parseInt(filmCard.getAttribute('data-film-id'));
            const rating = parseInt(this.getAttribute('data-value'));
            rateFilm(filmId, rating);
        });
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const filmId = parseInt(this.getAttribute('data-film-id'));
            deleteFilm(filmId);
        });
    });
}

// СОЗДАНИЕ ЗВЁЗД
function generateStars(userRating, userRated) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= userRating;
        const canClick = userRated ? 'disabled' : 'clickable';
        const activeClass = isActive ? 'active' : '';
        starsHTML += `<i class="fas fa-star star ${canClick} ${activeClass}" data-value="${i}"></i>`;
    }
    return starsHTML;
}

// ПОЛУЧИТЬ ТЕКСТ ДЛЯ КОЛИЧЕСТВА ОЦЕНОК
function getVotesText(votes) {
    if (votes === 0) return 'Нет оценок';
    if (votes === 1) return '1 оценка';
    if (votes >= 2 && votes <= 4) return `${votes} оценки`;
    return `${votes} оценок`;
}

// ПОЛУЧИТЬ ПРАВИЛЬНОЕ СЛОВО ДЛЯ ЗВЁЗД
function getStarWord(rating) {
    if (rating === 1) return 'звезду';
    if (rating >= 2 && rating <= 4) return 'звезды';
    return 'звезд';
}

// ОЦЕНИТЬ ФИЛЬМ
function rateFilm(filmId, rating) {
    const film = films.find(f => f.id === filmId);
    if (!film || film.userRated) return;
    
    // Сохраняем оценку пользователя
    film.userRating = rating;
    film.userRated = true;
    
    // Добавляем оценку к общему рейтингу
    const totalScore = film.rating * film.votes;
    film.votes++;
    film.rating = (totalScore + rating) / film.votes;
    
    // Сохраняем в localStorage
    saveUserRating(filmId, rating);
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    saveFilms(); // Сохраняем изменения
    
    // Уведомление
    showNotification(`Вы поставили ${rating} ${getStarWord(rating)} фильму "${film.title}"`);
}

// УДАЛИТЬ ФИЛЬМ
function deleteFilm(filmId) {
    if (!confirm('Удалить этот фильм из каталога?')) return;
    
    const filmIndex = films.findIndex(f => f.id === filmId);
    if (filmIndex === -1) return;
    
    const filmTitle = films[filmIndex].title;
    
    // Удаляем фильм из массива
    films.splice(filmIndex, 1);
    
    // ВАЖНО: Сохраняем изменения сразу!
    saveFilms();
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    
    showNotification(`Фильм "${filmTitle}" удалён`);
}

// ДОБАВИТЬ НОВЫЙ ФИЛЬМ
function addFilm() {
    const title = document.getElementById('film-title').value.trim();
    const year = document.getElementById('film-year').value;
    const image = document.getElementById('film-image').value.trim();
    const description = document.getElementById('film-description').value.trim();
    
    // Проверка данных
    if (!title || !description || !year) {
        showNotification('Заполните все обязательные поля!', 'error');
        return;
    }
    
    if (year < 1900 || year > 2030) {
        showNotification('Введите корректный год выпуска (1900-2030)', 'error');
        return;
    }
    
    if (films.some(f => f.title.toLowerCase() === title.toLowerCase())) {
        showNotification('Этот фильм уже есть в каталоге!', 'error');
        return;
    }
    
    // Проверка изображения
    let finalImage = image;
    if (image && !image.startsWith('http')) {
        showNotification('Используется стандартное изображение', 'info');
        finalImage = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop';
    }
    
    // Создаём новый фильм
    const newFilm = {
        id: films.length > 0 ? Math.max(...films.map(f => f.id)) + 1 : 1,
        title: title,
        year: parseInt(year),
        description: description,
        image: finalImage || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop',
        rating: 0,
        votes: 0,
        userRated: false,
        userRating: 0
    };
    
    films.push(newFilm);
    
    // Очищаем форму
    document.getElementById('film-title').value = '';
    document.getElementById('film-year').value = '';
    document.getElementById('film-image').value = '';
    document.getElementById('film-description').value = '';
    
    // Сохраняем изменения
    saveFilms();
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    
    // Анимация кнопки
    const btn = document.getElementById('add-film-btn');
    const originalHTML = btn.innerHTML;
    const originalBg = btn.style.background;
    
    btn.innerHTML = '<i class="fas fa-check"></i> Фильм добавлен!';
    btn.style.background = '#00b09b';
    
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = originalBg;
    }, 1500);
    
    showNotification(`Фильм "${title}" добавлен в каталог`);
}

// ОБНОВИТЬ СТАТИСТИКУ
function updateStats() {
    const totalFilms = films.length;
    const ratedFilms = films.filter(f => f.votes > 0).length;
    const totalVotes = films.reduce((sum, f) => sum + f.votes, 0);
    const avgRating = ratedFilms > 0 
        ? (films.filter(f => f.votes > 0).reduce((sum, f) => sum + f.rating, 0) / ratedFilms).toFixed(1)
        : '0.0';
    
    document.getElementById('total-films').textContent = totalFilms;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('total-votes').textContent = totalVotes;
}

// СОХРАНИТЬ ОЦЕНКУ ПОЛЬЗОВАТЕЛЯ
function saveUserRating(filmId, rating) {
    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
    userRatings[filmId] = rating;
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
    
    const ratedFilms = JSON.parse(localStorage.getItem('ratedFilms') || '[]');
    if (!ratedFilms.includes(filmId)) {
        ratedFilms.push(filmId);
        localStorage.setItem('ratedFilms', JSON.stringify(ratedFilms));
    }
}

// ЗАГРУЗИТЬ ОЦЕНКИ ПОЛЬЗОВАТЕЛЯ
function loadUserRatings() {
    const ratedFilms = JSON.parse(localStorage.getItem('ratedFilms') || '[]');
    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
    
    films.forEach(film => {
        film.userRated = ratedFilms.includes(film.id);
        film.userRating = userRatings[film.id] || 0;
    });
}

// СОХРАНИТЬ ФИЛЬМЫ
function saveFilms() {
    localStorage.setItem('filmsData', JSON.stringify(films));
}

// ЗАГРУЗИТЬ ФИЛЬМЫ
function loadFilmsData() {
    const saved = localStorage.getItem('filmsData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                films = parsed;
            }
        } catch (e) {
            console.log('Ошибка загрузки фильмов, начинаем с чистого листа');
            films = [];
        }
    }
}

// ПОКАЗАТЬ УВЕДОМЛЕНИЕ
function showNotification(message, type = 'success') {
    // Удаляем старое уведомление
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Создаём новое уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icon = type === 'success' ? 'check-circle' : 
                type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 176, 155, 0.95)' : 
                    type === 'error' ? 'rgba(255, 50, 50, 0.95)' : 'rgba(41, 128, 185, 0.95)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: notificationSlideIn 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        border: 1px solid ${type === 'success' ? 'rgba(0, 176, 155, 0.3)' : 
                     type === 'error' ? 'rgba(255, 50, 50, 0.3)' : 'rgba(41, 128, 185, 0.3)'};
    `;
    
    document.body.appendChild(notification);
    
    // Добавляем стили для анимации
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes notificationSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes notificationSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'notificationSlideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}
