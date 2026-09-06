import { expect, test } from "@playwright/test";

const heroType = "RB_hero_16";
const draftKey = "onestudio:puck-pilot:draft:v1:local-pilot-fixture:en:pilot-home";

async function selectedHeroProps(page: import("@playwright/test").Page) {
  return page.evaluate((type) => {
    const puck = (window as typeof window & {
      __PUCK_INTERNAL_DO_NOT_USE?: {
        appStore?: {
          getState: () => {
            state: { data: { content: Array<{ type: string; props: Record<string, unknown> }> } };
          };
        };
      };
    }).__PUCK_INTERNAL_DO_NOT_USE?.appStore?.getState();
    return puck?.state.data.content.find((component) => component.type === type)?.props ?? null;
  }, heroType);
}

async function selectHero16(page: import("@playwright/test").Page) {
  const frame = page.frameLocator("iframe");
  const hero = frame.locator(`[data-production-component="${heroType}"]`);
  await expect(hero).toHaveCount(1);
  await hero.click();
  const properties = page.locator('[data-production-properties]:visible').first();
  await expect(properties).toBeVisible();
  return { frame, properties };
}

async function selectedPropsFor(page: import("@playwright/test").Page, type: string) {
  return page.evaluate((componentType) => {
    const puck = (window as typeof window & {
      __PUCK_INTERNAL_DO_NOT_USE?: {
        appStore?: {
          getState: () => {
            state: { data: { content: Array<{ type: string; props: Record<string, unknown> }> } };
          };
        };
      };
    }).__PUCK_INTERNAL_DO_NOT_USE?.appStore?.getState();
    return puck?.state.data.content.find((component) => component.type === componentType)?.props ?? null;
  }, type);
}

async function selectProductionComponent(page: import("@playwright/test").Page, type: string) {
  const frame = page.frameLocator("iframe");
  const component = frame.locator(`[data-production-component="${type}"]`);
  await expect(component).toHaveCount(1);
  await component.click();
  const properties = page.locator('[data-production-properties]:visible').first();
  await expect(properties).toBeVisible();
  return { frame, properties };
}

test("real Puck native fields render the declared Background and persist it through reload/reset", async ({ page }) => {
  await page.goto("/editor-lab/puck-pilot");
  await expect(page.locator("[data-puck-pilot-editor]")).toBeVisible();

  const { frame, properties } = await selectHero16(page);
  await expect(properties.locator('input[aria-label="Background"][type="color"]')).toHaveCount(0);
  await expect(properties.locator('input[aria-label="Text color"][type="color"]')).toHaveCount(0);
  await expect(page.locator('input[aria-label="Background"][type="color"]:visible')).toHaveCount(1);
  await expect(page.locator('[data-production-color-label="Background"]:visible')).toHaveCount(1);
  await expect(page.locator('input[aria-label="Background"][type="number"]:visible')).toHaveCount(0);
  await expect(page.locator('input[aria-label="Text color"][type="number"]:visible')).toHaveCount(0);

  const background = page.locator('input[aria-label="Background"][type="color"]:visible');
  await expect(background).toHaveValue("#ffffff");
  await background.fill("#123456");
  await expect(background).toHaveValue("#123456");
  await expect.poll(async () => (await selectedHeroProps(page))?.backgroundColor).toBe("#123456");
  await page.waitForTimeout(350);

  await page.getByRole("button", { name: "undo", exact: true }).click();
  await expect.poll(async () => (await selectedHeroProps(page))?.backgroundColor).toBe("#ffffff");
  await page.getByRole("button", { name: "redo", exact: true }).click();
  await expect.poll(async () => (await selectedHeroProps(page))?.backgroundColor).toBe("#123456");

  const changedSourceRoot = frame.locator(`[data-production-component="${heroType}"] [class*="sourceRootBackgroundBridge"] > *`);
  await expect(changedSourceRoot).toHaveCSS("background-color", "rgb(18, 52, 86)");

  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect.poll(async () => page.evaluate((key) => {
    const serialized = window.localStorage.getItem(key);
    if (!serialized) return null;
    const document = JSON.parse(serialized) as { content?: Array<{ type: string; props: Record<string, unknown> }> };
    return document.content?.find((component) => component.type === "RB_hero_16")?.props.backgroundColor ?? null;
  }, draftKey)).toBe("#123456");

  await page.reload();
  const reloaded = await selectHero16(page);
  const reloadedBackground = page.locator('input[aria-label="Background"][type="color"]:visible');
  await expect(reloadedBackground).toHaveValue("#123456");
  await expect.poll(async () => (await selectedHeroProps(page))?.backgroundColor).toBe("#123456");

  await reloaded.properties.getByRole("button", { name: "Вернуть блок к оригиналу", exact: true }).click();
  await expect(reloadedBackground).toHaveValue("#ffffff");
  await expect.poll(async () => (await selectedHeroProps(page))?.backgroundColor).toBe("#ffffff");
});

test("generated Puck config exposes only capability-declared native colors", async ({ page }) => {
  const matrix = ["reactbits.hero-14", "RB_batch10_liquid_ascii", "RB_hero_16"];
  await page.goto(`/editor-lab/puck-production-registry/puck?ids=${matrix.join(",")}`);
  await expect(page.locator("iframe")).toHaveCount(1);
  const frame = page.frameLocator("iframe");

  for (const type of matrix) {
    const component = frame.locator(`[data-production-component="${type}"]`);
    await expect(component).toHaveCount(1);
    await component.click();
    const properties = page.locator('[data-production-properties]:visible').first();
    await expect(properties).toBeVisible();

    const configFields = await page.evaluate((componentType) => {
      const appStore = (window as typeof window & {
        __PUCK_INTERNAL_DO_NOT_USE?: {
          appStore?: { getState: () => { config?: { components?: Record<string, { fields?: Record<string, { type?: string; render?: unknown }> }> } } };
        };
      }).__PUCK_INTERNAL_DO_NOT_USE?.appStore?.getState();
      const fields = appStore?.config?.components?.[componentType]?.fields ?? {};
      return {
        colorKeys: Object.keys(fields).filter((key) => key === "backgroundColor" || key === "textColor"),
        backgroundType: fields.backgroundColor?.type,
        textType: fields.textColor?.type,
        hasBackgroundRenderer: typeof fields.backgroundColor?.render === "function",
        hasTextRenderer: typeof fields.textColor?.render === "function",
      };
    }, type);

    expect(configFields.colorKeys).toEqual(["backgroundColor"]);
    expect(configFields.backgroundType).toBe("custom");
    expect(configFields.textType).toBeUndefined();
    expect(configFields.hasBackgroundRenderer).toBe(true);
    expect(configFields.hasTextRenderer).toBe(false);
    await expect(page.locator('input[aria-label="Background"].production-color-input[type="color"]:visible')).toHaveCount(1);
    await expect(page.locator('input[aria-label="Text color"].production-color-input[type="color"]:visible')).toHaveCount(0);
    await expect(page.locator('[data-production-color-label="Background"]:visible')).toHaveCount(1);
    await expect(page.locator('[data-production-color-label="Text color"]:visible')).toHaveCount(0);
    await expect(properties.locator('input.production-color-input[type="color"]')).toHaveCount(0);
  }
});

test("scalar production properties round-trip through Puck data and reload", async ({ page }) => {
  await page.goto("/editor-lab/puck-pilot");
  await expect(page.locator("[data-puck-pilot-editor]")).toBeVisible();

  await selectProductionComponent(page, "reactbits.hero-14");
  const heading = page.locator('input[aria-label="Heading line 1"]:visible');
  await expect(heading).toHaveCount(1);
  await expect(heading).toHaveValue("Focus on work.");
  await heading.fill("Edited heading");
  await expect.poll(async () => (await selectedPropsFor(page, "reactbits.hero-14"))?.headingLine1).toBe("Edited heading");
  await heading.fill("");
  await expect.poll(async () => (await selectedPropsFor(page, "reactbits.hero-14"))?.headingLine1).toBe("");
  await heading.fill("Edited heading");

  await selectProductionComponent(page, "reactbits.glow-cursor");
  const trailLength = page.locator('input[aria-label="Trail length"]:visible');
  await expect(trailLength).toHaveAttribute("min", "2");
  await expect(trailLength).toHaveAttribute("max", "64");
  await expect(trailLength).toHaveAttribute("step", "1");
  await trailLength.fill("24");
  await expect.poll(async () => (await selectedPropsFor(page, "reactbits.glow-cursor"))?.trailLength).toBe(24);
  await trailLength.fill("");
  await expect.poll(async () => (await selectedPropsFor(page, "reactbits.glow-cursor"))?.trailLength).toBe(24);

  await page.locator('input[aria-label="Idle fade: No"]:visible').check();
  await page.locator('select[aria-label="Blend mode"]:visible').selectOption("normal");
  await page.locator('input[aria-label="Color"]:visible').fill("#123456");
  await expect.poll(async () => selectedPropsFor(page, "reactbits.glow-cursor")).toMatchObject({
    idleFade: false,
    blendMode: "normal",
    color: "#123456",
  });

  await selectProductionComponent(page, "reactbits.hero-14");
  await selectProductionComponent(page, "reactbits.glow-cursor");
  await expect(trailLength).toHaveValue("24");
  await expect(page.locator('input[aria-label="Idle fade: No"]:visible')).toBeChecked();
  await expect(page.locator('select[aria-label="Blend mode"]:visible')).toHaveValue("normal");
  await expect(page.locator('input[aria-label="Color"]:visible')).toHaveValue("#123456");

  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect.poll(async () => page.evaluate((key) => {
    const serialized = window.localStorage.getItem(key);
    if (!serialized) return null;
    const document = JSON.parse(serialized) as { content?: Array<{ type: string; props: Record<string, unknown> }> };
    return document.content?.find((component) => component.type === "reactbits.glow-cursor")?.props ?? null;
  }, draftKey)).toMatchObject({ trailLength: 24, idleFade: false, blendMode: "normal", color: "#123456" });

  await page.reload();
  await selectProductionComponent(page, "reactbits.glow-cursor");
  await expect(page.locator('input[aria-label="Trail length"]:visible')).toHaveValue("24");
  await expect(page.locator('input[aria-label="Idle fade: No"]:visible')).toBeChecked();
  await expect(page.locator('select[aria-label="Blend mode"]:visible')).toHaveValue("normal");
  await expect(page.locator('input[aria-label="Color"]:visible')).toHaveValue("#123456");

  await page.getByRole("link", { name: "Open public pilot render", exact: true }).click();
  await expect(page.locator("[data-puck-public-pilot]")).toBeVisible();
  await expect(page.locator("[data-puck-public-pilot]")).toContainText("Edited heading");
});
