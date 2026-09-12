interface ClientLog {
  level: "ERROR" | "WARN";
  source: "DOM" | "PROMISE" | "CONSOLE";
  message: string;
  stack?: string;
  pageUrl: string;
  occurredAt: string;
}

const describe = (value: unknown): string => {
  try {
    return value instanceof Error
      ? value.message
      : typeof value === "string"
        ? value
        : (JSON.stringify(value) ?? String(value));
  } catch {
    return "[Unserializable error]";
  }
};

export const startClientLogCollector = (apiBaseUrl: string, getSessionId: () => string | null) => {
  const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/api/monitor/v11/collect/client-log`;
  let buffer: ClientLog[] = [];
  let sending = false;
  let disposed = false;
  const flush = async (beacon = false) => {
    const sessionId = getSessionId();
    if (!sessionId || !buffer.length || (!beacon && sending)) return;
    const logs: ClientLog[] = [];
    while (buffer.length && logs.length < 20) {
      const candidate = buffer[0]!;
      if (new Blob([JSON.stringify({ sessionId, logs: [...logs, candidate] })]).size > 60 * 1024) break;
      logs.push(buffer.shift()!);
    }
    if (!logs.length) return;
    const body = JSON.stringify({ sessionId, logs });
    if (beacon && navigator.sendBeacon?.(endpoint, new Blob([body], { type: "application/json" }))) return;
    sending = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
        keepalive: beacon,
      });
      if (!response.ok && !disposed && (response.status === 429 || response.status >= 500)) {
        buffer = [...logs, ...buffer].slice(-100);
      }
    } catch {
      if (!disposed) buffer = [...logs, ...buffer].slice(-100);
    } finally {
      sending = false;
    }
  };
  const record = (source: ClientLog["source"], values: unknown[], level: ClientLog["level"] = "ERROR") => {
    if (disposed) return;
    const error = values.find(value => value instanceof Error) as Error | undefined;
    buffer.push({
      level,
      source,
      message: values.map(describe).join(" ").slice(0, 500),
      stack: error?.stack?.slice(0, 2000),
      pageUrl: window.location.pathname.slice(0, 2000),
      occurredAt: new Date().toISOString(),
    });
    buffer = buffer.slice(-100);
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
