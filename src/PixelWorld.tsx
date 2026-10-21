import { renderInlineText } from './inline-text';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
import type { Npc } from "./pixel/npc-data";
import { archiveNavigation } from "./site-data";
import { HomePrologue } from "./home/HomePrologue";
import { initialStory, STORY_BEATS, storyReducer } from "./home/story";

type HeaderProps = { light?: boolean };
const GROUP_ACCENTS = ["#cdf558", "#f7a52d", "#e65c42", "#91e6b0", "#c4a8ff"];
const ROUTE_EGGS = [
  {
    key: "protein",
    chapter: 2,
    label: "PROTEIN DOCKING",
    hook: "What does CPP2146 recognise?",
    href: "/protein",
    accent: "#7de2ff",
    x: "13%",
    y: "34%",
  },
  {
    key: "model",
    chapter: 3,
    label: "MODEL",
    hook: "What actually moves the flux?",
    href: "/model",
    accent: "#c4a8ff",
    x: "12%",
    y: "36%",
  },
  {
    key: "hardware",
    chapter: 3,
    label: "HARDWARE MODEL",
    hook: "Can light reach every cell?",
    href: "/hardware",
    accent: "#7de2ff",
    x: "74%",
    y: "48%",
  },
] as const;

function LoadingScreen({ ratio }: { ratio: number }) {
  const percent = Math.round(ratio * 100);
  return (
    <div className="px-loading" role="status" aria-live="polite">
      <div className="px-loading-crest" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <p className="px-loading-title">DUNATERP</p>
      <div
        className="px-loader-scene"
        role="progressbar"
        aria-label="Loading the salt route"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        style={{ "--px-load": `${percent}%` } as React.CSSProperties}
      ><i /><b /><span /></div>
      <p className="px-loading-sub">Surveying the salt flats…</p>
      <p className="px-loading-pct">{percent}%</p>
    </div>
  );
}

export function PixelWorld({ Header }: { Header: ComponentType<HeaderProps> }) {
  const navigate = useNavigate();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const routeRef = useRef<HTMLElement>(null);
  const engineRef = useRef<PixelEngine | null>(null);
  const scrollLock = useRef(0);
  const archiveTimer = useRef<number | null>(null);

  const [npcPrompt, setNpcPrompt] = useState<Npc | null>(null);
  const [dialogueNpc, setDialogueNpc] = useState<Npc | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [loadingMinimumElapsed, setLoadingMinimumElapsed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<Mode>("guided");
  const [chapter, setChapter] = useState(-1);
  const [atArchive, setAtArchive] = useState(false);
  const [started, setStarted] = useState(false);
  const [story, dispatchStory] = useReducer(storyReducer, false, initialStory);
  const isStory = story.phase !== "WORLD" && !failed;
  const updateRouteUi = useCallback((position: number) => {
    const value = Math.max(0, Math.min(1, position));
    const percent = Math.round(value * 100);
    const currentStopIndex = STATION_COPY.reduce((current, station, index) => station.u <= value ? index : current, -1);
    const route = routeRef.current;
    if (route) {
      route.style.setProperty("--px-journey", `${value * 100}%`);
      const meter = route.querySelector<HTMLElement>('[role="progressbar"]');
      meter?.setAttribute("aria-valuenow", String(percent));
      meter?.setAttribute("aria-valuetext", `${currentStopIndex < 0 ? "Salt Route trailhead" : STATION_COPY[currentStopIndex].title}, ${percent}%`);
      route.querySelectorAll<HTMLElement>("[data-route-stop]").forEach((stop, index) => {
        stop.classList.toggle("is-on", index === currentStopIndex);
      });
    }

    const presences = STATION_COPY.map(() => 0);
    const smoothstep = (start: number, end: number, point: number) => {
      const t = Math.max(0, Math.min(1, (point - start) / (end - start)));
      return t * t * (3 - 2 * t);
    };
    const first = STATION_COPY[0];
    const last = STATION_COPY[STATION_COPY.length - 1];
    if (value <= first.u) {
      presences[0] = smoothstep(0.025, first.u, value);
    } else if (value >= last.u) {
      presences[presences.length - 1] = 1 - smoothstep(last.u + 0.055, 0.975, value);
    } else {
      const fromIndex = STATION_COPY.findIndex((station, index) => (
        index < STATION_COPY.length - 1
        && value >= station.u
        && value < STATION_COPY[index + 1].u
      ));
      const from = STATION_COPY[fromIndex];
      const to = STATION_COPY[fromIndex + 1];
      const segment = (value - from.u) / (to.u - from.u);
      const crossfade = smoothstep(0.34, 0.66, segment);
      presences[fromIndex] = 1 - crossfade;
      presences[fromIndex + 1] = crossfade;
    }
    const dominant = presences.reduce((best, presence, index) => (
      presence > presences[best] ? index : best
    ), 0);
    root.current?.querySelectorAll<HTMLElement>("[data-guided-station]").forEach((panel, index) => {
      const presence = presences[index] ?? 0;
      panel.style.setProperty("--px-station-presence", presence.toFixed(3));
      panel.style.setProperty("--px-station-offset", `${Math.round((1 - presence) * 14)}px`);
      const current = index === dominant && presence > 0.16;
      panel.classList.toggle("is-current", current);
      panel.setAttribute("aria-hidden", String(!current));
      panel.inert = !current;
    });
  }, []);

  useEffect(() => {
    if (!isStory) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = previous; };
  }, [isStory]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingMinimumElapsed(true), 1050);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!dialogueNpc || mode === "free") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [dialogueNpc, mode]);

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
        onJourney: updateRouteUi,
        onChapter: setChapter,
        stationInteractions: false,
        onPrompt: () => undefined,
        onEnter: () => undefined,
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
  }, [updateRouteUi]);

  useEffect(() => {
    if (!ready || failed) return;
    const engine = engineRef.current;
    if (story.phase === "OPENING") engine?.beginIntro();
    else if (story.phase === "WORLD") engine?.finishIntro();
    else if (story.phase === "TRANSITION") engine?.endIntro();
    else {
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
          }, 700);
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

  // Space advances one authored stop at a time in guided mode. Relying on the
  // browser's default page jump could leave the traveller between stations,
  // especially at the trailhead where the lead-in spacer is shorter than the
  // complete scroll journey.
  useEffect(() => {
    if (!ready || failed || isStory || mode === "free") return;
    const advance = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || dialogueNpc) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("button,a,input,textarea,select,option,[contenteditable],[role='button'],[role='link'],[role='dialog']")) return;
      const node = root.current;
      const engine = engineRef.current;
      if (!node || !engine) return;
      const next = [...STATION_COPY.map((station) => station.u), 0.999]
        .find((stop) => stop > engine.journey + 0.025);
      if (next === undefined) return;
      event.preventDefault();
      const top = node.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, node.offsetHeight - window.innerHeight);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: top + next * travel, behavior: reduce ? "instant" : "smooth" });
    };
    window.addEventListener("keydown", advance);
    return () => window.removeEventListener("keydown", advance);
  }, [ready, failed, isStory, mode, dialogueNpc]);

  // Free mode pins the document so wandering never scrolls the page away from
  // the world, and hands the scroll position back at the point the hero left.
  // Lock and restore before paint so mode changes cannot flash the footer.
  useLayoutEffect(() => {
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
      window.scrollTo({ left: 0, top: restore, behavior: "instant" });
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

  const travelToRouteStop = useCallback((position: number) => {
    const engine = engineRef.current;
    const node = root.current;
    if (!engine || !node || !ready || failed || isStory) return;
    const wasFree = engine.mode === "free";
    if (wasFree) engine.exitFree();
    const scroll = () => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, node.offsetHeight - window.innerHeight);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: top + position * travel, behavior: reduce ? "auto" : "smooth" });
    };
    if (wasFree) requestAnimationFrame(() => requestAnimationFrame(scroll));
    else scroll();
  }, [ready, failed, isStory]);

  const closeNpcDialogue = useCallback(() => {
    setDialogueNpc(null);
    engineRef.current?.setPaused(false);
    requestAnimationFrame(() => requestAnimationFrame(() => canvas.current?.focus({ preventScroll: true })));
  }, []);

  const replayIntro = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !ready || failed) return;
    setDialogueNpc(null);
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
      className={`px-world${isStory ? " is-prologue" : ""}${story.phase === "TRANSITION" ? " is-handoff" : ""}${ready ? " is-ready" : ""}${started ? " is-started" : ""}${mode === "free" ? " is-free" : ""}${atArchive ? " is-archive" : ""}${failed ? " has-failed" : ""}${dialogueNpc ? " has-dialogue" : ""}`}
    >
      <div className="home-world-header" inert={isStory}><Header light /></div>

      <div className="px-sticky">
        <div
          ref={stage}
          className="px-stage"
          aria-label="A pixel-art salt lake you can walk through"
        >
          <canvas inert={isStory} ref={canvas} className="px-canvas" tabIndex={0} aria-label="Salt lake exploration. Scroll to follow the route, or use WASD or arrow keys in free roam; E talks to a nearby guide." />
        </div>

        {(!ready || !loadingMinimumElapsed) && !failed && <LoadingScreen ratio={progress} />}
        {failed && <div className="px-loading" role="alert"><p>The salt lake could not load.</p><Link className="px-button" to="/wiki-map">Read all project chapters</Link><button className="px-button" type="button" onClick={() => window.location.reload()}>Try again</button></div>}

        {ready && loadingMinimumElapsed && isStory && <HomePrologue state={story} onNext={() => dispatchStory("NEXT")} onSkip={() => dispatchStory("SKIP")} />}

        <div className="px-world-ui" inert={isStory || !ready || failed}>
        {!started && !dialogueNpc && !atArchive && <>
          <aside className="px-trailhead" aria-label="Salt Route introduction">
            <div className="px-trailhead__mark" aria-hidden="true"><i /><i /><i /></div>
            <div className="px-trailhead__copy">
              <h2>Follow the boardwalk.</h2>
            </div>
          </aside>
          <aside className="px-trailhead__keys" aria-label="Salt Route controls">
            <span><kbd>SCROLL</kbd> / <kbd>SPACE</kbd> travel</span>
            <span>Station notes open automatically</span>
            <span><kbd>FREE ROAM</kbd> meet hidden guides</span>
          </aside>
        </>}
        {mode === "free" && <ExpeditionJournal
          currentStationKey={npcPrompt?.stationKey ?? activeChapter?.key ?? null}
          onOpenChange={(open) => { engineRef.current?.setPaused(open); if (!open) requestAnimationFrame(() => requestAnimationFrame(() => canvas.current?.focus({ preventScroll: true }))); }}
          onTravel={(key) => { engineRef.current?.travelToStation(key); canvas.current?.focus({ preventScroll: true }); }}
        />}
        {npcPrompt && mode === "free" && !dialogueNpc && <div className="px-prompt" style={{ "--px-accent": npcPrompt.accent } as React.CSSProperties}>
          <span className="px-prompt-key">E</span>
          <div><p>{npcPrompt.role} · OFF-ROUTE FIELD GUIDE</p><button type="button" onClick={() => engineRef.current?.talkToNpc()}>Talk to {npcPrompt.name}</button></div>
        </div>}

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

        {!dialogueNpc && (!atArchive || mode === "free") && <div className="px-controls">
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

        {started && mode !== "free" && !dialogueNpc && !atArchive && (
          <div className="px-guided-stations" aria-live="polite">
            {STATION_COPY.map((station, index) => (
              <section
                key={station.key}
                data-guided-station={station.key}
                className={`px-guided-station${index % 2 ? " is-right" : ""}`}
                style={{ "--px-accent": station.color } as React.CSSProperties}
                aria-hidden="true"
                inert
              >
                <header><span>{station.index}</span><p>{station.kicker}</p></header>
                <h2>{station.title}</h2>
                <p>{renderInlineText(station.panelLead)}</p>
                <Link to={station.route}>Explore this chapter <b aria-hidden="true">→</b></Link>
              </section>
            ))}
          </div>
        )}

        {started && mode !== "free" && !dialogueNpc && ROUTE_EGGS
          .filter((egg) => egg.chapter === chapter)
          .map((egg) => (
            <Link
              key={egg.key}
              to={egg.href}
              className="px-route-egg"
              data-egg={egg.key}
              style={{ "--egg-accent": egg.accent, "--egg-x": egg.x, "--egg-y": egg.y } as React.CSSProperties}
              aria-label={`${egg.hook} Open ${egg.label} page`}
            >
              <span className="px-route-egg__artifact" aria-hidden="true"><i /><i /><i /><i /></span>
              <span className="px-route-egg__copy"><small>FOUND · {egg.label}</small><strong>{egg.hook}</strong><em>OPEN PAGE →</em></span>
            </Link>
          ))}

        {!dialogueNpc && !atArchive && <button type="button" className="px-restart" onClick={restart} aria-label="Return to the trailhead">↑</button>}

        <nav
          ref={routeRef}
          className="px-route"
          aria-label="Salt Route stations"
          style={{ "--px-journey": "1.2%" } as React.CSSProperties}
        >
          <div className="px-route-meter" role="progressbar" aria-label="Salt Route progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={1} aria-valuetext="Salt Route trailhead">
            <span className="px-route-fill" aria-hidden="true" />
            <i className="px-route-traveller" aria-hidden="true" />
          </div>
          {STATION_COPY.map((station) => (
            <button
              type="button"
              key={station.key}
              data-route-stop={station.key}
              className={`px-route-stop${station.index === "01" ? " is-first" : ""}${station.index === "04" ? " is-last" : ""}${activeChapter?.key === station.key ? " is-on" : ""}`}
              style={{ left: `${station.u * 100}%`, "--px-accent": station.color } as React.CSSProperties}
              onClick={() => travelToRouteStop(station.u)}
              aria-label={`Go to stop ${station.index}: ${station.short}`}
            >
              <b>{station.index}</b>
              <span className="px-route-stop__line"><i aria-hidden="true" /><span>{station.short}</span></span>
            </button>
          ))}
        </nav>
        <section className="px-archive" inert={!atArchive || mode === "free"} aria-label="DunaTerp wiki index">
          <header>
            <p>FIELD ARCHIVE</p>
            <h2>Open any Wiki chapter.</h2>
          </header>
          <div className="px-archive-grid">
            {archiveNavigation.map((group, index) => (
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
              <p>{renderInlineText(station.body)}</p>
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
