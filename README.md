# Browzenta

**Deterministic browser automation and inspection CLI tool designed primarily for AI coding agents.**

[![npm version](https://img.shields.io/npm/v/browzenta.svg)](https://www.npmjs.com/package/browzenta)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-ansxcode%2Fbrowzenta-black.svg?logo=github)](https://github.com/ansxcode/browzenta)

Browzenta provides an execution layer for AI agents to interact with and visually inspect actual browser-rendered applications—replacing guesswork, raw source parsing, or blind HTTP requests with ground-truth visual feedback.

---

## Why Browzenta?

AI coding agents need to see what they build, but existing browser automation tools suffer from significant issues:
* **Overly opinionated workflows**: Tools that force arbitrary folder hierarchies or rewrite filenames.
* **Heavyweight footprints**: Unwanted web dashboards, background daemons, or mandatory cloud dependencies.
* **Non-deterministic outputs**: Guessing semantics (e.g. naming files `pricing.png` or `dashboard.png` based on URLs).

**Browzenta is powerful but unopinionated.**
The AI agent owns the semantic context:
* The agent decides the page to inspect, the URL, the viewport, and the device presets.
* The agent specifies the exact output path (e.g., `.visual-audit/home/mobile/hero.png`).
* Browzenta saves to that exact path without renaming or adding unprompted metadata.
* Results and errors are emitted in deterministic, machine-readable JSON or clean terminal output.

---

## Installation

### System Requirements
* Node.js 22+ (Node.js 24 LTS recommended)
* Linux, macOS, or Windows

### 1. Global Installation
Install globally via npm to make the `browzenta` command available across your entire system:

```bash
npm install -g browzenta
```

Verify installation:
```bash
browzenta --help
browzenta --version
```

### 2. On-Demand Execution via npx
Execute Browzenta directly without permanent global installation:

```bash
# Capture screenshot directly
npx browzenta screenshot http://localhost:3000 --output screenshot.png

# Run browser setup
npx browzenta setup
```

### 3. Local Development (from Source)
To contribute or develop Browzenta from source:

```bash
# Clone the repository
git clone https://github.com/ansxcode/browzenta.git
cd browzenta

# Install dependencies and compile TypeScript
npm install
npm run build
```

Once compiled, execute the CLI directly:
```bash
node bin/browzenta.js --help
```

*(Note: `npm link` is strictly an optional convenience for local development symlinking, never a requirement for end-user or production workflows).*

---

## Browser Setup

Browzenta leverages Playwright under the hood for cross-browser rendering without requiring global Playwright installations. Browser binaries are managed in user-level cache (`~/.cache/ms-playwright` or platform equivalent).

Run the built-in setup command to install browser binaries (supported on Linux, macOS, and Windows):

```bash
# Install default browser (Chromium)
browzenta setup

# Or via npx
npx browzenta setup

# Install specific browser engine (chromium, firefox, webkit, or all)
browzenta setup --browser chromium
browzenta setup --browser firefox
browzenta setup --browser webkit
browzenta setup --browser all

# On Linux, optionally install OS-level system dependencies
browzenta setup --with-deps

# Machine-readable JSON output for automated agent provisioning
browzenta setup --browser chromium --json
```

---

## Usage Guide

### 1. Basic Viewport Screenshot

Capture a standard desktop viewport (1440x900 @ 1x DPR) to an exact path:

```bash
browzenta screenshot http://localhost:3000 --output .visual-audit/home.png
```

Missing parent directories are created automatically. The output file exists precisely at the path requested.

---

### 2. Device Modes & Presets

Browzenta comes with deterministic presets:

#### `mobile-first`
Emulates a modern mobile device (390x844 @ 3x DPR with touch and mobile User-Agent):
```bash
browzenta screenshot http://localhost:3000 \
  --mode mobile-first \
  --output .visual-audit/mobile.png
```

#### `desktop-first`
Standard desktop viewport (1440x900 @ 1x DPR):
```bash
browzenta screenshot http://localhost:3000 \
  --mode desktop-first \
  --output .visual-audit/desktop.png
```

#### Playwright Device Descriptors
Use any standard Playwright device profile:
```bash
browzenta screenshot http://localhost:3000 \
  --device "iPhone 14" \
  --output .visual-audit/iphone14.png
```

---

### 3. Custom Viewport & DPR

For pixel-perfect control over viewport dimensions, scale factor, and touch emulation:

```bash
browzenta screenshot http://localhost:3000 \
  --width 390 \
  --height 844 \
  --dpr 3 \
  --touch \
  --mobile \
  --output .visual-audit/custom-mobile.png
```

---

### 4. Responsive Mode

Execute a multi-viewport scan across 4 deterministic tiers:
* **mobile**: 390x844 (3x DPR, touch, mobile)
* **tablet**: 768x1024 (2x DPR, touch, mobile)
* **laptop**: 1366x768 (1x DPR)
* **desktop**: 1920x1080 (1x DPR)

#### Directory Output
Provide a directory path ending with `/`:
```bash
browzenta screenshot http://localhost:3000 \
  --mode responsive \
  --output .visual-audit/responsive/
```
Generates:
* `.visual-audit/responsive/mobile.png`
* `.visual-audit/responsive/tablet.png`
* `.visual-audit/responsive/laptop.png`
* `.visual-audit/responsive/desktop.png`

#### File Base Output
Provide a file path template:
```bash
browzenta screenshot http://localhost:3000 \
  --mode responsive \
  --output .visual-audit/home.png
```
Generates:
* `.visual-audit/home.mobile.png`
* `.visual-audit/home.tablet.png`
* `.visual-audit/home.laptop.png`
* `.visual-audit/home.desktop.png`

---

### 5. Full-Page Capture

Capture the entire scrollable height of a page:

```bash
browzenta screenshot http://localhost:3000 \
  --full-page \
  --output .visual-audit/full-page.png
```

---

### 6. Formats & Quality

Supported formats: `png`, `jpeg`, `webp`.

The format is automatically inferred from the output filename:
```bash
browzenta screenshot http://localhost:3000 --output preview.jpeg --quality 80
browzenta screenshot http://localhost:3000 --output preview.webp --quality 85
```

You can also explicitly override the format:
```bash
browzenta screenshot http://localhost:3000 --format webp --output preview.custom
```

> **Note:** Quality setting applies to lossy formats (`jpeg`, `webp`). Supplying quality for lossless `png` produces an error.

---

### 7. Waiting Strategies

Ensure dynamic content or client-side hydration has settled before capturing:

```bash
# Wait for document load event (default)
browzenta screenshot http://localhost:3000 --wait load

# Wait for DOM content loaded
browzenta screenshot http://localhost:3000 --wait domcontentloaded

# Wait until network is idle (no connections for 500ms)
browzenta screenshot http://localhost:3000 --wait networkidle

# Wait an explicit delay in milliseconds
browzenta screenshot http://localhost:3000 --wait 2000
```

---

### 8. Browser Engines & Headed Debugging

Select between Chromium (default), Firefox, and WebKit:

```bash
browzenta screenshot http://localhost:3000 --browser firefox --output firefox.png
browzenta screenshot http://localhost:3000 --browser webkit --output safari.png
```

Launch a visible browser window for visual debugging:
```bash
browzenta screenshot http://localhost:3000 --headed
```

---

### 9. Environment Emulation (Color Scheme, Locale, Timezone, User-Agent)

Emulate specific client environments and rendering preferences:

```bash
# Color scheme emulation: light, dark, or no-preference
browzenta screenshot http://localhost:3000 --color-scheme dark --output dark-mode.png

# Locale and Timezone emulation
browzenta screenshot http://localhost:3000 \
  --locale en-US \
  --timezone America/New_York \
  --output localized.png

# Custom User-Agent header
browzenta screenshot http://localhost:3000 \
  --user-agent "CustomAgent/1.0" \
  --output custom-ua.png
```

---

### 10. Machine-Readable JSON Output & Debugging

When invoked by AI agents or CI pipelines, pass `--json` to receive structured, deterministic JSON on stdout (human log messages are cleanly redirected to stderr):

#### Single Capture JSON
```bash
browzenta screenshot http://localhost:3000 \
  --width 390 \
  --height 844 \
  --dpr 3 \
  --output .visual-audit/mobile.png \
  --json
```

Output:
```json
{
  "status": "success",
  "url": "http://localhost:3000",
  "browser": "chromium",
  "mode": "custom",
  "viewport": {
    "width": 390,
    "height": 844,
    "dpr": 3
  },
  "screenshot": {
    "path": ".visual-audit/mobile.png",
    "format": "png",
    "fullPage": false,
    "sizeBytes": 42180
  }
}
```

#### Responsive Mode JSON
```bash
browzenta screenshot http://localhost:3000 \
  --mode responsive \
  --output .visual-audit/responsive/ \
  --json
```

Output:
```json
{
  "status": "success",
  "url": "http://localhost:3000",
  "browser": "chromium",
  "mode": "responsive",
  "screenshots": [
    {
      "name": "mobile",
      "viewport": {
        "width": 390,
        "height": 844,
        "dpr": 3
      },
      "screenshot": {
        "path": ".visual-audit/responsive/mobile.png",
        "format": "png",
        "fullPage": false,
        "sizeBytes": 38120
      }
    },
    {
      "name": "tablet",
      "viewport": {
        "width": 768,
        "height": 1024,
        "dpr": 2
      },
      "screenshot": {
        "path": ".visual-audit/responsive/tablet.png",
        "format": "png",
        "fullPage": false,
        "sizeBytes": 54200
      }
    },
    {
      "name": "laptop",
      "viewport": {
        "width": 1366,
        "height": 768,
        "dpr": 1
      },
      "screenshot": {
        "path": ".visual-audit/responsive/laptop.png",
        "format": "png",
        "fullPage": false,
        "sizeBytes": 61400
      }
    },
    {
      "name": "desktop",
      "viewport": {
        "width": 1920,
        "height": 1080,
        "dpr": 1
      },
      "screenshot": {
        "path": ".visual-audit/responsive/desktop.png",
        "format": "png",
        "fullPage": false,
        "sizeBytes": 78950
      }
    }
  ]
}
```

#### Error Handling & `--debug` Flag
When a command fails with `--json`, structured error details and deterministic exit codes are returned:
```json
{
  "status": "error",
  "error": {
    "category": "navigation_failure",
    "message": "Navigation timeout after 30000ms: http://localhost:3000",
    "target": "http://localhost:3000",
    "exitCode": 3
  }
}
```

Pass `--debug` to output complete diagnostic error stack traces to stderr:
```bash
browzenta screenshot http://localhost:3000 --debug
```

---

## Deterministic Exit Codes

| Code | Meaning | Description |
|:---|:---|:---|
| `0` | **Success** | Screenshot(s) captured and persisted successfully. |
| `1` | **General Failure** | Unhandled process or operational exception. |
| `2` | **Invalid Configuration** | Invalid CLI flags, malformed URL, or unsupported options. |
| `3` | **Browser / Navigation Failure** | Browser launch error, missing binary, unreachable URL, or timeout. |
| `4` | **Screenshot / Output Failure** | Frame capture or filesystem write failure. |

---

## Agent Workflow Pattern

A typical AI coding agent workflow with Browzenta:

```text
AI Coding Agent
      │
      ├─ 1. Reads local source code & identifies routes/components
      ├─ 2. Decides inspection viewport (e.g. mobile: 390x844 @ 3x)
      ├─ 3. Executes Browzenta:
      │       browzenta screenshot http://localhost:3000 \
      │         --width 390 --height 844 --dpr 3 \
      │         --output .visual-audit/home-mobile.png --json
      │
      ├─ 4. Inspects generated screenshot at exact path
      ├─ 5. Modifies CSS / markup / layout to resolve bugs
      ├─ 6. Re-executes Browzenta to verify resolution
      └─ 7. Confirms visual fidelity
```

---

## Development & Testing

```bash
# Clone the repository
git clone https://github.com/ansxcode/browzenta.git
cd browzenta

# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Run TypeScript type check
npm run typecheck

# Setup browser binaries (required for browser integration tests)
node bin/browzenta.js setup --browser chromium

# Run unit and integration tests
npm test

# Clean compiled build artifacts
npm run clean
```

---

## Repository & Issues

* **GitHub Repository:** [https://github.com/ansxcode/browzenta](https://github.com/ansxcode/browzenta)
* **Issue Tracker:** [https://github.com/ansxcode/browzenta/issues](https://github.com/ansxcode/browzenta/issues)

---

## Uninstallation

To cleanly remove global CLI installation:

```bash
npm uninstall -g browzenta
```

---

## License

MIT
