import { surface, type Painter } from "./paint";
import { npcPersonFrame } from "./sprites";
import type { FieldDefinition } from "./field-sites";

const cache = new Map<string, Painter>();
export function fieldSprite(site: FieldDefinition): Painter {
  const saved = cache.get(site.id);
  if (saved) return saved;
  const p = surface(58, 48), c = p.ctx;
  const r = (x: number, y: number, w: number, h: number, colour: string) => { c.fillStyle = colour; c.fillRect(x, y, w, h); };
  const ink = "#06221f", wood = "#b5814a", cream = "#fdf6e3", dark = "#5e3c22", green = "#a8dc3c";
  r(10, 43, 39, 3, "#64715c");
  if (site.kind !== "item") {
    const sprite = npcPersonFrame({ tint: "#c4a8ff", accent: cream, accessory: "satchel" }, "down", 0);
    c.drawImage(sprite.canvas, 21, 24);
      r(5, 28, 3, 16, dark); r(0, 18, 14, 13, ink); r(2, 20, 10, 9, "#bca4df"); r(4, 24, 7, 2, ink);
      r(2, 17, 10, 3, cream); r(12, 12, 2, 12, wood); r(14, 12, 7, 5, "#cdf558");
      r(44, 17, 3, 27, dark); r(41, 17, 9, 3, ink); r(42, 13, 7, 7, cream); r(44, 14, 3, 4, "#f7a52d");
  } else {
    // A small specimen stand, separate from all original world props.
    r(14, 31, 30, 5, ink); r(16, 30, 26, 4, wood); r(18, 36, 3, 8, dark); r(37, 36, 3, 8, dark);
    if (site.id === "salt") {
      r(23, 14, 9, 16, "#bddfd8"); r(20, 21, 5, 9, "#7eb7ac"); r(25, 10, 5, 16, cream); r(29, 16, 6, 14, "#e1f1e4"); r(24, 14, 2, 12, "#ffffff");
    } else if (site.id === "hub") {
      for (let i = 0; i < 5; i++) { const x = 17 + i * 5, y = 19 + (i % 2) * 5; r(x, y, 6, 2, ink); r(x, y - 2, 4, 4, "#f7a52d"); r(x, y - 2, 2, 1, cream); }
    } else if (site.id === "tf2146") {
      r(18, 14, 23, 17, ink); r(20, 15, 19, 14, cream); r(20, 15, 3, 14, green);
      for (let i = 0; i < 3; i++) r(26, 18 + i * 3, 9 - i, 1, "#17544a"); r(36, 12, 2, 17, "#c4a8ff");
    } else if (site.id === "branches") {
      r(15, 16, 29, 15, ink); r(17, 17, 25, 12, cream); r(28, 19, 2, 9, "#17544a");
      ["#f7a52d", "#e65c42", "#e9c43a", "#ee7a3a"].forEach((colour, i) => { r(19 + (i % 2) * 14, 19 + Math.floor(i / 2) * 6, 5, 3, colour); });
    } else if (site.id === "reactor") {
      r(18, 11, 23, 3, ink); r(18, 28, 23, 3, ink);
      for (let i = 0; i < 3; i++) { r(20 + i * 7, 14, 4, 14, "#a7c9b6"); r(21 + i * 7, 17, 2, 10, green); r(21 + i * 7, 14, 1, 8, cream); }
    } else {
      r(20, 12, 20, 19, ink); r(22, 14, 16, 15, cream); r(27, 16, 7, 6, "#17544a"); r(29, 17, 3, 4, cream); r(25, 21, 11, 7, "#17544a"); r(29, 23, 3, 3, green);
    }
    // A little field label below the display surface.
    r(25, 36, 9, 5, cream); r(27, 38, 5, 1, "#17544a");
  }
  cache.set(site.id, p);
  return p;
}
