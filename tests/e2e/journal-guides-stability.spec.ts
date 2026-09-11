import { expect, test } from "@playwright/test";

const taxonomy = ["all", "business", "websites", "booking", "crm", "marketing", "seo"];

test("cold and warm scrolling of all 41 History runtimes never inserts shared artwork", async ({ page, isMobile }, testInfo) => {
  test.setTimeout(360_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`runtime: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()} ${message.location().url}`);
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.clearBrowserCache");
  let phase = "cold";
  const imageRequests: object[] = [];
  const cacheHits: string[] = [];
  // Preserve the Image log across reloads; never mock these source assets.
  cdp.on("Network.requestWillBeSent", (event) => {
    if (event.type === "Image") imageRequests.push({
      phase,
      url: event.request.url,
      initiator: { type: event.initiator.type, frames: event.initiator.stack?.callFrames.slice(0, 3) },
    });
  });
  cdp.on("Network.requestServedFromCache", () => cacheHits.push(phase));
  const mediaAudit: object[] = [];
  await page.addInitScript(() => {
    const audit: string[] = [];
    Object.assign(window, { historySharedArtworkAudit: audit });
    const inspect = () => {
      for (const frame of document.querySelectorAll<HTMLElement>("[data-component-id]")) {
        const stage = frame.firstElementChild;
        if (!stage) continue;
        // Only the actual source component (or a text-only error) may occupy
        // the common stage. Catch even a transient loading image/skeleton.
        if ([...stage.children].some((child) => !child.hasAttribute("data-preview-content") && !child.hasAttribute("data-preview-error"))) {
          if (!audit.includes(frame.dataset.componentId!)) audit.push(frame.dataset.componentId!);
        }
      }
    };
    new MutationObserver(inspect).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "poster", "class"] });
  });
  const frames = page.locator("[data-component-id]");
  for (const cachePhase of ["cold", "prime", "warm"] as const) {
    phase = cachePhase;
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: cachePhase === "cold" });
    await page.goto("/journal");
    await expect(frames).toHaveCount(41);
    expect(await page.locator("[data-preview-content]").count()).toBeLessThan(41);
    const roots = [];
    for (let index = 0; index < 41; index++) {
      const frame = frames.nth(index);
      await frame.evaluate((element, slow) => element.scrollIntoView({ behavior: slow ? "smooth" : "instant", block: "center" }), cachePhase !== "prime");
      // Let each card cross the viewport and remain visible, including its
      // initial loading frames, instead of jumping to the end of the page.
      if (cachePhase !== "prime") await page.waitForTimeout(650);
      await expect(frame).toBeInViewport();
      if (isMobile) await frame.tap({ position: { x: 10, y: 10 } });
      else await frame.hover({ position: { x: 10, y: 10 } });
      await frame.focus();
      await frame.press("Enter");
      await expect(frame).toHaveAttribute("data-active", "true");
      await expect(frame.locator("[data-preview-content]")).toHaveAttribute("data-preview-content", (await frame.getAttribute("data-component-id"))!);
      roots.push(await frame.locator("[data-preview-content] > *").first().elementHandle());
      await expect(frame.locator("[data-preview-error]")).toHaveCount(0);
    }
    if (cachePhase === "prime") continue;
    for (let index = 40; index >= 0; index--) {
      await frames.nth(index).evaluate((element) => element.scrollIntoView({ behavior: "smooth", block: "center" }));
      await page.waitForTimeout(650);
      await expect(frames.nth(index)).toBeInViewport();
      expect(await roots[index]!.evaluate((node) => node.isConnected)).toBe(true);
    }
    const media = await frames.evaluateAll((elements) => elements.flatMap((element) =>
      [...element.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video")].map((image) => ({
        componentId: element.getAttribute("data-component-id"),
        src: image.getAttribute("src"), currentSrc: image.currentSrc, poster: image.getAttribute("poster"),
        ownRuntime: image.closest("[data-preview-content]")?.getAttribute("data-preview-content") === element.getAttribute("data-component-id"),
      })),
    ));
    mediaAudit.push({ phase, media });
    expect(media.every((image) => image.ownRuntime)).toBe(true);
    await expect(page.locator("article[data-update-id]")).toHaveCount(41);
    await expect(page.locator('[class*="previewShell"], [class*="shellLine"]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { historySharedArtworkAudit: string[] }).historySharedArtworkAudit)).toEqual([]);
    await frames.first().screenshot({ path: testInfo.outputPath(`${cachePhase}-first-preview.png`) });
    console.log(`${testInfo.project.name} ${cachePhase}: 41 down + 41 up; shared artwork 0; roots preserved`);
  }
  await testInfo.attach("history-image-network-audit", { body: JSON.stringify({ imageRequests, mediaAudit, cacheHits, errors }, null, 2), contentType: "application/json" });
  expect(cacheHits).toContain("warm");
  expect(errors).toEqual([]);
});

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
    await expect(frame).toHaveAttribute("data-preview-loaded", "true");
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

test("individual source animation and plan selection remain live", async ({ page, isMobile }) => {
  await page.goto("/journal");
  const animated = page.locator('[data-component-id="cta-4"]');
  await animated.scrollIntoViewIfNeeded();
  await animated.focus();
  const marquee = animated.locator('[style*="will-change: transform"]').first();
  await expect(marquee).toBeAttached();
  const transform = await marquee.evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(() => marquee.evaluate((element) => getComputedStyle(element).transform)).not.toBe(transform);
  const plans = page.locator('[data-component-id="card-5"]');
  await plans.scrollIntoViewIfNeeded();
  await plans.focus();
  const starter = plans.getByRole("button", { name: "Choose Starter" });
  if (isMobile) await starter.tap();
  else await starter.click();
  await expect(plans.getByRole("button", { name: "Current plan" })).toHaveAttribute("aria-pressed", "true");
  await expect(plans.getByRole("button", { name: "Choose Team" })).toHaveCount(1);
});

test("Journal never inserts a shared placeholder while a source image loads", async ({ page }) => {
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
  await expect(frame).toHaveAttribute("data-preview-loaded", "true");
  expect(await image.evaluate((node) => (node as HTMLImageElement).complete)).toBe(false);
  await expect(frame.locator('[class*="previewShell"], [class*="shellLine"]')).toHaveCount(0);
  expect(await frame.evaluate((element) => [...element.querySelectorAll("img, picture, video")].every((media) => media.closest("[data-preview-content]") !== null))).toBe(true);
  const originalImage = await image.elementHandle();
  releaseImage();
  await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await expect(frame.locator('[class*="previewShell"]')).toHaveCount(0);
  expect(await originalImage!.evaluate((node) => node.isConnected && (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
});
