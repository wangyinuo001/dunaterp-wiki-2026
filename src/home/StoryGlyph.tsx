type GlyphKind = "alga" | "pigment" | "food" | "plant" | "person" | "hero" | "shield" | "sun";
/** Small original vector pixel glyphs; no downloaded artwork or image requests. */
export function StoryGlyph({ kind, tone = "#cdf558" }: { kind: GlyphKind; tone?: string }) {
  return <svg className="story-glyph" viewBox="0 0 32 32" fill="none" aria-hidden="true" shapeRendering="crispEdges">
    {kind === "alga" ? <><path d="M10 10V7h3V4h2v5m7 1V6h-2V2h-2v7" stroke={tone} strokeWidth="2" /><path d="M10 9h12v3h4v13h-4v4H10v-4H6V12h4z" fill={tone} /><path d="M11 13h10v11H11z" fill="#589558" /><path d="M13 16h6v6h-6z" fill="#ffcd74" /><path d="M21 12h3v3h-3z" fill="#f0794e" /></> :
    kind === "pigment" ? <><path d="M14 3h4v5h4v5h4v11h-4v4H10v-4H6V13h4V8h4z" fill="#f49a61" /><path d="M10 17h4v7h-4z" fill="#fff5db" /></> :
    kind === "food" ? <><path d="M3 16h26v5h-4v5H7v-5H3z" fill="#f3dcac" /><path d="M8 13h5v3H8zm10-4h5v7h-5z" fill={tone} /><path d="M8 5h2v5H8zm9-3h2v5h-2z" fill="#fff5db" /></> :
    kind === "plant" ? <><path d="M15 11h3v18h-3z" fill="#8faf62" /><path d="M3 5h8v4h5v9H8v-4H3zm15 11V7h6V3h6v9h-5v4z" fill={tone} /><path d="M8 28h16v3H8z" fill="#a38a60" /></> :
    kind === "hero" ? <><path d="M10 2h12v2h2v5H8V4h2z" fill="#fdf6e3" /><path d="M10 6h12v3H10z" fill="#a8dc3c" /><path d="M4 9h24v4H4z" fill="#fdf6e3" /><path d="M9 13h14v8H9z" fill="#deb78b" /><path d="M11 16h2v2h-2zm8 0h2v2h-2z" fill="#06221f" /><path d="M6 21h20v8H6z" fill="#17544a" /><path d="M10 22h12v6H10z" fill="#7cc45a" /><path d="M10 24h12v2H10z" fill="#cdf558" /><path d="M9 29h5v3H9zm9 0h5v3h-5z" fill="#5e3c22" /></> :
    kind === "shield" ? <><path d="M5 4h22v16h-4v5h-4v4h-6v-4H9v-5H5z" fill={tone} /><path d="m10 14 4 4 8-8" stroke="#06221f" strokeWidth="3" /></> :
    kind === "sun" ? <><path d="M11 9h10v3h3v9h-3v3H11v-3H8v-9h3zM14 1h4v5h-4zm0 26h4v4h-4zM1 14h5v4H1zm26 0h4v4h-4z" fill="#ffcd74" /></> :
    <><path d="M10 4h12v3h3v6H7V7h3z" fill={tone} /><path d="M10 13h12v8H10z" fill="#deb78b" /><path d="M7 21h18v7H7z" fill={tone} /><path d="M11 28h4v4h-4zm7 0h4v4h-4z" fill="#eadcb9" /><path d="M12 15h2v2h-2zm6 0h2v2h-2z" fill="#06221f" /></>}
  </svg>;
}
