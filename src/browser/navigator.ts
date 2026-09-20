import type { Page, Response } from "playwright";
import type { WaitStrategy } from "../config/types.js";
import { NavigationError } from "../errors/browzenta-error.js";

export class NavigationService {
  public static async navigate(
    page: Page,
    url: string,
    options: {
      timeout: number;
      wait: WaitStrategy;
    }
  ): Promise<Response | null> {
    const { timeout, wait } = options;

    // Determine initial waitUntil for page.goto
    const initialWait = typeof wait === "string" ? wait : "load";

    let response: Response | null = null;
    try {
      response = await page.goto(url, {
        timeout,
        waitUntil: initialWait,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Timeout") || msg.includes("timeout")) {
        throw new NavigationError(`Navigation timeout after ${timeout}ms: ${url}`, {
          target: url,
          details: { timeout, wait },
          cause: err,
        });
      }
      if (msg.includes("ERR_NAME_NOT_RESOLVED") || msg.includes("ERR_CONNECTION_REFUSED") || msg.includes("NS_ERROR_CONNECTION_REFUSED")) {
        throw new NavigationError(`Failed to reach URL (connection refused or unresolved host): ${url}`, {
          target: url,
          cause: err,
        });
      }
      throw new NavigationError(`Navigation failed for ${url}: ${msg}`, {
        target: url,
        cause: err,
      });
    }

    // If explicit numeric timeout wait is requested (e.g. --wait 2000), wait that duration
    if (typeof wait === "number" && wait > 0) {
      try {
        await page.waitForTimeout(wait);
      } catch (err) {
        throw new NavigationError(`Wait timeout failed during delay of ${wait}ms: ${err instanceof Error ? err.message : String(err)}`, {
          target: url,
          cause: err,
        });
      }
    }

    // If HTTP error code is >= 400 (except file: protocol where response is null)
    if (response && !response.ok() && response.status() >= 400) {
      // Note: We do not necessarily abort on 404 if the agent specifically wanted to capture the 404 page render,
      // but if server returned a 5xx or bad gateway, it's still rendered. Let's record response status.
    }

    return response;
  }
}
