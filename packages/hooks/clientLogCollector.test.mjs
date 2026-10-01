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
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});

test("normalizes blank messages and shares the departure budget across batches and LEAVE", async () => {
  const { sendMonitoringKeepalive } = await import("./monitoringKeepalive.ts");
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const requests = [];
  const pending = [];
  globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    location: { pathname: "/monitoring" },
  };
  globalThis.fetch = (_url, options) => {
    requests.push(options.body);
    return new Promise(resolve => pending.push(() => resolve(new Response(null, { status: 204 }))));
  };
  console.error = () => {};
  const collector = startClientLogCollector("https://api.example.com", () => "session-id");
  const settle = async () => {
    pending.splice(0).forEach(resolve => resolve());
    await new Promise(resolve => setTimeout(resolve, 0));
  };
  try {
    console.error();
    console.error("");
    console.error(" \t\n");
    console.error(new Error(""));
    for (let i = 0; i < 96; i++) console.error("가".repeat(500));
    const leaveBody = JSON.stringify({ event: "LEAVE", sessionId: "session-id" });
    collector.flush(new Blob([leaveBody]).size);
    const leaving = sendMonitoringKeepalive("https://api.example.com/session", leaveBody, "token");
    // Repeated flushes while requests are pending must also honor the shared budget.
    collector.flush();
    const bytes = requests.reduce((total, body) => total + new Blob([body]).size, 0);
    assert.ok(bytes <= 60 * 1024);
    assert.ok(requests.includes(leaveBody));
    const logs = requests.filter(body => body !== leaveBody).flatMap(body => JSON.parse(body).logs);
    assert.deepEqual(
      logs.slice(0, 4).map(log => log.message),
      Array(4).fill("(empty)")
    );
    assert.ok(logs.length < 100);
    await settle();
    await leaving;
    for (let i = 0; i < 3; i++) {
      collector.flush();
      await settle();
    }
    const allLogs = requests.filter(body => body !== leaveBody).flatMap(body => JSON.parse(body).logs);
    assert.equal(allLogs.length, 100);
  } finally {
    await settle();
    collector.dispose();
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});
