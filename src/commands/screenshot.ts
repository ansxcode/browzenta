import { parseRawCliOptions } from "../config/schema.js";
import { resolveViewportConfig, getResponsiveMatrix } from "../devices/resolver.js";
import { resolveSingleOutputPath, resolveResponsiveOutputPaths } from "../output/writer.js";
import { BrowserManager } from "../browser/manager.js";
import { BrowserContextFactory } from "../browser/context.js";
import { NavigationService } from "../browser/navigator.js";
import { ScreenshotService } from "../capture/screenshot.js";
import { formatHumanError, formatHumanSuccess, formatJsonOutput } from "../cli/formatters.js";
import { BrowzentaError } from "../errors/browzenta-error.js";
import { ExitCode } from "../errors/codes.js";
import type {
  CaptureResult,
  RawCliOptions,
  ResponsiveCaptureResult,
  ResponsiveItemResult,
  SingleCaptureResult,
} from "../config/types.js";

export async function executeScreenshot(
  rawUrl: string,
  rawOptions: RawCliOptions
): Promise<CaptureResult> {
  const config = parseRawCliOptions(rawUrl, rawOptions);
  const browserManager = new BrowserManager(config.browser);

  try {
    const browser = await browserManager.launch(config.headless);

    if (config.mode === "responsive") {
      const tiers = getResponsiveMatrix();
      const tierNames = tiers.map((t) => t.name);
      const outputPaths = resolveResponsiveOutputPaths(config.output, tierNames, config.format);

      const items: ResponsiveItemResult[] = [];

      for (const tier of tiers) {
        const resolvedTarget = outputPaths.get(tier.name);
        if (!resolvedTarget) {
          continue;
        }

        const tierViewport = {
          width: config.width ?? tier.config.width,
          height: config.height ?? tier.config.height,
          dpr: config.dpr ?? tier.config.dpr,
          isMobile: config.mobile !== undefined ? config.mobile : tier.config.isMobile,
          hasTouch: config.touch !== undefined ? config.touch : tier.config.hasTouch,
          userAgent: config.userAgent ?? tier.config.userAgent,
        };

        const { context, page } = await BrowserContextFactory.createContextAndPage(
          browser,
          tierViewport,
          config
        );

        try {
          await NavigationService.navigate(page, config.url, {
            timeout: config.timeout,
            wait: config.wait,
          });

          const capture = await ScreenshotService.capture(page, {
            targetPath: resolvedTarget.absolutePath,
            format: resolvedTarget.format,
            quality: config.quality,
            fullPage: config.fullPage,
          });

          items.push({
            name: tier.name,
            viewport: {
              width: tierViewport.width,
              height: tierViewport.height,
              dpr: tierViewport.dpr,
            },
            screenshot: {
              path: resolvedTarget.relativePath,
              format: capture.format,
              fullPage: capture.fullPage,
              sizeBytes: capture.sizeBytes,
            },
          });
        } finally {
          await context.close().catch(() => {});
        }
      }

      const result: ResponsiveCaptureResult = {
        status: "success",
        url: config.url,
        browser: config.browser,
        mode: "responsive",
        screenshots: items,
      };

      return result;
    } else {
      const viewport = resolveViewportConfig(config);
      const targetOutput = resolveSingleOutputPath(config.output, config.format);

      const { context, page } = await BrowserContextFactory.createContextAndPage(
        browser,
        viewport,
        config
      );

      try {
        await NavigationService.navigate(page, config.url, {
          timeout: config.timeout,
          wait: config.wait,
        });

        const capture = await ScreenshotService.capture(page, {
          targetPath: targetOutput.absolutePath,
          format: targetOutput.format,
          quality: config.quality,
          fullPage: config.fullPage,
        });

        const result: SingleCaptureResult = {
          status: "success",
          url: config.url,
          browser: config.browser,
          mode: config.mode,
          viewport: {
            width: viewport.width,
            height: viewport.height,
            dpr: viewport.dpr,
          },
          screenshot: {
            path: targetOutput.relativePath,
            format: capture.format,
            fullPage: capture.fullPage,
            sizeBytes: capture.sizeBytes,
          },
        };

        return result;
      } finally {
        await context.close().catch(() => {});
      }
    }
  } finally {
    await browserManager.close();
  }
}

export async function handleScreenshotCommand(
  rawUrl: string,
  rawOptions: RawCliOptions
): Promise<void> {
  const isJson = Boolean(rawOptions.json);
  const isDebug = Boolean(rawOptions.debug);

  try {
    const result = await executeScreenshot(rawUrl, rawOptions);

    if (isJson) {
      process.stdout.write(formatJsonOutput(result) + "\n");
    } else {
      process.stdout.write(formatHumanSuccess(result) + "\n");
    }

    process.exit(ExitCode.SUCCESS);
  } catch (err) {
    const browzentaError =
      err instanceof BrowzentaError
        ? err
        : new BrowzentaError(err instanceof Error ? err.message : String(err), {
            category: "general_error",
            exitCode: ExitCode.GENERAL_FAILURE,
            cause: err,
          });

    if (isJson) {
      process.stdout.write(
        formatJsonOutput({
          status: "error",
          error: browzentaError.toJSON(),
        }) + "\n"
      );
    } else {
      process.stderr.write(formatHumanError(browzentaError, isDebug) + "\n");
    }

    process.exit(browzentaError.exitCode);
  }
}
