import fs from 'node:fs';

const path = 'src/components/AIChatAssistant.tsx';
let s = fs.readFileSync(path, 'utf8');

const oldText = `      if (attempt !== speechAttemptRef.current || !enabledRef.current) return;\n      if (hasBangla) {\n        currentUtteranceRef.current = null;`;

const newText = `      if (attempt !== speechAttemptRef.current || !enabledRef.current) return;\n      if (hasBangla) {\n        // Prefer a browser-native Bengali voice when one is installed.\n        // This keeps Bangla responsive without spending a Gemini TTS request on every reply.\n        const localBanglaVoice = voices.find(matchesBangla);\n        if (localBanglaVoice) {\n          utterance.voice = localBanglaVoice;\n          utterance.lang = localBanglaVoice.lang;\n          currentUtteranceRef.current = utterance;\n          utterance.onstart = () => {\n            if (currentUtteranceRef.current !== utterance) return;\n            setVoiceState(\"SPEAKING\");\n            setErrorMessage(null);\n            if (messageId) setActiveSpeakingId(messageId);\n          };\n          utterance.onend = () => {\n            if (currentUtteranceRef.current !== utterance) return;\n            currentUtteranceRef.current = null;\n            setVoiceState(\"READY\");\n            setActiveSpeakingId(null);\n          };\n          utterance.onerror = (event) => {\n            if (currentUtteranceRef.current !== utterance) return;\n            currentUtteranceRef.current = null;\n            setActiveSpeakingId(null);\n            if (event.error === \"canceled\" || event.error === \"interrupted\") {\n              setVoiceState(\"READY\");\n              return;\n            }\n            setVoiceState(\"ERROR\");\n            setErrorMessage(\"বাংলা কণ্ঠ চালানো যায়নি। Listen চেপে আবার চেষ্টা করুন।\");\n          };\n          window.speechSynthesis.speak(utterance);\n          return;\n        }\n\n        // No browser Bengali voice: keep the verified Gemini WAV path as fallback.\n        currentUtteranceRef.current = null;`;

if (s.includes(newText)) {
  console.log('Bangla voice reliability patch already applied.');
  process.exit(0);
}
if (!s.includes(oldText)) throw new Error('Bangla voice patch target not found');
s = s.replace(oldText, newText);
fs.writeFileSync(path, s, 'utf8');
console.log('Bangla voice reliability patch applied.');
