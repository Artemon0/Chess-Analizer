const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        backgroundColor: '#312e2b',
        show: false
    });

    // Загружаем index.html из renderer
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Показываем окно когда готово
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Открываем DevTools в режиме разработки
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Создаем меню
    createMenu();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createMenu() {
    const template = [
        {
            label: 'Файл',
            submenu: [
                {
                    label: 'Новая игра',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('new-game');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Выход',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Игра',
            submenu: [
                {
                    label: 'Создать игру',
                    accelerator: 'CmdOrCtrl+C',
                    click: () => {
                        mainWindow.webContents.send('create-game');
                    }
                },
                {
                    label: 'Присоединиться',
                    accelerator: 'CmdOrCtrl+J',
                    click: () => {
                        mainWindow.webContents.send('join-game');
                    }
                },
                {
                    label: 'Играть с ботом',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => {
                        mainWindow.webContents.send('play-bot');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Анализ',
                    accelerator: 'CmdOrCtrl+A',
                    click: () => {
                        mainWindow.webContents.send('toggle-analysis');
                    }
                }
            ]
        },
        {
            label: 'Вид',
            submenu: [
                {
                    label: 'Полноэкранный режим',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                {
                    label: 'Перевернуть доску',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        mainWindow.webContents.send('flip-board');
                    }
                },
                { type: 'separator' },
                { role: 'reload', label: 'Перезагрузить' },
                { role: 'toggleDevTools', label: 'Инструменты разработчика' }
            ]
        },
        {
            label: 'Помощь',
            submenu: [
                {
                    label: 'О программе',
                    click: () => {
                        mainWindow.webContents.send('show-about');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
