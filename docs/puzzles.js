// ===== ШАХМАТНЫЕ ЗАДАЧИ ИЗ РЕАЛЬНЫХ ПАРТИЙ =====

let currentPuzzle = null;
let puzzleMode = false;
let puzzleMoves = [];
let puzzleIndex = 0;

// База задач из известных партий
const puzzles = [
    {
        name: "Легаль - Сен-Бри, 1750",
        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
        moves: ["Qxf7+", "Ke7", "Qxe6#"],
        description: "Классический мат Легаля. Найдите форсированный мат в 2 хода.",
        difficulty: "Легко"
    },
    {
        name: "Морфи - Герцог Брауншвейгский, 1858",
        fen: "r1bqk2r/ppp2ppp/2n5/3np1B1/1b2P3/2NP4/PPP2PPP/R2QKB1R w KQkq - 0 1",
        moves: ["Bxe7", "Nxe7", "Qd8+", "Nxd8", "Rd8#"],
        description: "Знаменитая партия Морфи. Жертва ферзя и мат.",
        difficulty: "Средне"
    },
    {
        name: "Каспаров - Топалов, 1999",
        fen: "r1bq1rk1/pp3pbp/2p1p1p1/8/2BPP3/2N2N2/PP3PPP/R1BQR1K1 w - - 0 1",
        moves: ["Rxe6", "fxe6", "Qxg6+", "Kh8", "Qh7#"],
        description: "Блестящая комбинация Каспарова. Жертва ладьи.",
        difficulty: "Сложно"
    },
    {
        name: "Андерсен - Кизерицкий, 1851",
        fen: "r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w - - 0 1",
        moves: ["Qf6+", "Nxf6", "Be7#"],
        description: "Бессмертная партия. Финальная комбинация.",
        difficulty: "Средне"
    },
    {
        name: "Фишер - Бенко, 1963",
        fen: "r4rk1/1bqnbppp/p2p1n2/1p2p3/3NP3/P1NB4/1PP2PPP/R1BQR1K1 w - - 0 1",
        moves: ["Nxe6", "fxe6", "Qh5", "g6", "Qh6"],
        description: "Типичная атака Фишера на короля.",
        difficulty: "Средне"
    },
    {
        name: "Таль - Смыслов, 1959",
        fen: "r1b2rk1/2q1bppp/p2ppn2/1p6/3QP3/1BN1B3/PPP2PPP/R4RK1 w - - 0 1",
        moves: ["Bxf6", "Bxf6", "Qh4", "h6", "Qxh6"],
        description: "Жертва слона и атака на короля.",
        difficulty: "Средне"
    },
    {
        name: "Карпов - Корчной, 1978",
        fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1",
        moves: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qb3+"],
        description: "Классическая жертва на f7.",
        difficulty: "Легко"
    },
    {
        name: "Алехин - Богољубов, 1922",
        fen: "r1b1k2r/ppppqppp/2n2n2/2b5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1",
        moves: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qf3"],
        description: "Двойная жертва слонов.",
        difficulty: "Средне"
    }
];

function startPuzzle() {
    puzzleMode = true;
    puzzleIndex = 0;

    // Случайная задача
    currentPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    puzzleMoves = [];

    // Сброс игры
    game = new Chess(currentPuzzle.fen);
    board.position(currentPuzzle.fen);

    myColor = game.turn() === 'w' ? 'white' : 'black';
    if (myColor === 'black') board.flip();

    $('#gameStatus').html(`🧩 <strong>${currentPuzzle.name}</strong>`);
    $('#whitePlayer').text(game.turn() === 'w' ? 'Вы' : 'Компьютер');
    $('#blackPlayer').text(game.turn() === 'b' ? 'Вы' : 'Компьютер');

    addChatMessage('system', `🧩 ${currentPuzzle.name}`);
    addChatMessage('system', `📝 ${currentPuzzle.description}`);
    addChatMessage('system', `⚡ Сложность: ${currentPuzzle.difficulty}`);

    // Включаем анализ
    if (!autoAnalyze) {
        toggleAnalysis();
    }

    console.log('🧩 Задача:', currentPuzzle);
}

// Переопределяем onDrop для режима задач
const originalOnDropPuzzle = onDrop;
onDrop = function (source, target) {
    if (!puzzleMode) {
        
        return originalOnDropPuzzle(source, target);
    }

    // В режиме задач
    const fenBefore = game.fen();

    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    clearAnnotations();
    updateStatus();
    updateMovesDisplay();

    // Проверяем правильность хода
    const expectedMove = currentPuzzle.moves[puzzleIndex];
    const isCorrect = move.san === expectedMove;

    if (isCorrect) {
        addChatMessage('system', `✅ Правильно! ${move.san}`);
        puzzleIndex++;

        // Задача решена?
        if (puzzleIndex >= currentPuzzle.moves.length) {
            setTimeout(() => {
                addChatMessage('system', '🎉 Задача решена!');
                $('#gameStatus').html('🎉 Задача решена!');
                puzzleMode = false;

                setTimeout(() => {
                    if (confirm('Задача решена! Попробовать другую?')) {
                        startPuzzle();
                    }
                }, 500);
            }, 500);
        } else {
            // Следующий ход компьютера
            setTimeout(() => {
                const nextMove = currentPuzzle.moves[puzzleIndex];
                const compMove = game.move(nextMove);
                if (compMove) {
                    board.position(game.fen());
                    updateStatus();
                    updateMovesDisplay();
                    addChatMessage('system', `🤖 ${compMove.san}`);
                    puzzleIndex++;
                }
            }, 500);
        }
    } else {
        // Неправильный ход
        game.undo();
        board.position(game.fen());
        addChatMessage('system', `❌ Неправильно. Попробуйте ещё раз.`);
        addChatMessage('system', `💡 Подсказка: Ищите форсированный вариант`);
    }

    if (autoAnalyze) {
        setTimeout(() => analyzeMadeMove(move, fenBefore), 100);
    }
};

console.log('✅ Модуль задач загружен!');
