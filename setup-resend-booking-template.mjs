const API_KEY = process.env.RESEND_API_KEY;
const TEMPLATE_ID = "d7f9a35c-4c19-440c-a524-26c99b669469";

if (!API_KEY || !API_KEY.startsWith("re_")) {
  console.error("❌ В .env.local не найден корректный RESEND_API_KEY");
  process.exit(1);
}

const payload = {
  "name": "Sisters Studio — New Booking",
  "from": "Sisters Studio <booking@sistersstudio.pl>",
  "subject": "Нове бронювання в Sisters Studio",
  "html": "<!doctype html>\n<html lang=\"uk\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Нове бронювання — Sisters Studio</title>\n</head>\n<body style=\"margin:0;padding:0;background:#f3eee8;font-family:Arial,Helvetica,sans-serif;color:#332720;\">\n  <div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">\n    Нове бронювання в Sisters Studio\n  </div>\n\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background:#f3eee8;\">\n    <tr>\n      <td align=\"center\" style=\"padding:32px 14px;\">\n        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"max-width:640px;background:#fffdf9;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(52,35,27,.10);\">\n\n          <tr>\n            <td style=\"background:#2b1d17;padding:38px 40px 32px;text-align:center;\">\n              <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;color:#fffaf3;letter-spacing:.4px;\">\n                Sisters Studio\n              </div>\n              <div style=\"margin-top:10px;font-size:11px;line-height:1.4;color:#c9ac91;letter-spacing:3px;text-transform:uppercase;\">\n                Warsaw · Photo Studio\n              </div>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:34px 40px 8px;\">\n              <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n                <tr>\n                  <td style=\"background:#ead8c8;color:#6a4532;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;\">\n                    Нова бронь\n                  </td>\n                </tr>\n              </table>\n\n              <h1 style=\"margin:20px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#2b1d17;font-weight:normal;\">\n                {{{BOOKING_TYPE}}}\n              </h1>\n              <p style=\"margin:0;color:#7b6a60;font-size:15px;line-height:1.7;\">\n                На сайті щойно з’явилося нове бронювання. Усі деталі вже зібрані нижче.\n              </p>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:20px 40px 0;\">\n              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background:#f8f3ed;border:1px solid #eadfd5;border-radius:18px;\">\n                <tr>\n                  <td style=\"padding:24px;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;\">\n                      Дата і час\n                    </div>\n                    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#2b1d17;line-height:1.3;\">\n                      {{{BOOKING_DATE}}} · {{{BOOKING_TIME}}}\n                    </div>\n                    <div style=\"margin-top:8px;font-size:14px;color:#79685e;\">\n                      Тривалість: {{{DURATION}}}\n                    </div>\n                  </td>\n                </tr>\n              </table>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:22px 40px 0;\">\n              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n                <tr>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 10px 18px 0;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">Клієнт</div>\n                    <div style=\"font-size:17px;font-weight:700;color:#2b1d17;\">{{{CLIENT_NAME}}}</div>\n                  </td>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 0 18px 10px;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">Телефон</div>\n                    <div style=\"font-size:15px;color:#2b1d17;\">{{{CLIENT_PHONE}}}</div>\n                  </td>\n                </tr>\n                <tr>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 10px 18px 0;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">Email</div>\n                    <div style=\"font-size:15px;color:#2b1d17;word-break:break-word;\">{{{CLIENT_EMAIL}}}</div>\n                  </td>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 0 18px 10px;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">Пакет / ресурс</div>\n                    <div style=\"font-size:15px;color:#2b1d17;\">{{{PACKAGE_NAME}}}</div>\n                  </td>\n                </tr>\n                <tr>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 10px 0 0;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">Вартість</div>\n                    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:23px;color:#2b1d17;\">{{{PRICE}}}</div>\n                  </td>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 0 0 10px;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">Статус</div>\n                    <div style=\"font-size:15px;color:#2b1d17;\">Очікує підтвердження</div>\n                  </td>\n                </tr>\n              </table>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:26px 40px 0;\">\n              <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:9px;\">\n                Коментар клієнта\n              </div>\n              <div style=\"background:#fffaf5;border-left:3px solid #b68b68;border-radius:0 12px 12px 0;padding:16px 18px;color:#5f5047;font-size:14px;line-height:1.7;\">\n                {{{COMMENT}}}\n              </div>\n            </td>\n          </tr>\n\n          <tr>\n            <td align=\"center\" style=\"padding:30px 40px 10px;\">\n              <a href=\"https://sistersstudio.pl/admin/bookings\"\n                 style=\"display:inline-block;background:#2b1d17;color:#fffaf3;text-decoration:none;padding:15px 27px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:.3px;\">\n                Відкрити бронювання\n              </a>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:24px 40px 34px;text-align:center;\">\n              <div style=\"height:1px;background:#eee3da;margin-bottom:22px;\"></div>\n              <div style=\"font-size:12px;line-height:1.7;color:#9b897e;\">\n                Sisters Studio · Taśmowa 1, lokal 202, Warszawa<br>\n                Це автоматичне повідомлення з системи бронювання.\n              </div>\n            </td>\n          </tr>\n\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n",
  "variables": [
    {
      "key": "BOOKING_TYPE",
      "type": "string",
      "fallback_value": "Фотосесія"
    },
    {
      "key": "BOOKING_DATE",
      "type": "string",
      "fallback_value": "10 липня 2026"
    },
    {
      "key": "BOOKING_TIME",
      "type": "string",
      "fallback_value": "14:00"
    },
    {
      "key": "DURATION",
      "type": "string",
      "fallback_value": "2 години"
    },
    {
      "key": "CLIENT_NAME",
      "type": "string",
      "fallback_value": "Anna Kowalska"
    },
    {
      "key": "CLIENT_PHONE",
      "type": "string",
      "fallback_value": "+48 600 000 000"
    },
    {
      "key": "CLIENT_EMAIL",
      "type": "string",
      "fallback_value": "anna@example.com"
    },
    {
      "key": "PACKAGE_NAME",
      "type": "string",
      "fallback_value": "Premium"
    },
    {
      "key": "PRICE",
      "type": "string",
      "fallback_value": "500 zł"
    },
    {
      "key": "COMMENT",
      "type": "string",
      "fallback_value": "Без коментаря"
    }
  ]
};

async function request(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error(`❌ Resend вернул ошибку ${response.status}:`);
    console.error(data);
    process.exit(1);
  }

  return data;
}

console.log("Обновляю шаблон и добавляю готовые переменные...");

await request(`https://api.resend.com/templates/${TEMPLATE_ID}`, {
  method: "PATCH",
  body: JSON.stringify(payload),
});

console.log("✅ Шаблон обновлён");
console.log("Публикую шаблон...");

await request(`https://api.resend.com/templates/${TEMPLATE_ID}/publish`, {
  method: "POST",
  body: JSON.stringify({}),
});

console.log("✅ Готово. Шаблон опубликован.");
console.log(`Template ID: ${TEMPLATE_ID}`);
