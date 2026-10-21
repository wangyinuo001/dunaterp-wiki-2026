import { MAP_W, MAP_H, isBlockedAt, isOnDeck, type World } from "./world-map";
import { TILE } from "./tiles";

export type FieldDefinition = {
  id: string;
  kind: "item" | "listener";
  title: string;
  label: string;
  category: string;
  text: string;
  hint: string;
  route: string;
  u: number;
  side: number;
};
export type FieldSite = FieldDefinition & { x: number; y: number; deckDistance: number };
export type FieldProgress = { collected: string[]; met: string[] };
export const FIELD_STORAGE_KEY = "dunaterpFieldDiscoveriesV1";
export const MIN_FIELD_DISTANCE = 192;

export const FIELD_DEFINITIONS: readonly FieldDefinition[] = [
  { id: "salt", kind: "item", title: "Salt Crystal", label: "SALT CRYSTAL", category: "01 / THE CHASSIS", u: .13, side: -1,
    text: "Life finds a way in salty places. Dunaliella salina is a photosynthetic microalga adapted to saline environments—a starting point for our choice of chassis.",
    hint: "Search the open salt flats west of Background & Challenge.", route: "/project-description" },
  { id: "hub", kind: "item", title: "β-Carotene Model", label: "PRECURSOR MODEL", category: "02 / THE SHARED HUB", u: .33, side: -1,
    text: "Meet the hub of DunaTerp. β-Carotene connects the chassis’s native carotenoid pathway with our downstream product designs. Building a useful platform starts with understanding this shared precursor.",
    hint: "A model rests on the distant flats west of Salt Chassis.", route: "/design" },
  { id: "tf2146", kind: "item", title: "TF2146 Research Notes", label: "RESEARCH NOTES", category: "03 / REGULATORY DESIGN", u: .53, side: 1,
    text: "Can changing regulation redirect production? DunaTerp investigates TF2146 as a regulatory input for shifting carotenoid-pathway flux toward β-carotene. Modeling and experiments help assess the design.",
    hint: "Look for a field desk well east of Reprogramming.", route: "/engineering" },
  { id: "branches", kind: "item", title: "Four-Branch Pathway Map", label: "PATHWAY MAP", category: "04 / DOWNSTREAM DESIGNS", u: .66, side: -1,
    text: "One hub, four downstream designs: astaxanthin, β-ionone, crocetin and β-citraurin. Each branch needs its own enzymes and validation; the map does not represent four products made simultaneously in one strain.",
    hint: "A folded map waits on the western flats beyond Reprogramming.", route: "/design" },
  { id: "reactor", kind: "item", title: "Photobioreactor Model", label: "REACTOR MODEL", category: "05 / THE PROCESS", u: .8, side: 1,
    text: "A pathway is only part of production. Light, salinity, temperature, biomass growth and product recovery all matter when moving from a biological design toward a workable process.",
    hint: "Search the equipment plot far east of Platform.", route: "/hardware" },
  { id: "safety", kind: "item", title: "Salt-Responsive Safety Card", label: "SAFETY CARD", category: "06 / CONTAINMENT", u: .92, side: -1,
    text: "The proposed salt-responsive mazE–mazF module aims to reduce environmental escape risk. Its effectiveness and limitations need testing alongside cultivation and physical containment.",
    hint: "A monitoring post stands on the western flats near the route’s end.", route: "/safety-and-security" },
  { id: "noa", kind: "listener", title: "Noa", label: "LETTERS FROM THE LAKE", category: "FIELD POST / LEAVE FEEDBACK", u: .77, side: -1,
    text: "Every visitor notices something different. What should we explain more clearly, test next, or improve on this journey?",
    hint: "Find the little postbox far west of Platform.", route: "/human-practices" },
];

export function readFieldProgress(): FieldProgress {
  try {
    const saved = JSON.parse(localStorage.getItem(FIELD_STORAGE_KEY) ?? "{}") as Partial<FieldProgress>;
    return {
      collected: FIELD_DEFINITIONS.filter(d => d.kind === "item" && Array.isArray(saved.collected) && saved.collected.includes(d.id)).map(d => d.id),
      met: FIELD_DEFINITIONS.filter(d => d.kind !== "item" && Array.isArray(saved.met) && saved.met.includes(d.id)).map(d => d.id),
    };
  } catch { return { collected: [], met: [] }; }
}

export function writeFieldProgress(progress: FieldProgress) {
  try { localStorage.setItem(FIELD_STORAGE_KEY, JSON.stringify(progress)); } catch { /* Exploration also works without storage. */ }
}

/** Choose existing, connected ground. No terrain, props or decking are changed. */
export function createFieldSites(world: World): FieldSite[] {
  const stand = (x: number, y: number) => [-5, 5].every(dx => [-3, 3].every(dy => !isBlockedAt(world, x + dx, y + dy)));
  const head = world.path.sample(.012);
  const start = Math.floor(head.y / TILE) * MAP_W + Math.floor(head.x / TILE);
  const visited = new Uint8Array(MAP_W * MAP_H);
  const queue = [start];
  visited[start] = 1;
  for (let q = 0; q < queue.length; q++) {
    const cell = queue[q], tx = cell % MAP_W, ty = Math.floor(cell / MAP_W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = tx + dx, ny = ty + dy, index = ny * MAP_W + nx;
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1 || visited[index]) continue;
      if (!stand((nx + .5) * TILE, (ny + .5) * TILE)) continue;
      visited[index] = 1;
      queue.push(index);
    }
  }
  const deck = [...world.deckMask].flatMap((value, cell) => value ? [{ x: (cell % MAP_W + .5) * TILE, y: (Math.floor(cell / MAP_W) + .5) * TILE }] : []);
  const candidates = queue.flatMap(cell => {
    const x = (cell % MAP_W + .5) * TILE, y = (Math.floor(cell / MAP_W) + .5) * TILE;
    if (isOnDeck(world, x, y) || x < 48 || y < 48 || x > MAP_W * TILE - 48 || y > MAP_H * TILE - 48) return [];
    if (![[-16, 0], [16, 0], [0, -16], [0, 16]].every(([dx, dy]) => stand(x + dx, y + dy))) return [];
    const deckDistance = Math.min(...deck.map(point => Math.hypot(x - point.x, y - point.y))) - TILE / 2;
    return deckDistance >= MIN_FIELD_DISTANCE ? [{ x, y, deckDistance }] : [];
  });
  const sites: FieldSite[] = [];
  for (const definition of FIELD_DEFINITIONS) {
    const anchor = world.path.sample(definition.u);
    const preferred = { x: anchor.x + definition.side * 300, y: anchor.y };
    const available = candidates.filter(point => sites.every(site => Math.hypot(point.x - site.x, point.y - site.y) >= 88));
    available.sort((a, b) => Math.hypot(a.x - preferred.x, a.y - preferred.y) - Math.hypot(b.x - preferred.x, b.y - preferred.y));
    const point = available[0];
    if (!point) throw new Error(`No reachable off-route site for ${definition.id}`);
    sites.push({ ...definition, ...point });
  }
  return sites;
}
