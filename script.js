
// ФИЛЬМЫ ДЛЯ ПРОСМОТРА - JavaScript
console.log('🎬 Сайт "Фильмы для просмотра" загружен!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM полностью загружен');
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
        title: "Голодные игры",
        year: 2012,
        description: "В постапокалиптическом мире ежегодно проводятся Голодные игры, где подростки сражаются насмерть на глазах у всей нации. Китнисс добровольно становится участницей, чтобы спасти сестру.",
        rating: 4.3,
        votes: 51
    }
];

// ЗАГРУЗКА ФИЛЬМОВ НА СТРАНИЦУ
function loadFilms() {
    console.log('📂 Загружаю фильмы...');
    const container = document.getElementById('films-container');
    
    if (!container) {
        console.error('❌ ОШИБКА: Не найден элемент с id="films-container"');
        return;
    }
    
    console.log(`🎬 Всего фильмов: ${films.length}`);
    container.innerHTML = '';
    
    if (films.length === 0) {
        container.innerHTML = '<div class="no-films">Пока нет фильмов. Добавьте первый!</div>';
        return;
    }
    
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
    
    console.log('✅ Фильмы успешно загружены на страницу');
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
    console.log(`⭐ Оцениваем фильм ID ${filmId}: ${rating} звезд`);
    
    const film = films.find(f => f.id === filmId);
    if (!film) {
        console.error(`❌ Фильм с ID ${filmId} не найден`);
        return;
    }
    
    // Пересчитываем рейтинг
    const totalScore = film.rating * film.votes;
    film.votes++;
    film.rating = (totalScore + rating) / film.votes;
    
    console.log(`✅ Новый рейтинг "${film.title}": ${film.rating.toFixed(1)} (оценок: ${film.votes})`);
    
    // Обновляем отображение
    loadFilms();
    updateStats();
    saveToLocalStorage();
    
    // Анимация
    const stars = document.querySelector(`[data-film-id="${filmId}"]`);
    stars.classList.add('pulse');
    setTimeout(() => stars.classList.remove('pulse'), 300);
}

// ДОБАВЛЕНИЕ НОВОГО ФИЛЬМА
function addFilm() {
    console.log('➕ Добавление нового фильма...');
    
    const titleInput = document.getElementById('film-title');
    const descInput = document.getElementById('film-description');
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    
    if (!title || !description) {
        alert('📝 Введите название и описание фильма!');
        console.warn('Попытка добавить фильм без названия или описания');
        return;
    }
    
    // Проверяем, нет ли уже такого фильма
    const existingFilm = films.find(f => f.title.toLowerCase() === title.toLowerCase());
    if (existingFilm) {
        alert('⚠️ Такой фильм уже есть в списке!');
        console.warn(`Попытка добавить существующий фильм: "${title}"`);
        return;
    }
    
    // Создаём новый фильм
    const newFilm = {
        id: films.length > 0 ? Math.max(...films.map(f => f.id)) + 1 : 1,
        title: title,
        year: new Date().getFullYear(),
        description: description,
        rating: 0,
        votes: 0
    };
    
    films.push(newFilm);
    console.log(`✅ Фильм добавлен: "${title}" (ID: ${newFilm.id})`);
    
    // Очищаем поля
    titleInput.value = '';
    descInput.value = '';
    
    // Обновляем страницу
    loadFilms();
    updateStats();
    saveToLocalStorage();
    
    // Анимация успеха
    const addBtn = document.querySelector('.add-btn');
    const originalHTML = addBtn.innerHTML;
    const originalBg = addBtn.style.background;
    
    addBtn.innerHTML = '<i class="fas fa-check"></i> Фильм добавлен!';
    addBtn.style.background = 'linear-gradient(90deg, #00b09b, #96c93d)';
    addBtn.disabled = true;
    
    setTimeout(() => {
        addBtn.innerHTML = originalHTML;
        addBtn.style.background = originalBg;
        addBtn.disabled = false;
        console.log('🔄 Кнопка "Добавить" восстановлена');
    }, 2000);
}

// ОБНОВЛЕНИЕ СТАТИСТИКИ
function updateStats() {
    console.log('📊 Обновляю статистику...');
    
    const statsElement = document.getElementById('stats');
    if (!statsElement) {
        console.error('❌ Не найден элемент с id="stats"');
        return;
    }
    
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
    
    console.log(`📊 Статистика: ${totalFilms} фильмов, средний рейтинг ${avgRating}, ${totalVotes} оценок`);
}

// СОХРАНЕНИЕ В LOCALSTORAGE
function saveToLocalStorage() {
    try {
        localStorage.setItem('films-for-viewing', JSON.stringify(films));
        console.log('💾 Фильмы сохранены в localStorage');
    } catch (e) {
        console.error('❌ Ошибка сохранения в localStorage:', e);
    }
}

// ЗАГРУЗКА ИЗ LOCALSTORAGE
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('films-for-viewing');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                films = parsed;
                console.log('💾 Фильмы загружены из localStorage');
            }
        }
    } catch (e) {
        console.error('❌ Ошибка загрузки из localStorage:', e);
    }
}

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
loadFromLocalStorage();
