import type { ContentBlock, DocumentTextRun, WikiReference } from './content/types';
import { projectDescription } from './content/project-description';
import { design } from './content/design';
import { attributions } from './content/attributions';
import { refs } from './content/references';
import { safety } from './content/safety';
import { protein } from './content/protein';
import { dryLabNavigation, dryLabIndex, hardware, hardwareDesign, metabolomics, modeling, transcriptomics } from './content/dry-lab';
import { collaboration, cooperation, education } from './content/human-practices';
import { ihpBackgroundResearch, ihpProjectImprovement, ihpStakeholderAnalysis, integratedHumanPractices } from './content/integrated-human-practices';
import { team } from './content/team';
import { labSafety } from './content/lab-safety';
import { labNotebook } from './content/lab-notebook';
import { engineering } from './content/engineering';
import { results } from './content/results';

export type WikiSection = {
  title: string;
  titleRuns?: DocumentTextRun[];
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
  heroImage?: string;
  figure?: { src: string; alt: string; caption: string };
  references?: WikiReference[];
};

export const navigation: Array<{ label: string; items: ReadonlyArray<readonly [string, string]> }> = [
  { label: "Project", items: [["Description", "/project-description"], ["Contribution", "/contribution"], ["Design", "/design"], ["Experiments", "/experiments"], ["Results", "/results"], ["Engineering", "/engineering"], ["Parts", "/parts"]] },
  { label: "Dry Lab", items: dryLabNavigation },
  { label: "Human Practices", items: [["Integrated Human Practices", "/integrated-human-practices"], ["Education", "/education"], ["Cooperation", "/cooperation"]] },
  { label: "Lab", items: [["Lab Safety", "/lab-safety"], ["Notebook", "/lab-notebook"]] },
  { label: "Team", items: [["Team", "/team"], ["Attributions", "/attributions"], ["Collaboration", "/collaboration"]] },
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
        ["Safety", "/safety-and-security"],
        ["Hardware Modeling", "/hardware"],
        ["Hardware Design", "/hardware-design"],
      ] as const,
    }
  : group);

export const pages: Record<string, WikiPage> = {
  results,
  'dry-lab': dryLabIndex,
  transcriptomics,
  metabolomics,
  protein,
  "project-description": projectDescription,
  contribution: {
    title: "What DunaTerp contributes",
    eyebrow: "Contribution",
    intro: "This project contributes a chassis-level platform idea, a model-guided route-comparison framework and a salt-responsive containment concept for Dunaliella-based engineering.",
    status: "team-draft",
    sections: [
      {
        title: "A salt-compatible terpenoid platform",
        body: "DunaTerp proposes D. salina as more than a naturally pigmented organism. The project frames it as a salt-compatible engineering chassis whose native β-carotene metabolism can support several downstream terpenoid routes from one shared metabolic hub."
      },
      {
        title: "A model-guided design chain",
        body: "The project links transcriptional regulation, pathway control and downstream product competition in one design chain. Transcript evidence, metabolic modeling and product-route comparison are used together to define which measurements matter most for testing the platform."
      },
      {
        title: "A biosafety concept with explicit assumptions",
        body: "The salt-responsive containment work contributes a concrete biosafety idea for D. salina cultivation: keep cells viable in high-salt production conditions while increasing effective toxicity after a salinity drop. The value of this contribution lies not only in the circuit concept, but also in making its assumptions, response requirements and likely failure points explicit."
      },
    ],
  },
  design,
  engineering,
  experiments: {
    title: "Experiments", eyebrow: "Experiments", intro: "Our experimental work is organised into five connected modules. The overview below gathers the scope of every module in one place; the complete experimental documents follow for direct review and download.", status: "team-draft",
    sections: [
      {
        title: "Experiment Overview",
        tocTitle: "Overview",
        body: "The five experimental documents cover plasmid construction, two chassis-engineering routes, two product groups and the salt-responsive safety system.",
        blocks: [
          { kind: "heading", text: "Molecular Cloning" },
          { kind: "paragraph", text: "The molecular cloning chapter describes all plasmid-construction operations in our project. This section includes:" },
          { kind: "document-list", ordered: true, items: [[{ text: "Plasmid extraction" }], [{ text: "Agarose gel electrophoresis" }], [{ text: "Gel extraction" }], [{ text: "Transformation of competent cells" }], [{ text: "Plasmid construction by homologous recombination" }]] },
          { kind: "heading", text: "2146 Experiment Module" },
          { kind: "paragraph", text: "This chapter includes:" },
          { kind: "document-list", ordered: true, items: [[{ text: "Algal transformation" }], [{ text: "qPCR analysis" }], [{ text: "Phenotypic screening" }]] },
          { kind: "heading", text: "Astaxanthin & Crocin Module" },
          { kind: "paragraph", text: "This chapter includes:" },
          { kind: "document-list", ordered: true, items: [[{ text: "Pigment extraction" }], [{ text: "TLC analysis" }]] },
          { kind: "heading", text: "β-Ionone & β-Citraurin Module" },
          { kind: "paragraph", text: "This chapter includes:" },
          { kind: "document-list", ordered: true, items: [[{ text: "Strain screening" }], [{ text: "Metabolomics analysis" }], [{ text: "Transcriptional validation" }]] },
          { kind: "heading", text: "Safety Module" },
          { kind: "paragraph", text: "This chapter includes:" },
          { kind: "document-list", ordered: true, items: [[{ text: "MazF killing-activity verification" }], [{ text: "PDCA1 salt-induced response validation" }], [{ text: "Co-transformation and salt-switching assay" }]] },
        ],
      },
      {
        title: "Molecular Cloning",
        tocTitle: "Molecular Cloning",
        body: "",
        blocks: [
          { kind: "pdf", src: "/protocols/Experiment_Molecular_Cloning_EN.pdf", downloadSrc: "/protocols/Experiment_Molecular_Cloning_EN.pdf", label: "Molecular Cloning experiments (PDF)", downloadLabel: "Download PDF" },
        ],
      },
      {
        title: "2146 Experiment Module",
        tocTitle: "2146 Module",
        body: "",
        blocks: [
          { kind: "pdf", src: "/protocols/Experiment_CPP2146_EN.pdf", downloadSrc: "/protocols/Experiment_CPP2146_EN.pdf", label: "2146 experiments (PDF)", downloadLabel: "Download PDF" },
        ],
      },
      {
        title: "Astaxanthin & Crocin Module",
        tocTitle: "Astaxanthin & Crocin",
        body: "",
        blocks: [
          { kind: "pdf", src: "/protocols/Experiment_Astaxanthin_Crocin_EN.pdf", downloadSrc: "/protocols/Experiment_Astaxanthin_Crocin_EN.pdf", label: "Astaxanthin and Crocin experiments (PDF)", downloadLabel: "Download PDF" },
        ],
      },
      {
        title: "β-Ionone & β-Citraurin Module",
        tocTitle: "β-Ionone & β-Citraurin",
        body: "",
        blocks: [
          { kind: "pdf", src: "/protocols/Experiment_Beta_Ionone_Beta_Citraurin_EN.pdf", downloadSrc: "/protocols/Experiment_Beta_Ionone_Beta_Citraurin_EN.pdf", label: "β-Ionone and β-Citraurin experiments (PDF)", downloadLabel: "Download PDF" },
        ],
      },
      {
        title: "Safety module",
        tocTitle: "Safety module",
        body: "",
        blocks: [
          { kind: "pdf", src: "/protocols/Experiment_KillSwitch_EN.pdf", downloadSrc: "/protocols/Experiment_KillSwitch_EN.pdf", label: "Safety module (PDF)", downloadLabel: "Download PDF" },
        ],
      },
    ],
  },
  model: modeling,
  hardware,
  "hardware-design": hardwareDesign,
  "safety-and-security": safety,
  parts: {
    title: "Parts",
    eyebrow: "Parts",
    intro: "DunaTerp's Registry record brings together the regulatory elements, coding sequences, targeting element, vector and composite expression constructs used across the project. Each Part number below links directly to its official iGEM Registry record.",
    status: "review-ready",
    sections: [
      {
        title: "Overview",
        body: "This collection presents 11 basic parts and 5 composite parts used in DunaTerp. The basic parts include promoters, coding sequences, a chloroplast transit peptide and a plasmid vector. The composite parts combine these elements into expression constructs for our *Dunaliella salina* platform. Each entry links to its official iGEM Registry record.",
        blocks: [
          { kind: "links", links: [
            { label: "Open the official SCU-China (2026) Registry record", href: "https://registry.igem.org/organisations/b53d8950-5efe-4d5a-89b8-294aa00758ab" },
          ] },
        ],
      },
      {
        title: "Basic Parts",
        body: "The building blocks of our platform provide transcriptional control, protein coding sequences, chloroplast targeting and the vector backbone.",
        blocks: [
          { kind: "table", caption: "Basic Parts · SCU-China 2026", columns: ["Part number", "Part name", "Type", "Length", "Registry link"], rows: [
            ["BBa_26A1VMDJ", "*PDCA1* salt-responsive promoter", "Promoter", "1,369 bp", "https://registry.igem.org/parts/bba-26a1vmdj"],
            ["BBa_26S2808C", "*Pip* weak promoter", "Promoter", "2,044 bp", "https://registry.igem.org/parts/bba-26s2808c"],
            ["BBa_26EJ70BX", "*DtRBCS2* Promoter", "Promoter", "419 bp", "https://registry.igem.org/parts/bba-26ej70bx"],
            ["BBa_26TQTS2R", "CaMV 35S promoter", "Promoter", "346 bp", "https://registry.igem.org/parts/bba-26tqts2r"],
            ["BBa_261OJ38D", "*CitCCD4*", "CDS", "1,692 bp", "https://registry.igem.org/parts/bba-261oj38d"],
            ["BBa_2697BHS2", "*CCD1*", "CDS", "1,617 bp", "https://registry.igem.org/parts/bba-2697bhs2"],
            ["BBa_26FN67DL", "*MazE* antitoxin CDS", "CDS", "249 bp", "https://registry.igem.org/parts/bba-26fn67dl"],
            ["BBa_26VRE9P8", "*MazF* toxin CDS", "CDS", "336 bp", "https://registry.igem.org/parts/bba-26vre9p8"],
            ["BBa_26RSNHS8", "*GFP* reporter CDS", "CDS", "717 bp", "https://registry.igem.org/parts/bba-26rsnhs8"],
            ["BBa_265TD6LS", "*DtRBCS2* Chloroplast Transit Peptide", "Transit Peptide", "144 bp", "https://registry.igem.org/parts/bba-265td6ls"],
            ["BBa_26QLEIH2", "pCAMBIA1302", "Plasmid Vector", "10,549 bp", "https://registry.igem.org/parts/bba-26qleih2"],
          ] },
        ],
      },
      {
        title: "Composite Parts",
        body: "These expression constructs combine promoters and coding sequences, with a chloroplast transit peptide included in the targeted *CCD1* construct.",
        blocks: [
          { kind: "table", caption: "Composite Parts · SCU-China 2026", columns: ["Part number", "Part name", "Type", "Length", "Registry link"], rows: [
            ["BBa_26HXFBCU", "p*RBCS2*-*CitCCD4*", "Engineered Region", "2,111 bp", "https://registry.igem.org/parts/bba-26hxfbcu"],
            ["BBa_26LDQ026", "p35S-*CitCCD4*", "Engineered Region", "2,068 bp", "https://registry.igem.org/parts/bba-26ldq026"],
            ["BBa_261RCD6J", "p*RBCS2*-*CCD1*", "Engineered Region", "2,036 bp", "https://registry.igem.org/parts/bba-261rcd6j"],
            ["BBa_2682BGY8", "p35S-*CCD1*", "Engineered Region", "1,993 bp", "https://registry.igem.org/parts/bba-2682bgy8"],
            ["BBa_267QXDD3", "p*RBCS2*-Transit Peptide-*CCD1*", "Engineered Region", "2,177 bp", "https://registry.igem.org/parts/bba-267qxdd3"],
          ] },
        ],
      },
    ],
  },
  "lab-safety": labSafety,
  "lab-notebook": labNotebook,
  "alternative-platform": {
    title: "Engineering beyond the usual chassis", eyebrow: "Alternative Platform", intro: "Dunaliella salina combines extreme halotolerance, photosynthetic carbon fixation and native carotenoid accumulation. DunaTerp uses those traits as functional parts of the engineering strategy rather than treating the alga as an interchangeable host.", status: "team-draft",
    references: [refs.oren2005, refs.lan2022, refs.fachet2020],
    sections: [
      { title: "A metabolism already oriented toward carotenoids", body: "D. salina contains the MEP-to-carotenoid pathway and can accumulate β-carotene under environmental stress [2]. The project therefore begins with an established pigment network and asks how regulation and branch competition can be reshaped around its native β-carotene pool." },
      { title: "Salt tolerance changes cultivation", body: "Growth in seawater and hypersaline media can reduce freshwater demand and suppress many common contaminants [1]. At the same time, high salinity affects materials, sensors, fluid handling and downstream recovery, so the chassis choice directly informs the reactor and process design." },
      { title: "Engineering the chassis", body: "Osmotic transformation provides a route for introducing genetic constructs into D. salina. The containment work tests MazF toxicity and weak-promoter control, while the central platform design proposes TF2146 as a regulatory input. These interventions must be evaluated with construct verification, expression measurements and matched pigment or flux data." },
    ],
  },
  education,
  cooperation,
  collaboration,
  "integrated-human-practices": integratedHumanPractices,
  "background-research": ihpBackgroundResearch,
  "stakeholder-analysis": ihpStakeholderAnalysis,
  "project-improvement": ihpProjectImprovement,
  team,
  attributions,
};

export const pageOrder = [...new Set([
  'project-description', 'contribution', 'design', 'experiments', 'results', 'engineering', 'safety-and-security', 'parts',
  'dry-lab', 'transcriptomics', 'metabolomics', 'protein', 'model', 'hardware', 'hardware-design',
  ...Object.keys(pages).filter((key) => ![
    'project-description', 'contribution', 'design', 'experiments', 'results', 'engineering', 'safety-and-security', 'parts',
    'dry-lab', 'transcriptomics', 'metabolomics', 'protein',
    'model', 'hardware', 'hardware-design',
  ].includes(key)),
])];
