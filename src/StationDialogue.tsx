import { renderInlineText } from './inline-text';
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { StationCopy } from "./pixel/station-copy";
import "./station-dialogue.css";

type StationDialogueProps = {
  station: StationCopy;
  onClose: () => void;
};

/** A route-native information board. It explains a stop without leaving the map. */
export function StationDialogue({ station, onClose }: StationDialogueProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [page, setPage] = useState(0);
  const titleId = `${useId().replace(/:/g, "")}-station-title`;
  const pages = [
    { label: "ROUTE OVERVIEW", navTitle: "OVERVIEW", title: station.panelTitle ?? station.title, text: station.panelLead },
    ...station.panelPoints.map((point) => ({ label: "FIELD NOTE", navTitle: point.label, title: point.label, text: point.text })),
  ];
  const current = pages[page];

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
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPage((currentPage) => Math.max(0, currentPage - 1));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPage((currentPage) => Math.min(pages.length - 1, currentPage + 1));
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
  }, [onClose, pages.length]);

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

      <div className="station-dialogue__spread">
        <aside aria-label="Route note pages">
          <p>{String(page + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</p>
          <div>{pages.map((item, index) => <button key={item.navTitle} type="button" className={index === page ? "is-current" : undefined} onClick={() => setPage(index)} aria-label={`Open page ${index + 1}: ${item.navTitle}`} aria-current={index === page ? "page" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{item.navTitle}</button>)}</div>
        </aside>
        <article className="station-dialogue__page" aria-live="polite">
          <p>{current.label}</p>
          <h3>{current.title}</h3>
          <p>{renderInlineText(current.text)}</p>
          <div className="station-dialogue__stamp" aria-hidden="true"><span>{station.index}</span><b>{station.short}</b></div>
        </article>
      </div>

      <footer>
        <span>Use ← → or the page tabs to inspect this station.</span>
        <div className="station-dialogue__pager">
          <button type="button" onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))} disabled={page === 0}>← PREVIOUS</button>
          {page < pages.length - 1
            ? <button type="button" onClick={() => setPage((currentPage) => Math.min(pages.length - 1, currentPage + 1))}>NEXT NOTE →</button>
            : <button type="button" onClick={onClose}>RETURN TO THE ROUTE <b aria-hidden="true">▸</b></button>}
        </div>
      </footer>
    </section>
  );
}

export default StationDialogue;
