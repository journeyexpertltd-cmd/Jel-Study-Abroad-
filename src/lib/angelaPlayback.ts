// Preserve accurate Bangla-script words for native Bengali female TTS.
// Convert English acronyms inside Bengali answers only for pronunciation.
function prepareAngelaSpeech(text: string): string {
  let spoken = text.replace(/[*#_`]/g, '').replace(/https?:\/\/\S+/g, '').replace(/[•]/g, '। ').trim();
  if (!/[\u0980-\u09FF]/.test(spoken)) return spoken;
  const substitutions: Array<[RegExp,string]> = [
    [/\bJourney Expert Limited\b/gi, 'জার্নি এক্সপার্ট লিমিটেড'],
    [/\bJEL\b/g, 'জার্নি এক্সপার্ট লিমিটেড'],
    [/\bStudy Abroad\b/gi, 'স্টাডি অ্যাব্রড'],
    [/\bWhatsApp\b/gi, 'হোয়াটসঅ্যাপ'],
    [/\bIELTS\b/gi, 'আইইএলটিএস'],
    [/\bPTE\b/g, 'পিটিই'],
    [/\bSOP\b/g, 'এস ও পি'],
    [/\bCAS\b/g, 'ক্যাস'],
    [/\bCOE\b/g, 'সিওই'],
    [/\bGDS\b/g, 'জিডিএস'],
    [/\bB2B\b/gi, 'বি টু বি'],
    [/\bvisa\b/gi, 'ভিসা'],
  ];
  for(const [pattern,word] of substitutions) spoken=spoken.replace(pattern,word);
  return spoken.replace(/\s+/g,' ').trim();
}

// One owner for every pending request, playback source and device utterance.
// cancel() also settles pending playback, so a closed panel cannot resume later.
export class AngelaPlayback {
  private controller: AbortController | null = null;
  private audio: HTMLAudioElement | null = null;
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private settle: (() => void) | null = null;

  prime() {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    try {
      if (Ctor && (!this.context || this.context.state === 'closed')) this.context = new Ctor();
      if (this.context?.state === 'suspended') void this.context.resume().catch(() => {});
    } catch { /* HTMLAudio remains available */ }
  }

  cancel() {
    this.controller?.abort();
    this.controller = null;
    this.settle?.();
    this.settle = null;
    if (this.utterance) {
      this.utterance.onstart = this.utterance.onend = this.utterance.onerror = null;
      this.utterance = null;
    }
    window.speechSynthesis?.cancel();
    if (this.source) {
      this.source.onended = null;
      try { this.source.stop(); this.source.disconnect(); } catch { /* ended */ }
      this.source = null;
    }
    if (this.audio) {
      this.audio.onended = this.audio.onerror = null;
      this.audio.pause();
      if (this.audio.src.startsWith('blob:')) URL.revokeObjectURL(this.audio.src);
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
  }

  async play(text: string, voice: SpeechSynthesisVoice | null,
    fetchSpeech: (text: string, signal: AbortSignal) => Promise<Blob>,
    onState: (speaking: boolean) => void, onError: (error: unknown) => void) {
    this.cancel();
    this.prime();
    const controller = new AbortController();
    this.controller = controller;
    const current = () => this.controller === controller && !controller.signal.aborted;
    const clean = prepareAngelaSpeech(text);
    if (!clean) return;
    try {
      if (voice && /female|zira|samantha|victoria|aria|jenny|heera|tania|priya|kalpana|nabanita|tanishaa|lekha|sangeeta/i.test(voice.name) && window.speechSynthesis) {
        const played = await new Promise<boolean>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(clean);
          this.utterance = utterance;
          let timer: ReturnType<typeof setTimeout>;
          const finish = (ok: boolean) => {
            clearTimeout(timer);
            utterance.onstart = utterance.onend = utterance.onerror = null;
            if (this.utterance === utterance) this.utterance = null;
            this.settle = null;
            resolve(ok);
          };
          this.settle = () => finish(false);
          utterance.voice = voice;
          utterance.lang = voice.lang;
          utterance.rate = 1.03;
          utterance.onstart = () => {
            if (!current()) return finish(false);
            clearTimeout(timer);
            onState(true);
            timer = setTimeout(() => finish(false), 120000);
          };
          utterance.onend = () => finish(true);
          utterance.onerror = () => finish(false);
          // Some devices accept speak() without ever starting or firing an error.
          timer = setTimeout(() => finish(false), 5500);
          try {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
          } catch { finish(false); }
        });
        if (!current()) return;
        if (played) { onState(false); return; }
        window.speechSynthesis.cancel();
      }
      // Keep complete answers; split only at safe lengths required by the API.
      const chunks = clean.match(/[\s\S]{1,1100}(?:\s|$)|[\s\S]{1,1100}/g) || [clean];
      for (const chunk of chunks) {
        const blob = await fetchSpeech(chunk.trim(), controller.signal);
        if (!current()) return;
        const context = this.context;
        if (context?.state === 'suspended') await context.resume().catch(() => {});
        if (!current()) return;
        let decoded: AudioBuffer | null = null;
        if (context?.state === 'running') {
          try { decoded = await context.decodeAudioData(await blob.arrayBuffer()); } catch { /* use HTMLAudio */ }
        }
        if (!current()) return;
        await new Promise<void>((resolve, reject) => {
          let timer: ReturnType<typeof setTimeout>;
          const finish = (error?: unknown) => {
            clearTimeout(timer);
            this.settle = null;
            error ? reject(error) : resolve();
          };
          this.settle = () => finish();
          timer = setTimeout(() => finish(new Error('playback_timeout')), 120000);
          if (decoded && context) {
            const source = context.createBufferSource();
            source.buffer = decoded;
            source.connect(context.destination);
            this.source = source;
            source.onended = () => {
              if (this.source === source) this.source = null;
              source.disconnect();
              finish();
            };
            source.start();
            onState(true);
          } else {
            const audio = new Audio(URL.createObjectURL(blob));
            this.audio = audio;
            audio.onended = () => { URL.revokeObjectURL(audio.src); finish(); };
            audio.onerror = () => finish(new Error('audio_playback_failed'));
            void audio.play().then(() => { if (current()) onState(true); }).catch(finish);
          }
        });
        if (!current()) return;
      }
      if (current()) onState(false);
    } catch (error) {
      if (current()) { this.cancel(); onState(false); onError(error); }
    }
  }
}
