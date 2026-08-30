"use client";

import type { ReactNode } from "react";
import { createPuckComponent, defineBlock } from "@/components/editor-lab/puck/block-contract";
import { createMarketingPuckComponent } from "./marketing-puck-component";

type Props = Record<string, unknown>;
type Block = ReturnType<typeof defineBlock>;

function CoreShort() {
  return <section data-core-fixture="short" style={{ padding: 24, background: "#eef2ff" }}><h2>Core Short</h2><p>A deterministic short fixture.</p></section>;
}

function CoreTall() {
  return <section data-core-fixture="tall" style={{ padding: 24, minHeight: 1100, background: "#ecfdf5" }}><h2>Core Tall</h2>{Array.from({ length: 18 }, (_, index) => <p key={index}>Core Tall row {index + 1}</p>)}</section>;
}

function CoreInteractive() {
  return <section data-core-fixture="interactive" style={{ padding: 24, background: "#fff7ed" }}><h2>Core Interactive</h2><button type="button" onClick={(event) => { const button = event.currentTarget; const count = Number(button.dataset.count ?? "0") + 1; button.dataset.count = String(count); button.textContent = `Local count: ${count}`; }}>Local count: 0</button></section>;
}

function CoreCanvasShell() {
  return <section data-core-fixture="canvas-shell" style={{ width: 640, height: 260, padding: 24, boxSizing: "border-box", background: "#111827", color: "white" }}><h2>Core Canvas Shell</h2><div style={{ width: 520, height: 120, border: "2px solid #60a5fa", display: "grid", placeItems: "center" }}>Canvas-like local surface</div></section>;
}

function CoreMarketing() {
  return <section data-core-fixture="marketing" style={{ padding: 32, background: "linear-gradient(120deg,#312e81,#0f766e)", color: "white" }}><p>MARKETING ADAPTER</p><h2>Core Marketing</h2><p>Lightweight marketing boundary fixture.</p></section>;
}

const make = (type: string, displayName: string, component: (props: Props) => ReactNode, catalogKey: string) => defineBlock({
  type, displayName, catalogKey, component, category: "Core QA Fixtures", description: `Dev-only ${displayName} fixture`, sourceKind: "component", tags: ["Core QA", displayName], readiness: "READY" as const, defaultProps: {}, fields: {},
});

export const coreQaBlocks = [
  make("CoreShort", "Core Short", CoreShort, "core-qa:short"),
  make("CoreTall", "Core Tall", CoreTall, "core-qa:tall"),
  make("CoreInteractive", "Core Interactive", CoreInteractive, "core-qa:interactive"),
  make("CoreCanvasShell", "Core Canvas Shell", CoreCanvasShell, "core-qa:canvas-shell"),
  defineBlock({ ...make("CoreMarketing", "Core Marketing", CoreMarketing, "core-qa:marketing"), sourceKind: "pro-block" }),
] as Block[];

export const coreQaBlockByCatalogKey = new Map(coreQaBlocks.map((block) => [block.catalogKey, block]));
export const coreQaComponents = Object.fromEntries(coreQaBlocks.map((block) => [
  block.type,
  block.sourceKind === "pro-block" ? createMarketingPuckComponent(block as never) : createPuckComponent(block as never, { showLabLabel: false }),
]));
export const coreQaCategories = { coreQa: { title: "Core QA Fixtures", defaultExpanded: true, components: coreQaBlocks.map((block) => block.type) } };
