import type { ViewportConfig } from "../config/types.js";

export const PRESET_MOBILE_FIRST: ViewportConfig = {
  width: 390,
  height: 844,
  dpr: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
};

export const PRESET_DESKTOP_FIRST: ViewportConfig = {
  width: 1440,
  height: 900,
  dpr: 1,
  isMobile: false,
  hasTouch: false,
};

export interface ResponsiveTier {
  name: "mobile" | "tablet" | "laptop" | "desktop";
  config: ViewportConfig;
}

export const RESPONSIVE_MATRIX: readonly ResponsiveTier[] = [
  {
    name: "mobile",
    config: {
      width: 390,
      height: 844,
      dpr: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
  },
  {
    name: "tablet",
    config: {
      width: 768,
      height: 1024,
      dpr: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
  },
  {
    name: "laptop",
    config: {
      width: 1366,
      height: 768,
      dpr: 1,
      isMobile: false,
      hasTouch: false,
    },
  },
  {
    name: "desktop",
    config: {
      width: 1920,
      height: 1080,
      dpr: 1,
      isMobile: false,
      hasTouch: false,
    },
  },
] as const;
