const https = require("https");

function countDigits(str) {
  return String(str || "").replace(/\D/g, "").length;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {{ error: string } | { message: string }}
 */
function validateBookingBody(body) {
  const name = String(body.name || "").trim().slice(0, 80);
  const phone = String(body.phone || "").trim().slice(0, 40);

  if (name.length < 2) {
    return { error: "Вкажіть ім’я (щонайменше 2 символи)." };
  }
  if (countDigits(phone) < 10) {
    return { error: "Вкажіть коректний номер телефону." };
  }

  const message =
    "🆕 Нова заявка з сайту\n\n" +
    `Ім’я: ${name}\n` +
    `Телефон: ${phone}\n` +
    `\nЧас: ${new Date().toISOString()}`;

  return { message };
}

function sendTelegramMessage(token, chatId, text) {
  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    disable_web_page_preview: true
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${token}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Content-Length": Buffer.byteLength(payload)
        }
      },
      (tgRes) => {
        let buf = "";
        tgRes.on("data", (d) => {
          buf += d;
        });
        tgRes.on("end", () => {
          try {
            const data = JSON.parse(buf);
            if (data.ok) resolve(data);
            else reject(new Error(data.description || "telegram_error"));
          } catch {
            reject(new Error("telegram_bad_response"));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

module.exports = {
  validateBookingBody,
  sendTelegramMessage
};
