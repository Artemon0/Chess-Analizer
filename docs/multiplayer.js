// ===== LICHESS MULTIPLAYER + REAL-TIME ANALYSIS =====

// Конфигурация для разных платформ
const WEB_URL = 'https://artemon0.github.io/Chess-Analizer'; // Замените на ваш URL

// Функция для получения правильного URL для шаринга
function getShareableUrl(gameId, fen = null) {
    // Если это Electron (file:// протокол), используем веб-версию
    if (window.location.protocol === 'file:') {
        const params = fen ? `?game=${gameId}&fen=${encodeURIComponent(fen)}` : `?game=${gameId}`;
        return `${WEB_URL}${params}`;
    }
    // Иначе используем текущий URL
    const params = fen ? `?game=${gameId}&fen=${encodeURIComponent(fen)}` : `?game=${gameId}`;
    return `${window.location.origin}${window.location.pathname}${params}`;
}

let board = null;
let game = new Chess();
let gameId = null;
let myColor = null;
let autoAnalyze = false;
let lastEval = 0;
let moveAnnotations = {}; // Хранит аннотации для каждой клетки
let moveHistory = []; // Хранит аннотации для каждого хода
let playingWithBot = false;
let botDifficulty = 'medium';

// Таймеры
let selectedTimeControl = 600; // По умолчанию 10 минут
let whiteTime = 600;
let blackTime = 600;
let timerInterval = null;
let currentTurn = 'white';
let unlimitedTime = false;

// WebSocket для мультиплеера
let ws = null;
let isOnlineGame = false;

// Система аккаунтов
let currentUser = null;
let useFirebase = false;

// Инициализация
$(document).ready(function () {
    initBoard();
    initControls();

    // Инициализация Firebase
    if (typeof initFirebase === 'function') {
        try {
            useFirebase = initFirebase();
            if (useFirebase) {
                console.log('✅ Firebase инициализирован успешно');
            }
        } catch (error) {
            console.error('❌ Ошибка инициализации Firebase:', error);
            useFirebase = false;
        }
    }

    if (!useFirebase) {
        console.log('💾 Используем localStorage');
    }

    loadUser();

    // Проверяем статус Firebase
    setTimeout(() => {
        if (useFirebase) {
            addChatMessage('system', t('cloudSync'));
        } else {
            addChatMessage('system', t('localStorage'));
        }
    }, 1000);

    console.log('✅ Multiplayer готов!');
});

// ===== ДОСКА =====

let selectedSquare = null;
let highlightedSquares = [];
let currentPieceStyle = 'wikipedia';
let currentBoardColor = 'brown';
let currentTheme = 'lichess';

function initBoard() {
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: getPieceTheme(currentPieceStyle)
    };

    board = Chessboard('board', config);

    // Устанавливаем цвет доски
    setTimeout(() => {
        $('#board .board-55d63').attr('data-board-color', currentBoardColor);
    }, 100);

    // Добавляем обработчик кликов для мобильных
    setTimeout(() => {
        $('#board').on('click', '.square-55d63', handleSquareClick);
    }, 500);
}

function onDragStart(source, piece) {
    if (game.game_over()) return false;
    if (!myColor) return false; // Не в игре
    if ((myColor === 'white' && piece.search(/^b/) !== -1) ||
        (myColor === 'black' && piece.search(/^w/) !== -1)) {
        return false;
    }
    if ((game.turn() === 'w' && myColor !== 'white') ||
        (game.turn() === 'b' && myColor !== 'black')) {
        return false; // Не ваш ход
    }
}

function onDrop(source, target) {
    // Сохраняем позицию ДО хода для анализа
    const fenBefore = game.fen();

    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    // Отправляем ход на сервер (симуляция)
    sendMove(move);

    updateStatus();
    updateMovesDisplay();

    // Анализируем СДЕЛАННЫЙ ход (только оценка, БЕЗ подсказок)
    if (autoAnalyze) {
        setTimeout(() => analyzeMadeMove(move, fenBefore), 100);
    }
}

function onSnapEnd() {
    board.position(game.fen());
    // Восстанавливаем аннотации после перерисовки доски
    setTimeout(() => renderAnnotations(), 50);
}

// ===== СИСТЕМА КЛИКОВ (ДЛЯ МОБИЛЬНЫХ И ПК) =====

function handleSquareClick(e) {
    const square = $(e.currentTarget).attr('data-square');

    if (!square) return;

    // Если игра окончена или не наш ход
    if (game.game_over()) return;
    if (!myColor) return;
    if ((game.turn() === 'w' && myColor !== 'white') ||
        (game.turn() === 'b' && myColor !== 'black')) {
        return;
    }

    const piece = game.get(square);

    // Если кликнули на свою фигуру - выбираем её
    if (piece &&
        ((game.turn() === 'w' && piece.color === 'w') ||
            (game.turn() === 'b' && piece.color === 'b'))) {

        selectSquare(square);
    }
    // Если уже выбрана фигура - пытаемся сделать ход
    else if (selectedSquare) {
        makeMove(selectedSquare, square);
    }
}

function selectSquare(square) {
    // Снимаем предыдущее выделение
    clearHighlights();

    selectedSquare = square;

    // Подсвечиваем выбранную клетку
    $(`[data-square="${square}"]`).addClass('selected-square');

    // Получаем доступные ходы
    const moves = game.moves({ square: square, verbose: true });

    // Подсвечиваем доступные ходы
    moves.forEach(move => {
        const $target = $(`[data-square="${move.to}"]`);
        $target.addClass('possible-move');
        highlightedSquares.push(move.to);

        // Добавляем точку для пустых клеток или кружок для взятия
        if (game.get(move.to)) {
            $target.append('<div class="capture-hint"></div>');
        } else if (move.flags.includes('k') || move.flags.includes('q')) {
            // Рокировка - специальный индикатор
            $target.append('<div class="castling-hint"></div>');
        } else {
            $target.append('<div class="move-hint"></div>');
        }
    });
}

function makeMove(from, to) {
    // Сохраняем позицию ДО хода для анализа
    const fenBefore = game.fen();

    const move = game.move({
        from: from,
        to: to,
        promotion: 'q' // Автоматически превращаем в ферзя
    });

    if (move === null) {
        // Неверный ход - снимаем выделение
        clearHighlights();
        selectedSquare = null;
        return;
    }

    // Ход успешен
    clearHighlights();
    selectedSquare = null;

    board.position(game.fen());

    // Отправляем ход на сервер
    sendMove(move);

    updateStatus();
    updateMovesDisplay();

    // Анализируем СДЕЛАННЫЙ ход
    if (autoAnalyze) {
        setTimeout(() => analyzeMadeMove(move, fenBefore), 100);
    }

    // Если играем с ботом
    if (playingWithBot && game.turn() === 'b') {
        makeBotMove();
    }
}

function clearHighlights() {
    $('.selected-square').removeClass('selected-square');
    $('.possible-move').removeClass('possible-move');
    $('.move-hint').remove();
    $('.capture-hint').remove();
    highlightedSquares = [];
}

// ===== МУЛЬТИПЛЕЕР (СИМУЛЯЦИЯ) =====

function getPieceTheme(style) {
    const themes = {
        'wikipedia': 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        'alpha': 'https://chessboardjs.com/img/chesspieces/alpha/{piece}.png',
        'uscf': 'https://chessboardjs.com/img/chesspieces/uscf/{piece}.png'
    };
    console.log('🎨 Меняем стиль фигур на:', style, '→', themes[style]);
    return themes[style] || themes['wikipedia'];
}

function initControls() {
    $('#createGameBtn').on('click', createGame);
    $('#joinGameBtn').on('click', joinGame);
    $('#playBotBtn').on('click', showBotDifficultyModal);
    $('#boardEditorBtn').on('click', showBoardEditor);
    // Выпадающее меню задач
    $('#puzzleBtn').on('click', function (e) {
        e.stopPropagation();
        $('#puzzleMenu').toggleClass('hidden');
    });

    // Закрытие меню при клике вне его
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.puzzle-dropdown').length) {
            $('#puzzleMenu').addClass('hidden');
        }
    });

    // Выбор категории задач
    $(document).on('click', '.puzzle-category', function () {
        const category = $(this).data('category');
        $('#puzzleMenu').addClass('hidden');
        if (typeof startPuzzle === 'function') {
            startPuzzle(category);
        }
    });
    $('#clearBtn').on('click', resetGame);
    $('#analyzeBtn').on('click', toggleAnalysis);
    $('#resignBtn').on('click', resignGame);
    $('#sendBtn').on('click', sendMessage);
    $('#fullscreenBtn').on('click', toggleFullscreen);
    $('#flipBoardBtn').on('click', () => board.flip());
    $('#settingsBtn').on('click', () => $('#settingsPanel').toggleClass('hidden'));
    $('#chatInput').on('keypress', function (e) {
        if (e.which === 13) sendMessage();
    });

    // Переключение языка
    $('.lang-btn').on('click', function () {
        const lang = $(this).data('lang');
        $('.lang-btn').removeClass('active');
        $(this).addClass('active');
        setLanguage(lang);
    });

    // Темы
    $('.theme-btn').on('click', function () {
        const theme = $(this).data('theme');
        $('.theme-btn').removeClass('active');
        $(this).addClass('active');
        $('body').attr('data-theme', theme);
        currentTheme = theme;
    });

    // Стили фигур
    $('.piece-style-btn').on('click', function () {
        const style = $(this).data('style');
        $('.piece-style-btn').removeClass('active');
        $(this).addClass('active');
        currentPieceStyle = style;
        board = Chessboard('board', {
            draggable: true,
            position: game.fen(),
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd,
            pieceTheme: getPieceTheme(style)
        });
        setTimeout(() => {
            $('#board').attr('data-board-color', currentBoardColor);
            $('#board').on('click', '.square-55d63', handleSquareClick);
        }, 100);
    });

    // Цвета доски
    $('.board-color-btn').on('click', function () {
        const color = $(this).data('color');
        console.log('🎨 Меняем цвет доски на:', color);
        $('.board-color-btn').removeClass('active');
        $(this).addClass('active');
        currentBoardColor = color;

        // Применяем к контейнеру доски
        const $boardContainer = $('#board');
        $boardContainer.attr('data-board-color', color);
        console.log('✅ Атрибут установлен:', $boardContainer.attr('data-board-color'));
    });

    // Быстрый чат
    $('.quick-chat-btn').on('click', function () {
        const msgKey = $(this).data('msg-key');
        const msg = t(msgKey);
        $('#chatInput').val(msg);
        sendMessage();
    });

    // Выбор контроля времени
    $('.time-btn').on('click', function () {
        $('.time-btn').removeClass('active');
        $(this).addClass('active');
        selectedTimeControl = parseInt($(this).data('time'));
        unlimitedTime = selectedTimeControl === 0;
        console.log('Выбран контроль времени:', selectedTimeControl === 0 ? t('unlimited') : selectedTimeControl + ' сек');
    });

    // Переключение вкладок в модальном окне входа
    $('.auth-tab').on('click', function () {
        const tab = $(this).data('tab');
        $('.auth-tab').removeClass('active');
        $(this).addClass('active');

        if (tab === 'login') {
            $('#loginTab').removeClass('hidden');
            $('#registerTab').addClass('hidden');
        } else {
            $('#loginTab').addClass('hidden');
            $('#registerTab').removeClass('hidden');
        }
    });

    // Регистрация
    $('#registerSubmit').on('click', async function () {
        const $btn = $(this);
        const username = $('#registerUsername').val().trim();
        const password = $('#registerPassword').val();
        const passwordConfirm = $('#registerPasswordConfirm').val();

        if (!username || !password) {
            alert(t('fillAllFields'));
            return;
        }

        if (password !== passwordConfirm) {
            alert(t('passwordMismatch'));
            return;
        }

        if (username.length < 3) {
            alert(t('usernameShort'));
            return;
        }

        if (password.length < 6) {
            alert(t('passwordShort'));
            return;
        }

        $btn.prop('disabled', true).text(t('registering'));

        try {
            const DB = useFirebase ? UserDB : LocalUserDB;
            const result = await DB.register(username, password);

            if (!result.success) {
                alert(result.error);
                $btn.prop('disabled', false).text(t('registerBtn'));
                return;
            }

            currentUser = {
                username: username,
                stats: result.user.stats
            };

            updateUserUI();
            $('#loginModal').addClass('hidden');

            $('#registerUsername').val('');
            $('#registerPassword').val('');
            $('#registerPasswordConfirm').val('');

            addChatMessage('system', `${t('welcome')}, ${username}!`);
            console.log('✅ Регистрация успешна:', currentUser);
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert(t('registrationError') + ': ' + error.message);
        } finally {
            $btn.prop('disabled', false).text(t('registerBtn'));
        }
    });

    // Вход
    $('#loginSubmit').on('click', async function () {
        const $btn = $(this);
        const username = $('#loginUsername').val().trim();
        const password = $('#loginPassword').val();

        if (!username || !password) {
            alert(t('fillAllFields'));
            return;
        }

        $btn.prop('disabled', true).text(t('loggingIn'));

        try {
            const DB = useFirebase ? UserDB : LocalUserDB;
            const result = await DB.login(username, password);

            if (!result.success) {
                alert(result.error);
                $btn.prop('disabled', false).text(t('loginBtn'));
                return;
            }

            currentUser = {
                username: username,
                stats: result.user.stats
            };

            updateUserUI();
            $('#loginModal').addClass('hidden');

            $('#loginUsername').val('');
            $('#loginPassword').val('');

            addChatMessage('system', `${t('welcomeBack')}, ${username}!`);
            console.log('✅ Вход успешен:', currentUser);
        } catch (error) {
            console.error('Ошибка входа:', error);
            alert(t('loginError') + ': ' + error.message);
        } finally {
            $btn.prop('disabled', false).text(t('loginBtn'));
        }
    });

    // Выход
    $('#logoutBtn').on('click', function () {
        currentUser = null;
        localStorage.removeItem('chessUser');
        updateUserUI();
        $('#loginModal').addClass('hidden');
        addChatMessage('system', t('loggedOut'));
    });

    // Модальное окно входа
    $('#loginBtn').on('click', function () {
        if (currentUser) {
            // Показываем профиль
            $('#loginTab').addClass('hidden');
            $('#registerTab').addClass('hidden');
            $('#userProfile').removeClass('hidden');
            updateUserUI();
        } else {
            // Показываем форму входа
            $('#loginTab').removeClass('hidden');
            $('#registerTab').addClass('hidden');
            $('#userProfile').addClass('hidden');
        }
        $('#loginModal').removeClass('hidden');
    });

    // Закрытие модального окна
    $('.close').on('click', function () {
        $('#loginModal').addClass('hidden');
    });

    $(window).on('click', function (e) {
        if ($(e.target).is('#loginModal')) {
            $('#loginModal').addClass('hidden');
        }
    });
}

function resignGame() {
    if (!confirm(t('confirmResign'))) return;

    const winner = myColor === 'white' ? t('black') : t('white');
    const loser = myColor === 'white' ? t('white') : t('black');
    gameOver(`🏳️ ${loser} ${t('resign')}. ${winner} ${t('whiteWins').includes('wins') ? 'wins' : 'победили'}!`);

    // Отправляем противнику
    if (isOnlineGame && connection && connection.open) {
        connection.send({
            type: 'resign',
            color: myColor
        });
    }

    $('#resignBtn').hide();
}

function resetGame() {
    // Сброс всех переменных
    game = new Chess();
    board.position('start');
    board.orientation('white');

    gameId = null;
    myColor = null;
    playingWithBot = false;
    if (typeof puzzleMode !== 'undefined') puzzleMode = false;
    isOnlineGame = false;

    stopTimer();
    clearAnnotations();
    clearHighlights();
    selectedSquare = null;
    moveHistory = []; // Очищаем историю аннотаций

    whiteTime = selectedTimeControl;
    blackTime = selectedTimeControl;

    $('#gameStatus').html(t('createOrJoin'));
    $('#whitePlayer').text(t('white'));
    $('#blackPlayer').text(t('black'));
    $('#movesList').empty();
    $('#moveQuality').text('').attr('class', 'move-quality');
    $('#gameLink').addClass('hidden').empty();
    $('#resignBtn').hide();

    updateTimerDisplay();

    console.log('🗑️ Доска очищена');
}

function createGame() {
    // Симуляция создания игры
    gameId = 'game_' + Math.random().toString(36).substr(2, 9);
    myColor = 'white';

    const gameUrl = getShareableUrl(gameId);

    $('#gameStatus').html(t('gameCreated'));
    $('#gameLink').removeClass('hidden').html(`
        <p>${t('sendLink')}</p>
        <a href="${gameUrl}" target="_blank">${gameUrl}</a>
        <button onclick="navigator.clipboard.writeText('${gameUrl}')" class="btn" style="margin-top:10px;">${t('copyLink')}</button>
    `);

    $('#whitePlayer').text(t('you'));
    $('#blackPlayer').text(t('waiting'));

    // Симуляция подключения противника через 3 секунды
    setTimeout(() => {
        $('#blackPlayer').text(t('opponent'));
        $('#gameStatus').html(t('gameStarted'));
        addChatMessage('system', t('opponentJoined'));
    }, 3000);

    console.log('Игра создана:', gameId);
}

function joinGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('game');

    if (gameIdFromUrl) {
        gameId = gameIdFromUrl;
        myColor = 'black';
        board.flip();

        $('#gameStatus').html(t('youJoined'));
        $('#whitePlayer').text(t('opponent'));
        $('#blackPlayer').text(t('you'));

        addChatMessage('system', t('youJoined'));
        console.log('Присоединились к игре:', gameId);
    } else {
        const inputGameId = prompt(t('enterGameId'));
        if (inputGameId) {
            // Извлекаем ID из ссылки
            const match = inputGameId.match(/game=([a-z0-9]+)/);
            gameId = match ? match[1] : inputGameId;
            myColor = 'black';
            board.flip();

            $('#gameStatus').html(t('youJoined'));
            $('#whitePlayer').text(t('opponent'));
            $('#blackPlayer').text(t('you'));

            addChatMessage('system', t('youJoined'));
        }
    }
}

function sendMove(move) {
    // Здесь должна быть отправка хода на сервер
    // Для демо просто логируем
    console.log('Ход отправлен:', move.san);

    // Симуляция получения хода противника (для демо)
    if (myColor === 'white' && game.history().length === 1) {
        setTimeout(() => {
            // Противник отвечает e7-e5
            const opponentMove = game.move('e5');
            if (opponentMove) {
                board.position(game.fen());
                updateStatus();
                updateMovesDisplay();
                addChatMessage('opponent', t('goodGame').replace('👍 ', ''));
            }
        }, 2000);
    }
}

// ===== АНАЛИЗ В РЕАЛЬНОМ ВРЕМЕНИ =====

function toggleAnalysis() {
    autoAnalyze = !autoAnalyze;

    if (autoAnalyze) {
        $('#analyzeBtn').text(t('analyzeOn')).css('background', '#4CAF50');
        $('#analysisStatus').text(t('analysisOn'));
        analyzePosition();
    } else {
        $('#analyzeBtn').text(t('analyzeOff')).css('background', '#FF9800');
        $('#analysisStatus').text(t('analysisOff'));
        clearAnnotations();
    }
}

// Анализ СДЕЛАННОГО хода (только оценка, БЕЗ подсказок)
async function analyzeMadeMove(move, fenBefore) {
    if (game.game_over()) {
        $('#analysisStatus').text(t('gameOver'));
        return;
    }

    $('#analysisStatus').text(t('analyzing'));

    try {
        // Получаем оценку позиции ДО хода
        const evalBefore = await getCloudEval(fenBefore);
        // Получаем оценку позиции ПОСЛЕ хода
        const evalAfter = await getCloudEval(game.fen());

        if (evalBefore && evalAfter) {
            // Оцениваем ход и добавляем аннотацию
            evaluateMadeMove(move, evalBefore, evalAfter);

            // Обновляем eval bar
            const scoreAfter = evalAfter.moves[0].cp !== null ? -evalAfter.moves[0].cp / 100 :
                (evalAfter.moves[0].mate !== null ? -(evalAfter.moves[0].mate > 0 ? 100 : -100) : 0);
            updateEvalBar(scoreAfter);

            const evalText = evalAfter.moves[0].mate !== null ?
                'M' + Math.abs(evalAfter.moves[0].mate) :
                (scoreAfter > 0 ? '+' : '') + scoreAfter.toFixed(1);
            $('#evalScore').text(evalText);

            $('#analysisStatus').text(t('analysisComplete'));
        } else {
            $('#analysisStatus').text(t('analysisUnavailable'));
        }
    } catch (error) {
        $('#analysisStatus').text(t('analysisError'));
        console.error('Ошибка анализа:', error);
    }
}

// Старая функция для кнопки анализа
async function analyzePosition() {
    if (game.game_over()) {
        $('#analysisStatus').text(t('gameOver'));
        return;
    }

    $('#analysisStatus').text(t('analyzing'));

    const fen = game.fen();
    const result = await getCloudEval(fen);

    if (result) {
        displayAnalysis(result);
        $('#analysisStatus').text(t('analysisComplete'));
    } else {
        $('#analysisStatus').text(t('analysisUnavailable'));
    }
}

async function getCloudEval(fen) {
    try {
        const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=3`;
        const response = await fetch(url);

        if (!response.ok) {
            console.log('⚠️ Cloud Eval недоступен для позиции');
            return null;
        }

        const data = await response.json();

        if (!data.pvs || data.pvs.length === 0) return null;

        return {
            depth: data.depth,
            knodes: data.knodes,
            moves: data.pvs.map(pv => ({
                moves: pv.moves.split(' '),
                cp: pv.cp !== undefined ? pv.cp : null,
                mate: pv.mate !== undefined ? pv.mate : null
            }))
        };
    } catch (error) {
        console.log('⚠️ Cloud Eval error:', error.message);
        return null;
    }
}

// Показывает что БЫЛО лучше сделать (для анализа сделанного хода)
function displayPreviousBestMoves(evalBefore, madeMove) {
    const $list = $('#bestMovesList');
    $list.empty();

    // Создаем временную игру для позиции ДО хода
    const tempGame = new Chess(game.fen());
    tempGame.undo(); // Возвращаемся на ход назад

    evalBefore.moves.forEach((moveData, index) => {
        const $item = $('<div>').addClass('best-move-item');

        const firstMove = moveData.moves[0];
        const moveObj = tempGame.move({
            from: firstMove.substring(0, 2),
            to: firstMove.substring(2, 4),
            promotion: firstMove.length > 4 ? firstMove[4] : undefined
        });

        if (moveObj) {
            tempGame.undo(); // Откатываем для следующей итерации

            // Проверяем это ли ход который был сделан
            const isThisMove = (firstMove.substring(0, 2) === madeMove.from &&
                firstMove.substring(2, 4) === madeMove.to);

            if (isThisMove) {
                $item.addClass('top-move').prepend('✅ ');
            } else if (index === 0) {
                $item.addClass('top-move').prepend('🎯 ');
            }

            $item.append($('<span>').addClass('move-notation').text(moveObj.san));

            let evalText = '';
            let evalScore = 0;

            if (moveData.mate !== null) {
                evalText = 'M' + Math.abs(moveData.mate);
                evalScore = moveData.mate > 0 ? 100 : -100;
            } else if (moveData.cp !== null) {
                evalScore = moveData.cp / 100;
                evalText = evalScore > 0 ? '+' + evalScore.toFixed(1) : evalScore.toFixed(1);
            }

            if (evalText) {
                $item.append($('<span>').addClass('move-eval').text(evalText));
            }

            if (index === 0) {
                updateEvalBar(evalScore);
                $('#evalScore').text(evalText);
                lastEval = evalScore;
            }
        }

        $list.append($item);
    });
}

// Показывает лучшие ходы для ТЕКУЩЕЙ позиции (подсказка)
function displayAnalysis(cloudEval) {
    const $list = $('#bestMovesList');
    $list.empty();

    cloudEval.moves.forEach((moveData, index) => {
        const $item = $('<div>').addClass('best-move-item');
        if (index === 0) $item.addClass('top-move');

        const tempGame = new Chess(game.fen());
        const firstMove = moveData.moves[0];
        const moveObj = tempGame.move({
            from: firstMove.substring(0, 2),
            to: firstMove.substring(2, 4),
            promotion: firstMove.length > 4 ? firstMove[4] : undefined
        });

        if (moveObj) {
            $item.append($('<span>').addClass('move-notation').text(moveObj.san));

            let evalText = '';
            let evalScore = 0;

            if (moveData.mate !== null) {
                evalText = 'M' + Math.abs(moveData.mate);
                evalScore = moveData.mate > 0 ? 100 : -100;
            } else if (moveData.cp !== null) {
                evalScore = moveData.cp / 100;
                evalText = evalScore > 0 ? '+' + evalScore.toFixed(1) : evalScore.toFixed(1);
            }

            if (evalText) {
                $item.append($('<span>').addClass('move-eval').text(evalText));
            }

            if (index === 0) {
                updateEvalBar(evalScore);
                $('#evalScore').text(evalText);
                lastEval = evalScore;
            }
        }

        $list.append($item);
    });
}

// Оценка СДЕЛАННОГО хода (Chess.com стиль)
function evaluateMadeMove(move, evalBefore, evalAfter) {
    console.log('🔍 Анализ хода:', move.san);

    const history = game.history();
    if (history.length < 1) return;

    // Получаем оценки
    const bestMoveBefore = evalBefore.moves[0];
    const scoreBefore = bestMoveBefore.cp !== null ? bestMoveBefore.cp / 100 :
        (bestMoveBefore.mate !== null ? (bestMoveBefore.mate > 0 ? 100 : -100) : 0);

    const scoreAfter = evalAfter.moves[0].cp !== null ? -evalAfter.moves[0].cp / 100 :
        (evalAfter.moves[0].mate !== null ? -(evalAfter.moves[0].mate > 0 ? 100 : -100) : 0);

    // Потеря преимущества
    const loss = scoreBefore - scoreAfter;

    // Проверяем лучший ход
    const bestMoveUCI = bestMoveBefore.moves[0];
    const wasBestMove = (bestMoveUCI.substring(0, 2) === move.from &&
        bestMoveUCI.substring(2, 4) === move.to);

    // Книжный ход?
    const moveNumber = Math.ceil(history.length / 2);
    const isOpeningPhase = moveNumber <= 10;
    const isBookMove = evalBefore.knodes && evalBefore.knodes > 1000;

    // ТОЧНОСТЬ (как в Chess.com)
    let accuracy = 100;
    if (loss > 0) {
        // Формула Chess.com: accuracy = 103.1668 * e^(-0.04354 * loss) - 3.1669
        accuracy = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669));
    }

    let quality = '';
    let className = '';
    let annotation = '';
    let icon = '';

    // Классификация как в Chess.com
    if (isOpeningPhase && isBookMove) {
        quality = 'Книжный ход';
        className = 'book';
        annotation = '📖';
        icon = '📖';
    } else if (wasBestMove || loss < 0.1) {
        quality = 'Лучший ход';
        className = 'best';
        annotation = '⭐';
        icon = '⭐';
        accuracy = 100;
    } else if (loss < -0.5) {
        quality = 'Блестящий!';
        className = 'brilliant';
        annotation = '‼️';
        icon = '‼️';
        accuracy = 100;
    } else if (loss < 0.2) {
        quality = 'Отличный';
        className = 'excellent';
        annotation = '!';
        icon = '!';
    } else if (loss < 0.5) {
        quality = 'Хороший';
        className = 'good';
        annotation = '!';
        icon = '!';
    } else if (loss < 1.0) {
        quality = 'Неточность';
        className = 'inaccuracy';
        annotation = '!?';
        icon = '!?';
    } else if (loss < 2.0) {
        quality = t('mistake');
        className = 'mistake';
        annotation = '?';
        icon = '?';
    } else {
        quality = t('blunder');
        className = 'blunder';
        annotation = '??';
        icon = '??';
    }

    // Показываем результат
    const accuracyText = accuracy < 100 ? ` • ${Math.round(accuracy)}%` : '';
    const lossText = loss > 0.1 ? ` (-${loss.toFixed(2)})` : '';

    $('#moveQuality')
        .html(`${icon} <strong>${quality}</strong>${accuracyText}${lossText}`)
        .attr('class', 'move-quality ' + className);

    // Сохраняем аннотацию в историю ходов
    const moveIndex = game.history().length - 1;
    moveHistory[moveIndex] = annotation;

    // Обновляем отображение истории с аннотациями
    updateMovesDisplay();

    // Аннотация на доске (только на клетку КУДА пошла фигура)
    // Показываем на 3 секунды, потом убираем
    if (annotation) {
        clearAnnotations();
        addMoveAnnotation(move.to, annotation);
        setTimeout(() => {
            renderAnnotations();
            // Автоматически убираем через 3 секунды
            setTimeout(() => clearAnnotations(), 3000);
        }, 50);
    } else {
        clearAnnotations();
    }

    console.log(`${icon} ${quality} ${accuracyText} ${lossText}`);
}

function getAnnotation(evalScore) {
    const absScore = Math.abs(evalScore);
    if (absScore > 5) return '‼️';
    if (absScore > 3) return '!';
    if (absScore > 1.5) return '!?';
    return '';
}

function addMoveAnnotation(square, annotation) {
    if (!annotation) return;
    // Очищаем все старые аннотации и добавляем только новую
    moveAnnotations = {};
    moveAnnotations[square] = annotation;
}

function renderAnnotations() {
    // Удаляем старые аннотации
    $('.piece-annotation').remove();

    console.log('🎨 Рендерим аннотации:', moveAnnotations);

    // Добавляем новые
    Object.keys(moveAnnotations).forEach(square => {
        const annotation = moveAnnotations[square];
        const $square = $(`[data-square="${square}"]`);

        console.log(`Клетка ${square}:`, $square.length, 'найдено, аннотация:', annotation);

        if ($square.length && annotation) {
            // Делаем клетку relative
            $square.css('position', 'relative');

            // Цвет фона в зависимости от аннотации
            let bgColor = 'rgba(255, 255, 255, 0.95)';
            let textColor = '#000';

            if (annotation === '⭐') {
                bgColor = 'rgba(76, 175, 80, 0.95)'; // Зеленый для лучшего хода
                textColor = '#fff';
            } else if (annotation === '‼️' || annotation === '!') {
                bgColor = 'rgba(33, 150, 243, 0.95)'; // Синий для хороших ходов
                textColor = '#fff';
            } else if (annotation === '??' || annotation === '?') {
                bgColor = 'rgba(244, 67, 54, 0.95)'; // Красный для ошибок
                textColor = '#fff';
            } else if (annotation === '!?' || annotation === '?!') {
                bgColor = 'rgba(255, 152, 0, 0.95)'; // Оранжевый для неточностей
                textColor = '#fff';
            }

            const $annotation = $('<div>')
                .addClass('piece-annotation')
                .text(annotation)
                .css({
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    background: bgColor,
                    color: textColor,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                });
            $square.append($annotation);
            console.log('✅ Аннотация добавлена на', square);
        }
    });
}

function clearAnnotations() {
    moveAnnotations = {};
    $('.piece-annotation').remove();
}

function updateEvalBar(score) {
    const clampedScore = Math.max(-10, Math.min(10, score));
    const percentage = ((clampedScore + 10) / 20) * 100;
    $('#evalBarWhite').css('width', percentage + '%');
}

// ===== СТАТУС И ИСТОРИЯ =====

function updateStatus() {
    let status = '';

    // Убираем старую подсветку шаха
    $('.square-in-check').removeClass('square-in-check');

    if (game.in_checkmate()) {
        status = t('checkmate') + ' ' + (game.turn() === 'w' ? t('blackWins') : t('whiteWins'));
        stopTimer();
        $('#resignBtn').hide();
    } else if (game.in_draw()) {
        status = '🤝 Ничья';
        stopTimer();
        $('#resignBtn').hide();
    } else if (game.in_check()) {
        status = '⚠️ Шах!';
        highlightKingInCheck();
    } else if (myColor) {
        const isMyTurn = (game.turn() === 'w' && myColor === 'white') ||
            (game.turn() === 'b' && myColor === 'black');
        status = isMyTurn ? t('yourTurn') : t('opponentTurn');
    }

    if (status) {
        $('#gameStatus').html(status);
    }
}

function highlightKingInCheck() {
    // Находим короля под шахом
    const turn = game.turn();
    const kingSquare = findKingSquare(turn);

    if (kingSquare) {
        const $square = $(`[data-square="${kingSquare}"]`);
        $square.addClass('square-in-check');
        console.log('👑 Король под шахом на', kingSquare);
    }
}

function findKingSquare(color) {
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece && piece.type === 'k' && piece.color === color) {
                const file = String.fromCharCode(97 + j); // a-h
                const rank = 8 - i; // 1-8
                return file + rank;
            }
        }
    }
    return null;
}

function updateMovesDisplay() {
    const $list = $('#movesList');
    $list.empty();

    const history = game.history({ verbose: true });

    for (let i = 0; i < history.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1];

        const $item = $('<div>').addClass('move-item');
        $item.append($('<span>').text(moveNum + '.'));

        // Белые с аннотацией
        let whiteMoveText = whiteMove.san;
        if (moveHistory[i]) {
            whiteMoveText += ' ' + moveHistory[i];
        }

        // Черные с аннотацией
        let blackMoveText = '';
        if (blackMove) {
            blackMoveText = blackMove.san;
            if (moveHistory[i + 1]) {
                blackMoveText += ' ' + moveHistory[i + 1];
            }
        }

        const moveText = blackMoveText ? `${whiteMoveText} ${blackMoveText}` : whiteMoveText;
        $item.append($('<span>').text(moveText));
        $list.append($item);
    }

    $list.scrollTop($list[0].scrollHeight);
}

// ===== ЧАТ =====

function sendMessage() {
    const message = $('#chatInput').val().trim();
    if (!message) return;

    addChatMessage('own', message);
    $('#chatInput').val('');

    // WebSocket для онлайн игры
    if (isOnlineGame && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'chat',
            message: message
        }));
    }
    // Умный ответ бота
    else if (playingWithBot) {
        console.log('🤖 Бот отвечает на:', message);
        setTimeout(() => {
            const botResponse = getBotChatResponse(message);
            console.log('🤖 Ответ бота:', botResponse);
            addChatMessage('opponent', botResponse);
        }, 800 + Math.random() * 1200);
    } else {
        console.log('⚠️ Ни онлайн, ни бот. playingWithBot:', playingWithBot, 'isOnlineGame:', isOnlineGame);
    }
}

function addChatMessage(type, text) {
    const $msg = $('<div>').addClass('chat-message');

    if (type === 'own') {
        $msg.addClass('own').text(t('you') + ': ' + text);
    } else if (type === 'opponent') {
        $msg.text(t('opponent') + ': ' + text);
    } else {
        $msg.text('💬 ' + text);
    }

    $('#chatMessages').append($msg);
    $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
}

// ===== УМНЫЙ ЧАТ БОТА =====

function getBotChatResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Приветствия
    if (msg.match(/привет|здравствуй|hi|hello|привіт/)) {
        return [t('botHello'), t('botHello'), t('botHelloLuck')][Math.floor(Math.random() * 3)];
    }

    // Благодарности
    if (msg.match(/спасибо|thanks|thx|дякую/)) {
        return [t('botYoureWelcome'), t('botNoWorries'), t('botAlwaysWelcome')][Math.floor(Math.random() * 3)];
    }

    // Комплименты
    if (msg.match(/хорош|отлич|круто|молодец|красиво|сильно|good|nice|great/)) {
        return [t('botThankYou'), t('botYouToo'), t('botMutual'), t('botTrying')][Math.floor(Math.random() * 4)];
    }

    // Удача
    if (msg.match(/удач|gl|good luck|удачі/)) {
        return [t('botGoodLuckToo'), t('botThanksMutual'), t('botLuck')][Math.floor(Math.random() * 3)];
    }

    // Ничья
    if (msg.match(/ничь|draw|нічия/)) {
        if (game.history().length < 20) {
            return t('botTooEarly');
        } else if (Math.abs(lastEval) < 0.5) {
            return t('botAgreeEqual');
        } else {
            return t('botLetsContinue');
        }
    }

    // Еще партию
    if (msg.match(/еще|ещё|снова|реванш|again|rematch|ще/)) {
        if (game.game_over()) {
            return [t('botLetsGo'), t('botSure'), t('botWithPleasure'), t('botLetsPlay')][Math.floor(Math.random() * 4)];
        } else {
            return t('botFinishFirst');
        }
    }

    // Вопросы о ходе
    if (msg.match(/почему|зачем|why|чому/)) {
        return [t('botBestMove'), t('botIntuition'), t('botStrategy'), t('botLetsTry')][Math.floor(Math.random() * 4)];
    }

    // Негатив
    if (msg.match(/плох|слаб|bad|weak|погано/)) {
        return [t('goodLuck'), t('thanks'), t('niceMove'), t('goodGame')][Math.floor(Math.random() * 4)];
    }

    // Эмоции
    if (msg.match(/😊|😄|🙂|👍/)) {
        return ['😊', '👍', '🙂'][Math.floor(Math.random() * 3)];
    }

    if (msg.match(/😢|😞|☹️/)) {
        return [t('botDontWorry'), t('botItllBeOk'), t('botHangInThere')][Math.floor(Math.random() * 3)];
    }

    // Вопросы о силе
    if (msg.match(/сильн|уровень|рейтинг|rating|elo|рівень/)) {
        return [t('botMediumLevel'), t('botTryingWell'), t('botLearning')][Math.floor(Math.random() * 3)];
    }

    // Общие фразы
    const generalResponses = [
        t('botInteresting'),
        t('botHmm'),
        t('botUnderstood'),
        t('botAgree'),
        t('botMaybe'),
        t('botLetsSee'),
        t('botNotBad'),
        t('botThinkingDots'),
        t('botInterestingThought')
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

// ===== ПОЛНОЭКРАННЫЙ РЕЖИМ =====

function toggleFullscreen() {
    const $boardSection = $('.board-section');
    const $btn = $('#fullscreenBtn');

    if ($boardSection.hasClass('fullscreen')) {
        // Выход из полноэкранного режима
        $boardSection.removeClass('fullscreen');
        $btn.text('⛶');
        $btn.attr('title', t('fullscreenMode'));

        // Выход из браузерного fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        // Вход в полноэкранный режим
        $boardSection.addClass('fullscreen');
        $btn.text('✕');
        $btn.attr('title', t('exitFullscreen'));

        // Браузерный fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    // Обновляем размер доски
    setTimeout(() => {
        board.resize();
    }, 100);
}

// Выход из fullscreen по ESC
$(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $('.board-section').hasClass('fullscreen')) {
        toggleFullscreen();
    }
});

// Обработка выхода из браузерного fullscreen
$(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', function () {
    if (!document.fullscreenElement && !document.webkitFullscreenElement &&
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        if ($('.board-section').hasClass('fullscreen')) {
            $('.board-section').removeClass('fullscreen');
            $('#fullscreenBtn').text('⛶').attr('title', t('fullscreenMode'));
            setTimeout(() => board.resize(), 100);
        }
    }
});

// Инициализация завершена


// ===== ВЫБОР СЛОЖНОСТИ БОТА =====

function showBotDifficultyModal() {
    $('#botDifficultyModal').removeClass('hidden');
}

// Обработчики модального окна сложности
$(document).on('click', '#botDifficultyModal .close', function () {
    $('#botDifficultyModal').addClass('hidden');
});

$(document).on('click', '.btn-difficulty', function () {
    botDifficulty = $(this).data('difficulty');
    $('#botDifficultyModal').addClass('hidden');
    playWithBot();
});

// ===== ИГРА С БОТОМ =====

function playWithBot() {
    playingWithBot = true;
    myColor = 'white';
    gameId = 'bot_game';

    $('#gameStatus').html(t('gameStarted'));
    $('#whitePlayer').text(t('you'));
    $('#blackPlayer').text('🤖 ' + t('bot'));
    $('#resignBtn').show();

    startTimer();
    addChatMessage('system', t('gameStarted'));

    // Включаем анализ автоматически
    if (!autoAnalyze) {
        toggleAnalysis();
    }

    console.log('Игра с ботом начата');
}

async function makeBotMove() {
    if (!playingWithBot || game.turn() !== 'b') return;

    $('#gameStatus').html(t('botThinking'));

    // Сохраняем позицию ДО хода бота
    const fenBefore = game.fen();

    // Получаем лучший ход от Cloud Eval
    const result = await getCloudEval(fenBefore);

    setTimeout(() => {
        let botMove = null;

        if (result && result.moves.length > 0) {
            // Бот использует лучший ход (или второй/третий для разнообразия)
            const moveIndex = Math.random() < 0.7 ? 0 : (Math.random() < 0.5 ? 1 : 2);
            const selectedMove = result.moves[Math.min(moveIndex, result.moves.length - 1)];
            const uciMove = selectedMove.moves[0];

            botMove = game.move({
                from: uciMove.substring(0, 2),
                to: uciMove.substring(2, 4),
                promotion: uciMove.length > 4 ? uciMove[4] : 'q'
            });
        } else {
            // Случайный ход если нет анализа
            const moves = game.moves({ verbose: true });
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            botMove = game.move(randomMove);
        }

        if (botMove) {
            board.position(game.fen());
            updateStatus();
            updateMovesDisplay();

            // Анализируем ход бота
            if (autoAnalyze) {
                setTimeout(() => analyzeMadeMove(botMove, fenBefore), 100);
            }

            // Случайные сообщения от бота (реже и умнее)
            if (Math.random() < 0.15) { // 15% шанс
                const botMessages = [
                    t('botInteresting'),
                    t('botHmm'),
                    t('botNotBad'),
                    t('botInteresting'),
                    t('excellent'),
                    t('botThinking'),
                    t('analyzing'),
                    t('botMove')
                ];
                addChatMessage('opponent', botMessages[Math.floor(Math.random() * botMessages.length)]);
            }
        }

        $('#gameStatus').html(t('yourTurn'));
    }, 1000 + Math.random() * 2000); // Бот "думает" 1-3 секунды
}

// ===== ТАЙМЕР =====

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    whiteTime = selectedTimeControl;
    blackTime = selectedTimeControl;
    updateTimerDisplay();

    if (unlimitedTime) {
        $('#whiteTimer').text('♾️');
        $('#blackTimer').text('♾️');
        return;
    }

    timerInterval = setInterval(() => {
        if (game.game_over()) {
            stopTimer();
            return;
        }

        if (game.turn() === 'w') {
            whiteTime--;
            if (whiteTime <= 0) {
                whiteTime = 0;
                gameOver('⏱️ ' + t('blackWins'));
            }
        } else {
            blackTime--;
            if (blackTime <= 0) {
                blackTime = 0;
                gameOver('⏱️ ' + t('whiteWins'));
            }
        }

        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    if (unlimitedTime) {
        $('#whiteTimer').text('♾️');
        $('#blackTimer').text('♾️');
    } else {
        $('#whiteTimer').text(formatTime(whiteTime));
        $('#blackTimer').text(formatTime(blackTime));

        if (whiteTime < 30 && whiteTime > 0) {
            $('#whiteTimer').addClass('low-time');
        } else {
            $('#whiteTimer').removeClass('low-time');
        }

        if (blackTime < 30 && blackTime > 0) {
            $('#blackTimer').addClass('low-time');
        } else {
            $('#blackTimer').removeClass('low-time');
        }
    }

    $('.player').removeClass('active');
    if (game.turn() === 'w') {
        $('.player.white').addClass('active');
    } else {
        $('.player.black').addClass('active');
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function gameOver(message) {
    stopTimer();
    $('#gameStatus').html('🏁 ' + message);
    $('#resignBtn').hide();
    addChatMessage('system', message);

    // Обновляем статистику если пользователь залогинен
    if (currentUser && currentUser.username) {
        const isWin = message.includes('победили') &&
            ((message.includes('Белые') && myColor === 'white') ||
                (message.includes('Черные') && myColor === 'black'));
        const isDraw = message.includes('Ничья');

        const newStats = {
            games: currentUser.stats.games + 1,
            wins: currentUser.stats.wins + (isWin ? 1 : 0),
            losses: currentUser.stats.losses + (!isWin && !isDraw ? 1 : 0),
            draws: currentUser.stats.draws + (isDraw ? 1 : 0),
            rating: currentUser.stats.rating + (isWin ? 10 : (isDraw ? 0 : -10))
        };

        const DB = useFirebase ? UserDB : LocalUserDB;
        await DB.updateStats(currentUser.username, newStats);

        currentUser.stats = newStats;
        updateUserUI();

        console.log('✅ Статистика обновлена');
    }
}

// ===== УЛУЧШЕННЫЕ АННОТАЦИИ =====

// Бот и аннотации готовы


// ===== WEBSOCKET ДЛЯ РЕАЛЬНОГО МУЛЬТИПЛЕЕРА =====

function connectWebSocket() {
    let wsUrl = `ws://${window.location.hostname}:8080`;

    console.log('🔌 Connecting to:', wsUrl);
    addChatMessage('system', '🔌 ' + t('connecting') + '...');

    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('✅ WebSocket подключен');
            addChatMessage('system', '✅ Подключено!');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        };

        ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            addChatMessage('system', '❌ ' + t('connectionError'));
        };

        ws.onclose = () => {
            console.log('❌ WebSocket disconnected');
            addChatMessage('system', '❌ ' + t('disconnected'));
            ws = null;
        };
    } catch (error) {
        console.error('❌ Error:', error);
        addChatMessage('system', '❌ ' + t('connectionFailed'));
    }
}

function handleServerMessage(data) {
    console.log('📨 Сообщение от сервера:', data.type);

    switch (data.type) {
        case 'game_created':
            handleGameCreated(data);
            break;
        case 'game_joined':
            handleGameJoined(data);
            break;
        case 'opponent_joined':
            handleOpponentJoined(data);
            break;
        case 'opponent_move':
            handleOpponentMove(data);
            break;
        case 'chat_message':
            addChatMessage('opponent', data.message);
            break;
        case 'opponent_disconnected':
            handleOpponentDisconnected(data);
            break;
        case 'error':
            alert(data.message);
            break;
    }
}

function handleGameCreated(data) {
    gameId = data.gameId;
    myColor = data.color;
    isOnlineGame = true;

    const gameUrl = getShareableUrl(gameId);
    const timeText = unlimitedTime ? t('unlimited') : formatTime(selectedTimeControl);

    $('#gameStatus').html(`${t('gameCreated')} (${timeText})`);
    showGameLink(gameUrl);

    $('#whitePlayer').text(t('you'));
    $('#blackPlayer').text(t('waiting'));

    console.log('🎮 Игра создана:', gameId);
}

function handleGameJoined(data) {
    gameId = data.gameId;
    myColor = data.color;
    isOnlineGame = true;

    board.flip();

    const timeText = unlimitedTime ? t('unlimited') : formatTime(data.timeControl);
    $('#gameStatus').html(`${t('youJoined')} (${timeText})`);
    $('#whitePlayer').text(t('opponent'));
    $('#blackPlayer').text(t('you'));

    startTimer();
    addChatMessage('system', t('youJoined'));

    console.log('🔗 Присоединились к игре:', gameId);
}

function handleOpponentJoined(data) {
    $('#blackPlayer').text(t('opponent'));
    $('#gameStatus').html(t('gameStarted'));

    startTimer();
    addChatMessage('system', data.message);
}

function handleOpponentMove(data) {
    // Сохраняем позицию ДО хода противника
    const fenBefore = game.fen();

    const move = game.move({
        from: data.move.from,
        to: data.move.to,
        promotion: data.move.promotion || 'q'
    });

    if (move) {
        board.position(game.fen());
        updateStatus();
        updateMovesDisplay();

        // Анализируем ход противника
        if (autoAnalyze) {
            setTimeout(() => analyzeMadeMove(move, fenBefore), 100);
        }
    }
}

function handleOpponentDisconnected(data) {
    stopTimer();
    $('#gameStatus').html('❌ ' + data.message);
    addChatMessage('system', data.message);
    isOnlineGame = false;
}

// Переопределяем createGame для WebSocket
const originalCreateGame = createGame;
createGame = function () {
    // Предотвращаем повторное создание игры
    if (gameId && isOnlineGame) {
        console.log('⚠️', t('gameAlreadyCreated'));
        return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        setTimeout(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'create_game',
                    timeControl: selectedTimeControl
                }));
            } else {
                alert(t('serverConnectionFailed'));
            }
        }, 1000);
    } else {
        ws.send(JSON.stringify({
            type: 'create_game',
            timeControl: selectedTimeControl
        }));
    }
};

// Переопределяем joinGame для WebSocket
const originalJoinGame = joinGame;
joinGame = function () {
    // Предотвращаем повторное присоединение
    if (gameId && isOnlineGame) {
        console.log('⚠️', t('alreadyInGame'));
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('game');

    if (gameIdFromUrl) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connectWebSocket();
            setTimeout(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'join_game',
                        gameId: gameIdFromUrl
                    }));
                }
            }, 1000);
        } else {
            ws.send(JSON.stringify({
                type: 'join_game',
                gameId: gameIdFromUrl
            }));
        }
    } else {
        const inputGameId = prompt(t('enterGameId'));
        if (inputGameId && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'join_game',
                gameId: inputGameId
            }));
        }
    }
};

// Переопределяем sendMove для WebSocket
const originalSendMove = sendMove;
sendMove = function (move) {
    if (isOnlineGame && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'move',
            move: {
                from: move.from,
                to: move.to,
                promotion: move.promotion
            }
        }));
    }
};

// sendMessage уже определена выше с поддержкой WebSocket и бота

// Автоподключение при загрузке
let autoJoinAttempted = false;
$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('game') && !autoJoinAttempted) {
        autoJoinAttempted = true;
        // Автоматически подключаемся если есть game ID в URL
        setTimeout(() => {
            $('#joinGameBtn').click();
        }, 500);
    }
});

console.log('✅ WebSocket мультиплеер готов!');


// ===== ФУНКЦИЯ ДЛЯ ПОКАЗА ССЫЛКИ С КНОПКОЙ КОПИРОВАНИЯ =====

function showGameLink(gameUrl) {
    const $link = $('<div>').html(`
        <p style="margin-bottom:10px;font-weight:bold;">📤 ${t('sendLink')}</p>
        <input type="text" id="gameUrlInput" value="${gameUrl}" readonly 
               style="width:100%;padding:12px;margin:10px 0;border:2px solid #2196F3;border-radius:5px;font-size:14px;font-family:monospace;">
        <button id="copyLinkBtn" class="btn" style="width:100%;background:#2196F3;">📋 ${t('copyLink')}</button>
        <button id="shareLinkBtn" class="btn" style="width:100%;margin-top:10px;background:#4CAF50;">📱 ${t('share')}</button>
    `);

    $('#gameLink').removeClass('hidden').empty().append($link);

    // Кнопка копирования
    $('#copyLinkBtn').on('click', async function () {
        const $btn = $(this);

        try {
            // Современный Clipboard API
            await navigator.clipboard.writeText(gameUrl);
            $btn.text('✅ ' + t('copied')).css('background', '#4CAF50');
            setTimeout(() => {
                $btn.text('📋 ' + t('copyLink')).css('background', '#2196F3');
            }, 2000);
        } catch (err) {
            // Fallback для старых браузеров
            const input = document.getElementById('gameUrlInput');
            input.select();
            input.setSelectionRange(0, 99999);

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    $btn.text('✅ ' + t('copied')).css('background', '#4CAF50');
                    setTimeout(() => {
                        $btn.text('📋 ' + t('copyLink')).css('background', '#2196F3');
                    }, 2000);
                } else {
                    throw new Error('Copy failed');
                }
            } catch (e) {
                alert(t('copyFailed'));
            }
        }
    });

    // Кнопка поделиться (для мобильных)
    $('#shareLinkBtn').on('click', function () {
        if (navigator.share) {
            navigator.share({
                title: t('chessGame'),
                text: t('joinGame'),
                url: gameUrl
            }).then(() => {
                console.log(t('linkShared'));
            }).catch((err) => {
                console.log(t('cancelled'), err);
            });
        } else {
            alert(t('shareUnavailable'));
        }
    });
}

// Функция copyFallback больше не нужна - используем async/await с Clipboard API


// ===== СИСТЕМА АККАУНТОВ =====

// Загрузка пользователя из localStorage
function loadUser() {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();

        // Синхронизируем с сервером если доступен
        if (useFirebase && currentUser.username) {
            UserDB.syncUser(currentUser.username).then(result => {
                if (result.success) {
                    currentUser.stats = result.user.stats;
                    updateUserUI();
                    console.log('✅ Данные синхронизированы с сервером');
                }
            });
        }
    }
}

function saveUser() {
    localStorage.setItem('chessUser', JSON.stringify(currentUser));
}

function updateUserUI() {
    if (currentUser) {
        $('#loginBtn').text(`👤 ${currentUser.username}`);
        $('#profileUsername').text(currentUser.username);
        $('#profileGames').text(currentUser.stats.games);
        $('#profileWins').text(currentUser.stats.wins);
        $('#profileRating').text(currentUser.stats.rating);

        // Обновляем имена игроков
        if (myColor === 'white') {
            $('#whitePlayer').text(currentUser.username);
        } else if (myColor === 'black') {
            $('#blackPlayer').text(currentUser.username);
        }
    } else {
        $('#loginBtn').text('👤 ' + t('login'));
    }
}


// ===== РЕДАКТОР ДОСКИ =====

let editorMode = false;
let editorSelectedPiece = null;
let editorTurn = 'w'; // w или b
let editorBoard = null;

function showBoardEditor() {
    editorMode = true;
    $('#boardEditorModal').removeClass('hidden');

    // Создаем отдельную доску для редактора
    if (!editorBoard) {
        editorBoard = Chessboard('board', {
            draggable: false,
            position: 'start',
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
        });
    }

    // Копируем текущую позицию
    editorBoard.position(game.fen());
}

$('#boardEditorModal .close').on('click', function () {
    $('#boardEditorModal').addClass('hidden');
    editorMode = false;
    editorSelectedPiece = null;
});

// Выбор фигуры
$('.piece-btn').on('click', function () {
    $('.piece-btn').removeClass('active');
    $(this).addClass('active');
    editorSelectedPiece = $(this).data('piece');
});

// Очистить доску
$('#editorClearBtn').on('click', function () {
    editorBoard.clear();
});

// Начальная позиция
$('#editorStartBtn').on('click', function () {
    editorBoard.start();
});

// Выбор хода
$('#editorWhiteTurn').on('click', function () {
    editorTurn = 'w';
    $('#editorWhiteTurn').addClass('active');
    $('#editorBlackTurn').removeClass('active');
});

$('#editorBlackTurn').on('click', function () {
    editorTurn = 'b';
    $('#editorBlackTurn').addClass('active');
    $('#editorWhiteTurn').removeClass('active');
});

// Клик по доске в редакторе
$('#board').on('click', '.square-55d63', function () {
    if (!editorMode) return;

    const square = $(this).data('square');

    if (editorSelectedPiece === 'remove') {
        // Удалить фигуру
        const position = editorBoard.position();
        delete position[square];
        editorBoard.position(position);
    } else if (editorSelectedPiece) {
        // Добавить фигуру
        const position = editorBoard.position();
        position[square] = editorSelectedPiece;
        editorBoard.position(position);
    }
});

// Играть с позиции
$('#editorPlayFriend').on('click', function () {
    playFromEditorPosition('friend');
});

$('#editorPlayBot').on('click', function () {
    playFromEditorPosition('bot');
});

$('#editorPlaySolo').on('click', function () {
    playFromEditorPosition('solo');
});

function playFromEditorPosition(mode) {
    const position = editorBoard.position();

    // Создаем FEN из позиции
    const fen = createFenFromPosition(position, editorTurn);

    // Проверяем валидность позиции
    const tempGame = new Chess();
    if (!tempGame.load(fen)) {
        alert(t('invalidPosition'));
        return;
    }

    // Закрываем редактор
    $('#boardEditorModal').addClass('hidden');
    editorMode = false;

    // Загружаем позицию в игру
    game.load(fen);
    board.position(game.fen());

    // Запускаем игру в зависимости от режима
    if (mode === 'bot') {
        playingWithBot = true;
        myColor = editorTurn === 'w' ? 'white' : 'black';
        $('#gameStatus').html(t('gameStarted'));
        $('#whitePlayer').text(editorTurn === 'w' ? t('you') : '🤖 ' + t('bot'));
        $('#blackPlayer').text(editorTurn === 'b' ? t('you') : '🤖 ' + t('bot'));
        $('#resignBtn').show();

        if (editorTurn === 'b') {
            makeBotMove();
        }
    } else if (mode === 'solo') {
        playingWithBot = false;
        myColor = null; // Можно играть за обе стороны
        $('#gameStatus').html(t('yourTurn'));
        $('#whitePlayer').text(t('white'));
        $('#blackPlayer').text(t('black'));
        $('#resignBtn').show();
    } else {
        // С другом - создаем онлайн игру с этой позиции
        createGameFromPosition(fen);
    }

    updateStatus();
    updateMovesDisplay();
}

function createFenFromPosition(position, turn) {
    // Создаем FEN из позиции доски
    let fen = '';

    for (let rank = 8; rank >= 1; rank--) {
        let emptyCount = 0;

        for (let file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
            const square = file + rank;
            const piece = position[square];

            if (piece) {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                fen += piece;
            } else {
                emptyCount++;
            }
        }

        if (emptyCount > 0) {
            fen += emptyCount;
        }

        if (rank > 1) {
            fen += '/';
        }
    }

    // Добавляем остальные части FEN
    fen += ' ' + turn; // Чей ход
    fen += ' KQkq'; // Рокировки (упрощенно)
    fen += ' -'; // En passant
    fen += ' 0 1'; // Счетчики ходов

    return fen;
}

function createGameFromPosition(fen) {
    // Создаем онлайн игру с кастомной позиции
    gameId = 'custom_' + Date.now();
    isOnlineGame = true;
    myColor = 'white';

    $('#gameStatus').html(t('gameCreated'));
    $('#whitePlayer').text(t('you'));
    $('#blackPlayer').text(t('waiting'));

    const gameUrl = getShareableUrl(gameId, fen);
    showGameLink(gameUrl);
}


// ===== ПРАКТИКА МАТОВ =====

const matePracticePositions = {
    queenKing: {
        fen: '8/8/8/8/8/4k3/8/4K2Q w - - 0 1',
        name: 'queenKingMate',
        description: 'Оттесните черного короля на край доски и дайте мат',
        maxMoves: 10
    },
    twoRooks: {
        fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
        name: 'twoRooksMate',
        description: 'Используйте ладьи поочередно, чтобы оттеснить короля',
        maxMoves: 8
    },
    rookKing: {
        fen: '8/8/8/8/8/4k3/8/4K2R w - - 0 1',
        name: 'rookKingMate',
        description: 'Оттесните короля в угол с помощью своего короля',
        maxMoves: 15
    }
};

let currentMatePractice = null;
let matePracticeMoves = 0;

// Обработчики меню практики матов (инициализируются в $(document).ready)
$(document).ready(function () {
    $('#matePracticeBtn').on('click', function (e) {
        e.stopPropagation();
        $('#matePracticeMenu').toggleClass('hidden');
        $('#puzzleMenu').addClass('hidden');
    });

    $(document).on('click', '.mate-practice-category', function () {
        const mateType = $(this).data('mate');
        startMatePractice(mateType);
        $('#matePracticeMenu').addClass('hidden');
    });
});

function startMatePractice(mateType) {
    currentMatePractice = matePracticePositions[mateType];
    matePracticeMoves = 0;

    // Загружаем позицию
    game.load(currentMatePractice.fen);
    board.position(currentMatePractice.fen);

    // Настройки
    myColor = 'white';
    playingWithBot = false;

    $('#gameStatus').html(`${t('matePractice')}: ${t(currentMatePractice.name)}`);
    $('#whitePlayer').text(t('you'));
    $('#blackPlayer').text(t('opponent'));

    addChatMessage('system', t(currentMatePractice.name));
    addChatMessage('system', currentMatePractice.description);

    updateStatus();
    updateMovesDisplay();

    console.log('Практика мата начата:', mateType);
}

// Переопределяем onDrop для добавления бота и проверки мата в практике
const originalOnDrop = onDrop;
onDrop = function (source, target) {
    const result = originalOnDrop(source, target);

    if (result !== 'snapback') {
        // Ход сделан успешно

        // Проверка мата в практике
        if (currentMatePractice) {
            matePracticeMoves++;

            if (game.in_checkmate()) {
                addChatMessage('system', `${t('success')} ${t('mateIn')} ${matePracticeMoves} ${t('moves')}!`);
                $('#gameStatus').html(`✅ ${t('success')}!`);

                setTimeout(() => {
                    if (confirm(t('tryAgain') + '?')) {
                        startMatePractice(Object.keys(matePracticePositions).find(
                            key => matePracticePositions[key] === currentMatePractice
                        ));
                    } else {
                        currentMatePractice = null;
                        resetGame();
                    }
                }, 1000);
            } else if (matePracticeMoves >= currentMatePractice.maxMoves) {
                addChatMessage('system', `⏱️ ${t('tryAgain')}`);
                setTimeout(() => {
                    if (confirm(t('tryAgain') + '?')) {
                        startMatePractice(Object.keys(matePracticePositions).find(
                            key => matePracticePositions[key] === currentMatePractice
                        ));
                    }
                }, 500);
            }
        }

        // Ход бота
        if (playingWithBot && game.turn() === 'b') {
            makeBotMove();
        }
    }

    return result;
};

// Закрытие модальных окон
$('.modal .close').on('click', function () {
    $(this).closest('.modal').addClass('hidden');
});

$(window).on('click', function (e) {
    if ($(e.target).hasClass('modal')) {
        $(e.target).addClass('hidden');
    }
});

// Редактор и практика готовы
