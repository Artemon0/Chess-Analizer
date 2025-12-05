@echo off
echo ========================================
echo Downloading libraries for Android
echo ========================================
echo.

cd app\src\main\assets

echo Downloading jQuery...
curl -o jquery.min.js https://code.jquery.com/jquery-3.6.0.min.js

echo Downloading Chess.js...
curl -o chess.js https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js

echo Downloading Chessboard.js CSS...
curl -o chessboard.min.css https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css

echo Downloading Chessboard.js...
curl -o chessboard.min.js https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js

echo Downloading Stockfish.js...
curl -o stockfish.js https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js

echo.
echo ========================================
echo Done! Libraries downloaded
echo ========================================
pause
