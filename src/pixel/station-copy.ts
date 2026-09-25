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
  panelLead: string;
  panelPoints: readonly { label: string; text: string }[];
  route: string;
  /** CSS colour for the DOM overlay. */
  color: string;
  /** Matching palette key for anything drawn on the canvas. */
  accent: string;
  /** Short label for the in-world sign plate. */
  short: string;
  /** Small art-directed adjustment that keeps the compact label clear of props. */
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
    short: "BACKGROUND & CHALLENGE",
    plateNudge: { x: 8, y: 22 },
    index: "01",
    kicker: "WHY DUNATERP",
    title: "Background & Challenge",
    body: "Plant-derived terpenoids face slow growth, variable supply and substantial land and freshwater demands. A salt-compatible photosynthetic chassis opens another route.",
    panelLead: "Many high-value terpenoids still depend on plant extraction: growth is slow, product abundance varies, and production consumes land and freshwater.",
    panelPoints: [
      { label: "CHALLENGE", text: "Plant supply can be seasonal, dilute and resource-intensive." },
      { label: "CHASSIS", text: "Dunaliella salina grows in seawater or hypersaline media without competing for freshwater." },
      { label: "OPPORTUNITY", text: "Light-driven carbon fixation and native carotenoid metabolism provide a salt-compatible production starting point." },
    ],
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
    index: "02",
    kicker: "ONE SHARED HUB",
    title: "Biological Design",
    body: "Dunaliella salina supplies a native carotenoid pathway. LCYB directs lycopene into the β-carotene hub used by every downstream design.",
    panelLead: "The design begins inside a pathway D. salina already uses. Instead of rebuilding carotenoid synthesis from zero, we organise the project around its native β-carotene hub.",
    panelPoints: [
      { label: "INPUT", text: "Photosynthesis supplies fixed carbon to the native carotenoid pathway." },
      { label: "CONTROL", text: "LCYB cyclises lycopene and controls entry into the β-carotene hub." },
      { label: "DESIGN", text: "A shared upstream hub feeds four product-specific strains and keeps the branches modular." },
    ],
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
    index: "03",
    kicker: "FOUR TERPENOID BRANCHES",
    title: "High-Value Product Routes",
    body: "The β-carotene hub branches toward astaxanthin, β-ionone, crocetin and β-citraurin through product-specific enzyme sets in separately cultivated strains.",
    panelLead: "The platform bifurcates from β-carotene into four high-value terpenoid routes. Each route is assigned to a separate strain so its enzymes and measurements can be characterised independently.",
    panelPoints: [
      { label: "ASTAXANTHIN", text: "BKT and BCH introduce keto and hydroxyl groups into the β-carotene branch." },
      { label: "β-IONONE", text: "CCD1 cleaves β-carotene to release the volatile apocarotenoid." },
      { label: "CROCETIN / β-CITRAURIN", text: "Hydroxylation and product-specific CCD cleavage redirect carotenoid intermediates into the two apocarotenoid branches." },
    ],
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
    index: "04",
    kicker: "FROM CELL TO CULTIVATION",
    title: "Product & Process Characterisation",
    body: "Product identity, titre and conversion efficiency are evaluated alongside light delivery, salinity, biomass productivity and recovery yield.",
    panelLead: "A route is useful only when molecular output and cultivation performance can be read together. Characterisation therefore connects the engineered cell to the production process.",
    panelPoints: [
      { label: "PRODUCT", text: "Confirm identity, titre and substrate-to-product conversion." },
      { label: "CELL", text: "Measure biomass, pathway response and the stability of the engineered phenotype." },
      { label: "PROCESS", text: "Compare light, salinity, productivity and downstream recovery conditions." },
    ],
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
  index: "END",
  kicker: "EVERY STANDARD ROUTE",
  title: "The DunaTerp archive",
  body: "Every judging page, in one place, reachable without the journey.",
  panelLead: "The archive marks the end of the Salt Route.",
  panelPoints: [],
  route: "/wiki-map",
  color: "#cdf558",
  accent: "8",
  u: 0.985,
  offset: 0,
  sprite: "archive",
};
