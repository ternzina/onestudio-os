import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);
const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", "/index.ts", "/index.tsx"];

async function resolveLocalImport(from: string, specifier: string) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return null;
  const base = specifier.startsWith("@/") ? resolve(root, specifier.slice(2)) : resolve(dirname(from), specifier);
  if (extname(base)) return stat(base).then((value) => value.isFile() ? base : null).catch(() => null);
  for (const suffix of extensions) {
    const candidate = `${base}${suffix}`;
    if (await stat(candidate).then((value) => value.isFile()).catch(() => false)) return candidate;
  }
  throw new Error(`Cannot resolve local import ${specifier} from ${from}`);
}

async function runtimeImports(file: string) {
  const source = await readFile(file, "utf8");
  const imports: string[] = [];
  for (const line of source.split("\n")) {
    if (/^\s*(?:import|export)\s+type\b/.test(line)) continue;
    const match = line.match(/(?:import|export)[\s\S]*?\sfrom\s+["']([^"']+)["']/);
    if (match) imports.push(match[1]);
  }
  for (const match of source.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) imports.push(match[1]);
  return imports;
}

async function collectRuntimeGraph(entry: string) {
  const pending = [resolve(root, entry)];
  const visited = new Set<string>();
  while (pending.length) {
    const file = pending.pop()!;
    if (visited.has(file)) continue;
    visited.add(file);
    for (const specifier of await runtimeImports(file)) {
      const dependency = await resolveLocalImport(file, specifier);
      if (dependency && !visited.has(dependency)) pending.push(dependency);
    }
  }
  return [...visited].map((file) => file.slice(root.length + 1));
}

test("transitive premium package import graphs preserve capability boundaries", async () => {
  const manifest = await collectRuntimeGraph("lib/public-site/premium-template-package-catalog.ts");
  const publicHome = await collectRuntimeGraph("lib/public-site/premium-template-runtime-registry.ts");
  const publicPage = await collectRuntimeGraph("lib/public-site/premium-template-custom-page-runtime-registry.ts");
  const editor = await collectRuntimeGraph("lib/public-site/premium-template-editor-registry.ts");

  assert.deepEqual(manifest.sort(), [
    "lib/public-site/premium-template-package-catalog.ts",
    "lib/public-site/premium-template-package.ts",
  ]);
  for (const graph of [publicHome, publicPage]) {
    assert.equal(graph.some((file) => /editor-schema|editor-adapter|components\/admin/.test(file)), false, graph.join("\n"));
  }
  assert.equal(editor.some((file) => /components\/public|PremiumStudioExperience|premium-template-runtime-adapter|custom-page-runtime/.test(file)), false, editor.join("\n"));
  assert.ok(publicHome.some((file) => file === "components/public/GlossBusinessSite.tsx"));
  assert.ok(publicPage.some((file) => file === "components/public/NoirCustomPage.tsx"));
});

test("type-only imports do not become runtime graph edges", async () => {
  const graph = await collectRuntimeGraph("lib/public-site/premium-template-package-catalog.ts");
  assert.equal(graph.some((file) => file.endsWith("types.ts")), false);
});
