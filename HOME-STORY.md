# DunaTerp home prologue

The home route now loads its existing pixel world once and tells the project story inside that world. No new runtime packages, image downloads, routes, map geometry or movement systems were introduced.

## Flow and controls

`OPENING → PROBLEM → DUNALIELLA → SOLUTION → HP → TRANSITION → WORLD`

The finite-state reducer in `src/home/story.ts` owns progression. There are fourteen short story beats after the opening. Nothing advances without the visitor: click, Enter or Space first reveals unfinished text, then continues. The text animation budget is about 25–35 seconds; reading pauses are unlimited. Holding Enter/Space cannot fast-forward through multiple beats.

Skip Intro is available throughout the opening and story. A completed or skipped handoff writes `dunaterpIntroSeen=true`; returning visitors go to the world and can use Play Intro to replay. Storage denial is caught and does not prevent exploration.

The story hides and makes the existing navigation, world UI and canvas input inert. Focus stays within the two story controls. At the end focus moves to the canvas, and navigation/HUD fade in. WASD/arrows or the existing Free roam control enter free movement; guided scroll and mobile controls are preserved.

## Same-world handoff

`PixelWorld.tsx` creates the existing `PixelEngine` once per mount. Its lifecycle does not depend on the story step. `beginIntro()` places the traveller on a verified walkable patch beside the guide and pauses player input. `setIntroShot()` pans the existing camera between shore and cell viewpoints while the NPCs retain their patrol animation. World station labels are hidden only during the story.

`endIntro()` starts a guarded 1.6-second interpolation in the engine's existing requestAnimationFrame loop, moving camera and hero to the trailhead. The CSS crop relaxes from 1.12 to 1 while the atmospheric layer fades. The engine emits `onIntroComplete` only once, after the movement finishes. There is no navigation, reload, new world, or new canvas. Reduced-motion uses a short 0.2-second fade, immediate text, and no camera interpolation, scale, fog or drifting particles. Hidden tabs pause the narrative clocks.

## Editing guide

| File | What to edit |
| --- | --- |
| `src/home/story.ts` | Hook, dialogue, speaker labels, chapter order and route-relative camera coordinates. Keep promises phrased as design goals until supported by project evidence. |
| `src/home/HomePrologue.tsx` | Opening logo/tagline, keyboard focus boundary, progress markers and transition layer. |
| `src/home/StoryDialogue.tsx` | Typewriter speed, reveal/continue behavior and accessible full text. |
| `src/home/StoryIllustration.tsx` | Product examples, stakeholder roles and cause-to-design signposts. |
| `src/home/StoryGlyph.tsx` | Original inline vector pixel icons. Replace here if final project artwork becomes available; preserve layout dimensions. |
| `src/home/prologue.css` | Colour, framing, timing, responsive arrangements and reduced-motion behavior. |
| `src/PixelWorld.tsx` | World lifecycle, replay, saved preference and input/HUD handoff. |
| `src/pixel/engine.ts` | Temporary cinematic camera ownership and the guarded handoff. |
| `src/pixel/renderer.ts` | Optional suppression of station labels during the cinematic. |
| `src/App.tsx` | Home lazy-loading fallback omits the navbar to prevent a flash before the story. Other routes are unchanged. |

The Consumer/Producer/Environment/Researcher lines are illustrative design questions, explicitly identified in the UI; they are not presented as interview quotes. Food-grade production and sustainability are project goals, not established approvals or measured outcomes.

This phase deliberately retains the six existing world stations and their routes. The HP content in the prologue links social questions to design goals; interviews, data and pathway evidence remain on the existing Wiki pages.

## Verification

```sh
npm install
VITE_BASE_PATH=/dunaterp-wiki/ npm run build
npm run lint
npm run art:check
node tools/art-check/interaction-check.mjs
node tools/art-check/prologue-check.mjs
npm run preview:single
```

The prologue engine check exercises every state, skipping, repeated input, replay, denied storage, safe off-boardwalk spawn, input ownership, reduced motion and reuse of the same world/renderer.

An optional real-browser harness lives at `tools/home-check/browser.mjs`. With Playwright installed in a developer environment, run `node tools/home-check/browser.mjs`; it starts its own local Vite server, captures screenshots under `/tmp/dunaterp-home-shots`, and checks desktop/mobile story progression, same-canvas handoff, focus, keyboard movement, replay, storage and touch controls. The `PLAYWRIGHT_MODULE`, `CHROMIUM_MODULE` and `HOME_SHOTS` environment variables can point to external tooling/output without adding runtime dependencies.

Validation completed in Chromium: desktop 1440×900, touch viewport 390×844, narrow portrait 320×568 and landscape 844×390. Whole-card chapter navigation, history return, Space, storage denial, intro skip/replay and control handoff were checked. The existing NPC interaction checks pass. These checks cover Chromium, not a full Safari/Firefox compatibility matrix.
