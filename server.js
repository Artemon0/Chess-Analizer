// ===== УЛУЧШЕННЫЙ WEBSOCKET СЕРВЕР =====

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;

// HTTP сервер
const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Убираем параметры
    let urlPath = req.url.split('?')[0];
    let filePath = '.' + urlPath;

    if (filePath === './' || filePath === './') {
        filePath = './multiplayer.html';
    }

    const extname = path.extname(filePath);
    const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
    }[extname] || 'text/plain';

    const clientIP = req.socket.remoteAddress;
    console.log(`📄 [${clientIP}] ${req.url} → ${filePath}`);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            console.log(`❌ [${clientIP}] Ошибка: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`<html><body style="font-family:Arial;padding:50px;text-align:center;">
                <h1>❌ Файл не найден</h1>
                <p>${filePath}</p>
                <a href="/multiplayer.html">← Вернуться</a>
            </body></html>`);
        } else {
            console.log(`✅ [${clientIP}] OK: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// WebSocket сервер
const wss = new WebSocket.Server({ server });
const games = new Map();
let connectionCount = 0;

wss.on('connection', (ws, req) => {
    connectionCount++;
    const clientIP = req.socket.remoteAddress;
    console.log(`✅ [${connectionCount}] Подключение от ${clientIP}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📨 [${clientIP}] ${data.type}`);

            switch (data.type) {
                case 'create_game':
                    handleCreateGame(ws, data, clientIP);
                    break;
                case 'join_game':
                    handleJoinGame(ws, data, clientIP);
                    break;
                case 'move':
                    handleMove(ws, data, clientIP);
                    break;
                case 'chat':
                    handleChat(ws, data, clientIP);
                    break;
            }
        } catch (error) {
            console.error(`❌ [${clientIP}] Ошибка:`, error.message);
        }
    });

    ws.on('close', () => {
        console.log(`❌ [${clientIP}] Отключение`);
        handleDisconnect(ws);
    });

    ws.on('error', (error) => {
        console.error(`❌ [${clientIP}] WebSocket ошибка:`, error.message);
    });
});

function handleCreateGame(ws, data, clientIP) {
    const gameId = generateGameId();
    const game = {
        id: gameId,
        white: ws,
        black: null,
        timeControl: data.timeControl || 600,
        moves: [],
        created: Date.now()
    };

    games.set(gameId, game);
    ws.gameId = gameId;
    ws.color = 'white';

    ws.send(JSON.stringify({
        type: 'game_created',
        gameId: gameId,
        color: 'white',
        timeControl: game.timeControl
    }));

    console.log(`🎮 [${clientIP}] Игра создана: ${gameId} (${game.timeControl}s)`);
}

function handleJoinGame(ws, data, clientIP) {
    const game = games.get(data.gameId);

    if (!game) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Игра не найдена'
        }));
        console.log(`❌ [${clientIP}] Игра не найдена: ${data.gameId}`);
        return;
    }

    if (game.black) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Игра уже заполнена'
        }));
        console.log(`❌ [${clientIP}] Игра заполнена: ${data.gameId}`);
        return;
    }

    game.black = ws;
    ws.gameId = data.gameId;
    ws.color = 'black';

    ws.send(JSON.stringify({
        type: 'game_joined',
        gameId: data.gameId,
        color: 'black',
        timeControl: game.timeControl
    }));

    game.white.send(JSON.stringify({
        type: 'opponent_joined',
        message: 'Противник присоединился!'
    }));

    console.log(`🔗 [${clientIP}] Присоединился к игре: ${data.gameId}`);
}

function handleMove(ws, data, clientIP) {
    const game = games.get(ws.gameId);
    if (!game) return;

    game.moves.push(data.move);

    const opponent = ws.color === 'white' ? game.black : game.white;
    if (opponent && opponent.readyState === WebSocket.OPEN) {
        opponent.send(JSON.stringify({
            type: 'opponent_move',
            move: data.move
        }));
    }

    console.log(`♟️ [${clientIP}] Ход: ${data.move.from}-${data.move.to}`);
}

function handleChat(ws, data, clientIP) {
    const game = games.get(ws.gameId);
    if (!game) return;

    const opponent = ws.color === 'white' ? game.black : game.white;
    if (opponent && opponent.readyState === WebSocket.OPEN) {
        opponent.send(JSON.stringify({
            type: 'chat_message',
            message: data.message
        }));
    }

    console.log(`💬 [${clientIP}] Чат: ${data.message}`);
}

function handleDisconnect(ws) {
    if (!ws.gameId) return;

    const game = games.get(ws.gameId);
    if (!game) return;

    const opponent = ws.color === 'white' ? game.black : game.white;
    if (opponent && opponent.readyState === WebSocket.OPEN) {
        opponent.send(JSON.stringify({
            type: 'opponent_disconnected',
            message: 'Противник отключился'
        }));
    }

    games.delete(ws.gameId);
    console.log(`🗑️ Игра удалена: ${ws.gameId}`);
}

function generateGameId() {
    return Math.random().toString(36).substring(2, 9);
}

// Запуск сервера
server.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log('🎮 ШАХМАТНЫЙ СЕРВЕР ЗАПУЩЕН!');
    console.log('='.repeat(50) + '\n');

    console.log('📡 Локально:');
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}\n`);

    console.log('📱 WiFi адреса (отправьте друзьям):');

    const interfaces = os.networkInterfaces();
    Object.keys(interfaces).forEach(name => {
        interfaces[name].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Пропускаем VirtualBox адреса
                if (!iface.address.startsWith('192.168.56')) {
                    console.log(`   http://${iface.address}:${PORT}`);
                }
            }
        });
    });

    console.log('\n💡 Инструкция:');
    console.log('   1. Откройте любой адрес выше');
    console.log('   2. Нажмите "Создать игру"');
    console.log('   3. Скопируйте ссылку');
    console.log('   4. Отправьте другу');
    console.log('   5. Играйте!\n');

    console.log('🔧 Для остановки: Ctrl + C\n');
    console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Остановка сервера...');
    wss.clients.forEach(client => {
        client.close();
    });
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});
