// ФИЛЬМЫ ДЛЯ ПРОСМОТРА - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadFilms();
    updateStats();
});

// БАЗА ФИЛЬМОВ (можно менять и добавлять!)
let films = [
    {
        id: 1,
        title: "Дивергент",
        year: 2014,
        description: "В постапокалиптическом Чикаго общество разделено на пять фракций. Беатрис должна выбрать свою судьбу, но оказывается, что она не вписывается ни в одну группу — она Дивергент.",
        rating: 4.2,
        votes: 42
    },
    {
        id: 2,
        title: "Интерстеллар",
        year: 2014,
        description: "Группа исследователей путешествует через червоточину в космосе в поисках нового дома для человечества.",
        rating: 4.8,
        votes: 56
    },
    {
        id: 3,
        title: "Начало",
        year: 2010,
        description: "Вор, который крадет секреты через сны, получает задание внедрить идею в подсознание цели.",
        rating: 4.5,
        votes: 38
    },
    {
        id: 4,
        title: "Паразиты",
        year: 2019,
        description: "Бедная семья хитростью устраивается на работу к богатым, но их ждут неожиданные повороты судьбы.",
        rating: 4.7,
        votes: 47
    }
];

// ЗАГРУЗКА ФИЛЬМОВ НА СТРАНИЦУ
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
                    ${generateStars(film.id, film.rating)}
                </div>
                <div class="rating-info">
                    <span>Рейтинг: <strong>${film.rating.toFixed(1)}</strong>/5.0</span>
                    <span>Оценок: ${film.votes}</span>
                </div>
            </div>
        `;
        container.appendChild(filmElement);
    });
    
    // Добавляем обработчики для звёзд
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const filmId = parseInt(this.parentElement.dataset.filmId);
            const rating = parseInt(this.dataset.value);
            rateFilm(filmId, rating);
        });
    });
}

// ГЕНЕРАЦИЯ ЗВЁЗД РЕЙТИНГА
function generateStars(filmId, currentRating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= Math.round(currentRating);
        starsHTML += `<i class="fas fa-star star ${isActive ? 'active' : ''}" data-value="${i}"></i>`;
    }
    return starsHTML;
}

// ОЦЕНКА ФИЛЬМА
function rateFilm(filmId, rating) {
    const film = films.find(f => f.id === filmId);
    if (!film) return;
    
    // Пересчитываем рейтинг
    const totalScore = film.rating * film.votes;
    film.votes++;
    film.rating = (totalScore + rating) / film.votes;
    
    // Обновляем отображение
    loadFilms();
    updateStats();
    
    // Сохраняем в localStorage (чтобы оценки не сбрасывались)
    saveToLocalStorage();
    
    // Анимация
    const stars = document.querySelector(`[data-film-id="${filmId}"]`);
    stars.classList.add('pulse');
    setTimeout(() => stars.classList.remove('pulse'), 300);
}

// ДОБАВЛЕНИЕ НОВОГО ФИЛЬМА
function addFilm() {
    const titleInput = document.getElementById('film-title');
    const descInput = document.getElementById('film-description');
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    
    if (!title || !description) {
        alert('Введите название и описание фильма!');
        return;
    }
    
    // Создаём новый фильм
    const newFilm = {
        id: films.length + 1,
        title: title,
        year: new Date().getFullYear(),
        description: description,
        rating: 0,
        votes: 0
    };
    
    films.push(newFilm);
    
    // Очищаем поля
    titleInput.value = '';
    descInput.value = '';
    
    // Обновляем страницу
    loadFilms();
    updateStats();
    saveToLocalStorage();
    
    // Анимация успеха
    const addBtn = document.querySelector('.add-btn');
    addBtn.innerHTML = '<i class="fas fa-check"></i> Фильм добавлен!';
    addBtn.style.background = 'linear-gradient(90deg, #00b09b, #96c93d)';
    
    setTimeout(() => {
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Добавить в список';
        addBtn.style.background = 'linear-gradient(90deg, #8a2be2, #6a11cb)';
    }, 2000);
}

// ОБНОВЛЕНИЕ СТАТИСТИКИ
function updateStats() {
    const statsElement = document.getElementById('stats');
    const totalFilms = films.length;
    const totalVotes = films.reduce((sum, film) => sum + film.votes, 0);
    const avgRating = films.length > 0 
        ? (films.reduce((sum, film) => sum + film.rating, 0) / films.length).toFixed(1)
        : 0;
    
    statsElement.innerHTML = `
        <span><i class="fas fa-film"></i> Фильмов: ${totalFilms}</span> •
        <span><i class="fas fa-star"></i> Средний рейтинг: ${avgRating}</span> •
        <span><i class="fas fa-vote-yea"></i> Всего оценок: ${totalVotes}</span>
    `;
}

// СОХРАНЕНИЕ В LOCALSTORAGE
function saveToLocalStorage() {
    localStorage.setItem('films-for-viewing', JSON.stringify(films));
}

// ЗАГРУЗКА ИЗ LOCALSTORAGE (при перезагрузке страницы)
function loadFromLocalStorage() {
    const saved = localStorage.getItem('films-for-viewing');
    if (saved) {
        films = JSON.parse(saved);
    }
}

// Инициализация
loadFromLocalStorage();
