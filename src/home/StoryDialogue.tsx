import { useCallback, useEffect, useRef, useState } from "react";
import { StoryGlyph } from "./StoryGlyph";
export function StoryDialogue({ text, speaker, label = "Continue", delay = 0, onNext, opening = false }: {
  text: string; speaker: string; label?: string; delay?: number; onNext: () => void; opening?: boolean;
}) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [count, setCount] = useState(reduce ? text.length : 0);
  const [revealed, setRevealed] = useState(false);
  const next = useRef<HTMLButtonElement>(null);
  const complete = revealed || count >= text.length;
  const advance = useCallback(() => {
    if (!complete) setRevealed(true);
    else onNext();
  }, [complete, onNext]);
  useEffect(() => {
    next.current?.focus({ preventScroll: true });
    if (reduce || revealed) return;
    let frame = 0;
    let elapsed = 0;
    let previous = performance.now();
    const visibility = () => { previous = performance.now(); };
    document.addEventListener("visibilitychange", visibility);
    const tick = (now: number) => {
      if (!document.hidden) elapsed += now - previous;
      previous = now;
      const chars = Math.min(text.length, Math.max(0, Math.floor((elapsed - delay) / 19)));
      setCount(chars);
      if (chars < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
  }, [text, delay, reduce, revealed]);
  return <div className={`story-dialogue${opening ? " story-dialogue--opening" : ""}`}>
    {!opening && <div className="story-portrait"><StoryGlyph kind="person" /><span>FIELD NOTES</span></div>}
    <button ref={next} type="button" className="story-dialogue-button" onClick={advance}
      onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && event.repeat) event.preventDefault(); }}>
      <span className="story-speaker">{speaker}</span>
      <span className="story-text" aria-hidden="true"><span className="story-text-reserve">{text}</span><span className="story-text-ink">{complete ? text : text.slice(0, count)}{!complete && <i className="story-cursor" />}</span></span>
      <span className="story-sr">{text}</span>
      <span className="story-next">{complete ? label : "Reveal text"} <span aria-hidden="true">▸</span></span>
    </button>
  </div>;
}
