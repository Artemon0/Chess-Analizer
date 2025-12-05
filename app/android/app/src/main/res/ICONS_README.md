# Иконки приложения

## Текущая реализация

Используется векторная иконка (XML) для всех версий Android.

**Файлы:**
- `drawable/ic_launcher_foreground.xml` - векторная иконка (шахматный король)
- `drawable/ic_launcher_legacy.xml` - комбинация фона и иконки
- `mipmap-anydpi-v26/ic_launcher.xml` - адаптивная иконка (Android 8.0+)
- `values/colors.xml` - цвет фона (#312e2b)

## Улучшение иконок (опционально)

Для лучшего качества можно создать PNG иконки разных размеров:

### Требуемые размеры:

- **mdpi**: 48x48 px
- **hdpi**: 72x72 px
- **xhdpi**: 96x96 px
- **xxhdpi**: 144x144 px
- **xxxhdpi**: 192x192 px

### Как создать:

1. Используйте `assets/icon.svg` из корня проекта
2. Конвертируйте в PNG нужных размеров
3. Сохраните как `ic_launcher.png` в соответствующие папки mipmap-*

### Инструменты:

**Онлайн:**
- https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- Загрузите SVG, выберите размеры, скачайте

**Локально:**
```bash
# ImageMagick
magick convert -background none -density 192 icon.svg -resize 48x48 mipmap-mdpi/ic_launcher.png
magick convert -background none -density 192 icon.svg -resize 72x72 mipmap-hdpi/ic_launcher.png
magick convert -background none -density 192 icon.svg -resize 96x96 mipmap-xhdpi/ic_launcher.png
magick convert -background none -density 192 icon.svg -resize 144x144 mipmap-xxhdpi/ic_launcher.png
magick convert -background none -density 192 icon.svg -resize 192x192 mipmap-xxxhdpi/ic_launcher.png
```

## Текущая иконка работает!

Векторная иконка отлично работает на всех версиях Android и не требует дополнительных PNG файлов.
