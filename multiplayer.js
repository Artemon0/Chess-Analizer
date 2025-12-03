// ===== LICHESS MULTIPLAYER + REAL-TIME ANALYSIS =====

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

// Инициализация
$(document).ready(function () {
    initBoard();
    initControls();
    console.log('✅ Multiplayer готов');
});

// ===== ДОСКА =====

function initBoard() {
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('board', config);
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

// ===== МУЛЬТИПЛЕЕР (СИМУЛЯЦИЯ) =====

function initControls() {
    $('#createGameBtn').on('click', createGame);
    $('#joinGameBtn').on('click', joinGame);
    $('#playBotBtn').on('click', playWithBot);
    $('#puzzleBtn').on('click', startPuzzle);
    $('#clearBtn').on('click', resetGame);
    $('#analyzeBtn').on('click', toggleAnalysis);
    $('#resignBtn').on('click', resignGame);
    $('#sendBtn').on('click', sendMessage);
    $('#fullscreenBtn').on('click', toggleFullscreen);
    $('#chatInput').on('keypress', function (e) {
        if (e.which === 13) sendMessage();
    });

    // Быстрый чат
    $('.quick-chat-btn').on('click', function () {
        const msg = $(this).data('msg');
        $('#chatInput').val(msg);
        sendMessage();
    });

    // Выбор контроля времени
    $('.time-btn').on('click', function () {
        $('.time-btn').removeClass('active');
        $(this).addClass('active');
        selectedTimeControl = parseInt($(this).data('time'));
        unlimitedTime = selectedTimeControl === 0;
        console.log('Выбран контроль времени:', selectedTimeControl === 0 ? 'Без времени' : selectedTimeControl + ' сек');
    });
}

function resignGame() {
    if (!confirm('Вы уверены что хотите сдаться?')) return;

    const winner = myColor === 'white' ? 'Черные' : 'Белые';
    gameOver(`🏳️ ${myColor === 'white' ? 'Белые' : 'Черные'} сдались. ${winner} победили!`);

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
    moveHistory = []; // Очищаем историю аннотаций

    whiteTime = selectedTimeControl;
    blackTime = selectedTimeControl;

    $('#gameStatus').html('Создайте или присоединитесь к игре');
    $('#whitePlayer').text('Белые');
    $('#blackPlayer').text('Черные');
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

    const gameUrl = `${window.location.origin}${window.location.pathname}?game=${gameId}`;

    $('#gameStatus').html('🎮 Игра создана! Ждем противника...');
    $('#gameLink').removeClass('hidden').html(`
        <p>Отправьте ссылку противнику:</p>
        <a href="${gameUrl}" target="_blank">${gameUrl}</a>
        <button onclick="navigator.clipboard.writeText('${gameUrl}')" class="btn" style="margin-top:10px;">📋 Копировать</button>
    `);

    $('#whitePlayer').text('Вы');
    $('#blackPlayer').text('Ожидание...');

    // Симуляция подключения противника через 3 секунды
    setTimeout(() => {
        $('#blackPlayer').text('Противник');
        $('#gameStatus').html('✅ Игра началась! Ваш ход (белые)');
        addChatMessage('system', 'Противник присоединился!');
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

        $('#gameStatus').html('✅ Вы присоединились! Ход белых');
        $('#whitePlayer').text('Противник');
        $('#blackPlayer').text('Вы');

        addChatMessage('system', 'Вы присоединились к игре!');
        console.log('Присоединились к игре:', gameId);
    } else {
        const inputGameId = prompt('Введите ID игры или вставьте ссылку:');
        if (inputGameId) {
            // Извлекаем ID из ссылки
            const match = inputGameId.match(/game=([a-z0-9]+)/);
            gameId = match ? match[1] : inputGameId;
            myColor = 'black';
            board.flip();

            $('#gameStatus').html('✅ Вы присоединились! Ход белых');
            $('#whitePlayer').text('Противник');
            $('#blackPlayer').text('Вы');

            addChatMessage('system', 'Вы присоединились к игре!');
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
                addChatMessage('opponent', 'Хороший ход!');
            }
        }, 2000);
    }
}

// ===== АНАЛИЗ В РЕАЛЬНОМ ВРЕМЕНИ =====

function toggleAnalysis() {
    autoAnalyze = !autoAnalyze;

    if (autoAnalyze) {
        $('#analyzeBtn').text('🔍 Анализ ВКЛ').css('background', '#4CAF50');
        $('#analysisStatus').text('✅ Анализ включен');
        analyzePosition();
    } else {
        $('#analyzeBtn').text('🔍 Анализ ВЫКЛ').css('background', '#FF9800');
        $('#analysisStatus').text('Анализ выключен');
        clearAnnotations();
    }
}

// Анализ СДЕЛАННОГО хода (только оценка, БЕЗ подсказок)
async function analyzeMadeMove(move, fenBefore) {
    if (game.game_over()) {
        $('#analysisStatus').text('Игра окончена');
        return;
    }

    $('#analysisStatus').text('🔍 Анализ хода...');

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

            $('#analysisStatus').text('✅ Анализ завершен');
        } else {
            $('#analysisStatus').text('⚠️ Анализ недоступен (нет данных)');
            console.log('Нет данных анализа:', { evalBefore, evalAfter });
        }
    } catch (error) {
        $('#analysisStatus').text('❌ Ошибка анализа');
        console.error('Ошибка анализа:', error);
    }
}

// Старая функция для кнопки анализа
async function analyzePosition() {
    if (game.game_over()) {
        $('#analysisStatus').text('Игра окончена');
        return;
    }

    $('#analysisStatus').text('🔍 Анализ...');

    const fen = game.fen();
    const result = await getCloudEval(fen);

    if (result) {
        displayAnalysis(result);
        $('#analysisStatus').text('✅ Анализ завершен');
    } else {
        $('#analysisStatus').text('⚠️ Анализ недоступен');
    }
}

async function getCloudEval(fen) {
    try {
        const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=3`;
        const response = await fetch(url);

        if (!response.ok) return null;

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
        console.error('Cloud Eval error:', error);
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
        quality = 'Ошибка';
        className = 'mistake';
        annotation = '?';
        icon = '?';
    } else {
        quality = 'Грубая ошибка';
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
        status = '🏆 Мат! ' + (game.turn() === 'w' ? 'Черные' : 'Белые') + ' победили!';
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
        status = isMyTurn ? '✅ Ваш ход' : '⏳ Ход противника';
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
        $msg.addClass('own').text('Вы: ' + text);
    } else if (type === 'opponent') {
        $msg.text('Противник: ' + text);
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
    if (msg.match(/привет|здравствуй|hi|hello/)) {
        return ['Привет!', 'Здравствуй!', 'Привет! Удачи в игре!'][Math.floor(Math.random() * 3)];
    }

    // Благодарности
    if (msg.match(/спасибо|thanks|thx/)) {
        return ['Пожалуйста!', 'Не за что!', 'Всегда пожалуйста!'][Math.floor(Math.random() * 3)];
    }

    // Комплименты
    if (msg.match(/хорош|отлич|круто|молодец|красиво|сильно/)) {
        return ['Спасибо!', 'Ты тоже хорошо играешь!', 'Взаимно!', 'Стараюсь!'][Math.floor(Math.random() * 4)];
    }

    // Удача
    if (msg.match(/удач|gl|good luck/)) {
        return ['И тебе удачи!', 'Спасибо, взаимно!', 'Удачи!'][Math.floor(Math.random() * 3)];
    }

    // Ничья
    if (msg.match(/ничь|draw/)) {
        if (game.history().length < 20) {
            return 'Рано еще, давай поиграем!';
        } else if (Math.abs(lastEval) < 0.5) {
            return 'Согласен, позиция равная.';
        } else {
            return 'Давай доиграем, позиция интересная!';
        }
    }

    // Еще партию
    if (msg.match(/еще|ещё|снова|реванш|again|rematch/)) {
        if (game.game_over()) {
            return ['Давай!', 'Конечно!', 'С удовольствием!', 'Поехали!'][Math.floor(Math.random() * 4)];
        } else {
            return 'Давай сначала эту доиграем!';
        }
    }

    // Вопросы о ходе
    if (msg.match(/почему|зачем|why/)) {
        return ['Показалось лучшим ходом', 'Интуиция!', 'Стратегия!', 'Попробуем так'][Math.floor(Math.random() * 4)];
    }

    // Негатив
    if (msg.match(/плох|слаб|bad|weak/)) {
        return ['Бывает!', 'Учусь на ошибках', 'Не всегда получается', 'Промах'][Math.floor(Math.random() * 4)];
    }

    // Эмоции
    if (msg.match(/😊|😄|🙂|👍/)) {
        return ['😊', '👍', '🙂'][Math.floor(Math.random() * 3)];
    }

    if (msg.match(/😢|😞|☹️/)) {
        return ['Не расстраивайся!', 'Все будет хорошо!', 'Держись!'][Math.floor(Math.random() * 3)];
    }

    // Вопросы о силе
    if (msg.match(/сильн|уровень|рейтинг|rating|elo/)) {
        return ['Средний уровень, наверное', 'Стараюсь играть хорошо!', 'Учусь постоянно'][Math.floor(Math.random() * 3)];
    }

    // Общие фразы
    const generalResponses = [
        'Интересно!',
        'Хм...',
        'Понятно',
        'Да, согласен',
        'Может быть',
        'Посмотрим!',
        'Неплохо',
        'Думаю...',
        'Интересная мысль'
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
        $btn.attr('title', 'Полноэкранный режим');

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
        $btn.attr('title', 'Выход из полноэкранного режима');

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
            $('#fullscreenBtn').text('⛶').attr('title', 'Полноэкранный режим');
            setTimeout(() => board.resize(), 100);
        }
    }
});

console.log('♟️ Multiplayer готов!');


// ===== ИГРА С БОТОМ =====

function playWithBot() {
    playingWithBot = true;
    myColor = 'white';
    gameId = 'bot_game';

    $('#gameStatus').html('🤖 Игра с ботом началась! Ваш ход');
    $('#whitePlayer').text('Вы');
    $('#blackPlayer').text('🤖 Бот');
    $('#resignBtn').show();

    startTimer();
    addChatMessage('system', 'Игра с ботом началась!');

    // Включаем анализ автоматически
    if (!autoAnalyze) {
        toggleAnalysis();
    }

    console.log('Игра с ботом начата');
}

async function makeBotMove() {
    if (!playingWithBot || game.turn() !== 'b') return;

    $('#gameStatus').html('🤖 Бот думает...');

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
                    'Интересный ход!',
                    'Хм...',
                    'Неплохо',
                    'Не ожидал',
                    'Сильно!',
                    'Думаю...',
                    'Интересная позиция',
                    'Надо подумать'
                ];
                addChatMessage('opponent', botMessages[Math.floor(Math.random() * botMessages.length)]);
            }
        }

        $('#gameStatus').html('✅ Ваш ход');
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
                gameOver('⏱️ Время вышло! Черные победили');
            }
        } else {
            blackTime--;
            if (blackTime <= 0) {
                blackTime = 0;
                gameOver('⏱️ Время вышло! Белые победили');
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

function gameOver(message) {
    stopTimer();
    $('#gameStatus').html('🏁 ' + message);
    $('#resignBtn').hide();
    addChatMessage('system', message);
}

// ===== УЛУЧШЕННЫЕ АННОТАЦИИ =====

// Переопределяем onDrop для добавления таймера и бота
const originalOnDrop = onDrop;
onDrop = function (source, target) {
    const result = originalOnDrop(source, target);

    if (result !== 'snapback') {
        // Ход сделан успешно
        if (playingWithBot && game.turn() === 'b') {
            makeBotMove();
        }
    }

    return result;
};

console.log('✅ Бот, таймер и аннотации готовы!');


// ===== WEBSOCKET ДЛЯ РЕАЛЬНОГО МУЛЬТИПЛЕЕРА =====

function connectWebSocket() {
    let wsUrl = `ws://${window.location.hostname}:8080`;

    console.log('🔌 Подключение к:', wsUrl);
    addChatMessage('system', '🔌 Подключение...');

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
            console.error('❌ WebSocket ошибка:', error);
            addChatMessage('system', '❌ Ошибка. Сервер запущен?');
        };

        ws.onclose = () => {
            console.log('❌ WebSocket отключен');
            addChatMessage('system', '❌ Отключено');
            ws = null;
        };
    } catch (error) {
        console.error('❌ Ошибка:', error);
        addChatMessage('system', '❌ Не удалось подключиться');
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

    const gameUrl = `${window.location.origin}${window.location.pathname}?game=${gameId}`;
    const timeText = unlimitedTime ? 'Без времени' : formatTime(selectedTimeControl);

    $('#gameStatus').html(`🎮 Игра создана (${timeText})! Ждем противника...`);
    showGameLink(gameUrl);

    $('#whitePlayer').text('Вы');
    $('#blackPlayer').text('Ожидание...');

    console.log('🎮 Игра создана:', gameId);
}

function handleGameJoined(data) {
    gameId = data.gameId;
    myColor = data.color;
    isOnlineGame = true;

    board.flip();

    const timeText = unlimitedTime ? 'Без времени' : formatTime(data.timeControl);
    $('#gameStatus').html(`✅ Вы присоединились (${timeText})! Ход белых`);
    $('#whitePlayer').text('Противник');
    $('#blackPlayer').text('Вы');

    startTimer();
    addChatMessage('system', 'Вы присоединились к игре!');

    console.log('🔗 Присоединились к игре:', gameId);
}

function handleOpponentJoined(data) {
    $('#blackPlayer').text('Противник');
    $('#gameStatus').html('✅ Игра началась! Ваш ход (белые)');

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
        console.log('⚠️ Игра уже создана');
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
                alert('Не удалось подключиться к серверу. Убедитесь, что сервер запущен.');
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
        console.log('⚠️ Уже в игре');
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
        const inputGameId = prompt('Введите ID игры:');
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
        <p style="margin-bottom:10px;font-weight:bold;">📤 Отправьте ссылку противнику:</p>
        <input type="text" id="gameUrlInput" value="${gameUrl}" readonly 
               style="width:100%;padding:12px;margin:10px 0;border:2px solid #2196F3;border-radius:5px;font-size:14px;font-family:monospace;">
        <button id="copyLinkBtn" class="btn" style="width:100%;background:#2196F3;">📋 Копировать ссылку</button>
        <button id="shareLinkBtn" class="btn" style="width:100%;margin-top:10px;background:#4CAF50;">📱 Поделиться</button>
    `);

    $('#gameLink').removeClass('hidden').empty().append($link);

    // Кнопка копирования
    $('#copyLinkBtn').on('click', function () {
        const input = document.getElementById('gameUrlInput');
        input.select();
        input.setSelectionRange(0, 99999);

        // Пробуем современный API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(gameUrl).then(() => {
                $(this).text('✅ Скопировано!').css('background', '#4CAF50');
                setTimeout(() => {
                    $(this).text('📋 Копировать ссылку').css('background', '#2196F3');
                }, 2000);
            }).catch(() => {
                // Fallback
                copyFallback(input, $(this));
            });
        } else {
            // Старый метод
            copyFallback(input, $(this));
        }
    });

    // Кнопка поделиться (для мобильных)
    $('#shareLinkBtn').on('click', function () {
        if (navigator.share) {
            navigator.share({
                title: 'Шахматная партия',
                text: 'Присоединяйся к игре!',
                url: gameUrl
            }).then(() => {
                console.log('Ссылка отправлена');
            }).catch((err) => {
                console.log('Отмена:', err);
            });
        } else {
            alert('Функция "Поделиться" недоступна. Используйте кнопку "Копировать".');
        }
    });
}

function copyFallback(input, button) {
    try {
        input.focus();
        document.execCommand('copy');
        button.text('✅ Скопировано!').css('background', '#4CAF50');
        setTimeout(() => {
            button.text('📋 Копировать ссылку').css('background', '#2196F3');
        }, 2000);
    } catch (err) {
        alert('Не удалось скопировать. Выделите текст и скопируйте вручную (Ctrl+C).');
    }
}
