// Обработчики событий от Electron меню

if (window.electron && window.electron.isElectron) {
    console.log('🖥️ Electron handlers loaded');

    // Новая игра
    window.electron.onNewGame(() => {
        console.log('Menu: New Game');
        resetGame();
    });

    // Создать игру
    window.electron.onCreateGame(() => {
        console.log('Menu: Create Game');
        createGame();
    });

    // Присоединиться
    window.electron.onJoinGame(() => {
        console.log('Menu: Join Game');
        joinGame();
    });

    // Играть с ботом
    window.electron.onPlayBot(() => {
        console.log('Menu: Play Bot');
        playWithBot();
    });

    // Анализ
    window.electron.onToggleAnalysis(() => {
        console.log('Menu: Toggle Analysis');
        toggleAnalysis();
    });

    // Перевернуть доску
    window.electron.onFlipBoard(() => {
        console.log('Menu: Flip Board');
        if (board) {
            board.flip();
        }
    });

    // О программе
    window.electron.onShowAbout(() => {
        console.log('Menu: Show About');
        alert('Chess Multiplayer v1.0.0\n\nРазработчик: AOGames Studios\n\nШахматы с анализом в реальном времени');
    });
}
