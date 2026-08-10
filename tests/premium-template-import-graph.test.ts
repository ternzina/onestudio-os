import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import test from "node:test";
import ts from "typescript";

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

function hasRuntimeImportClause(clause: ts.ImportClause | undefined) {
  if (!clause) return true;
  if (clause.isTypeOnly) return false;
  if (clause.name) return true;
  if (!clause.namedBindings || ts.isNamespaceImport(clause.namedBindings)) return true;
  return clause.namedBindings.elements.some((element) => !element.isTypeOnly);
}

function hasRuntimeExportClause(node: ts.ExportDeclaration) {
  if (node.isTypeOnly) return false;
  if (!node.exportClause || ts.isNamespaceExport(node.exportClause)) return true;
  return node.exportClause.elements.some((element) => !element.isTypeOnly);
}

async function runtimeImports(file: string) {
  const source = await readFile(file, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports: string[] = [];
  const addLiteral = (node: ts.Expression | undefined) => {
    if (node && ts.isStringLiteralLike(node)) imports.push(node.text);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && hasRuntimeImportClause(node.importClause)) addLiteral(node.moduleSpecifier);
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && hasRuntimeExportClause(node)) addLiteral(node.moduleSpecifier);
    if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly && ts.isExternalModuleReference(node.moduleReference)) addLiteral(node.moduleReference.expression);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1) addLiteral(node.arguments[0]);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return imports;
}

async function collectRuntimeGraph(entry: string) {
  const pending = [resolve(root, entry)];
  const visited = new Set<string>();
  const externals = new Set<string>();
  while (pending.length) {
    const file = pending.pop()!;
    if (visited.has(file)) continue;
    visited.add(file);
    for (const specifier of await runtimeImports(file)) {
      const dependency = await resolveLocalImport(file, specifier);
      if (dependency && !visited.has(dependency)) pending.push(dependency);
      if (!dependency && !specifier.startsWith(".") && !specifier.startsWith("@/")) externals.add(specifier);
    }
  }
  return {
    files: [...visited].map((file) => file.slice(root.length + 1)),
    externals: [...externals],
  };
}

function assertDoesNotReach(graph: Awaited<ReturnType<typeof collectRuntimeGraph>>, forbidden: RegExp) {
  const reachable = [...graph.files, ...graph.externals];
  assert.equal(reachable.some((value) => forbidden.test(value)), false, reachable.join("\n"));
}

test("TypeScript AST detects multiline, mixed and dynamic runtime imports", async () => {
  const imports = await runtimeImports(resolve(root, "tests/fixtures/import-graph/entry.ts"));
  assert.deepEqual(imports.sort(), ["./dynamic.ts", "./multiline.ts", "./mixed.ts", "./reexport.ts"].sort());
  const graph = await collectRuntimeGraph("tests/fixtures/import-graph/entry.ts");
  assert.ok(graph.files.includes("tests/fixtures/import-graph/multiline.ts"));
  assert.ok(graph.files.includes("tests/fixtures/import-graph/dynamic.ts"));
  assert.equal(graph.files.includes("tests/fixtures/import-graph/type-only.ts"), false);
});

test("manifest and package catalog graphs remain data-only", async () => {
  for (const entry of ["lib/public-site/premium-template-package-catalog.ts", "lib/public-site/template-catalog.ts"]) {
    const graph = await collectRuntimeGraph(entry);
    assertDoesNotReach(graph, /template-seeds|seed-registry|premium-kids-content|(?:^|\/)templates\.ts$|premium-studio-content|editor-|components\/admin|components\/public|runtime-(?:adapter|registry)|^react(?:\/|$)|^next\/dynamic$/);
  }
});

test("template catalog and demos client graphs cannot reach implementation capabilities", async () => {
  const catalog = await collectRuntimeGraph("lib/public-site/template-catalog.ts");
  assertDoesNotReach(catalog, /template-seeds|seed-registry|premium-kids-content|(?:^|\/)templates\.ts$|premium-studio-content|editor-|components\/admin|components\/public|runtime-/);

  const demos = await collectRuntimeGraph("app/demos/page.tsx");
  assertDoesNotReach(demos, /template-seeds|seed-registry|premium-kids-content|(?:^|\/)templates\.ts$|premium-studio-content|editor-(?:adapter|schema|registry)|components\/admin|runtime-registry/);
});

test("public and editor capability graphs stay mutually isolated", async () => {
  const publicGraphs = await Promise.all([
    collectRuntimeGraph("lib/public-site/premium-template-runtime-registry.ts"),
    collectRuntimeGraph("lib/public-site/premium-template-custom-page-runtime-registry.ts"),
  ]);
  for (const graph of publicGraphs) assertDoesNotReach(graph, /editor-(?:adapter|schema)|components\/admin/);
  assert.ok(publicGraphs[0].files.includes("components/public/GlossBusinessSite.tsx"));
  assert.ok(publicGraphs[1].files.includes("components/public/NoirCustomPage.tsx"));

  const editor = await collectRuntimeGraph("lib/public-site/premium-template-editor-registry.ts");
  assertDoesNotReach(editor, /components\/public|PremiumStudioExperience|premium-template-runtime-adapter|custom-page-runtime/);
});

test("canonical source and generator never enter client runtime graphs", async () => {
  for (const entry of ["lib/public-site/template-catalog.ts", "app/demos/page.tsx"]) {
    const graph = await collectRuntimeGraph(entry);
    assertDoesNotReach(graph, /premium-template-package-source|premium-template-package-generator|generate-premium-template-packages/);
  }
});
