import { describe, it, expect } from "vitest";
import { resolveViewportConfig, getResponsiveMatrix } from "../../src/devices/resolver.js";
import { parseRawCliOptions } from "../../src/config/schema.js";
import { ConfigurationError } from "../../src/errors/browzenta-error.js";

describe("Devices and Viewport Resolution", () => {
  it("resolves desktop-first default preset", () => {
    const config = parseRawCliOptions("http://localhost:3000", { mode: "desktop-first" });
    const viewport = resolveViewportConfig(config);

    expect(viewport.width).toBe(1440);
    expect(viewport.height).toBe(900);
    expect(viewport.dpr).toBe(1);
    expect(viewport.isMobile).toBe(false);
    expect(viewport.hasTouch).toBe(false);
  });

  it("resolves mobile-first preset", () => {
    const config = parseRawCliOptions("http://localhost:3000", { mode: "mobile-first" });
    const viewport = resolveViewportConfig(config);

    expect(viewport.width).toBe(390);
    expect(viewport.height).toBe(844);
    expect(viewport.dpr).toBe(3);
    expect(viewport.isMobile).toBe(true);
    expect(viewport.hasTouch).toBe(true);
    expect(viewport.userAgent).toContain("iPhone");
  });

  it("allows explicit overrides to take precedence over presets", () => {
    const config = parseRawCliOptions("http://localhost:3000", {
      mode: "mobile-first",
      width: 412,
      height: 915,
      dpr: 2.5,
      touch: false,
    });
    const viewport = resolveViewportConfig(config);

    expect(viewport.width).toBe(412);
    expect(viewport.height).toBe(915);
    expect(viewport.dpr).toBe(2.5);
    expect(viewport.hasTouch).toBe(false);
    expect(viewport.isMobile).toBe(true);
  });

  it("resolves Playwright device descriptor if provided", () => {
    const config = parseRawCliOptions("http://localhost:3000", { device: "iPhone 14" });
    const viewport = resolveViewportConfig(config);

    expect(viewport.width).toBe(390);
    expect(viewport.height).toBe(664);
    expect(viewport.dpr).toBe(3);
    expect(viewport.isMobile).toBe(true);
    expect(viewport.hasTouch).toBe(true);
  });

  it("throws ConfigurationError on unknown Playwright device", () => {
    const config = parseRawCliOptions("http://localhost:3000", { device: "NonExistentDevice" });
    expect(() => resolveViewportConfig(config)).toThrow(ConfigurationError);
  });

  it("provides deterministic 4-tier responsive matrix", () => {
    const matrix = getResponsiveMatrix();
    expect(matrix).toHaveLength(4);

    const names = matrix.map((tier) => tier.name);
    expect(names).toEqual(["mobile", "tablet", "laptop", "desktop"]);

    const mobile = matrix.find((t) => t.name === "mobile")!;
    expect(mobile.config.width).toBe(390);
    expect(mobile.config.isMobile).toBe(true);

    const desktop = matrix.find((t) => t.name === "desktop")!;
    expect(desktop.config.width).toBe(1920);
    expect(desktop.config.isMobile).toBe(false);
  });
});
