import { promises as fs } from "node:fs";
import path from "node:path";
import type { ScreenshotFormat } from "../config/types.js";
import { OutputError } from "../errors/browzenta-error.js";

const FORMAT_EXTENSIONS: Record<string, ScreenshotFormat> = {
  ".png": "png",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".webp": "webp",
};

export function inferFormatFromPath(filePath: string): ScreenshotFormat | null {
  const ext = path.extname(filePath).toLowerCase();
  return FORMAT_EXTENSIONS[ext] ?? null;
}

export function resolveExtensionForFormat(format: ScreenshotFormat): string {
  switch (format) {
    case "jpeg":
      return ".jpeg";
    case "webp":
      return ".webp";
    case "png":
    default:
      return ".png";
  }
}

export interface ResolvedOutputPath {
  absolutePath: string;
  relativePath: string;
  format: ScreenshotFormat;
}

export function resolveSingleOutputPath(
  rawPath: string,
  explicitFormat?: ScreenshotFormat
): ResolvedOutputPath {
  const normalized = path.normalize(rawPath);
  const inferred = inferFormatFromPath(normalized);
  const format = explicitFormat ?? inferred ?? "png";

  const absolutePath = path.isAbsolute(normalized)
    ? normalized
    : path.resolve(process.cwd(), normalized);

  const relativePath = path.relative(process.cwd(), absolutePath) || path.basename(absolutePath);

  return {
    absolutePath,
    relativePath,
    format,
  };
}

export function resolveResponsiveOutputPaths(
  rawPath: string,
  tierNames: readonly string[],
  explicitFormat?: ScreenshotFormat
): Map<string, ResolvedOutputPath> {
  const normalized = path.normalize(rawPath);
  const isDirectoryTarget = rawPath.endsWith("/") || rawPath.endsWith(path.sep) || !path.extname(rawPath);

  const results = new Map<string, ResolvedOutputPath>();

  if (isDirectoryTarget) {
    const format = explicitFormat ?? "png";
    const ext = resolveExtensionForFormat(format);

    for (const tier of tierNames) {
      const targetFileName = `${tier}${ext}`;
      const fullTarget = path.join(normalized, targetFileName);
      results.set(tier, resolveSingleOutputPath(fullTarget, format));
    }
  } else {
    const ext = path.extname(normalized);
    const baseWithoutExt = normalized.slice(0, -ext.length);
    const inferred = inferFormatFromPath(normalized);
    const format = explicitFormat ?? inferred ?? "png";

    for (const tier of tierNames) {
      const targetFileName = `${baseWithoutExt}.${tier}${ext || resolveExtensionForFormat(format)}`;
      results.set(tier, resolveSingleOutputPath(targetFileName, format));
    }
  }

  return results;
}

export async function writeScreenshotBuffer(
  targetPath: string,
  buffer: Buffer
): Promise<{ bytesWritten: number }> {
  try {
    const dir = path.dirname(targetPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(targetPath, buffer);
    return { bytesWritten: buffer.byteLength };
  } catch (err) {
    throw new OutputError(
      `Failed to write screenshot to "${targetPath}": ${err instanceof Error ? err.message : String(err)}`,
      { target: targetPath, cause: err }
    );
  }
}
