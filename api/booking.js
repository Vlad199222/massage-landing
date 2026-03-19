/**
 * Vercel Serverless: POST /api/booking
 * Environment: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

const { validateBookingBody, sendTelegramMessage } = require("../lib/booking-logic");

const MAX_BODY_BYTES = 8192;

/** Нативна відповідь (на Vercel не завжди є res.status().json()) */
function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function corsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") {
      try {
        return Promise.resolve(JSON.parse(req.body.trim() || "{}"));
      } catch {
        return Promise.resolve({});
      }
    }
    if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
      return Promise.resolve(req.body);
    }
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw.trim() ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const TELEGRAM_BOT_TOKEN = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const TELEGRAM_CHAT_ID = String(process.env.TELEGRAM_CHAT_ID || "").trim();

  if (req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      bookingApi: true,
      telegramConfigured: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return sendJson(res, 503, {
      ok: false,
      error:
        "У Vercel не задані змінні: TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID (Settings → Environment Variables → Redeploy)."
    });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    if (e.message === "payload_too_large") {
      return sendJson(res, 413, { ok: false, error: "Занадто великі дані." });
    }
    return sendJson(res, 400, { ok: false, error: "Некоректний запит." });
  }

  const result = validateBookingBody(body);
  if ("error" in result) {
    return sendJson(res, 400, { ok: false, error: result.error });
  }

  try {
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, result.message);
  } catch (err) {
    const hint = err.message || "";
    console.error("Telegram send error:", hint);
    return sendJson(res, 502, {
      ok: false,
      error: "Telegram відхилив повідомлення. Перевір чат_id і що бот у групі / має право писати.",
      hint
    });
  }

  return sendJson(res, 200, { ok: true });
};
