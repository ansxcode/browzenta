// Public API exports for Browzenta

export { executeScreenshot } from "./commands/screenshot.js";
export { handleSetupCommand } from "./commands/setup.js";
export { createCli, runCli } from "./cli/index.js";

// Core Browser & Execution layer (for future interaction extensions: click, type, fill, evaluate)
export { BrowserManager } from "./browser/manager.js";
export { BrowserContextFactory } from "./browser/context.js";
export { NavigationService } from "./browser/navigator.js";
export { ScreenshotService } from "./capture/screenshot.js";

// Configuration & Validation
export { parseRawCliOptions } from "./config/schema.js";
export * from "./config/defaults.js";
export * from "./config/types.js";

// Devices & Presets
export { resolveViewportConfig, getResponsiveMatrix } from "./devices/resolver.js";
export * from "./devices/presets.js";

// Output & Filesystem
export {
  resolveSingleOutputPath,
  resolveResponsiveOutputPaths,
  inferFormatFromPath,
  writeScreenshotBuffer,
} from "./output/writer.js";

// Errors & Exit Codes
export {
  BrowzentaError,
  ConfigurationError,
  BrowserError,
  NavigationError,
  ScreenshotError,
  OutputError,
} from "./errors/browzenta-error.js";
export { ExitCode } from "./errors/codes.js";
