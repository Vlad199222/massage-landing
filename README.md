# Лендінг — масаж та голкотерапія (Вінниця)

Статичний лендінг на **vanilla JS** + простий **Node.js** HTTP-сервер для роздачі файлів із `public/`.

## Запуск локально

```bash
npm install
npm start
```

Відкрий у браузері: [http://localhost:3001](http://localhost:3001)  
(порт за замовчуванням — `3001`, можна змінити через змінну `PORT`.)

## Структура

- `server.js` — сервер
- `public/` — HTML, CSS, JS, зображення

## GitHub

1. Створи **порожній** репозиторій на GitHub (без README), наприклад назва: `massage-landing`.
2. У терміналі в папці проєкту:

```bash
git remote add origin https://github.com/Vlad199222/massage-landing.git
git branch -M main
git push -u origin main
```

Якщо репозиторій назвав інакше — заміни `massage-landing` у URL на свою назву.

Якщо `remote` уже додавався з помилкою:

```bash
git remote remove origin
git remote add origin https://github.com/Vlad199222/ТВОЯ_НАЗВА.git
git push -u origin main
```
