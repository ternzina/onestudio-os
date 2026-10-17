import { createRequire } from "node:module";
import type { ExportAsset, ExportWarning, HeroSources } from "./types.ts";

const require = createRequire(import.meta.url);
const RASTER = /\.(png|jpe?g)$/i;
const CANDIDATE_WIDTHS = [640, 960, 1280, 1600];
const WEBP_QUALITY = 90;

type SharpPipeline = {
  metadata(): Promise<{ width?: number; height?: number }>;
  resize(options: { width: number; withoutEnlargement: true }): SharpPipeline;
  webp(options: { quality: number; effort: number; smartSubsample: true }): { toBuffer(): Promise<Buffer> };
};

type SharpFactory = (input: Buffer, options?: { failOn: "none" }) => SharpPipeline;

function warning(code: string, message: string): ExportWarning {
  return { code, message, blocksStatic: false };
}

function loadSharp(): SharpFactory | null {
  try {
    return require("sharp") as SharpFactory;
  } catch {
    return null;
  }
}

function targetWidths(sourceWidth: number): number[] {
  const widths = CANDIDATE_WIDTHS.filter((width) => width < sourceWidth);
  widths.push(sourceWidth);
  return widths;
}

export async function attachResponsiveHero(
  assets: ExportAsset[],
  heroArchive: string,
  warnings: ExportWarning[],
): Promise<HeroSources | null> {
  if (!heroArchive || !RASTER.test(heroArchive)) return null;
  const asset = assets.find((item) => item.archivePath === heroArchive);
  if (!asset) return null;
  const sharp = loadSharp();
  if (!sharp) {
    warnings.push(warning("hero_image_unoptimized", "Sharp недоступен, поэтому герой оставлен исходным файлом без адаптивных версий."));
    return null;
  }
  try {
    const source = sharp(asset.bytes, { failOn: "none" });
    const meta = await source.metadata();
    const sourceWidth = meta.width ?? 0;
    const sourceHeight = meta.height ?? 0;
    if (sourceWidth < 2 || sourceHeight < 2) return null;
    const included: Array<{ archivePath: string; width: number }> = [];
    let truncated = false;
    for (const width of targetWidths(sourceWidth)) {
      if (assets.length >= 40) {
        truncated = true;
        break;
      }
      const pipeline = sharp(asset.bytes, { failOn: "none" });
      const encoded = await (width === sourceWidth ? pipeline : pipeline.resize({ width, withoutEnlargement: true }))
        .webp({ quality: WEBP_QUALITY, effort: 6, smartSubsample: true })
        .toBuffer();
      const archivePath = heroArchive.replace(/\.(png|jpe?g)$/i, `-${width}.webp`);
      assets.push({ archivePath, bytes: encoded });
      included.push({ archivePath, width });
    }
    if (truncated) {
      warnings.push(warning("hero_srcset_truncated", "Часть адаптивных версий героя не вошла в архив: лимит 40 медиафайлов."));
    }
    if (!included.length) return null;
    return {
      width: sourceWidth,
      height: sourceHeight,
      type: "image/webp",
      sizes: "100vw",
      srcset: included.map((item) => `/${item.archivePath} ${item.width}w`).join(", "),
    };
  } catch {
    warnings.push(warning("hero_image_unoptimized", "Не удалось собрать адаптивные версии героя. В экспорт вошёл исходный файл."));
    return null;
  }
}
