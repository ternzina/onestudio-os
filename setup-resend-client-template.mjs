const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY || !API_KEY.startsWith('re_')) {
  console.error('❌ В .env.local не найден корректный RESEND_API_KEY');
  process.exit(1);
}

const payload = {
  "name": "Sisters Studio — Client Booking Confirmation",
  "alias": "sisters-client-booking-confirmation",
  "from": "Sisters Studio <booking@sistersstudio.pl>",
  "subject": "Ми отримали ваше бронювання · Sisters Studio",
  "html": "<!doctype html>\n<html lang=\"uk\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Sisters Studio</title>\n</head>\n<body style=\"margin:0;padding:0;background:#f3eee8;font-family:Arial,Helvetica,sans-serif;color:#332720;\">\n  <div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">\n    {{{PREVIEW_TEXT}}}\n  </div>\n\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background:#f3eee8;\">\n    <tr>\n      <td align=\"center\" style=\"padding:32px 14px;\">\n        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"max-width:640px;background:#fffdf9;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(52,35,27,.10);\">\n          <tr>\n            <td style=\"background:#2b1d17;padding:38px 40px 32px;text-align:center;\">\n              <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;color:#fffaf3;letter-spacing:.4px;\">\n                Sisters Studio\n              </div>\n              <div style=\"margin-top:10px;font-size:11px;line-height:1.4;color:#c9ac91;letter-spacing:3px;text-transform:uppercase;\">\n                Warsaw · Photo Studio\n              </div>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:34px 40px 10px;\">\n              <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n                <tr>\n                  <td style=\"background:#ead8c8;color:#6a4532;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;\">\n                    {{{STATUS_LABEL}}}: {{{STATUS_TEXT}}}\n                  </td>\n                </tr>\n              </table>\n\n              <h1 style=\"margin:20px 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:31px;line-height:1.2;color:#2b1d17;font-weight:normal;\">\n                {{{TITLE}}}\n              </h1>\n              <p style=\"margin:0 0 8px;color:#46372f;font-size:17px;line-height:1.7;font-weight:700;\">\n                {{{GREETING}}}\n              </p>\n              <p style=\"margin:0;color:#7b6a60;font-size:15px;line-height:1.75;\">\n                {{{INTRO}}}\n              </p>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:20px 40px 0;\">\n              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background:#f8f3ed;border:1px solid #eadfd5;border-radius:18px;\">\n                <tr>\n                  <td style=\"padding:24px;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;\">\n                      {{{BOOKING_TYPE}}}\n                    </div>\n                    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#2b1d17;line-height:1.35;\">\n                      {{{BOOKING_DATE}}} · {{{BOOKING_TIME}}}\n                    </div>\n                    <div style=\"margin-top:8px;font-size:14px;color:#79685e;\">\n                      {{{DURATION_LABEL}}}: {{{DURATION}}}\n                    </div>\n                  </td>\n                </tr>\n              </table>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:24px 40px 0;\">\n              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n                <tr>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 12px 18px 0;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">\n                      {{{PACKAGE_LABEL}}}\n                    </div>\n                    <div style=\"font-size:16px;font-weight:700;color:#2b1d17;\">\n                      {{{PACKAGE_NAME}}}\n                    </div>\n                  </td>\n                  <td width=\"50%\" valign=\"top\" style=\"padding:0 0 18px 12px;\">\n                    <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:7px;\">\n                      {{{PRICE_LABEL}}}\n                    </div>\n                    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:23px;color:#2b1d17;\">\n                      {{{PRICE}}}\n                    </div>\n                  </td>\n                </tr>\n              </table>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:6px 40px 0;\">\n              <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:9px;\">\n                {{{NEXT_TITLE}}}\n              </div>\n              <div style=\"background:#fffaf5;border-left:3px solid #b68b68;border-radius:0 12px 12px 0;padding:16px 18px;color:#5f5047;font-size:14px;line-height:1.75;\">\n                {{{NEXT_TEXT}}}\n              </div>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:24px 40px 0;\">\n              <div style=\"font-size:11px;color:#9a7b69;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:8px;\">\n                {{{ADDRESS_LABEL}}}\n              </div>\n              <div style=\"font-size:15px;color:#2b1d17;line-height:1.65;\">\n                Taśmowa 1, lokal 202<br>\n                Warszawa, Polska\n              </div>\n            </td>\n          </tr>\n\n          <tr>\n            <td align=\"center\" style=\"padding:30px 40px 10px;\">\n              <a href=\"https://sistersstudio.pl\"\n                 style=\"display:inline-block;background:#2b1d17;color:#fffaf3;text-decoration:none;padding:15px 27px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:.3px;\">\n                {{{BUTTON_TEXT}}}\n              </a>\n            </td>\n          </tr>\n\n          <tr>\n            <td style=\"padding:24px 40px 34px;text-align:center;\">\n              <div style=\"height:1px;background:#eee3da;margin-bottom:22px;\"></div>\n              <div style=\"font-size:12px;line-height:1.75;color:#9b897e;\">\n                {{{FOOTER_TEXT}}}<br><br>\n                Sisters Studio · Taśmowa 1, lokal 202, Warszawa\n              </div>\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n",
  "variables": [
    {
      "key": "PREVIEW_TEXT",
      "type": "string",
      "fallback_value": "Ми отримали ваше бронювання в Sisters Studio"
    },
    {
      "key": "STATUS_LABEL",
      "type": "string",
      "fallback_value": "Статус"
    },
    {
      "key": "STATUS_TEXT",
      "type": "string",
      "fallback_value": "Очікує підтвердження"
    },
    {
      "key": "TITLE",
      "type": "string",
      "fallback_value": "Дякуємо за бронювання"
    },
    {
      "key": "GREETING",
      "type": "string",
      "fallback_value": "Вітаємо!"
    },
    {
      "key": "INTRO",
      "type": "string",
      "fallback_value": "Ми отримали вашу заявку та вже готуємося перевірити доступність обраного часу."
    },
    {
      "key": "BOOKING_TYPE",
      "type": "string",
      "fallback_value": "Фотосесія"
    },
    {
      "key": "BOOKING_DATE",
      "type": "string",
      "fallback_value": "12 липня 2026"
    },
    {
      "key": "BOOKING_TIME",
      "type": "string",
      "fallback_value": "14:00"
    },
    {
      "key": "DURATION_LABEL",
      "type": "string",
      "fallback_value": "Тривалість"
    },
    {
      "key": "DURATION",
      "type": "string",
      "fallback_value": "Не вказано"
    },
    {
      "key": "PACKAGE_LABEL",
      "type": "string",
      "fallback_value": "Пакет"
    },
    {
      "key": "PACKAGE_NAME",
      "type": "string",
      "fallback_value": "Premium"
    },
    {
      "key": "PRICE_LABEL",
      "type": "string",
      "fallback_value": "Вартість"
    },
    {
      "key": "PRICE",
      "type": "string",
      "fallback_value": "500 zł"
    },
    {
      "key": "NEXT_TITLE",
      "type": "string",
      "fallback_value": "Що далі?"
    },
    {
      "key": "NEXT_TEXT",
      "type": "string",
      "fallback_value": "Ми перевіримо бронювання та зв’яжемося з вами. Заявка стане підтвердженою після нашої відповіді."
    },
    {
      "key": "ADDRESS_LABEL",
      "type": "string",
      "fallback_value": "Адреса студії"
    },
    {
      "key": "BUTTON_TEXT",
      "type": "string",
      "fallback_value": "Перейти на сайт"
    },
    {
      "key": "FOOTER_TEXT",
      "type": "string",
      "fallback_value": "Якщо потрібно змінити деталі бронювання, просто дайте відповідь на цей лист."
    }
  ]
};

async function request(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
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

console.log('Создаю красивое письмо-подтверждение для клиента...');

const created = await request('https://api.resend.com/templates', {
  method: 'POST',
  body: JSON.stringify(payload),
});

console.log('✅ Шаблон создан');
console.log(`Template ID: ${created.id}`);
console.log('Публикую шаблон...');

await request(`https://api.resend.com/templates/${created.id}/publish`, {
  method: 'POST',
  body: JSON.stringify({}),
});

console.log('✅ Клиентский шаблон опубликован');
console.log('Alias: sisters-client-booking-confirmation');
