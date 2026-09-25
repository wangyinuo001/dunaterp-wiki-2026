import type { CSSProperties } from "react";
import type { StoryBeat } from "./story";
import { StoryGlyph } from "./StoryGlyph";

export function StoryIllustration({ beat }: { beat: StoryBeat }) {
  const stagger = (index: number) => ({ "--item": index } as CSSProperties);

  switch (beat.visual) {
    case "resources":
      return <div className="story-items">
        {([
          ["plant", "Plant extraction"],
          ["food", "Low product abundance"],
          ["pigment", "Land + freshwater demand"],
        ] as const).map(([kind, label], index) => <div className="story-item" key={kind} style={stagger(index)}><StoryGlyph kind={kind} /><span>{label}</span></div>)}
      </div>;

    case "traits":
      return <div className="story-discovery">
        <div className="story-specimen"><StoryGlyph kind="alga" /><span>Dunaliella salina</span></div>
        <ul className="story-loot">{["SALT-ADAPTED CHASSIS", "PHOTOSYNTHETIC CARBON FIXATION", "NATIVE CAROTENOID PATHWAY"].map((text, index) => <li key={text} style={stagger(index)}>+ {text}</li>)}</ul>
      </div>;

    case "products":
      return <div className="story-pathway" aria-label="Dunaliella feeds a beta-carotene hub and four product routes">
        <div className="story-specimen"><StoryGlyph kind="alga" /><span>Engineered Dunaliella</span></div>
        <span className="story-arrow" aria-hidden="true">→</span>
        <div className="story-hub">β-CAROTENE HUB</div>
        <span className="story-arrow" aria-hidden="true">→</span>
        <div className="story-products">{["Astaxanthin", "β-ionone", "Crocetin", "β-citraurin"].map((text, index) => <span key={text} style={stagger(index)}>{text}</span>)}</div>
      </div>;

    case "characterisation":
      return <div className="story-checkpoints" aria-label="Product, cell and process characterisation checkpoints">
        {[
          ["PRODUCT", "Identity · titre · conversion"],
          ["CELL", "Biomass · pathway response"],
          ["PROCESS", "Light · salinity · recovery"],
        ].map(([title, detail], index) => <div key={title} style={stagger(index)}><strong>{title}</strong><span>{detail}</span></div>)}
      </div>;

    case "journey":
      return <div className="story-quest">
        <StoryGlyph kind="hero" />
        <p>YOUR JOURNEY</p>
        <h2>THE SALT ROUTE</h2>
        <span>Follow the story · Meet the guides · Explore freely</span>
      </div>;
  }
}
