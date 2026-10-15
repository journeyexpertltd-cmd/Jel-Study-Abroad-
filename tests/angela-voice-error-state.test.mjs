import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Angela playback failures become visible in the assistant UI', async () => {
  const source = await readFile(new URL('../src/components/AIChatAssistant.tsx', import.meta.url), 'utf8');
  assert.ok(source.includes('setVoiceState("ERROR");\n      setActiveSpeakingId(null);\n      setErrorMessage(voiceErrorMessage(error));'));
});
