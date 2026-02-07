// ФИЛЬМЫ ДЛЯ ПРОСМОТРА - ПРОСТАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
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
        rating: 4.2,
        votes: 42,
        userRated: false
    },
    {
        id: 2,
        title: "Интерстеллар",
        year: 2014,
        description: "Группа исследователей путешествует через червоточину в поисках нового дома для человечества.",
        rating: 4.8,
        votes: 56,
        userRated: false
    },
    {
        id: 3,
        title: "Голодные игры",
        year: 2012,
        description: "Подростки сражаются насмерть в Голодных играх на глазах у всей нации.",
        rating: 4.3,
        votes: 51,
        userRated: false
    }
];

// ЗАГРУЗКА ФИЛЬМОВ
function loadFilms() {
    const container = document.getElementById('films-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    films.forEach(film => {
        const filmElement = document.createElement('div');
        filmElement.className = 'film-card';
        filmElement.innerHTML = `
            <div class="film-title">
                <span>${film.title}</span>
                <span class="year">${film.year}</span>
            </div>
            <p class="film-description">${film.description}</p>
            <div class="rating">
                <div class="stars" data-film-id="${film.id}">
                    ${generateStars(film.rating, film.userRated)}
                </div>
                <div class="rating-info">
                    <span>Рейтинг: <strong>${film.rating.toFixed(1)}</strong>/5.0</span>
                    <span>Оценок: ${film.votes}</span>
                    ${film.userRated ? '<span style="color:#00b09b;margin-left:10px;">✓ Ваша оценка</span>' : ''}
                </div>
            </div>
        `;
        container.appendChild(filmElement);
    });
    
    // Клики по звёздам
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;
            
            const filmId = parseInt(this.parentElement.dataset.filmId);
            const rating = parseInt(this.dataset.value);
            rateFilm(filmId, rating);
        });
    });
}

// СОЗДАНИЕ ЗВЁЗД
function generateStars(rating, userRated) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= Math.round(rating);
        const canClick = userRated ? 'disabled' : 'clickable';
        starsHTML += `<i class="fas fa-star star ${isActive ? 'active' : ''} ${canClick}" data-value="${i}"></i>`;
    }
    return starsHTML;
}

// ОЦЕНКА ФИЛЬМА
function rateFilm(filmId, rating) {
    const film = films.find(f => f.id === filmId);
    if (!film || film.userRated) return;
    
    // Обновляем рейтинг
    const totalScore = film.rating * film.votes;
    film.votes++;
    film.rating = (totalScore + rating) / film.votes;
    film.userRated = true;
    
    // Сохраняем в localStorage
    saveUserRating(filmId);
    
    // Обновляем страницу
    loadFilms();
    updateStats();
    saveFilms();
    
    // Показываем сообщение
    alert(`Вы поставили ${rating} ${rating === 1 ? 'звезду' : rating <= 4 ? 'звезды' : 'звезд'} фильму "${film.title}"`);
}

// СОХРАНЕНИЕ ОЦЕНКИ
function saveUserRating(filmId) {
    const rated = JSON.parse(localStorage.getItem('ratedFilms') || '[]');
    if (!rated.includes(filmId)) {
        rated.push(filmId);
        localStorage.setItem('ratedFilms', JSON.stringify(rated));
    }
}

// ЗАГРУЗКА ОЦЕНОК
function loadUserRatings() {
    const rated = JSON.parse(localStorage.getItem('ratedFilms') || '[]');
    films.forEach(film => {
        film.userRated = rated.includes(film.id);
    });
}

// СТАТИСТИКА
function updateStats() {
    const stats = document.getElementById('stats');
    if (!stats) return;
    
    const total = films.length;
    const avg = total > 0 ? (films.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : 0;
    const votes = films.reduce((s, f) => s + f.votes, 0);
    
    stats.innerHTML = `
        <span><i class="fas fa-film"></i> Фильмов: ${total}</span> •
        <span><i class="fas fa-star"></i> Средний: ${avg}</span> •
        <span><i class="fas fa-vote-yea"></i> Оценок: ${votes}</span>
    `;
}

// СОХРАНЕНИЕ ФИЛЬМОВ
function saveFilms() {
    localStorage.setItem('filmsData', JSON.stringify(films));
}

// ЗАГРУЗКА ФИЛЬМОВ
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

// ДОБАВЛЕНИЕ ФИЛЬМА
function addFilm() {
    const title = document.getElementById('film-title').value.trim();
    const desc = document.getElementById('film-description').value.trim();
    
    if (!title || !desc) {
        alert('Введите название и описание!');
        return;
    }
    
    if (films.some(f => f.title.toLowerCase() === title.toLowerCase())) {
        alert('Такой фильм уже есть!');
        return;
    }
    
    const newFilm = {
        id: films.length + 1,
        title: title,
        year: new Date().getFullYear(),
        description: desc,
        rating: 0,
        votes: 0,
        userRated: false
    };
    
    films.push(newFilm);
    
    document.getElementById('film-title').value = '';
    document.getElementById('film-description').value = '';
    
    loadFilms();
    updateStats();
    saveFilms();
    
    const btn = document.querySelector('.add-btn');
    btn.textContent = '✓ Добавлено!';
    btn.style.background = '#00b09b';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-plus"></i> Добавить в список';
        btn.style.background = '';
    }, 1500);
}

// ИНИЦИАЛИЗАЦИЯ
loadFilmsData();
loadUserRatings();

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
    .star {
        font-size: 1.8rem;
        color: #444;
        transition: all 0.2s;
    }
    
    .star.active {
        color: gold;
    }
    
    .star.clickable {
        cursor: pointer;
    }
    
    .star.clickable:hover {
        color: gold;
        transform: scale(1.2);
    }
    
    .star.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);
