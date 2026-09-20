import type { SerializedError } from "../errors/browzenta-error.js";

export type BrowserType = "chromium" | "firefox" | "webkit";

export type ScreenshotFormat = "png" | "jpeg" | "webp";

export type WaitCondition = "load" | "domcontentloaded" | "networkidle";

export type WaitStrategy = WaitCondition | number;

export type DeviceMode = "mobile-first" | "desktop-first" | "responsive" | "custom";

export type ColorScheme = "light" | "dark" | "no-preference";

export interface ViewportConfig {
  width: number;
  height: number;
  dpr: number;
  isMobile: boolean;
  hasTouch: boolean;
  userAgent?: string;
}

export interface RawCliOptions {
  mode?: string;
  device?: string;
  width?: string | number;
  height?: string | number;
  dpr?: string | number;
  mobile?: boolean;
  touch?: boolean;
  userAgent?: string;
  fullPage?: boolean;
  output?: string;
  format?: string;
  quality?: string | number;
  wait?: string | number;
  timeout?: string | number;
  browser?: string;
  headless?: boolean;
  headed?: boolean;
  colorScheme?: string;
  locale?: string;
  timezone?: string;
  json?: boolean;
  debug?: boolean;
}

export interface ScreenshotCommandConfig {
  url: string;
  output: string;
  mode: DeviceMode;
  device?: string;
  width?: number;
  height?: number;
  dpr?: number;
  mobile?: boolean;
  touch?: boolean;
  userAgent?: string;
  fullPage: boolean;
  format: ScreenshotFormat;
  quality?: number;
  wait: WaitStrategy;
  timeout: number;
  browser: BrowserType;
  headless: boolean;
  colorScheme?: ColorScheme;
  locale?: string;
  timezone?: string;
  json: boolean;
  debug: boolean;
}

export interface SingleCaptureResult {
  status: "success";
  url: string;
  browser: BrowserType;
  mode: DeviceMode;
  viewport: {
    width: number;
    height: number;
    dpr: number;
  };
  screenshot: {
    path: string;
    format: ScreenshotFormat;
    fullPage: boolean;
    sizeBytes: number;
  };
}

export interface ResponsiveItemResult {
  name: string;
  viewport: {
    width: number;
    height: number;
    dpr: number;
  };
  screenshot: {
    path: string;
    format: ScreenshotFormat;
    fullPage: boolean;
    sizeBytes: number;
  };
}

export interface ResponsiveCaptureResult {
  status: "success";
  url: string;
  browser: BrowserType;
  mode: "responsive";
  screenshots: ResponsiveItemResult[];
}

export type CaptureResult = SingleCaptureResult | ResponsiveCaptureResult;

export interface ErrorCaptureResult {
  status: "error";
  error: SerializedError;
}

export type MachineOutput = CaptureResult | ErrorCaptureResult;
