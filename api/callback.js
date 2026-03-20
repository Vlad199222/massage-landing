/**
 * Vercel: POST /api/callback — швидкий дзвінок (лише телефон у Telegram)
 */

const { validateCallbackBody, sendTelegramMessage } = require("../lib/booking-logic");

const MAX_BODY_BYTES = 4096;

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

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return sendJson(res, 503, {
      ok: false,
      error: "У Vercel задайте TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID."
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

  const result = validateCallbackBody(body);
  if ("error" in result) {
    return sendJson(res, 400, { ok: false, error: result.error });
  }

  try {
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, result.message);
  } catch (err) {
    console.error("Telegram callback error:", err.message);
    return sendJson(res, 502, {
      ok: false,
      error: "Не вдалося надіслати. Спробуйте пізніше.",
      hint: err.message
    });
  }

  return sendJson(res, 200, { ok: true });
};
