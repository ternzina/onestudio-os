import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.E2E_SUPABASE_URL;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) throw new Error("Локальные ключи Supabase не переданы в test environment.");

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const viewports = [1024, 1100, 1180, 1280, 1366, 1440, 1512, 1728];

async function cleanup(email: string) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const user = data.users.find(candidate => candidate.email === email);
  if (!user) return;
  const { data: memberships } = await admin.from("business_members").select("business_id").eq("user_id", user.id);
  for (const membership of memberships ?? []) await admin.from("businesses").delete().eq("id", membership.business_id);
  await admin.auth.admin.deleteUser(user.id);
}

test("real /admin/site keeps the Premium workspace horizontal on laptop and desktop widths", async ({ page }) => {
  const stamp = Date.now();
  const email = `premium-layout-${stamp}@example.com`;
  const password = `Premium-layout-${stamp}!`;

  try {
    const { error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    expect(createError).toBeNull();

    const userClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error: signInError } = await userClient.auth.signInWithPassword({ email, password });
    expect(signInError).toBeNull();
    const { data: workspace, error: workspaceError } = await userClient.rpc("create_configured_workspace", {
      p_configuration: {
        launch_id: crypto.randomUUID(), demo_slug: "little-orbit", business_name: `Premium Layout ${stamp}`,
        tagline: "Real admin layout fixture", palette_index: 0, locales: ["en"], primary_locale: "en",
        currency: "EUR", enabled_modules: ["core", "catalog", "crm"],
      },
    });
    expect(workspaceError).toBeNull();
    const businessId = (Array.isArray(workspace) ? workspace[0] : workspace)?.business_id as string;
    expect(businessId).toBeTruthy();

    const { data: localeRow, error: localeError } = await admin.from("public_site_locales").select("draft_content").eq("business_id", businessId).eq("locale", "en").single();
    expect(localeError).toBeNull();
    const draft = localeRow!.draft_content as Record<string, unknown>;
    const { error: updateError } = await admin.from("public_site_locales").update({
      draft_content: { ...draft, brand_name: "BEMBI", template_id: "premium-kids-center", template_content: { "premium-kids-center": {} } },
    }).eq("business_id", businessId).eq("locale", "en");
    expect(updateError).toBeNull();

    await page.goto("/login?next=/admin/site");
    await page.locator('input[autocomplete="email"]').fill(email);
    await page.locator('input[autocomplete="current-password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin\/site/, { timeout: 30_000 });
    await expect(page.locator("[data-template-editor-columns]")).toBeVisible({ timeout: 30_000 });

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 1000 });
      const values = await page.evaluate(() => {
        const measure = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error(`Missing ${selector}`);
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, display: style.display };
        };
        const grid = document.querySelector<HTMLElement>("[data-template-editor-columns]")!;
        return {
          innerWidth: window.innerWidth,
          clientWidth: document.documentElement.clientWidth,
          admin: measure("[data-admin-site-wrapper]"),
          editor: measure("#site-builder-canvas"),
          containerType: getComputedStyle(document.querySelector("#site-builder-canvas")!).containerType,
          navigator: measure("[data-template-editor-navigator]"),
          preview: measure("[data-template-editor-canvas]"),
          settings: measure("[data-template-editor-settings]"),
          columns: getComputedStyle(grid).gridTemplateColumns,
          pageScrollWidth: document.documentElement.scrollWidth,
        };
      });

      console.log(`PREMIUM_ADMIN_GEOMETRY ${width}`, JSON.stringify(values));
      expect(values.navigator.right).toBeLessThanOrEqual(values.preview.left + 1);
      expect(values.preview.right).toBeLessThanOrEqual(values.settings.left + 1);
      expect(Math.abs(values.navigator.top - values.preview.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(values.preview.top - values.settings.top)).toBeLessThanOrEqual(1);
      expect(values.settings.top).toBeLessThan(values.preview.bottom);
      expect(values.columns.trim().split(/\s+/)).toHaveLength(3);
      expect(values.pageScrollWidth).toBe(values.clientWidth);
      if (width >= 1280) {
        expect(values.navigator.top).toBeLessThan(1000);
        expect(values.preview.top).toBeLessThan(1000);
        expect(values.settings.top).toBeLessThan(1000);
      }
    }

    const addButton = page.getByRole("button", { name: "+ Добавить блок" });
    await expect(addButton).toBeVisible();
    expect(await addButton.evaluate(button => button.parentElement?.previousElementSibling?.tagName)).toBe("NAV");
  } finally {
    await cleanup(email);
  }
});
