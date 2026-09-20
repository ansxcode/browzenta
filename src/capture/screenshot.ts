import type { Page } from "playwright";
import type { ScreenshotFormat } from "../config/types.js";
import { ScreenshotError } from "../errors/browzenta-error.js";
import { writeScreenshotBuffer } from "../output/writer.js";

export interface CaptureOptions {
  targetPath: string;
  format: ScreenshotFormat;
  quality?: number;
  fullPage: boolean;
}

export interface CaptureExecutionResult {
  path: string;
  format: ScreenshotFormat;
  fullPage: boolean;
  sizeBytes: number;
}

export class ScreenshotService {
  public static async capture(
    page: Page,
    options: CaptureOptions
  ): Promise<CaptureExecutionResult> {
    try {
      const screenshotOptions: Parameters<Page["screenshot"]>[0] = {
        fullPage: options.fullPage,
        type: options.format,
      };

      if (options.quality !== undefined && (options.format === "jpeg" || options.format === "webp")) {
        screenshotOptions.quality = options.quality;
      }

      const buffer = await page.screenshot(screenshotOptions);
      const { bytesWritten } = await writeScreenshotBuffer(options.targetPath, buffer);

      return {
        path: options.targetPath,
        format: options.format,
        fullPage: options.fullPage,
        sizeBytes: bytesWritten,
      };
    } catch (err) {
      if (err instanceof ScreenshotError) {
        throw err;
      }
      throw new ScreenshotError(
        `Failed to capture screenshot: ${err instanceof Error ? err.message : String(err)}`,
        { target: options.targetPath, cause: err }
      );
    }
  }
}
