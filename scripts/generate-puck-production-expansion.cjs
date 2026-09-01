/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const nodeResolve = Module._resolveFilename;

Module._resolveFilename = function resolveFromWorkspace(request, parent, isMain, options) {
  const nextRequest = request.startsWith("@/")
    ? path.join(root, request.slice(2))
    : request;
  return nodeResolve.call(this, nextRequest, parent, isMain, options);
};

for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    module._compile(output.outputText, filename);
  };
}
for (const extension of [".css", ".scss"]) {
  require.extensions[extension] = (module) => {
    module.exports = {};
  };
}

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://production-registry-generation.invalid";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "production-registry-generation";

const registryFiles = [
  "components/editor-lab/puck-v3/poc-registry.tsx",
  "components/editor-lab/reactbits-control-3/puck-control-registry.tsx",
  "components/editor-lab/reactbits-control-6/puck-control-registry.tsx",
  ...Array.from(
    { length: 12 },
    (_, index) => `components/editor-lab/reactbits-fast-batch-${index + 1}/puck-fast-batch-registry.tsx`,
  ),
  "components/editor-lab/reactbits-free-showcase/puck-free-showcase-registry.tsx",
];

const pilotIds = new Map([
  ["pro-block:navigation-12", "reactbits.navigation-12"],
  ["pro-block:hero-14", "reactbits.hero-14"],
  ["pro-block:cta-9", "reactbits.cta-9"],
  ["pro-block:pricing-3", "reactbits.pricing-3"],
  ["pro-block:social-proof-10", "reactbits.social-proof-10"],
  ["pro-block:scheduling-3", "reactbits.scheduling-3"],
  ["pro-block:contact-6", "reactbits.contact-6"],
  ["current-free:glow-cursor", "reactbits.glow-cursor"],
]);

const pilotSources = new Map([
  ["pro-block:navigation-12", "@/components/puck-site-editor/adapted/navigation-12"],
  ["pro-block:hero-14", "@/components/puck-site-editor/adapted/hero-14"],
  ["pro-block:cta-9", "@/components/puck-site-editor/adapted/cta-9"],
  ["pro-block:pricing-3", "@/components/puck-site-editor/adapted/pricing-3"],
  ["pro-block:contact-6", "@/components/puck-site-editor/adapted/contact-6"],
]);

const inlineSourceOverrides = new Map([
  ["RB_control3_blur_highlight", {
    componentName: "ProductionBlurHighlight",
    importPath: "@/components/puck-site-editor/adapted-library/blur-highlight",
    catalogKey: "control-3:blur-highlight",
  }],
  ["RB_batch10_hero_7", {
    componentName: "Hero7",
    importPath: "@/components/blocks/hero-7",
    catalogKey: "pro-block:hero-7",
  }],
]);

function importedSources() {
  const sources = new Map();
  const blocked = [];

  for (const relativeFile of registryFiles) {
    const filename = path.join(root, relativeFile);
    const sourceFile = ts.createSourceFile(
      relativeFile,
      fs.readFileSync(filename, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const imports = new Map();
    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const importPath = statement.moduleSpecifier.text;
      const clause = statement.importClause;
      if (!clause) continue;
      if (clause.name) imports.set(clause.name.text, importPath);
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) imports.set(element.name.text, importPath);
      }
    }

    const property = (object, name) => object.properties.find((candidate) =>
      ts.isPropertyAssignment(candidate)
      && candidate.name.getText(sourceFile).replace(/["']/g, "") === name,
    )?.initializer;
    const string = (node) => {
      if (!node) return null;
      if (ts.isStringLiteralLike(node)) return node.text;
      if (!ts.isIdentifier(node)) return null;
      for (const statement of sourceFile.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name) && declaration.name.text === node.text) {
            let initializer = declaration.initializer;
            while (initializer && ts.isAsExpression(initializer)) initializer = initializer.expression;
            return string(initializer);
          }
        }
      }
      return null;
    };

    const addObject = (object) => {
      const type = string(property(object, "type"));
      const catalogKey = string(property(object, "catalogKey"));
      if (!type || !catalogKey) return;
      let component = property(object, "component");
      while (component && ts.isAsExpression(component)) component = component.expression;
      const componentName = component && ts.isIdentifier(component) ? component.text : null;
      const batchStatus = string(property(object, "batchStatus")) || "DIRECT_RENDER_PASS";
      const blocker = string(property(object, "blocker"));
      if (componentName) {
        sources.set(type, {
          componentName,
          importPath: imports.get(componentName),
          catalogKey,
        });
      }
      if (!componentName || batchStatus.startsWith("BLOCKED")) {
        blocked.push({
          id: type,
          catalogKey,
          status: batchStatus.startsWith("BLOCKED") ? batchStatus : "DEV_ONLY",
          reason: blocker || batchStatus,
        });
      }
    };

    const visit = (node) => {
      if (
        ts.isCallExpression(node)
        && ts.isIdentifier(node.expression)
        && ["block", "control", "poc"].includes(node.expression.text)
      ) {
        const first = node.arguments[0];
        if (first && ts.isObjectLiteralExpression(first)) addObject(first);
        else if (node.expression.text === "block" && node.arguments.length >= 4) {
          const [typeNode, , catalogNode, componentNode] = node.arguments;
          let component = componentNode;
          while (component && ts.isAsExpression(component)) component = component.expression;
          const componentName = component && ts.isIdentifier(component) ? component.text : null;
          const type = string(typeNode);
          const catalogKey = string(catalogNode);
          if (type && catalogKey && componentName) {
            sources.set(type, {
              componentName,
              importPath: imports.get(componentName),
              catalogKey,
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  blocked.push({
    id: "reactbits.hero-24",
    catalogKey: "pro-block:hero-24",
    status: "DEV_ONLY",
    reason: "NOT_INSTALLED_IN_CURRENT_LAB_INVENTORY",
  });
  return { sources, blocked };
}

const isHexColor = (value) => /^#[0-9a-f]{3,8}$/i.test(value);
const isSafeUrl = (value) => value.startsWith("/") || /^https:\/\//i.test(value);

function ruleFromSamples(samples, field, name, editable = true) {
  const values = samples.filter((value) => value !== undefined);
  const value = values[0];
  const base = editable ? {} : { editable: false };
  if (typeof value === "string") {
    const options = Array.isArray(field?.options)
      ? field.options.map((option) => option.value).filter((option) => typeof option === "string")
      : [];
    if (options.length) return { kind: "enum", values: [...new Set(options)], ...base };
    if (/color/i.test(name) && isHexColor(value)) {
      return { kind: "string", maxLength: 32, format: "color", ...base };
    }
    if (/(?:url|src|href|image|media)/i.test(name) && isSafeUrl(value)) {
      return { kind: "string", maxLength: 2_048, format: "url", ...base };
    }
    return { kind: "string", maxLength: Math.max(2_000, value.length * 2), ...base };
  }
  if (typeof value === "boolean") return { kind: "boolean", ...base };
  if (typeof value === "number") {
    const numbers = values.filter((item) => typeof item === "number" && Number.isFinite(item));
    return {
      kind: "number",
      min: Number.isFinite(field?.min) ? field.min : Math.min(-1_000_000, ...numbers),
      max: Number.isFinite(field?.max) ? field.max : Math.max(1_000_000, ...numbers),
      ...base,
    };
  }
  if (Array.isArray(value)) {
    const arrays = values.filter(Array.isArray);
    const items = arrays.flat();
    const allObjects = items.length > 0 && items.every((item) => item && typeof item === "object" && !Array.isArray(item));
    const itemRule = ruleFromSamples(items.length ? items : [""], field?.arrayFields ? { objectFields: field.arrayFields } : undefined, `${name}Item`, false);
    return {
      kind: "array",
      maxItems: Math.max(32, ...arrays.map((array) => array.length * 2)),
      item: itemRule,
      editable: Boolean(editable && allObjects),
    };
  }
  if (value && typeof value === "object") {
    const objects = values.filter((item) => item && typeof item === "object" && !Array.isArray(item));
    const objectFields = field?.objectFields || {};
    return {
      kind: "object",
      properties: Object.fromEntries(
        [...new Set(objects.flatMap((item) => Object.keys(item)))].map((key) => {
          const rule = ruleFromSamples(objects.map((item) => item[key]), objectFields[key], key, true);
          if (objects.some((item) => item[key] === undefined)) rule.required = false;
          return [key, rule];
        }),
      ),
      ...base,
    };
  }
  throw new Error(`Unsupported production prop default for ${name}`);
}

function ruleFromValue(value, field, name, editable = true) {
  return ruleFromSamples([value], field, name, editable);
}

function stripEditorDefaults(defaults) {
  return Object.fromEntries(Object.entries(defaults || {}).filter(([name, value]) =>
    value !== undefined
    && !name.startsWith("__")
    && !["id", "layout", "labLabel", "editMode", "puck"].includes(name),
  ));
}

function officialSourceFor(block, rendererSource) {
  if (block.catalogKey === "control-3:blur-highlight") {
    return "@/components/react-bits/blur-highlight";
  }
  if (!rendererSource.includes("/editor-lab/adapted")) return rendererSource;
  const slug = block.productLibrary.officialSlug;
  return block.sourceKind === "pro-block"
    ? `@/components/blocks/${slug}`
    : `@/components/react-bits/${slug}`;
}

function productionSourceFor(block, source) {
  const pilotSource = pilotSources.get(block.catalogKey);
  if (pilotSource) return pilotSource;
  if (!source.importPath.includes("/editor-lab/adapted")) return source.importPath;
  const relative = source.importPath.split("/editor-lab/adapted/")[1];
  return `@/components/puck-site-editor/adapted-library/${relative}`;
}

function copyProductionAdapters(entries) {
  const adapterImports = new Set(
    entries
      .map((entry) => entry.rendererSource)
      .filter((source) => source.includes("/adapted-library/")),
  );
  for (const importPath of adapterImports) {
    const relative = importPath.split("/adapted-library/")[1];
    const source = path.join(root, "components/editor-lab/adapted", `${relative}.tsx`);
    const target = path.join(root, "components/puck-site-editor/adapted-library", `${relative}.tsx`);
    if (!fs.existsSync(source)) {
      if (!fs.existsSync(target)) throw new Error(`Missing production adapter: ${target}`);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const contents = fs.readFileSync(source, "utf8")
      .replaceAll(
        "@/components/editor-lab/puck/menu-links-array-contract",
        "@/lib/puck-site-editor/menu-links",
      )
      .replaceAll(
        "@/components/editor-lab/puck/icon-token-contract",
        "@/lib/puck-site-editor/icon-token",
      );
    fs.writeFileSync(target, contents);
  }
}

function writeGeneratedData(entries, blocked) {
  const dataFile = path.join(root, "lib/puck-site-editor/generated-registry-data.ts");
  const data = `// Generated by scripts/generate-puck-production-expansion.cjs.\n`
    + `// Production runtime data only.\n\n`
    + `export const PUCK_EXPANDED_REGISTRY_DATA = ${JSON.stringify(entries, null, 2)} as const;\n\n`
    + `export const PUCK_BLOCKED_REGISTRY_BACKLOG = ${JSON.stringify(blocked, null, 2)} as const;\n`;
  fs.writeFileSync(dataFile, data);
}

function writeComponentSources(entries) {
  const mappings = entries.map((entry) => {
    return `  ${JSON.stringify(entry.catalogKey)}: lazyComponent(() => import(${JSON.stringify(entry.rendererSource)}), ${JSON.stringify([
      entry.componentName,
      entry.componentName.replace(/^Adapted/, ""),
    ])}),`;
  }).join("\n");
  const output = `"use client";\n\n`
    + `import { lazy, type ComponentType } from "react";\n\n`
    + `type ProductionSourceComponent = ComponentType<Record<string, unknown>>;\n\n`
    + `function pickComponent(module: Readonly<Record<string, unknown>>, preferred: readonly string[]): ProductionSourceComponent {\n`
    + `  const values = [module.default, ...preferred.map((name) => module[name]), ...Object.values(module)];\n`
    + `  const component = values.find((value) => typeof value === "function" || (value !== null && typeof value === "object" && "$$typeof" in value));\n`
    + `  if (!component) throw new Error(\`Missing production component export: \${preferred.join(", ")}\`);\n`
    + `  return component as ProductionSourceComponent;\n}\n\n`
    + `function lazyComponent(loader: () => Promise<Readonly<Record<string, unknown>>>, preferred: readonly string[]) {\n`
    + `  return lazy(async () => ({ default: pickComponent(await loader(), preferred) }));\n}\n\n`
    + `export const PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY: Readonly<Record<string, ProductionSourceComponent>> = {\n${mappings}\n};\n`;
  fs.writeFileSync(path.join(root, "components/puck-site-editor/production-component-sources.tsx"), output);
}

const { sources, blocked } = importedSources();
for (const [type, source] of inlineSourceOverrides) sources.set(type, source);
const { pocBlocks, pocComponents } = require(path.join(root, "components/editor-lab/puck-v3/poc-registry.tsx"));
const rawEntries = pocBlocks.map((block) => {
  const source = sources.get(block.type);
  if (!source?.importPath) throw new Error(`No physical source mapping for ${block.type}`);
  const rendererSource = productionSourceFor(block, source);
  const config = pocComponents[block.type];
  const defaults = stripEditorDefaults(config.defaultProps);
  const props = Object.fromEntries(Object.entries(defaults).map(([name, value]) => [
    name,
    ruleFromValue(value, config.fields?.[name], name, Boolean(config.fields?.[name])),
  ]));
  return {
    id: pilotIds.get(block.catalogKey) || block.type,
    catalogKey: block.catalogKey,
    label: block.productLibrary.displayName,
    taxonomy: block.productLibrary.category,
    sourceTier: block.productLibrary.sourceTier,
    officialSlug: block.productLibrary.officialSlug,
    sourceKind: block.sourceKind,
    physicalSource: officialSourceFor(block, source.importPath),
    rendererSource,
    componentName: source.componentName,
    host: block.host || null,
    definiteHeight: block.definiteHeight || null,
    runtimeFamily: block.runtimeFamily || null,
    legacyIds: [],
    props,
    defaults,
  };
});

const entryPriority = (entry) =>
  pilotIds.has(entry.catalogKey) ? 3
    : /^(?:starter|current-free):/.test(entry.catalogKey) ? 2
      : 1;
const entries = [...new Map(rawEntries.map((entry) => [entry.physicalSource, entry])).keys()].map((physicalSource) => {
  const matches = rawEntries.filter((entry) => entry.physicalSource === physicalSource);
  const canonical = [...matches].sort((left, right) => entryPriority(right) - entryPriority(left))[0];
  return {
    ...canonical,
    legacyIds: matches.filter((entry) => entry.id !== canonical.id).map((entry) => entry.id),
  };
});

entries.push({
  id: "RB_batch10_hero_7",
  catalogKey: "pro-block:hero-7",
  label: "Hero 7",
  taxonomy: "Hero",
  sourceTier: "PRO",
  officialSlug: "hero-7",
  sourceKind: "pro-block",
  physicalSource: "@/components/blocks/hero-7",
  rendererSource: "@/components/blocks/hero-7",
  componentName: "Hero7",
  host: { profile: "section", width: "full", height: "intrinsic", runtimeRisk: "none" },
  definiteHeight: null,
  runtimeFamily: null,
  legacyIds: [],
  props: {},
  defaults: {},
});

if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
  throw new Error("Generated production registry has duplicate ids");
}
if (new Set(entries.map((entry) => entry.catalogKey)).size !== entries.length) {
  throw new Error("Generated production registry has duplicate physical catalogue keys");
}

copyProductionAdapters(entries);
writeGeneratedData(entries, blocked.filter((entry, index, values) =>
  values.findIndex((candidate) => candidate.id === entry.id) === index
  && !entries.some((candidate) => candidate.id === entry.id),
));
writeComponentSources(entries);
console.log(`Generated ${entries.length} production entries and ${blocked.length} blocker records.`);
