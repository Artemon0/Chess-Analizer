// Firebase конфигурация для синхронизации пользователей

const firebaseConfig = {
    apiKey: "AIzaSyDfMfU_wfM2RS5C8VPJf09hbWjOEOo4zhw",
    authDomain: "chess-analizer-aog.firebaseapp.com",
    databaseURL: "https://chess-analizer-aog-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "chess-analizer-aog",
    storageBucket: "chess-analizer-aog.firebasestorage.app",
    messagingSenderId: "1009290250318",
    appId: "1:1009290250318:web:52f56a21f24a8682881b1f",
    measurementId: "G-KBBH96RRKR"
};

// Инициализация Firebase (будет работать и в браузере, и в Electron)
let db = null;
let auth = null;

function initFirebase() {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        auth = firebase.auth();
        console.log('✅ Firebase инициализирован');
        return true;
    }
    return false;
}

// API для работы с пользователями
const UserDB = {
    // Регистрация пользователя
    async register(username, password) {
        try {
            // Проверяем существование
            const snapshot = await db.ref(`users/${username}`).once('value');
            if (snapshot.exists()) {
                throw new Error('Пользователь уже существует');
            }

            // Создаем пользователя
            const userData = {
                username: username,
                password: btoa(password), // Простое кодирование (в продакшене использовать bcrypt)
                stats: {
                    games: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    rating: 1200
                },
                createdAt: Date.now(),
                lastLogin: Date.now()
            };

            await db.ref(`users/${username}`).set(userData);

            // Сохраняем локально
            localStorage.setItem('chessUser', JSON.stringify({
                username: username,
                stats: userData.stats
            }));

            return { success: true, user: userData };
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, error: error.message };
        }
    },

    // Вход пользователя
    async login(username, password) {
        try {
            const snapshot = await db.ref(`users/${username}`).once('value');

            if (!snapshot.exists()) {
                throw new Error('Пользователь не найден');
            }

            const userData = snapshot.val();

            if (atob(userData.password) !== password) {
                throw new Error('Неверный пароль');
            }

            // Обновляем время последнего входа
            await db.ref(`users/${username}/lastLogin`).set(Date.now());

            // Сохраняем локально
            localStorage.setItem('chessUser', JSON.stringify({
                username: username,
                stats: userData.stats
            }));

            return { success: true, user: userData };
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: error.message };
        }
    },

    // Обновление статистики
    async updateStats(username, stats) {
        try {
            await db.ref(`users/${username}/stats`).update(stats);

            // Обновляем локально
            const localUser = JSON.parse(localStorage.getItem('chessUser') || '{}');
            localUser.stats = { ...localUser.stats, ...stats };
            localStorage.setItem('chessUser', JSON.stringify(localUser));

            return { success: true };
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
            return { success: false, error: error.message };
        }
    },

    // Получение данных пользователя
    async getUser(username) {
        try {
            const snapshot = await db.ref(`users/${username}`).once('value');

            if (!snapshot.exists()) {
                throw new Error('Пользователь не найден');
            }

            return { success: true, user: snapshot.val() };
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            return { success: false, error: error.message };
        }
    },

    // Синхронизация с сервером
    async syncUser(username) {
        try {
            const result = await this.getUser(username);
            if (result.success) {
                localStorage.setItem('chessUser', JSON.stringify({
                    username: username,
                    stats: result.user.stats
                }));
                return result;
            }
            return result;
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            return { success: false, error: error.message };
        }
    },

    // Получение топ игроков
    async getLeaderboard(limit = 10) {
        try {
            const snapshot = await db.ref('users')
                .orderByChild('stats/rating')
                .limitToLast(limit)
                .once('value');

            const users = [];
            snapshot.forEach(child => {
                const user = child.val();
                users.push({
                    username: user.username,
                    rating: user.stats.rating,
                    games: user.stats.games,
                    wins: user.stats.wins
                });
            });

            return { success: true, users: users.reverse() };
        } catch (error) {
            console.error('Ошибка получения таблицы лидеров:', error);
            return { success: false, error: error.message };
        }
    }
};

// Fallback на localStorage если Firebase недоступен
const LocalUserDB = {
    register(username, password) {
        const users = JSON.parse(localStorage.getItem('chessUsers') || '{}');

        if (users[username]) {
            return { success: false, error: 'Пользователь уже существует' };
        }

        users[username] = {
            password: password,
            stats: {
                games: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                rating: 1200
            }
        };

        localStorage.setItem('chessUsers', JSON.stringify(users));
        localStorage.setItem('chessUser', JSON.stringify({
            username: username,
            stats: users[username].stats
        }));

        return { success: true, user: users[username] };
    },

    login(username, password) {
        const users = JSON.parse(localStorage.getItem('chessUsers') || '{}');

        if (!users[username]) {
            return { success: false, error: 'Пользователь не найден' };
        }

        if (users[username].password !== password) {
            return { success: false, error: 'Неверный пароль' };
        }

        localStorage.setItem('chessUser', JSON.stringify({
            username: username,
            stats: users[username].stats
        }));

        return { success: true, user: users[username] };
    },

    updateStats(username, stats) {
        const users = JSON.parse(localStorage.getItem('chessUsers') || '{}');

        if (users[username]) {
            users[username].stats = { ...users[username].stats, ...stats };
            localStorage.setItem('chessUsers', JSON.stringify(users));

            const localUser = JSON.parse(localStorage.getItem('chessUser') || '{}');
            localUser.stats = users[username].stats;
            localStorage.setItem('chessUser', JSON.stringify(localUser));
        }

        return { success: true };
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserDB, LocalUserDB, initFirebase };
}
