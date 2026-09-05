import { expect, test } from "@playwright/test";

const matrix = [
  { id: "RB_control3_blur_highlight", target: "none", textColor: false },
  { id: "RB_batch10_liquid_ascii", target: "sourceProp", textColor: false },
  { id: "RB_control3_empty_state_3", target: "none", textColor: false },
  { id: "RB_hero_16", target: "sourceRoot", textColor: false },
  { id: "RB_control6_text_scatter", target: "none", textColor: false },
] as const;

const ids = matrix.map(({ id }) => id);
const selectedColor = "#123456";
const selectedRgb = "rgb(18, 52, 86)";

async function configFieldKeys(page: import("@playwright/test").Page, id: string) {
  return page.evaluate((componentType) => {
    const puck = (window as typeof window & {
      __PUCK_INTERNAL_DO_NOT_USE?: {
        appStore?: { getState: () => { config?: { components?: Record<string, { fields?: Record<string, unknown> }> } } };
      };
    }).__PUCK_INTERNAL_DO_NOT_USE?.appStore?.getState();
    return Object.keys(puck?.config?.components?.[componentType]?.fields ?? {});
  }, id);
}

test("N3 runtime proves the five semantic background representatives and one native field", async ({ page }) => {
  await page.goto(`/editor-lab/puck-production-registry/puck?ids=${ids.join(",")}`);
  await expect(page.locator("iframe")).toHaveCount(1);
  const frame = page.frameLocator("iframe");

  for (const representative of matrix) {
    const component = frame.locator(`[data-production-component="${representative.id}"]`);
    await expect(component).toHaveCount(1);
    await expect(component.locator(`[data-production-background-target="${representative.target}"]`)).toHaveCount(1);

    const fields = await configFieldKeys(page, representative.id);
    expect(fields.filter((key) => key === "backgroundColor")).toHaveLength(representative.target === "none" ? 0 : 1);
    expect(fields.filter((key) => key === "textColor")).toHaveLength(representative.textColor ? 1 : 0);

    await component.click();
    const properties = page.locator("[data-production-properties]:visible").first();
    await expect(properties).toBeVisible();
    await expect(page.locator('input[aria-label="Text color"][type="color"]:visible')).toHaveCount(representative.textColor ? 1 : 0);
    await expect(properties.locator('input[aria-label="Text color"][type="color"]')).toHaveCount(0);

    if (representative.target === "none") {
      await expect(page.locator('input[aria-label="Background"]:visible')).toHaveCount(0);
      continue;
    }

    const background = page.locator('input[aria-label="Background"][type="color"]:visible');
    await expect(background).toHaveCount(1);
    await background.fill(selectedColor);

    if (representative.target === "sourceProp") {
      await expect.poll(async () => component.locator("pre").evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(selectedRgb);
    } else {
      await expect.poll(async () => component.locator('[class*="sourceRootBackgroundBridge"] > *').evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(selectedRgb);
    }
  }
});
