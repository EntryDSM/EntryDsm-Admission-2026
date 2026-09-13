import { test } from "node:test";
import assert from "node:assert/strict";
import { startClientLogCollector } from "./clientLogCollector.ts";

test("redacts Basic Authorization and apiKey values before client log collection", async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const requests = [];

  globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    location: { pathname: "/monitoring" },
  };
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return new Response(null, { status: 204 });
  };
  console.error = () => {};

  const collector = startClientLogCollector("https://api.example.com", () => "session-id");

  try {
    console.error(
      "Authorization: Basic dXNlcjpwYXNzd29yZA== apiKey=private-api-key api_key=private-api_key"
    );
    collector.flush();
    await new Promise(resolve => setTimeout(resolve, 0));

    const collectedLog = JSON.stringify(requests[0]);
    assert.ok(!collectedLog.includes("Basic"));
    assert.ok(!collectedLog.includes("dXNlcjpwYXNzd29yZA=="));
    assert.ok(!collectedLog.includes("private-api-key"));
    assert.ok(!collectedLog.includes("private-api_key"));
    assert.ok(collectedLog.includes("[REDACTED]"));
  } finally {
    collector.dispose();
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});
