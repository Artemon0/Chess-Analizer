# Assets

Графические ресурсы приложения.

## Иконки

### icon.svg
Векторная иконка приложения (шахматная доска с королем).

### Создание icon.png для Windows installer

Для создания PNG иконки из SVG используйте один из способов:

**Способ 1: Онлайн конвертер**
1. Откройте https://cloudconvert.com/svg-to-png
2. Загрузите `icon.svg`
3. Установите размер 256x256 пикселей
4. Скачайте как `icon.png`

**Способ 2: ImageMagick (если установлен)**
```bash
magick convert -background none -density 256 icon.svg -resize 256x256 icon.png
```

**Способ 3: Inkscape (если установлен)**
```bash
inkscape icon.svg --export-type=png --export-filename=icon.png --export-width=256 --export-height=256
```

**Способ 4: Photoshop/GIMP**
1. Откройте `icon.svg`
2. Установите размер 256x256 пикселей
3. Экспортируйте как PNG

Сохраните готовый `icon.png` в эту же папку (`app/assets/`).
