import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.E2E_SUPABASE_URL;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
const mailUrl = process.env.E2E_MAIL_URL || "http://127.0.0.1:54324";
const baseUrl = "http://127.0.0.1:3000";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Локальные ключи Supabase не переданы в тест.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function decodeHtmlUrl(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#x3D;", "=")
    .replaceAll("&#61;", "=");
}

function extractVerificationLink(value: string) {
  const urls = value.match(/https?:\/\/[^\s"'<>]+/g) || [];

  return (
    urls
      .map(decodeHtmlUrl)
      .find((url) => url.includes("/auth/v1/verify")) || null
  );
}

async function readMailpitLink(email: string) {
  const response = await fetch(`${mailUrl}/api/v1/messages?limit=50`);

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    messages?: Array<Record<string, unknown>>;
  };

  const messages = payload.messages || [];

  for (const message of messages) {
    const recipients = JSON.stringify(
      message.To || message.to || message.Recipients || "",
    );

    if (!recipients.toLowerCase().includes(email.toLowerCase())) continue;

    const id = String(message.ID || message.id || "");
    if (!id) continue;

    const detailResponse = await fetch(
      `${mailUrl}/api/v1/message/${encodeURIComponent(id)}`,
    );

    if (!detailResponse.ok) continue;

    const detail = (await detailResponse.json()) as Record<string, unknown>;
    const raw = [
      detail.HTML,
      detail.Text,
      detail.html,
      detail.text,
      JSON.stringify(detail),
    ]
      .filter(Boolean)
      .join("\n");

    const link = extractVerificationLink(raw);
    if (link) return link;
  }

  return null;
}

async function readInbucketLink(email: string) {
  const mailbox = email.split("@")[0];
  const response = await fetch(
    `${mailUrl}/api/v1/mailbox/${encodeURIComponent(mailbox)}`,
  );

  if (!response.ok) return null;

  const messages = (await response.json()) as Array<Record<string, unknown>>;

  for (const message of messages) {
    const id = String(message.id || message.ID || "");
    if (!id) continue;

    const detailResponse = await fetch(
      `${mailUrl}/api/v1/mailbox/${encodeURIComponent(mailbox)}/${encodeURIComponent(id)}`,
    );

    if (!detailResponse.ok) continue;

    const detail = await detailResponse.text();
    const link = extractVerificationLink(detail);

    if (link) return link;
  }

  return null;
}

async function waitForConfirmationLink(email: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const link =
      (await readMailpitLink(email).catch(() => null)) ||
      (await readInbucketLink(email).catch(() => null));

    if (link) return link;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return null;
}

async function cleanupTestUser(email: string) {
  const { data } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const user = data.users.find(
    (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
  );

  if (!user) return;

  const { data: memberships } = await admin
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id);

  for (const membership of memberships || []) {
    await admin
      .from("businesses")
      .delete()
      .eq("id", membership.business_id);
  }

  await admin.auth.admin.deleteUser(user.id);
}

test.describe.serial("Client Workspace 1.0", () => {
  test("прямая страница регистрации доступна новому клиенту", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator('input[autocomplete="name"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="email"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="new-password"]')).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Войти", exact: true })).toBeVisible();


    console.log("✅ Прямая страница регистрации доступна обычному клиенту.");
  });

  test("регистрация создаёт личный сайт и открывает клиентский редактор", async ({
    page,
  }) => {
    const stamp = Date.now();
    const email = `client-flow-${stamp}@example.com`;
    const password = `OneStudio-${stamp}!`;
    const businessName = `E2E Studio ${stamp}`;

    const configuration = {
      launchId: randomUUID(),
      demoSlug: "lumiere",
      businessName,
      tagline: "Автоматическая проверка клиентского пути",
      paletteIndex: 3,
      modules: ["Онлайн-запись", "CRM", "Портфолио"],
      languages: ["Русский", "English"],
      primaryLanguage: "Русский",
      currency: "EUR",
      onlinePayment: false,
      reminders: false,
    };

    try {
      await page.addInitScript((pendingConfiguration) => {
        window.localStorage.setItem(
          "onestudio-config:pending",
          JSON.stringify(pendingConfiguration),
        );
      }, configuration);

      await page.goto("/register?source=configurator");

      await page.locator('input[autocomplete="name"]').fill("Тестовый клиент");
      await page.locator('input[autocomplete="email"]').fill(email);

      const passwordInputs = page.locator(
        'input[autocomplete="new-password"]',
      );

      await passwordInputs.nth(0).fill(password);
      await passwordInputs.nth(1).fill(password);

      await page.locator('button[type="submit"]').click();

      await Promise.race([
        page.waitForURL(/\/(launch|dashboard)(?:[/?#]|$)/, {
          timeout: 25_000,
        }),
        page
          .getByText(/Подтвердите email|Confirm your email/i)
          .waitFor({ state: "visible", timeout: 25_000 }),
      ]);

      if (new URL(page.url()).pathname === "/register") {
        const confirmationLink = await waitForConfirmationLink(email);

        expect(
          confirmationLink,
          "Письмо подтверждения не появилось в локальной почте.",
        ).not.toBeNull();

        await page.goto(confirmationLink!);

        await page.waitForURL(/\/(launch|dashboard)(?:[/?#]|$)/, {
          timeout: 40_000,
        });
      }

      if (new URL(page.url()).pathname === "/launch") {
        await expect(
          page.getByRole("heading", { name: "Ваш проект создан" }),
        ).toBeVisible({ timeout: 60_000 });

        await page
          .getByRole("link", { name: "Перейти в кабинет" })
          .click();
      }

      await page.waitForURL(/\/dashboard(?:[/?#]|$)/, {
        timeout: 30_000,
      });

      await expect(page.getByText("Личный кабинет")).toBeVisible();
      await expect(page.getByText("Мои сайты")).toBeVisible();
      await expect(
        page.getByText(businessName, { exact: true }),
      ).toBeVisible({ timeout: 30_000 });

      await expect(page.getByText("Следующие шаги", { exact: true })).toBeVisible();
      await expect(page.getByText("Расширенное управление сайтами")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Управление" })).toHaveCount(0);
      await expect(
        page.getByText(`onestudioos.com/site/`, { exact: false }).first(),
      ).toBeVisible();

      const editorButton = page
        .getByRole("button", { name: "Редактировать сайт" })
        .first();

      await expect(editorButton).toBeVisible();
      await editorButton.click();

      await page.waitForURL(/\/dashboard\/site(?:[/?#]|$)/, {
        timeout: 30_000,
      });

      await expect(
        page.getByRole("heading", { name: "Редактор сайта" }),
      ).toBeVisible({ timeout: 30_000 });
      await expect(
        page.getByRole("link", { name: "Личный кабинет", exact: true }),
      ).toBeVisible();
      await expect(page.locator('main[data-editor-mode="client"]')).toBeVisible();
      expect(page.url()).not.toContain("/admin/");

      console.log(
        "✅ Регистрация → создание сайта → личный кабинет → редактор работают.",
      );
    } finally {
      await cleanupTestUser(email);
    }
  });

  test("ссылка подтверждения email возвращает пользователя в личный кабинет", async ({
    page,
  }) => {
    const stamp = Date.now();
    const email = `callback-flow-${stamp}@example.com`;
    const password = `OneStudio-${stamp}!`;

    try {
      const { data, error } = await admin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          redirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
        },
      });

      expect(error?.message || null).toBeNull();

      const actionLink = data.properties?.action_link;

      expect(
        actionLink,
        "Supabase не создал тестовую ссылку подтверждения.",
      ).toBeTruthy();

      await page.goto(actionLink!);

      await page.waitForURL(/\/dashboard(?:[/?#]|$)/, {
        timeout: 40_000,
      });

      await expect(page.getByText("Личный кабинет")).toBeVisible();
      await expect(page.getByText("Мои сайты")).toBeVisible();

      expect(page.url()).not.toContain("/admin/bootstrap");
      expect(page.url()).not.toContain("error=admin_access");

      console.log(
        "✅ Подтверждение email возвращает обычного пользователя в /dashboard.",
      );
    } finally {
      await cleanupTestUser(email);
    }
  });
});
