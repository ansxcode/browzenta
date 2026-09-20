import { createRequire } from "node:module";
import { Command } from "commander";
import { handleScreenshotCommand } from "../commands/screenshot.js";
import { handleSetupCommand } from "../commands/setup.js";
import type { RawCliOptions } from "../config/types.js";

function getCliVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("../../package.json") as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export function createCli(): Command {
  const program = new Command();

  program
    .name("browzenta")
    .description("Deterministic browser automation and inspection CLI tool for AI coding agents")
    .version(getCliVersion());

  program
    .command("screenshot")
    .description("Capture a deterministic screenshot of the target URL")
    .argument("<url>", "Target URL to open (e.g. http://localhost:3000 or https://example.com)")
    .option("-o, --output <path>", "Target output file path or directory", "screenshot.png")
    .option("-m, --mode <mode>", "Device mode: mobile-first, desktop-first, responsive, custom", "desktop-first")
    .option("-d, --device <name>", "Playwright device descriptor preset (e.g. 'iPhone 14')")
    .option("-w, --width <number>", "Viewport width in pixels")
    .option("-h, --height <number>", "Viewport height in pixels")
    .option("--dpr <number>", "Device pixel ratio / scale factor")
    .option("--mobile", "Enable mobile device emulation")
    .option("--no-mobile", "Disable mobile device emulation")
    .option("--touch", "Enable touch emulation")
    .option("--no-touch", "Disable touch emulation")
    .option("--user-agent <string>", "Custom User-Agent header")
    .option("-f, --format <format>", "Image format: png, jpeg, webp (inferred from --output if omitted)")
    .option("-q, --quality <number>", "Image quality (1-100, applicable to jpeg and webp only)")
    .option("--full-page", "Capture full scrollable page instead of current viewport", false)
    .option("--wait <strategy>", "Wait strategy: load, domcontentloaded, networkidle, or milliseconds", "load")
    .option("-t, --timeout <ms>", "Navigation and render timeout in milliseconds", "30000")
    .option("-b, --browser <browser>", "Browser engine: chromium, firefox, webkit", "chromium")
    .option("--headed", "Launch browser in headed/visible mode for debugging", false)
    .option("--color-scheme <scheme>", "Preferred color scheme: light, dark, no-preference")
    .option("--locale <string>", "Browser locale (e.g. en-US)")
    .option("--timezone <string>", "Browser timezone ID (e.g. America/New_York)")
    .option("--json", "Output deterministic machine-readable JSON to stdout", false)
    .option("--debug", "Output diagnostic stack traces on error", false)
    .action(async (url: string, options: RawCliOptions) => {
      await handleScreenshotCommand(url, options);
    });

  program
    .command("setup")
    .description("Install required Playwright browser binaries and dependencies")
    .option("-b, --browser <browser>", "Target browser: chromium, firefox, webkit, all", "chromium")
    .option("--with-deps", "Install system-level dependencies for the browser", false)
    .option("--json", "Output machine-readable JSON status", false)
    .action(async (options: { browser?: string; withDeps?: boolean; json?: boolean }) => {
      await handleSetupCommand(options);
    });

  return program;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = createCli();
  await program.parseAsync(argv);
}
