import { chromium, firefox, webkit, type Browser } from "playwright";
import type { BrowserType } from "../config/types.js";
import { BrowserError } from "../errors/browzenta-error.js";

export class BrowserManager {
  private browserInstance: Browser | null = null;
  private browserType: BrowserType;

  constructor(browserType: BrowserType = "chromium") {
    this.browserType = browserType;
  }

  public async launch(headless = true): Promise<Browser> {
    if (this.browserInstance) {
      return this.browserInstance;
    }

    try {
      const launcher = this.getLauncher(this.browserType);
      const args =
        this.browserType === "chromium"
          ? [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--disable-software-rasterizer",
              "--proxy-bypass-list=<-loopback>;localhost;127.0.0.1;::1",
              "--allow-file-access-from-files",
            ]
          : undefined;

      this.browserInstance = await launcher.launch({
        headless,
        ...(args ? { args } : {}),
      });
      return this.browserInstance;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (
        message.includes("Executable doesn't exist") ||
        message.includes("Please run the following command") ||
        message.includes("playwright install")
      ) {
        throw new BrowserError(
          `Browser "${this.browserType}" is not installed. Run "browzenta setup --browser ${this.browserType}" to install required browser binaries.`,
          { target: this.browserType, cause: err }
        );
      }

      throw new BrowserError(`Failed to launch ${this.browserType} browser: ${message}`, {
        target: this.browserType,
        cause: err,
      });
    }
  }

  public async close(): Promise<void> {
    if (this.browserInstance) {
      try {
        await this.browserInstance.close();
      } catch {
        // Ignore errors during final shutdown
      } finally {
        this.browserInstance = null;
      }
    }
  }

  private getLauncher(type: BrowserType) {
    switch (type) {
      case "firefox":
        return firefox;
      case "webkit":
        return webkit;
      case "chromium":
      default:
        return chromium;
    }
  }
}
