import { expect, test } from "@playwright/test";

const probeIds = [
  "RB_control6_text_scatter",
  "reactbits.glow-cursor",
  "RB_batch10_cursor_wave",
  "RB_hero_16",
  "RB_batch10_liquid_ascii",
];

test("runtime host audit records the production iframe geometry and theme boundary", async ({ page }) => {
  await page.goto(`/editor-lab/puck-production-registry/puck?ids=${probeIds.join(",")}`);
  await expect(page.locator("iframe")).toHaveCount(1);
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("[data-production-component]")).toHaveCount(probeIds.length);
  await page.waitForTimeout(700);

  const snapshot = await page.locator("iframe").evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Puck iframe document is unavailable");
    const computed = (element: Element | null, properties: string[]) => element
      ? Object.fromEntries(properties.map((property) => [property, getComputedStyle(element).getPropertyValue(property)]))
      : null;
    const components = Array.from(doc.querySelectorAll<HTMLElement>("[data-production-component]")).map((component) => {
      const sourceHost = component.querySelector<HTMLElement>("[data-production-host-profile]");
      const heading = component.querySelector<HTMLElement>("h1,h2");
      return {
        id: component.dataset.productionComponent,
        component: component.getBoundingClientRect().toJSON(),
        sourceHost: sourceHost?.getBoundingClientRect().toJSON(),
        sourceHostStyle: computed(sourceHost, ["width", "height", "min-height", "overflow", "overflow-x", "overflow-y", "display", "transform"]),
        heading: heading?.getBoundingClientRect().toJSON(),
      };
    });
    const canvas = doc.querySelector<HTMLElement>("[data-production-editor-canvas]");
    const frame = doc.defaultView?.frameElement as HTMLIFrameElement | null;
    const frameRect = frame?.getBoundingClientRect();
    const canvasRoot = doc.querySelector<HTMLElement>("[class*='PuckCanvas-root']");
    return {
      htmlClass: doc.documentElement.className,
      htmlTheme: doc.documentElement.dataset.theme,
      body: computed(doc.body, ["background-color", "color", "width", "height", "overflow"]),
      puckPreviewMode: doc.querySelector("[data-puck-entry]")?.getAttribute("data-puck-preview-mode"),
      frame: frame && {
        rect: frameRect?.toJSON(),
        offsetWidth: frame.offsetWidth,
        offsetHeight: frame.offsetHeight,
        computed: computed(frame, ["width", "height", "transform", "transform-origin", "overflow", "pointer-events"]),
      },
      canvasRoot: canvasRoot && {
        rect: canvasRoot.getBoundingClientRect().toJSON(),
        computed: computed(canvasRoot, ["width", "height", "min-height", "overflow", "transform", "transform-origin", "zoom"]),
      },
      canvas: canvas && {
        rect: canvas.getBoundingClientRect().toJSON(),
        computed: computed(canvas, ["background-color", "color", "width", "height", "min-height", "overflow"]),
      },
      components,
    };
  });

  console.log(`[runtime-host-audit] ${JSON.stringify(snapshot)}`);
  expect(snapshot.components.every((component) => (component.component?.width ?? 0) > 0)).toBe(true);
  expect(snapshot.components.every((component) => (component.sourceHost?.height ?? 0) > 0)).toBe(true);
  const textScatter = snapshot.components.find((component) => component.id === "RB_control6_text_scatter");
  expect(textScatter?.sourceHostStyle?.transform).toBe("none");
  expect(textScatter?.sourceHostStyle?.overflow).toBe("visible");
  expect(textScatter?.sourceHostStyle?.["overflow-x"]).toBe("visible");
  expect(textScatter?.sourceHostStyle?.["overflow-y"]).toBe("visible");
  expect(textScatter?.heading?.height ?? 0).toBeGreaterThan(40);
  const hero = snapshot.components.find((component) => component.id === "RB_hero_16");
  expect(hero?.sourceHostStyle?.overflow).toBe("visible");
});

test("WebGL sources render through the same unscaled production host", async ({ page }) => {
  await page.goto("/editor-lab/puck-production-registry/puck?ids=RB_frame_border,RB_dot_shift");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("[data-production-component]")).toHaveCount(2);

  const measurements = await page.locator("iframe").evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Puck iframe document is unavailable");
    const measure = (component: HTMLElement) => {
      const host = component.querySelector<HTMLElement>("[data-production-host-profile]");
      const canvas = component.querySelector<HTMLCanvasElement>("canvas");
      return {
        id: component.dataset.productionComponent,
        host: host?.getBoundingClientRect().toJSON() ?? null,
        hostTransform: host ? getComputedStyle(host).transform : null,
        canvas: canvas?.getBoundingClientRect().toJSON() ?? null,
      };
    };
    return Array.from(doc.querySelectorAll<HTMLElement>("[data-production-component]")).map(measure);
  });

  expect(measurements).toHaveLength(2);
  for (const item of measurements) {
    expect(item.host?.width ?? 0).toBeGreaterThan(0);
    expect(item.host?.height ?? 0).toBeGreaterThan(0);
    expect(item.hostTransform).toBe("none");
    expect(item.canvas?.width ?? 0).toBeGreaterThan(0);
    expect(item.canvas?.height ?? 0).toBeGreaterThan(0);
  }
});

test("runtime host audit records the production library preview layer", async ({ page }) => {
  await page.goto("/editor-lab/puck-pilot");
  const search = page.locator('input[aria-label="Поиск блоков"]');
  await search.fill("Text Scatter");
  await page.locator("article").filter({ hasText: "Text Scatter" }).first().hover();
  const preview = page.locator('[aria-label="Text Scatter live preview"]');
  await expect(preview).toBeVisible();
  await expect(preview.locator("[data-production-host-profile]")).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(250);

  const snapshot = await preview.evaluate((node) => {
    const computed = (element: Element | null, properties: string[]) => element
      ? Object.fromEntries(properties.map((property) => [property, getComputedStyle(element).getPropertyValue(property)]))
      : null;
    const stage = node.querySelector<HTMLElement>("[class*='previewStage']");
    const mount = node.querySelector<HTMLElement>("[data-preview-kind]");
    const component = node.querySelector<HTMLElement>("[data-production-component]");
    const sourceHost = node.querySelector<HTMLElement>("[data-production-host-profile]");
    const heading = node.querySelector<HTMLElement>("h1,h2");
    return {
      previewClass: node.className,
      stage: stage?.getBoundingClientRect().toJSON(),
      mount: mount?.getBoundingClientRect().toJSON(),
      component: component?.getBoundingClientRect().toJSON(),
      sourceHost: sourceHost?.getBoundingClientRect().toJSON(),
      sourceHostStyle: computed(sourceHost, ["width", "height", "min-height", "overflow", "overflow-x", "overflow-y", "display", "transform"]),
      heading: heading?.getBoundingClientRect().toJSON(),
      headingStyle: computed(heading, ["font-size", "line-height", "color", "display", "transform"]),
    };
  });

  console.log(`[runtime-library-audit] ${JSON.stringify(snapshot)}`);
  expect(snapshot.component?.width ?? 0).toBeGreaterThan(0);
  expect(snapshot.heading?.height ?? 0).toBeGreaterThan(0);
  expect(snapshot.sourceHostStyle?.overflow).toBe("visible");
  expect(snapshot.sourceHostStyle?.["overflow-x"]).toBe("visible");
  expect(snapshot.sourceHostStyle?.["overflow-y"]).toBe("visible");
});

test("runtime host audit records shared pointer delivery in interact mode", async ({ page }) => {
  await page.goto("/editor-lab/puck-production-registry/puck?ids=reactbits.glow-cursor,RB_batch10_cursor_wave");
  await expect(page.locator("iframe")).toHaveCount(1);
  await expect(page.frameLocator("iframe").locator("[data-production-component]")).toHaveCount(2);

  await page.getByRole("button", { name: "Interact with page" }).click();
  const frame = page.locator("iframe");
  const frameBox = await frame.boundingBox();
  if (!frameBox) throw new Error("Puck iframe has no visual bounds");
  const events = await frame.evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Puck iframe document is unavailable");
    const records: Array<{ source: string; type: string; clientX: number; clientY: number; target: string }> = [];
    const sources = Array.from(doc.querySelectorAll<HTMLElement>("[data-production-host-profile] > :first-child"));
    if (sources.length < 2) throw new Error("Pointer probe source hosts are unavailable");
    const record = (event: Event) => {
      const pointer = event as PointerEvent;
      const source = (event.currentTarget as HTMLElement).closest<HTMLElement>("[data-production-component]");
      records.push({ source: source?.dataset.productionComponent ?? "", type: event.type, clientX: pointer.clientX, clientY: pointer.clientY, target: (event.target as Element | null)?.tagName ?? "" });
    };
    sources.forEach((source) => {
      source.addEventListener("pointermove", record, true);
      source.addEventListener("pointerenter", record, true);
    });
    (doc.defaultView as Window & { __runtimePointerRecords?: typeof records }).__runtimePointerRecords = records;
    return {
      sources: sources.map((source) => ({
        id: source.closest<HTMLElement>("[data-production-component]")?.dataset.productionComponent ?? "",
        width: source.getBoundingClientRect().width,
        height: source.getBoundingClientRect().height,
      })),
    };
  });
  // The first probe occupies the first 480 source pixels; map into that
  // source scene rather than into the second component below it.
  const pointerX = frameBox.x + frameBox.width * 0.5;
  const pointerY = frameBox.y + frameBox.height * (120 / 1191);
  const outerHit = await page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y);
    return element && { tag: element.tagName, className: (element as HTMLElement).className, id: (element as HTMLElement).id };
  }, { x: pointerX, y: pointerY });
  await page.mouse.move(pointerX - 40, pointerY - 40);
  await page.mouse.move(pointerX, pointerY, { steps: 5 });
  await page.waitForTimeout(120);
  const glowResult = await frame.evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    const doc = iframe.contentDocument;
    const source = doc?.querySelector<HTMLElement>("[data-production-host-profile] > :first-child") as HTMLElement | null;
    const canvas = source?.querySelector("canvas") as HTMLCanvasElement | null;
    return {
      source: source && { rect: source.getBoundingClientRect().toJSON(), pointerEvents: getComputedStyle(source).pointerEvents },
      canvas: canvas && { width: canvas.width, height: canvas.height, rect: canvas.getBoundingClientRect().toJSON(), opacity: getComputedStyle(canvas).opacity },
      records: (doc?.defaultView as (Window & { __runtimePointerRecords?: unknown[] }) | null)?.__runtimePointerRecords ?? [],
    };
  });
  const scale = await frame.evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    const rect = iframe.getBoundingClientRect();
    return { x: rect.width / iframe.offsetWidth, y: rect.width / iframe.offsetWidth };
  });
  const glowRecord = (glowResult.records as Array<{ source: string; type: string; clientX: number; clientY: number }>).filter((record) => record.source === events.sources[0].id && record.type === "pointermove").at(-1);
  expect(glowRecord).toBeDefined();
  expect(glowRecord?.clientX).toBeCloseTo((pointerX - frameBox.x) / scale.x, 3);
  expect(glowRecord?.clientY).toBeCloseTo((pointerY - frameBox.y) / scale.y, 3);
  expect(glowResult.source?.rect.width ?? 0).toBeGreaterThan(0);
  expect(glowResult.source?.rect.height ?? 0).toBeGreaterThan(0);
  expect(glowResult.canvas?.width ?? 0).toBeGreaterThan(0);

  // Move into the second source using its source-document coordinate. This
  // proves the same interaction layer handles another pointer component.
  const secondSourceY = 600;
  const secondPointerY = frameBox.y + secondSourceY * scale.y;
  await page.mouse.move(pointerX, secondPointerY, { steps: 5 });
  await page.waitForTimeout(120);
  const cursorResult = await frame.evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    const doc = iframe.contentDocument;
    const source = doc?.querySelectorAll<HTMLElement>("[data-production-host-profile] > :first-child")[1];
    const canvas = source?.querySelector("canvas") as HTMLCanvasElement | null;
    return {
      source: source?.getBoundingClientRect().toJSON(),
      canvas: canvas && { width: canvas.width, height: canvas.height },
      records: (doc?.defaultView as (Window & { __runtimePointerRecords?: unknown[] }) | null)?.__runtimePointerRecords ?? [],
    };
  });
  const cursorRecord = (cursorResult.records as Array<{ source: string; type: string; clientX: number; clientY: number }>).filter((record) => record.source === events.sources[1].id && record.type === "pointermove").at(-1);
  console.log(`[runtime-pointer-audit] ${JSON.stringify({ frameBox, pointer: { x: pointerX, y: pointerY }, outerHit, initial: events, glow: glowResult, cursor: cursorResult, scale })}`);
  expect(cursorRecord).toBeDefined();
  expect(cursorRecord?.clientX).toBeCloseTo((pointerX - frameBox.x) / scale.x, 3);
  expect(cursorRecord?.clientY).toBeCloseTo(secondSourceY, 3);
  expect(cursorResult.source?.width ?? 0).toBeGreaterThan(0);
  expect(cursorResult.source?.height ?? 0).toBeGreaterThan(0);
  expect(cursorResult.canvas?.width ?? 0).toBeGreaterThan(0);
});

test("runtime host audit records the production theme boundary without changing Puck data", async ({ page }) => {
  await page.goto("/editor-lab/puck-pilot");
  const before = await page.locator("[data-puck-production-editor]").evaluate((node) => ({
    theme: node.getAttribute("data-theme"),
    data: window.localStorage.getItem("onestudio:puck-pilot:draft:v1:local-pilot-fixture:en:pilot-home"),
  }));
  await page.getByRole("button", { name: /Use dark workspace theme/ }).click();
  await expect(page.locator("[data-puck-production-editor]")).toHaveAttribute("data-theme", "dark");
  const after = await page.locator("iframe").evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    const doc = iframe.contentDocument;
    const canvas = doc?.querySelector<HTMLElement>("[data-production-editor-canvas]");
    return {
      htmlClass: doc?.documentElement.className,
      bodyClass: doc?.body.className,
      canvasClass: canvas?.className,
      canvasBackground: canvas ? getComputedStyle(canvas).backgroundColor : null,
      bodyBackground: doc ? getComputedStyle(doc.body).backgroundColor : null,
    };
  });
  const dataAfter = await page.locator("[data-puck-production-editor]").evaluate(() =>
    window.localStorage.getItem("onestudio:puck-pilot:draft:v1:local-pilot-fixture:en:pilot-home"),
  );
  const library = await page.locator("aside[aria-label='Product component library']").evaluate((node) => ({ className: node.className, textColor: getComputedStyle(node).color }));
  console.log(`[runtime-theme-audit] ${JSON.stringify({ before, after, library })}`);
  expect(after.canvasClass).toContain("dark");
  expect(after.canvasBackground).toBe("rgb(0, 0, 0)");
  expect(after.bodyBackground).toBe("rgb(0, 0, 0)");
  expect(library.className).toMatch(/darkLibrary/);
  expect(dataAfter).toBe(before.data);
});

test("public pilot renderer applies the persisted document theme at its shared root", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "onestudio:puck-pilot:draft:v1:local-pilot-fixture:en:pilot-home",
      JSON.stringify({
        version: 1,
        registryVersion: "onestudio-puck-1",
        root: { props: { theme: "dark" } },
        content: [],
        metadata: { pageId: "pilot-home", locale: "en", seoOwner: "public_site" },
      }),
    );
  });
  await page.goto("/editor-lab/puck-pilot/public");
  const renderer = page.locator("[data-puck-public-pilot] main");
  await expect(renderer).toHaveAttribute("data-puck-preview-theme", "dark");
  await expect(renderer).toHaveClass(/dark/);
  await expect.poll(async () => renderer.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe("rgb(0, 0, 0)");
});

test("Text Scatter keeps source geometry and switches inherited theme in the main canvas", async ({ page }) => {
  await page.goto("/editor-lab/puck-production-registry/puck?ids=RB_control6_text_scatter");
  const frame = page.frameLocator("iframe");
  const text = frame.locator('[data-production-component="RB_control6_text_scatter"]');
  await expect(text.locator("h2, h1")).toBeVisible();
  const light = await text.evaluate((node) => {
    const source = node.querySelector<HTMLElement>("[data-production-host-profile]")!;
    const stage = node as HTMLElement;
    const heading = node.querySelector<HTMLElement>("h2, h1")!;
    const canvas = node.ownerDocument.querySelector<HTMLElement>("[data-production-editor-canvas]")!;
    return {
      sourceHeight: source.getBoundingClientRect().height,
      stageHeight: stage.getBoundingClientRect().height,
      headingHeight: heading.getBoundingClientRect().height,
      presentation: stage.dataset.productionPresentation,
      presentationTarget: stage.dataset.productionPresentationTarget,
      rootLayout: {
        display: getComputedStyle(source).display,
        alignItems: getComputedStyle(source).alignItems,
        justifyContent: getComputedStyle(source).justifyContent,
        minHeight: getComputedStyle(source).minHeight,
        metadata: source.dataset.productionPresentationRootLayout ?? null,
      },
      color: getComputedStyle(heading).color,
      canvasBackground: getComputedStyle(canvas).backgroundColor,
    };
  });
  await page.getByRole("button", { name: /Use dark workspace theme/ }).click();
  const dark = await text.evaluate((node) => {
    const source = node.querySelector<HTMLElement>("[data-production-host-profile]")!;
    const stage = node as HTMLElement;
    const heading = node.querySelector<HTMLElement>("h2, h1")!;
    const canvas = node.ownerDocument.querySelector<HTMLElement>("[data-production-editor-canvas]")!;
    return {
      sourceHeight: source.getBoundingClientRect().height,
      stageHeight: stage.getBoundingClientRect().height,
      headingHeight: heading.getBoundingClientRect().height,
      presentation: stage.dataset.productionPresentation,
      presentationTarget: stage.dataset.productionPresentationTarget,
      rootLayout: {
        display: getComputedStyle(source).display,
        alignItems: getComputedStyle(source).alignItems,
        justifyContent: getComputedStyle(source).justifyContent,
        minHeight: getComputedStyle(source).minHeight,
        metadata: source.dataset.productionPresentationRootLayout ?? null,
      },
      color: getComputedStyle(heading).color,
      canvasBackground: getComputedStyle(canvas).backgroundColor,
      htmlClass: node.ownerDocument.documentElement.className,
    };
  });
  console.log(`[runtime-text-theme-audit] ${JSON.stringify({ light, dark })}`);
  expect(light.sourceHeight).toBeGreaterThanOrEqual(light.headingHeight);
  expect(dark.sourceHeight).toBeGreaterThanOrEqual(dark.headingHeight);
  expect(light.stageHeight).toBeGreaterThanOrEqual(400);
  expect(dark.stageHeight).toBeGreaterThanOrEqual(400);
  expect(light.presentation).toBe("officialDemo");
  expect(dark.presentation).toBe("officialDemo");
  expect(light.presentationTarget).toBe("componentRoot");
  expect(dark.presentationTarget).toBe("componentRoot");
  expect(light.rootLayout).toEqual({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    metadata: "flex-center",
  });
  expect(dark.rootLayout).toEqual(light.rootLayout);
  expect(dark.sourceHeight).toBe(light.sourceHeight);
  expect(light.color).toBe("rgb(23, 23, 23)");
  expect(dark.color).toBe("rgb(248, 250, 252)");
  expect(light.canvasBackground).toBe("rgb(255, 255, 255)");
  expect(dark.canvasBackground).toBe("rgb(0, 0, 0)");
  expect(dark.htmlClass).toContain("dark");
});

test("Blur Highlight stays intrinsic without an implicit root centering layout", async ({ page }) => {
  await page.goto("/editor-lab/puck-production-registry/puck?ids=RB_control3_blur_highlight");
  const frame = page.frameLocator("iframe");
  const component = frame.locator('[data-production-component="RB_control3_blur_highlight"]');
  await expect(component).toBeVisible();
  const metrics = await component.evaluate((node) => {
    const component = node as HTMLElement;
    return {
      presentation: node.getAttribute("data-production-presentation"),
      componentHeight: component.getBoundingClientRect().height,
      componentDisplay: getComputedStyle(component).display,
      rootLayoutNodes: node.querySelectorAll("[data-production-presentation-root-layout]").length,
      hasLegacyStage: Boolean(node.closest("[data-production-editor-layout-stage]")),
    };
  });
  expect(metrics.presentation).toBe("source");
  expect(metrics.componentHeight).toBeLessThan(400);
  expect(metrics.componentDisplay).toBe("block");
  expect(metrics.rootLayoutNodes).toBe(0);
  expect(metrics.hasLegacyStage).toBe(false);
});

test("Credit Card stays intrinsic without an implicit root centering layout", async ({ page }) => {
  await page.goto("/editor-lab/puck-production-registry/puck?ids=RB_batch1_credit_card");
  const frame = page.frameLocator("iframe");
  const component = frame.locator('[data-production-component="RB_batch1_credit_card"]');
  await expect(component).toBeVisible();
  const metrics = await component.evaluate((node) => {
    const component = node as HTMLElement;
    return {
      presentation: node.getAttribute("data-production-presentation"),
      componentHeight: node.getBoundingClientRect().height,
      display: getComputedStyle(component).display,
      rootLayoutNodes: node.querySelectorAll("[data-production-presentation-root-layout]").length,
    };
  });
  expect(metrics.presentation).toBe("source");
  expect(metrics.display).toBe("block");
  expect(metrics.rootLayoutNodes).toBe(0);
});

test("browser-realm-sensitive sources share iframe-native interact mode", async ({ page }) => {
  await page.goto("/editor-lab/puck-production-registry/puck?ids=RB_free_splash_cursor,RB_free_magic_rings");
  const puck = page.frameLocator("iframe").first();
  await expect(puck.locator("[data-production-component]")).toHaveCount(2);
  await expect(puck.locator('iframe[data-puck-runtime-realm="iframeNative"]')).toHaveCount(0);
  const beforeIds = await puck.locator("[data-puck-component]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-puck-component")),
  );

  await page.getByRole("button", { name: "Interact with page", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit layout", exact: true })).toBeVisible();
  const runtimeFrames = puck.locator('iframe[data-puck-runtime-realm="iframeNative"]');
  await expect(runtimeFrames).toHaveCount(2, { timeout: 20_000 });
  await expect.poll(async () => runtimeFrames.evaluateAll((nodes) => nodes.every((node) => {
    const frame = node as HTMLIFrameElement;
    return Boolean(frame.contentDocument?.querySelector("canvas"));
  })), { timeout: 20_000 }).toBe(true);

  const realms = await runtimeFrames.evaluateAll((nodes) => nodes.map((node) => {
    const frame = node as HTMLIFrameElement;
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    const root = doc?.querySelector<HTMLElement>("[data-puck-runtime-root]");
    const canvas = doc?.querySelector<HTMLCanvasElement>("canvas");
    return {
      ownerWindow: root?.ownerDocument.defaultView === win,
      globalWindow: root?.dataset.puckRuntimeGlobalWindow,
      ownerDocument: canvas?.ownerDocument === doc,
      globalDocument: root?.dataset.puckRuntimeGlobalDocument,
      rafWindow: root?.dataset.puckRuntimeRafWindow,
      pointerEvents: root?.dataset.puckRuntimePointerEvents,
      parentCanvasCount: document.querySelectorAll("canvas").length,
      canvasInRuntime: Boolean(canvas),
    };
  }));
  await page.getByRole("button", { name: "Edit layout", exact: true }).click();
  await expect(puck.locator("[data-production-component]")).toHaveCount(2);
  const afterIds = await puck.locator("[data-puck-component]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-puck-component")),
  );
  expect(afterIds).toEqual(beforeIds);
  expect(realms).toHaveLength(2);
  for (const realm of realms) {
    expect(realm.ownerWindow).toBe(true);
    expect(realm.globalWindow).toBe("match");
    expect(realm.ownerDocument).toBe(true);
    expect(realm.globalDocument).toBe("match");
    expect(realm.rafWindow).toBe("match");
    expect(realm.pointerEvents).toBe("local");
    expect(realm.parentCanvasCount).toBe(0);
    expect(realm.canvasInRuntime).toBe(true);
  }
});

test("browser-heavy Library preview keeps its effect inside the preview iframe", async ({ page }) => {
  await page.goto("/editor-lab/puck-pilot");
  const search = page.locator('input[aria-label="Поиск блоков"]');
  await search.fill("Splash Cursor");
  const card = page.locator("article").filter({ hasText: "Splash Cursor" }).first();
  await card.hover();
  const preview = page.locator('[aria-label="Splash Cursor live preview"]');
  await expect(preview).toBeVisible();
  const runtime = preview.locator('iframe[data-puck-runtime-realm="iframeNative"]');
  await expect(runtime).toHaveCount(1, { timeout: 20_000 });
  await expect.poll(async () => runtime.evaluate((node) =>
    Boolean((node as HTMLIFrameElement).contentDocument?.querySelector("canvas")),
  ), { timeout: 20_000 }).toBe(true);

  const containment = await runtime.evaluate((node) => {
    const frame = node as HTMLIFrameElement;
    const doc = frame.contentDocument;
    const root = doc?.querySelector<HTMLElement>("[data-puck-runtime-root]");
    const canvas = doc?.querySelector<HTMLCanvasElement>("canvas");
    return {
      canvasOwnerDocument: canvas?.ownerDocument === doc,
      runtimeGlobalDocument: root?.dataset.puckRuntimeGlobalDocument,
      runtimePointerEvents: root?.dataset.puckRuntimePointerEvents,
      parentCanvasCount: document.querySelectorAll("canvas").length,
      bodyCanvasCount: document.body.querySelectorAll("canvas").length,
      insidePreview: frame.closest('[aria-label="Splash Cursor live preview"]') !== null,
      frameParent: frame.parentElement?.tagName,
    };
  });
  expect(containment.canvasOwnerDocument).toBe(true);
  expect(containment.runtimeGlobalDocument).toBe("match");
  expect(containment.runtimePointerEvents).toBe("local");
  expect(containment.parentCanvasCount).toBe(0);
  expect(containment.bodyCanvasCount).toBe(0);
  expect(containment.insidePreview).toBe(true);
  expect(containment.frameParent).toBe("DIV");
});
