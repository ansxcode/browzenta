export const ExitCode = {
  SUCCESS: 0,
  GENERAL_FAILURE: 1,
  INVALID_CONFIG: 2,
  BROWSER_NAVIGATION_FAILURE: 3,
  SCREENSHOT_OUTPUT_FAILURE: 4,
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];
