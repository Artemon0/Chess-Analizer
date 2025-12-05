@echo off
echo ========================================
echo Building Chess Multiplayer APK
echo ========================================
echo.

echo [1/3] Cleaning...
call gradlew.bat clean

echo.
echo [2/3] Building Debug APK...
call gradlew.bat assembleDebug

echo.
echo [3/3] Done!
echo.
echo ========================================
echo APK Location:
echo app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.

if exist app\build\outputs\apk\debug\app-debug.apk (
    echo [OK] APK created successfully!
    echo.
    echo Size:
    dir app\build\outputs\apk\debug\app-debug.apk | find "app-debug.apk"
) else (
    echo [ERROR] APK not found!
)

echo.
pause
