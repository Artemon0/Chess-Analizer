// Скрипт для создания PNG иконки из SVG
// Использует встроенные возможности Node.js без дополнительных зависимостей

const fs = require('fs');
const path = require('path');

console.log('📦 Создание PNG иконки из SVG...\n');

const svgPath = path.join(__dirname, 'assets', 'icon.svg');
const pngPath = path.join(__dirname, 'assets', 'icon.png');

// Проверяем наличие SVG
if (!fs.existsSync(svgPath)) {
    console.error('❌ Файл icon.svg не найден в app/assets/');
    process.exit(1);
}

// Проверяем наличие PNG
if (fs.existsSync(pngPath)) {
    console.log('✅ Файл icon.png уже существует в app/assets/');
    console.log('   Если нужно пересоздать, удалите его и запустите скрипт снова.\n');
    process.exit(0);
}

console.log('⚠️  Для создания PNG иконки используйте один из способов:\n');
console.log('1. Онлайн конвертер:');
console.log('   https://cloudconvert.com/svg-to-png');
console.log('   Размер: 256x256 пикселей\n');

console.log('2. ImageMagick (если установлен):');
console.log('   magick convert -background none -density 256 assets/icon.svg -resize 256x256 assets/icon.png\n');

console.log('3. Inkscape (если установлен):');
console.log('   inkscape assets/icon.svg --export-type=png --export-filename=assets/icon.png --export-width=256 --export-height=256\n');

console.log('4. Photoshop/GIMP/любой графический редактор');
console.log('   Откройте assets/icon.svg и экспортируйте как PNG 256x256\n');

console.log('📝 Сохраните готовый icon.png в папку app/assets/\n');
console.log('💡 Подробнее: app/assets/README.md\n');
