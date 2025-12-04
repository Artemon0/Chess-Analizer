@echo off
echo === Chess Multiplayer Build v1.0.0 ===
echo.

cd app

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Building for Windows...
call npm run build:win

echo.
echo [3/4] Build completed!
echo.
echo [4/4] Output: app\dist\
echo.

dir dist\*.exe

echo.
echo Done! Check app\dist\ folder
echo.

cd ..
pause
