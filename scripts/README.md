# 🔧 Скрипты сборки

Скрипты для автоматизации сборки приложения.

## Файлы

### `build-all.ps1`
PowerShell скрипт для сборки всех платформ (Windows, macOS, Linux).

```powershell
.\scripts\build-all.ps1
```

### `build.bat`
Простой batch файл для сборки Windows версии.

```cmd
.\scripts\build.bat
```

## Использование

### Сборка для всех платформ

```powershell
cd scripts
.\build-all.ps1
```

### Только Windows

```cmd
cd scripts
.\build.bat
```

### Вручную

```bash
cd app
npm install
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Результат

Собранные файлы находятся в `app/dist/`:
- Windows: `.exe` файлы
- macOS: `.dmg` и `.zip`
- Linux: `.AppImage` и `.deb`

## Требования

- Node.js 16+
- npm
- Интернет для загрузки зависимостей

Подробнее: [BUILD.md](../documentation/BUILD.md)
