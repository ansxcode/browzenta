import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import path from "node:path";
import { promises as fs } from "node:fs";
import { startTestServer, type TestServerInstance } from "../fixtures/test-server.js";
import { executeScreenshot } from "../../src/commands/screenshot.js";
import { NavigationError, ConfigurationError } from "../../src/errors/browzenta-error.js";
import type { ResponsiveCaptureResult, SingleCaptureResult } from "../../src/config/types.js";

const TEST_OUTPUT_DIR = path.resolve(process.cwd(), "tests/fixtures/output");

describe("Browzenta Screenshot Integration Tests", () => {
  let serverInstance: TestServerInstance;

  beforeAll(async () => {
    serverInstance = await startTestServer();
  });

  afterAll(async () => {
    await serverInstance.close();
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("captures a standard viewport screenshot to exact caller path", async () => {
    const targetFile = path.join(TEST_OUTPUT_DIR, "basic-home.png");
    const result = (await executeScreenshot(serverInstance.url, {
      output: targetFile,
      mode: "desktop-first",
    })) as SingleCaptureResult;

    expect(result.status).toBe("success");
    expect(result.browser).toBe("chromium");
    expect(result.viewport.width).toBe(1440);
    expect(result.viewport.height).toBe(900);
    expect(result.screenshot.fullPage).toBe(false);

    const exists = await fs
      .stat(targetFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    const stats = await fs.stat(targetFile);
    expect(stats.size).toBeGreaterThan(1000);
  });

  it("captures a full-page screenshot with greater height/size than viewport", async () => {
    const viewportFile = path.join(TEST_OUTPUT_DIR, "vp.png");
    const fullPageFile = path.join(TEST_OUTPUT_DIR, "full.png");

    await executeScreenshot(serverInstance.url, {
      output: viewportFile,
      fullPage: false,
    });

    await executeScreenshot(serverInstance.url, {
      output: fullPageFile,
      fullPage: true,
    });

    const vpStats = await fs.stat(viewportFile);
    const fullStats = await fs.stat(fullPageFile);

    expect(fullStats.size).toBeGreaterThan(vpStats.size);
  });

  it("captures with custom viewport dimensions and DPR", async () => {
    const targetFile = path.join(TEST_OUTPUT_DIR, "custom-mobile.png");
    const result = (await executeScreenshot(serverInstance.url, {
      output: targetFile,
      mode: "custom",
      width: 390,
      height: 844,
      dpr: 2,
    })) as SingleCaptureResult;

    expect(result.viewport.width).toBe(390);
    expect(result.viewport.height).toBe(844);
    expect(result.viewport.dpr).toBe(2);

    const exists = await fs
      .stat(targetFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("supports JPEG and WebP formats with quality parameter", async () => {
    const jpegFile = path.join(TEST_OUTPUT_DIR, "test.jpeg");
    const webpFile = path.join(TEST_OUTPUT_DIR, "test.webp");

    const jpegResult = (await executeScreenshot(serverInstance.url, {
      output: jpegFile,
      format: "jpeg",
      quality: 80,
    })) as SingleCaptureResult;

    const webpResult = (await executeScreenshot(serverInstance.url, {
      output: webpFile,
      format: "webp",
      quality: 85,
    })) as SingleCaptureResult;

    expect(jpegResult.screenshot.format).toBe("jpeg");
    expect(webpResult.screenshot.format).toBe("webp");

    expect(
      await fs
        .stat(jpegFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
    expect(
      await fs
        .stat(webpFile)
        .then(() => true)
        .catch(() => false)
    ).toBe(true);
  });

  it("supports explicit wait strategies: networkidle and numeric milliseconds", async () => {
    const targetFile = path.join(TEST_OUTPUT_DIR, "wait-test.png");

    const idleResult = await executeScreenshot(`${serverInstance.url}/delayed`, {
      output: targetFile,
      wait: "networkidle",
    });
    expect(idleResult.status).toBe("success");

    const msResult = await executeScreenshot(`${serverInstance.url}/delayed`, {
      output: targetFile,
      wait: 200,
    });
    expect(msResult.status).toBe("success");
  });

  it("executes responsive mode generating all 4 device tiers", async () => {
    const outDir = path.join(TEST_OUTPUT_DIR, "responsive-suite/");
    const result = (await executeScreenshot(serverInstance.url, {
      mode: "responsive",
      output: outDir,
    })) as ResponsiveCaptureResult;

    expect(result.status).toBe("success");
    expect(result.mode).toBe("responsive");
    expect(result.screenshots).toHaveLength(4);

    const tierNames = result.screenshots.map((s) => s.name);
    expect(tierNames).toEqual(["mobile", "tablet", "laptop", "desktop"]);

    for (const item of result.screenshots) {
      const fullPath = path.resolve(process.cwd(), item.screenshot.path);
      const exists = await fs
        .stat(fullPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    }
  });

  it("throws NavigationError on unreachable host or connection refused", async () => {
    // Port 59999 should be unreachable locally
    await expect(
      executeScreenshot("http://127.0.0.1:59999", {
        timeout: 2000,
      })
    ).rejects.toThrow(NavigationError);
  });

  it("throws ConfigurationError on invalid parameters", async () => {
    await expect(
      executeScreenshot("invalid-url-string", {
        output: "out.png",
      })
    ).rejects.toThrow(ConfigurationError);
  });
});
