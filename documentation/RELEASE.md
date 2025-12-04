# 🚀 Инструкция по созданию релиза

## Текущий статус

✅ **Готово к релизу v1.0.0**

- ✅ Код закоммичен
- ✅ Тег создан: `v1.0.0`
- ✅ Документация готова
- ✅ Конфигурация сборки настроена

## Следующие шаги

### 1. Push в GitHub

```bash
git push origin master
git push origin v1.0.0
```

### 2. Сборка приложений

#### Автоматическая (рекомендуется)

```powershell
.\build-all.ps1
```

#### Вручную

```bash
cd app
npm install
npm run build:win
npm run build:mac
npm run build:linux
```

Результат в `app/dist/`:
- `Chess Multiplayer Setup 1.0.0.exe` (Windows installer)
- `Chess Multiplayer 1.0.0.exe` (Windows portable)
- `Chess Multiplayer-1.0.0.dmg` (macOS)
- `Chess Multiplayer-1.0.0-mac.zip` (macOS archive)
- `Chess Multiplayer-1.0.0.AppImage` (Linux)
- `chess-multiplayer_1.0.0_amd64.deb` (Linux DEB)

### 3. Создание релиза на GitHub

1. Перейдите на https://github.com/yourusername/chess-multiplayer/releases
2. Нажмите **"Draft a new release"**
3. Выберите тег: `v1.0.0`
4. Название: `Chess Multiplayer v1.0.0`
5. Описание: скопируйте из `RELEASE_NOTES.md`
6. Загрузите файлы из `app/dist/`:
   - Windows: `.exe` файлы
   - macOS: `.dmg` и `.zip`
   - Linux: `.AppImage` и `.deb`
7. Отметьте **"Set as the latest release"**
8. Нажмите **"Publish release"**

### 4. Деплой веб-версии

#### GitHub Pages

Уже настроено! Файлы в `docs/` автоматически деплоятся.

Проверьте: https://yourusername.github.io/chess-multiplayer/

#### Vercel

```bash
vercel deploy --prod
```

### 5. Анонс

После публикации релиза:

1. Обновите README.md с ссылками на релиз
2. Создайте пост в социальных сетях
3. Добавьте в chess communities

## Структура релиза

```
Release v1.0.0
├── Chess-Multiplayer-Setup-1.0.0.exe      (~80 MB)
├── Chess-Multiplayer-1.0.0.exe            (~80 MB)
├── Chess-Multiplayer-1.0.0.dmg            (~90 MB)
├── Chess-Multiplayer-1.0.0-mac.zip        (~85 MB)
├── Chess-Multiplayer-1.0.0.AppImage       (~85 MB)
└── chess-multiplayer_1.0.0_amd64.deb      (~80 MB)
```

## Checklist

- [x] Код готов и протестирован
- [x] Версия обновлена в package.json
- [x] CHANGELOG.md создан
- [x] RELEASE_NOTES.md создан
- [x] BUILD.md создан
- [x] Git commit сделан
- [x] Git tag создан
- [ ] Push в GitHub
- [ ] Сборка приложений
- [ ] Создание релиза на GitHub
- [ ] Загрузка файлов
- [ ] Публикация релиза
- [ ] Деплой веб-версии
- [ ] Анонс

## Команды для копирования

```bash
# Push
git push origin master
git push origin v1.0.0

# Сборка
cd app && npm install && npm run build

# Vercel
vercel deploy --prod
```

## Проблемы?

### Ошибка при сборке

```bash
cd app
rm -rf node_modules dist
npm install
npm run build
```

### Ошибка при push

```bash
git pull origin master --rebase
git push origin master
git push origin v1.0.0
```

---

**Готово к релизу! 🎉**
