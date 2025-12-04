# Chess Multiplayer Build Script v1.0.0

Write-Host "=== Chess Multiplayer - Build v1.0.0 ===" -ForegroundColor Green
Write-Host ""

# Go to app folder
Set-Location app

Write-Host "[1/4] Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "[2/4] Building for all platforms..." -ForegroundColor Cyan
Write-Host ""

# Windows
Write-Host "  > Windows..." -ForegroundColor Yellow
npm run build:win

# macOS
Write-Host "  > macOS..." -ForegroundColor Yellow
npm run build:mac

# Linux
Write-Host "  > Linux..." -ForegroundColor Yellow
npm run build:linux

Write-Host ""
Write-Host "[3/4] Build completed!" -ForegroundColor Green
Write-Host ""
Write-Host "[4/4] Output location: app/dist/" -ForegroundColor Cyan
Write-Host ""

# Show file sizes
Write-Host "File sizes:" -ForegroundColor Cyan
Get-ChildItem dist/*.exe, dist/*.dmg, dist/*.AppImage, dist/*.deb -ErrorAction SilentlyContinue | 
    Select-Object Name, @{Name="Size (MB)";Expression={[math]::Round($_.Length/1MB, 2)}} | 
    Format-Table -AutoSize

Write-Host ""
Write-Host "Done! Files are ready in app/dist/" -ForegroundColor Green

Set-Location ..
