# Конфигурация установщика

## Windows NSIS Installer

Приложение использует NSIS (Nullsoft Scriptable Install System) для создания установщика Windows.

### Особенности установщика

✅ **Установка в Program Files** (не в AppData)
- По умолчанию устанавливается в `C:\Program Files\Chess Multiplayer\`
- Пользователь может выбрать другую папку при установке

✅ **Полноценный деинсталлятор**
- Удаляет все файлы приложения
- Удаляет данные из AppData (настройки, кэш)
- Удаляет ярлыки с рабочего стола и меню Пуск
- Доступен через "Установка и удаление программ" Windows

✅ **Ярлыки**
- Создается ярлык на рабочем столе
- Создается ярлык в меню Пуск
- Опционально запускает приложение после установки

### Конфигурация (package.json)

```json
"nsis": {
  "oneClick": false,                              // Не одним кликом - показывает мастер установки
  "allowToChangeInstallationDirectory": true,     // Можно выбрать папку установки
  "perMachine": true,                             // Установка для всех пользователей (Program Files)
  "createDesktopShortcut": true,                  // Создать ярлык на рабочем столе
  "createStartMenuShortcut": true,                // Создать ярлык в меню Пуск
  "shortcutName": "Chess Multiplayer",            // Имя ярлыка
  "uninstallDisplayName": "Chess Multiplayer",    // Имя в списке программ
  "deleteAppDataOnUninstall": true,               // Удалить данные при деинсталляции
  "runAfterFinish": true,                         // Запустить после установки
  "menuCategory": true,                           // Создать категорию в меню Пуск
  "artifactName": "${productName}-Setup-${version}.${ext}"  // Имя файла установщика
}
```

### Типы сборок

1. **NSIS Installer** (`Chess Multiplayer-Setup-1.0.0.exe`)
   - Полноценный установщик с мастером
   - Создает деинсталлятор
   - Регистрируется в системе

2. **Portable** (`Chess Multiplayer-1.0.0-portable.exe`)
   - Не требует установки
   - Можно запускать с флешки
   - Не создает записи в реестре

### Требования

Для создания иконки установщика нужен файл `app/assets/icon.png` (256x256 пикселей).

См. `app/assets/README.md` для инструкций по созданию иконки.

### Сборка

```bash
# Из корня проекта
cd scripts
.\build-all.ps1

# Или только Windows
cd app
npm run build:win
```

### Результат

После сборки в папке `app/dist/` будут созданы:
- `Chess Multiplayer-Setup-1.0.0.exe` - установщик
- `Chess Multiplayer-1.0.0-portable.exe` - портативная версия

### Установка

1. Запустите `Chess Multiplayer-Setup-1.0.0.exe`
2. Выберите папку установки (по умолчанию `C:\Program Files\Chess Multiplayer\`)
3. Выберите опции (ярлыки на рабочем столе и в меню Пуск)
4. Нажмите "Установить"
5. После установки приложение запустится автоматически

### Деинсталляция

**Способ 1: Через Windows Settings**
1. Откройте "Параметры" → "Приложения" → "Установленные приложения"
2. Найдите "Chess Multiplayer"
3. Нажмите "Удалить"

**Способ 2: Через деинсталлятор**
1. Откройте папку установки (по умолчанию `C:\Program Files\Chess Multiplayer\`)
2. Запустите `Uninstall Chess Multiplayer.exe`

**Способ 3: Через меню Пуск**
1. Найдите "Chess Multiplayer" в меню Пуск
2. Правой кнопкой → "Удалить"

При деинсталляции будут удалены:
- Все файлы приложения из папки установки
- Настройки и данные из `%APPDATA%\chess-multiplayer\`
- Ярлыки с рабочего стола и меню Пуск
- Записи в реестре Windows
