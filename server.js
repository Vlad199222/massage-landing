require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const { validateBookingBody, sendTelegramMessage } = require("./lib/booking-logic");

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const publicDir = path.join(__dirname, "public");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const mimeTypes = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const MAX_BODY_BYTES = 8192;

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=UTF-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readJsonBody(req) {
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
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

async function handleBooking(req, res) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    json(res, 503, {
      ok: false,
      error: "Сервер не налаштовано: задайте TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID."
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (e) {
    if (e.message === "payload_too_large") {
      json(res, 413, { ok: false, error: "Занадто великі дані." });
      return;
    }
    json(res, 400, { ok: false, error: "Некоректний запит." });
    return;
  }

  const result = validateBookingBody(body);
  if ("error" in result) {
    json(res, 400, { ok: false, error: result.error });
    return;
  }

  try {
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, result.message);
  } catch (err) {
    console.error("Telegram send error:", err.message);
    json(res, 502, {
      ok: false,
      error: "Не вдалося надіслати в Telegram. Спробуйте пізніше або зателефонуйте."
    });
    return;
  }

  json(res, 200, { ok: true });
}

function serveStatic(req, res) {
  const host = req.headers.host || "localhost";
  const u = new URL(req.url || "/", `http://${host}`);
  const urlPath = u.pathname === "/" ? "/index.html" : u.pathname;
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || "localhost";
  const u = new URL(req.url || "/", `http://${host}`);

  if (req.method === "POST" && u.pathname === "/api/booking") {
    handleBooking(req, res).catch((e) => {
      console.error(e);
      json(res, 500, { ok: false, error: "Внутрішня помилка сервера." });
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=UTF-8" });
    res.end("405 Method Not Allowed");
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn(
      "[booking] TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID не задані — /api/booking повертатиме 503."
    );
  }
});
