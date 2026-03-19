/**
 * Vercel Serverless: POST /api/booking
 * Environment Variables (Vercel → Settings): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

const { validateBookingBody, sendTelegramMessage } = require("../lib/booking-logic");

const MAX_BODY_BYTES = 8192;

function parseBody(req) {
  if (req.body != null && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.resolve({});
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
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(503).json({
      ok: false,
      error:
        "Сервер не налаштовано: у Vercel додай TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID (Settings → Environment Variables)."
    });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    if (e.message === "payload_too_large") {
      return res.status(413).json({ ok: false, error: "Занадто великі дані." });
    }
    return res.status(400).json({ ok: false, error: "Некоректний запит." });
  }

  const result = validateBookingBody(body);
  if ("error" in result) {
    return res.status(400).json({ ok: false, error: result.error });
  }

  try {
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, result.message);
  } catch (err) {
    console.error("Telegram send error:", err.message);
    return res.status(502).json({
      ok: false,
      error: "Не вдалося надіслати в Telegram. Спробуйте пізніше або зателефонуйте."
    });
  }

  return res.status(200).json({ ok: true });
};
