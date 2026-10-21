import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { installShim, writePng } from "./canvas2d.mjs";
installShim();
document.querySelector = () => null;
window.matchMedia = () => ({ matches: false });
globalThis.Element = class { closest() { return null; } };
const { PixelEngine, PixelRenderer, buildWorld, createFieldSites, MIN_FIELD_DISTANCE, isBlockedAt, isOnDeck } = await import("./.out/entry.js");
let active = null, interactions = 0;
const engine = new PixelEngine(document.createElement("canvas"), { clientWidth: 1280, clientHeight: 720 }, {
  onLoadProgress() {}, onReady() {}, onMode() {}, onChapter() {}, onPrompt() {}, onEnter() {},
  onFieldPrompt(site) { active = site; }, onFieldInteract() { interactions++; },
});
assert.equal(engine.fieldSites.length, 7);
assert.deepEqual(engine.fieldSites.filter(site => site.kind !== "item").map(site => site.id), ["noa"]);
assert.equal(engine.fieldSites.filter(site => site.kind === "item").length, 6);
assert.deepEqual(createFieldSites(buildWorld()), engine.fieldSites, "placements are deterministic");
const collected = [];
for (const site of engine.fieldSites) {
  assert.ok(site.deckDistance >= MIN_FIELD_DISTANCE, `${site.id} is distant from every deck segment`);
  assert.equal(isBlockedAt(engine.world, site.x, site.y), false);
  assert.equal(isOnDeck(engine.world, site.x, site.y), false);
  Object.assign(engine.hero, { x: site.x, y: site.y + 16 });
  engine.mode = "guided";
  engine.updateProximity();
  assert.equal(active, null, "guided mode cannot discover side content");
  engine.mode = "free";
  engine.updateProximity();
  assert.equal(active?.id, site.id, `${site.id} can be approached and inspected`);
  const before = interactions;
  engine.onKeyDown({ key: "e", repeat: false, target: new Element(), preventDefault() {} });
  assert.equal(interactions, before + 1);
  engine.setPaused(true);
  engine.interact();
  assert.equal(interactions, before + 1, "a field note owns input while open");
  engine.setPaused(false);
  if (site.kind === "item") {
    collected.push(site.id);
    engine.setCollectedFields(collected);
    assert.equal(active, null, "recorded objects cannot be picked up twice");
  }
}
assert.equal(collected.length, 6);
engine.mode = "guided";
engine.updateProximity();
assert.equal(active, null, "returning to the route clears discovery prompts");

const world = engine.world;
const renderer = new PixelRenderer(document.createElement("canvas"));
await renderer.prepareGround(world, () => {}, () => false);
renderer.resize(1280, 720, 1);
const base = [
  ...world.props.map(prop => ({ kind: "prop", prop })),
  ...world.stations.map(station => ({ kind: "station", station })),
];
const fields = engine.fieldSites.map(site => ({ kind: "field", site, x: site.x, y: site.y }));
mkdirSync("outputs", { recursive: true });
for (const site of engine.fieldSites) {
  const options = { world, camera: { x: site.x, y: site.y }, daylight: .5, time: 0, prompt: null };
  renderer.clampCamera(options.camera);
  renderer.render({ ...options, drawables: base });
  const baseline = Buffer.from(renderer.display.data);
  renderer.render({ ...options, drawables: [...base, ...fields], showFieldSites: false });
  assert.deepEqual(Buffer.from(renderer.display.data), baseline, "guided rendering is pixel-identical with side content disabled");
  renderer.render({ ...options, drawables: [...base, ...fields], showFieldSites: true });
  assert.notDeepEqual(Buffer.from(renderer.display.data), baseline, "the discovery appears in free roam");
  if (site.id === "noa" || site.id === "tf2146") writeFileSync(`outputs/${site.id}-field.png`, writePng(renderer.display).buffer);
}
console.log("PASS: seven distant reachable sites, Noa as the only new NPC, free-only interaction, pickup deduplication, modal input, deterministic placement and pixel-identical guided scenery.");
