# ♟️ Chess Multiplayer - Desktop App

Десктопное приложение на Electron.

## 🚀 Быстрый старт

```bash
npm install
npm start
```

## 📦 Сборка

```bash
npm run build        # Сборка для текущей ОС
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

Готовое приложение в папке `dist/`

## ⌨️ Горячие клавиши

- `Ctrl+N` - Новая игра
- `Ctrl+C` - Создать игру
- `Ctrl+J` - Присоединиться
- `Ctrl+B` - Играть с ботом
- `Ctrl+A` - Анализ
- `Ctrl+F` - Перевернуть доску
- `F11` - Полноэкранный режим
- `Ctrl+Q` - Выход

## 🔄 Синхронизация с веб-версией

Файлы в `renderer/` - копии из корня проекта. Для обновления:

```powershell
# Windows (из корня проекта)
.\app\sync.ps1
```

Или вручную:
```bash
copy index.html app\renderer\
copy multiplayer.* app\renderer\
copy puzzles.js app\renderer\
copy firebase-config.js app\renderer\
copy supabase-multiplayer.js app\renderer\
```

## 📁 Структура

```
app/
├── main.js          # Главный процесс Electron
├── preload.js       # Preload скрипт
├── package.json     # Зависимости и настройки сборки
└── renderer/        # Веб-приложение (копия из корня)
```
