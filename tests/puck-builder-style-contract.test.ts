import assert from "node:assert/strict";
import test from "node:test";
import type { ComponentConfig, ComponentData } from "@puckeditor/core";
import { createElement } from "react";
import {
  applyStylePreset,
  copyCompatibleStyle,
  type StyleTransferContract,
} from "../components/editor-lab/puck/builder-ux-contract.ts";

const component: ComponentConfig = {
  render: () => createElement("div"),
  defaultProps: {
    opacity: 0.35,
    followSpeed: 0.04,
  },
};

const contract: StyleTransferContract = new Map([
  ["cursor", new Set(["opacity", "followSpeed"])],
]);

test("Original removes visual overrides so native cursor defaults render", () => {
  const current = {
    type: "cursor",
    props: {
      id: "cursor-1",
      content: "Keep this content",
      opacity: 0.35,
      followSpeed: 0.04,
    },
  } as ComponentData;

  const original = applyStylePreset(current, component, contract, "Original");

  assert.deepEqual(original.props, {
    id: "cursor-1",
    content: "Keep this content",
  });
});

test("copying a style never turns component defaults into overrides", () => {
  const native = {
    type: "cursor",
    props: { id: "cursor-2" },
  } as ComponentData;
  const customized = {
    type: "cursor",
    props: { id: "cursor-3", opacity: 0.72 },
  } as ComponentData;

  assert.deepEqual(copyCompatibleStyle(native, component, contract).values, {});
  assert.deepEqual(copyCompatibleStyle(customized, component, contract).values, {
    opacity: 0.72,
  });
});
