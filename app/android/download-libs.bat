@echo off
echo ========================================
echo Downloading libraries for Android
echo ========================================
echo.

echo Downloading jQuery...
powershell -Command "Invoke-WebRequest -Uri 'https://code.jquery.com/jquery-3.6.0.min.js' -OutFile 'app\src\main\assets\jquery.min.js'"

echo Downloading Chess.js...
powershell -Command "Invoke-WebRequest -Uri 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js' -OutFile 'app\src\main\assets\chess.js'"

echo Downloading Chessboard.js CSS...
powershell -Command "Invoke-WebRequest -Uri 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css' -OutFile 'app\src\main\assets\chessboard.min.css'"

echo Downloading Chessboard.js...
powershell -Command "Invoke-WebRequest -Uri 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js' -OutFile 'app\src\main\assets\chessboard.min.js'"

echo Downloading PeerJS...
powershell -Command "Invoke-WebRequest -Uri 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js' -OutFile 'app\src\main\assets\peerjs.min.js'"

echo Downloading Stockfish.js...
powershell -Command "Invoke-WebRequest -Uri 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js' -OutFile 'app\src\main\assets\stockfish.js'"

echo.
echo ========================================
echo Done! All libraries downloaded
echo ========================================
echo.
echo Files in assets:
dir app\src\main\assets\*.js
echo.
pause
