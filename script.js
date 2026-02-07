// ФИЛЬМЫ ДЛЯ ПРОСМОТРА - ТОЛЬКО ОЦЕНКИ ДРУЗЕЙ
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
        friendRated: false
    },
    {
        id: 2,
        title: "Интерстеллар",
        year: 2014,
        description: "Группа исследователей путешествует через червоточину в поисках нового дома для человечества.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop",
        rating: 4.8,
        friendVotes: 12,
        friendRated: false
    },
    {
        id: 3,
        title: "Голодные игры",
        year: 2012,
        description: "Подростки сражаются насмерть в Голодных играх на глазах у всей нации.",
        image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
        rating: 4.3,
        friendVotes: 10,
        friendRated: false
    },
    {
        id: 4,
        title: "Ужасающий",
        year: 2016,
        description: "Молчаливый клоун Арт терроризирует жертв в пустынном городе в ночь Хэллоуина.",
        image: "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=600&fit=crop",
        rating: 0.0,
        friendVotes: 0,
        friendRated: false
    }
];

// ЗАГРУЗКА И ОТОБРАЖЕНИЕ ФИЛЬМОВ
function loadFilms() {
    const container = document.getElementById('films-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Сортируем по рейтингу (самые высокие сначала)
    const sortedFilms = [...films].sort((a, b) => b.rating - a.rating);
    
    sortedFilms.forEach(film => {
        const filmElement = document.createElement('div');
        filmElement.className = 'film-card';
        filmElement.innerHTML = `
            ${film.image ? `
                <div class="film-poster">
                    <img src="${film.image}" alt="${film.title}" onerror="this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop'">
                </div>
            ` : ''}
            
            <div class="film-header">
                <div class="film-title">
                    <h3>${film.title}</h3>
                    <span class="year">${film.year}</span>
                </div>
                <div class="friend-rating-badge">
                    <i class="fas fa-user-friends"></i>
                    <span>${film.friendVotes} ${getVotesWord(film.friendVotes)}</span>
                </div>
            </div>
            
            <p class="film-description">${film.description}</p>
            
            <div class="rating-section">
                <div class="current-rating">
                    <div class="rating-value">
                        <i class="fas fa-star"></i>
                        <strong>${film.rating.toFixed(1)}</strong>/5.0
                    </div>
                    <div class="rating-label">
                        Рейтинг друзей
                    </div>
                </div>
                
                <div class="rate-section">
                    <div class="rate-label">Твоя оценка:</div>
                    <div class="stars" data-film-id="${film.id}">
                        ${generateStars(film.rating, film.friendRated)}
                    </div>
                    ${film.friendRated ? '<div class="already-rated">✓ Ты уже оценил</div>' : ''}
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

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ СЛОВА "ОЦЕНОК"
function getVotesWord(votes) {
    if (votes === 1) return 'оценка';
    if (votes >= 2 && votes <= 4) return 'оценки';
    return 'оценок';
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

// ДОБАВЛЕНИЕ ОЦЕНКИ ДРУГА
function addFriendRating(filmId, rating) {
    const film = films.find(f => f.id === filmId);
    if (!film || film.friendRated) return;
    
    // Симулируем оценку нескольких друзей (для демо)
    // В реальном приложении здесь был бы запрос на сервер
    const friendCount = Math.floor(Math.random() * 3) + 1; // 1-3 друга
    
    // Обновляем рейтинг фильма
    const totalScore = film.rating * film.friendVotes;
    film.friendVotes += friendCount;
    film.rating = (totalScore + rating) / film.friendVotes;
    film.friendRated = true;
    
    // Сохраняем в localStorage
    saveFriendRating(filmId);
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    saveFilms();
    
    // Показываем уведомление
    showRatingNotification(film.title, rating);
}

// ПОКАЗАТЬ УВЕДОМЛЕНИЕ
function showRatingNotification(title, rating) {
    const messages = [
        `Ты поставил ${rating} звёзд фильму "${title}"`,
        `Оценка ${rating}/5 для "${title}" сохранена!`,
        `Фильм "${title}" получил твою оценку: ${rating} ⭐`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMessage);
}

// СОХРАНЕНИЕ ОЦЕНКИ ДРУГА
function saveFriendRating(filmId) {
    const ratedFilms = JSON.parse(localStorage.getItem('friendRatedFilms') || '[]');
    if (!ratedFilms.includes(filmId)) {
        ratedFilms.push(filmId);
        localStorage.setItem('friendRatedFilms', JSON.stringify(ratedFilms));
    }
}

// ЗАГРУЗКА ОЦЕНОК ДРУЗЕЙ
function loadFriendRatings() {
    const ratedFilms = JSON.parse(localStorage.getItem('friendRatedFilms') || '[]');
    films.forEach(film => {
        film.friendRated = ratedFilms.includes(film.id);
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
    
    // Создание нового фильма (изначально без оценок)
    const newFilm = {
        id: films.length > 0 ? Math.max(...films.map(f => f.id)) + 1 : 1,
        title: title,
        year: parseInt(year),
        description: description,
        image: finalImage || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop',
        rating: 0.0,
        friendVotes: 0,
        friendRated: false
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
    const avgRating = totalFilms > 0 
        ? (films.reduce((sum, f) => sum + f.rating, 0) / totalFilms).toFixed(1)
        : 0.0;
    
    stats.innerHTML = `
        <span><i class="fas fa-film"></i> Фильмов: ${totalFilms}</span> •
        <span><i class="fas fa-star"></i> Средний: ${avgRating}</span> •
        <span><i class="fas fa-user-friends"></i> Оценок друзей: ${totalVotes}</span>
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
