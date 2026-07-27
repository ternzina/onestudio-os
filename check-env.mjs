import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "dist",
  "build",
  "coverage",
]);

const CODE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

function readEnvNames(filePath) {
  if (!fs.existsSync(filePath)) {
    return { names: new Set(), empty: new Set(), missingFile: true };
  }

  const names = new Set();
  const empty = new Set();

  const text = fs.readFileSync(filePath, "utf8");

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (!match) continue;

    const [, name, rawValue] = match;
    names.add(name);

    const value = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
    if (!value) empty.add(name);
  }

  return { names, empty, missingFile: false };
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (CODE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function findUsedEnvNames(files) {
  const used = new Map();

  const dotPattern = /process\.env\.([A-Z][A-Z0-9_]*)/g;
  const bracketPattern = /process\.env\[\s*["']([A-Z][A-Z0-9_]*)["']\s*\]/g;
  const helperPattern = /\b(?:envText|text)\(\s*["']([A-Z][A-Z0-9_]*)["']\s*\)/g;

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const relative = path.relative(ROOT, file);

    for (const pattern of [dotPattern, bracketPattern, helperPattern]) {
      pattern.lastIndex = 0;

      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];

        if (!used.has(name)) used.set(name, new Set());
        used.get(name).add(relative);
      }
    }
  }

  return used;
}

const env = readEnvNames(ENV_FILE);
const files = walk(ROOT);
const used = findUsedEnvNames(files);

const usedNames = [...used.keys()].sort();
const missing = usedNames.filter((name) => !env.names.has(name));
const empty = usedNames.filter((name) => env.empty.has(name));
const present = usedNames.filter(
  (name) => env.names.has(name) && !env.empty.has(name),
);

console.log("\nПроверка .env.local");
console.log("===================\n");

if (env.missingFile) {
  console.log("❌ Файл .env.local не найден в корне проекта.");
  process.exitCode = 1;
} else {
  console.log(`Найдено переменных в коде: ${usedNames.length}`);
  console.log(`Заполнено в .env.local: ${present.length}`);
}

if (missing.length) {
  console.log("\n❌ Отсутствуют:");
  for (const name of missing) {
    console.log(`- ${name}`);
    for (const file of [...used.get(name)].slice(0, 3)) {
      console.log(`  используется: ${file}`);
    }
  }
}

if (empty.length) {
  console.log("\n⚠️ Есть, но без значения:");
  for (const name of empty) {
    console.log(`- ${name}`);
  }
}

if (!missing.length && !empty.length && !env.missingFile) {
  console.log("\n✅ Все переменные, найденные в коде, присутствуют и не пустые.");
  console.log("Сами значения не выводились.");
} else {
  process.exitCode = 1;
}

console.log(
  "\nВажно: этот тест проверяет наличие переменных, но не подтверждает, что сами ключи действующие.\n",
);
