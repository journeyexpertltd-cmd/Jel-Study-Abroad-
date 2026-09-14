import fs from 'node:fs';

const path = 'src/components/AIChatAssistant.tsx';
let s = fs.readFileSync(path, 'utf8');

// 1) Remove browser-native Bengali voice as the primary path. Server TTS must be first.
s = s.replace(
  /        \/\/ Prefer a browser-native Bengali voice when one is installed\.[\s\S]*?          window\.speechSynthesis\.speak\(utterance\);\n          return;\n        }\n\n        \/\/ No browser Bengali voice: keep the verified Gemini WAV path as fallback\.\n/,
  '        // Use the fixed server TTS voice first for Bengali so Auto/Bangla never picks a random local male voice.\n'
);

// 2) Restrict Bengali browser fallback to likely female voices; never silently choose a random male voice.
const oldFallback = `          // Keep Angela audible when Gemini TTS is quota-limited or temporarily unavailable.\n          const browserVoice = voices.find(matchesBangla);\n          if (browserVoice) {\n            utterance.voice = browserVoice;\n            utterance.lang = browserVoice.lang;\n          } else {\n            // Let the browser choose its best Bengali-capable voice if no explicit match is exposed.\n            utterance.lang = \"bn-BD\";\n          }\n          currentUtteranceRef.current = utterance;`;
const newFallback = `          // Emergency fallback: use only a likely female Bengali system voice.\n          // If one is not available, do not substitute a random male voice.\n          const browserVoice = voices.find((voice) =>\n            matchesBangla(voice) && /nabanita|female|woman|zira|aria|jenny|sonia|samantha|victoria|karen|moira|fiona|ava|allison|susan|kathy/i.test(voice.name)\n          );\n          if (!browserVoice) {\n            currentUtteranceRef.current = null;\n            setVoiceState(\"ERROR\");\n            setErrorMessage(\"বাংলা কণ্ঠটি সাময়িকভাবে পাওয়া যাচ্ছে না। একটু পরে Listen চাপুন।\");\n            return;\n          }\n          utterance.voice = browserVoice;\n          utterance.lang = browserVoice.lang;\n          currentUtteranceRef.current = utterance;`;
if (!s.includes(newFallback)) {
  if (!s.includes(oldFallback)) throw new Error('Bengali fallback target not found');
  s = s.replace(oldFallback, newFallback);
}

// 3) Tell the backend when the message came from voice recognition.
const oldBody = `          messages: historyContext,\n          language: languageMode \n`;
const newBody = `          messages: historyContext,\n          language: languageMode,\n          source: triggeredByVoice ? \"voice\" : \"text\"\n`;
if (!s.includes(newBody)) {
  if (!s.includes(oldBody)) throw new Error('Chat request body target not found');
  s = s.replace(oldBody, newBody);
}

// 4) Adapt Auto recognition locale for the next voice turn based on the prior transcript.
const enabledMarker = `  const enabledRef = useRef(isVoiceEnabled);\n`;
const autoRef = `  const autoRecognitionLangRef = useRef<\"bn-BD\" | \"en-US\">(\"bn-BD\");\n`;
if (!s.includes(autoRef)) {
  if (!s.includes(enabledMarker)) throw new Error('enabledRef marker not found');
  s = s.replace(enabledMarker, enabledMarker + autoRef);
}

const oldAutoLang = `      } else {\n        // In auto mode, default to bn-BD which also handles English words gracefully\n        recognition.lang = \"bn-BD\";\n      }`;
const newAutoLang = `      } else {\n        // Web Speech API has no true multilingual auto-detect. Adapt from the last successful Auto transcript.\n        recognition.lang = autoRecognitionLangRef.current;\n      }`;
if (!s.includes(newAutoLang)) {
  if (!s.includes(oldAutoLang)) throw new Error('Auto recognition language target not found');
  s = s.replace(oldAutoLang, newAutoLang);
}

const oldOnEnd = `        if (spoken) {\n          handleSendMessage(spoken, true);\n        } else {`;
const newOnEnd = `        if (spoken) {\n          if (languageMode === \"auto\") {\n            const transcriptHasBangla = /[\\u0980-\\u09FF]/.test(spoken);\n            const transcriptLooksBanglish = /\\b(ami|amar|amake|apni|apnar|tumi|tomar|chai|jabo|jete|koto|kivabe|ki|keno|kobe|hobe|korbo|korte|lagbe|bolen|diben|pari|parbo|porte|bidesh)\\b/i.test(spoken);\n            autoRecognitionLangRef.current = transcriptHasBangla || transcriptLooksBanglish ? \"bn-BD\" : \"en-US\";\n          }\n          handleSendMessage(spoken, true);\n        } else {`;
if (!s.includes(newOnEnd)) {
  if (!s.includes(oldOnEnd)) throw new Error('recognition onend target not found');
  s = s.replace(oldOnEnd, newOnEnd);
}

fs.writeFileSync(path, s, 'utf8');
console.log('Angela language/voice patch applied');
