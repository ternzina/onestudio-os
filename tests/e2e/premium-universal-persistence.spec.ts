import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { resolvePremiumKidsContent } from "../../lib/public-site/premium-kids-content";
import type { PublicSiteContent } from "../../lib/public-site/types";

const supabaseUrl = process.env.E2E_SUPABASE_URL;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) throw new Error("Локальные ключи Supabase не переданы в test environment.");

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function cleanup(email: string) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const user = data.users.find(candidate => candidate.email === email);
  if (!user) return;
  const { data: memberships } = await admin.from("business_members").select("business_id").eq("user_id", user.id);
  for (const membership of memberships ?? []) await admin.from("businesses").delete().eq("id", membership.business_id);
  await admin.auth.admin.deleteUser(user.id);
}

async function addBlock(page: Page, label: string) {
  const before = await page.locator("[data-premium-editor-block-id]").evaluateAll(elements => elements.map(element => element.getAttribute("data-premium-editor-block-id")));
  await page.getByRole("button", { name: "+ Добавить блок" }).click();
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await page.getByRole("button", { name: new RegExp(`^${escapedLabel}`) }).click();
  await expect(page.locator("[data-premium-editor-block-id]")).toHaveCount(before.length + 1);
  const selected = page.locator('[data-premium-editor-block-id]:has(button[aria-current="true"])');
  await expect.poll(async () => !before.includes(await selected.getAttribute("data-premium-editor-block-id"))).toBe(true);
  await expect(selected).toBeVisible();
  return {
    id: (await selected.getAttribute("data-premium-editor-block-id"))!,
    type: (await selected.getAttribute("data-premium-editor-block-type"))!,
  };
}

async function setSelectedTitle(page: Page, value: string) {
  const title = page.getByRole("textbox", { name: "Заголовок", exact: true }).first();
  await title.fill(value);
  await expect(title).toHaveValue(value);
}

test("real Premium Save and explicit Publish preserve universal composition", async ({ page }) => {
  const stamp = Date.now();
  const email = `premium-persistence-${stamp}@example.com`;
  const password = `Premium-persistence-${stamp}!`;
  let businessId = "";

  try {
    const { error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    expect(createError).toBeNull();
    const userClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    expect((await userClient.auth.signInWithPassword({ email, password })).error).toBeNull();
    const { data: workspace, error: workspaceError } = await userClient.rpc("create_configured_workspace", {
      p_configuration: {
        launch_id: crypto.randomUUID(), demo_slug: "little-orbit", business_name: `Premium Persistence ${stamp}`,
        tagline: "Persistence fixture", palette_index: 0, locales: ["en"], primary_locale: "en",
        currency: "EUR", enabled_modules: ["core", "catalog", "crm"],
      },
    });
    expect(workspaceError).toBeNull();
    const workspaceRow = Array.isArray(workspace) ? workspace[0] : workspace;
    businessId = workspaceRow?.business_id as string;
    const businessSlug = workspaceRow?.business_slug as string;

    const { data: localeRow } = await admin.from("public_site_locales").select("draft_content,published_content").eq("business_id", businessId).eq("locale", "en").single();
    const initialDraft = localeRow!.draft_content as Record<string, unknown>;
    const publishedSnapshot = JSON.stringify(localeRow!.published_content);
    const seededDraft = { ...initialDraft, brand_name: "BEMBI", template_id: "premium-kids-center", template_content: { "premium-kids-center": {} } };
    expect((await admin.from("public_site_locales").update({ draft_content: seededDraft }).eq("business_id", businessId).eq("locale", "en")).error).toBeNull();

    await page.goto("/login?next=/admin/site");
    await page.locator('input[autocomplete="email"]').fill(email);
    await page.locator('input[autocomplete="current-password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin\/site/, { timeout: 30_000 });
    await expect(page.locator("[data-template-editor-columns]")).toBeVisible({ timeout: 30_000 });

    const text = await addBlock(page, "Текстовый блок");
    await setSelectedTitle(page, `Persist text ${stamp}`);
    const textImage = await addBlock(page, "Текст + изображение");
    await setSelectedTitle(page, `Persist text image ${stamp}`);
    const imageText = await addBlock(page, "Изображение + текст");
    await setSelectedTitle(page, `Persist image text ${stamp}`);
    const columns = await addBlock(page, "Две или три колонки");
    await setSelectedTitle(page, `Persist columns ${stamp}`);
    await page.getByLabel("Количество колонок").selectOption("2");
    const premiumFrame = page.frameLocator('iframe[title^="BEMBI Premium"]');
    const columnGrid = premiumFrame.locator('[data-premium-columns="2"]');
    await expect(columnGrid).toHaveCount(1);
    const twoTracks = (await columnGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns)).split(" ").map(parseFloat);
    expect(twoTracks).toHaveLength(2);
    expect(Math.abs(twoTracks[0] - twoTracks[1])).toBeLessThanOrEqual(1);
    await page.getByLabel("Количество колонок").selectOption("3");
    await expect(premiumFrame.locator('[data-premium-columns="3"]')).toHaveCount(1);
    expect((await premiumFrame.locator('[data-premium-columns="3"]').evaluate(element => getComputedStyle(element).gridTemplateColumns)).split(" ")).toHaveLength(3);
    await page.getByLabel("Количество колонок").selectOption("2");

    await page.getByRole("button", { name: "Дублировать блок", exact: true }).last().click();
    const duplicate = page.locator('[data-premium-editor-block-id]:has(button[aria-current="true"])');
    const duplicateId = (await duplicate.getAttribute("data-premium-editor-block-id"))!;
    await page.getByRole("button", { name: "Переместить выше" }).last().click();
    await page.getByLabel("Показывать блок").uncheck();

    const deleted = await addBlock(page, "Текстовый блок");
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Удалить блок", exact: true }).last().click();
    await expect(page.locator(`[data-premium-editor-block-id="${deleted.id}"]`)).toHaveCount(0);

    const expectedOrder = await page.locator("[data-premium-editor-block-id]").evaluateAll(elements => elements.map(element => element.getAttribute("data-premium-editor-block-id")));
    let savePayload: PublicSiteContent | undefined;
    page.on("request", request => {
      if (request.url().includes("/rpc/save_public_site_draft")) savePayload = request.postDataJSON()?.p_content as PublicSiteContent;
    });
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    await expect(page.getByText(/Draft saved|Черновик сохранён/i)).toBeVisible();

    expect(savePayload).toBeTruthy();
    const payloadPremium = resolvePremiumKidsContent(savePayload);
    expect(payloadPremium.blocks.map(block => block.id)).toEqual(expectedOrder);

    const { data: savedRow, error: savedError } = await admin.from("public_site_locales").select("draft_content,published_content").eq("business_id", businessId).eq("locale", "en").single();
    expect(savedError).toBeNull();
    const storedDraft = savedRow!.draft_content as PublicSiteContent;
    const storedPremium = resolvePremiumKidsContent(storedDraft);
    expect(storedPremium.blocks.map(block => block.id)).toEqual(expectedOrder);
    expect(JSON.stringify(savedRow!.published_content)).toBe(publishedSnapshot);

    await page.reload();
    await expect(page.locator("[data-template-editor-columns]")).toBeVisible({ timeout: 30_000 });
    const reloadedOrder = await page.locator("[data-premium-editor-block-id]").evaluateAll(elements => elements.map(element => element.getAttribute("data-premium-editor-block-id")));
    expect(reloadedOrder).toEqual(expectedOrder);
    for (const block of [text, textImage, imageText, columns]) await expect(page.locator(`[data-premium-editor-block-id="${block.id}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-premium-editor-block-id="${duplicateId}"]`)).toHaveAttribute("data-premium-editor-block-visible", "false");
    await expect(page.locator(`[data-premium-editor-block-id="${deleted.id}"]`)).toHaveCount(0);
    const reloadedPremium = resolvePremiumKidsContent((await admin.from("public_site_locales").select("draft_content").eq("business_id", businessId).eq("locale", "en").single()).data!.draft_content as PublicSiteContent);
    expect(reloadedPremium.blocks.find(block => block.id === columns.id)?.props.universal_block?.columns_count).toBe(2);
    for (const title of [`Persist text ${stamp}`, `Persist text image ${stamp}`, `Persist image text ${stamp}`, `Persist columns ${stamp}`]) expect(reloadedPremium.blocks.some(block => block.props.universal_block?.title === title)).toBe(true);
    await page.getByRole("button", { name: "Phone", exact: true }).click();
    const phoneGrid = page.frameLocator('iframe[title="BEMBI Premium · mobile"]').locator('[data-premium-columns="2"]');
    await expect(phoneGrid).toHaveCount(1);
    expect((await phoneGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns)).split(" ")).toHaveLength(1);

    await page.getByRole("button", { name: "Desktop", exact: true }).click();
    const publishResponsePromise = page.waitForResponse(response => response.url().includes("/rpc/publish_public_site"));
    await page.getByRole("button", { name: "Опубликовать", exact: true }).first().click();
    const publishResponse = await publishResponsePromise;
    expect(publishResponse.ok()).toBe(true);
    const publishPayload = await publishResponse.json() as PublicSiteContent;
    await expect(page.getByText(/Site published|Сайт опубликован/i)).toBeVisible();

    const publishedPremium = resolvePremiumKidsContent(publishPayload);
    expect(publishedPremium.blocks.map(block => block.id)).toEqual(expectedOrder);
    expect(publishedPremium.blocks.find(block => block.id === duplicateId)?.visible).toBe(false);
    expect(publishedPremium.blocks.some(block => block.id === deleted.id)).toBe(false);
    expect(publishedPremium.blocks.find(block => block.id === columns.id)?.props.universal_block?.columns_count).toBe(2);

    const { data: publishedRow, error: publishedError } = await admin.from("public_site_locales").select("draft_content,published_content").eq("business_id", businessId).eq("locale", "en").single();
    expect(publishedError).toBeNull();
    expect(publishedRow!.published_content).toEqual(publishedRow!.draft_content);
    const storedPublished = resolvePremiumKidsContent(publishedRow!.published_content as PublicSiteContent);
    expect(storedPublished.blocks.map(block => block.id)).toEqual(expectedOrder);

    const { data: publicSite, error: publicError } = await admin.rpc("get_public_site", { p_business_slug: businessSlug, p_locale: null });
    expect(publicError).toBeNull();
    const publicPremium = resolvePremiumKidsContent((publicSite as { content: PublicSiteContent }).content);
    expect(publicPremium.blocks.map(block => block.id)).toEqual(expectedOrder);
    expect(publicPremium.blocks.find(block => block.id === duplicateId)?.visible).toBe(false);
    for (const title of [`Persist text ${stamp}`, `Persist text image ${stamp}`, `Persist image text ${stamp}`, `Persist columns ${stamp}`]) expect(publicPremium.blocks.some(block => block.props.universal_block?.title === title)).toBe(true);

    await page.goto(`/site/${businessSlug}`);
    await expect(page.locator(`[data-premium-block-id="${text.id}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-premium-block-id="${textImage.id}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-premium-block-id="${imageText.id}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-premium-block-id="${columns.id}"] [data-premium-columns="2"]`)).toHaveCount(1);
    await expect(page.locator(`[data-premium-block-id="${duplicateId}"]`)).toHaveCount(0);
  } finally {
    await cleanup(email);
  }
});
