// Proxy between the Successful Students page and the Claude API.
// Secrets live in Netlify environment variables, never in the page.
const hits = new Map(); // best-effort per-IP limit; resets when the function restarts
exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  if (!process.env.ANTHROPIC_API_KEY || !process.env.ACCESS_CODE) return json(500, { error: "Server not configured" });
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "Bad request" }); }
  if (typeof body.code !== "string" || body.code !== process.env.ACCESS_CODE) return json(401, { error: "Wrong access code" });
  const h = event.headers || {};
  const ip = String(h["x-nf-client-connection-ip"] || h["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  if (recent.length >= 20) return json(429, { error: "Too many requests" });
  recent.push(now);
  hits.set(ip, recent);
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-6) : [];
  const valid = msgs.length > 0 && msgs.every((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
  const size = msgs.reduce((n, m) => n + (m.content || "").length, 0);
  if (!valid || msgs[msgs.length - 1].role !== "user" || size > 14000) return json(400, { error: "Invalid or too long" });
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.COACH_MODEL || "claude-haiku-5-5", max_tokens: 1000, messages: msgs })
    });
    if (!res.ok) return json(502, { error: "Upstream error " + res.status });
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return json(200, { text, truncated: data.stop_reason === "max_tokens" });
  } catch (e) { return json(502, { error: "Request failed" }); }
};
