import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync('src/components/AIChatAssistant.tsx', 'utf8');
const server = fs.readFileSync('server.ts', 'utf8');

test('Angela exposes only explicit Bangla and English modes', () => {
  assert.match(component, /useState<"en" \| "bn">\("bn"\)/);
  assert.doesNotMatch(component, /changeLanguage\("auto"\)/);
  assert.doesNotMatch(component, /languageMode === "auto"/);
  assert.match(component, /recognition\.lang = languageMode === "bn" \? "bn-BD" : "en-US"/);
});

test('Angela prioritizes a localized female voice without allowing cloud quota to mute the assistant', () => {
  assert.match(component, /BANGLA_FEMALE_HINTS/);
  assert.match(component, /BANGLA_MALE_HINTS/);
  assert.match(component, /pickAngelaDeviceVoice/);
  assert.match(component, /DEVICE_FIRST_ANGELA_VOICE/);
  assert.match(server, /voiceName: "Kore"/);
  assert.match(server, /Never return Hindi, Arabic, or any third language/);
});
