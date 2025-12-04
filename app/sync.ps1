# Скрипт синхронизации веб-файлов с десктопным приложением

Write-Host "🔄 Синхронизация файлов..." -ForegroundColor Cyan

$files = @(
    "index.html",
    "multiplayer.css",
    "multiplayer.js",
    "puzzles.js",
    "supabase-multiplayer.js"
)

foreach ($file in $files) {
    $source = Join-Path ".." $file
    $dest = Join-Path "renderer" $file
    
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "✅ $file скопирован" -ForegroundColor Green
    } else {
        Write-Host "❌ $file не найден" -ForegroundColor Red
    }
}

Write-Host "`n✨ Синхронизация завершена!" -ForegroundColor Green
