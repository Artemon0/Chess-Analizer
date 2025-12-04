const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    // Получение команд из меню
    onNewGame: (callback) => ipcRenderer.on('new-game', callback),
    onCreateGame: (callback) => ipcRenderer.on('create-game', callback),
    onJoinGame: (callback) => ipcRenderer.on('join-game', callback),
    onPlayBot: (callback) => ipcRenderer.on('play-bot', callback),
    onToggleAnalysis: (callback) => ipcRenderer.on('toggle-analysis', callback),
    onFlipBoard: (callback) => ipcRenderer.on('flip-board', callback),
    onShowAbout: (callback) => ipcRenderer.on('show-about', callback),

    // Информация о приложении
    isElectron: true,
    platform: process.platform
});
