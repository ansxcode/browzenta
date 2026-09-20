import http, { type Server } from "node:http";

export interface TestServerInstance {
  server: Server;
  url: string;
  port: number;
  close: () => Promise<void>;
}

export const TEST_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Browzenta Test Fixture Application</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 2rem;
      line-height: 1.6;
    }
    header {
      background: #1e293b;
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid #334155;
      margin-bottom: 2rem;
    }
    h1 { color: #38bdf8; font-size: 2rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; font-size: 1rem; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .card {
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .card h2 { color: #e2e8f0; font-size: 1.25rem; margin-bottom: 0.5rem; }

    /* Visual SVG graphic */
    .svg-graphic {
      width: 100%;
      height: 120px;
      margin: 1rem 0;
    }

    form {
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #334155;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-size: 0.875rem; }
    input[type="text"] {
      width: 100%;
      padding: 0.6rem;
      background: #0f172a;
      border: 1px solid #475569;
      border-radius: 4px;
      color: #fff;
    }
    button {
      background: #0284c7;
      color: #fff;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    /* Long content to verify full-page screenshot */
    .tall-content {
      background: #1e293b;
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid #334155;
      height: 1500px;
      margin-bottom: 2rem;
    }
    .footer-note {
      color: #38bdf8;
      font-weight: bold;
    }

    @media (max-width: 640px) {
      body { padding: 1rem; }
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <header>
    <h1 id="main-title">Browzenta Test Fixture</h1>
    <p id="main-desc">A deterministic test fixture page validating browser rendering, viewports, forms, and full-page capture.</p>
  </header>

  <main>
    <div class="grid">
      <div class="card" id="card-responsive">
        <h2>Responsive Layout Card</h2>
        <p>This layout reflows dynamically across mobile, tablet, laptop, and desktop viewports.</p>
        <svg class="svg-graphic" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="120" fill="#0284c7" rx="8"/>
          <circle cx="150" cy="60" r="40" fill="#38bdf8"/>
          <text x="150" y="65" font-family="sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">SVG Graphic</text>
        </svg>
      </div>

      <div class="card" id="card-interactive">
        <h2>Interactive Section</h2>
        <p>Testing buttons, inputs, and form controls.</p>
        <button id="test-btn" type="button">Action Button</button>
      </div>
    </div>

    <form id="test-form">
      <div class="form-group">
        <label for="sample-input">Test Input</label>
        <input type="text" id="sample-input" value="Deterministic Value" readonly />
      </div>
    </form>

    <div class="tall-content" id="scroll-target">
      <h2>Extended Content Block</h2>
      <p>This block extends down 1500px to strictly verify full-page screenshots vs viewport screenshots.</p>
      <div style="margin-top: 1400px;">
        <p class="footer-note" id="deep-content">Bottom content reached via full-page screenshot.</p>
      </div>
    </div>
  </main>
</body>
</html>`;

export async function startTestServer(): Promise<TestServerInstance> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url === "/delayed") {
        // Simulates delayed rendering response
        setTimeout(() => {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(TEST_PAGE_HTML);
        }, 300);
        return;
      }

      if (req.url === "/500") {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(TEST_PAGE_HTML);
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to obtain server address"));
        return;
      }
      const port = address.port;
      const url = `http://127.0.0.1:${port}`;
      resolve({
        server,
        url,
        port,
        close: () =>
          new Promise<void>((closeRes, closeRej) => {
            server.close((err) => (err ? closeRej(err) : closeRes()));
          }),
      });
    });

    server.on("error", reject);
  });
}
