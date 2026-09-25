// The small cast that lives along the free-roam route.
//
// NPCs use the route only as a landmark. Their homes and patrol points are
// deliberately placed on the surrounding salt flat, never on the boardwalk.
// Keeping the definitions here makes the people useful to both the canvas
// engine and the journal overlay without making world-map.ts depend on UI.

import { isBlockedAt, isOnDeck, type World } from "./world-map";

export type NpcId = "biologist" | "engineer" | "researcher";

export type NpcAccessory = "satchel" | "helmet" | "notebook";

export type NpcDefinition = {
  id: NpcId;
  /** Stable key shared with the journal and any DOM overlay. */
  journalKey: NpcId;
  name: string;
  role: string;
  /** Short all-caps label used above the sprite. */
  label: string;
  /** Link to the nearby station chapter. */
  stationKey: string;
  /** Lateral offset from the station along the route normal. */
  offset: number;
  /** Small shift along the route tangent to place the character by their work area. */
  along: number;
  /** Elliptical off-boardwalk activity area, in world pixels. */
  activityRadiusX: number;
  activityRadiusY: number;
  /** Walking speed while the NPC patrols its activity area. */
  activitySpeed: number;
  /** Canvas tint and accessory colours are kept in the locked pixel palette family. */
  tint: string;
  accent: string;
  paletteKey: string;
  accessory: NpcAccessory;
};

export type Npc = NpcDefinition & {
  /** Current world-space feet position, updated by the engine. */
  x: number;
  y: number;
  /** Stable off-boardwalk centre of the NPC's activity area. */
  homeX: number;
  homeY: number;
  /** Pre-validated patrol targets inside the activity area. */
  activityPoints: Array<{ x: number; y: number }>;
};

/**
 * Three journal-facing NPCs. Their route positions sit near the biological,
 * product and process stations, while their offsets put them on the salt flat.
 * Visitors can step off the route in free mode to meet them.
 */
export const NPC_DEFINITIONS: readonly NpcDefinition[] = [
  {
    id: "biologist",
    journalKey: "biologist",
    name: "Dr. Lin",
    role: "Biologist",
    label: "BIOLOGIST",
    stationKey: "brine-edge",
    offset: -52,
    along: -20,
    activityRadiusX: 26,
    activityRadiusY: 18,
    activitySpeed: 17,
    tint: "#7cc45a",
    accent: "#cdf558",
    paletteKey: "8",
    accessory: "satchel",
  },
  {
    id: "engineer",
    journalKey: "engineer",
    name: "Mara",
    role: "Engineer",
    label: "ENGINEER",
    stationKey: "product-yards",
    offset: 52,
    along: 40,
    activityRadiusX: 30,
    activityRadiusY: 18,
    activitySpeed: 20,
    tint: "#ee7a3a",
    accent: "#f7a52d",
    paletteKey: "s",
    accessory: "helmet",
  },
  {
    id: "researcher",
    journalKey: "researcher",
    name: "Ari",
    role: "Researcher",
    label: "RESEARCHER",
    stationKey: "model-station",
    offset: -52,
    along: -20,
    activityRadiusX: 28,
    activityRadiusY: 20,
    activitySpeed: 18,
    tint: "#7de2ff",
    accent: "#c4a8ff",
    paletteKey: "w",
    accessory: "notebook",
  },
];

function canNpcStand(world: World, x: number, y: number) {
  const halfWidth = 5;
  const halfHeight = 3;
  return !isOnDeck(world, x, y)
    && !isBlockedAt(world, x - halfWidth, y - halfHeight)
    && !isBlockedAt(world, x + halfWidth, y - halfHeight)
    && !isBlockedAt(world, x - halfWidth, y + halfHeight)
    && !isBlockedAt(world, x + halfWidth, y + halfHeight);
}

/** Build positioned NPC records and safe patrol targets for a generated world. */
export function createNpcs(world: World): Npc[] {
  return NPC_DEFINITIONS.map((definition) => {
    const station = world.stations.find((item) => item.key === definition.stationKey);
    if (!station) throw new Error(`Missing NPC station: ${definition.stationKey}`);
    const sample = world.path.sample(station.u);
    const tangent = { x: sample.dx, y: sample.dy };
    const normal = { x: -sample.dy, y: sample.dx };
    const preferredX = sample.x + normal.x * definition.offset + tangent.x * definition.along;
    const preferredY = sample.y + normal.y * definition.offset + tangent.y * definition.along;

    // Each guide belongs to a named station. These fallbacks preserve that
    // composition while moving only a few pixels around a blocked prop.
    const centreCandidates = [
      [0, 0], [8, 0], [-8, 0], [0, 8], [0, -8], [16, 0], [-16, 0], [0, 16], [0, -16],
    ].map(([along, across]) => ({
      x: preferredX + tangent.x * along + normal.x * across,
      y: preferredY + tangent.y * along + normal.y * across,
    }));
    const centre = centreCandidates.find((point) => canNpcStand(world, point.x, point.y))
      ?? { x: preferredX, y: preferredY };

    // A short work loop reads as inspecting the nearby station rather than
    // wandering randomly across the salt flat.
    const activityPoints = [
      [0, 0],
      [definition.activityRadiusX * .55, 0],
      [definition.activityRadiusX * .35, definition.activityRadiusY * .55],
      [-definition.activityRadiusX * .45, definition.activityRadiusY * .3],
      [0, -definition.activityRadiusY * .45],
    ].map(([along, across]) => ({
      x: centre.x + tangent.x * along + normal.x * across,
      y: centre.y + tangent.y * along + normal.y * across,
    })).filter((point) => canNpcStand(world, point.x, point.y));
    if (!activityPoints.length) activityPoints.push({ x: centre.x, y: centre.y });

    return {
      ...definition,
      x: centre.x,
      y: centre.y,
      homeX: centre.x,
      homeY: centre.y,
      activityPoints,
    };
  });
}
