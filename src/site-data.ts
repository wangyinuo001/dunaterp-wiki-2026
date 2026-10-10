import type { ContentBlock } from './content/types';
import { safety } from './content/safety';
import { protein } from './content/protein';
import { dryLabNavigation, dryLabIndex, hardware, hardwareDesign, metabolomics, modeling, transcriptomics } from './content/dry-lab';

export type WikiSection = {
  title: string;
  body: string;
  eyebrow?: string;
  items?: string[];
  note?: string;
  blocks?: ContentBlock[];
};

export type WikiPage = {
  title: string;
  eyebrow: string;
  intro: string;
  status: "team-draft" | "structure-only" | "review-ready";
  sections: WikiSection[];
  figure?: { src: string; alt: string; caption: string };
};

export const navigation: Array<{ label: string; items: ReadonlyArray<readonly [string, string]> }> = [
  { label: "Wet Lab", items: [["Description", "/project-description"], ["Engineering", "/engineering"], ["Experiments", "/experiments"], ["Results", "/results"], ["Safety", "/safety-and-security"]] },
  { label: "Dry Lab", items: dryLabNavigation },
  { label: "Human Practices", items: [["Human Practices", "/human-practices"], ["Sustainability", "/sustainability"], ["Education", "/education"]] },
  { label: "People", items: [["Team", "/team"], ["Attributions", "/attributions"], ["Responsible AI", "/responsible-ai"]] },
];

/** Keep the complete Dry Lab chapter list available in the wiki index. */
export const archiveNavigation = navigation.map((group) => group.label === "Dry Lab"
  ? {
      ...group,
      items: [
        ["Transcriptomics", "/transcriptomics"],
        ["Mathematical Modeling", "/model"],
        ["Metabolomics", "/metabolomics"],
        ["Protein", "/protein"],
        ["Hardware Modeling", "/hardware"],
        ["Hardware Design", "/hardware-design"],
      ] as const,
    }
  : group);

export const pages: Record<string, WikiPage> = {
  'dry-lab': dryLabIndex,
  transcriptomics,
  metabolomics,
  protein,
  "project-description": {
    title: "DunaTerp: a programmable terpenoid platform",
    eyebrow: "Project description",
    intro: "DunaTerp reprogrammes carotenoid metabolism in the halophilic microalga Dunaliella salina. The core design introduces a project-selected transcription-factor regulator to redirect pathway flux toward a competitive β-carotene hub; four downstream product designs demonstrate what that programmable chassis can support.",
    status: "team-draft",
    sections: [
      {
        eyebrow: "Value and production landscape",
        title: "Background & Challenge",
        body: "Terpenoids are used across food, nutrition, aroma, colour and other high-value applications. Current supply spans chemical synthesis, plant extraction and biological production, but each route leaves a gap: chemical synthesis can bring process and environmental costs; plant extraction is constrained by slow growth, variable abundance, land and freshwater demand; conventional yeast or bacterial factories often rely on sterile freshwater cultivation and energy-intensive operation. The project therefore asks whether a salt-compatible photosynthetic chassis can make this production landscape more practical."
      },
      {
        eyebrow: "Why this chassis",
        title: "A Chassis Shaped by Salt",
        body: "Dunaliella salina brings three connected advantages. First, its tolerance of seawater and hypersaline media supports low-cost cultivation in conditions that suppress many contaminants and reduces dependence on freshwater and arable land. Second, it already contains a complete MEP-to-carotenoid pathway and naturally accumulates β-carotene, providing an accessible and predictable starting network for engineering. Third, its photosynthetic, salt-compatible biology opens a broad application space in saline environments rather than tying the platform to conventional sterile freshwater fermentation."
      },
      {
        eyebrow: "The core intervention",
        title: "Metabolic Reprogramming",
        body: "DunaTerp does not stop at using a naturally productive alga. The project identifies and introduces transcription factor 2146 as a regulatory input intended to reshape carotenoid-pathway expression and redirect metabolic flux toward competitive β-carotene synthesis. This turns the native β-carotene pool from a fixed biological trait into the shared, programmable hub of the platform. LCYB remains the enzymatic gate from lycopene into that hub, while TF2146 provides the upstream regulatory intervention.",
      },
      {
        eyebrow: "Model-guided design",
        title: "Connect Regulation to Flux",
        body: "The modeling framework follows the control chain from transcription-factor activity and promoter occupancy to LCYB transcript, active enzyme, lycopene conversion and β-carotene supply. A second layer examines how downstream reactions draw from that shared pool. Together, these models define which regulatory, expression, metabolite and kinetic measurements are needed to test whether TF2146 changes pathway allocation as intended."
      },
      {
        eyebrow: "Downstream demonstrations",
        title: "Four Product Designs from One Hub",
        body: "Only after establishing the chassis and its regulatory logic does the platform branch into four high-value products. BKT and BCH extend the hub toward astaxanthin; CCD1 cleaves β-carotene to β-ionone; BCH supplies zeaxanthin for the GjCCD4a–GjALDH2C3 crocetin route and the CitCCD4 β-citraurin route. The routes are designed as separate strains so each branch can be built and evaluated without presenting the four products as the core innovation.",
        blocks: [
          {
            kind: "figure",
            src: "/figures/project/01_product_routes.svg",
            alt: "DunaTerp metabolic design from light and carbon through lycopene and beta-carotene to astaxanthin, beta-ionone, crocetin and beta-citraurin",
            caption: "The downstream design starts from the shared β-carotene hub and uses product-specific enzymes to create four separately cultivated routes."
          }
        ],
        items: [
          "Astaxanthin — BKT and BCH add keto and hydroxyl groups to β-carotene.",
          "β-ionone — CCD1 cleaves β-carotene to release the aroma compound.",
          "Crocetin — BCH supplies zeaxanthin, GjCCD4a forms crocetin dialdehyde and GjALDH2C3 oxidises it to crocetin.",
          "β-citraurin — BCH supplies zeaxanthin and CitCCD4 performs the cleavage step."
        ]
      },
      {
        eyebrow: "From engineered cell to application",
        title: "Characterise the Platform",
        body: "Characterisation first asks whether the regulatory intervention changes pathway expression and β-carotene supply, then tests product identity, titre, conversion efficiency and by-product profiles for each downstream strain. Light delivery, salinity, biomass productivity and recovery yield connect the engineered cell to cultivation and downstream processing."
      },
    ],
  },
  engineering: {
    title: "Design is a loop, not a line", eyebrow: "Engineering success · standard URL", intro: "This page is structured around Design → Build → Test → Learn so judges can follow each iteration without hunting through the site.", status: "structure-only",
    sections: [
      { eyebrow: "Design rationale", title: "Connect regulation to the lycopene branch", body: "Pathway structure places LCYB at the conversion from lycopene to β-carotene. The regulatory model therefore links promoter occupancy, LCYB transcription and active enzyme abundance to lycopene cyclisation, while leaving unmeasured parameters explicit." },
      { eyebrow: "Computational design", title: "Track the main product", body: "The five-state model connects regulatory-factor concentration and promoter affinity to LCYB transcription, active enzyme and β-carotene. Project measurements of binding, transcription, degradation, substrate supply and product removal activate the numerical comparison of regulator variants." },
      { eyebrow: "Team evidence required", title: "Complete the biological cycle", body: "Add construct maps, build records, controls, raw measurements, failed attempts, analysis code and the exact design change made after testing.", items: ["Design rationale", "Build evidence", "Test protocol and controls", "Learned change for the next cycle"] },
    ],
  },
  experiments: {
    title: "Make every step reproducible", eyebrow: "Experiments", intro: "A protocol-first home for wet-lab work, computational workflows, controls and raw-data provenance.", status: "structure-only",
    sections: [
      { title: "Wet-lab protocols", body: "Team input required: document strain handling, culture conditions, construct assembly, transformation, validation, product extraction and analytical measurements. Include dates, versions, controls and deviations from published protocols." },
      { title: "Transcriptomics workflow", body: "The Transcriptomics page analyzes the public GSE120965 light-intensity experiment: sample structure, differential expression, pathway annotation, published-gene recovery and coexpression ranking. Its tables distinguish expression features from functional gene assignments." },
      { title: "Modelling workflow", body: "The Mathematical Modeling page records a five-state ODE from regulatory-factor activity through promoter occupancy and LCYB expression to β-carotene. The implementation requires explicit parameters and initial values, so published observations and project measurements remain distinguishable." },
    ],
  },
  results: {
    title: "Evidence, with its limits visible", eyebrow: "Results", intro: "This draft separates observed computational results, model-dependent predictions and measurements that still need to be made.", status: "team-draft",
    figure: { src: "/figures/dry-lab/06_expression_qc.png", alt: "Sample-scale factors, expression distributions and PCA for the nine GSE120965 samples", caption: "Public GSE120965 light-intensity data: three biological replicates at each of 150, 600 and 1500 µmol photons m⁻² s⁻¹. Analysis details appear on the Transcriptomics page." },
    sections: [
      { title: "A light response to investigate", body: "In the current light-intensity analysis, the 600 µmol photons·m⁻²·s⁻¹ condition occupies a distinct transcriptomic state. A distinct expression profile alone does not establish an optimal cultivation condition or higher product yield. The source dataset, replicate structure and downstream measurements must be checked before drawing those conclusions." },
      { title: "Pathway-associated TF homologs", body: "Joint coexpression ranking places C2H2 and NF-YC homologous transcript fragments near the top of the public light-intensity dataset. Sequence coverage and family annotations accompany those ranks. Their interaction with the LCYB promoter remains an experimental question." },
      { title: "A measurable route to β-carotene", body: "The model specifies how regulatory-factor activity, promoter affinity, LCYB transcript and active enzyme determine the β-carotene balance. Absolute concentration predictions begin when promoter, expression and metabolite measurements from the project are supplied." },
    ],
  },
  model: modeling,
  hardware,
  "hardware-design": hardwareDesign,
  "human-practices": {
    title: "Let the world reshape the design", eyebrow: "Silver human practices · standard URL", intro: "This is a decision log, not an outreach gallery: each stakeholder conversation should connect to a concrete project change.", status: "structure-only",
    sections: [
      { title: "Map the people affected", body: "Team input required: identify growers, algal bioprocess engineers, downstream processors, potential customers, regulators, environmental experts and local communities. Record why each voice matters." },
      { title: "Capture feedback accurately", body: "Use consented notes or recordings, attribute quotes to real speakers and never invent representative statements. Summarise disagreements as well as consensus." },
      { title: "Close the loop", body: "For every major input, show the before state, what you heard, the design decision and the evidence that the decision was implemented." },
    ],
  },
  "safety-and-security": safety,
  "alternative-platform": {
    title: "Engineering beyond the usual chassis", eyebrow: "Best Alternative Platform · standard URL", intro: "Dunaliella salina offers an unusual combination of halotolerance, carotenoid accumulation and established outdoor cultivation—but the award depends on engineering evidence.", status: "team-draft",
    sections: [
      { title: "Why this chassis", body: "The platform concept starts from native carotenoid metabolism. Dunaliella lacks a rigid cellulose wall, but whether this simplifies extraction or genetic delivery in our system requires direct evidence." },
      { title: "What is tightly coupled to it", body: "Light-responsive regulation, plastid-localised MEP metabolism, β-carotene storage and hypersaline cultivation all shape the design; they are not interchangeable details." },
      { title: "Evidence gate", body: "To compete for this award, add direct evidence that the team successfully engineered the chassis, plus failures, transformation constraints and guidance that another team could reproduce." },
    ],
  },
  sustainability: {
    title: "Measure the whole system", eyebrow: "Sustainable Development Impact · standard URL", intro: "A promising photosynthetic platform still needs a life-cycle view, stakeholder input and measurable outcomes.", status: "structure-only",
    sections: [
      { title: "Define the comparison", body: "Team input required: identify the incumbent production route and compare land, water, energy, nutrients, solvents, carbon, waste and product recovery on equivalent functional units." },
      { title: "Avoid one-dimensional claims", body: "Photosynthesis and saline cultivation may offer advantages, but mixing, lighting, harvesting and extraction can dominate impact. Record positive and negative interactions across relevant SDGs." },
      { title: "Set measurable targets", body: "Translate stakeholder feedback into testable thresholds and document the data source, uncertainty and decision it changed." },
    ],
  },
  education: {
    title: "Teach by listening", eyebrow: "Best Education · standard URL", intro: "Education activities should create mutual learning and leave reusable materials, evaluation and reflection.", status: "structure-only",
    sections: [
      { title: "Explore the salt-lake field station", body: "The homepage includes three fictional research guides and interactive exercises on pathway order, product branches and the difference between evidence and a design claim. These are simplified learning activities, not laboratory simulations. Visitors can retry freely and keep a completion record on their own device. Learning impact has not yet been evaluated." },
      { title: "Audience and need", body: "Team input required: define who the activity serves and learn what they already know, need and value before designing materials." },
      { title: "Dialogue, not promotion", body: "Document questions participants raised, how the team responded and what the team learned in return." },
      { title: "Reusable package", body: "Release lesson goals, facilitator notes, accessible materials, licences, feedback instruments and evidence of revision." },
    ],
  },
  team: {
    title: "The people behind DunaTerp", eyebrow: "Team", intro: "Replace these placeholders with roster-accurate portraits, roles and short first-person notes.", status: "structure-only",
    sections: [
      { title: "Student team", body: "Add only members listed on the official team roster. Include the work each person owned and avoid generic role labels." },
      { title: "PIs, instructors and advisors", body: "Describe the guidance they provided without attributing student work to supervisors or vice versa." },
      { title: "Collaborators", body: "Link collaborators to the Attributions Form and record consent for names, portraits and quotations." },
    ],
  },
  attributions: {
    title: "Credit is part of the method", eyebrow: "Attributions", intro: "The official iGEM Attributions Form is authoritative; this page helps readers understand the division of work.", status: "structure-only",
    sections: [
      { title: "Team work", body: "Team input required: record who designed, built, tested, analysed, modelled, documented and reviewed each project component." },
      { title: "External support", body: "Credit facilities, mentors, donated materials, prior teams, software, datasets and every third-party visual with source and licence." },
      { title: "Pixel exploration and learning activities", body: "The active homepage uses the repository’s original Canvas pixel world, extended with fictional NPC guides and educational games. The characters do not represent team members or stakeholder testimony. Stardew Valley is a stylistic reference; no game assets, characters, music or dialogue are redistributed." },
      { title: "Earlier website physics and interaction", body: "The retained, inactive 3D implementation’s Rapier physics world, contact-force event loop, dynamic object synchronisation and damped follow-camera in DunaTerp are adapted from Bruno Simon's Folio 2025 under the MIT License. The scroll-constrained route, Dunaliella geometry, scientific landmarks, text and interface are project-specific; no Folio models, artwork, audio or textures are redistributed. Full notice: THIRD_PARTY_NOTICES.md in the Wiki repository." },
      { title: "Scientific equation renderer", body: "The Transcriptomics and Mathematical Modeling pages render equations and fonts locally with KaTeX 0.16.22, licensed under MIT. Source and licence notice: THIRD_PARTY_NOTICES.md in the Wiki repository." },
    ],
  },
  "responsible-ai": {
    title: "Responsible AI use", eyebrow: "Authorship & integrity", intro: "A transparent record of where AI assisted the team, what it did not produce and how humans reviewed the output.", status: "team-draft",
    sections: [
      { title: "Model used", body: "OpenAI Codex (GPT-5 family) was used on 15 August 2026 to scaffold website code, organise navigation, create procedural Three.js geometry, improve interface copy and draft clearly marked content structures from team-authored local reports." },
      { title: "September 2026 website revision", body: "On 9 September 2026, OpenAI Codex coordinated a code and content review with GPT-5.6 Luna subtasks for NPC learning activities, input handling and navigation review. AI assisted with code, fictional guide dialogue and educational questions. Completion badges record in-browser activity only. Human review of this revision is pending." },
      { title: "Boundaries", body: "AI was not used to generate experimental data, data figures, microscopy, simulated experimental evidence, quotations or citations. Existing scientific figures shown in this prototype were produced by the project's analysis scripts and remain subject to team verification." },
      { title: "Human review", body: "Review is pending. Before publication, named team members must verify every scientific statement against source data, confirm every citation, rerun the build and analysis code, approve alt text and sign off this disclosure." },
    ],
  },
};

export const pageOrder = [...new Set([
  'project-description', 'engineering', 'experiments', 'results',
  'dry-lab', 'transcriptomics', 'metabolomics', 'protein', 'model', 'hardware', 'hardware-design',
  ...Object.keys(pages).filter((key) => ![
    'project-description', 'engineering', 'experiments', 'results',
    'dry-lab', 'transcriptomics', 'metabolomics', 'protein',
    'model', 'hardware', 'hardware-design',
  ].includes(key)),
])];
