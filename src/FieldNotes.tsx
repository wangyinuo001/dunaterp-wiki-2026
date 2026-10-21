import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fieldSprite } from "./pixel/field-art";
import { FIELD_DEFINITIONS, type FieldDefinition, type FieldProgress } from "./pixel/field-sites";
import "./field-notes.css";

export function FieldIcon({ site }: { site: FieldDefinition }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 116, 96);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(fieldSprite(site).canvas, 0, 0, 116, 96);
  }, [site]);
  return <canvas ref={ref} width={116} height={96} className="fd-icon" aria-hidden="true" />;
}

const PRODUCTS = [
  { name: "Astaxanthin", colour: "#e65c42", text: "A carotenoid product design. Enzyme function and product identity need to be assessed for this branch." },
  { name: "β-Ionone", colour: "#f7a52d", text: "An aroma-compound design based on carotenoid cleavage. Its own pathway and analytical evidence matter." },
  { name: "Crocetin", colour: "#e9c43a", text: "An apocarotenoid design involving cleavage and oxidation steps. This is distinct from the glycosylated compound crocin." },
  { name: "β-Citraurin", colour: "#ee7a3a", text: "An apocarotenoid design reached through a zeaxanthin intermediate. The map represents a separate downstream branch." },
];

function DiscoveryText({ site }: { site: FieldDefinition }) {
  const [branch, setBranch] = useState<number | null>(null);
  return <>
    <p className="fd-body">{site.text}</p>
    {site.id === "branches" && <div className="fd-branches">
      <p className="fd-eyebrow">FOLLOW A BRANCH</p>
      <div>{PRODUCTS.map((product, i) => <button key={product.name} type="button" aria-pressed={branch === i} onClick={() => setBranch(i)} style={{ borderColor: product.colour }}>{product.name}</button>)}</div>
      {branch !== null && <p role="status">{PRODUCTS[branch].text}</p>}
    </div>}
    <Link className="fd-text-link" to={site.route}>Explore the project evidence ↗</Link>
  </>;
}

function FeedbackNote() {
  const [category, setCategory] = useState("Project question");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [composing, setComposing] = useState(false);
  const greeting = "Every visitor notices something different. What should we explain more clearly, test next, or improve on this journey?";
  const note = `DunaTerp — ${category}\n\n${message.trim()}\n\nFrom: ${name.trim() || "A salt lake explorer"}`;
  const mailto = `mailto:scu_igem@163.com?subject=${encodeURIComponent(`DunaTerp feedback: ${category}`)}&body=${encodeURIComponent(note)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(note); setStatus("Feedback copied. You can email it to scu_igem@163.com."); }
    catch { setStatus("Copy is unavailable. Select your message and email it to scu_igem@163.com."); }
  };
  return <div className="fd-feedback">
    {!composing && <><p className="fd-body">{greeting}</p>
    <div className="fd-questions" role="group" aria-label="Feedback type">
      {["Project question", "Suggestion", "Website problem"].map(value => <button type="button" key={value} onClick={() => { setCategory(value); setStatus(""); setComposing(true); }}>{value === "Project question" ? "I have a project question." : value === "Suggestion" ? "I have a suggestion." : "I found a website problem."}</button>)}
      <button type="button" onClick={() => setStatus("Then take a moment to enjoy the lake. There’s still plenty to discover beyond the next bend.")}>Just saying hello.</button>
    </div></>}
    {composing && <><button type="button" className="fd-back" onClick={() => { setComposing(false); setStatus(""); }}>← Back to Noa’s questions</button><div className="fd-letter">
      <h3>A Note for the DunaTerp Team</h3>
      <label>Name or nickname <span>· Optional</span><input maxLength={60} value={name} onChange={event => setName(event.target.value)} autoComplete="off" /></label>
      <label>Your {category.toLowerCase()}<textarea maxLength={800} rows={4} placeholder="Tell us your question, suggestion, or what went wrong…" value={message} onChange={event => { setMessage(event.target.value); setStatus(""); }} /></label>
      <div className="fd-letter-meta"><span>Delivered via your email app to scu_igem@163.com</span><span>{message.length}/800</span></div>
      <div className="fd-actions">
        <a className="fd-primary" href={message.trim() ? mailto : undefined} aria-disabled={!message.trim()} onClick={event => { if (!message.trim()) { event.preventDefault(); return; } setStatus("Send the draft from your email app to share your feedback with the team. This page has not sent your message."); }}>Open email draft ↗</a>
        <button type="button" disabled={!message.trim()} onClick={() => void copy()}>Copy feedback</button>
      </div>
    </div></>}
    {status && <p className="fd-status" role="status">{status}</p>}
  </div>;
}

export function FieldPanel({ site, onClose }: { site: FieldDefinition; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const panel = ref.current;
    panel?.showModal();
    panel?.querySelector<HTMLButtonElement>(".fd-close")?.focus();
    return () => panel?.close();
  }, []);
  return <dialog ref={ref} className="fd-dialog" aria-labelledby="field-panel-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="fd-paper">
      <header className="fd-header"><div><p className="fd-eyebrow">{site.kind === "item" ? "FIELD DISCOVERY" : site.category}</p><h2 id="field-panel-title">{site.title}</h2></div><button type="button" className="fd-close" onClick={onClose} aria-label="Close field note">×</button></header>
      <div className="fd-panel-layout"><div className="fd-specimen"><FieldIcon site={site} /><span>{site.kind === "item" ? site.category : "THE FIELD POST"}</span><small>{site.kind === "item" ? "Illustrated discovery" : "Off the boardwalk"}</small></div>
        <div className="fd-panel-copy">{site.kind === "listener" ? <FeedbackNote /> : <DiscoveryText site={site} />}</div></div>
      <footer className="fd-footer">{site.kind !== "item" && <span>Take your questions back to the project.</span>}<button type="button" className="fd-primary" onClick={onClose}>Back to exploring →</button></footer>
    </div>
  </dialog>;
}

export function DiscoveryArchive({ progress, onPreview, onReset }: { progress: FieldProgress; onPreview?: (id: string) => void; onReset: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedId) detail.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [selectedId]);
  const selected = FIELD_DEFINITIONS.find(site => site.id === selectedId);
  return <section className="fd-archive" aria-label="Discoveries beyond the boardwalk">
    <p className="fd-eyebrow">AN EXPEDITION BEYOND THE BOARDWALK</p>
    <div className="fd-archive-heading"><h2>Small finds. Bigger questions.</h2><span>{progress.collected.length}/6 discoveries</span></div>
    <p>Leave the timber behind. Six illustrated discoveries and Noa’s field post wait on the distant salt flats. Use E or the on-screen prompt when you get close.</p>
    {progress.collected.length === 6 && <div className="fd-complete"><b>✦ Beyond the Boardwalk</b><p>You connected the salt lake, the chassis, the regulatory design and the product platform. Every discovery leads to another question worth testing.</p></div>}
    <div className="fd-discovery-grid">{FIELD_DEFINITIONS.map(site => {
      const found = site.kind === "item" ? progress.collected.includes(site.id) : progress.met.includes(site.id);
      return <div className={`fd-discovery-card${found ? " is-found" : ""}`} key={site.id}>
        <button type="button" onClick={() => setSelectedId(site.id)} aria-pressed={selectedId === site.id}>
          <FieldIcon site={site} /><span><small>{site.kind === "item" ? found ? "RECORDED" : "WAITING TO BE FOUND" : found ? "CONTACT MET" : "DISTANT FIELD CONTACT"}</small><strong>{site.kind === "item" && !found ? "An unrecorded discovery" : site.title}</strong><em>{site.hint}</em></span>{found && <b aria-label="Recorded">✓</b>}
        </button>
        {onPreview && <button type="button" className="fd-preview" onClick={() => onPreview(site.id)}>Local preview · visit this location ↗</button>}
      </div>;
    })}</div>
    {selected && <div ref={detail} className="fd-archive-detail" key={selected.id}>
      <p className="fd-eyebrow">{selected.category}</p><h3>{selected.title}</h3>
      {selected.kind === "listener" ? <FeedbackNote /> : progress.collected.includes(selected.id) ? <DiscoveryText site={selected} /> : <p>{selected.hint} Inspect the display in Free roam to record this discovery.</p>}
    </div>}
    <button type="button" className="fd-feedback-link" onClick={() => setSelectedId("noa")}>✉ Leave a note for the team</button>
    <button type="button" className="fd-reset" onClick={() => { onReset(); setSelectedId(null); }}>Reset discoveries</button>
    <p className="fd-footnote">Discovery progress is saved in this browser. The field objects are illustrations, not experimental samples or results.</p>
  </section>;
}
