import { useEffect, useId, useRef, type CSSProperties } from "react";
import type { StationCopy } from "./pixel/station-copy";
import "./station-dialogue.css";

type StationDialogueProps = {
  station: StationCopy;
  onClose: () => void;
};

/** A route-native information board. It explains a stop without leaving the map. */
export function StationDialogue({ station, onClose }: StationDialogueProps) {
  const panelRef = useRef<HTMLElement>(null);
  const titleId = `${useId().replace(/:/g, "")}-station-title`;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "e") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          panelRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [],
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <section
      ref={panelRef}
      className="station-dialogue"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{ "--station-accent": station.color } as CSSProperties}
    >
      <header className="station-dialogue__header">
        <span>{station.index}</span>
        <div>
          <p>{station.kicker}</p>
          <h2 id={titleId}>{station.title}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label={`Close ${station.title}`}>×</button>
      </header>

      <p className="station-dialogue__lead">{station.panelLead}</p>

      <div className="station-dialogue__points">
        {station.panelPoints.map((point) => (
          <article key={point.label}>
            <strong>{point.label}</strong>
            <p>{point.text}</p>
          </article>
        ))}
      </div>

      <footer>
        <span>Full project chapters are available from the navigation above.</span>
        <button type="button" onClick={onClose}>RETURN TO THE ROUTE <b aria-hidden="true">▸</b></button>
      </footer>
    </section>
  );
}

export default StationDialogue;
