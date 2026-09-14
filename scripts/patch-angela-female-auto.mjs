import fs from 'node:fs';

const path = 'src/components/AIChatAssistant.tsx';
let s = fs.readFileSync(path, 'utf8');

// 1) Track the last language inferred in Auto mode for the next microphone turn.
const refOld = '  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);\n';
const refNew = '  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);\n  const autoRecognitionLangRef = useRef<"bn-BD" | "en-US">("bn-BD");\n';
if (!s.includes('autoRecognitionLangRef')) {
  if (!s.includes(refOld)) throw new Error('recognition ref target not found');
  s = s.replace(refOld, refNew);
}

// 2) In Auto mode infer the request language from the actual transcript, not merely the UI label.
const trimOld = '    const trimmed = textToSend.trim();\n    if (!trimmed) return;\n';
const trimNew = `    const trimmed = textToSend.trim();\n    if (!trimmed) return;\n    const inputHasBangla = /[\\u0980-\\u09FF]/.test(trimmed);\n    const inputLooksBanglish = /\\b(ami|amar|amake|apni|apnar|tumi|tomar|chai|jabo|jete|koto|kivabe|ki|keno|kobe|hobe|korbo|korte|lagbe|apnader|kothay|banglay|bolen|diben|pari|parbo|porte|bidesh|visa|student|university|ticket|flight|masters|bachelor|admission|scholarship)\\b/i.test(trimmed);\n    const inferredAutoLanguage = inputHasBangla || inputLooksBanglish ? "bn" : "en";\n    if (languageMode === "auto") autoRecognitionLangRef.current = inferredAutoLanguage === "bn" ? "bn-BD" : "en-US";\n`;
if (!s.includes('const inferredAutoLanguage')) {
  if (!s.includes(trimOld)) throw new Error('handleSend trim target not found');
  s = s.replace(trimOld, trimNew);
}

const bodyOld = '          language: languageMode \n';
const bodyNew = '          language: languageMode === "auto" ? inferredAutoLanguage : languageMode \n';
if (s.includes(bodyOld)) s = s.replace(bodyOld, bodyNew);
else if (!s.includes('language: languageMode === "auto" ? inferredAutoLanguage : languageMode')) throw new Error('request language target not found');

// 3) Auto microphone uses the most recently inferred language, starting in Bangla for Bangladesh users.
const recogOld = `      } else {\n        // In auto mode, default to bn-BD which also handles English words gracefully\n        recognition.lang = "bn-BD";\n      }`;
const recogNew = `      } else {\n        // Auto mode remembers the language inferred from the latest transcript.\n        // Start with Bangla, then switch between bn-BD and en-US as the conversation changes.\n        recognition.lang = autoRecognitionLangRef.current;\n      }`;
if (s.includes(recogOld)) s = s.replace(recogOld, recogNew);
else if (!s.includes('recognition.lang = autoRecognitionLangRef.current')) throw new Error('auto recognition target not found');

// 4) Remove browser-native Bengali voice as primary; it can vary by OS and may be male.
const localStart = '        // Prefer a browser-native Bengali voice when one is installed.\n';
const localEnd = '        // No browser Bengali voice: keep the verified Gemini WAV path as fallback.\n';
if (s.includes(localStart)) {
  const a = s.indexOf(localStart);
  const b = s.indexOf(localEnd, a);
  if (b < 0) throw new Error('local Bengali voice block end not found');
  s = s.slice(0, a) + '        // Use JEL server TTS for a consistent Angela voice across every browser and OS.\n' + s.slice(b + localEnd.length);
}

// 5) Route every spoken response (Bangla and English) through the same server TTS voice.
const allVoiceOld = '      if (hasBangla) {\n        // Use JEL server TTS for a consistent Angela voice across every browser and OS.\n';
const allVoiceNew = '      if (cleanSpeech) {\n        // Use JEL server TTS for a consistent Angela voice across every browser and OS.\n';
if (s.includes(allVoiceOld)) s = s.replace(allVoiceOld, allVoiceNew);
else if (!s.includes('if (cleanSpeech) {\n        // Use JEL server TTS for a consistent Angela voice')) throw new Error('all-language server TTS target not found');

// 6) If both server TTS models fail, never fall back to an unpredictable/male OS voice.
const catchStart = '        } catch (error) {\n          if (attempt !== speechAttemptRef.current || !enabledRef.current) return;\n          stopServerAudio(); setActiveSpeakingId(null);\n\n          // Keep Angela audible when Gemini TTS is quota-limited or temporarily unavailable.\n';
if (s.includes(catchStart)) {
  const start = s.indexOf(catchStart);
  const endMarker = '          window.speechSynthesis.speak(utterance);\n          return;\n';
  const end = s.indexOf(endMarker, start);
  if (end < 0) throw new Error('browser fallback end not found');
  const replacement = `        } catch (error) {\n          if (attempt !== speechAttemptRef.current || !enabledRef.current) return;\n          stopServerAudio();\n          setActiveSpeakingId(null);\n          currentUtteranceRef.current = null;\n          setVoiceState("ERROR");\n          setErrorMessage(hasBangla\n            ? "Angela-র বাংলা female voice সাময়িকভাবে পাওয়া যাচ্ছে না। লেখা উত্তর চালু আছে—একটু পর Listen চাপুন।"\n            : "Angela female voice is temporarily unavailable. Text chat is still active—please try Listen again shortly.");\n          console.warn("Angela server voice unavailable", error);\n          return;\n`;
  s = s.slice(0, start) + replacement + s.slice(end + endMarker.length);
}

fs.writeFileSync(path, s, 'utf8');
console.log('Angela female-only server voice and Auto language patch applied.');
