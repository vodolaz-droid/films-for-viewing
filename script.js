// ФИЛЬМЫ ДЛЯ ПРОСМОТРА - JavaScript
console.log('🎬 Кино-платформа загружается...');

// ГЛОБАЛЬНЫЙ МАССИВ ФИЛЬМОВ
let films = [];

// ЗАГРУЗКА ПРИ ОТКРЫТИИ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM готов');
    
    // Загружаем данные
    loadFilmsData();
    loadUserRatings();
    
    // Отображаем фильмы
    loadFilms();
    updateStats();
    
    // Назначаем обработчик кнопки добавления
    document.getElementById('add-film-btn').addEventListener('click', addFilm);
    
    console.log('🚀 Кино-платформа готова!');
});

// ЗАГРУЗКА ФИЛЬМОВ НА СТРАНИЦУ
function loadFilms() {
    const container = document.getElementById('films-container');
    if (!container) {
        console.error('❌ Ошибка: не найден films-container');
        return;
    }
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Если фильмов нет
    if (films.length === 0) {
        container.innerHTML = `
            <div class="no-films">
                <i class="fas fa-film"></i>
                <h3>Пока нет фильмов</h3>
                <p>Добавьте первый фильм!</p>
            </div>
        `;
        return;
    }
    
    // Создаём карточки для каждого фильма
    films.forEach(film => {
        const filmElement = document.createElement('div');
        filmElement.className = 'film-card';
        filmElement.innerHTML = createFilmCardHTML(film);
        container.appendChild(filmElement);
    });
    
    // Назначаем обработчики звёзд
    document.querySelectorAll('.star.clickable').forEach(star => {
        star.addEventListener('click', function() {
            const filmId = parseInt(this.parentElement.dataset.filmId);
            const rating = parseInt(this.dataset.value);
            rateFilm(filmId, rating);
        });
    });
    
    console.log(`✅ Загружено ${films.length} фильмов`);
}

// СОЗДАНИЕ HTML КАРТОЧКИ ФИЛЬМА
function createFilmCardHTML(film) {
    const userRatingHTML = film.userRated 
        ? `<div class="already-rated">
              <i class="fas fa-check-circle"></i>
              <span>Вы оценили: ${film.userRating}★</span>
           </div>`
        : `<div class="stars-container" data-film-id="${film.id}">
              ${generateStars(film.userRated, film.userRating)}
           </div>`;
    
    return `
        <div class="film-poster">
            <img src="${film.image}" 
                 alt="${film.title}" 
                 onerror="this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop'">
            <button class="delete-btn" onclick="deleteFilm(${film.id})">
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
                    <i class="fas fa-star"></i>
                    <span>${film.rating.toFixed(1)}/5.0</span>
                </div>
            </div>
            
            <p class="film-description">${film.description}</p>
            
            <div class="film-rating">
                <div class="rating-display">
                    <div class="rating-value">
                        <i class="fas fa-star"></i>
                        <span class="rating-number">${film.rating.toFixed(1)}</span>
                    </div>
                    <div class="rating-label">${film.votes} оценок</div>
                </div>
                
                <div class="user-rating">
                    <span class="rate-label">Ваша оценка:</span>
                    ${userRatingHTML}
                </div>
            </div>
        </div>
    `;
}

// ГЕНЕРАЦИЯ ЗВЁЗД ДЛЯ ОЦЕНКИ
function generateStars(userRated, userRating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (userRated) {
            // Если уже оценили - показываем оценку
            const isActive = i <= userRating;
            starsHTML += `<i class="fas fa-star star ${isActive ? 'active' : ''} disabled" data-value="${i}"></i>`;
        } else {
            // Если ещё не оценили - кликабельные звёзды
            starsHTML += `<i class="fas fa-star star clickable" data-value="${i}"></i>`;
        }
    }
    return starsHTML;
}

// ОЦЕНКА ФИЛЬМА
function rateFilm(filmId, rating) {
    const film = films.find(f => f.id === filmId);
    if (!film) {
        showNotification('Фильм не найден!', 'error');
        return;
    }
    
    // Проверяем, оценивал ли уже пользователь
    if (film.userRated) {
        showNotification('Вы уже оценили этот фильм!', 'error');
        return;
    }
    
    // Обновляем рейтинг фильма
    const totalScore = film.rating * film.votes;
    film.votes += 1;
    film.rating = (totalScore + rating) / film.votes;
    
    // Сохраняем оценку пользователя
    film.userRated = true;
    film.userRating = rating;
    
    // Сохраняем изменения
    saveUserRating(filmId, rating);
    saveFilms();
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    
    // Показываем уведомление
    showNotification(`Вы поставили ${rating}★ фильму "${film.title}"`, 'success');
}

// УДАЛЕНИЕ ФИЛЬМА
function deleteFilm(filmId) {
    if (!confirm('Удалить этот фильм из списка?')) {
        return;
    }
    
    const filmIndex = films.findIndex(f => f.id === filmId);
    if (filmIndex === -1) return;
    
    const deletedFilm = films.splice(filmIndex, 1)[0];
    
    // Удаляем оценки пользователя этого фильма
    removeUserRating(filmId);
    
    // Сохраняем изменения
    saveFilms();
    
    // Обновляем интерфейс
    loadFilms();
    updateStats();
    
    // Показываем уведомление
    showNotification(`Фильм "${deletedFilm.title}" удалён`, 'info');
}

// ДОБАВЛЕНИЕ НОВОГО ФИЛЬМА
function addFilm() {
    // Получаем данные из формы
    const title = document.getElementById('film-title').value.trim();
    const year = document.getElementById('film-year').value.trim();
    const imageUrl = document.getElementById('film-image').value.trim();
    const description = document.getElementById('film-description').value.trim();
    
    // Проверяем обязательные поля
    if (!title || !year || !description) {
        showNotification('Заполните все обязательные поля!', 'error');
        return;
    }
    
    // Проверяем год
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 2) {
        showNotification('Введите корректный год выпуска (1900-2026)', 'error');
        return;
    }
    
    // Проверяем на дубликат
    if (films.some(f => f.title.toLowerCase() === title.toLowerCase())) {
        showNotification('Такой фильм уже есть в списке!', 'error');
        return;
    }
    
    // Обрабатываем изображение
    let finalImage = imageUrl;
    if (!finalImage) {
        // Используем изображение по умолчанию
        finalImage = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop';
    } else {
        // Проверяем URL
        try {
            new URL(finalImage);
        } catch (e) {
            showNotification('Некорректная ссылка. Используем изображение по умолчанию.', 'info');
            finalImage = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=200&fit=crop';
        }
    }
    
    // Создаём новый фильм
    const newFilm = {
        id: films.length > 0 ? Math.max(...films.map(f => f.id)) + 1 : 1,
        title: title,
        year: yearNum,
        description: description,
        image: finalImage,
        rating: 0,
        votes: 0,
        userRated: false,
        userRating: 0
    };
    
    // Добавляем фильм в массив
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
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = originalBg;
        btn.disabled = false;
    }, 1500);
    
    // Показываем уведомление
    showNotification(`Фильм "${title}" добавлен в каталог`, 'success');
}

// ОБНОВЛЕНИЕ СТАТИСТИКИ
function updateStats() {
    const totalFilms = films.length;
    const ratedFilms = films.filter(f => f.votes > 0).length;
    const totalVotes = films.reduce((sum, f) => sum + f.votes, 0);
    const avgRating = ratedFilms > 0 
        ? (films.filter(f => f.votes > 0).reduce((sum, f) => sum + f.rating, 0) / ratedFilms).toFixed(1)
        : '0.0';
    
    // Обновляем DOM
    document.getElementById('total-films').textContent = totalFilms;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('total-votes').textContent = totalVotes;
}

// СОХРАНЕНИЕ ОЦЕНКИ ПОЛЬЗОВАТЕЛЯ
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

// УДАЛЕНИЕ ОЦЕНКИ ПОЛЬЗОВАТЕЛЯ
function removeUserRating(filmId) {
    // Удаляем из ratedFilms
    const ratedFilms = JSON.parse(localStorage.getItem('ratedFilms') || '[]');
    const updatedRatedFilms = ratedFilms.filter(id => id !== filmId);
    localStorage.setItem('ratedFilms', JSON.stringify(updatedRatedFilms));
    
    // Удаляем из userRatings
    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
    delete userRatings[filmId];
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
}

// ЗАГРУЗКА ОЦЕНОК ПОЛЬЗОВАТЕЛЯ
function loadUserRatings() {
    const ratedFilms = JSON.parse(localStorage.getItem('ratedFilms') || '[]');
    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
    
    films.forEach(film => {
        film.userRated = ratedFilms.includes(film.id);
        film.userRating = userRatings[film.id] || 0;
    });
}

// СОХРАНЕНИЕ ФИЛЬМОВ В LOCALSTORAGE
function saveFilms() {
    try {
        localStorage.setItem('filmsData', JSON.stringify(films));
        console.log('💾 Фильмы сохранены');
    } catch (e) {
        console.error('❌ Ошибка сохранения фильмов:', e);
        showNotification('Ошибка сохранения данных', 'error');
    }
}

// ЗАГРУЗКА ФИЛЬМОВ ИЗ LOCALSTORAGE
function loadFilmsData() {
    try {
        const saved = localStorage.getItem('filmsData');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                films = parsed;
                console.log(`💾 Загружено ${films.length} фильмов из сохранения`);
                return;
            }
        }
    } catch (e) {
        console.error('❌ Ошибка загрузки фильмов:', e);
    }
    
    // Если нет сохранённых данных, создаём начальный список
    films = [
        {
            id: 1,
            title: "Дивергент",
            year: 2014,
            description: "В постапокалиптическом Чикаго общество разделено на пять фракций. Беатрис должна выбрать свою судьбу, но оказывается, что она не вписывается ни в одну группу — она Дивергент.",
            image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=200&fit=crop",
            rating: 4.2,
            votes: 42,
            userRated: false,
            userRating: 0
        },
        {
            id: 2,
            title: "Интерстеллар",
            year: 2014,
            description: "Группа исследователей путешествует через червоточину в космосе в поисках нового дома для человечества.",
            image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop",
            rating: 4.8,
            votes: 56,
            userRated: false,
            userRating: 0
        },
        {
            id: 3,
            title: "Голодные игры",
            year: 2012,
            description: "В постапокалиптическом мире ежегодно проводятся Голодные игры, где подростки сражаются насмерть на глазах у всей нации. Китнисс добровольно становится участницей, чтобы спасти сестру.",
            image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&h=200&fit=crop",
            rating: 4.3,
            votes: 51,
            userRated: false,
            userRating: 0
        }
    ];
    
    console.log('📂 Создан начальный список фильмов');
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
        <i class="fas fa-${
