// The four project-story stations and the archive, in one place.
//
// Both the canvas world and the DOM overlay read from here, so a station's
// number, colour and copy can never drift between the two layers. The science
// copy follows the project draft and keeps design intent distinct from results.

export type StationCopy = {
  key: string;
  index: string;
  kicker: string;
  title: string;
  body: string;
  route: string;
  /** CSS colour for the DOM overlay. */
  color: string;
  /** Matching palette key for anything drawn on the canvas. */
  accent: string;
  /** Short label for the in-world sign plate. */
  short: string;
  /** Two compact lines printed on the in-world station plate. */
  mapLines: [string, string];
  /** Small art-directed adjustment after the plate is moved off the route. */
  plateNudge?: { x: number; y: number };
  /** Position along the boardwalk route, 0 at the trailhead. */
  u: number;
  /** Lateral offset from the route in pixels; negative is left of travel. */
  offset: number;
  sprite: string;
};

export const STATION_COPY: StationCopy[] = [
  {
    key: "brine-edge",
    short: "CHALLENGE",
    mapLines: ["PLANT SUPPLY: LIMITED", "SALT-READY CHASSIS"],
    plateNudge: { x: 0, y: 28 },
    index: "01",
    kicker: "WHY DUNATERP",
    title: "Background & Challenge",
    body: "Plant-derived terpenoids face slow growth, variable supply and substantial land and freshwater demands. A salt-compatible photosynthetic chassis opens another route.",
    route: "/project-description#section-1",
    color: "#cdf558",
    accent: "8",
    u: 0.12,
    offset: 82,
    sprite: "brine-edge",
  },
  {
    key: "the-cell",
    short: "DESIGN",
    mapLines: ["D. SALINA BUILDS", "BETA-CAROTENE HUB"],
    plateNudge: { x: 0, y: -24 },
    index: "02",
    kicker: "ONE SHARED HUB",
    title: "Biological Design",
    body: "Dunaliella salina supplies a native carotenoid pathway. LCYB directs lycopene into the β-carotene hub used by every downstream design.",
    route: "/project-description#section-2",
    color: "#f7a52d",
    accent: "s",
    u: 0.36,
    offset: -88,
    sprite: "the-cell",
  },
  {
    key: "product-yards",
    short: "PRODUCTS",
    mapLines: ["ONE HUB, FOUR PRODUCTS", "SEPARATE STRAINS"],
    index: "03",
    kicker: "FOUR TERPENOID BRANCHES",
    title: "High-Value Product Routes",
    body: "The β-carotene hub branches toward astaxanthin, β-ionone, crocetin and β-citraurin through product-specific enzyme sets in separately cultivated strains.",
    route: "/project-description#section-3",
    color: "#e65c42",
    accent: "t",
    u: 0.62,
    offset: 84,
    sprite: "product-yards",
  },
  {
    key: "model-station",
    short: "PROCESS",
    mapLines: ["CELL OUTPUT TO PROCESS", "CULTURE + RECOVERY"],
    index: "04",
    kicker: "FROM CELL TO CULTIVATION",
    title: "Product & Process Characterisation",
    body: "Product identity, titre and conversion efficiency are evaluated alongside light delivery, salinity, biomass productivity and recovery yield.",
    route: "/project-description#section-4",
    color: "#c4a8ff",
    accent: "w",
    u: 0.84,
    offset: -86,
    sprite: "model-station",
  },
];

export const ARCHIVE_COPY: StationCopy = {
  key: "archive",
  short: "ARCHIVE",
  mapLines: ["EVERY WIKI CHAPTER", "IN ONE FINAL INDEX"],
  index: "END",
  kicker: "EVERY STANDARD ROUTE",
  title: "The DunaTerp archive",
  body: "Every judging page, in one place, reachable without the journey.",
  route: "/wiki-map",
  color: "#cdf558",
  accent: "8",
  u: 0.985,
  offset: 0,
  sprite: "archive",
};
