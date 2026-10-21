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
import { contribution } from './content/contribution';
import { parts } from './content/parts';

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
  { label: "Project", items: [["Description", "/project-description"], ["Contribution", "/contribution"], ["Design", "/design"], ["Experiments", "/experiments"], ["Engineering", "/engineering"], ["Parts", "/parts"]] },
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
        ["数学建模", "/mathematical-modeling"],
        ["Metabolomics", "/metabolomics"],
        ["Protein", "/protein"],
        ["Safety", "/safety-and-security"],
        ["Hardware Modeling", "/hardware"],
        ["Hardware Design", "/hardware-design"],
      ] as const,
    }
  : group);

export const pages: Record<string, WikiPage> = {
  model: dryLabIndex,
  transcriptomics,
  metabolomics,
  protein,
  "project-description": projectDescription,
  contribution,
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
  "mathematical-modeling": modeling,
  hardware,
  "hardware-design": hardwareDesign,
  "safety-and-security": safety,
  parts,
  "lab-safety": labSafety,
  "lab-notebook": labNotebook,
  "alternative-platform": {
    title: "Engineering beyond the usual chassis", eyebrow: "Alternative Platform", intro: "Dunaliella salina combines extreme halotolerance, photosynthetic carbon fixation and native carotenoid accumulation. DunaTerp uses those traits as functional parts of the engineering strategy rather than treating the alga as an interchangeable host.", status: "team-draft",
    references: [refs.oren2005, refs.lan2022, refs.fachet2020],
    sections: [
      { title: "A metabolism already oriented toward carotenoids", body: "D. salina contains the MEP-to-carotenoid pathway and can accumulate β-carotene under environmental stress [2]. The project therefore begins with an established pigment network and asks how regulation and branch competition can be reshaped around its native β-carotene pool." },
      { title: "Salt tolerance changes cultivation", body: "Growth in seawater and hypersaline media can reduce freshwater demand and suppress many common contaminants [1]. At the same time, high salinity affects materials, sensors, fluid handling and downstream recovery, so the chassis choice directly informs the reactor and process design." },
      { title: "Engineering the chassis", body: "Osmotic transformation provides a route for introducing genetic constructs into D. salina. The containment work tests MazF toxicity and weak-promoter control, while the central platform design proposes CPP2146 as a regulatory input. These interventions must be evaluated with construct verification, expression measurements and matched pigment or flux data." },
    ],
  },
  education,
  cooperation,
  collaboration,
  "integrated-human-practices": integratedHumanPractices,
  "background-research": ihpBackgroundResearch,
  "integrated-human-practices/stakeholder-analysis": ihpStakeholderAnalysis,
  "human-practices": ihpProjectImprovement,
  team,
  attributions,
};

// Legacy entry points stay usable without duplicating pages in the Wiki map.
export const pageRedirects: Record<string, string> = {
  '/dry-lab': '/model',
  '/project-improvement': '/human-practices',
  '/stakeholder-analysis': '/integrated-human-practices/stakeholder-analysis',
};

export const pageOrder = [...new Set([
  'project-description', 'contribution', 'design', 'experiments', 'engineering', 'safety-and-security', 'parts',
  'model', 'transcriptomics', 'metabolomics', 'protein', 'mathematical-modeling', 'hardware', 'hardware-design',
  ...Object.keys(pages).filter((key) => ![
    'project-description', 'contribution', 'design', 'experiments', 'engineering', 'safety-and-security', 'parts',
    'model', 'transcriptomics', 'metabolomics', 'protein',
    'mathematical-modeling', 'hardware', 'hardware-design',
  ].includes(key)),
])];
