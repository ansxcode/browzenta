import type { CaptureResult, MachineOutput } from "../config/types.js";
import type { BrowzentaError } from "../errors/browzenta-error.js";

export function formatJsonOutput(output: MachineOutput): string {
  return JSON.stringify(output, null, 2);
}

export function formatHumanSuccess(result: CaptureResult): string {
  const lines: string[] = [];

  if ("screenshots" in result) {
    lines.push(`Successfully captured responsive screenshots for: ${result.url}`);
    lines.push(`Browser: ${result.browser}`);
    lines.push(`Captures (${result.screenshots.length}):`);
    for (const item of result.screenshots) {
      lines.push(
        `  - ${item.name} (${item.viewport.width}x${item.viewport.height} @${item.viewport.dpr}x) -> ${item.screenshot.path} [${item.screenshot.format.toUpperCase()}, ${item.screenshot.sizeBytes} bytes]`
      );
    }
  } else {
    lines.push(`Successfully captured screenshot for: ${result.url}`);
    lines.push(`Browser:  ${result.browser}`);
    lines.push(`Mode:     ${result.mode}`);
    lines.push(
      `Viewport: ${result.viewport.width}x${result.viewport.height} (dpr: ${result.viewport.dpr})`
    );
    lines.push(`Output:   ${result.screenshot.path}`);
    lines.push(`Format:   ${result.screenshot.format.toUpperCase()}`);
    lines.push(`FullPage: ${result.screenshot.fullPage ? "yes" : "no"}`);
    lines.push(`Size:     ${result.screenshot.sizeBytes} bytes`);
  }

  return lines.join("\n");
}

export function formatHumanError(error: BrowzentaError, debug = false): string {
  const lines: string[] = [];
  lines.push(`[Error: ${error.category}] ${error.message}`);

  if (error.target) {
    lines.push(`Target: ${error.target}`);
  }

  if (debug && error.stack) {
    lines.push("\nStack trace:");
    lines.push(error.stack);
  }

  return lines.join("\n");
}
