# Скрипт сборки для всех платформ

Write-Host "=== Chess Multiplayer - Сборка v1.0.0 ===" -ForegroundColor Green
Write-Host ""

# Переходим в папку app
Set-Location app

Write-Host "📦 Установка зависимостей..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🔨 Сборка для всех платформ..." -ForegroundColor Cyan
Write-Host ""

# Windows
Write-Host "🪟 Windows..." -ForegroundColor Yellow
npm run build:win

# macOS
Write-Host "🍎 macOS..." -ForegroundColor Yellow
npm run build:mac

# Linux
Write-Host "🐧 Linux..." -ForegroundColor Yellow
npm run build:linux

Write-Host ""
Write-Host "✅ Сборка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Файлы находятся в: app/dist/" -ForegroundColor Cyan
Write-Host ""

# Показываем размеры
Write-Host "📊 Размеры файлов:" -ForegroundColor Cyan
Get-ChildItem dist/*.exe, dist/*.dmg, dist/*.AppImage, dist/*.deb -ErrorAction SilentlyContinue | 
    Select-Object Name, @{Name="Size (MB)";Expression={[math]::Round($_.Length/1MB, 2)}} | 
    Format-Table -AutoSize

Set-Location ..
