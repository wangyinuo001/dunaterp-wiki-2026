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
  panelTitle?: string;
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
    panelTitle: "Why do we need a new synthesis platform?",
    body: "Terpenoids are valuable across food, nutrition, materials and other industries, but current production routes carry supply, resource or process costs.",
    panelLead: "Terpenoids have valuable uses, but making them reliably at scale is not simple. Plant extraction, chemical synthesis and microbial production each come with different limits. The next pages explain where these molecules are used, how they are made today, and what is still missing.",
    panelPoints: [
      { label: "VALUE", text: "Terpenoids include pigments such as carotenoids and aroma compounds such as β-ionone. They are used in food, nutrition, cosmetics and materials. Their different uses call for reliable supply and product-appropriate quality." },
      { label: "CURRENT ROUTES", text: "Plant extraction can be limited by crop growth, variable compound levels, land and freshwater needs. Chemical synthesis offers controlled production but may require multiple reaction and purification steps. Microbial biosynthesis allows pathway engineering, though yields, feedstocks and recovery still matter." },
      { label: "BIOPRODUCTION GAP", text: "Many bacterial and yeast processes use low- to moderate-osmolarity media and require strictly sterile cultivation environments. At scale, water, energy, contamination control and product recovery all affect process cost. The challenge is to find a chassis that grows in saline conditions and still supports carotenoid-pathway engineering." },
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
    short: "SALT CHASSIS",
    index: "02",
    kicker: "WHY DUNALIELLA",
    title: "Salt-Adapted Chassis",
    body: "Dunaliella salina combines hypersaline cultivation, photosynthetic carbon fixation and a native MEP-to-carotenoid pathway in one chassis.",
    panelLead: "Dunaliella salina answers the limitations of other routes with three linked advantages: a low-cost, salt-tolerant chassis; a pathway that is convenient to engineer; and broad potential in saline, non-freshwater settings.",
    panelPoints: [
      { label: "LOW COST + HIGH TOLERANCE", text: "Hypersaline cultivation suppresses many contaminants and can reduce reliance on freshwater and highly sterile conditions compared with less salt-tolerant algal chassis." },
      { label: "ENGINEERING CONVENIENCE", text: "The chassis already contains the MEP and carotenoid pathways, while the predictable diversity below β-carotene provides multiple engineering directions." },
      { label: "APPLICATION RANGE", text: "Photosynthetic production in seawater or saline environments creates a route that does not depend on arable land or precious freshwater." },
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
    short: "REPROGRAMMING",
    index: "03",
    kicker: "THE CORE DESIGN",
    title: "Metabolic Reprogramming",
    body: "The project-selected transcription factor 2146 is introduced to reprogramme pathway regulation and redirect metabolic flux toward competitive β-carotene synthesis.",
    panelLead: "DunaTerp is not only a salt-tolerant source of native pigment. Its core design is a programmable metabolic intervention: identify and introduce transcription factor 2146, reshape pathway regulation, and strengthen supply to the β-carotene hub.",
    panelPoints: [
      { label: "DISCOVER", text: "Transcriptomic and sequence analyses provide the route for selecting the project transcription-factor candidate 2146." },
      { label: "INTRODUCE", text: "The biological design brings CPP2146 into the chassis as the regulatory input rather than treating β-carotene accumulation as a fixed natural trait." },
      { label: "REDIRECT", text: "The intended effect is to alter carotenoid-pathway flux and increase competitive supply to the shared β-carotene pool." },
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
    short: "PLATFORM",
    index: "04",
    kicker: "FROM HUB TO APPLICATIONS",
    title: "Programmable Product Platform",
    body: "Modeling links CPP2146 regulation to pathway flux; four downstream product designs test how the same β-carotene hub can support distinct outputs.",
    panelLead: "The platform is evaluated first as a reprogrammable chassis. Modeling connects regulatory input, β-carotene supply and branch competition; four downstream designs then demonstrate the range of products that could be built from that shared hub.",
    panelPoints: [
      { label: "MODEL", text: "The regulatory and metabolic models examine how transcriptional control changes hub supply and competition between pathway demands." },
      { label: "FOUR DESIGNS", text: "Product-specific enzymes extend the hub toward astaxanthin, β-ionone, crocetin and β-citraurin in separately designed algae species." },
      { label: "VALIDATE", text: "Product identity, titre and conversion are read together with light, salinity, biomass productivity and recovery." },
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
  u: 0.998,
  offset: 0,
  sprite: "archive",
};
