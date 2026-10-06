import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AngelaPlayback } from '../src/lib/angelaPlayback.ts';

function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
function setup(t, decode) {
  const sources = [];
  const synthesis = { cancel() {}, resume() {}, speak() {} };
  class Context {
    state = 'running'; destination = {};
    decodeAudioData() { return decode ? decode.promise : Promise.resolve({}); }
    createBufferSource() {
      const source = { connect() {}, disconnect() {}, start() { this.started = true; }, stop() { this.stopped = true; } };
      sources.push(source); return source;
    }
  }
  const saved = { window: globalThis.window, SpeechSynthesisUtterance: globalThis.SpeechSynthesisUtterance };
  t.after(() => Object.assign(globalThis, saved));
  globalThis.window = { AudioContext: Context, speechSynthesis: synthesis };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  return { sources, synthesis };
}
async function flush() { for (let i=0;i<15;i++) await Promise.resolve(); }
const audio = () => Promise.resolve(new Blob(['test audio']));

test('close during a pending TTS request aborts and rejects its late audio', async t => {
  const {sources} = setup(t); const player = new AngelaPlayback(); const request = deferred();
  let signal; const states = [];
  const play = player.play('hello', null, (_, s) => { signal=s; return request.promise; }, x=>states.push(x), assert.fail);
  player.cancel(); assert.equal(signal.aborted,true);
  request.resolve(new Blob(['late audio'])); await play;
  assert.equal(sources.length,0); assert.deepEqual(states,[]);
});
test('close during WAV decoding cannot start playback afterward', async t => {
  const decode=deferred(); const {sources}=setup(t,decode); const player=new AngelaPlayback();
  const play=player.play('hello',null,audio,assert.fail,assert.fail);
  await flush(); player.cancel(); decode.resolve({}); await play;
  assert.equal(sources.length,0);
});
test('mute stops the active source and settles playback', async t => {
  const {sources}=setup(t); const player=new AngelaPlayback(); const states=[];
  const play=player.play('hello',null,audio,x=>states.push(x),assert.fail);
  await flush(); assert.equal(sources[0].started,true);
  player.cancel(); await play;
  assert.equal(sources[0].stopped,true); assert.equal(sources[0].onended,null);
});
test('a newer turn supersedes an older delayed response', async t => {
  const {sources}=setup(t); const player=new AngelaPlayback(); const old=deferred();
  const a=player.play('old',null,()=>old.promise,assert.fail,assert.fail);
  const b=player.play('new',null,audio,()=>{},assert.fail);
  await flush(); old.resolve(new Blob(['old'])); await a;
  assert.equal(sources.length,1); sources[0].onended(); await b;
});
test('a silent device voice falls through to cloud after the startup watchdog', async t => {
  const {sources}=setup(t); t.mock.timers.enable({apis:['setTimeout']});
  const player=new AngelaPlayback(); let fetched=0;
  const play=player.play('hello',{lang:'en-US'},()=>{fetched++;return audio();},()=>{},assert.fail);
  t.mock.timers.tick(1800); await flush();
  assert.equal(fetched,1); assert.equal(sources[0].started,true);
  sources[0].onended(); await play;
});
