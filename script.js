// Класс для работы с фильмами
class MoviePlatform {
    constructor() {
        this.movies = this.loadMovies();
        this.init();
    }

    // Загрузка фильмов из localStorage
    loadMovies() {
        const movies = localStorage.getItem('moviePlatformMovies');
        return movies ? JSON.parse(movies) : [];
    }

    // Сохранение фильмов в localStorage
    saveMovies() {
        localStorage.setItem('moviePlatformMovies', JSON.stringify(this.movies));
        this.updateStats();
        this.renderMovies();
    }

    // Инициализация
    init() {
        this.setupForm();
        this.updateStats();
        this.renderMovies();
        
        // Добавляем фильмы по умолчанию, если их нет
        if (this.movies.length === 0) {
            this.addDefaultMovies();
        }
    }

    // Настройка формы добавления
    setupForm() {
        const form = document.getElementById('add-movie-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('title').value.trim();
                const year = parseInt(document.getElementById('year').value);
                const poster = document.getElementById('poster').value.trim();
                
                if (title && year && poster) {
                    this.addMovie(title, year, poster);
                    form.reset();
                }
            });
        }
    }

    // Добавление нового фильма
    addMovie(title, year, poster) {
        const movie = {
            id: Date.now(),
            title,
            year,
            poster,
            ratings: [],
            averageRating: 0
        };
        
        this.movies.push(movie);
        this.saveMovies();
    }

    // Добавление фильмов по умолчанию
    addDefaultMovies() {
        const defaultMovies = [
            {
                title: "Дивергент",
                year: 2014,
                poster: "https://m.media-amazon.com/images/M/MV5BMTYxMzYwODE4OV5BMl5BanBnXkFtZTgwNDE5MzE2MDE@._V1_FMjpg_UX1000_.jpg",
                ratings: [4, 5, 3, 4, 5]
            },
            {
                title: "Бегущий в лабиринте",
                year: 2014,
                poster: "https://m.media-amazon.com/images/M/MV5BMjUyNTA3MTAyM15BMl5BanBnXkFtZTgwOTEyMTkyMjE@._V1_FMjpg_UX1000_.jpg",
                ratings: [5, 4, 5, 4, 3]
            },
            {
                title: "Оно",
                year: 2017,
                poster: "https://m.media-amazon.com/images/M/MV5BZDVkZmI0YzAtNzdjYi00ZjhhLWE1ODEtMWMzMWMzNDA0NmQ4XkEyXkFqcGdeQXVyNzYzODM3Mzg@._V1_FMjpg_UX1000_.jpg",
                ratings: [5, 5, 4, 5, 4]
            },
            {
                title: "Голодные игры",
                year: 2012,
                poster: "https://m.media-amazon.com/images/M/MV5BMjA4NDg3NzYxMF5BMl5BanBnXkFtZTcwNTgyNzkyNw@@._V1_FMjpg_UX1000_.jpg",
                ratings: [4, 4, 5, 3, 4]
            },
            {
                title: "Интерстеллар",
                year: 2014,
                poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg",
                ratings: [5, 5, 5, 4, 5]
            }
        ];

        defaultMovies.forEach(movieData => {
            const movie = {
                id: Date.now() + Math.random(),
                title: movieData.title,
                year: movieData.year,
                poster: movieData.poster,
                ratings: movieData.ratings,
                averageRating: 0
            };
            
            // Рассчитываем средний рейтинг
            if (movie.ratings.length > 0) {
                const sum = movie.ratings.reduce((a, b) => a + b, 0);
                movie.averageRating = sum / movie.ratings.length;
            }
            
            this.movies.push(movie);
        });
        
        this.saveMovies();
    }

    // Удаление фильма
    deleteMovie(id) {
        this.movies = this.movies.filter(movie => movie.id !== id);
        this.saveMovies();
    }

    // Добавление оценки фильму
    rateMovie(id, rating) {
        const movie = this.movies.find(m => m.id === id);
        if (movie) {
            // Добавляем оценку
            movie.ratings.push(rating);
            
            // Пересчитываем средний рейтинг
            const sum = movie.ratings.reduce((a, b) => a + b, 0);
            movie.averageRating = sum / movie.ratings.length;
            
            this.saveMovies();
        }
    }

    // Обновление статистики
    updateStats() {
        const totalMovies = this.movies.length;
        const totalRatings = this.movies.reduce((sum, movie) => sum + movie.ratings.length, 0);
        
        let averageRating = 0;
        if (totalMovies > 0) {
            const sum = this.movies.reduce((sum, movie) => sum + movie.averageRating, 0);
            averageRating = sum / totalMovies;
        }
        
        const moviesCountEl = document.getElementById('movies-count');
        const averageRatingEl = document.getElementById('average-rating');
        const totalRatingsEl = document.getElementById('total-ratings');
        
        if (moviesCountEl) moviesCountEl.textContent = totalMovies;
        if (averageRatingEl) averageRatingEl.textContent = averageRating.toFixed(1);
        if (totalRatingsEl) totalRatingsEl.textContent = totalRatings;
    }

    // Отображение всех фильмов
    renderMovies() {
        const container = document.getElementById('movies-container');
        if (!container) return;
        
        if (this.movies.length === 0) {
            container.innerHTML = '<div class="empty-state">Пока нет фильмов. Добавьте первый!</div>';
            return;
        }
        
        container.innerHTML = this.movies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" 
                     onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-year">${movie.year} год</div>
                    
                    <div class="rating-section">
                        <span class="rating-label">Оцените фильм:</span>
                        <div class="stars">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <span class="star ${star <= Math.round(movie.averageRating) ? 'active' : ''}" 
                                      data-rating="${star}"
                                      onclick="platform.rateMovie(${movie.id}, ${star})">
                                    ★
                                </span>
                            `).join('')}
                        </div>
                        
                        <div class="rating-info">
                            <span>Средняя: ${movie.averageRating.toFixed(1)}</span>
                            <span>Оценок: ${movie.ratings.length}</span>
                        </div>
                    </div>
                    
                    <div class="movie-actions">
                        <button class="delete-btn" onclick="platform.deleteMovie(${movie.id})">
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Инициализация платформы при загрузке страницы
let platform;
document.addEventListener('DOMContentLoaded', () => {
    platform = new MoviePlatform();
});
