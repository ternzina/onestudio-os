import { expect, test } from "@playwright/test";

const taxonomy = ["all", "business", "websites", "booking", "crm", "marketing", "seo"];

for (const [locale, labels] of [
  ["en", ["All", "Business", "Websites", "Booking", "CRM", "Marketing", "SEO"]],
  ["ru", ["Все", "Бизнес", "Сайты", "Бронирование", "CRM", "Маркетинг", "SEO"]],
] as const) {
  test(`Guides ${locale}: complete taxonomy, empty categories and exclusive filtering`, async ({ page }) => {
    await page.addInitScript((lang) => localStorage.setItem("onestudio-locale", lang), locale);
    await page.goto("/guides");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const pills = page.locator("[data-guide-category]");
    await expect(pills).toHaveText([...labels]);
    const cards = page.locator("article");
    const allLinks = await cards.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(allLinks).toHaveLength(3);
    const filteredLinks: (string | null)[] = [];
    for (const category of taxonomy.slice(1)) {
      await page.locator(`[data-guide-category="${category}"]`).click();
      await expect(pills).toHaveCount(7);
      await expect(page.locator(`[data-guide-category="${category}"]`)).toHaveAttribute("aria-pressed", "true");
      await expect(cards).toHaveCount(["booking", "crm", "marketing"].includes(category) ? 1 : 0);
      filteredLinks.push(...await cards.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href"))));
    }
    expect(filteredLinks.sort()).toEqual(allLinks.sort());
    expect(new Set(filteredLinks).size).toBe(allLinks.length);
    await page.locator('[data-guide-category="all"]').click();
    await expect(cards).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test("Journal preserves preview DOM across hover, tap, scroll and locale changes", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/journal");
  await expect(page.locator("article[data-update-id]")).toHaveCount(41);
  // Cover viewport-loaded, image-backed, interaction-only and stateful previews.
  for (const id of ["how-it-works-4", "hero-12", "list-7", "card-5"]) {
    const frame = page.locator(`[data-component-id="${id}"]`);
    await frame.scrollIntoViewIfNeeded();
    if (isMobile) await frame.tap({ position: { x: 10, y: 10 } });
    else await frame.hover({ position: { x: 10, y: 10 } });
    await expect(frame).toHaveAttribute("data-preview-ready", "true");
    const root = await frame.locator("[data-preview-content] > *").first().elementHandle();
    expect(root).not.toBeNull();
    const originalImage = await frame.locator("img").count() ? await frame.locator("img").first().elementHandle() : null;
    const originalSrc = originalImage ? await originalImage.getAttribute("src") : null;
    for (let repeat = 0; repeat < 2; repeat++) {
      await page.mouse.move(0, 0);
      await frame.focus();
      await frame.press("Enter");
      if (isMobile) await frame.tap({ position: { x: 10, y: 10 } });
      else await frame.hover({ position: { x: 10, y: 10 } });
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => root!.evaluate((node) => node.isConnected)).toBe(true);
      await frame.scrollIntoViewIfNeeded();
      expect(await root!.evaluate((node) => node.isConnected)).toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    // Drive the real locale hook without a document reload.
    const languageMenu = page.locator("details").filter({ has: page.locator('[role="menuitemradio"]') }).first();
    await languageMenu.locator("summary").click();
    await languageMenu.getByRole("menuitemradio", { name: "Русский", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    expect(await root!.evaluate((node) => node.isConnected)).toBe(true);
    if (originalImage) {
      expect(await originalImage.evaluate((node) => node.isConnected)).toBe(true);
      expect(await originalImage.getAttribute("src")).toBe(originalSrc);
    }
    await languageMenu.locator("summary").click();
    await languageMenu.getByRole("menuitemradio", { name: "English", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await root!.evaluate((node) => node.isConnected)).toBe(true);
    await expect(page.locator("article[data-update-id]")).toHaveCount(41);
  }
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Journal keeps its initial placeholder until the image is ready", async ({ page }) => {
  let releaseImage!: () => void;
  const imageGate = new Promise<void>((resolve) => { releaseImage = resolve; });
  await page.route("**/photo-1618221195710-dd6b41faaea6*", async (route) => {
    await imageGate;
    await route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#d8e2dc"/></svg>' });
  });
  await page.goto("/journal");
  const frame = page.locator('[data-component-id="hero-12"]');
  await frame.scrollIntoViewIfNeeded();
  const image = frame.locator('img[src*="photo-1618221195710-dd6b41faaea6"]');
  await expect(image).toBeAttached();
  await expect(frame).toHaveAttribute("data-preview-ready", "false");
  await expect(frame.locator('[class*="previewShell"]')).toBeVisible();
  const originalImage = await image.elementHandle();
  releaseImage();
  await expect(frame).toHaveAttribute("data-preview-ready", "true");
  await expect(frame.locator('[class*="previewShell"]')).toHaveCount(0);
  expect(await originalImage!.evaluate((node) => node.isConnected && (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
});
