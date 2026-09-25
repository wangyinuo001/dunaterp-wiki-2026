/** Five beats tell the project story before the visitor enters the world. */
export type StoryPhase = "OPENING" | "BACKGROUND" | "DESIGN" | "ROUTES" | "PROCESS" | "JOURNEY" | "TRANSITION" | "WORLD";
export type StoryVisual = "resources" | "traits" | "products" | "characterisation" | "journey";

export type StoryBeat = {
  phase: Exclude<StoryPhase, "OPENING" | "TRANSITION" | "WORLD">;
  chapter: string;
  speaker: string;
  speakerTone: string;
  text: string;
  visual: StoryVisual;
  /** Position on the existing route plus a small camera offset in world pixels. */
  shot: { u: number; x: number; y: number };
};

export const OPENING_HOOK = "In one of the world’s harshest environments, a tiny alga learned to turn salt and light into colour.";

export const STORY_BEATS: readonly StoryBeat[] = [
  {
    phase: "BACKGROUND",
    chapter: "01 · BACKGROUND & CHALLENGE",
    speaker: "Field guide",
    speakerTone: "#cdf558",
    text: "Plant-derived terpenoids can be limited by slow growth, variable supply, low abundance, and substantial land and freshwater demands. Our route begins with that production challenge.",
    visual: "resources",
    shot: { u: 0.12, x: -52, y: -26 },
  },
  {
    phase: "DESIGN",
    chapter: "02 · BIOLOGICAL DESIGN",
    speaker: "Dr. Lin · algal biologist",
    speakerTone: "#cdf558",
    text: "Dunaliella salina grows in saline media, fixes carbon with light and naturally supplies a carotenoid pathway. We place β-carotene at the centre as a shared metabolic hub.",
    visual: "traits",
    shot: { u: 0.36, x: 24, y: -26 },
  },
  {
    phase: "ROUTES",
    chapter: "03 · HIGH-VALUE PRODUCT ROUTES",
    speaker: "Mara · pathway engineer",
    speakerTone: "#f7a52d",
    text: "From the β-carotene hub, four separately cultivated strains route carbon toward astaxanthin, β-ionone, crocetin and β-citraurin through product-specific enzymes.",
    visual: "products",
    shot: { u: 0.62, x: -18, y: -28 },
  },
  {
    phase: "PROCESS",
    chapter: "04 · PRODUCT & PROCESS CHARACTERISATION",
    speaker: "Ari · community researcher",
    speakerTone: "#c4a8ff",
    text: "The route ends by connecting intracellular performance to product identity, titre and conversion efficiency, then to light, salinity, biomass productivity and recovery.",
    visual: "characterisation",
    shot: { u: 0.84, x: 28, y: -26 },
  },
  {
    phase: "JOURNEY",
    chapter: "05 · YOUR JOURNEY",
    speaker: "Field guide",
    speakerTone: "#cdf558",
    text: "Step onto the Salt Route to revisit the project as a place, or leave the boardwalk to meet three optional field guides. The complete Wet Lab, Dry Lab, Human Practices and People chapters remain in the navigation above.",
    visual: "journey",
    shot: { u: 0.04, x: 0, y: -18 },
  },
];

export type StoryState = { phase: StoryPhase; beat: number };
export type StoryEvent = "NEXT" | "SKIP" | "ARRIVED" | "REPLAY";

export function initialStory(seen: boolean): StoryState {
  return { phase: seen ? "WORLD" : "OPENING", beat: -1 };
}

export function storyReducer(state: StoryState, event: StoryEvent): StoryState {
  if (event === "REPLAY" && state.phase === "WORLD") return initialStory(false);
  if (event === "ARRIVED") return state.phase === "TRANSITION" ? { ...state, phase: "WORLD" } : state;
  if (state.phase === "WORLD" || state.phase === "TRANSITION") return state;
  if (event === "SKIP") return { ...state, phase: "TRANSITION" };
  if (event !== "NEXT") return state;
  const beat = state.beat + 1;
  return beat >= STORY_BEATS.length ? { ...state, phase: "TRANSITION" } : { beat, phase: STORY_BEATS[beat].phase };
}
