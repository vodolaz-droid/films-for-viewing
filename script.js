// ФИЛЬМЫ ДЛЯ ПРОСМОТРА - ТОЛЬКО ОЦЕНКИ ДРУЗЕЙ (ИСПРАВЛЕННЫЙ)
document.addEventListener('DOMContentLoaded', function() {
    loadFilmsData();
    loadFriendRatings();
    loadFilms();
    updateStats();
});

// БАЗА ФИЛЬМОВ
let films = [
    {
        id: 1,
        title: "Дивергент",
        year: 2014,
        description: "В постапокалиптическом Чикаго общество разделено на пять фракций. Беатрис должна выбрать свою судьбу.",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
        rating: 4.2,
        friendVotes: 8,
        friendRated: false,
        userRating: 0 // НОВОЕ: оценка текущего пользователя
    },
    {
        id: 2,
        title: "Интерстеллар",
        year: 2014,
        description: "Группа исследователей путешествует через червоточину в поисках нового дома для человечества.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop",
        rating: 4.8,
        friendVotes: 12,
        friendRated: false,
        userRating: 0
    },
    {
        id: 3,
        title: "Голодные игры",
        year: 2012,
        description: "Подростки сражаются насмерть в Голодных играх на глазах у всей нации.",
        image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
        rating: 4.3,
        friendVotes: 10,
        friendRated: false,
        userRating: 0
    },
    {
        id: 4,
        title: "Ужасающий",
        year: 2016,
        description: "Молчаливый клоун Арт терроризирует жертв в пустынном городе в ночь Хэллоуина.",
        image: "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=600&fit=crop",
        rating: 0.0,
        friendVotes: 0,
        friendRated: false,
        userRating: 0
    }
];

// ЗАГРУЗКА И ОТОБРАЖЕНИЕ ФИЛЬМОВ
function loadFilms() {
    const container = document.getElementById('films-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // СОРТИРОВКА: сначала фильмы с оценками, потом без
    const sortedFilms = [...films].sort((a, b) => {
        if (a.friendVotes === 0 && b.friendVotes > 0) return 1;
        if (b.friendVotes === 0 && a.friendVotes > 0) return -1;
        return b.rating - a.rating; // По рейтингу внутри групп
    });
    
    sortedFilms.forEach(film => {
        const filmElement = document.createElement('div');
        filmElement.className = 'film-card';
        filmElement.dataset.filmId = film.id;
        
        // Правильное склонение слова "оценок"
        let votesText = '';
        if (film.friendVotes === 0) {
            votesText = 'Нет оценок';
        } else if (film.friendVotes === 1) {
            votesText = '1 оценка';
        } else if (film.friendVotes >= 2 && film.friendVotes <= 4) {
            votesText = `${film.friendVotes} оценки`;
        } else {
            votesText = `${film.friendVotes} оценок`;
        }
        
        // Форматирование рейтинга
        const ratingDisplay = film.friendVotes === 0 ? 'Нет рейтинга' : `${film.rating.toFixed(1)}/5.0`;
        
        filmElement.innerHTML = `
            ${film.image ? `
                <div class="film-poster">
                    <img src="${film.image}" alt="${film.title}" onerror="this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop'">
                    <button class="delete-film-btn" onclick="deleteFilm(${film.id})" title="Удалить фильм">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ''}
            
            <div class="film-header">
                <div class="film-title">
                    <h3>${film.title}</h3>
                    <span class="year">${film.year}</span>
                </div>
                <div class="friend-rating-badge">
                    <i class="fas fa-user-friends"></i>
                    <span>${votesText}</span>
                </div>
            </div>
            
            <p class="film-description">${film.description}</p>
            
            <div class="rating-section">
                <div class="current-rating">
                    <div class="rating-value">
                        <i class="fas fa-star"></i>
                        <strong>${film.friendVotes === 0 ? '-' : film.rating.toFixed(1)}</strong>
                        <span class="rating-max">/5.0</span>
                    </div>
                    <div class="rating-label">
                        Рейтинг друзей
                    </div>
                </div>
                
                <div class="rate-section">
                    <div class="rate-label">Твоя оценка:</div>
                    
                    ${film.friendRated ? `
                        <div class="user-rating-display">
                            <div class="user-stars">
                                ${generateUserStars(film.userRating)}
                            </div>
                            <div class="rating-info-text">
                                <i class="fas fa-check-circle"></i>
                                <span>Ты поставил ${film.userRating} ${getStarWord(film.userRating)}</span>
                            </div>
                        </div>
                    ` : `
                        <div class="stars" data-film-id="${film.id}">
                            ${generateStars(film.rating, film.friendRated)}
                        </div>
                    `}
                </div>
            </div>
        `;
        container.appendChild(filmElement);
    });
    
    // Назначаем обработчики звёздам
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;
            
            const filmId = parseInt(this.parentElement.dataset.filmId);
            const rating = parseInt(this.dataset.value);
            addFriendRating(filmId, rating);
        });
    });
}

// СОЗДАНИЕ ЗВЁЗД ДЛЯ ОЦЕНКИ
function generateStars(rating, friendRated) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const canClick = friendRated ? 'disabled' : 'clickable';
        starsHTML += `<i class="fas fa-star star ${canClick}" data-value="${i}"></i>`;
    }
    return starsHTML;
}

// СОЗДАНИЕ ЗВЁЗД ДЛЯ ОТОБРАЖЕНИЯ ОЦЕНКИ ПОЛЬЗОВАТЕЛЯ
function generateUserStars(userRating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= userRating;
        starsHTML += `<i class="fas fa-star ${isActive ? 'user-star-active' : 'user-star-inactive'}" data-value="${i}"></i>`;
    }
    return starsHTML;
}

// ПОЛУЧИТЬ ПРАВИЛЬНОЕ СЛОВО ДЛЯ ЗВЁЗД
function getStarWord(rating) {
    if (rating === 1) return 'звезду';
    if (rating >= 2 && rating <= 4) return 'звезды';
    return 'звезд';
}

// ДОБАВЛЕНИЕ ОЦЕНКИ ДРУГА
function addFriendRating(filmId, rating) {
    const film = films.find(f => f.id === filmId);
    if (!film || film.friendRated) return;
    
    // Сохраняем оценку пользователя
    film.userRating = rating;
    
    // Симулируем оценку нескольких друзей
    const friendCount = Math.floor(Math.random() * 3) + 2; // 2-4 друга
    
    // Обновляем общий рейтинг фильма
    const totalScore = film.rating * film.friendVotes;
    film.friendVotes += friendCount;
    film.rating = (totalScore + (rating * 1.5)) / film.friendVotes; // Увеличиваем вес оценки пользователя
    film.friendRated = true;
    
    // Сохраняем в localStorage
    saveFriendRating(filmId, rating);
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    saveFilms();
}

// УДАЛЕНИЕ ФИЛЬМА
function deleteFilm(filmId) {
    if (!confirm('Удалить этот фильм из каталога?')) return;
    
    // Находим индекс фильма
    const filmIndex = films.findIndex(f => f.id === filmId);
    if (filmIndex === -1) return;
    
    const filmTitle = films[filmIndex].title;
    
    // Удаляем фильм из массива
    films.splice(filmIndex, 1);
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    saveFilms();
    
    // Уведомление
    alert(`Фильм "${filmTitle}" удалён из каталога`);
}

// СОХРАНЕНИЕ ОЦЕНКИ ДРУГА
function saveFriendRating(filmId, rating) {
    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
    userRatings[filmId] = rating;
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
    
    const ratedFilms = JSON.parse(localStorage.getItem('friendRatedFilms') || '[]');
    if (!ratedFilms.includes(filmId)) {
        ratedFilms.push(filmId);
        localStorage.setItem('friendRatedFilms', JSON.stringify(ratedFilms));
    }
}

// ЗАГРУЗКА ОЦЕНОК ДРУЗЕЙ
function loadFriendRatings() {
    const ratedFilms = JSON.parse(localStorage.getItem('friendRatedFilms') || '[]');
    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
    
    films.forEach(film => {
        film.friendRated = ratedFilms.includes(film.id);
        film.userRating = userRatings[film.id] || 0;
    });
}

// ДОБАВЛЕНИЕ НОВОГО ФИЛЬМА
function addFilm() {
    const title = document.getElementById('film-title').value.trim();
    const year = document.getElementById('film-year').value;
    const image = document.getElementById('film-image').value.trim();
    const description = document.getElementById('film-description').value.trim();
    
    // Валидация
    if (!title || !description || !year) {
        alert('Заполните название, год и описание фильма!');
        return;
    }
    
    if (year < 1900 || year > 2030) {
        alert('Введите корректный год выпуска (1900-2030)');
        return;
    }
    
    if (films.some(f => f.title.toLowerCase() === title.toLowerCase())) {
        alert('Этот фильм уже есть в каталоге!');
        return;
    }
    
    // Проверка ссылки на изображение
    let finalImage = image;
    if (image && !image.startsWith('http')) {
        finalImage = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop';
    }
    
    // Создание нового фильма
    const newFilm = {
        id: films.length > 0 ? Math.max(...films.map(f => f.id)) + 1 : 1,
        title: title,
        year: parseInt(year),
        description: description,
        image: finalImage || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop',
        rating: 0.0,
        friendVotes: 0,
        friendRated: false,
        userRating: 0
    };
    
    films.push(newFilm);
    
    // Очистка формы
    document.getElementById('film-title').value = '';
    document.getElementById('film-year').value = '';
    document.getElementById('film-image').value = '';
    document.getElementById('film-description').value = '';
    
    // Обновление интерфейса
    loadFilms();
    updateStats();
    saveFilms();
    
    // Анимация кнопки
    const btn = document.querySelector('.add-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Фильм добавлен!';
    btn.style.background = '#00b09b';
    
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
    }, 1500);
}

// СТАТИСТИКА
function updateStats() {
    const stats = document.getElementById('stats');
    if (!stats) return;
    
    const totalFilms = films.length;
    const ratedFilms = films.filter(f => f.friendVotes > 0).length;
    const totalVotes = films.reduce((sum, f) => sum + f.friendVotes, 0);
    const avgRating = ratedFilms > 0 
        ? (films.filter(f => f.friendVotes > 0).reduce((sum, f) => sum + f.rating, 0) / ratedFilms).toFixed(1)
        : 0.0;
    
    stats.innerHTML = `
        <span><i class="fas fa-film"></i> Фильмов: ${totalFilms}</span> •
        <span><i class="fas fa-star"></i> Средний: ${avgRating}</span> •
        <span><i class="fas fa-user-friends"></i> Оценок: ${totalVotes}</span>
    `;
}

// СОХРАНЕНИЕ В LOCALSTORAGE
function saveFilms() {
    localStorage.setItem('filmsData', JSON.stringify(films));
}

// ЗАГРУЗКА ИЗ LOCALSTORAGE
function loadFilmsData() {
    const saved = localStorage.getItem('filmsData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                films = parsed;
            }
        } catch (e) {
            console.error('Ошибка загрузки:', e);
        }
    }
}
