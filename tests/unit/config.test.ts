import { describe, it, expect } from "vitest";
import { parseRawCliOptions } from "../../src/config/schema.js";
import { ConfigurationError } from "../../src/errors/browzenta-error.js";

describe("Configuration & Zod Validation", () => {
  it("parses valid URL with default settings", () => {
    const config = parseRawCliOptions("http://localhost:3000", {});

    expect(config.url).toBe("http://localhost:3000");
    expect(config.browser).toBe("chromium");
    expect(config.mode).toBe("desktop-first");
    expect(config.format).toBe("png");
    expect(config.fullPage).toBe(false);
    expect(config.wait).toBe("load");
    expect(config.timeout).toBe(30000);
    expect(config.headless).toBe(true);
  });

  it("throws ConfigurationError on invalid URL", () => {
    expect(() => parseRawCliOptions("not-a-url", {})).toThrow(ConfigurationError);
    expect(() => parseRawCliOptions("ftp://example.com", {})).toThrow(ConfigurationError);
    expect(() => parseRawCliOptions("", {})).toThrow(ConfigurationError);
  });

  it("infers screenshot format from output file extension", () => {
    const pngConfig = parseRawCliOptions("http://localhost:3000", { output: "audit/hero.png" });
    expect(pngConfig.format).toBe("png");

    const jpegConfig = parseRawCliOptions("http://localhost:3000", { output: "audit/hero.jpeg" });
    expect(jpegConfig.format).toBe("jpeg");

    const jpgConfig = parseRawCliOptions("http://localhost:3000", { output: "audit/hero.jpg" });
    expect(jpgConfig.format).toBe("jpeg");

    const webpConfig = parseRawCliOptions("http://localhost:3000", { output: "audit/hero.webp" });
    expect(webpConfig.format).toBe("webp");
  });

  it("allows explicit format override over extension", () => {
    const config = parseRawCliOptions("http://localhost:3000", {
      output: "audit/hero.custom",
      format: "webp",
    });
    expect(config.format).toBe("webp");
  });

  it("rejects unsupported format", () => {
    expect(() =>
      parseRawCliOptions("http://localhost:3000", {
        output: "audit/hero.gif",
        format: "gif",
      })
    ).toThrow(ConfigurationError);
  });

  it("rejects quality setting on PNG format", () => {
    expect(() =>
      parseRawCliOptions("http://localhost:3000", {
        output: "audit/hero.png",
        quality: 80,
      })
    ).toThrow(/Quality setting is not supported for PNG/);
  });

  it("validates quality range for JPEG and WebP", () => {
    const jpegConfig = parseRawCliOptions("http://localhost:3000", {
      output: "audit/hero.jpeg",
      quality: 85,
    });
    expect(jpegConfig.quality).toBe(85);

    expect(() =>
      parseRawCliOptions("http://localhost:3000", {
        output: "audit/hero.jpeg",
        quality: 120,
      })
    ).toThrow(ConfigurationError);

    expect(() =>
      parseRawCliOptions("http://localhost:3000", {
        output: "audit/hero.webp",
        quality: 0,
      })
    ).toThrow(ConfigurationError);
  });

  it("validates viewport dimensions and DPR", () => {
    const customConfig = parseRawCliOptions("http://localhost:3000", {
      width: "390",
      height: "844",
      dpr: "3",
    });
    expect(customConfig.width).toBe(390);
    expect(customConfig.height).toBe(844);
    expect(customConfig.dpr).toBe(3);

    expect(() =>
      parseRawCliOptions("http://localhost:3000", { width: "-10" })
    ).toThrow(ConfigurationError);
    expect(() =>
      parseRawCliOptions("http://localhost:3000", { height: "abc" })
    ).toThrow(ConfigurationError);
    expect(() =>
      parseRawCliOptions("http://localhost:3000", { dpr: "0" })
    ).toThrow(ConfigurationError);
  });

  it("validates wait strategies", () => {
    const loadConfig = parseRawCliOptions("http://localhost:3000", { wait: "load" });
    expect(loadConfig.wait).toBe("load");

    const domConfig = parseRawCliOptions("http://localhost:3000", { wait: "domcontentloaded" });
    expect(domConfig.wait).toBe("domcontentloaded");

    const idleConfig = parseRawCliOptions("http://localhost:3000", { wait: "networkidle" });
    expect(idleConfig.wait).toBe("networkidle");

    const msConfig = parseRawCliOptions("http://localhost:3000", { wait: "2500" });
    expect(msConfig.wait).toBe(2500);

    expect(() =>
      parseRawCliOptions("http://localhost:3000", { wait: "invalid-wait" })
    ).toThrow(ConfigurationError);
  });

  it("validates browser selection", () => {
    const chromeConfig = parseRawCliOptions("http://localhost:3000", { browser: "chromium" });
    expect(chromeConfig.browser).toBe("chromium");

    const ffConfig = parseRawCliOptions("http://localhost:3000", { browser: "firefox" });
    expect(ffConfig.browser).toBe("firefox");

    const wkConfig = parseRawCliOptions("http://localhost:3000", { browser: "webkit" });
    expect(wkConfig.browser).toBe("webkit");

    expect(() =>
      parseRawCliOptions("http://localhost:3000", { browser: "edge" })
    ).toThrow(ConfigurationError);
  });

  it("respects headed flag overriding headless", () => {
    const headlessConfig = parseRawCliOptions("http://localhost:3000", {});
    expect(headlessConfig.headless).toBe(true);

    const headedConfig = parseRawCliOptions("http://localhost:3000", { headed: true });
    expect(headedConfig.headless).toBe(false);
  });

  it("validates colorScheme options", () => {
    const darkConfig = parseRawCliOptions("http://localhost:3000", { colorScheme: "dark" });
    expect(darkConfig.colorScheme).toBe("dark");

    expect(() =>
      parseRawCliOptions("http://localhost:3000", { colorScheme: "sepia" })
    ).toThrow(ConfigurationError);
  });
});
