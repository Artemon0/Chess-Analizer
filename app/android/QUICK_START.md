# 🚀 Быстрый старт - Android

## Вариант 1: Автоматическая настройка (рекомендуется)

```bash
cd app/android
setup.bat
```

Затем откройте проект в Android Studio.

## Вариант 2: Ручная настройка

### 1. Создайте local.properties

Создайте файл `app/android/local.properties`:

```properties
sdk.dir=C\:\\Users\\ВашеИмя\\AppData\\Local\\Android\\Sdk
```

**Где найти путь к SDK:**
- Откройте Android Studio
- File → Settings → Appearance & Behavior → System Settings → Android SDK
- Скопируйте "Android SDK Location"
- Замените `\` на `\\` в пути

### 2. Откройте проект

1. Android Studio → File → Open
2. Выберите папку `app/android`
3. Дождитесь синхронизации Gradle (5-10 минут)

### 3. Запустите

1. Подключите Android устройство или запустите эмулятор
2. Нажмите Run (▶️) или `Shift+F10`

## Сборка APK

**Автоматически:**
```bash
cd app/android
build-apk.bat
```

**Вручную (PowerShell):**
```powershell
cd app/android
.\gradlew.bat assembleDebug
```

**Вручную (CMD):**
```cmd
cd app\android
gradlew.bat assembleDebug
```

APK будет в: `app/build/outputs/apk/debug/app-debug.apk`

## Проблемы?

См. [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) для подробной инструкции.

---

**Готово!** Приложение запущено 🎉
