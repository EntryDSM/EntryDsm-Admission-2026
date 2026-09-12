interface ClientLog {
  level: "ERROR" | "WARN";
  source: "DOM" | "PROMISE" | "CONSOLE";
  message: string;
  stack?: string;
  pageUrl: string;
  occurredAt: string;
}

// Never serialize arbitrary objects (request headers, response bodies, form values).
const redact = (text: string) =>
  text
    .replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/gi, "$1[REDACTED]")
    .replace(/\bBearer\s+[^\s,;]+/gi, "Bearer [REDACTED]")
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[REDACTED]")
    .replace(
      /((?:password|passwd|token|authorization|cookie|secret|email|phone|userId|applicantId)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      "$1[REDACTED]"
    )
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[REDACTED]")
    .replace(/\b\d{2,3}[- .]?\d{3,4}[- .]?\d{4}\b/g, "[REDACTED]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, "[REDACTED]");

const describe = (value: unknown): string => {
  try {
    return redact(
      value instanceof Error ? value.message : typeof value === "string" ? value : "[Non-text value omitted]"
    );
  } catch {
    return "[Unreadable error]";
  }
};

interface QueuedLog {
  log: ClientLog;
  sessionId: string | null;
}

export const startClientLogCollector = (apiBaseUrl: string, getSessionId: () => string | null) => {
  const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/api/monitor/v11/collect/client-log`;
  let buffer: QueuedLog[] = [];
  let sending = 0;
  let disposed = false;
  const send = async (sessionId: string, entries: QueuedLog[], beacon: boolean) => {
    const body = JSON.stringify({ sessionId, logs: entries.map(entry => entry.log) });
    sending++;
    const retry = () => {
      if (!disposed) buffer = [...entries, ...buffer].slice(0, 100);
    };
    try {
      if (beacon && navigator.sendBeacon?.(endpoint, new Blob([body], { type: "application/json" }))) return;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
        keepalive: beacon,
      });
      if (response.status === 429 || response.status >= 500) retry();
    } catch {
      retry();
    } finally {
      sending--;
    }
  };
  const flush = (beacon = false) => {
    const currentSessionId = getSessionId();
    if ((!currentSessionId && !buffer[0]?.sessionId) || (!beacon && sending)) return;
    // Bind before asynchronous sends so retries cannot move logs into a new session.
    buffer.forEach(entry => {
      entry.sessionId ??= currentSessionId;
    });
    do {
      const sessionId = buffer[0]?.sessionId;
      if (!sessionId) break;
      const entries: QueuedLog[] = [];
      while (buffer.length && entries.length < 20 && buffer[0]?.sessionId === sessionId) {
        const candidate = buffer[0]!;
        if (
          new Blob([JSON.stringify({ sessionId, logs: [...entries, candidate].map(entry => entry.log) })]).size >
          60 * 1024
        )
          break;
        entries.push(buffer.shift()!);
      }
      if (!entries.length) break;
      void send(sessionId, entries, beacon);
    } while (beacon && buffer.length);
  };
  const record = (source: ClientLog["source"], values: unknown[], level: ClientLog["level"] = "ERROR") => {
    if (disposed) return;
    const error = values.find(value => value instanceof Error) as Error | undefined;
    buffer.push({
      sessionId: getSessionId(),
      log: {
        level,
        source,
        message: values.map(describe).join(" ").slice(0, 500),
        stack: error?.stack ? redact(error.stack).split("\n").slice(1).join("\n").slice(0, 2000) : undefined,
        pageUrl: redact(window.location.pathname)
          .replace(/\/[^/]*\d[^/]*/g, "/[REDACTED]")
          .slice(0, 2000),
        occurredAt: new Date().toISOString(),
      },
    });
    buffer = buffer.slice(0, 100);
  };
  const onError = (event: ErrorEvent) => record("DOM", [event.error ?? event.message]);
  const onRejection = (event: PromiseRejectionEvent) => record("PROMISE", [event.reason]);
  const originalError = console.error;
  const originalWarn = console.warn;
  const wrappedError = (...args: unknown[]) => {
    originalError.apply(console, args);
    record("CONSOLE", args);
  };
  const wrappedWarn = (...args: unknown[]) => {
    originalWarn.apply(console, args);
    record("CONSOLE", args, "WARN");
  };
  console.error = wrappedError;
  console.warn = wrappedWarn;
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  const timer = setInterval(() => void flush(), 5000);
  return {
    flush: () => {
      void flush(true);
    },
    dispose: () => {
      disposed = true;
      clearInterval(timer);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      if (console.error === wrappedError) console.error = originalError;
      if (console.warn === wrappedWarn) console.warn = originalWarn;
    },
  };
};
