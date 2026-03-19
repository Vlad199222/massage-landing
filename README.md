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

- `server.js` — локальний HTTP-сервер (`npm start`)
- `api/booking.js` — **Vercel** Serverless для `POST /api/booking`
- `lib/booking-logic.js` — спільна логіка заявки + Telegram
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

## Деплой на [Railway](https://railway.app)

1. Увійди на Railway через **GitHub**.
2. **New project** → **Deploy from GitHub repo** → обери `massage-landing`.
3. Railway збере проєкт і запустить **`npm start`**. Змінна **`PORT`** задається автоматично.
4. У сервісі: **Settings** → **Networking** → **Generate Domain**.
5. Відкрий виданий URL — це твій лендінг.

Логи: **Deployments** → **View logs**.

### Заявки з форми «Записатися» → Telegram-бот

1. У Telegram напиши **@BotFather** → `/newbot` → збережи **токен** бота.
2. Знайди **свій chat_id**: напиши своєму боту будь-яке повідомлення, потім відкрий у браузері  
   `https://api.telegram.org/bot<ТВІЙ_ТОКЕН>/getUpdates` — у відповіді шукай `"chat":{"id": ...` (це `TELEGRAM_CHAT_ID`).
3. Локально (PowerShell):

   ```powershell
   $env:TELEGRAM_BOT_TOKEN="твій_токен"
   $env:TELEGRAM_CHAT_ID="твій_chat_id"
   npm start
   ```

4. На **Railway**: **Variables** → додай `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID` → redeploy.

Після успішної відправки користувач потрапляє на **`/thank-you.html`**, а ти бачиш заявку в **чаті з ботом** (те, що вказано в `TELEGRAM_CHAT_ID` — зазвичай твій особистий чат з ботом). Приклад змінних — у файлі `.env.example`.

## Деплой на [Vercel](https://vercel.com)

На Vercel **не виконується** довготривалий `server.js`. Сайт з `public/` роздається як статика, а **`POST /api/booking`** обробляє файл **`api/booking.js`**.

1. Імпорт репозиторію в Vercel (корінь репо — **не** вказуй Root Directory = `public`, інакше зникне `/api`).
2. **Settings** → **Environment Variables** (для Production / Preview за потреби):
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID` (наприклад `-5298193940` для групи)
3. **Redeploy** після змін змінних.

Перевірка: відкрий сайт, відправ форму — у вкладці **Vercel** → проєкт → **Functions** / **Logs** мають бути без 503; у Telegram приходить повідомлення.
