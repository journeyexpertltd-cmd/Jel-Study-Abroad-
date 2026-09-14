import fs from 'node:fs';

const path = 'server.ts';
let source = fs.readFileSync(path, 'utf8');
const marker = '// Utility to check if API key exists for UI status indicators';
if (!source.includes(marker)) throw new Error('server insertion marker not found');
if (source.includes('app.post("/api/gemini/live-token"')) {
  console.log('AI Studio Live token route already present');
  process.exit(0);
}

const route = `// Scoped Gemini Live token for AI Studio preview/runtime voice fallback.\napp.post("/api/gemini/live-token", async (req, res) => {\n  const origin = req.get("origin") || "";\n  const host = req.get("host") || "";\n  try {\n    if (origin && new URL(origin).host !== host) {\n      return res.status(403).json({ error: "origin_not_allowed" });\n    }\n  } catch {\n    return res.status(403).json({ error: "origin_not_allowed" });\n  }\n\n  const apiKey = process.env.GEMINI_API_KEY?.trim();\n  if (!apiKey) return res.status(503).json({ error: "live_voice_not_configured" });\n\n  const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();\n  try {\n    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {\n      method: "POST",\n      signal: AbortSignal.timeout(8000),\n      headers: {\n        "Content-Type": "application/json",\n        "x-goog-api-key": apiKey,\n      },\n      body: JSON.stringify({\n        uses: 1,\n        expireTime,\n        liveConnectConstraints: {\n          model: "models/gemini-3.1-flash-live-preview",\n          config: { responseModalities: ["AUDIO"] },\n        },\n      }),\n    });\n\n    if (!upstream.ok) {\n      console.warn("Angela AI Studio Live token status", upstream.status);\n      return res.status(upstream.status === 429 ? 429 : 502).json({\n        error: upstream.status === 429 ? "live_voice_quota_exceeded" : "live_voice_unavailable",\n      });\n    }\n\n    const data: any = await upstream.json();\n    if (!data?.name) return res.status(502).json({ error: "live_voice_unavailable" });\n    res.setHeader("Cache-Control", "no-store");\n    return res.json({ token: data.name, model: "gemini-3.1-flash-live-preview", expiresAt: expireTime });\n  } catch (error: any) {\n    console.warn("Angela AI Studio Live token error", error?.message || "unknown");\n    return res.status(503).json({ error: "live_voice_unavailable" });\n  }\n});\n\n`;

source = source.replace(marker, route + marker);
fs.writeFileSync(path, source, 'utf8');
console.log('Patched AI Studio Live token route');
