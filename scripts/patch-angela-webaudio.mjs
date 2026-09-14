import fs from 'node:fs';

const path = 'src/components/AIChatAssistant.tsx';
let s = fs.readFileSync(path, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (s.includes(newText)) return;
  if (!s.includes(oldText)) throw new Error(`Patch target not found: ${label}`);
  s = s.replace(oldText, newText);
}

replaceOnce(
`  const serverAudioRef = useRef<HTMLAudioElement | null>(null);\n  const stopServerAudio = () => {\n    serverSpeechRef.current?.abort();\n    serverSpeechRef.current = null;\n    const audio = serverAudioRef.current;\n    if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); URL.revokeObjectURL(audio.src); }\n    serverAudioRef.current = null;\n  };`,
`  const serverAudioRef = useRef<HTMLAudioElement | null>(null);\n  const serverAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);\n  const audioContextRef = useRef<AudioContext | null>(null);\n  const stopServerAudio = () => {\n    serverSpeechRef.current?.abort();\n    serverSpeechRef.current = null;\n    const source = serverAudioSourceRef.current;\n    if (source) {\n      source.onended = null;\n      try { source.stop(); } catch { /* already stopped */ }\n      try { source.disconnect(); } catch { /* already disconnected */ }\n    }\n    serverAudioSourceRef.current = null;\n    const audio = serverAudioRef.current;\n    if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); URL.revokeObjectURL(audio.src); }\n    serverAudioRef.current = null;\n  };\n  const unlockAudio = async () => {\n    if (typeof window === "undefined" || !window.AudioContext) return null;\n    try {\n      let context = audioContextRef.current;\n      if (!context || context.state === "closed") {\n        context = new window.AudioContext();\n        audioContextRef.current = context;\n      }\n      if (context.state === "suspended") await context.resume();\n      return context;\n    } catch {\n      return null;\n    }\n  };`,
'audio refs'
);

replaceOnce(
`  const toggleVoiceOutput = () => {\n    const nextState = !isVoiceEnabled;`,
`  const toggleVoiceOutput = () => {\n    const nextState = !isVoiceEnabled;\n    if (nextState) void unlockAudio();`,
'voice toggle unlock'
);

replaceOnce(
`  const handleSendMessage = async (textToSend: string, triggeredByVoice: boolean = false) => {\n    const trimmed = textToSend.trim();`,
`  const handleSendMessage = async (textToSend: string, triggeredByVoice: boolean = false) => {\n    void unlockAudio();\n    const trimmed = textToSend.trim();`,
'send unlock'
);

replaceOnce(
`  const startListening = () => {\n    cancelPending();`,
`  const startListening = () => {\n    void unlockAudio();\n    cancelPending();`,
'mic unlock'
);

replaceOnce(
`          onClick={() => {\n            setIsOpen(true);`,
`          onClick={() => {\n            void unlockAudio();\n            setIsOpen(true);`,
'widget open unlock'
);

replaceOnce(
`          const blob = await fetchAngelaSpeech(cleanSpeech, controller.signal);\n          if (attempt !== speechAttemptRef.current || !enabledRef.current) return;\n          const audio = new Audio(URL.createObjectURL(blob));\n          serverAudioRef.current = audio;\n          audio.onended = () => {\n            if (serverAudioRef.current !== audio) return;\n            stopServerAudio(); setVoiceState("READY"); setActiveSpeakingId(null);\n          };\n          audio.onerror = () => {\n            if (serverAudioRef.current !== audio) return;\n            stopServerAudio(); setVoiceState("ERROR"); setActiveSpeakingId(null);\n            setErrorMessage("কণ্ঠ চালানো যায়নি। Listen চেপে আবার চেষ্টা করুন।");\n          };\n          await audio.play();\n          if (attempt !== speechAttemptRef.current) return;\n          setVoiceState("SPEAKING");\n          if (messageId) setActiveSpeakingId(messageId);`,
`          const blob = await fetchAngelaSpeech(cleanSpeech, controller.signal);\n          if (attempt !== speechAttemptRef.current || !enabledRef.current) return;\n\n          // Prefer the AudioContext unlocked by the user's open/send/mic gesture.\n          // This avoids Chrome dropping async TTS playback after user activation expires.\n          const context = await unlockAudio();\n          let playedWithWebAudio = false;\n          if (context?.state === "running") {\n            try {\n              const wav = await blob.arrayBuffer();\n              const decoded = await context.decodeAudioData(wav.slice(0));\n              if (attempt !== speechAttemptRef.current || !enabledRef.current) return;\n              const source = context.createBufferSource();\n              source.buffer = decoded;\n              source.connect(context.destination);\n              serverAudioSourceRef.current = source;\n              source.onended = () => {\n                if (serverAudioSourceRef.current !== source) return;\n                serverAudioSourceRef.current = null;\n                try { source.disconnect(); } catch { /* already disconnected */ }\n                setVoiceState("READY");\n                setActiveSpeakingId(null);\n              };\n              source.start(0);\n              playedWithWebAudio = true;\n              setVoiceState("SPEAKING");\n              setErrorMessage(null);\n              if (messageId) setActiveSpeakingId(messageId);\n            } catch (webAudioError) {\n              console.warn("Angela Web Audio playback notice:", webAudioError);\n            }\n          }\n\n          if (!playedWithWebAudio) {\n            const audio = new Audio(URL.createObjectURL(blob));\n            serverAudioRef.current = audio;\n            audio.preload = "auto";\n            audio.volume = 1;\n            audio.onended = () => {\n              if (serverAudioRef.current !== audio) return;\n              stopServerAudio(); setVoiceState("READY"); setActiveSpeakingId(null);\n            };\n            audio.onerror = () => {\n              if (serverAudioRef.current !== audio) return;\n              stopServerAudio(); setVoiceState("ERROR"); setActiveSpeakingId(null);\n              setErrorMessage("কণ্ঠ চালানো যায়নি। Listen চেপে আবার চেষ্টা করুন।");\n            };\n            await audio.play();\n            if (attempt !== speechAttemptRef.current) return;\n            setVoiceState("SPEAKING");\n            setErrorMessage(null);\n            if (messageId) setActiveSpeakingId(messageId);\n          }`,
'server WAV playback'
);

fs.writeFileSync(path, s, 'utf8');
console.log('Angela Web Audio playback patch applied.');
