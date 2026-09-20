import test from "node:test";
import assert from "node:assert/strict";

test("server.ts Angela chat responds correctly to Banglish input", async () => {
  const res = await fetch("http://localhost:3000/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "ami UK te study korte chai", language: "auto" })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.language, "bn");
  assert.ok(data.reply && data.reply.length > 0);
  // Must have Bengali characters
  assert.ok(/[\u0980-\u09FF]/.test(data.reply), "Reply must be in Bengali script");
});

test("server.ts Angela chat responds correctly to English input", async () => {
  const res = await fetch("http://localhost:3000/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "What are the visa requirements for Canada?", language: "en" })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.language, "en");
  assert.ok(data.reply && data.reply.length > 0);
});

test("server.ts Angela speech endpoint produces valid WAV audio", async () => {
  const res = await fetch("http://localhost:3000/angela/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "আসসালামু আলাইকুম" })
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "audio/wav");
  const buffer = Buffer.from(await res.arrayBuffer());
  assert.ok(buffer.length > 44);
  assert.equal(buffer.toString("utf8", 0, 4), "RIFF");
  assert.equal(buffer.toString("utf8", 8, 12), "WAVE");
});
