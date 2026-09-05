import { expect, test } from "@playwright/test";

async function openLibraryPreview(page: import("@playwright/test").Page, query: string) {
  await page.goto("/editor-lab/puck-pilot");
  const search = page.getByRole("searchbox", { name: "Поиск блоков", exact: true });
  await search.fill(query);
  const card = page.locator("article").filter({ hasText: query }).first();
  await expect(card).toBeVisible();
  await card.hover();
  const preview = page.locator(`section[aria-label="${query} live preview"]`);
  await expect(preview).toBeVisible();
  return preview;
}

test("production Library previews use the intrinsic-scene contain contract for tall and wide sources", async ({ page }) => {
  const heroPreview = await openLibraryPreview(page, "Hero 16");
  const heroMetrics = await heroPreview.evaluate((node) => {
    const stage = node.querySelector<HTMLElement>("[class*='previewStage']")!;
    const viewport = node.querySelector<HTMLElement>("[data-production-preview-fit]")!;
    const scene = viewport.firstElementChild as HTMLElement;
    const component = node.querySelector<HTMLElement>("[data-production-component]")!;
    return {
      stage: stage.getBoundingClientRect().toJSON(),
      component: component.getBoundingClientRect().toJSON(),
      scale: Number(scene.dataset.productionPreviewScale),
      transform: scene.style.transform,
      fit: viewport.dataset.productionPreviewFit,
    };
  });
  expect(heroMetrics.fit).toBe("canonical-contain");
  expect(heroMetrics.scale).toBeGreaterThan(0);
  expect(heroMetrics.scale).toBeLessThanOrEqual(1);
  expect(heroMetrics.component.width).toBeGreaterThan(heroMetrics.stage.width * 0.5);
  expect(heroMetrics.component.right).toBeLessThanOrEqual(heroMetrics.stage.right + 2);
  expect(heroMetrics.component.bottom).toBeLessThanOrEqual(heroMetrics.stage.bottom + 2);
  expect(heroMetrics.transform).toContain("scale(");

  const emptyPreview = await openLibraryPreview(page, "Empty State 3");
  const emptyMetrics = await emptyPreview.evaluate((node) => {
    const stage = node.querySelector<HTMLElement>("[class*='previewStage']")!;
    const component = node.querySelector<HTMLElement>("[data-production-component]")!;
    const source = node.querySelector<HTMLElement>("[data-production-host-profile]")!;
    return {
      stage: stage.getBoundingClientRect().toJSON(),
      component: component.getBoundingClientRect().toJSON(),
      source: source.getBoundingClientRect().toJSON(),
    };
  });
  expect(emptyMetrics.component.width).toBeGreaterThan(emptyMetrics.stage.width * 0.5);
  expect(emptyMetrics.component.height).toBeGreaterThan(200);
  // Direct component previews intentionally keep the experimental intrinsic
  // height and center that source inside the fixed stage; only pro-blocks use
  // the MarketingPreview contain boundary.
  expect(emptyMetrics.component.height).toBeGreaterThan(emptyMetrics.stage.height);
  expect(emptyMetrics.component.top).toBeLessThan(emptyMetrics.stage.top);
  expect(emptyMetrics.component.bottom).toBeGreaterThan(emptyMetrics.stage.bottom);
  expect(emptyMetrics.source.height).toBeGreaterThan(200);
});

test("Frame Border Library preview directly fills the stage without a transform", async ({ page }) => {
  const preview = await openLibraryPreview(page, "Frame Border");
  await expect(preview.locator("canvas")).toBeVisible();

  const metrics = await preview.evaluate((node) => {
    const stage = node.querySelector<HTMLElement>("[class*='previewStage']")!;
    const mount = node.querySelector<HTMLElement>("[data-preview-kind]")!;
    const component = node.querySelector<HTMLElement>("[data-production-component]")!;
    const host = component.querySelector<HTMLElement>("[data-production-host-profile]")!;
    const canvas = component.querySelector<HTMLCanvasElement>("canvas")!;
    const rect = (element: Element) => element.getBoundingClientRect().toJSON();
    return {
      stage: rect(stage),
      mount: rect(mount),
      component: rect(component),
      host: { rect: rect(host), offsetWidth: host.offsetWidth, offsetHeight: host.offsetHeight },
      canvas: { rect: rect(canvas), width: canvas.width, height: canvas.height },
      hasPreviewFit: Boolean(node.querySelector("[data-production-preview-fit]")),
    };
  });

  console.log(`[library-webgl-geometry] ${JSON.stringify(metrics)}`);
  expect(metrics.hasPreviewFit).toBe(false);
  expect(metrics.mount.width).toBeCloseTo(metrics.stage.width, 1);
  expect(metrics.mount.height).toBeCloseTo(metrics.stage.height, 1);
  expect(metrics.host.offsetWidth).toBe(metrics.stage.width);
  expect(metrics.host.offsetHeight).toBe(metrics.stage.height);
  expect(metrics.component.width).toBeCloseTo(metrics.stage.width, 1);
  expect(metrics.component.height).toBeCloseTo(metrics.stage.height, 1);
  expect(metrics.canvas.rect.width).toBeCloseTo(metrics.stage.width, 1);
  expect(metrics.canvas.rect.height).toBeCloseTo(metrics.stage.height, 1);
  expect(Math.abs((metrics.component.left + metrics.component.right) / 2 - (metrics.stage.left + metrics.stage.right) / 2)).toBeLessThan(1);
  expect(Math.abs((metrics.component.top + metrics.component.bottom) / 2 - (metrics.stage.top + metrics.stage.bottom) / 2)).toBeLessThan(1);
});

test("Text Scatter uses the official demo contract on the selected component root", async ({ page }) => {
  const preview = await openLibraryPreview(page, "Text Scatter");
  await expect(preview.locator("h2, h1")).toBeVisible();
  const metrics = await preview.evaluate((node) => {
    const stage = node.querySelector<HTMLElement>("[class*='previewStage']")!;
    const viewport = node.querySelector<HTMLElement>("[data-production-preview-fit]")!;
    const scene = viewport.firstElementChild as HTMLElement;
    const mount = node.querySelector<HTMLElement>("[data-preview-kind]")!;
    const component = node.querySelector<HTMLElement>("[data-production-component]")!;
    const sourceHost = node.querySelector<HTMLElement>("[data-production-host-profile]")!;
    const heading = node.querySelector<HTMLElement>("h2, h1")!;
    return {
      stage: stage.getBoundingClientRect().toJSON(),
      viewport: viewport.getBoundingClientRect().toJSON(),
      scene: scene.getBoundingClientRect().toJSON(),
      mount: mount.getBoundingClientRect().toJSON(),
      component: component.getBoundingClientRect().toJSON(),
      sourceHostOverflow: {
        overflow: getComputedStyle(sourceHost).overflow,
        overflowX: getComputedStyle(sourceHost).overflowX,
        overflowY: getComputedStyle(sourceHost).overflowY,
      },
      rootLayout: {
        display: getComputedStyle(sourceHost).display,
        alignItems: getComputedStyle(sourceHost).alignItems,
        justifyContent: getComputedStyle(sourceHost).justifyContent,
        minHeight: getComputedStyle(sourceHost).minHeight,
        metadata: sourceHost.dataset.productionPresentationRootLayout ?? null,
      },
      heading: heading.getBoundingClientRect().toJSON(),
      fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
      text: heading.textContent,
      presentation: component.dataset.productionPresentation,
      presentationTarget: component.dataset.productionPresentationTarget,
      componentClass: component.className,
    };
  });
  expect(metrics.stage.height).toBe(390);
  expect(metrics.viewport.height).toBe(metrics.stage.height);
  expect(metrics.scene.height).toBeLessThanOrEqual(metrics.stage.height + 1);
  expect(metrics.mount.height).toBeGreaterThan(0);
  expect(metrics.component.height).toBeGreaterThan(0);
  expect(metrics.heading.height).toBeGreaterThan(0);
  expect(metrics.fontSize).toBeGreaterThanOrEqual(48);
  expect(metrics.text).toBe("Bounce Back.");
  expect(metrics.presentation).toBe("officialDemo");
  expect(metrics.presentationTarget).toBe("componentRoot");
  expect(metrics.sourceHostOverflow).toEqual({ overflow: "visible", overflowX: "visible", overflowY: "visible" });
  expect(metrics.rootLayout).toEqual({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    metadata: "flex-center",
  });
  expect(metrics.componentClass).not.toContain("min-h-[400px]");
  expect(Math.abs((metrics.heading.left + metrics.heading.right) / 2 - (metrics.stage.left + metrics.stage.right) / 2)).toBeLessThan(2);
  expect(Math.abs((metrics.heading.top + metrics.heading.bottom) / 2 - (metrics.stage.top + metrics.stage.bottom) / 2)).toBeLessThan(3);

  await page.goto("/editor-lab/puck-production-registry/puck?ids=RB_control6_text_scatter");
  const frame = page.frameLocator("iframe");
  const canvasMetrics = await frame.locator('[data-production-component="RB_control6_text_scatter"]').evaluate((node) => {
    const source = node.querySelector<HTMLElement>("[data-production-host-profile]")!;
    const component = node as HTMLElement;
    const sourceHost = node.querySelector<HTMLElement>("[data-production-host-profile]")!;
    const heading = node.querySelector<HTMLElement>("h2, h1")!;
    return {
      component: component.getBoundingClientRect().toJSON(),
      source: source.getBoundingClientRect().toJSON(),
      sourceHostOverflow: {
        overflow: getComputedStyle(sourceHost).overflow,
        overflowX: getComputedStyle(sourceHost).overflowX,
        overflowY: getComputedStyle(sourceHost).overflowY,
      },
      rootLayout: {
        display: getComputedStyle(sourceHost).display,
        alignItems: getComputedStyle(sourceHost).alignItems,
        justifyContent: getComputedStyle(sourceHost).justifyContent,
        minHeight: getComputedStyle(sourceHost).minHeight,
        metadata: sourceHost.dataset.productionPresentationRootLayout ?? null,
      },
      heading: heading.getBoundingClientRect().toJSON(),
      fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
      presentation: component.dataset.productionPresentation,
      presentationTarget: component.dataset.productionPresentationTarget,
      componentClass: component.className,
    };
  });
  expect(canvasMetrics.component.height).toBeGreaterThanOrEqual(400);
  expect(canvasMetrics.source.height).toBeGreaterThanOrEqual(canvasMetrics.heading.height);
  expect(canvasMetrics.heading.height).toBeGreaterThan(40);
  expect(canvasMetrics.fontSize).toBeGreaterThanOrEqual(48);
  expect(canvasMetrics.presentation).toBe("officialDemo");
  expect(canvasMetrics.presentationTarget).toBe("componentRoot");
  expect(canvasMetrics.sourceHostOverflow).toEqual({ overflow: "visible", overflowX: "visible", overflowY: "visible" });
  expect(canvasMetrics.rootLayout).toEqual({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    metadata: "flex-center",
  });
  expect(canvasMetrics.componentClass).not.toContain("min-h-[400px]");

  await frame.locator('[data-production-component="RB_control6_text_scatter"]').click();
  const configFields = await page.evaluate(() => {
    const puck = (window as typeof window & {
      __PUCK_INTERNAL_DO_NOT_USE?: {
        appStore?: { getState: () => { config?: { components?: Record<string, { fields?: Record<string, unknown> }> } } };
      };
    }).__PUCK_INTERNAL_DO_NOT_USE?.appStore?.getState();
    return Object.keys(puck?.config?.components?.RB_control6_text_scatter?.fields ?? {})
      .filter((key) => key === "backgroundColor" || key === "textColor");
  });
  expect(configFields).toEqual([]);
  await expect(page.locator('[data-production-color-label="Background"]:visible')).toHaveCount(0);
  await expect(page.locator('[data-production-color-label="Text color"]:visible')).toHaveCount(0);

  await page.getByRole("button", { name: "Interact with page", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit layout", exact: true })).toBeVisible();
  const firstLetter = frame.locator('[data-production-component="RB_control6_text_scatter"] h2 span, [data-production-component="RB_control6_text_scatter"] h1 span').first();
  await firstLetter.hover();
  await expect.poll(async () => firstLetter.evaluate((node) => getComputedStyle(node).transform)).not.toBe("none");
});
