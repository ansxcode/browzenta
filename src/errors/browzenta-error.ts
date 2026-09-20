import { ExitCode, type ExitCodeValue } from "./codes.js";

export type ErrorCategory =
  | "general_error"
  | "invalid_config"
  | "browser_error"
  | "navigation_failure"
  | "screenshot_failure"
  | "output_failure";

export interface SerializedError {
  category: ErrorCategory;
  message: string;
  target?: string;
  exitCode: ExitCodeValue;
  details?: Record<string, unknown>;
}

export class BrowzentaError extends Error {
  public readonly category: ErrorCategory;
  public readonly exitCode: ExitCodeValue;
  public readonly target?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      category?: ErrorCategory;
      exitCode?: ExitCodeValue;
      target?: string;
      details?: Record<string, unknown>;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.category = options.category ?? "general_error";
    this.exitCode = options.exitCode ?? ExitCode.GENERAL_FAILURE;
    this.target = options.target;
    this.details = options.details;
    if (options.cause) {
      this.cause = options.cause;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): SerializedError {
    return {
      category: this.category,
      message: this.message,
      ...(this.target ? { target: this.target } : {}),
      exitCode: this.exitCode,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export class ConfigurationError extends BrowzentaError {
  constructor(
    message: string,
    options: { target?: string; details?: Record<string, unknown>; cause?: unknown } = {}
  ) {
    super(message, {
      category: "invalid_config",
      exitCode: ExitCode.INVALID_CONFIG,
      ...options,
    });
  }
}

export class BrowserError extends BrowzentaError {
  constructor(
    message: string,
    options: { target?: string; details?: Record<string, unknown>; cause?: unknown } = {}
  ) {
    super(message, {
      category: "browser_error",
      exitCode: ExitCode.BROWSER_NAVIGATION_FAILURE,
      ...options,
    });
  }
}

export class NavigationError extends BrowzentaError {
  constructor(
    message: string,
    options: { target?: string; details?: Record<string, unknown>; cause?: unknown } = {}
  ) {
    super(message, {
      category: "navigation_failure",
      exitCode: ExitCode.BROWSER_NAVIGATION_FAILURE,
      ...options,
    });
  }
}

export class ScreenshotError extends BrowzentaError {
  constructor(
    message: string,
    options: { target?: string; details?: Record<string, unknown>; cause?: unknown } = {}
  ) {
    super(message, {
      category: "screenshot_failure",
      exitCode: ExitCode.SCREENSHOT_OUTPUT_FAILURE,
      ...options,
    });
  }
}

export class OutputError extends BrowzentaError {
  constructor(
    message: string,
    options: { target?: string; details?: Record<string, unknown>; cause?: unknown } = {}
  ) {
    super(message, {
      category: "output_failure",
      exitCode: ExitCode.SCREENSHOT_OUTPUT_FAILURE,
      ...options,
    });
  }
}
