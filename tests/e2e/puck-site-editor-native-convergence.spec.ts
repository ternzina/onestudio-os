import { expect, test } from "@playwright/test";

const url = "/editor-lab/puck-production-registry/puck?ids=reactbits.hero-14,RB_batch7_hero_6";

async function hero6SecondSlideTitle(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const puck = (window as typeof window & {
      __PUCK_INTERNAL_DO_NOT_USE?: {
        appStore?: {
          getState: () => {
            state: { data: { content: Array<{ type: string; props: Record<string, unknown> }> } };
          };
        };
      };
    }).__PUCK_INTERNAL_DO_NOT_USE?.appStore?.getState();
    const slides = puck?.state.data.content.find((component) => component.type === "RB_batch7_hero_6")?.props.slides;
    return Array.isArray(slides) && slides[1] && typeof slides[1] === "object"
      ? (slides[1] as Record<string, unknown>).title
      : null;
  });
}

test("N1 native fields own Hero 14 and Hero 6 editing without duplicate panel controls", async ({ page }) => {
  await page.goto(url);
  await expect(page.locator("iframe")).toHaveCount(1);
  const frame = page.frameLocator("iframe");

  const selectHero14 = async () => {
    await frame.locator('[data-production-component="reactbits.hero-14"]').click();
    const properties = page.locator('[data-production-properties]:visible').first();
    await expect(properties).toBeVisible();
    return properties;
  };

  let properties = await selectHero14();
  await expect(properties.locator('[data-production-field="headingLine1"]')).toHaveCount(0);
  let heading = page.getByRole("textbox", { name: "Heading line 1", exact: true });
  await expect(heading).toHaveCount(1);
  await expect(heading).toBeVisible();
  await expect(page.locator('[data-production-native-group="CONTENT"]').getByRole("textbox", { name: "Heading line 1", exact: true })).toHaveCount(1);
  await expect(page.locator('[data-production-generic-controls]:visible').getByRole("textbox", { name: "Heading line 1", exact: true })).toHaveCount(0);

  await heading.fill("Runtime native heading");
  await expect(frame.locator('[data-production-component="reactbits.hero-14"] h1')).toContainText("Runtime native heading");
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "undo", exact: true }).click();
  await expect(frame.locator('[data-production-component="reactbits.hero-14"] h1')).toContainText("Focus on work.");
  properties = await selectHero14();
  heading = page.getByRole("textbox", { name: "Heading line 1", exact: true });
  await expect(heading).toHaveValue("Focus on work.");
  await page.getByRole("button", { name: "redo", exact: true }).click();
  await expect(frame.locator('[data-production-component="reactbits.hero-14"] h1')).toContainText("Runtime native heading");
  await selectHero14();
  heading = page.getByRole("textbox", { name: "Heading line 1", exact: true });
  await expect(heading).toHaveValue("Runtime native heading");
  await properties.getByRole("button", { name: "Вернуть блок к оригиналу", exact: true }).click();
  await expect(frame.locator('[data-production-component="reactbits.hero-14"] h1')).toContainText("Focus on work.");
  await selectHero14();
  heading = page.getByRole("textbox", { name: "Heading line 1", exact: true });
  await expect(heading).toHaveValue("Focus on work.");

  const openHero6Slide = async (expectedTitle: string) => {
    await frame.locator('[data-production-component="RB_batch7_hero_6"]').click();
    await expect(page.getByRole("heading", { name: "Hero 6", exact: true })).toBeVisible();
    const hero6Properties = page.locator('[data-production-properties]:visible').first();
    await expect(hero6Properties.locator('[data-production-array-item="slides"]')).toHaveCount(0);
    const nativeTitle = page.getByRole("textbox", { name: "Title", exact: true }).last();
    if (!(await nativeTitle.isVisible())) {
      const slides = page.getByText("Slides", { exact: true }).last();
      await expect(slides).toBeVisible();
      const slide = page.getByText(expectedTitle, { exact: true }).last();
      if (!(await slide.isVisible())) await slides.click();
      await expect(slide).toBeVisible();
      await slide.click();
    }
    return {
      hero6Properties,
      nativeSlideTitle: nativeTitle,
    };
  };

  let { hero6Properties, nativeSlideTitle } = await openHero6Slide("Build together.");
  await expect(nativeSlideTitle).toHaveValue("Build together.");
  await nativeSlideTitle.fill("Runtime native slide");
  await expect(nativeSlideTitle).toHaveValue("Runtime native slide");
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "undo", exact: true }).click();
  await expect.poll(() => hero6SecondSlideTitle(page)).toBe("Build together.");
  await page.getByRole("button", { name: "redo", exact: true }).click();
  await expect.poll(() => hero6SecondSlideTitle(page)).toBe("Runtime native slide");
  ({ hero6Properties, nativeSlideTitle } = await openHero6Slide("Runtime native slide"));
  await expect(nativeSlideTitle).toHaveValue("Runtime native slide");
  const visibleHero6Properties = page.locator('[data-production-properties]:visible').first();
  await visibleHero6Properties.getByRole("button", { name: "Вернуть блок к оригиналу", exact: true }).click();
  await expect.poll(() => hero6SecondSlideTitle(page)).toBe("Build together.");
  ({ hero6Properties, nativeSlideTitle } = await openHero6Slide("Build together."));
  await expect(nativeSlideTitle).toHaveValue("Build together.");
});
