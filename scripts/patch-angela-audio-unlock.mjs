import fs from 'node:fs';
const path = 'src/components/AIChatAssistant.tsx';
let s = fs.readFileSync(path, 'utf8');

s = s.replace(
`  const speakText = useCallback(async (text: string, messageId?: string) => {\n    const attempt = ++speechAttemptRef.current;\n    stopServerAudio();`,
`  const speakText = useCallback(async (text: string, messageId?: string) => {\n    // Start Chrome audio activation immediately while the user gesture is still active.\n    const audioUnlockPromise = unlockAudio();\n    const attempt = ++speechAttemptRef.current;\n    stopServerAudio();`
);

s = s.replace(
`      if (!voices.length || (hasBangla && !voices.some(matchesBangla))) {`,
`      // Bangla uses server TTS, so never delay it waiting for a local OS Bengali voice.\n      if (!hasBangla && !voices.length) {`
);

s = s.replace(
`            if (hasBangla ? available.some(matchesBangla) : available.length > 0) finish();`,
`            if (available.length > 0) finish();`
);

s = s.replace(
`          const context = await unlockAudio();`,
`          const context = await audioUnlockPromise;`
);

const oldUnlock = `      if (context.state === \"suspended\") await context.resume();\n      return context;`;
const newUnlock = `      if (context.state === \"suspended\") await context.resume();\n      // A zero-volume Web Audio source started during the click/mic/send gesture\n      // makes later async TTS playback reliable under Chrome autoplay policy.\n      if (context.state === \"running\") {\n        try {\n          const buffer = context.createBuffer(1, 1, 22050);\n          const source = context.createBufferSource();\n          const gain = context.createGain();\n          gain.gain.value = 0;\n          source.buffer = buffer;\n          source.connect(gain);\n          gain.connect(context.destination);\n          source.start(0);\n        } catch { /* audio context is already usable */ }\n      }\n      return context;`;
s = s.replace(oldUnlock, newUnlock);

if (!s.includes('const audioUnlockPromise = unlockAudio();')) throw new Error('speakText unlock patch failed');
if (!s.includes('if (!hasBangla && !voices.length)')) throw new Error('Bangla local voice wait patch failed');
if (!s.includes('const context = await audioUnlockPromise;')) throw new Error('Web Audio reuse patch failed');
fs.writeFileSync(path, s, 'utf8');
