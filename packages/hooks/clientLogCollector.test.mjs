import { test } from "node:test";
import assert from "node:assert/strict";
import { startClientLogCollector } from "./clientLogCollector.ts";
import { ensureCsrfToken, invalidateCsrfToken } from "./csrfToken.ts";

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
    if (_url.endsWith("/csrf")) return Response.json({ token: "test-csrf" });
    assert.equal(options.headers["X-XSRF-TOKEN"], "test-csrf");
    requests.push(JSON.parse(options.body));
    return new Response(null, { status: 204 });
  };
  console.error = () => {};

  const collector = startClientLogCollector("https://api.example.com", () => "session-id");

  try {
    invalidateCsrfToken();
    await ensureCsrfToken("https://api.example.com");
    console.error("Authorization: Basic dXNlcjpwYXNzd29yZA== apiKey=private-api-key api_key=private-api_key");
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
    invalidateCsrfToken();
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});

test("keeps exit logs buffered until a CSRF token is available", async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const requests = [];
  globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    location: { pathname: "/monitoring" },
  };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith("/csrf")) return Response.json({ token: "test-csrf" });
    return new Response(null, { status: 204 });
  };
  console.error = () => {};
  invalidateCsrfToken();
  const collector = startClientLogCollector("https://api.example.com", () => "session-id");
  try {
    console.error("retained log");
    collector.flush();
    assert.equal(requests.length, 0);
    await ensureCsrfToken("https://api.example.com");
    collector.flush();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(requests.length, 2);
    assert.equal(requests[1].options.headers["X-XSRF-TOKEN"], "test-csrf");
    assert.equal(JSON.parse(requests[1].options.body).logs[0].message, "retained log");
  } finally {
    collector.dispose();
    invalidateCsrfToken();
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});
