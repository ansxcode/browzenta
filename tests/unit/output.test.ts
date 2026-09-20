import { describe, it, expect, afterEach } from "vitest";
import path from "node:path";
import { promises as fs } from "node:fs";
import {
  inferFormatFromPath,
  resolveSingleOutputPath,
  resolveResponsiveOutputPaths,
  writeScreenshotBuffer,
} from "../../src/output/writer.js";

const TEST_OUT_DIR = path.resolve(process.cwd(), "tests/fixtures/temp-output");

describe("Output Management and Filesystem Writing", () => {
  afterEach(async () => {
    try {
      await fs.rm(TEST_OUT_DIR, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("infers file formats correctly", () => {
    expect(inferFormatFromPath("file.png")).toBe("png");
    expect(inferFormatFromPath("dir/file.jpg")).toBe("jpeg");
    expect(inferFormatFromPath("dir/file.jpeg")).toBe("jpeg");
    expect(inferFormatFromPath("dir/file.webp")).toBe("webp");
    expect(inferFormatFromPath("dir/file.unknown")).toBeNull();
  });

  it("resolves single exact output paths without renaming", () => {
    const rawTarget = "custom/dir/exact-file.png";
    const resolved = resolveSingleOutputPath(rawTarget);

    expect(resolved.relativePath).toBe(rawTarget);
    expect(resolved.absolutePath).toBe(path.resolve(process.cwd(), rawTarget));
    expect(resolved.format).toBe("png");
  });

  it("resolves responsive output paths for directory target", () => {
    const tiers = ["mobile", "tablet", "laptop", "desktop"] as const;
    const paths = resolveResponsiveOutputPaths(".visual-audit/home/", tiers, "webp");

    expect(paths.get("mobile")?.relativePath).toBe(path.join(".visual-audit/home", "mobile.webp"));
    expect(paths.get("tablet")?.relativePath).toBe(path.join(".visual-audit/home", "tablet.webp"));
    expect(paths.get("laptop")?.relativePath).toBe(path.join(".visual-audit/home", "laptop.webp"));
    expect(paths.get("desktop")?.relativePath).toBe(path.join(".visual-audit/home", "desktop.webp"));
  });

  it("resolves responsive output paths for file target with deterministic tier suffix", () => {
    const tiers = ["mobile", "tablet", "laptop", "desktop"] as const;
    const paths = resolveResponsiveOutputPaths(".visual-audit/home/hero.png", tiers);

    expect(paths.get("mobile")?.relativePath).toBe(
      path.join(".visual-audit/home", "hero.mobile.png")
    );
    expect(paths.get("tablet")?.relativePath).toBe(
      path.join(".visual-audit/home", "hero.tablet.png")
    );
  });

  it("automatically creates missing parent directories and writes screenshot buffer", async () => {
    const deepTarget = path.join(TEST_OUT_DIR, "deep/nested/folder/shot.png");
    const fakeBuffer = Buffer.from("fake-image-bytes");

    const result = await writeScreenshotBuffer(deepTarget, fakeBuffer);
    expect(result.bytesWritten).toBe(fakeBuffer.byteLength);

    const exists = await fs
      .stat(deepTarget)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    const read = await fs.readFile(deepTarget);
    expect(read).toEqual(fakeBuffer);
  });
});
