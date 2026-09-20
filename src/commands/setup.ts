import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ExitCode } from "../errors/codes.js";
import { BrowzentaError, ConfigurationError } from "../errors/browzenta-error.js";

const execFileAsync = promisify(execFile);

export interface SetupOptions {
  browser?: string;
  withDeps?: boolean;
  json?: boolean;
}

export async function handleSetupCommand(options: SetupOptions): Promise<void> {
  const isJson = Boolean(options.json);
  const rawBrowser = (options.browser ?? "chromium").toLowerCase();

  const validTargets = ["chromium", "firefox", "webkit", "all"];
  if (!validTargets.includes(rawBrowser)) {
    const err = new ConfigurationError(
      `Invalid browser target: "${options.browser}". Valid options: chromium, firefox, webkit, all`,
      { target: options.browser }
    );
    if (isJson) {
      process.stdout.write(JSON.stringify({ status: "error", error: err.toJSON() }, null, 2) + "\n");
    } else {
      process.stderr.write(`[Error: ${err.category}] ${err.message}\n`);
    }
    process.exit(ExitCode.INVALID_CONFIG);
  }

  const args = ["playwright", "install"];
  if (options.withDeps) {
    args.push("--with-deps");
  }

  if (rawBrowser !== "all") {
    args.push(rawBrowser);
  }

  if (!isJson) {
    process.stdout.write(`Installing Playwright browser binary: ${rawBrowser}...\n`);
  }

  try {
    const isWindows = process.platform === "win32";
    const cmd = isWindows ? "npx.cmd" : "npx";
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      env: process.env,
      maxBuffer: 50 * 1024 * 1024,
      ...(isWindows ? { shell: true } : {}),
    });

    if (isJson) {
      process.stdout.write(
        JSON.stringify(
          {
            status: "success",
            action: "browser_setup",
            browser: rawBrowser,
            withDeps: Boolean(options.withDeps),
            output: stdout.trim(),
          },
          null,
          2
        ) + "\n"
      );
    } else {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      process.stdout.write(`Successfully configured browser: ${rawBrowser}\n`);
    }

    process.exit(ExitCode.SUCCESS);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const browzentaError = new BrowzentaError(`Failed to install browser binaries: ${message}`, {
      category: "browser_error",
      exitCode: ExitCode.BROWSER_NAVIGATION_FAILURE,
      target: rawBrowser,
      cause: err,
    });

    if (isJson) {
      process.stdout.write(
        JSON.stringify({ status: "error", error: browzentaError.toJSON() }, null, 2) + "\n"
      );
    } else {
      process.stderr.write(`[Error: ${browzentaError.category}] ${browzentaError.message}\n`);
    }

    process.exit(ExitCode.BROWSER_NAVIGATION_FAILURE);
  }
}
