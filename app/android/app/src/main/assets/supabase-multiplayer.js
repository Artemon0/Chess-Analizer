// ===== PEER-TO-PEER МУЛЬТИПЛЕЕР (БЕЗ СЕРВЕРА) =====
// Работает на Vercel!

let peer = null;
let connection = null;
let myPeerId = null;

function initPeerJS() {
    console.log('🔌 Инициализация PeerJS...');

    // Используем официальный бесплатный PeerJS Cloud
    peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });

    peer.on('open', (id) => {
        console.log('✅ PeerJS готов! ID:', id);
        myPeerId = id;
        addChatMessage('system', '✅ Готов к игре!');
    });

    peer.on('connection', (conn) => {
        console.log('📞 Входящее подключение');
        connection = conn;
        setupConnection(conn);

        myColor = 'white';
        isOnlineGame = true;
        $('#whitePlayer').text('Вы');
        $('#blackPlayer').text('Противник');
        $('#gameStatus').html('✅ Игра началась! Ваш ход');
        $('#resignBtn').show();
        startTimer();
        addChatMessage('system', '✅ Противник присоединился!');
    });

    peer.on('error', (err) => {
        console.error('❌ Ошибка:', err);
        if (err.type === 'peer-unavailable') {
            addChatMessage('system', '❌ Игрок не найден');
        } else {
            addChatMessage('system', '❌ Ошибка: ' + err.type);
        }
    });

    peer.on('disconnected', () => {
        console.log('⚠️ Переподключение...');
        peer.reconnect();
    });
}

function setupConnection(conn) {
    conn.on('data', (data) => {
        console.log('📨 Получено:', data);
        handlePeerMessage(data);
    });

    conn.on('close', () => {
        console.log('❌ Соединение закрыто');
        addChatMessage('system', '❌ Противник отключился');
        stopTimer();
        isOnlineGame = false;
    });

    conn.on('error', (err) => {
        console.error('❌ Ошибка соединения:', err);
    });
}

function handlePeerMessage(data) {
    switch (data.type) {
        case 'move':
            handleOpponentMovePeer(data.move);
            break;
        case 'chat':
            addChatMessage('opponent', data.message);
            break;
        case 'resign':
            const winner = data.color === 'white' ? 'Черные' : 'Белые';
            gameOver(`🏳️ ${data.color === 'white' ? 'Белые' : 'Черные'} сдались. ${winner} победили!`);
            break;
    }
}

function handleOpponentMovePeer(moveData) {
    // Сохраняем позицию ДО хода противника
    const fenBefore = game.fen();

    const move = game.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion || 'q'
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

// Переопределяем createGame
createGame = function () {
    if (!peer || !myPeerId) {
        addChatMessage('system', '⏳ Подключение...');
        setTimeout(() => createGame(), 1000);
        return;
    }

    gameId = myPeerId;
    myColor = 'white';
    isOnlineGame = true;

    const gameUrl = `${window.location.origin}${window.location.pathname}?peer=${gameId}`;

    $('#gameStatus').html('🎮 Игра создана! Ждем противника...');
    showGameLink(gameUrl);

    $('#whitePlayer').text('Вы');
    $('#blackPlayer').text('Ожидание...');

    console.log('🎮 ID игры:', gameId);
};

// Переопределяем joinGame
joinGame = function () {
    if (!peer || !myPeerId) {
        addChatMessage('system', '⏳ Подключение...');
        setTimeout(() => joinGame(), 1000);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const peerIdFromUrl = urlParams.get('peer');

    if (peerIdFromUrl) {
        connectToPeer(peerIdFromUrl);
    } else {
        const inputPeerId = prompt('Введите ID игры:');
        if (inputPeerId) {
            connectToPeer(inputPeerId);
        }
    }
};

function connectToPeer(peerId) {
    console.log('🔗 Подключение к:', peerId);
    addChatMessage('system', '🔗 Подключение...');

    connection = peer.connect(peerId);

    connection.on('open', () => {
        console.log('✅ Подключено!');
        setupConnection(connection);

        myColor = 'black';
        isOnlineGame = true;
        board.flip();

        $('#gameStatus').html('✅ Вы присоединились!');
        $('#whitePlayer').text('Противник');
        $('#blackPlayer').text('Вы');
        $('#resignBtn').show();

        startTimer();
        addChatMessage('system', '✅ Подключено!');
    });

    connection.on('error', (err) => {
        console.error('❌ Ошибка:', err);
        addChatMessage('system', '❌ Не удалось подключиться');
    });
}

// Переопределяем sendMove
sendMove = function (move) {
    console.log('📤 Отправка хода:', move.san);

    if (isOnlineGame && connection && connection.open) {
        connection.send({
            type: 'move',
            move: {
                from: move.from,
                to: move.to,
                promotion: move.promotion
            }
        });
    }
};

// Переопределяем sendMessage для PeerJS
const originalSendMessageForPeer = sendMessage;
sendMessage = function () {
    const message = $('#chatInput').val().trim();
    if (!message) return;

    addChatMessage('own', message);
    $('#chatInput').val('');

    // PeerJS онлайн игра
    if (isOnlineGame && connection && connection.open) {
        connection.send({
            type: 'chat',
            message: message
        });
    }
    // Умный бот
    else if (playingWithBot) {
        setTimeout(() => {
            const botResponse = getBotChatResponse(message);
            addChatMessage('opponent', botResponse);
        }, 800 + Math.random() * 1200);
    }
};

// Автоинициализация
$(document).ready(function () {
    initPeerJS();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('peer')) {
        setTimeout(() => {
            if (!autoJoinAttempted) {
                autoJoinAttempted = true;
                $('#joinGameBtn').click();
            }
        }, 1500);
    }
});

console.log('✅ PeerJS мультиплеер загружен!');
