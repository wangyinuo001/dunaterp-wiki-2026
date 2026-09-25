import { useEffect, useRef } from "react";
import { OPENING_HOOK, STORY_BEATS, type StoryState } from "./story";
import { StoryDialogue } from "./StoryDialogue";
import { StoryIllustration } from "./StoryIllustration";
import "./prologue.css";
export function HomePrologue({ state, onNext, onSkip }: { state: StoryState; onNext: () => void; onSkip: () => void }) {
  const host = useRef<HTMLElement>(null);
  const opening = state.phase === "OPENING";
  const transition = state.phase === "TRANSITION";
  const beat = STORY_BEATS[state.beat];
  useEffect(() => {
    if (transition) host.current?.focus({ preventScroll: true });
  }, [transition]);
  return <section ref={host} tabIndex={-1} className={`home-prologue${opening ? " is-opening" : ""}${transition ? " is-transition" : ""}`} data-story-state={state.phase} aria-label="DunaTerp story prologue"
    onKeyDown={(event) => {
      if (event.key === "Tab") {
        const buttons = [...(host.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && (document.activeElement === first || document.activeElement === host.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if ((event.key === "Enter" || event.key === " ") && event.target === host.current) {
        event.preventDefault();
        if (!transition && !event.repeat) host.current?.querySelector<HTMLButtonElement>(".story-dialogue-button")?.click();
      }
    }}>
    <div className="story-atmosphere" aria-hidden="true"><div className="story-fog" />{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${8 + i * 7}%`, top: `${12 + (i * 17) % 60}%`, animationDelay: `${-i * 1.7}s` }} />)}</div>
    {!transition && <button type="button" className="story-skip" onClick={onSkip}>SKIP INTRO <span aria-hidden="true">↗</span></button>}
    {transition ? null : opening ? <>
      <div className="story-title"><p>SALT · LIGHT · POSSIBILITY</p><h1>DUNA<span>TERP</span></h1><small>SCU-CHINA · iGEM 2026</small><h2>ONE TINY ALGA.<br />A BRIGHTER TOMORROW.</h2></div>
      <StoryDialogue key="opening" opening speaker="A story from the salt lake" text={OPENING_HOOK} label="PRESS ENTER TO BEGIN" delay={2400} onNext={onNext} />
    </> : <>
      <header className="story-chapter"><span>DUNATERP / PROLOGUE</span><h1>{beat.chapter}</h1></header>
      <div key={`art-${state.beat}`} className="story-scene-art"><StoryIllustration beat={beat} /></div>
      <div className="story-dialogue-cluster">
        <StoryDialogue key={state.beat} speaker={beat.speaker} speakerTone={beat.speakerTone} text={beat.text} label={state.beat === STORY_BEATS.length - 1 ? "START THE SALT ROUTE" : "Continue"} onNext={onNext} />
        <div className="story-progress" aria-label={`Story ${state.beat + 1} of ${STORY_BEATS.length}`}>{STORY_BEATS.map((_, i) => <i key={i} className={i <= state.beat ? "is-complete" : ""} />)}</div>
      </div>
    </>}
    {!transition && <p className="story-controls-hint">Click · Enter · Space <span> / Reveal · Continue</span></p>}
  </section>;
}
