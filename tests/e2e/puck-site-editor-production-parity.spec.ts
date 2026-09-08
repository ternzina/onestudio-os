import { expect, test } from "@playwright/test";

async function puckRootData(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const appStore = (window as typeof window & {
      __PUCK_INTERNAL_DO_NOT_USE?: { appStore?: { getState: () => { state?: { data?: unknown } } } };
    }).__PUCK_INTERNAL_DO_NOT_USE?.appStore?.getState();
    return appStore?.state?.data ?? null;
  });
}

test("production preview defaults to a usable light canvas and day/night is editor-only", async ({ page }) => {
  await page.goto("/admin/site/puck-pilot");
  await expect(page.locator("[data-puck-production-editor]")).toHaveAttribute("data-theme", "light");
  const frame = page.frameLocator("iframe");
  const canvas = frame.locator("main[data-production-editor-canvas]");
  await expect(canvas).toHaveCount(1);
  await expect.poll(async () => canvas.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe("rgb(255, 255, 255)");

  const before = await puckRootData(page);
  await page.locator("[data-puck-theme-toggle]").click();
  await expect(page.locator("[data-puck-production-editor]")).toHaveAttribute("data-theme", "dark");
  await expect(canvas).toHaveClass(/dark/);
  expect(await puckRootData(page)).toEqual(before);

  await page.locator("[data-puck-theme-toggle]").click();
  await expect(page.locator("[data-puck-production-editor]")).toHaveAttribute("data-theme", "light");
  await expect(canvas).not.toHaveClass(/dark/);
  expect(await puckRootData(page)).toEqual(before);
});

test("production library renders paired cards and a live hover preview from the production registry", async ({ page }) => {
  await page.goto("/admin/site/puck-pilot");
  const search = page.locator('input[aria-label="Поиск блоков"]');
  await search.fill("Hero 16");
  const card = page.getByRole("button", { name: "Add Hero 16 from card", exact: true });
  await expect(card).toBeVisible();
  const grid = page.locator('[class*="libraryGrid"]:visible').first();
  await expect(grid).toBeVisible();
  const columns = await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length);
  expect(columns).toBe(2);

  await card.hover();
  const preview = page.locator('[aria-label="Hero 16 live preview"]');
  await expect(preview).toBeVisible();
  await expect(preview.locator('[data-preview-kind="pro-block"]')).toHaveCount(1);
  await expect(preview.locator('[data-production-component="RB_hero_16"]')).toHaveCount(1);
});

test("production library cards do not present internal source tiers", async ({ page }) => {
  await page.goto("/admin/site/puck-pilot");
  const library = page.locator('aside[aria-label="Product component library"]');
  await expect(library).toBeVisible();
  await expect(library.locator('[data-tier], [class*="tierBadge"]')).toHaveCount(0);
  await expect(library).not.toContainText(/\b(?:FREE|PRO)\b/);
});
