const base = process.argv[2] || 'https://journeyexpertbd.com';
const origin = new URL(base).origin;
const text = 'হ্যালো, আমি অ্যাঞ্জেলা।';

async function primary() {
  const response = await fetch(origin + '/api/angela/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) return { ok: false, status: response.status };
  const type = response.headers.get('content-type') || '';
  const bytes = new Uint8Array(await response.arrayBuffer());
  const riff = new TextDecoder().decode(bytes.slice(0, 4));
  if (!type.includes('audio/wav') || bytes.byteLength < 1000 || riff !== 'RIFF') {
    throw new Error('Primary female TTS returned invalid audio');
  }
  console.log('BD primary Gemini female TTS passed');
  return { ok: true, status: 200 };
}

async function liveFallback() {
  const tokenResponse = await fetch(origin + '/api/gemini/live-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
  });
  if (!tokenResponse.ok) throw new Error('Live token failed: ' + tokenResponse.status);
  const tokenData = await tokenResponse.json();
  if (!tokenData.token || !tokenData.model) throw new Error('Live token payload invalid');

  await new Promise((resolve, reject) => {
    const wsUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=' + encodeURIComponent(tokenData.token);
    const socket = new WebSocket(wsUrl);
    let audioBytes = 0;
    let sent = false;
    let settled = false;

    const timer = setTimeout(() => fail(new Error('Live female audio timeout')), 15000);
    const cleanup = () => { clearTimeout(timer); try { socket.close(); } catch {} };
    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const pass = () => {
      if (settled) return;
      if (audioBytes < 1000) return fail(new Error('Live female audio too small'));
      settled = true;
      cleanup();
      console.log('BD Gemini Live Aoede female audio fallback passed');
      resolve();
    };

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({
        setup: {
          model: 'models/' + tokenData.model,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
          },
          systemInstruction: {
            parts: [{ text: 'Speak the supplied transcript verbatim in the same language. Do not add words.' }],
          },
        },
      }));
    });

    socket.addEventListener('message', async (event) => {
      try {
        let raw;
        if (typeof event.data === 'string') raw = event.data;
        else if (event.data instanceof Blob) raw = await event.data.text();
        else if (event.data instanceof ArrayBuffer) raw = new TextDecoder().decode(event.data);
        else raw = String(event.data);
        const message = JSON.parse(raw);

        if (message.setupComplete && !sent) {
          sent = true;
          socket.send(JSON.stringify({
            clientContent: {
              turns: [{
                role: 'user',
                parts: [{ text: 'Speak this transcript exactly as written:\n' + text }],
              }],
              turnComplete: true,
            },
          }));
          return;
        }

        const parts = message.serverContent?.modelTurn?.parts || [];
        for (const part of parts) {
          if (part?.inlineData?.data) audioBytes += Buffer.from(part.inlineData.data, 'base64').byteLength;
        }
        if (message.serverContent?.generationComplete || message.serverContent?.turnComplete) pass();
      } catch (error) {
        fail(error);
      }
    });

    socket.addEventListener('error', () => fail(new Error('Live female WebSocket failed')));
    socket.addEventListener('close', () => {
      if (!settled && audioBytes >= 1000) pass();
      else if (!settled) fail(new Error('Live female WebSocket closed without audio'));
    });
  });
}

const result = await primary();
if (!result.ok) {
  if (![429, 502, 503, 424].includes(result.status)) {
    throw new Error('Unexpected primary TTS status: ' + result.status);
  }
  console.log('BD primary TTS unavailable (' + result.status + '); testing verified Live female fallback');
  await liveFallback();
}
