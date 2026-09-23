import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';

const candidates = ['src/components/AIChatAssistant.tsx', 'src/components/FreeVoiceAngelaWidget.tsx'];
let source;
for (const path of candidates) {
  try { source = readFileSync(new URL('../' + path, import.meta.url), 'utf8'); break; } catch {}
}
assert.ok(source, 'Angela widget source is present');
const bd = source.includes('function pickAngelaDeviceVoice');
const start = source.indexOf(bd ? 'const BANGLA_FEMALE_HINTS' : 'const FEMALE_VOICE_HINTS');
const end = source.indexOf(bd ? '// Voice States' : 'function getFallbackReply', start);
const selector = bd ? 'pickAngelaDeviceVoice' : 'getPreferredFemaleVoice';
const context = vm.createContext({});
vm.runInContext(stripTypeScriptTypes(source.slice(start, end)) + '\nthis.select = ' + selector, context);
const voice = (name, lang, isDefault = false) => ({ name, lang, default: isDefault, localService: true });

for (const name of ['Google UK English Female', 'Samantha', 'English Woman', 'Microsoft Zira']) {
  test('accepts known English female voice: ' + name, () => {
    const expected = voice(name, 'en-US');
    assert.equal(context.select([voice('Microsoft David', 'en-US', true), expected], 'en'), expected);
  });
}
for (const name of ['Bengali Female', 'Bengali Woman', 'Microsoft Nabanita']) {
  test('accepts known Bangla female voice: ' + name, () => {
    const expected = voice(name, 'bn-BD');
    assert.equal(context.select([voice('Pradeep', 'bn-IN', true), expected], 'bn'), expected);
  });
}
test('never selects male, unknown, or wrong-language voices', () => {
  assert.equal(context.select([voice('Microsoft David', 'en-US'), voice('English Male', 'en-US'), voice('Default', 'en-US', true), voice('Samantha', 'fr-FR')], 'en'), null);
  assert.equal(context.select([voice('Pradeep', 'bn-IN'), voice('Bengali Male', 'bn-BD'), voice('Default', 'bn-BD', true), voice('Samantha', 'en-US')], 'bn'), null);
});
test('prefers bn-BD to bn-IN without relying on catalogue order', () => {
  const expected = voice('Nabanita', 'bn-BD');
  assert.equal(context.select([voice('Tanishaa', 'bn-IN', true), expected], 'bn'), expected);
});
