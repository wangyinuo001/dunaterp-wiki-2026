import type { ContentBlock } from './content/types';
import { safety } from './content/safety';
import { protein } from './content/protein';
import { dryLabNavigation, dryLabIndex, hardware, hardwareDesign, metabolomics, modeling, transcriptomics } from './content/dry-lab';

export type WikiSection = {
  title: string;
  tocTitle?: string;
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
  references?: Array<{ label: string; href: string }>;
};

export const navigation: Array<{ label: string; items: ReadonlyArray<readonly [string, string]> }> = [
  { label: "Wet Lab", items: [["Description", "/project-description"], ["Engineering", "/engineering"], ["Experiments", "/experiments"], ["Results", "/results"], ["Safety", "/safety-and-security"]] },
  { label: "Dry Lab", items: dryLabNavigation },
  { label: "Human Practices", items: [["Human Practices", "/human-practices"], ["Sustainability", "/sustainability"], ["Education", "/education"]] },
  { label: "People", items: [["Team", "/team"], ["Attributions", "/attributions"], ["Responsible AI", "/responsible-ai"]] },
];

/** The compact header groups Dry Lab into its two main entrances. Indexes and
 * archives expand that group so no existing work disappears from view. */
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
    intro: "DunaTerp reprogrammes carotenoid metabolism in the halophilic microalga Dunaliella salina. The core design introduces the project-selected transcription factor 2146 to redirect pathway flux toward a competitive β-carotene hub; four downstream product designs demonstrate what that programmable chassis can support.",
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
        title: "Reprogramme the Metabolic Engine",
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
    title: "Design is a loop, not a line", eyebrow: "Engineering success · standard URL", intro: "The kill-switch module is documented here as an iterative engineering program: first prove that MazF can suppress Dunaliella salina growth, then tune toxin output to a controllable level, and finally assemble the full salt-controlled circuit.", status: "team-draft",
    sections: [
      {
        eyebrow: "Kill switch architecture",
        title: "Engineer a Salt-Controlled Suicide Switch",
        body: "The biosafety strategy is to let engineered Dunaliella salina survive in high-salt working conditions but lose viability after transfer to low-salt external environments. The circuit therefore couples a salt-responsive antitoxin module to a constitutive toxin module.",
        blocks: [
          { kind: "paragraph", text: "In the intended final design, high salt activates PDCA1 and drives mazE expression. MazE neutralises the low-level MazF produced from the Pip-driven toxin module, so cells remain viable in the target niche." },
          { kind: "paragraph", text: "After transfer to low salt, PDCA1 shuts down, no new MazE is produced, and the remaining MazF is no longer buffered. The resulting toxin activity is expected to stop growth and kill cells outside the intended cultivation environment." },
          { kind: "figure", src: "/figures/wet-lab/engineer1.png", alt: "Working principle of the salt-controlled suicide switch under high-salt conditions with PDCA1-driven MazE neutralising low-level MazF.", caption: "Figure 1. High salt activates PDCA1, drives mazE expression and allows MazE to neutralise basal MazF so that cells survive." },
          { kind: "figure", src: "/figures/wet-lab/engineer2.png", alt: "Working principle of the salt-controlled suicide switch under low-salt conditions with loss of MazE protection and MazF-driven cell death.", caption: "Figure 2. Under low salt, PDCA1 is shut down, no new MazE is produced and persistent MazF activity drives cell death." },
        ],
      },
      {
        eyebrow: "Cycle I",
        title: "Validate MazF as the Killing Effector",
        body: "The first engineering question was whether MazF could retain killing activity in the eukaryotic chassis D. salina. Cycle I therefore used a deliberately strong constitutive expression design to test feasibility before attempting circuit balancing.",
        blocks: [
          { kind: "heading", text: "Design" },
          { kind: "paragraph", text: "A validation plasmid, p1302-CaMV35S-mazF, was constructed with mazF under the strong constitutive CaMV 35S promoter. Three experimental groups were defined for comparison: MazF transformants, empty-vector transformants and wild type." },
          { kind: "heading", text: "Build" },
          { kind: "paragraph", text: "mazF was cloned into the pCAMBIA1302 backbone, verified by colony PCR and sequencing, and introduced into D. salina by osmotic transformation. Independent transformants were selected with hygromycin B and then cultured in parallel with the two control groups." },
          { kind: "heading", text: "Test" },
          { kind: "paragraph", text: "Growth was monitored for 10 days in 0.5 M NaCl PKS/DM liquid medium using OD680. This assay tested whether strong MazF expression could suppress D. salina growth relative to both controls." },
          { kind: "figure", src: "/figures/wet-lab/engineer3.png", alt: "Plasmid map of p1302-CaMV35S-mazF used for MazF validation in Dunaliella salina.", caption: "Figure 3. Plasmid map of p1302-CaMV35S-mazF (10,130 bp)." },
          { kind: "figure", src: "/figures/wet-lab/engineer4.png", alt: "Colony PCR verification of p1302-CaMV35S-mazF construction.", caption: "Figure 4. Colony PCR verification of p1302-CaMV35S-mazF." },
          { kind: "figure", src: "/figures/wet-lab/engineer5.png", alt: "Ten-day growth curves comparing wild type, empty-vector and MazF transformant Dunaliella salina strains.", caption: "Figure 5. Growth curves of WT, empty-vector and MazF transformants over 10 days. MazF transformants remained strongly growth-inhibited relative to both controls." },
          { kind: "heading", text: "Learn" },
          { kind: "paragraph", text: "MazF retained strong growth-inhibitory activity in D. salina, establishing that the toxin module is feasible in the chosen chassis. At the same time, strong-promoter-driven toxin expression appeared too severe for a stable final circuit, so the next iteration focused on reducing leak and creating a workable neutralisation window for MazE." },
        ],
      },
      {
        eyebrow: "Cycle II and III",
        title: "Tune Toxin Output and Assemble the Full Circuit",
        body: "After proving that MazF could suppress growth, the engineering goal shifted from feasibility to controllability. The toxin module was redesigned around weaker expression and orthogonal selection, then paired with a salt-responsive antitoxin design for final assembly.",
        blocks: [
          { kind: "heading", text: "Cycle II: weaken the toxin module" },
          { kind: "paragraph", text: "Two engineering changes were introduced. First, the backbone was switched to pCAMBIA1302-bar so the toxin module would use phosphinothricin resistance and remain orthogonal to the hygromycin-marked antitoxin vector. Second, the endogenous low-abundance promoter Pip was chosen to drive mazF, with the aim of lowering toxin output while preserving killing efficacy." },
          { kind: "paragraph", text: "p1302-Pip-mazF was assembled by homologous recombination, verified by colony PCR and sequencing, and transformed into D. salina. The growth-kinetics assay of weakly expressed MazF is underway and will determine whether this lower-expression design preserves an adequate kill window." },
          { kind: "figure", src: "/figures/wet-lab/engineer6.png", alt: "Plasmid map of p1302-Pip-mazF using the bar selection marker and weak Pip promoter.", caption: "Figure 6. Plasmid map of p1302-Pip-mazF (bar) (11,181 bp)." },
          { kind: "figure", src: "/figures/wet-lab/engineer7.png", alt: "Colony PCR verification of the p1302-Pip-mazF weak-promoter toxin construct.", caption: "Figure 7. Colony PCR verification of p1302-Pip-mazF. Positive clones were identified before algal transformation and phenotypic testing." },
          { kind: "heading", text: "Cycle II: learn" },
          { kind: "paragraph", text: "The weak Pip promoter and bar marker create a more practical toxin module for final assembly: toxin expression is expected to be more controllable, and the marker system is now compatible with orthogonal double selection." },
          { kind: "heading", text: "Cycle III: final assembly in progress" },
          { kind: "paragraph", text: "The next step is to build p1302-PDCA1-mazE, in which the salt-responsive promoter PDCA1 drives the antitoxin. This vector will be co-transformed with p1302-bar-Pip-mazF and selected using hygromycin/phosphinothricin double selection." },
          { kind: "paragraph", text: "The final engineering test is a salt-switch assay from high salt to low salt. Success means robust growth in high salt, loss of protection after the switch, and clear survival or growth differences once the full circuit is triggered." },
        ],
      },
    ],
  },
  experiments: {
    title: "Make every step reproducible", eyebrow: "Experiments", intro: "This page records the wet-lab validation workflow for the salt-controlled kill switch, from MazF toxicity tests through weak-promoter tuning to PDCA1 salt-response verification.", status: "team-draft",
    sections: [
      {
        title: "Wet-lab protocols",
        body: "The kill-switch module was validated through three connected experiment sets: MazF toxicity verification, weak-promoter toxin tuning and PDCA1 salt-response testing.",
        blocks: [
          { kind: "heading", text: "1. Verification of MazF toxicity (p1302-CaMV35S-mazF)" },
          { kind: "paragraph", text: "MazF is the killing component of the mazEF toxin-antitoxin system and serves as the core lethal element of the kill-switch design. To test whether MazF can suppress D. salina growth, mazF was placed under the constitutive CaMV 35S promoter in p1302-CaMV35S-mazF and functionally characterised." },
          { kind: "paragraph", text: "The construct was assembled in the pCAMBIA1302 backbone, verified by colony PCR and sequencing, and introduced into D. salina strain FACHB-435 by osmotic transformation. Cells were pre-adapted in 1 M NaCl for 8 h, resuspended in 0.1 M NaCl medium, mixed with 5.46 μg plasmid DNA and 15 μL of 0.1% Triton X-100, vortexed for 90 s, and allowed to recover for 48 h." },
          { kind: "paragraph", text: "Transformants were selected with hygromycin B and compared with wild-type and empty-vector controls. All three groups were cultured in 0.5 M NaCl PKS/DM medium at 26 °C under 50 μmol photons m⁻² s⁻¹ and a 16 h light / 8 h dark photoperiod. OD680 was measured daily for 10 days." },
          { kind: "figure", src: "/figures/wet-lab/experiment1.png", alt: "Plasmid map of p1302-CaMV35S-mazF used for MazF toxicity verification.", caption: "Figure 1. Plasmid map of p1302-CaMV35S-mazF (10,130 bp)." },
          { kind: "figure", src: "/figures/wet-lab/experiment2.png", alt: "Colony PCR verification of p1302-CaMV35S-mazF with marker, colonies and no-template control lanes.", caption: "Figure 2. Colony PCR verification of p1302-CaMV35S-mazF. M, DNA ladder; NTC, no-template control." },
          { kind: "figure", src: "/figures/wet-lab/experiment3.png", alt: "Ten-day growth curves comparing wild type, empty-vector and MazF transformant Dunaliella salina strains.", caption: "Figure 3. Growth curves of WT, empty-vector and MazF transformants over 10 days. MazF expression strongly inhibited D. salina growth." },
          { kind: "paragraph", text: "Result: the MazF group remained close to its initial density and stayed clearly below both controls throughout the assay. This confirms that MazF retains strong growth-inhibitory activity in the eukaryotic microalgal host." },
          { kind: "heading", text: "2. Weak-promoter toxin vector characterisation (p1302-bar-Pip-mazF)" },
          { kind: "paragraph", text: "Because strong toxin expression made stable maintenance difficult, the toxin module was rebuilt with a weaker endogenous promoter and an orthogonal marker. pCAMBIA1302-bar was used as the backbone, and the low-abundance promoter Pip was selected to drive mazF." },
          { kind: "paragraph", text: "The Pip promoter and mazF were amplified, assembled into the linearised backbone by multi-fragment homologous recombination, and transformed into E. coli DH5α. Positive clones were identified on kanamycin plates by colony PCR and confirmed by sequencing." },
          { kind: "paragraph", text: "The verified plasmid was introduced into D. salina by the same osmotic-transformation workflow and selected on phosphinothricin-containing medium. Positive transformants are being followed by OD680 growth-kinetics assays to determine whether weakly expressed MazF still provides sufficient killing efficacy." },
          { kind: "figure", src: "/figures/wet-lab/experiment4.png", alt: "Plasmid map of p1302-Pip-mazF using a bar marker and the weak Pip promoter.", caption: "Figure 4. Plasmid map of p1302-Pip-mazF (bar) (11,181 bp)." },
          { kind: "figure", src: "/figures/wet-lab/experiment5.png", alt: "Colony PCR verification of the p1302-Pip-mazF weak-promoter toxin construct.", caption: "Figure 5. Colony PCR verification of p1302-Pip-mazF. Clear specific bands were observed at the expected size." },
          { kind: "paragraph", text: "Current status: molecular construction and sequence verification are complete; the algal growth assay for the weak-promoter toxin module is still in progress." },
          { kind: "heading", text: "3. Validation of the PDCA1 salt-responsive system (p2301-PDCA1-EGFP)" },
          { kind: "paragraph", text: "The final circuit depends on PDCA1 as the salt-responsive input promoter. To verify its suitability, the endogenous PDCA1 promoter was fused to EGFP in the reporter plasmid p2301-PDCA1-EGFP." },
          { kind: "paragraph", text: "The reporter was assembled by homologous recombination into the linearised pCAMBIA2301 backbone, screened by colony PCR and confirmed by sequencing. Transformants were then assigned to media containing different NaCl concentrations, for example 0.5 M, 2 M and 3 M NaCl." },
          { kind: "paragraph", text: "EGFP fluorescence will be quantified across the salt gradient to establish the dynamic range of PDCA1 transcriptional activity and to test whether the promoter provides a usable high-salt versus low-salt switch input for the complete kill-switch design." },
          { kind: "figure", src: "/figures/wet-lab/experiment6.png", alt: "Plasmid map of p2301-PDCA1-EGFP used to test PDCA1 salt responsiveness.", caption: "Figure 6. Plasmid map of p2301-PDCA1-EGFP (11,250 bp)." },
        ],
      },
      { title: "Transcriptomics workflow", body: "The Transcriptomics page follows the carotenoid pathway from sequence annotation to replicate-aware light comparisons, then carries the LCYB response into the mathematical model." },
      { title: "Modelling workflow", body: "The Mathematical Modeling page records a five-state ODE from regulatory-factor activity through promoter occupancy and LCYB expression to β-carotene. The implementation requires explicit parameters and initial values, so published observations and project measurements remain distinguishable." },
    ],
  },
  results: {
    title: "Evidence, with its limits visible", eyebrow: "Results", intro: "This draft separates observed computational results, model-dependent predictions and measurements that still need to be made.", status: "team-draft",
    figure: { src: "/figures/dry-lab/carotenoid-route.svg", alt: "Carotenoid pathway diagram highlighting the LCYB branch from lycopene to beta-carotene", caption: "The transcript analysis follows the reaction order to the lycopene branch point, where LCYB directs synthesis toward beta-carotene." },
    sections: [
      { title: "Light acclimation and carotenoid genes", body: "The experiment compares three independently replicated light conditions after acclimation. The annotated LCYB transcript rises at intermediate light and falls between the intermediate and high-light conditions, while other pathway steps show their own responses. This gives the mathematical model a specific branch point to examine." },
      { title: "Regulator evidence", body: "The light-response analysis identifies a pathway step to carry forward. TF2146 is a separate design hypothesis examined in the protein and DNA analyses." },
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
