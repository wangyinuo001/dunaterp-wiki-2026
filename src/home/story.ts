/** Narrative only: edit copy and shot coordinates without changing input or movement. */
export type StoryPhase = "OPENING" | "PROBLEM" | "DUNALIELLA" | "SOLUTION" | "HP" | "TRANSITION" | "WORLD";
export type StoryVisual = "needs" | "resources" | "alga" | "traits" | "hub" | "products" | "voices" | "decisions" | "journey";
export type StoryBeat = {
  phase: Exclude<StoryPhase, "OPENING" | "TRANSITION" | "WORLD">;
  chapter: string;
  speaker: string;
  text: string;
  visual: StoryVisual;
  /** Position on the existing route plus a small camera offset in world pixels. */
  shot: { u: number; x: number; y: number };
  voice?: number;
};
export const OPENING_HOOK = "In one of the world’s harshest environments, a tiny alga learned to turn salt and light into colour.";
const shore = { u: 0.085, x: -65, y: -30 };
const cell = { u: 0.245, x: 20, y: -28 };
export const STORY_BEATS: readonly StoryBeat[] = [
  { phase: "PROBLEM", chapter: "01 · THE PROBLEM", speaker: "Field guide", text: "Colours, flavours and nutrients surround our lives.", visual: "needs", shot: shore },
  { phase: "PROBLEM", chapter: "01 · THE PROBLEM", speaker: "Field guide", text: "But many valuable terpenoids still depend on limited natural resources or production methods with environmental costs.", visual: "resources", shot: shore },
  { phase: "DUNALIELLA", chapter: "02 · WHY DUNALIELLA?", speaker: "Field guide", text: "Then we looked at an organism that already thrives where few others can. Meet Dunaliella salina.", visual: "alga", shot: cell },
  { phase: "DUNALIELLA", chapter: "02 · WHY DUNALIELLA?", speaker: "Field guide", text: "Salt tolerant. β-carotene rich. Photosynthetic. A tiny cell with remarkable potential.", visual: "traits", shot: cell },
  { phase: "SOLUTION", chapter: "03 · OUR IDEA", speaker: "Researcher", text: "What if this tiny alga could become a platform for making more than β-carotene?", visual: "hub", shot: cell },
  { phase: "SOLUTION", chapter: "03 · OUR IDEA", speaker: "Researcher", text: "Our goal: engineer a shared β-carotene hub for valuable terpenoids, including astaxanthin, β-ionone and crocetin, with food applications in mind.", visual: "products", shot: cell },
  { phase: "HP", chapter: "04 · MORE THAN SCIENCE", speaker: "Field guide", text: "But a technology is meaningful only when it meets the needs of the world outside the lab.", visual: "voices", shot: shore },
  { phase: "HP", chapter: "04 · MORE THAN SCIENCE", speaker: "Consumer · a design question", text: "Can it be safe?", visual: "voices", voice: 0, shot: shore },
  { phase: "HP", chapter: "04 · MORE THAN SCIENCE", speaker: "Producer · a design question", text: "Can it be scalable?", visual: "voices", voice: 1, shot: shore },
  { phase: "HP", chapter: "04 · MORE THAN SCIENCE", speaker: "Environment · a design question", text: "What happens if engineered algae escape?", visual: "voices", voice: 2, shot: shore },
  { phase: "HP", chapter: "04 · MORE THAN SCIENCE", speaker: "Researcher · a design question", text: "Can biology offer a better route?", visual: "voices", voice: 3, shot: shore },
  { phase: "HP", chapter: "05 · QUESTIONS BECOME DESIGN", speaker: "Field guide", text: "These questions shape DunaTerp: a photosynthetic chassis, a platform designed for food-grade terpenoids, and a biocontainment system.", visual: "decisions", shot: shore },
  { phase: "HP", chapter: "05 · QUESTIONS BECOME DESIGN", speaker: "Field guide", text: "Different voices. One shared goal. A more sustainable way to make valuable molecules.", visual: "decisions", shot: shore },
  { phase: "HP", chapter: "06 · YOUR JOURNEY", speaker: "Field guide", text: "Now the journey is yours. Follow the Salt Route to discover our story—or leave the path and explore freely.", visual: "journey", shot: shore },
];

export type StoryState = { phase: StoryPhase; beat: number };
export type StoryEvent = "NEXT" | "SKIP" | "ARRIVED" | "REPLAY";
export function initialStory(seen: boolean): StoryState { return { phase: seen ? "WORLD" : "OPENING", beat: -1 }; }
export function storyReducer(state: StoryState, event: StoryEvent): StoryState {
  if (event === "REPLAY" && state.phase === "WORLD") return initialStory(false);
  if (event === "ARRIVED") return state.phase === "TRANSITION" ? { ...state, phase: "WORLD" } : state;
  if (state.phase === "WORLD" || state.phase === "TRANSITION") return state;
  if (event === "SKIP") return { ...state, phase: "TRANSITION" };
  if (event !== "NEXT") return state;
  const beat = state.beat + 1;
  return beat >= STORY_BEATS.length ? { ...state, phase: "TRANSITION" } : { beat, phase: STORY_BEATS[beat].phase };
}
