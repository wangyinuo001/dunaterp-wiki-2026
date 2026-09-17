import type { CSSProperties } from "react";
import type { StoryBeat } from "./story";
import { StoryGlyph } from "./StoryGlyph";
const voices = [
  { name: "Consumer", topic: "Food · safety", tone: "#f6be70" },
  { name: "Producer", topic: "Scale · resources", tone: "#e98658" },
  { name: "Environment", topic: "Biosafety", tone: "#b6d966" },
  { name: "Researcher", topic: "Public needs", tone: "#a6cbbd" },
];
export function StoryIllustration({ beat }: { beat: StoryBeat }) {
  const stagger = (index: number) => ({ "--item": index } as CSSProperties);
  switch (beat.visual) {
    case "needs": case "resources":
      return <div className="story-items">{([['pigment', 'Colour'], ['food', 'Nutrition'], ['plant', 'Natural resources']] as const).map(([kind, label], i) => <div className="story-item" key={kind} style={stagger(i)}><StoryGlyph kind={kind} /><span>{label}</span></div>)}</div>;
    case "alga": case "traits":
      return <div className="story-discovery"><div className="story-specimen"><StoryGlyph kind="alga" /><span>Dunaliella salina</span></div>{beat.visual === "traits" && <ul className="story-loot">{["SALT TOLERANCE", "β-CAROTENE CHASSIS", "SOLAR-POWERED CELL FACTORY"].map((text, i) => <li key={text} style={stagger(i)}>+ {text}</li>)}</ul>}</div>;
    case "hub": case "products":
      return <div className="story-pathway" aria-label="Design concept: Dunaliella, engineered chassis, beta-carotene hub, candidate terpenoids">
        <div className="story-specimen"><StoryGlyph kind="alga" /><span>Engineered Dunaliella</span></div><span className="story-arrow" aria-hidden="true">↓</span><div className="story-hub">β-CAROTENE HUB</div>
        {beat.visual === "products" && <><span className="story-arrow" aria-hidden="true">↓</span><div className="story-products">{["Astaxanthin", "β-ionone", "Crocetin"].map((text, i) => <span key={text} style={stagger(i)}>{text}</span>)}</div><small>Candidate routes · food applications are a design goal</small></>}
      </div>;
    case "voices":
      return <div className="story-voices">{voices.map((voice, i) => <div key={voice.name} className={`story-voice${beat.voice === i ? " is-speaking" : ""}${beat.voice !== undefined && beat.voice !== i ? " is-quiet" : ""}`} style={stagger(i)}><StoryGlyph kind={i === 2 ? "plant" : "person"} tone={voice.tone} /><strong>{voice.name}</strong><span>{voice.topic}</span>{beat.voice === i && <b aria-hidden="true">…</b>}</div>)}<small>Illustrative stakeholder questions, not interview quotations.</small></div>;
    case "decisions":
      return <div className="story-signposts"><p>REAL-WORLD QUESTIONS <span>→</span> DESIGN DECISIONS</p>{[["SUSTAINABILITY", "Photosynthetic chassis"], ["FOOD", "Food-grade platform goal"], ["BIOSAFETY", "Biocontainment system"]].map(([from, to], i) => <div key={from} style={stagger(i)}><strong>{from}</strong><span aria-hidden="true">→</span><span>{to}</span></div>)}<b>DUNATERP</b></div>;
    case "journey":
      return <div className="story-quest"><StoryGlyph kind="person" /><p>QUEST UNLOCKED</p><h2>The Salt Route</h2><span>Discover the science. Meet the people.</span></div>;
  }
}
