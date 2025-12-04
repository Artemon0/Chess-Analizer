# 🔨 Сборка приложения

## Требования

- Node.js 16+
- npm или yarn

## Сборка десктопного приложения

### Все платформы (на текущей ОС)

```bash
cd app
npm install
npm run build
```

### Windows

```bash
cd app
npm install
npm run build:win
```

Результат:
- `app/dist/Chess Multiplayer-Setup-1.0.0.exe` - установщик NSIS
- `app/dist/Chess Multiplayer-1.0.0-portable.exe` - portable версия

**Особенности установщика:**
- ✅ Установка в Program Files (не в AppData)
- ✅ Выбор папки установки
- ✅ Полноценный деинсталлятор
- ✅ Ярлыки на рабочем столе и в меню Пуск

См. [INSTALLER.md](INSTALLER.md) для подробностей.

### macOS

```bash
cd app
npm install
npm run build:mac
```

Результат:
- `app/dist/Chess Multiplayer-1.0.0.dmg` - установщик
- `app/dist/Chess Multiplayer-1.0.0-mac.zip` - архив

### Linux

```bash
cd app
npm install
npm run build:linux
```

Результат:
- `app/dist/Chess Multiplayer-1.0.0.AppImage` - AppImage
- `app/dist/chess-multiplayer_1.0.0_amd64.deb` - DEB пакет

## Веб-версия

Веб-версия не требует сборки. Файлы готовы к деплою:

### GitHub Pages

Файлы в папке `docs/` готовы для GitHub Pages.

### Vercel

```bash
vercel deploy
```

### Локальный сервер

```bash
npm install
npm start
```

Откройте http://localhost:8080

## Структура сборки

```
app/dist/
├── win-unpacked/          # Windows (распакованная)
├── mac/                   # macOS (распакованная)
├── linux-unpacked/        # Linux (распакованная)
├── Chess Multiplayer Setup 1.0.0.exe
├── Chess Multiplayer 1.0.0.exe
├── Chess Multiplayer-1.0.0.dmg
├── Chess Multiplayer-1.0.0-mac.zip
├── Chess Multiplayer-1.0.0.AppImage
└── chess-multiplayer_1.0.0_amd64.deb
```

## Размеры

- Windows installer: ~80 MB
- macOS DMG: ~90 MB
- Linux AppImage: ~85 MB

## Проблемы

### Ошибка "electron-builder not found"

```bash
cd app
npm install --save-dev electron-builder
```

### Ошибка прав на macOS

```bash
chmod +x "app/dist/Chess Multiplayer.app"
```

### Ошибка на Linux

```bash
chmod +x "app/dist/Chess Multiplayer-1.0.0.AppImage"
```

## Автоматическая сборка (CI/CD)

Для автоматической сборки на GitHub Actions создайте `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd app
          npm install
      
      - name: Build
        run: |
          cd app
          npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}
          path: app/dist/*
```

---

**Готово!** Собранные приложения готовы к распространению.
