@echo off
echo ========================================
echo Chess Multiplayer Android - Setup
echo ========================================
echo.

REM Проверка наличия ANDROID_HOME
if not defined ANDROID_HOME (
    echo [ERROR] ANDROID_HOME not set!
    echo.
    echo Please set ANDROID_HOME environment variable:
    echo Example: C:\Users\YourName\AppData\Local\Android\Sdk
    echo.
    echo Or create local.properties manually with:
    echo sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
    echo.
    pause
    exit /b 1
)

echo [OK] ANDROID_HOME found: %ANDROID_HOME%
echo.

REM Создание local.properties
echo Creating local.properties...
set SDK_PATH=%ANDROID_HOME:\=\\%
echo sdk.dir=%SDK_PATH%> local.properties
echo [OK] local.properties created
echo.
echo SDK path: %SDK_PATH%
echo.

REM Проверка Gradle
echo Checking Gradle...
if exist gradlew.bat (
    echo [OK] Gradle wrapper found
) else (
    echo [WARNING] Gradle wrapper not found
    echo Please run: gradle wrapper
)
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open project in Android Studio
echo 2. Wait for Gradle sync
echo 3. Run the app
echo.
pause
