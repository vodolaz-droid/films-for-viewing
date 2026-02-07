// ФИЛЬМЫ ДЛЯ ПРОСМОТРА
document.addEventListener('DOMContentLoaded', function() {
    loadFilmsData();
    loadUserRatings();
    loadFilms();
    updateStats();
});

// БАЗА ФИЛЬМОВ
let films = [
    {
        id: 1,
        title: "Дивергент",
        year: 2014,
        description: "В постапокалиптическом Чикаго общество разделено на пять фракций. Беатрис должна выбрать свою судьбу, но оказывается, что она не вписывается ни в одну группу — она Дивергент.",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
        rating: 4.2,
        votes: 45,
        userRated: false,
        userRating: 0
    },
    {
        id: 2,
        title: "Интерстеллар",
        year: 2014,
        description: "Группа исследователей путешествует через червоточину в космосе в поисках нового дома для человечества.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop",
        rating: 4.8,
        votes: 56,
        userRated: false,
        userRating: 0
    },
    {
        id: 3,
        title: "Голодные игры",
        year: 2012,
        description: "Подростки сражаются насмерть в Голодных играх на глазах у всей нации.",
        image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
        rating: 4.3,
        votes: 51,
        userRated: false,
        userRating: 0
    },
    {
        id: 4,
        title: "Ужасающий",
        year: 2016,
        description: "Молчаливый клоун Арт терроризирует жертв в пустынном городе в ночь Хэллоуина.",
        image: "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=600&fit=crop",
        rating: 0.0,
        votes: 0,
        userRated: false,
        userRating: 0
    }
];

// ЗАГРУЗКА ФИЛЬМОВ
function loadFilms() {
    const container = document.getElementById('films-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    films.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.className = 'film-card';
        filmCard.innerHTML = `
            <div class="film-poster">
                <img src="${film.image}" alt="${film.title}" 
                     onerror="this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop'">
                <button class="delete-btn" onclick="deleteFilm(${film.id})" title="Удалить фильм">
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
                            <div class="stars-container" data-film-id="${film.id}">
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
            const filmId = parseInt(this.parentElement.dataset.filmId);
            const rating = parseInt(this.dataset.value);
            rateFilm(filmId, rating);
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
    saveFilms();
    
    // Уведомление
    showNotification(`Вы поставили ${rating} ${getStarWord(rating)} фильму "${film.title}"`);
}

// УДАЛИТЬ ФИЛЬМ
function deleteFilm(filmId) {
    if (!confirm('Удалить этот фильм из каталога?')) return;
    
    const filmIndex = films.findIndex(f => f.id === filmId);
    if (filmIndex === -1) return;
    
    const filmTitle = films[filmIndex].title;
    films.splice(filmIndex, 1);
    
    loadFilms();
    updateStats();
    saveFilms();
    
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
        showNotification('Введите корректный год выпуска', 'error');
        return;
    }
    
    if (films.some(f => f.title.toLowerCase() === title.toLowerCase())) {
        showNotification('Этот фильм уже есть в каталоге!', 'error');
        return;
    }
    
    // Проверка изображения
    let finalImage = image;
    if (image && !image.startsWith('http')) {
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
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    saveFilms();
    
    // Анимация кнопки
    const btn = document.querySelector('.add-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> Фильм добавлен!';
    btn.style.background = '#00b09b';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-plus"></i> Добавить фильм';
        btn.style.background = '';
    }, 1500);
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
            console.error('Ошибка загрузки фильмов:', e);
        }
    }
}

// ПОКАЗАТЬ УВЕДОМЛЕНИЕ
function showNotification(message, type = 'success') {
    // Создаём уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 176, 155, 0.9)' : 'rgba(255, 50, 50, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для анимации уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);
