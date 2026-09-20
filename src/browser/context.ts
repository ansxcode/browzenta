import type { Browser, BrowserContext, Page } from "playwright";
import type { ScreenshotCommandConfig, ViewportConfig } from "../config/types.js";
import { BrowserError } from "../errors/browzenta-error.js";

export class BrowserContextFactory {
  public static async createContextAndPage(
    browser: Browser,
    viewportConfig: ViewportConfig,
    config: ScreenshotCommandConfig
  ): Promise<{ context: BrowserContext; page: Page }> {
    try {
      const contextOptions: Parameters<Browser["newContext"]>[0] = {
        viewport: {
          width: viewportConfig.width,
          height: viewportConfig.height,
        },
        deviceScaleFactor: viewportConfig.dpr,
        isMobile: viewportConfig.isMobile,
        hasTouch: viewportConfig.hasTouch,
        userAgent: viewportConfig.userAgent,
        colorScheme: config.colorScheme,
        locale: config.locale,
        timezoneId: config.timezone,
        ignoreHTTPSErrors: true,
      };

      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();

      return { context, page };
    } catch (err) {
      throw new BrowserError(
        `Failed to initialize browser context: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err }
      );
    }
  }
}
