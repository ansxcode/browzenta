import { z } from "zod";
import { DEFAULT_BROWSER, DEFAULT_FORMAT, DEFAULT_HEADLESS, DEFAULT_MODE, DEFAULT_OUTPUT_FILE, DEFAULT_TIMEOUT_MS, DEFAULT_WAIT_STRATEGY } from "./defaults.js";
import { inferFormatFromPath } from "../output/writer.js";
import { ConfigurationError } from "../errors/browzenta-error.js";
import type { RawCliOptions, ScreenshotCommandConfig, ScreenshotFormat } from "./types.js";

const urlSchema = z
  .string({ required_error: "Target URL is required" })
  .min(1, "Target URL cannot be empty")
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return ["http:", "https:", "file:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "Invalid URL. Must be an absolute URL starting with http://, https://, or file://" }
  );


export function parseRawCliOptions(rawUrl: string, rawOptions: RawCliOptions): ScreenshotCommandConfig {
  const urlResult = urlSchema.safeParse(rawUrl);
  if (!urlResult.success) {
    throw new ConfigurationError(urlResult.error.errors[0]?.message ?? "Invalid URL", {
      target: rawUrl,
    });
  }

  // Parse numeric flags if passed as string
  const parseNum = (val: string | number | undefined, name: string): number | undefined => {
    if (val === undefined) return undefined;
    const n = typeof val === "number" ? val : Number(val);
    if (isNaN(n)) {
      throw new ConfigurationError(`Option --${name} must be a valid number, received: "${val}"`);
    }
    return n;
  };

  const rawOutput = rawOptions.output ?? DEFAULT_OUTPUT_FILE;
  const inferredFormat = inferFormatFromPath(rawOutput);

  // Format determination
  let format: ScreenshotFormat = DEFAULT_FORMAT;
  if (rawOptions.format) {
    const parsedFormat = rawOptions.format.toLowerCase();
    if (!["png", "jpeg", "webp"].includes(parsedFormat)) {
      throw new ConfigurationError(
        `Unsupported screenshot format: "${rawOptions.format}". Supported formats are: png, jpeg, webp`
      );
    }
    format = parsedFormat as ScreenshotFormat;
  } else if (inferredFormat) {
    format = inferredFormat;
  }

  // Quality validation
  const quality = parseNum(rawOptions.quality, "quality");
  if (quality !== undefined) {
    if (format === "png") {
      throw new ConfigurationError(
        `Quality setting is not supported for PNG format. PNG uses lossless compression. Use JPEG or WebP if quality adjustment is required.`
      );
    }
    if (quality < 1 || quality > 100 || !Number.isInteger(quality)) {
      throw new ConfigurationError(
        `Option --quality must be an integer between 1 and 100, received: ${quality}`
      );
    }
  }

  // Viewport dimensions
  const width = parseNum(rawOptions.width, "width");
  if (width !== undefined && width <= 0) {
    throw new ConfigurationError(`Option --width must be greater than 0, received: ${width}`);
  }

  const height = parseNum(rawOptions.height, "height");
  if (height !== undefined && height <= 0) {
    throw new ConfigurationError(`Option --height must be greater than 0, received: ${height}`);
  }

  const dpr = parseNum(rawOptions.dpr, "dpr");
  if (dpr !== undefined && dpr <= 0) {
    throw new ConfigurationError(`Option --dpr must be greater than 0, received: ${dpr}`);
  }

  // Mode validation
  const mode = (rawOptions.mode ?? DEFAULT_MODE).toLowerCase();
  if (!["mobile-first", "desktop-first", "responsive", "custom"].includes(mode)) {
    throw new ConfigurationError(
      `Unsupported mode: "${rawOptions.mode}". Supported modes are: mobile-first, desktop-first, responsive, custom`
    );
  }

  // Browser validation
  const browser = (rawOptions.browser ?? DEFAULT_BROWSER).toLowerCase();
  if (!["chromium", "firefox", "webkit"].includes(browser)) {
    throw new ConfigurationError(
      `Unsupported browser: "${rawOptions.browser}". Supported browsers are: chromium, firefox, webkit`
    );
  }

  // Wait strategy
  let wait: "load" | "domcontentloaded" | "networkidle" | number = DEFAULT_WAIT_STRATEGY;
  if (rawOptions.wait !== undefined) {
    const strVal = String(rawOptions.wait).toLowerCase();
    if (["load", "domcontentloaded", "networkidle"].includes(strVal)) {
      wait = strVal as "load" | "domcontentloaded" | "networkidle";
    } else {
      const ms = Number(rawOptions.wait);
      if (isNaN(ms) || ms < 0) {
        throw new ConfigurationError(
          `Invalid --wait option: "${rawOptions.wait}". Must be one of: load, domcontentloaded, networkidle, or a non-negative millisecond value.`
        );
      }
      wait = ms;
    }
  }

  // Timeout
  const timeout = parseNum(rawOptions.timeout, "timeout") ?? DEFAULT_TIMEOUT_MS;
  if (timeout <= 0) {
    throw new ConfigurationError(`Option --timeout must be greater than 0 ms, received: ${timeout}`);
  }

  // Headless: headed overrides headless
  const headless = rawOptions.headed ? false : (rawOptions.headless ?? DEFAULT_HEADLESS);

  // Color scheme
  let colorScheme: "light" | "dark" | "no-preference" | undefined;
  if (rawOptions.colorScheme) {
    const cs = rawOptions.colorScheme.toLowerCase();
    if (!["light", "dark", "no-preference"].includes(cs)) {
      throw new ConfigurationError(
        `Invalid --color-scheme: "${rawOptions.colorScheme}". Supported values: light, dark, no-preference`
      );
    }
    colorScheme = cs as "light" | "dark" | "no-preference";
  }

  return {
    url: rawUrl,
    output: rawOutput,
    mode: mode as ScreenshotCommandConfig["mode"],
    device: rawOptions.device,
    width,
    height,
    dpr,
    mobile: rawOptions.mobile,
    touch: rawOptions.touch,
    userAgent: rawOptions.userAgent,
    fullPage: Boolean(rawOptions.fullPage),
    format,
    quality,
    wait,
    timeout,
    browser: browser as ScreenshotCommandConfig["browser"],
    headless,
    colorScheme,
    locale: rawOptions.locale,
    timezone: rawOptions.timezone,
    json: Boolean(rawOptions.json),
    debug: Boolean(rawOptions.debug),
  };
}
