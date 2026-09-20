import { devices } from "playwright";
import type { ScreenshotCommandConfig, ViewportConfig } from "../config/types.js";
import { PRESET_DESKTOP_FIRST, PRESET_MOBILE_FIRST, RESPONSIVE_MATRIX, type ResponsiveTier } from "./presets.js";
import { ConfigurationError } from "../errors/browzenta-error.js";

export function resolveViewportConfig(config: ScreenshotCommandConfig): ViewportConfig {
  let base: ViewportConfig;

  if (config.device) {
    const playwrightDevice = devices[config.device];
    if (playwrightDevice) {
      base = {
        width: playwrightDevice.viewport.width,
        height: playwrightDevice.viewport.height,
        dpr: playwrightDevice.deviceScaleFactor,
        isMobile: playwrightDevice.isMobile,
        hasTouch: playwrightDevice.hasTouch,
        userAgent: playwrightDevice.userAgent,
      };
    } else {
      throw new ConfigurationError(
        `Unknown device preset "${config.device}". Check Playwright device catalog or specify custom dimensions with --width and --height.`,
        { target: config.device }
      );
    }
  } else {
    switch (config.mode) {
      case "mobile-first":
        base = { ...PRESET_MOBILE_FIRST };
        break;
      case "desktop-first":
        base = { ...PRESET_DESKTOP_FIRST };
        break;
      case "responsive":
        // Default base for single operations in responsive mode fallback
        base = { ...PRESET_DESKTOP_FIRST };
        break;
      case "custom":
      default:
        base = {
          width: config.width ?? 1280,
          height: config.height ?? 800,
          dpr: config.dpr ?? 1,
          isMobile: config.mobile ?? false,
          hasTouch: config.touch ?? false,
          userAgent: config.userAgent,
        };
        break;
    }
  }

  // Explicit overrides from CLI always take precedence over presets
  return {
    width: config.width ?? base.width,
    height: config.height ?? base.height,
    dpr: config.dpr ?? base.dpr,
    isMobile: config.mobile !== undefined ? config.mobile : base.isMobile,
    hasTouch: config.touch !== undefined ? config.touch : base.hasTouch,
    userAgent: config.userAgent ?? base.userAgent,
  };
}

export function getResponsiveMatrix(): readonly ResponsiveTier[] {
  return RESPONSIVE_MATRIX;
}
