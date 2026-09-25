import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./expedition.css";
import { NPC_DEFINITIONS } from "./pixel/npc-data";
import { npcPersonFrame } from "./pixel/sprites";

/** IDs used by the world engine when an explorer meets a field contact. */
// Shared with the compact in-world dialogue component.
// eslint-disable-next-line react-refresh/only-export-components
export const EXPEDITION_NPC_IDS = [
  "biologist",
  "engineer",
  "researcher",
] as const;

export type ExpeditionNpcId = (typeof EXPEDITION_NPC_IDS)[number];

/**
 * A new serial opens the journal even when the same character was opened last
 * time. The engine can keep the request object in its state and increment
 * `serial` each time the player presses E.
 */
export type ExpeditionJournalRequest = {
  npcId?: ExpeditionNpcId;
  serial?: number;
};

export type ExpeditionJournalProps = {
  /** Station key currently closest to the player, when one is available. */
  currentStationKey?: string | null;
  /** Called after the native dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** A request from the world engine to open a particular field contact. */
  openRequest?: ExpeditionJournalRequest | null;
  /** Optional quick-travel hook. The parent decides how to move the player. */
  onTravel?: (stationKey: string) => void;
};

type NpcPrompt = { id: string; label: string; response: string };

export type ExpeditionNpc = {
  id: ExpeditionNpcId;
  name: string;
  role: string;
  stationKey: string;
  stationLabel: string;
  accent: string;
  initials: string;
  intro: string;
  chapterHint: string;
  prompts: NpcPrompt[];
};

// Shared with the compact in-world dialogue component.
// eslint-disable-next-line react-refresh/only-export-components
export const NPCS: Record<ExpeditionNpcId, ExpeditionNpc> = {
  "biologist": {
    id: "biologist",
    name: "Dr. Lin",
    role: "Algal biologist",
    stationKey: "brine-edge",
    stationLabel: "Brine edge",
    accent: "#7cc45a",
    initials: "MC",
    intro:
      "The first orange salt pond I saw looked almost lifeless, and that contradiction stayed with me. I want to know what Dunaliella can build here—but I still ask whether every bright colour is really the molecule we hoped for.",
    chapterHint: "Field trail: Wet Lab → Description, Experiments and Results",
    prompts: [
      {
        id: "why-alga",
        label: "Why follow this salt dweller?",
        response:
          "Follow the salt and the clue appears: this wall-less, motile alga already thrives in hypersaline water and builds carotenoids. That gives our expedition a living chassis and a native metabolic trail to explore.",
      },
      {
        id: "cell-evidence",
        label: "What belongs in the field notes?",
        response:
          "Write down what we saw, what we compared and how we measured it. A coloured culture is an exciting footprint; chromatography or spectroscopy tells us which molecule actually left it.",
      },
      {
        id: "careful-claim",
        label: "How far can a claim travel?",
        response:
          "Only as far as the evidence trail. Name the observation, the comparison and the uncertainty, then stop at the last confirmed marker. That is how another explorer can retrace our route.",
      },
    ],
  },
  "engineer": {
    id: "engineer",
    name: "Mara",
    role: "Pathway engineer",
    stationKey: "product-yards",
    stationLabel: "Product yards",
    accent: "#e9c43a",
    initials: "IP",
    intro:
      "I distrust a tidy pathway diagram until the carbon actually moves through it. Four routes leave this β-carotene hub; my task is to find the bottleneck, and my hesitation is always the same: did we strengthen one branch by starving another?",
    chapterHint: "Field trail: Wet Lab → Engineering; Dry Lab → Mathematical Modeling",
    prompts: [
      {
        id: "hub",
        label: "Why build around one hub?",
        response:
          "Think of β-carotene as the busiest roundabout on the map. Strengthening its supply can support every destination, while LCYB controls how much lycopene enters that shared junction.",
      },
      {
        id: "branch",
        label: "Which route comes first?",
        response:
          "Choose the destination, trace every conversion backward, then check the enzyme, substrate and analytical readout at each turn. Astaxanthin, β-ionone, crocetin and β-citraurin each need their own strain and route card.",
      },
      {
        id: "model",
        label: "What does the model reveal?",
        response:
          "A model is our compass: it follows control from promoter occupancy to LCYB transcript, active enzyme and β-carotene. Sensitivity analysis then points to the measurements most likely to change our direction.",
      },
    ],
  },
  "researcher": {
    id: "researcher",
    name: "Ari",
    role: "Community researcher",
    stationKey: "model-station",
    stationLabel: "Process checkpoint",
    accent: "#c4a8ff",
    initials: "AO",
    intro:
      "Whenever a design looks complete, I look for the person whose question is missing. I listen for practical worries that never appear in a pathway diagram, then ask whether the project changed because someone trusted us with them.",
    chapterHint: "Field trail: Human Practices → Human Practices and Sustainability",
    prompts: [
      {
        id: "listen",
        label: "Whose map are we missing?",
        response:
          "Start with the people who grow, operate, regulate, process or live beside the system. Ask what they value, what worries them and what evidence would earn their trust; each answer adds a landmark we could not see alone.",
      },
      {
        id: "safety",
        label: "What opens the next gate?",
        response:
          "The gate opens when the criteria are visible: containment, reproducibility, product evidence and stakeholder concerns all receive a documented answer. Readiness is a checkpoint the whole team can inspect.",
      },
      {
        id: "change-design",
        label: "Can feedback reroute us?",
        response:
          "Absolutely. A concern can become a design constraint, a new control or a different experiment. We mark every turn in the journal so the final route shows who helped shape it.",
      },
    ],
  },
};

const NPC_LIST = EXPEDITION_NPC_IDS.map((id) => NPCS[id]);

const STATION_LABELS: Record<string, string> = {
  "brine-edge": "Background & challenge",
  "the-cell": "Biological design",
  "product-yards": "Product routes",
  "model-station": "Product & process characterisation",
  archive: "Archive",
};

const GAME_IDS = ["pathway-order", "product-branch", "evidence-sort"] as const;
type GameId = (typeof GAME_IDS)[number];

const GAME_META: Record<GameId, { label: string; short: string }> = {
  "pathway-order": { label: "Route order", short: "Pathway" },
  "product-branch": { label: "Branch labels", short: "Products" },
  "evidence-sort": { label: "Evidence sort", short: "Evidence" },
};

type JournalProgress = {
  games: Record<GameId, boolean>;
  visited: Record<ExpeditionNpcId, boolean>;
};

const STORAGE_KEY = "dunaterp.expedition-journal.v1";
const PROGRESS_EVENT = "dunaterp:journal-progress";

function emptyProgress(): JournalProgress {
  return {
    games: {
      "pathway-order": false,
      "product-branch": false,
      "evidence-sort": false,
    },
    visited: {
      "biologist": false,
      "engineer": false,
      "researcher": false,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Reading is best effort: private browsing and blocked storage are valid. */
function readProgress(): JournalProgress {
  const fallback = emptyProgress();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return fallback;
    const next = emptyProgress();
    const savedGames = isRecord(parsed.games) ? parsed.games : {};
    const savedVisited = isRecord(parsed.visited) ? parsed.visited : {};
    for (const gameId of GAME_IDS) {
      next.games[gameId] = savedGames[gameId] === true;
    }
    for (const npcId of EXPEDITION_NPC_IDS) {
      next.visited[npcId] = savedVisited[npcId] === true;
    }
    return next;
  } catch {
    return fallback;
  }
}

function writeProgress(progress: JournalProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage is an enhancement; the live journal remains usable.
  }
}

// Shared by the compact world dialogue and the full journal so its 0/3 counter
// changes as soon as a real conversation begins.
// eslint-disable-next-line react-refresh/only-export-components
export function recordNpcVisit(npcId: ExpeditionNpcId) {
  if (typeof window === "undefined") return;
  const current = readProgress();
  if (current.visited[npcId]) return;
  const next = { ...current, visited: { ...current.visited, [npcId]: true } };
  writeProgress(next);
  window.dispatchEvent(new CustomEvent<JournalProgress>(PROGRESS_EVENT, { detail: next }));
}

type Feedback = { tone: "hint" | "correct" | "try"; text: string };

export function PixelPortrait({ npc }: { npc: ExpeditionNpc }) {
  const portrait = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = portrait.current?.getContext("2d");
    if (!ctx) return;
    const appearance = NPC_DEFINITIONS.find((definition) => definition.id === npc.id);
    if (!appearance) return;
    const sprite = npcPersonFrame(appearance, "down", 0);
    ctx.clearRect(0, 0, 28, 28);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite.canvas, 6, 4);
  }, [npc.id]);
  return <canvas ref={portrait} width={28} height={28} className="ej-portrait" aria-hidden="true" />;
}

const PATHWAY_STEPS = [
  { id: "mep", title: "MEP pathway", text: "The chloroplast precursor pathway." },
  { id: "units", title: "IPP + DMAPP", text: "Five-carbon isoprenoid building blocks." },
  { id: "ggpp", title: "GGPP", text: "A twenty-carbon precursor for carotenoid synthesis." },
  { id: "lycopene", title: "Lycopene", text: "An intermediate after phytoene formation and further reactions." },
  { id: "hub", title: "β-carotene", text: "The hub reached through lycopene β-cyclisation." },
] as const;
const PATHWAY_CHOICES = [PATHWAY_STEPS[3], PATHWAY_STEPS[1], PATHWAY_STEPS[4], PATHWAY_STEPS[0], PATHWAY_STEPS[2]];

function PathwayOrderGame({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback>({
    tone: "hint",
    text: "Choose the first design step. You can reset the route whenever you like.",
  });

  const choose = (id: string) => {
    const expected = PATHWAY_STEPS[picked.length];
    if (!expected) return;
    if (id !== expected.id) {
      setFeedback({
        tone: "try",
        text: "Not yet. Follow precursor formation before chain assembly and carotenoid conversion.",
      });
      return;
    }
    const next = [...picked, id];
    setPicked(next);
    if (next.length === PATHWAY_STEPS.length) {
      setFeedback({
        tone: "correct",
        text: "Route restored: MEP → IPP / DMAPP → GGPP → lycopene → β-carotene. This is a simplified pathway map, not a measured production result.",
      });
      onComplete();
    } else {
      setFeedback({ tone: "correct", text: "Good step. Choose the next intermediate in the route." });
    }
  };

  const reset = () => {
    setPicked([]);
    setFeedback({ tone: "hint", text: "Route reset. Choose the first design step." });
  };

  return (
    <div className="ej-game" aria-labelledby="ej-pathway-title">
      <div className="ej-game__heading">
        <div>
          <p className="ej-eyebrow">MINI-GAME 01</p>
          <h3 id="ej-pathway-title">Restore the carotenoid route</h3>
        </div>
        {completed && <span className="ej-complete">COMPLETE</span>}
      </div>
      <p className="ej-game__intro">
        Connect the chloroplast precursor pathway to the β-carotene hub. This simplified map omits intermediate reactions.
      </p>
      <ol className="ej-order" aria-label="Your pathway order">
        {picked.map((id, index) => {
          const step = PATHWAY_STEPS.find((item) => item.id === id);
          return <li key={id}><span>{index + 1}</span>{step?.title}</li>;
        })}
        {picked.length < PATHWAY_STEPS.length && (
          <li className="is-empty"><span>{picked.length + 1}</span>Choose a card below</li>
        )}
      </ol>
      <div className="ej-choice-grid" aria-label="Pathway cards">
        {PATHWAY_CHOICES.map((step) => {
          const isPicked = picked.includes(step.id);
          return (
            <button
              key={step.id}
              type="button"
              className={`ej-choice${isPicked ? " is-picked" : ""}`}
              onClick={() => choose(step.id)}
              disabled={isPicked}
              aria-label={`${step.title}${isPicked ? ", already placed" : ""}`}
            >
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </button>
          );
        })}
      </div>
      <p className={`ej-feedback is-${feedback.tone}`} role="status" aria-live="polite">
        <span aria-hidden="true">{feedback.tone === "correct" ? "✓" : feedback.tone === "try" ? "!" : "·"}</span>
        {feedback.text}
      </p>
      <button type="button" className="ej-reset" onClick={reset}>Reset route</button>
    </div>
  );
}

const PRODUCT_ROUNDS = [
  {
    cue: "A design brief asks you to inspect a fragrance-oriented apocarotenoid label.",
    answer: "beta-ionone",
    options: [
      { id: "beta-ionone", label: "β-ionone" },
      { id: "astaxanthin", label: "Astaxanthin" },
      { id: "crocetin", label: "Crocetin" },
      { id: "beta-citraurin", label: "β-citraurin" },
    ],
    rationale: "β-ionone is the label to inspect for this cue in the exercise.",
  },
  {
    cue: "The target is described as an oxygenated red carotenoid product label.",
    answer: "astaxanthin",
    options: [
      { id: "crocetin", label: "Crocetin" },
      { id: "beta-citraurin", label: "β-citraurin" },
      { id: "astaxanthin", label: "Astaxanthin" },
      { id: "beta-ionone", label: "β-ionone" },
    ],
    rationale: "Astaxanthin matches the cue used for this round.",
  },
  {
    cue: "The route is described with a yellow apocarotenoid label linked to saffron chemistry.",
    answer: "crocetin",
    options: [
      { id: "beta-citraurin", label: "β-citraurin" },
      { id: "crocetin", label: "Crocetin" },
      { id: "beta-ionone", label: "β-ionone" },
      { id: "astaxanthin", label: "Astaxanthin" },
    ],
    rationale: "Crocetin is the label that fits this round's design cue.",
  },
  {
    cue: "The requested label is an orange apocarotenoid name in the product set.",
    answer: "beta-citraurin",
    options: [
      { id: "astaxanthin", label: "Astaxanthin" },
      { id: "beta-citraurin", label: "β-citraurin" },
      { id: "crocetin", label: "Crocetin" },
      { id: "beta-ionone", label: "β-ionone" },
    ],
    rationale: "β-citraurin is the matching label in this exercise.",
  },
] as const;

function ProductBranchGame({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ tone: "hint", text: "Read the cue, then choose a product label." });
  const round = PRODUCT_ROUNDS[roundIndex];

  const choose = (id: string) => {
    setSelected(id);
    if (id !== round.answer) {
      setSolved(false);
      setFeedback({ tone: "try", text: "That label does not fit this cue in the exercise. Try another branch." });
      return;
    }
    setSolved(true);
    setFeedback({ tone: "correct", text: `${round.rationale} Check the chemistry before making a project claim.` });
    if (roundIndex === PRODUCT_ROUNDS.length - 1) onComplete();
  };

  const next = () => {
    setRoundIndex((value) => Math.min(PRODUCT_ROUNDS.length - 1, value + 1));
    setSelected(null);
    setSolved(false);
    setFeedback({ tone: "hint", text: "Read the cue, then choose a product label." });
  };

  const reset = () => {
    setRoundIndex(0);
    setSelected(null);
    setSolved(false);
    setFeedback({ tone: "hint", text: "Rounds reset. Read the cue, then choose a product label." });
  };

  return (
    <div className="ej-game" aria-labelledby="ej-branch-title">
      <div className="ej-game__heading">
        <div>
          <p className="ej-eyebrow">MINI-GAME 02</p>
          <h3 id="ej-branch-title">Match a cue to a product branch</h3>
        </div>
        {completed && <span className="ej-complete">COMPLETE</span>}
      </div>
      <p className="ej-game__intro">
        These are design labels, not proof that a construct produces a product. Choose the label that fits each clue.
      </p>
      <div className="ej-round" aria-label={`Product round ${roundIndex + 1} of ${PRODUCT_ROUNDS.length}`}>
        <span className="ej-round__count">ROUND {String(roundIndex + 1).padStart(2, "0")} / {PRODUCT_ROUNDS.length}</span>
        <p>{round.cue}</p>
      </div>
      <div className="ej-answer-grid" role="group" aria-label="Product branch choices">
        {round.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`ej-answer${selected === option.id ? " is-selected" : ""}${selected === option.id && solved ? " is-right" : ""}`}
            onClick={() => choose(option.id)}
            aria-pressed={selected === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className={`ej-feedback is-${feedback.tone}`} role="status" aria-live="polite">
        <span aria-hidden="true">{feedback.tone === "correct" ? "✓" : feedback.tone === "try" ? "!" : "·"}</span>
        {feedback.text}
      </p>
      <div className="ej-game-actions">
        {solved && roundIndex < PRODUCT_ROUNDS.length - 1 && (
          <button type="button" className="ej-next" onClick={next}>Next cue <span aria-hidden="true">→</span></button>
        )}
        <button type="button" className="ej-reset" onClick={reset}>Reset rounds</button>
      </div>
    </div>
  );
}

type SortLabel = "evidence" | "claim" | "needs-review";

const SORT_LABELS: Array<{ id: SortLabel; label: string }> = [
  { id: "evidence", label: "Evidence record" },
  { id: "claim", label: "Model prediction" },
  { id: "needs-review", label: "Design target" },
];

const SORT_CARDS: Array<{ text: string; answer: SortLabel; explanation: string }> = [
  {
    text: "A recorded interview includes a community concern about land use.",
    answer: "evidence",
    explanation: "The interview is an evidence record about a perspective; it does not settle the broader question by itself.",
  },
  {
    text: "Under the stated model parameters, simulated product flux increases.",
    answer: "claim",
    explanation: "This is a computational prediction conditional on its parameters, not an experimental measurement.",
  },
  {
    text: "The team aims to reduce the risk of environmental escape.",
    answer: "needs-review",
    explanation: "This states a design goal. Its effectiveness must be assessed using defined evidence.",
  },
  {
    text: "A chart compares a treatment with a control and reports uncertainty.",
    answer: "evidence",
    explanation: "This describes a reported comparison. The underlying data still need to be examined.",
  },
];

function EvidenceSortGame({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [selected, setSelected] = useState<SortLabel | null>(null);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ tone: "hint", text: "Sort the field note by what it can support." });
  const card = SORT_CARDS[cardIndex];

  const choose = (label: SortLabel) => {
    setSelected(label);
    if (label !== card.answer) {
      setSolved(false);
      setFeedback({ tone: "try", text: "Try again. Ask whether the sentence records an observation, reports a simulation, or describes an intended goal." });
      return;
    }
    setSolved(true);
    setFeedback({ tone: "correct", text: card.explanation });
    if (cardIndex === SORT_CARDS.length - 1) onComplete();
  };

  const next = () => {
    setCardIndex((value) => Math.min(SORT_CARDS.length - 1, value + 1));
    setSelected(null);
    setSolved(false);
    setFeedback({ tone: "hint", text: "Sort the field note by what it can support." });
  };

  const reset = () => {
    setCardIndex(0);
    setSelected(null);
    setSolved(false);
    setFeedback({ tone: "hint", text: "Cards reset. Sort the field note by what it can support." });
  };

  return (
    <div className="ej-game" aria-labelledby="ej-sort-title">
      <div className="ej-game__heading">
        <div>
          <p className="ej-eyebrow">MINI-GAME 03</p>
          <h3 id="ej-sort-title">Sort evidence from claims</h3>
        </div>
        {completed && <span className="ej-complete">COMPLETE</span>}
      </div>
      <p className="ej-game__intro">
        Separate an observation record, a model prediction and a design target. Each supports a different kind of statement.
      </p>
      <div className="ej-sort-card" aria-label={`Field note ${cardIndex + 1} of ${SORT_CARDS.length}`}>
        <span className="ej-round__count">FIELD NOTE {String(cardIndex + 1).padStart(2, "0")} / {SORT_CARDS.length}</span>
        <p>“{card.text}”</p>
      </div>
      <div className="ej-sort-options" role="group" aria-label="Evidence categories">
        {SORT_LABELS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`ej-answer${selected === option.id ? " is-selected" : ""}${selected === option.id && solved ? " is-right" : ""}`}
            onClick={() => choose(option.id)}
            aria-pressed={selected === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className={`ej-feedback is-${feedback.tone}`} role="status" aria-live="polite">
        <span aria-hidden="true">{feedback.tone === "correct" ? "✓" : feedback.tone === "try" ? "!" : "·"}</span>
        {feedback.text}
      </p>
      <div className="ej-game-actions">
        {solved && cardIndex < SORT_CARDS.length - 1 && (
          <button type="button" className="ej-next" onClick={next}>Next field note <span aria-hidden="true">→</span></button>
        )}
        <button type="button" className="ej-reset" onClick={reset}>Reset sorter</button>
      </div>
    </div>
  );
}

export function ExpeditionJournal({
  currentStationKey = null,
  onOpenChange,
  openRequest = null,
  onTravel,
}: ExpeditionJournalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const onTravelRef = useRef(onTravel);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<ExpeditionNpcId>("biologist");
  const [dialogueChoice, setDialogueChoice] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<GameId>("pathway-order");
  const [resetVersion, setResetVersion] = useState(0);
  const [progress, setProgress] = useState<JournalProgress>(() => readProgress());
  const idPrefix = useId().replace(/:/g, "");

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    onTravelRef.current = onTravel;
  }, [onTravel]);

  useEffect(() => {
    writeProgress(progress);
  }, [progress]);

  useEffect(() => {
    const syncProgress = (event: Event) => {
      const update = (event as CustomEvent<JournalProgress>).detail;
      if (update) setProgress(update);
    };
    window.addEventListener(PROGRESS_EVENT, syncProgress);
    return () => window.removeEventListener(PROGRESS_EVENT, syncProgress);
  }, []);

  const markNpcVisited = useCallback((npcId: ExpeditionNpcId) => {
    setProgress((current) => {
      if (current.visited[npcId]) return current;
      return { ...current, visited: { ...current.visited, [npcId]: true } };
    });
  }, []);

  const selectNpc = useCallback((npcId: ExpeditionNpcId) => {
    setSelectedNpc(npcId);
    setDialogueChoice(null);
    markNpcVisited(npcId);
  }, [markNpcVisited]);

  const handleNativeClose = useCallback(() => {
    setIsOpen(false);
    onOpenChangeRef.current?.(false);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => { const target = returnFocus.current; if (target?.isConnected) target.focus({ preventScroll: true }); else triggerRef.current?.focus({ preventScroll: true }); });
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", handleNativeClose);
    return () => dialog.removeEventListener("close", handleNativeClose);
  }, [handleNativeClose]);

  const closeJournal = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    else handleNativeClose();
  }, [handleNativeClose]);

  const openJournal = useCallback((npcId?: ExpeditionNpcId) => {
    if (npcId) selectNpc(npcId);
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; dialog.showModal(); }
    setIsOpen(true);
    onOpenChangeRef.current?.(true);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        dialog.querySelector<HTMLElement>("[data-journal-initial-focus]")?.focus();
      });
    }
  }, [selectNpc]);

  const requestedNpcId = openRequest?.npcId;
  const requestedSerial = openRequest?.serial;
  const hasOpenRequest = openRequest !== null;
  useEffect(() => {
    if (!hasOpenRequest) return;
    const frame = requestAnimationFrame(() => openJournal(requestedNpcId));
    return () => cancelAnimationFrame(frame);
  }, [hasOpenRequest, requestedNpcId, requestedSerial, openJournal]);

  const activeNpc = NPCS[selectedNpc];
  const nearbyStation = currentStationKey ? STATION_LABELS[currentStationKey] : null;
  const completedGames = GAME_IDS.filter((gameId) => progress.games[gameId]).length;
  const visitedNpcs = Object.values(progress.visited).filter(Boolean).length;
  const completionPercent = Math.round((completedGames / GAME_IDS.length) * 100);

  const completeGame = useCallback((gameId: GameId) => {
    setProgress((current) => {
      if (current.games[gameId]) return current;
      return { ...current, games: { ...current.games, [gameId]: true } };
    });
  }, []);

  const resetProgress = () => { setProgress(emptyProgress()); setResetVersion((v) => v + 1); };

  const travelTo = (stationKey: string) => {
    onTravelRef.current?.(stationKey);
    closeJournal();
  };

  const dialogTitleId = `${idPrefix}-title`;
  const dialogDescriptionId = `${idPrefix}-description`;

  return (
    <div className="ej-shell">
      <button
        ref={triggerRef}
        type="button"
        className="ej-launcher"
        onClick={() => openJournal(selectedNpc)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="ej-launcher__icon" aria-hidden="true">▤</span>
        <span>Expedition journal</span>
        <span className="ej-launcher__key" aria-label={`${visitedNpcs} of 3 guides met`}>{visitedNpcs}/3</span>
      </button>

      <dialog
        ref={dialogRef}
        className="ej-dialog"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeJournal();
        }}
      >
        <div className="ej-dialog__chrome">
          <header className="ej-header">
            <div>
              <p className="ej-eyebrow">DUNATERP · FIELD ARCHIVE</p>
              <h1 id={dialogTitleId}>Expedition journal</h1>
              <p id={dialogDescriptionId} className="ej-header__dek">
                Meet three fictional research guides and solve their field exercises. The guides do not represent team members or real stakeholder interviews.
              </p>
            </div>
            <div className="ej-header__actions">
              <div className="ej-progress" aria-label={`${completedGames} of ${GAME_IDS.length} exercises complete`}>
                <span>{completedGames}/{GAME_IDS.length} notes</span>
                <div className="ej-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent} aria-label="Journal exercise progress">
                  <i style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
              <button ref={(node) => { if (node) node.setAttribute("data-journal-initial-focus", "true"); }} type="button" className="ej-close" onClick={closeJournal} aria-label="Close expedition journal">×</button>
            </div>
          </header>

          <div className="ej-dialog__body">
            <aside className="ej-contacts" aria-label="Field contacts">
              <div className="ej-section-heading">
                <p className="ej-eyebrow">FIELD CONTACTS</p>
                <p>{visitedNpcs}/3 met</p>
              </div>
              <div className="ej-npc-list">
                {NPC_LIST.map((npc) => {
                  const isSelected = selectedNpc === npc.id;
                  const isNearby = currentStationKey === npc.stationKey;
                  return (
                    <button
                      key={npc.id}
                      type="button"
                      className={`ej-npc-card${isSelected ? " is-selected" : ""}${isNearby ? " is-nearby" : ""}`}
                      style={{ "--ej-accent": npc.accent } as CSSProperties}
                      onClick={() => selectNpc(npc.id)}
                      aria-pressed={isSelected}
                    >
                      <PixelPortrait npc={npc} />
                      <span className="ej-npc-card__copy">
                        <strong>{npc.role}</strong>
                        <span>{npc.name}</span>
                        <small>{isNearby ? "Nearby · talk with E" : npc.stationLabel}</small>
                      </span>
                      {progress.visited[npc.id] && <span className="ej-npc-card__mark" aria-label="Met">✓</span>}
                    </button>
                  );
                })}
              </div>
              <p className="ej-contact-note">A conversation can add a question to your notes. It does not replace the evidence behind an answer.</p>
            </aside>

            <div className="ej-journal-main">
              <section className="ej-conversation" aria-labelledby={`${idPrefix}-contact-title`}>
                <div className="ej-conversation__topline">
                  <span className="ej-location">{nearbyStation ? `Near ${nearbyStation}` : "Salt route · field notes"}</span>
                  <span className="ej-location__dot" aria-hidden="true" />
                </div>
                <div className="ej-conversation__identity" style={{ "--ej-accent": activeNpc.accent } as CSSProperties}>
                  <PixelPortrait npc={activeNpc} />
                  <div>
                    <p className="ej-eyebrow">{activeNpc.role}</p>
                    <h2 id={`${idPrefix}-contact-title`}>{activeNpc.name}</h2>
                    <p>{activeNpc.stationLabel} station</p>
                  </div>
                </div>
                <div className="ej-speech">
                  <span className="ej-speech__tag">FIELD CONTACT</span>
                  <p>{activeNpc.intro}</p>
                </div>
                <fieldset className="ej-prompts">
                  <legend>Ask a question</legend>
                  <div>
                    {activeNpc.prompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        type="button"
                        className={dialogueChoice === prompt.id ? "is-selected" : undefined}
                        onClick={() => setDialogueChoice(prompt.id)}
                        aria-pressed={dialogueChoice === prompt.id}
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {dialogueChoice && (
                  <p className="ej-response" role="status" aria-live="polite">
                    {activeNpc.prompts.find((prompt) => prompt.id === dialogueChoice)?.response}
                  </p>
                )}
                {onTravel && (
                  <button type="button" className="ej-travel" onClick={() => travelTo(activeNpc.stationKey)}>
                    Walk to {activeNpc.stationLabel} <span aria-hidden="true">↗</span>
                  </button>
                )}
              </section>

              <section className="ej-games" aria-labelledby={`${idPrefix}-games-title`}>
                <div className="ej-games__heading">
                  <div>
                    <p className="ej-eyebrow">EXPLORATION MODE</p>
                    <h2 id={`${idPrefix}-games-title`}>Three field exercises</h2>
                  </div>
                  <span className="ej-games__hint">Select · learn · retry</span>
                </div>
                <div className="ej-game-tabs" role="tablist" aria-label="Field exercises">
                  {GAME_IDS.map((gameId) => {
                    const isActive = activeGame === gameId;
                    return (
                      <button
                        key={gameId}
                        id={`${idPrefix}-tab-${gameId}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`${idPrefix}-panel-${gameId}`}
                        tabIndex={isActive ? 0 : -1}
                        className={isActive ? "is-active" : undefined}
                        onClick={() => setActiveGame(gameId)}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                            event.preventDefault();
                            const next = GAME_IDS[(GAME_IDS.indexOf(gameId) + 1) % GAME_IDS.length];
                            setActiveGame(next);
                            document.getElementById(`${idPrefix}-tab-${next}`)?.focus();
                          }
                          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                            event.preventDefault();
                            const next = GAME_IDS[(GAME_IDS.indexOf(gameId) + GAME_IDS.length - 1) % GAME_IDS.length];
                            setActiveGame(next);
                            document.getElementById(`${idPrefix}-tab-${next}`)?.focus();
                          }
                        }}
                      >
                        <span>{GAME_META[gameId].short}</span>
                        {progress.games[gameId] && <b aria-label="Complete">✓</b>}
                      </button>
                    );
                  })}
                </div>
                <div className="ej-game-panels" key={resetVersion}>
                  <div id={`${idPrefix}-panel-pathway-order`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-pathway-order`} hidden={activeGame !== "pathway-order"}>
                    <PathwayOrderGame completed={progress.games["pathway-order"]} onComplete={() => completeGame("pathway-order")} />
                  </div>
                  <div id={`${idPrefix}-panel-product-branch`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-product-branch`} hidden={activeGame !== "product-branch"}>
                    <ProductBranchGame completed={progress.games["product-branch"]} onComplete={() => completeGame("product-branch")} />
                  </div>
                  <div id={`${idPrefix}-panel-evidence-sort`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-evidence-sort`} hidden={activeGame !== "evidence-sort"}>
                    <EvidenceSortGame completed={progress.games["evidence-sort"]} onComplete={() => completeGame("evidence-sort")} />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <footer className="ej-footer">
            <p><span aria-hidden="true">✦</span> These exercises teach a way to reason; they do not report experimental results.</p>
            <button type="button" className="ej-clear" onClick={resetProgress}>Reset saved notes</button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}

export default ExpeditionJournal;
