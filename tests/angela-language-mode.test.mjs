import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync('src/components/AIChatAssistant.tsx', 'utf8');
const server = fs.readFileSync('server.ts', 'utf8');
const pagesChat = fs.readFileSync('functions/api/gemini/chat.ts', 'utf8');

test('Angela production UI is Bangla-only', () => {
  assert.match(component, /useState<"en" \| "bn">\("bn"\)/);
  assert.match(component, /data-language-contract="bangla-only"/);
  assert.doesNotMatch(component, /changeLanguage\("en"\)/);
  assert.doesNotMatch(component, />EN<\/button>/);
  assert.match(component, /recognition\.lang = languageMode === "bn" \? "bn-BD" : "en-US"/);
  assert.match(pagesChat, /Angela is Bangla-only in production/);
  assert.match(pagesChat, /const bn = true/);
});

test('Angela uses browser speech recognition before free cloud transcription', () => {
  assert.match(component, /FREE_VOICE_INPUT_PRIMARY/);
  assert.match(component, /if \(SpeechRec\) \{\s*startBrowserRecognitionFallback\(\);\s*return;/s);
  assert.match(component, /MediaRecorder/);
  assert.match(component, /mode: "transcribe"/);
});

test('Angela prioritizes a localized female voice without allowing cloud quota to mute the assistant', () => {
  assert.match(component, /BANGLA_FEMALE_HINTS/);
  assert.match(component, /BANGLA_MALE_HINTS/);
  assert.match(component, /pickAngelaDeviceVoice/);
  assert.match(component, /cloud female primary; device voice fallback/);
  assert.match(server, /voiceName: "Kore"/);
  assert.match(server, /Never return Hindi, Arabic, or any third language/);
});

test('Angela fallback brain covers the full JEL service catalogue', () => {
  for (const marker of ['asksTicket', 'asksVisa', 'asksHajj', 'asksTour', 'asksMedical', 'asksHalal', 'asksCorporate', 'asksInsurance', 'asksCompany', 'asksBrand']) {
    assert.match(pagesChat, new RegExp(marker));
  }
  assert.match(pagesChat, /Journey Expert Limited বাংলাদেশের একটি travel ও education service company/);
});
