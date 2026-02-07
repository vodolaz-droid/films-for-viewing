// Класс для работы с фильмами
class MoviePlatform {
    constructor() {
        this.movies = this.loadMovies();
        this.userVotes = this.loadUserVotes();
        this.init();
    }

    // Загрузка фильмов из localStorage
    loadMovies() {
        const movies = localStorage.getItem('moviePlatformMovies');
        return movies ? JSON.parse(movies) : [];
    }

    // Загрузка голосов пользователя
    loadUserVotes() {
        const votes = localStorage.getItem('moviePlatformUserVotes');
        return votes ? JSON.parse(votes) : {};
    }

    // Сохранение фильмов
    saveMovies() {
        localStorage.setItem('moviePlatformMovies', JSON.stringify(this.movies));
        this.updateStats();
        this.renderMovies();
    }

    // Сохранение голосов пользователя
    saveUserVotes() {
        localStorage.setItem('moviePlatformUserVotes', JSON.stringify(this.userVotes));
    }

    // Проверка, может ли пользователь голосовать за фильм
    canUserVote(movieId) {
        const today = new Date().toDateString(); // Получаем только дату без времени
        const movieVotes = this.userVotes[movieId];
        
        if (!movieVotes) {
            return true; // Пользователь еще не голосовал за этот фильм
        }
        
        // Проверяем, голосовал ли пользователь сегодня
        return movieVotes.lastVoteDate !== today;
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
                const description = document.getElementById('description').value.trim();
                
                if (title && year && poster && description) {
                    this.addMovie(title, year, poster, description);
                    form.reset();
                }
            });
        }
    }

    // Добавление нового фильма
    addMovie(title, year, poster, description) {
        const movie = {
            id: Date.now(),
            title,
            year,
            poster,
            description,
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
                poster: "https://m.media-amazon.com/images/M/MV5BMTYxMzYwODE4OV5BMl5BanBnXkFtZTgwNDE5MzE2MDE@._V1_.jpg",
                description: "В постапокалиптическом Чикаго общество делится на пять фракций. Беатрис Прайор обнаруживает, что не подходит ни под одну категорию - она дивергент.",
                ratings: [4, 5, 3, 4]
            },
            {
                title: "Бегущий в лабиринте",
                year: 2014,
                poster: "https://m.media-amazon.com/images/M/MV5BMjUyNTA3MTAyM15BMl5BanBnXkFtZTgwOTEyMTkyMjE@._V1_.jpg",
                description: "Томас просыпается в лифте, не помня ничего о своем прошлом. Он оказывается среди группы мальчиков, которые живут в центре огромного лабиринта.",
                ratings: [5, 4, 5, 4]
            },
            {
                title: "Оно",
                year: 2017,
                poster: "https://m.media-amazon.com/images/M/MV5BZDVkZmI0YzAtNzdjYi00ZjhhLWE1ODEtMWMzMWMzNDA0NmQ4XkEyXkFqcGdeQXVyNzYzODM3Mzg@._V1_.jpg",
                description: "В городке Дерри каждые 27 лет происходят страшные события. Компания семи подростков сталкивается со своим самым большим страхом - клоуном Пеннивайзом.",
                ratings: [5, 5, 4, 5]
            },
            {
                title: "Голодные игры",
                year: 2012,
                poster: "https://m.media-amazon.com/images/M/MV5BMjA4NDg3NzYxMF5BMl5BanBnXkFtZTcwNTgyNzkyNw@@._V1_.jpg",
                description: "В постапокалиптическом мире ежегодно проводятся Голодные игры, где подростки сражаются насмерть. Китнисс Эвердин добровольно заменяет свою сестру.",
                ratings: [4, 4, 5, 3]
            },
            {
                title: "Интерстеллар",
                year: 2014,
                poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
                description: "Земля становится непригодной для жизни. Группа исследователей отправляется через червоточину в поисках нового дома для человечества.",
                ratings: [5, 5, 5, 4]
            }
        ];

        defaultMovies.forEach(movieData => {
            const movie = {
                id: Date.now() + Math.random(),
                title: movieData.title,
                year: movieData.year,
                poster: movieData.poster,
                description: movieData.description,
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
        if (confirm("Удалить этот фильм из каталога?")) {
            this.movies = this.movies.filter(movie => movie.id !== id);
            this.saveMovies();
        }
    }

    // Добавление оценки фильму
    rateMovie(id, rating) {
        const movie = this.movies.find(m => m.id === id);
        if (!movie) return;

        const canVote = this.canUserVote(id);
        
        if (!canVote) {
            this.showVoteMessage(id, "Вы уже голосовали за этот фильм сегодня. Приходите завтра!", "error");
            return;
        }

        // Добавляем оценку
        movie.ratings.push(rating);
        
        // Пересчитываем средний рейтинг
        const sum = movie.ratings.reduce((a, b) => a + b, 0);
        movie.averageRating = sum / movie.ratings.length;
        
        // Сохраняем дату голосования
        const today = new Date().toDateString();
        this.userVotes[id] = { lastVoteDate: today, lastRating: rating };
        this.saveUserVotes();
        
        this.saveMovies();
        this.showVoteMessage(id, `Спасибо! Вы поставили ${rating} ★`, "success");
    }

    // Показать сообщение о голосовании
    showVoteMessage(movieId, message, type) {
        const movieCard = document.querySelector(`.movie-card[data-id="${movieId}"]`);
        if (!movieCard) return;

        // Удаляем предыдущее сообщение
        const oldMessage = movieCard.querySelector('.vote-message');
        if (oldMessage) oldMessage.remove();

        // Создаем новое сообщение
        const messageDiv = document.createElement('div');
        messageDiv.className = `vote-message ${type}`;
        messageDiv.textContent = message;
        
        const ratingSection = movieCard.querySelector('.rating-section');
        if (ratingSection) {
            ratingSection.appendChild(messageDiv);
            
            // Автоматически скрываем через 3 секунды
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (messageDiv.parentNode) {
                            messageDiv.remove();
                        }
                    }, 300);
                }
            }, 3000);
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
        
        container.innerHTML = this.movies.map(movie => {
            const canVote = this.canUserVote(movie.id);
            const userVote = this.userVotes[movie.id];
            
            return `
            <div class="movie-card" data-id="${movie.id}">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" 
                     onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-year">${movie.year} год</div>
                    
                    <div class="movie-description">
                        ${movie.description}
                    </div>
                    
                    <div class="rating-section">
                        <span class="rating-label">
                            ${canVote ? 'Оцените фильм:' : 'Вы уже оценили сегодня:'}
                        </span>
                        <div class="stars">
                            ${[1, 2, 3, 4, 5].map(star => {
                                let starClass = 'star';
                                if (!canVote && userVote && star === userVote.lastRating) {
                                    starClass += ' active';
                                } else if (star <= Math.round(movie.averageRating)) {
                                    starClass += ' active';
                                }
                                
                                return `
                                    <span class="${starClass}" 
                                          data-rating="${star}"
                                          ${canVote ? `onclick="platform.rateMovie(${movie.id}, ${star})"` : 'style="cursor: default;"'}>
                                        ★
                                    </span>
                                `;
                            }).join('')}
                        </div>
                        
                        <div class="rating-info">
                            <span>Средняя: ${movie.averageRating.toFixed(1)}</span>
                            <span>Оценок: ${movie.ratings.length}</span>
                        </div>
                        
                        ${!canVote ? `
                            <div class="vote-message info">
                                Вы сегодня уже голосовали. Новый голос доступен завтра!
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="movie-actions">
                        <button class="delete-btn" onclick="platform.deleteMovie(${movie.id})">
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
}

// Инициализация платформы при загрузке страницы
let platform;
document.addEventListener('DOMContentLoaded', () => {
    platform = new MoviePlatform();
});
