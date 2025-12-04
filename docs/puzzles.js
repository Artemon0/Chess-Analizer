// ===== ШАХМАТНЫЕ ЗАДАЧИ ПО КАТЕГОРИЯМ =====

let currentPuzzle = null;
let puzzleMode = false;
let puzzleMoves = [];
let puzzleIndex = 0;
let currentCategory = 'famous';

// База задач по категориям
const puzzlesByCategory = {
    mate1: [
        {
            name: "Мат в 1 ход #1",
            fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
            moves: ["Re8#"],
            description: "Простой мат ладьей по последней горизонтали.",
            category: "mate1"
        },
        {
            name: "Мат в 1 ход #2",
            fen: "r5k1/5ppp/8/8/8/8/5PPP/4RK2 w - - 0 1",
            moves: ["Re8#"],
            description: "Мат ладьей. Король в углу.",
            category: "mate1"
        },
        {
            name: "Мат в 1 ход #3",
            fen: "6k1/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1",
            moves: ["Rf8#"],
            description: "Мат ладьей по вертикали.",
            category: "mate1"
        },
        {
            name: "Мат в 1 ход #4",
            fen: "6k1/6pp/8/8/8/8/6PP/5Q1K w - - 0 1",
            moves: ["Qf8#"],
            description: "Мат ферзем по последней горизонтали.",
            category: "mate1"
        },
        {
            name: "Мат в 1 ход #5",
            fen: "r4rk1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
            moves: ["Re8#"],
            description: "Мат ладьей. Ладья противника не мешает.",
            category: "mate1"
        }
    ],

    mate2: [
        {
            name: "Легаль - Сен-Бри, 1750",
            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
            moves: ["Qxf7+", "Ke7", "Qxe6#"],
            description: "Классический мат Легаля.",
            category: "mate2"
        },
        {
            name: "Мат в 2 хода #2",
            fen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1",
            moves: ["Nxf7", "Qxf7#"],
            description: "Жертва ферзя и мат.",
            category: "mate2"
        },
        {
            name: "Мат в 2 хода #3",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1",
            moves: ["Bxf7+", "Kxf7", "Ng5#"],
            description: "Жертва слона на f7.",
            category: "mate2"
        }
    ],

    mate3: [
        {
            name: "Каспаров - Топалов, 1999",
            fen: "r1bq1rk1/pp3pbp/2p1p1p1/8/2BPP3/2N2N2/PP3PPP/R1BQR1K1 w - - 0 1",
            moves: ["Rxe6", "fxe6", "Qxg6+", "Kh8", "Qh7#"],
            description: "Блестящая комбинация Каспарова.",
            category: "mate3"
        },
        {
            name: "Мат в 3 хода #2",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1",
            moves: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qf3#"],
            description: "Классическая атака на f7.",
            category: "mate3"
        }
    ],

    tactics: [
        {
            name: "Двойной удар",
            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
            moves: ["Ng5", "d5", "Qf3"],
            description: "Атака на f7 и угроза двойного удара.",
            category: "tactics"
        },
        {
            name: "Вилка конем",
            fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
            moves: ["Nxe5", "Nxe5", "d4"],
            description: "Вилка - атака на короля и ферзя.",
            category: "tactics"
        },
        {
            name: "Связка",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1",
            moves: ["Ng5", "O-O", "Qf3"],
            description: "Использование связки для атаки.",
            category: "tactics"
        }
    ],

    endgame: [
        {
            name: "Король и пешка",
            fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
            moves: ["Kd3", "Kd5", "e4+", "Ke5", "Ke3"],
            description: "Проведение пешки в ферзи.",
            category: "endgame"
        },
        {
            name: "Ладейный эндшпиль",
            fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
            moves: ["Re7", "Kf8", "Rxf7+", "Kg8", "Rxg7+"],
            description: "Активная ладья в эндшпиле.",
            category: "endgame"
        }
    ],

    famous: [
        {
            name: "Морфи - Герцог Брауншвейгский, 1858",
            fen: "r1bqk2r/ppp2ppp/2n5/3np1B1/1b2P3/2NP4/PPP2PPP/R2QKB1R w KQkq - 0 1",
            moves: ["Bxe7", "Nxe7", "Qd8+", "Nxd8", "Rd8#"],
            description: "Знаменитая партия Морфи. Жертва ферзя.",
            category: "famous"
        },
        {
            name: "Андерсен - Кизерицкий, 1851",
            fen: "r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w - - 0 1",
            moves: ["Qf6+", "Nxf6", "Be7#"],
            description: "Бессмертная партия.",
            category: "famous"
        },
        {
            name: "Фишер - Бенко, 1963",
            fen: "r4rk1/1bqnbppp/p2p1n2/1p2p3/3NP3/P1NB4/1PP2PPP/R1BQR1K1 w - - 0 1",
            moves: ["Nxe6", "fxe6", "Qh5", "g6", "Qh6"],
            description: "Типичная атака Фишера.",
            category: "famous"
        },
        {
            name: "Таль - Смыслов, 1959",
            fen: "r1b2rk1/2q1bppp/p2ppn2/1p6/3QP3/1BN1B3/PPP2PPP/R4RK1 w - - 0 1",
            moves: ["Bxf6", "Bxf6", "Qh4", "h6", "Qxh6"],
            description: "Жертва слона Таля.",
            category: "famous"
        }
    ]
};

function startPuzzle(category = 'famous') {
    currentCategory = category;
    puzzleMode = true;
    puzzleIndex = 0;

    // Получаем задачи выбранной категории
    const categoryPuzzles = puzzlesByCategory[category] || puzzlesByCategory.famous;

    // Случайная задача из категории
    currentPuzzle = categoryPuzzles[Math.floor(Math.random() * categoryPuzzles.length)];
    puzzleMoves = [];

    // Сброс игры
    game = new Chess(currentPuzzle.fen);
    board.position(currentPuzzle.fen);

    myColor = game.turn() === 'w' ? 'white' : 'black';
    if (myColor === 'black') board.flip();

    $('#gameStatus').html(`🧩 <strong>${currentPuzzle.name}</strong>`);
    $('#whitePlayer').text(game.turn() === 'w' ? t('you') : t('opponent'));
    $('#blackPlayer').text(game.turn() === 'b' ? t('you') : t('opponent'));

    addChatMessage('system', `🧩 ${currentPuzzle.name}`);
    addChatMessage('system', `📝 ${currentPuzzle.description}`);

    // Показываем кнопку подсказки
    $('#hintBtn').show();
    $('#resignBtn').hide();

    // Включаем анализ
    if (!autoAnalyze) {
        toggleAnalysis();
    }

    console.log('🧩 Задача:', currentPuzzle, 'Категория:', category);
}

console.log('🧩 Система задач загружена');
