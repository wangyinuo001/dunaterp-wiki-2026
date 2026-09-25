import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
  useState,
  type ComponentType,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { PixelEngine, type Mode } from "./pixel/engine";
import { STATION_COPY } from "./pixel/station-copy";
import { ExpeditionJournal, recordNpcVisit } from "./ExpeditionJournal";
import { NpcDialogue } from "./NpcDialogue";
import { StationDialogue } from "./StationDialogue";
import type { Npc } from "./pixel/npc-data";
import { navigation } from "./site-data";
import { HomePrologue } from "./home/HomePrologue";
import { initialStory, STORY_BEATS, storyReducer } from "./home/story";

type HeaderProps = { light?: boolean };
const GROUP_ACCENTS = ["#cdf558", "#7de2ff", "#e9c43a", "#c4a8ff"];

function LoadingScreen({ ratio }: { ratio: number }) {
  const cells = 24;
  const filled = Math.round(ratio * cells);
  return (
    <div className="px-loading" role="status" aria-live="polite">
      <p className="px-loading-title">DUNATERP</p>
      <p className="px-loading-sub">Surveying the salt flats…</p>
      <div className="px-meter" aria-hidden="true">
        {Array.from({ length: cells }, (_, index) => (
          <i key={index} className={index < filled ? "is-on" : undefined} />
        ))}
      </div>
      <p className="px-loading-pct">{Math.round(ratio * 100)}%</p>
    </div>
  );
}

export function PixelWorld({ Header }: { Header: ComponentType<HeaderProps> }) {
  const navigate = useNavigate();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PixelEngine | null>(null);
  const scrollLock = useRef(0);
  const archiveTimer = useRef<number | null>(null);

  const [npcPrompt, setNpcPrompt] = useState<Npc | null>(null);
  const [dialogueNpc, setDialogueNpc] = useState<Npc | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<Mode>("guided");
  const [chapter, setChapter] = useState(-1);
  const [promptKey, setPromptKey] = useState<string | null>(null);
  const [stationDialogueKey, setStationDialogueKey] = useState<string | null>(null);
  const [atArchive, setAtArchive] = useState(false);
  const [started, setStarted] = useState(false);
  const [story, dispatchStory] = useReducer(storyReducer, false, initialStory);
  const isStory = story.phase !== "WORLD" && !failed;
  const promptStation = useMemo(
    () => STATION_COPY.find((item) => item.key === promptKey) ?? null,
    [promptKey],
  );
  const stationDialogue = useMemo(
    () => STATION_COPY.find((item) => item.key === stationDialogueKey) ?? null,
    [stationDialogueKey],
  );

  useEffect(() => {
    if (!isStory) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = previous; };
  }, [isStory]);

  useEffect(() => {
    if ((!dialogueNpc && !stationDialogue) || mode === "free") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [dialogueNpc, stationDialogue, mode]);

  useEffect(() => {
    const host = stage.current;
    const surface = canvas.current;
    if (!host || !surface) return;

    let engine: PixelEngine | null = null;
    try {
      engine = new PixelEngine(surface, host, {
        onLoadProgress: setProgress,
        onReady: () => setReady(true),
        onIntroComplete: () => {
          dispatchStory("ARRIVED");
          requestAnimationFrame(() => canvas.current?.focus({ preventScroll: true }));
        },
        onMode: setMode,
        onChapter: setChapter,
        interactableStationKeys: STATION_COPY.map((station) => station.key),
        onPrompt: (station) => setPromptKey(
          station ? station.key : null,
        ),
        onEnter: (station) => {
          engineRef.current?.setPaused(true);
          setStationDialogueKey(station.key);
        },
        onNpcPrompt: setNpcPrompt,
        onNpcInteract: (npc) => {
          recordNpcVisit(npc.id);
          engineRef.current?.setPaused(true);
          setDialogueNpc(npc);
        },
      });
    } catch (error) {
      console.error("DunaTerp world failed to start", error);
      requestAnimationFrame(() => setFailed(true));
      return;
    }
    engineRef.current = engine;
    engine.beginIntro();
    void engine.start().catch((error: unknown) => {
      console.error("DunaTerp world failed to prepare", error);
      if (engineRef.current === engine) { engine?.dispose(); setFailed(true); }
    });

    return () => {
      engine?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || failed) return;
    const engine = engineRef.current;
    if (story.phase === "OPENING") engine?.beginIntro();
    else if (story.phase === "TRANSITION") engine?.endIntro();
    else if (story.phase !== "WORLD") {
      const shot = STORY_BEATS[story.beat].shot;
      engine?.setIntroShot(shot.u, shot.x, shot.y);
    }
  }, [ready, failed, story]);

  // Guided mode: page scroll drives the walk.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const update = () => {
      const engine = engineRef.current;
      if (!engine || engine.mode === "free" || isStory) return;
      const top = node.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, node.offsetHeight - window.innerHeight);
      const value = (window.scrollY - top) / travel;
      engine.setScrollProgress(value);
      setStarted(value > 0.012);
      if (value >= 0.997) {
        if (!atArchive && archiveTimer.current === null) {
          archiveTimer.current = window.setTimeout(() => {
            archiveTimer.current = null;
            setAtArchive(true);
          }, 900);
        }
      } else {
        if (archiveTimer.current !== null) window.clearTimeout(archiveTimer.current);
        archiveTimer.current = null;
        setAtArchive(false);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (archiveTimer.current !== null) window.clearTimeout(archiveTimer.current);
      archiveTimer.current = null;
    };
  }, [isStory, ready, atArchive]);

  // Free mode pins the document so wandering never scrolls the page away from
  // the world, and hands the scroll position back at the point the hero left.
  useEffect(() => {
    if (mode !== "free") return;
    const node = root.current;
    const body = document.body;
    const y = window.scrollY;
    scrollLock.current = y;
    const nodeTop = node ? node.getBoundingClientRect().top + y : 0;
    const travel = node ? Math.max(1, node.offsetHeight - window.innerHeight) : 1;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `${-y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      const engine = engineRef.current;
      // Hand the page back at wherever the hero actually ended up, so leaving
      // free roam never loses the reader's place in the document.
      const restore = node && engine ? nodeTop + engine.journey * travel : scrollLock.current;
      window.scrollTo(0, restore);
    };
  }, [mode]);

  const toggleMode = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !ready || failed) return;
    if (engine.mode === "free") engine.exitFree();
    else { engine.enterFree(); canvas.current?.focus({ preventScroll: true }); }
  }, [ready, failed]);

  const restart = useCallback(() => {
    const engine = engineRef.current;
    const wasFree = engine?.mode === "free";
    if (wasFree) engine?.exitFree();
    if (archiveTimer.current !== null) window.clearTimeout(archiveTimer.current);
    archiveTimer.current = null;
    setAtArchive(false);
    const scroll = () => {
      const node = root.current;
      if (!node) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: node.offsetTop, behavior: reduce ? "instant" : "smooth" });
    };
    // The body is still pinned on this tick when leaving free roam; wait for
    // React to run the unpin cleanup before scrolling.
    if (wasFree) requestAnimationFrame(() => requestAnimationFrame(scroll));
    else scroll();
  }, []);

  const closeNpcDialogue = useCallback(() => {
    setDialogueNpc(null);
    engineRef.current?.setPaused(false);
    requestAnimationFrame(() => requestAnimationFrame(() => canvas.current?.focus({ preventScroll: true })));
  }, []);

  const closeStationDialogue = useCallback(() => {
    setStationDialogueKey(null);
    engineRef.current?.setPaused(false);
    requestAnimationFrame(() => requestAnimationFrame(() => canvas.current?.focus({ preventScroll: true })));
  }, []);

  const replayIntro = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !ready || failed) return;
    setDialogueNpc(null);
    setStationDialogueKey(null);
    setStarted(false);
    setAtArchive(false);
    engine.beginIntro();
    window.scrollTo(0, 0);
    dispatchStory("REPLAY");
  }, [ready, failed]);

  const activeChapter = chapter >= 0 ? STATION_COPY[chapter] : null;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={root}
      className={`px-world${isStory ? " is-prologue" : ""}${story.phase === "TRANSITION" ? " is-handoff" : ""}${ready ? " is-ready" : ""}${started ? " is-started" : ""}${mode === "free" ? " is-free" : ""}${atArchive ? " is-archive" : ""}${failed ? " has-failed" : ""}${dialogueNpc || stationDialogue ? " has-dialogue" : ""}`}
    >
      <div className="home-world-header" inert={isStory}><Header light /></div>

      <div className="px-sticky">
        <div
          ref={stage}
          className="px-stage"
          aria-label="A pixel-art salt lake you can walk through"
        >
          <canvas inert={isStory} ref={canvas} className="px-canvas" tabIndex={0} aria-label="Salt lake exploration. Use WASD or arrow keys to move; E to interact with a nearby guide; Escape to return to guided mode." />
        </div>

        {!ready && !failed && <LoadingScreen ratio={progress} />}
        {failed && <div className="px-loading" role="alert"><p>The salt lake could not load.</p><Link className="px-button" to="/wiki-map">Read all project chapters</Link><button className="px-button" type="button" onClick={() => window.location.reload()}>Try again</button></div>}

        {ready && isStory && <HomePrologue state={story} onNext={() => dispatchStory("NEXT")} onSkip={() => dispatchStory("SKIP")} />}

        <div className="px-world-ui" inert={isStory || !ready || failed}>
        {mode === "free" && <ExpeditionJournal
          currentStationKey={npcPrompt?.stationKey ?? promptKey ?? activeChapter?.key ?? null}
          onOpenChange={(open) => { engineRef.current?.setPaused(open); if (!open) requestAnimationFrame(() => requestAnimationFrame(() => canvas.current?.focus({ preventScroll: true }))); }}
          onTravel={(key) => { engineRef.current?.travelToStation(key); canvas.current?.focus({ preventScroll: true }); }}
        />}
        {npcPrompt && mode === "free" && !dialogueNpc && !stationDialogue && <div className="px-prompt" style={{ "--px-accent": npcPrompt.accent } as React.CSSProperties}>
          <span className="px-prompt-key">E</span>
          <div><p>{npcPrompt.role} · OFF-ROUTE FIELD GUIDE</p><button type="button" onClick={() => engineRef.current?.talkToNpc()}>Talk to {npcPrompt.name}</button></div>
        </div>}

        {promptStation && !dialogueNpc && !stationDialogue && (
          <button
            type="button"
            className="px-prompt px-station-prompt"
            onClick={() => engineRef.current?.interact()}
            style={{ "--px-accent": promptStation.color } as React.CSSProperties}
          >
            <span className="px-prompt-key">E</span>
            <div>
              <p>{promptStation.index} · ROUTE NOTE</p>
              <strong>View {promptStation.title}</strong>
            </div>
          </button>
        )}

        {mode === "free" && !dialogueNpc && <div className="px-dpad" role="group" aria-label="Movement controls">
          {([['w', '↑', 'Move up'], ['a', '←', 'Move left'], ['s', '↓', 'Move down'], ['d', '→', 'Move right']] as const).map(([key, symbol, label]) => (
            <button key={key} type="button" aria-label={label}
              onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); engineRef.current?.setMoveKey(key, true); }}
              onPointerUp={() => engineRef.current?.setMoveKey(key, false)}
              onPointerCancel={() => engineRef.current?.setMoveKey(key, false)}
              onLostPointerCapture={() => engineRef.current?.setMoveKey(key, false)}
              onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); engineRef.current?.setMoveKey(key, true); } }}
              onKeyUp={() => engineRef.current?.setMoveKey(key, false)}
              onBlur={() => engineRef.current?.setMoveKey(key, false)}>{symbol}</button>
          ))}
        </div>}

        {!dialogueNpc && !stationDialogue && !atArchive && <div className="px-controls">
          <button type="button" className="story-replay" onClick={replayIntro} disabled={!ready || failed}>PLAY INTRO ↺</button>
          <button
            type="button"
            className={`px-mode${mode === "free" ? " is-on" : ""}`}
            onClick={toggleMode}
            aria-pressed={mode === "free"}
            disabled={!ready || failed}
          >
            {mode === "free" ? "Back to the route" : "Free roam"}
          </button>
          {mode === "free" && <p className="px-touch-help">Hold arrows or drag the lake to move. Use the Talk button near a guide.</p>}
          {mode === "free" && (
            <p className="px-mode-help">
              <kbd>WASD</kbd> move · <kbd>Shift</kbd> run · <kbd>E</kbd> talk · <kbd>Esc</kbd> return
            </p>
          )}
        </div>}

        {dialogueNpc && (
          <NpcDialogue npcId={dialogueNpc.id} onClose={closeNpcDialogue} />
        )}

        {stationDialogue && (
          <StationDialogue station={stationDialogue} onClose={closeStationDialogue} />
        )}

        {!dialogueNpc && !stationDialogue && !atArchive && <button type="button" className="px-restart" onClick={restart} aria-label="Return to the trailhead">↑</button>}

        <div className="px-route" aria-hidden="true">
          {STATION_COPY.map((station) => (
            <i
              key={station.key}
              className={activeChapter?.key === station.key ? "is-on" : undefined}
              style={{ left: `${station.u * 100}%`, background: station.color }}
            />
          ))}
        </div>

        <section className="px-archive" inert={!atArchive || mode === "free"} aria-label="DunaTerp wiki index">
          <header>
            <p>FIELD ARCHIVE</p>
            <h2>Open any Wiki chapter.</h2>
          </header>
          <div className="px-archive-grid">
            {navigation.map((group, index) => (
              <section key={group.label} style={{ "--px-accent": GROUP_ACCENTS[index] } as React.CSSProperties}>
                <p className="px-archive-index">{String(index + 1).padStart(2, "0")}</p>
                <h3>{group.label}</h3>
                <nav aria-label={group.label}>
                  {group.items.map(([label, href]) => (
                    <button type="button" className="px-archive-card" key={href} onClick={() => navigate(href)}>{label}<b aria-hidden="true">→</b></button>
                  ))}
                </nav>
              </section>
            ))}
          </div>
          <footer>
            <Link className="px-button px-button--primary" to="/wiki-map">Open the full wiki map ↗</Link>
            <button type="button" className="px-button" onClick={restart}>Walk it again ↑</button>
          </footer>
        </section>

        </div>
      </div>

      <div className="px-scroll-story" inert={ready || isStory}>
        <div className="px-scroll-lead" aria-hidden="true" />
        {STATION_COPY.map((station, index) => (
          <section
            key={station.key}
            className={`px-scroll-chapter${index % 2 ? " is-right" : ""}`}
            style={{ "--px-accent": station.color } as React.CSSProperties}
            aria-labelledby={`px-chapter-${station.index}`}
          >
            <button type="button" className="px-fallback-card" onClick={() => navigate(station.route)}>
              <p className="px-chapter-tag"><span>{station.index} / 04</span>{station.kicker}</p>
              <h2 id={`px-chapter-${station.index}`}>{station.title}</h2>
              <p>{station.body}</p>
              <span className="px-card-action">Explore chapter →</span>
            </button>
          </section>
        ))}
        <div className="px-archive-space" aria-hidden="true" />
      </div>
    </main>
  );
}

export default PixelWorld;
