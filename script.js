// ФИЛЬМЫ ДЛЯ ПРОСМОТРА
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
        votes: 42
    },
    {
        id: 2,
        title: "Интерстеллар",
        year: 2014,
        description: "Группа исследователей путешествует через червоточину в поисках нового дома для человечества.",
        rating: 4.8,
        votes: 56
    },
    {
        id: 3,
        title: "Голодные игры",
        year: 2012,
        description: "Подростки сражаются насмерть в Голодных играх на глазах у всей нации.",
        rating: 4.3,
        votes: 51
    }
];

// ЗАГРУЗКА ФИЛЬМОВ
function loadFilms() {
    const container = document.getElementById('films-container');
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
                    ${generateStars(film.rating)}
                </div>
                <div class="rating-info">
                    <span>Рейтинг: <strong>${film.rating.toFixed(1)}</strong>/5.0</span>
                    <span>Оценок: ${film.votes}</span>
                </div>
            </div>
        `;
        container.appendChild(filmElement);
    });
    
    // Обработчики для звёзд
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const filmId = parseInt(this.parentElement.dataset.filmId);
            const rating = parseInt(this.dataset.value);
            rateFilm(filmId, rating);
        });
    });
}

// ГЕНЕРАЦИЯ ЗВЁЗД
function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= Math.round(rating);
        starsHTML += <i class="fas fa-star star ${isActive ? 'active' : ''}" data-value="${i}"></i>;
    }
    return starsHTML;
}

// ОЦЕНКА ФИЛЬМА
function rateFilm(filmId, rating) {
    const film = films.find(f => f.id === filmId);
    if (!film) return;
    
    const totalScore = film.rating * film.votes;
    film.votes++;
    film.rating = (totalScore + rating) / film.votes;
    
    loadFilms();
    updateStats();
    saveToLocalStorage();
}

// ДОБАВЛЕНИЕ ФИЛЬМА
function addFilm() {
    const titleInput = document.getElementById('film-title');
    const descInput = document.getElementById('film-description');
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    
    if (!title || !description) {
        alert('Введите название и описание фильма!');
        return;
    }
    
    // Проверка на дубликат
    if (films.some(f => f.title.toLowerCase() === title.toLowerCase())) {
        alert('Такой фильм уже есть!');
        return;
    }
    
    // Новый фильм
    const newFilm = {
        id: films.length + 1,
        title: title,
        year: new Date().getFullYear(),
        description: description,
        rating: 0,
        votes: 0
    };
    
    films.push(newFilm);
    
    // Очистка полей
    titleInput.value = '';
    descInput.value = '';
    
    // Обновление
    loadFilms();
    updateStats();
    saveToLocalStorage();
    
    // Анимация
    const btn = document.querySelector('.add-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> Добавлено!';
    btn.style.background = 'linear-gradient(90deg, #00b09b, #96c93d)';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-plus"></i> Добавить в список';
        btn.style.
            background = 'linear-gradient(90deg, #8a2be2, #6a11cb)';
    }, 1500);
}

// СТАТИСТИКА
function updateStats() {
    const stats = document.getElementById('stats');
    const total = films.length;
    const avg = (films.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1);
    const votes = films.reduce((sum, f) => sum + f.votes, 0);
    
    stats.innerHTML = `
        <span><i class="fas fa-film"></i> Фильмов: ${total}</span> •
        <span><i class="fas fa-star"></i> Средний: ${avg}</span> •
        <span><i class="fas fa-vote-yea"></i> Оценок: ${votes}</span>
    `;
}

// СОХРАНЕНИЕ
function saveToLocalStorage() {
    localStorage.setItem('films', JSON.stringify(films));
}

// ЗАГРУЗКА
function loadFromLocalStorage() {
    const saved = localStorage.getItem('films');
    if (saved) {
        films = JSON.parse(saved);
    }
}

// ИНИЦИАЛИЗАЦИЯ
loadFromLocalStorage();
