import { expect, test } from "@playwright/test";
import {
  TEMPLATE_EDITOR_CANVAS_CLASS,
  TEMPLATE_EDITOR_COLUMNS_CLASS,
  TEMPLATE_EDITOR_NAVIGATOR_CLASS,
  TEMPLATE_EDITOR_SETTINGS_CLASS,
} from "../../components/admin/template-editor-layout";

const desktopViewports = [
  { width: 1440, height: 1000 },
  { width: 1512, height: 982 },
  { width: 1728, height: 1117 },
];

test.describe("Premium editor desktop geometry", () => {
  for (const viewport of desktopViewports) {
    test(`${viewport.width}x${viewport.height} keeps navigator, canvas and settings side by side`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");

      const shell = `<section data-template-editor-columns class="${TEMPLATE_EDITOR_COLUMNS_CLASS}">
        <aside data-template-editor-navigator class="${TEMPLATE_EDITOR_NAVIGATOR_CLASS}"><nav>Header<br>Hero<br>Footer</nav><button data-add-premium-block type="button">+ Добавить блок</button></aside>
        <div data-template-editor-canvas class="${TEMPLATE_EDITOR_CANVAS_CLASS}"><div data-bembi-preview>BEMBI SITE</div></div>
        <aside data-template-editor-settings class="${TEMPLATE_EDITOR_SETTINGS_CLASS}"><div data-hero-settings>Hero settings</div></aside>
      </section>`;

      await page.locator("body").evaluate((body, markup) => {
        body.innerHTML = `<main style="padding:96px 40px 64px"><div style="width:100%;max-width:1280px;margin:0 auto">${markup}</div></main>`;
      }, shell);

      const geometry = await page.locator("[data-template-editor-columns]").evaluate((workspace) => {
        const rect = (selector: string) => {
          const value = workspace.querySelector(selector)?.getBoundingClientRect();
          if (!value) throw new Error(`Missing ${selector}`);
          return { left: value.left, right: value.right, top: value.top, bottom: value.bottom, width: value.width };
        };
        const workspaceRect = workspace.getBoundingClientRect();
        return {
          workspace: { left: workspaceRect.left, right: workspaceRect.right, top: workspaceRect.top, bottom: workspaceRect.bottom, width: workspaceRect.width },
          navigator: rect("[data-template-editor-navigator]"),
          canvas: rect("[data-template-editor-canvas]"),
          settings: rect("[data-template-editor-settings]"),
        };
      });

      expect(geometry.workspace.width).toBe(1280);
      expect(geometry.navigator.right).toBeLessThanOrEqual(geometry.canvas.left + 0.5);
      expect(geometry.canvas.right).toBeLessThanOrEqual(geometry.settings.left + 0.5);
      expect(Math.abs(geometry.navigator.top - geometry.canvas.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.canvas.top - geometry.settings.top)).toBeLessThanOrEqual(1);
      expect(Math.min(geometry.navigator.bottom, geometry.canvas.bottom, geometry.settings.bottom)).toBeGreaterThan(geometry.navigator.top + 300);
      expect(geometry.navigator.width).toBeGreaterThanOrEqual(220);
      expect(geometry.settings.width).toBeGreaterThanOrEqual(320);

      const addButton = page.locator("[data-add-premium-block]");
      await expect(addButton).toBeVisible();
      expect(await addButton.evaluate((button) => button.previousElementSibling?.tagName)).toBe("NAV");
    });
  }
});
