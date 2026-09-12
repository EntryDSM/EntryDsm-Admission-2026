// Never serialize arbitrary objects (request headers, response bodies, form values).
export const redactClientLog = (text: string) =>
  text
    // Strip URL credentials before email masking or query/fragment removal.
    .replace(/(https?:\/\/)[^\s/?#@]*@/gi, "$1[REDACTED]@")
    .replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/gi, "$1[REDACTED]")
    .replace(/\bBearer\s+[^\s,;]+/gi, "Bearer [REDACTED]")
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[REDACTED]")
    .replace(
      /((?:password|passwd|token|authorization|cookie|secret|email|phone|userId|applicantId)["']?\s*[=:]\s*)(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s,;}]+)/gi,
      "$1[REDACTED]"
    )
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[REDACTED]")
    .replace(/\b\d{2,3}[- .]?\d{3,4}[- .]?\d{4}\b/g, "[REDACTED]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, "[REDACTED]");
