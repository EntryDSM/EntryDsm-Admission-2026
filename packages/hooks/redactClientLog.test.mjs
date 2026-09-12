import { test } from "node:test";
import assert from "node:assert/strict";
import { redactClientLog } from "./redactClientLog.ts";

const cases = [
  ["JSON token", '{"token":"private-token","status":"failed"}', ["private-token"]],
  ["JSON escaped quote", String.raw`{"password":"private\"remaining","status":"failed"}`, ["private", "remaining"]],
  [
    "nested JSON",
    '{"data":{"authorization":"private-auth","secret":"private-secret"}}',
    ["private-auth", "private-secret"],
  ],
  ["single quotes", "{'password': 'private-password'}", ["private-password"]],
  ["plain assignment", 'token=private-token password="private password"', ["private-token", "private password"]],
  ["URL credentials", "https://private-user:private-password@example.com/path", ["private-user", "private-password"]],
  [
    "encoded URL credentials",
    "https://private%40user:private%3Apassword@example.com/path",
    ["private%40user", "private%3Apassword"],
  ],
  [
    "URL query and fragment",
    "https://private-user:private-password@example.com/path?key=private-query#private-fragment",
    ["private-user", "private-password", "private-query", "private-fragment"],
  ],
  [
    "stack URL",
    "at handler (https://private-user:private-password@example.com/app.js:12:3)",
    ["private-user", "private-password"],
  ],
];
for (const [name, input, secrets] of cases) {
  test(name, () => {
    const result = redactClientLog(input);
    for (const secret of secrets) assert.ok(!result.includes(secret), `${name}: secret must be removed`);
    assert.ok(result.includes("[REDACTED]"));
  });
}
test("preserves diagnostic text and ordinary URL", () => {
  const input = "TypeError at https://example.com/app.js:12:3";
  assert.equal(redactClientLog(input), input);
});
