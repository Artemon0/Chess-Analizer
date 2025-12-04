// ===== СИСТЕМА МНОГОЯЗЫЧНОСТИ =====

const translations = {
    ru: {
        // Заголовки
        'title': 'Chess Multiplayer',
        'subtitle': 'Играй онлайн + анализ в реальном времени',

        // Кнопки управления
        'createGame': '🎮 Создать игру',
        'joinGame': '🔗 Присоединиться',
        'playBot': '🤖 Играть с ботом',
        'puzzles': '🧩 Задачи',
        'hint': '💡 Подсказка',
        'clear': '🗑️ Очистить',
        'analyze': '🔍 Анализ',
        'analyzeOn': '🔍 Анализ ВКЛ',
        'analyzeOff': '🔍 Анализ ВЫКЛ',
        'resign': '🏳️ Сдаться',
        'login': '👤 Войти',

        // Контроль времени
        'timeControl': '⏱️ Контроль времени',
        'bullet': '⚡ Bullet (1 мин)',
        'blitz': '🏃 Blitz (3 мин)',
        'rapid': '🎯 Rapid (10 мин)',
        'classical': '🐢 Classical (30 мин)',
        'unlimited': '♾️ Без времени',

        // Статусы игры
        'createOrJoin': 'Создайте или присоединитесь к игре',
        'gameCreated': '🎮 Игра создана! Ждем противника...',
        'gameStarted': '✅ Игра началась! Ваш ход',
        'yourTurn': '✅ Ваш ход',
        'opponentTurn': '⏳ Ход противника',
        'checkmate': '🏆 Мат!',
        'check': '⚠️ Шах!',
        'draw': '🤝 Ничья',
        'whiteWins': 'Белые победили!',
        'blackWins': 'Черные победили!',
        'youJoined': '✅ Вы присоединились! Ход белых',

        // Игроки
        'white': 'Белые',
        'black': 'Черные',
        'you': 'Вы',
        'opponent': 'Противник',
        'waiting': 'Ожидание...',

        // Анализ
        'analysisTitle': '📊 Анализ позиции',
        'analysisOn': '✅ Анализ включен',
        'analysisOff': 'Анализ выключен',
        'analyzing': '🔍 Анализ...',
        'analysisComplete': '✅ Анализ завершен',
        'analysisError': '❌ Ошибка анализа',
        'analysisUnavailable': '⚠️ Анализ недоступен',
        'gameOver': 'Игра окончена',

        // Качество ходов
        'bestMove': 'Лучший ход',
        'brilliant': 'Блестящий!',
        'excellent': 'Отличный',
        'good': 'Хороший',
        'inaccuracy': 'Неточность',
        'mistake': 'Ошибка',
        'blunder': 'Грубая ошибка',
        'bookMove': 'Книжный ход',

        // Чат
        'chat': '💬 Чат',
        'quickChat': '💬 Быстрый чат',
        'messagePlaceholder': 'Сообщение...',
        'goodGame': '👍 Хорошая игра',
        'thanks': '🙏 Спасибо',
        'goodLuck': '🍀 Удачи',
        'niceMove': '⭐ Отличный ход',
        'draw?': '🤝 Ничья?',
        'rematch?': '🔄 Ещё партию?',

        // История ходов
        'movesHistory': 'История партии',

        // Аккаунты
        'loginRegister': 'Вход / Регистрация',
        'loginTab': 'Вход',
        'registerTab': 'Регистрация',
        'username': 'Имя пользователя',
        'password': 'Пароль',
        'confirmPassword': 'Повторите пароль',
        'loginBtn': 'Войти',
        'registerBtn': 'Зарегистрироваться',
        'logout': 'Выйти',
        'gamesPlayed': 'Игр сыграно',
        'wins': 'Побед',
        'rating': 'Рейтинг',

        // Сообщения
        'fillAllFields': 'Заполните все поля',
        'passwordMismatch': 'Пароли не совпадают',
        'usernameShort': 'Имя пользователя должно быть не менее 3 символов',
        'passwordShort': 'Пароль должен быть не менее 6 символов',
        'registering': 'Регистрация...',
        'loggingIn': 'Вход...',
        'welcome': '✅ Добро пожаловать',
        'welcomeBack': '✅ С возвращением',
        'loggedOut': '👋 Вы вышли из аккаунта',
        'opponentJoined': 'Противник присоединился!',
        'cloudSync': '☁️ Синхронизация с облаком включена',
        'localStorage': '💾 Данные сохраняются локально',

        // Диалоги
        'confirmResign': 'Вы уверены что хотите сдаться?',
        'enterGameId': 'Введите ID игры или вставьте ссылку:',
        'sendLink': 'Отправьте ссылку противнику:',
        'copyLink': '📋 Копировать',

        // Настройки
        'settings': '⚙️ Настройки',
        'pieceStyle': 'Стиль фигур',
        'boardColor': 'Цвет доски',
        'classic': 'Классика',
        'alpha': 'Альфа',
        'uscf': 'USCF',

        // Темы
        'darkTheme': 'Темная тема',
        'lichessTheme': 'Lichess',
        'lightTheme': 'Светлая тема',

        // Задачи
        'puzzleMode': '🧩 Режим задач',
        'findBestMove': 'Найдите лучший ход!',
        'puzzleSolved': '🎉 Задача решена!',
        'puzzleFailed': '❌ Неверно. Попробуйте ещё раз',
        'nextPuzzle': '➡️ Следующая задача',
        'mate1': '⚡ Мат в 1 ход',
        'mate2': '🎯 Мат в 2 хода',
        'mate3': '🔥 Мат в 3 хода',
        'tactics': '⭐ Тактика',
        'endgame': '👑 Эндшпиль',
        'famous': '🏆 Знаменитые партии',

        // Бот
        'botThinking': '🤖 Бот думает...',
        'botMove': '🤖 Ход бота',
        'selectDifficulty': 'Выберите сложность:',
        'easy': 'Легко',
        'medium': 'Средне',
        'hard': 'Сложно'
    },

    en: {
        // Headers
        'title': 'Chess Multiplayer',
        'subtitle': 'Play online + real-time analysis',

        // Control buttons
        'createGame': '🎮 Create Game',
        'joinGame': '🔗 Join Game',
        'playBot': '🤖 Play with Bot',
        'puzzles': '🧩 Puzzles',
        'hint': '💡 Hint',
        'clear': '🗑️ Clear',
        'analyze': '🔍 Analysis',
        'analyzeOn': '🔍 Analysis ON',
        'analyzeOff': '🔍 Analysis OFF',
        'resign': '🏳️ Resign',
        'login': '👤 Login',

        // Time control
        'timeControl': '⏱️ Time Control',
        'bullet': '⚡ Bullet (1 min)',
        'blitz': '🏃 Blitz (3 min)',
        'rapid': '🎯 Rapid (10 min)',
        'classical': '🐢 Classical (30 min)',
        'unlimited': '♾️ Unlimited',

        // Game status
        'createOrJoin': 'Create or join a game',
        'gameCreated': '🎮 Game created! Waiting for opponent...',
        'gameStarted': '✅ Game started! Your turn',
        'yourTurn': '✅ Your turn',
        'opponentTurn': '⏳ Opponent\'s turn',
        'checkmate': '🏆 Checkmate!',
        'check': '⚠️ Check!',
        'draw': '🤝 Draw',
        'whiteWins': 'White wins!',
        'blackWins': 'Black wins!',
        'youJoined': '✅ You joined! White\'s turn',

        // Players
        'white': 'White',
        'black': 'Black',
        'you': 'You',
        'opponent': 'Opponent',
        'waiting': 'Waiting...',

        // Analysis
        'analysisTitle': '📊 Position Analysis',
        'analysisOn': '✅ Analysis enabled',
        'analysisOff': 'Analysis disabled',
        'analyzing': '🔍 Analyzing...',
        'analysisComplete': '✅ Analysis complete',
        'analysisError': '❌ Analysis error',
        'analysisUnavailable': '⚠️ Analysis unavailable',
        'gameOver': 'Game over',

        // Move quality
        'bestMove': 'Best move',
        'brilliant': 'Brilliant!',
        'excellent': 'Excellent',
        'good': 'Good',
        'inaccuracy': 'Inaccuracy',
        'mistake': 'Mistake',
        'blunder': 'Blunder',
        'bookMove': 'Book move',

        // Chat
        'chat': '💬 Chat',
        'quickChat': '💬 Quick Chat',
        'messagePlaceholder': 'Message...',
        'goodGame': '👍 Good game',
        'thanks': '🙏 Thanks',
        'goodLuck': '🍀 Good luck',
        'niceMove': '⭐ Nice move',
        'draw?': '🤝 Draw?',
        'rematch?': '🔄 Rematch?',

        // Move history
        'movesHistory': 'Game History',

        // Accounts
        'loginRegister': 'Login / Register',
        'loginTab': 'Login',
        'registerTab': 'Register',
        'username': 'Username',
        'password': 'Password',
        'confirmPassword': 'Confirm Password',
        'loginBtn': 'Login',
        'registerBtn': 'Register',
        'logout': 'Logout',
        'gamesPlayed': 'Games Played',
        'wins': 'Wins',
        'rating': 'Rating',

        // Messages
        'fillAllFields': 'Fill all fields',
        'passwordMismatch': 'Passwords do not match',
        'usernameShort': 'Username must be at least 3 characters',
        'passwordShort': 'Password must be at least 6 characters',
        'registering': 'Registering...',
        'loggingIn': 'Logging in...',
        'welcome': '✅ Welcome',
        'welcomeBack': '✅ Welcome back',
        'loggedOut': '👋 You logged out',
        'opponentJoined': 'Opponent joined!',
        'cloudSync': '☁️ Cloud sync enabled',
        'localStorage': '💾 Data saved locally',

        // Dialogs
        'confirmResign': 'Are you sure you want to resign?',
        'enterGameId': 'Enter game ID or paste link:',
        'sendLink': 'Send link to opponent:',
        'copyLink': '📋 Copy',

        // Settings
        'settings': '⚙️ Settings',
        'pieceStyle': 'Piece Style',
        'boardColor': 'Board Color',
        'classic': 'Classic',
        'alpha': 'Alpha',
        'uscf': 'USCF',

        // Themes
        'darkTheme': 'Dark Theme',
        'lichessTheme': 'Lichess',
        'lightTheme': 'Light Theme',

        // Puzzles
        'puzzleMode': '🧩 Puzzle Mode',
        'findBestMove': 'Find the best move!',
        'puzzleSolved': '🎉 Puzzle solved!',
        'puzzleFailed': '❌ Wrong. Try again',
        'nextPuzzle': '➡️ Next Puzzle',
        'mate1': '⚡ Mate in 1',
        'mate2': '🎯 Mate in 2',
        'mate3': '🔥 Mate in 3',
        'tactics': '⭐ Tactics',
        'endgame': '👑 Endgame',
        'famous': '🏆 Famous Games',

        // Bot
        'botThinking': '🤖 Bot thinking...',
        'botMove': '🤖 Bot move',
        'selectDifficulty': 'Select difficulty:',
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard'
    },

    uk: {
        // Заголовки
        'title': 'Chess Multiplayer',
        'subtitle': 'Грай онлайн + аналіз у реальному часі',

        // Кнопки управління
        'createGame': '🎮 Створити гру',
        'joinGame': '🔗 Приєднатися',
        'playBot': '🤖 Грати з ботом',
        'puzzles': '🧩 Задачі',
        'hint': '💡 Підказка',
        'clear': '🗑️ Очистити',
        'analyze': '🔍 Аналіз',
        'analyzeOn': '🔍 Аналіз УВІМК',
        'analyzeOff': '🔍 Аналіз ВИМК',
        'resign': '🏳️ Здатися',
        'login': '👤 Увійти',

        // Контроль часу
        'timeControl': '⏱️ Контроль часу',
        'bullet': '⚡ Bullet (1 хв)',
        'blitz': '🏃 Blitz (3 хв)',
        'rapid': '🎯 Rapid (10 хв)',
        'classical': '🐢 Classical (30 хв)',
        'unlimited': '♾️ Без часу',

        // Статуси гри
        'createOrJoin': 'Створіть або приєднайтесь до гри',
        'gameCreated': '🎮 Гру створено! Чекаємо суперника...',
        'gameStarted': '✅ Гру розпочато! Ваш хід',
        'yourTurn': '✅ Ваш хід',
        'opponentTurn': '⏳ Хід суперника',
        'checkmate': '🏆 Мат!',
        'check': '⚠️ Шах!',
        'draw': '🤝 Нічия',
        'whiteWins': 'Білі перемогли!',
        'blackWins': 'Чорні перемогли!',
        'youJoined': '✅ Ви приєдналися! Хід білих',

        // Гравці
        'white': 'Білі',
        'black': 'Чорні',
        'you': 'Ви',
        'opponent': 'Суперник',
        'waiting': 'Очікування...',

        // Аналіз
        'analysisTitle': '📊 Аналіз позиції',
        'analysisOn': '✅ Аналіз увімкнено',
        'analysisOff': 'Аналіз вимкнено',
        'analyzing': '🔍 Аналіз...',
        'analysisComplete': '✅ Аналіз завершено',
        'analysisError': '❌ Помилка аналізу',
        'analysisUnavailable': '⚠️ Аналіз недоступний',
        'gameOver': 'Гру завершено',

        // Якість ходів
        'bestMove': 'Найкращий хід',
        'brilliant': 'Блискучий!',
        'excellent': 'Відмінний',
        'good': 'Хороший',
        'inaccuracy': 'Неточність',
        'mistake': 'Помилка',
        'blunder': 'Груба помилка',
        'bookMove': 'Книжковий хід',

        // Чат
        'chat': '💬 Чат',
        'quickChat': '💬 Швидкий чат',
        'messagePlaceholder': 'Повідомлення...',
        'goodGame': '👍 Гарна гра',
        'thanks': '🙏 Дякую',
        'goodLuck': '🍀 Удачі',
        'niceMove': '⭐ Відмінний хід',
        'draw?': '🤝 Нічия?',
        'rematch?': '🔄 Ще партію?',

        // Історія ходів
        'movesHistory': 'Історія партії',

        // Акаунти
        'loginRegister': 'Вхід / Реєстрація',
        'loginTab': 'Вхід',
        'registerTab': 'Реєстрація',
        'username': 'Ім\'я користувача',
        'password': 'Пароль',
        'confirmPassword': 'Повторіть пароль',
        'loginBtn': 'Увійти',
        'registerBtn': 'Зареєструватися',
        'logout': 'Вийти',
        'gamesPlayed': 'Ігор зіграно',
        'wins': 'Перемог',
        'rating': 'Рейтинг',

        // Повідомлення
        'fillAllFields': 'Заповніть усі поля',
        'passwordMismatch': 'Паролі не збігаються',
        'usernameShort': 'Ім\'я користувача має бути не менше 3 символів',
        'passwordShort': 'Пароль має бути не менше 6 символів',
        'registering': 'Реєстрація...',
        'loggingIn': 'Вхід...',
        'welcome': '✅ Ласкаво просимо',
        'welcomeBack': '✅ З поверненням',
        'loggedOut': '👋 Ви вийшли з акаунта',
        'opponentJoined': 'Суперник приєднався!',
        'cloudSync': '☁️ Синхронізація з хмарою увімкнена',
        'localStorage': '💾 Дані зберігаються локально',

        // Діалоги
        'confirmResign': 'Ви впевнені, що хочете здатися?',
        'enterGameId': 'Введіть ID гри або вставте посилання:',
        'sendLink': 'Надішліть посилання супернику:',
        'copyLink': '📋 Копіювати',

        // Налаштування
        'settings': '⚙️ Налаштування',
        'pieceStyle': 'Стиль фігур',
        'boardColor': 'Колір дошки',
        'classic': 'Класика',
        'alpha': 'Альфа',
        'uscf': 'USCF',

        // Теми
        'darkTheme': 'Темна тема',
        'lichessTheme': 'Lichess',
        'lightTheme': 'Світла тема',

        // Задачі
        'puzzleMode': '🧩 Режим задач',
        'findBestMove': 'Знайдіть найкращий хід!',
        'puzzleSolved': '🎉 Задачу розв\'язано!',
        'puzzleFailed': '❌ Неправильно. Спробуйте ще раз',
        'nextPuzzle': '➡️ Наступна задача',
        'mate1': '⚡ Мат в 1 хід',
        'mate2': '🎯 Мат в 2 ходи',
        'mate3': '🔥 Мат в 3 ходи',
        'tactics': '⭐ Тактика',
        'endgame': '👑 Ендшпіль',
        'famous': '🏆 Знамениті партії',

        // Бот
        'botThinking': '🤖 Бот думає...',
        'botMove': '🤖 Хід бота',
        'selectDifficulty': 'Оберіть складність:',
        'easy': 'Легко',
        'medium': 'Середньо',
        'hard': 'Складно'
    }
};

// Текущий язык
let currentLanguage = localStorage.getItem('chessLanguage') || 'ru';

// Функция перевода (глобальная)
window.t = function (key) {
    if (!translations || !currentLanguage || !translations[currentLanguage]) {
        console.warn('i18n not ready, returning key:', key);
        return key;
    }
    return translations[currentLanguage][key] || key;
};

// Смена языка
function setLanguage(lang) {
    if (!translations[lang]) return;

    currentLanguage = lang;
    localStorage.setItem('chessLanguage', lang);

    // Обновляем все элементы с data-i18n
    updateTranslations();

    console.log('🌐 Язык изменен на:', lang);
}

// Обновление переводов на странице
function updateTranslations() {
    // Обновляем элементы с data-i18n
    $('[data-i18n]').each(function () {
        const key = $(this).attr('data-i18n');
        const translation = t(key);

        if ($(this).is('input, textarea')) {
            $(this).attr('placeholder', translation);
        } else {
            $(this).text(translation);
        }
    });

    // Обновляем title
    if (translations[currentLanguage]['title']) {
        $('title').text(translations[currentLanguage]['title']);
    }

    // Обновляем title атрибуты
    $('[data-i18n-title]').each(function () {
        const key = $(this).attr('data-i18n-title');
        $(this).attr('title', t(key));
    });

    // Обновляем динамический контент
    updateDynamicContent();
}

// Обновление динамического контента
function updateDynamicContent() {
    // Обновляем статус игры если он есть
    const $status = $('#gameStatus');
    if ($status.length && $status.attr('data-status-key')) {
        $status.html(t($status.attr('data-status-key')));
    }

    // Обновляем имена игроков
    if ($('#whitePlayer').text() === 'Белые' || $('#whitePlayer').text() === 'White' || $('#whitePlayer').text() === 'Білі') {
        $('#whitePlayer').text(t('white'));
    }
    if ($('#blackPlayer').text() === 'Черные' || $('#blackPlayer').text() === 'Black' || $('#blackPlayer').text() === 'Чорні') {
        $('#blackPlayer').text(t('black'));
    }

    // Обновляем системные сообщения в чате
    updateChatMessages();
}

// Обновление сообщений чата
function updateChatMessages() {
    $('#chatMessages .chat-message.system').each(function () {
        const $msg = $(this);
        const text = $msg.text();

        // Карта переводов системных сообщений
        const messageMap = {
            'Синхронизация с облаком включена': 'cloudSync',
            'Cloud sync enabled': 'cloudSync',
            'Синхронізація з хмарою увімкнена': 'cloudSync',
            'Данные сохраняются локально': 'localStorage',
            'Data saved locally': 'localStorage',
            'Дані зберігаються локально': 'localStorage',
            'Противник присоединился!': 'opponentJoined',
            'Opponent joined!': 'opponentJoined',
            'Суперник приєднався!': 'opponentJoined',
            'Вы вышли из аккаунта': 'loggedOut',
            'You logged out': 'loggedOut',
            'Ви вийшли з акаунта': 'loggedOut'
        };

        // Проверяем приветственные сообщения
        if (text.includes('Добро пожаловать') || text.includes('Welcome') || text.includes('Ласкаво просимо')) {
            const username = text.split(',')[1]?.trim().replace('!', '');
            if (username) {
                $msg.text(`${t('welcome')}, ${username}!`);
            }
        } else if (text.includes('С возвращением') || text.includes('Welcome back') || text.includes('З поверненням')) {
            const username = text.split(',')[1]?.trim().replace('!', '');
            if (username) {
                $msg.text(`${t('welcomeBack')}, ${username}!`);
            }
        } else {
            // Проверяем остальные сообщения
            for (const [msg, key] of Object.entries(messageMap)) {
                if (text.includes(msg) || text === msg) {
                    $msg.text(t(key));
                    break;
                }
            }
        }
    });
}

// Инициализация при загрузке (выполняется первой)
$(function () {
    // Устанавливаем активную кнопку языка
    $('.lang-btn').removeClass('active');
    $(`.lang-btn[data-lang="${currentLanguage}"]`).addClass('active');

    updateTranslations();

    console.log('🌐 Язык установлен:', currentLanguage);
});

console.log('🌐 Система многоязычности загружена');
