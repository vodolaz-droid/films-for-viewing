
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
        const today = new Date().toDateString();
        const movieVotes = this.userVotes[movieId];
        
        if (!movieVotes) {
            return true;
        }
        
        return movieVotes.lastVoteDate !== today;
    }

    // Инициализация
    init() {
        this.setupForm();
        this.setupSyncButtons();
        this.updateStats();
        this.renderMovies();
        
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
                    this.showNotification('Фильм добавлен!', 'success');
                }
            });
        }
    }

    // Настройка кнопок синхронизации
    setupSyncButtons() {
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
        }
        
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importData(e));
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
            this.showNotification('Фильм удалён', 'info');
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

        movie.ratings.push(rating);
        
        const sum = movie.ratings.reduce((a, b) => a + b, 0);
        movie.averageRating = sum / movie.ratings.length;
        
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

        const oldMessage = movieCard.querySelector('.vote-message');
        if (oldMessage) oldMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `vote-message ${type}`;
        messageDiv.textContent = message;
        
        const ratingSection = movieCard.querySelector('.rating-section');
        if (ratingSection) {
            ratingSection.appendChild(messageDiv);
            
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

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Удаляем старое уведомление
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        // Создаем новое
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Показываем
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Скрываем через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Экспорт данных
    exportData() {
        const data = {
            movies: this.movies,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `films-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        this.showNotification(`Экспортировано ${this.movies.length} фильмов`, 'success');
    }

    // Импорт данных
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.json')) {
            this.showNotification('Выберите JSON файл', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!importedData.movies || !Array.isArray(importedData.movies)) {
                    throw new Error('Неверный формат файла');
                }
                
                // Подтверждение импорта
                if (!confirm(`Импортировать ${importedData.movies.length} фильмов? Текущие данные будут заменены.`)) {
                    return;
                }
                
                this.movies = importedData.movies;
                this.saveMovies();
                
                // Очищаем голоса пользователя
                this.userVotes = {};
                this.saveUserVotes();
                
                // Очищаем поле выбора файла
                event.target.value = '';
                
                this.showNotification(`Успешно импортировано ${this.movies.length} фильмов!`, 'success');
                
            } catch (error) {
                console.error('Ошибка импорта:', error);
                this.showNotification('Ошибка при импорте файла. Проверьте формат.', 'error');
                event.target.value = '';
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Ошибка чтения файла', 'error');
            event.target.value = '';
        };
        
        reader.readAsText(file);
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
