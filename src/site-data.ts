import type { ContentBlock } from './content/types';
import { dryLabNavigation, dryLabIndex, emptyDryLabPage, modeling, transcriptomics } from './content/dry-lab';

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

export const pages: Record<string, WikiPage> = {
  'dry-lab': dryLabIndex,
  transcriptomics,
  metabolomics: emptyDryLabPage('Metabolomics'),
  protein: emptyDryLabPage('Protein'),
  "project-description": {
    title: "DunaTerp: a salt-adapted terpenoid platform",
    eyebrow: "Project description",
    intro: "DunaTerp uses the halophilic microalga Dunaliella salina as a photosynthetic chassis and β-carotene as a shared metabolic hub, then directs carbon into four separately cultivated high-value terpenoid product strains.",
    status: "team-draft",
    sections: [
      {
        eyebrow: "Why this chassis",
        title: "Background & Challenge",
        body: "Many high-value terpenoids are still obtained from plant material, where slow growth, seasonal supply, low product abundance and water- and land-intensive cultivation constrain production. Freshwater scarcity further limits conventional biomass routes. DunaTerp therefore starts with Dunaliella salina, a photosynthetic microalga that grows in seawater and hypersaline media and naturally accumulates carotenoids, linking solar carbon fixation to a salt-compatible production chassis."
      },
      {
        eyebrow: "One shared metabolic hub",
        title: "Biological Design",
        body: "The design strengthens the native carotenoid pathway around β-carotene. LCYB directs lycopene into this shared hub, while light-responsive regulation and chloroplast-targeted expression coordinate hub supply. Product-specific enzymes then divide the platform into four separately cultivated production strains."
      },
      {
        eyebrow: "Product architecture",
        title: "Four High-Value Terpenoid Routes",
        body: "Our platform branches from the β-carotene hub into four product routes. BKT and BCH convert the hub toward astaxanthin; CCD1 cleaves β-carotene to β-ionone; BCH supplies zeaxanthin for the GjCCD4a–GjALDH2C3 crocetin route and the CitCCD4 β-citraurin route.",
        blocks: [
          {
            kind: "figure",
            src: "/figures/project/01_product_routes.svg",
            alt: "DunaTerp metabolic design from light and carbon through lycopene and beta-carotene to astaxanthin, beta-ionone, crocetin and beta-citraurin",
            caption: "The native carotenoid pathway supplies a shared β-carotene hub. Product-specific enzymes create four separately cultivated branches."
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
        eyebrow: "From intracellular flux to cultivation",
        title: "Product & Process Characterisation",
        body: "Characterisation is organised around product identity, titre, conversion efficiency and by-product profiles for each strain. Light delivery, salinity, biomass productivity and recovery yield connect intracellular pathway performance to the flat-panel airlift process and provide a common basis for comparing the four production routes."
      },
      {
        eyebrow: "Shared control point",
        title: "LCYB Controls Entry to the Hub",
        body: "Lycopene β-cyclase converts lycopene into the β-carotene hub used by every product branch. Transcriptomics identifies light-responsive pathway behaviour and ranks coexpressed transcription-factor homologs. The regulatory model then follows control from promoter occupancy through LCYB transcript and active enzyme to β-carotene formation."
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
  hardware: emptyDryLabPage('Hardware'),
  contribution: {
    title: "Leave a map for the next team", eyebrow: "Bronze contribution · standard URL", intro: "Candidate contributions described in the project draft are organised here for the team to validate, document and release with their underlying files.", status: "team-draft",
    sections: [
      { title: "A reproducible transcriptomics trail", body: "The public-data workflow links GSE120965 expression features to sequence annotations, checks the paper's 600/150 pathway transcripts by Trinity identifier and publishes the full pathway-associated TF ranking. The exact inputs, commands and reference versions should accompany a final release." },
      { title: "A dimensional regulatory model", body: "The modeling code represents regulatory-factor activity, promoter occupancy, LCYB transcript, active enzyme, lycopene and β-carotene with explicit units and caller-supplied parameters. It can be reused with measured promoter and metabolite data." },
      { title: "Release checklist", body: "Before claiming these as contributions, the team should package inputs, environment details, exact commands, expected outputs, licences and a small verification test in the official iGEM GitLab repository." },
    ],
  },
  "human-practices": {
    title: "Let the world reshape the design", eyebrow: "Silver human practices · standard URL", intro: "This is a decision log, not an outreach gallery: each stakeholder conversation should connect to a concrete project change.", status: "structure-only",
    sections: [
      { title: "Map the people affected", body: "Team input required: identify growers, algal bioprocess engineers, downstream processors, potential customers, regulators, environmental experts and local communities. Record why each voice matters." },
      { title: "Capture feedback accurately", body: "Use consented notes or recordings, attribute quotes to real speakers and never invent representative statements. Summarise disagreements as well as consensus." },
      { title: "Close the loop", body: "For every major input, show the before state, what you heard, the design decision and the evidence that the decision was implemented." },
    ],
  },
  "safety-and-security": {
    title: "Containment begins at the design table", eyebrow: "Safety & Security · standard URL", intro: "A structured place for organism, genetic construct, cultivation, product, waste and deployment risks.", status: "structure-only",
    sections: [
      { title: "Risk inventory", body: "Team input required: list chassis strain, donor genes, vectors, selection markers, procedures, hazardous chemicals and the intended scale. Link claims to the approved iGEM Safety Forms." },
      { title: "Open-pond is not automatically safe", body: "The industrial history of Dunaliella cultivation is not a substitute for a project-specific environmental risk assessment. Address escape, persistence, horizontal transfer, monitoring and waste treatment for the actual engineered strains." },
      { title: "Design controls", body: "Document physical containment, biological safeguards, operating limits, incident response and who verified each measure." },
    ],
  },
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

export const pageOrder = [
  'project-description', 'engineering', 'experiments', 'results',
  'dry-lab', ...dryLabNavigation.map(([, path]) => path.slice(1)),
  ...Object.keys(pages).filter((key) => !['project-description', 'engineering', 'experiments', 'results', 'dry-lab', ...dryLabNavigation.map(([, path]) => path.slice(1))].includes(key)),
];
