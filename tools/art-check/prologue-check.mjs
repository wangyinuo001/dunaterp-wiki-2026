import assert from 'node:assert/strict';
import { installShim } from './canvas2d.mjs';
installShim();
document.querySelector = () => null;
globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.Element = class { closest() { return null; } };
const { PixelEngine, STORY_BEATS, storyReducer, initialStory, hasSeenIntro, rememberIntro, isOnDeck, isBlockedAt } = await import('./.out/entry.js');
let state = initialStory(false);
assert.equal(state.phase, 'OPENING');
for (let i = 0; i < STORY_BEATS.length; i++) {
  const skipped = storyReducer(state, 'SKIP');
  assert.equal(skipped.phase, 'TRANSITION');
  assert.equal(storyReducer(skipped, 'ARRIVED').phase, 'WORLD');
  state = storyReducer(state, 'NEXT');
  assert.equal(state.beat, i);
  assert.equal(state.phase, STORY_BEATS[i].phase);
}
state = storyReducer(state, 'NEXT');
assert.equal(state.phase, 'TRANSITION');
assert.equal(storyReducer(state, 'NEXT'), state, 'Repeated input cannot bypass handoff');
state = storyReducer(state, 'ARRIVED');
assert.equal(state.phase, 'WORLD');
assert.equal(storyReducer(state, 'SKIP'), state);
assert.equal(storyReducer(state, 'REPLAY').phase, 'OPENING');
assert.equal(initialStory(true).phase, 'WORLD');
globalThis.localStorage = { getItem() { throw new Error('disabled'); }, setItem() { throw new Error('disabled'); } };
assert.equal(hasSeenIntro(), false);
assert.doesNotThrow(rememberIntro);
for (const reduced of [false, true]) {
  window.matchMedia = () => ({ matches: reduced });
  let arrivals = 0;
  const engine = new PixelEngine(document.createElement('canvas'), {clientWidth:1280, clientHeight:800}, {
    onLoadProgress() {}, onReady() {}, onMode() {}, onChapter() {}, onPrompt() {}, onEnter() {}, onIntroComplete() { arrivals++; },
  });
  const world = engine.world, renderer = engine.renderer;
  engine.beginIntro();
  assert.equal(engine.isPaused, true);
  assert.equal(isOnDeck(world, engine.hero.x, engine.hero.y), false, 'Traveller starts off the boardwalk');
  assert.equal(isBlockedAt(world, engine.hero.x, engine.hero.y), false);
  engine.onKeyDown({ key:'w', repeat:false, target:new Element(), preventDefault() {} });
  assert.equal(engine.mode, 'guided', 'Story owns keyboard input');
  for (const beat of STORY_BEATS) { engine.setIntroShot(beat.shot.u, beat.shot.x, beat.shot.y); engine.stepIntro(.04); }
  engine.endIntro();
  const originalHandoff = engine.introReturn;
  engine.endIntro();
  assert.equal(engine.introReturn, originalHandoff, 'Repeated skip cannot restart transition');
  for (let i=0; i<45; i++) engine.stepIntro(.04);
  assert.equal(arrivals, 1);
  assert.equal(engine.world, world);
  assert.equal(engine.renderer, renderer);
  assert.equal(engine.isPaused, false);
  const start = world.path.sample(.001);
  assert.equal(engine.hero.x, start.x);
  assert.equal(engine.hero.y, start.y);
  engine.onKeyDown({ key:'w', repeat:false, target:new Element(), preventDefault() {} });
  assert.equal(engine.mode, 'free', 'Control returns after handoff');
  engine.beginIntro(); engine.endIntro();
  for (let i=0; i<45; i++) engine.stepIntro(.04);
  assert.equal(arrivals, 2, 'Replay works without reloading the world');
}
console.log('PASS: ordered story, skip guards, replay, blocked storage, safe spawn, input ownership, handoff, reduced motion and same world/renderer');
