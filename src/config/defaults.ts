import type { BrowserType, DeviceMode, ScreenshotFormat, WaitCondition } from "./types.js";

export const DEFAULT_BROWSER: BrowserType = "chromium";
export const DEFAULT_MODE: DeviceMode = "desktop-first";
export const DEFAULT_TIMEOUT_MS = 30000;
export const DEFAULT_WAIT_STRATEGY: WaitCondition = "load";
export const DEFAULT_HEADLESS = true;
export const DEFAULT_FORMAT: ScreenshotFormat = "png";
export const DEFAULT_OUTPUT_FILE = "screenshot.png";
