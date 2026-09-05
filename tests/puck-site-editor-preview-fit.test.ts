import assert from "node:assert/strict";
import test from "node:test";
import { calculateProductionPreviewFit } from "../lib/puck-site-editor/preview-fit.ts";

test("production preview fit contains the canonical authored scene", () => {
  const fit = calculateProductionPreviewFit({
    availableWidth: 598,
    availableHeight: 390,
    sceneWidth: 1280,
    sceneHeight: 640,
  });
  assert.deepEqual(fit, {
    width: 1280,
    height: 640,
    scale: 598 / 1280,
    left: 0,
    top: (390 - (640 * (598 / 1280))) / 2,
  });
});

test("preview fitting preserves scene dimensions while fitting short and tall sources", () => {
  const shortFit = calculateProductionPreviewFit({
    availableWidth: 598,
    availableHeight: 390,
    sceneWidth: 598,
    sceneHeight: 24,
  });
  assert.equal(shortFit.scale, 1);
  assert.equal(shortFit.width, 598);
  assert.equal(shortFit.left, 0);
  assert.equal(shortFit.top, (390 - 24) / 2);

  const tallFit = calculateProductionPreviewFit({
    availableWidth: 598,
    availableHeight: 390,
    sceneWidth: 598,
    sceneHeight: 640,
  });
  assert.equal(tallFit.scale, 390 / 640);
  assert.equal(tallFit.height * tallFit.scale, 390);
});

test("preview fit preserves proportions across wide, viewport and small scenes", () => {
  const cases = [
    {
      name: "wide",
      sceneWidth: 1280,
      sceneHeight: 320,
      scale: 598 / 1280,
    },
    {
      name: "full-viewport",
      sceneWidth: 1440,
      sceneHeight: 900,
      scale: Math.min(598 / 1440, 390 / 900),
    },
    {
      name: "small-control",
      sceneWidth: 320,
      sceneHeight: 180,
      scale: 598 / 320,
    },
  ];

  for (const scene of cases) {
    const fit = calculateProductionPreviewFit({
      availableWidth: 598,
      availableHeight: 390,
      sceneWidth: scene.sceneWidth,
      sceneHeight: scene.sceneHeight,
    });
    assert.equal(fit.scale, scene.scale, scene.name);
    assert.equal(fit.width, scene.sceneWidth, scene.name);
    assert.equal(fit.height, scene.sceneHeight, scene.name);
    assert.equal(fit.left, Math.max(0, (598 - fit.width * fit.scale) / 2), scene.name);
    assert.equal(fit.top, Math.max(0, (390 - fit.height * fit.scale) / 2), scene.name);
  }
});
