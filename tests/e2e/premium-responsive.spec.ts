import { expect, test } from "@playwright/test";

const widths = [320, 360, 375, 390, 414, 430, 768, 1024];
const routes = [
  "/demos/premium-kids-center",
  "/demos/premium-kids-center/tasks",
  "/demos/premium-kids-center/workbooks",
  "/demos/premium-kids-center/experiments",
  "/demos/premium-kids-center/articles",
  "/demos/premium-kids-center/articles/add-subtract-within-100",
];

for (const width of widths) {
  test(`BEMBI Premium has no page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("[data-premium-runtime]")).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, `${route} widened the ${width}px viewport`).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  });
}
