import type { WikiPage } from '../site-data';
import type { AttributionEntry } from './types';

// Sources: SCU-China 2026 official Attributions Form, read on 20–21 October 2026;
// Jiayu Cheng and Zhe Yu's supplied documents; Lecheng Guo's supplied statement.
// Zhutian Mao and Yusen Wu's revised statements were supplied on 21 October.
// Summaries credit specific contributions rather than generic task definitions.
export const principalInvestigators: AttributionEntry[] = [
  {
    name: 'Nianhui Zhang', role: 'Primary PI',
    contribution: 'Provided ideas for the project, oversaw team administration and task allocation, supported funding and experimental materials, and provided laboratory safety guidance.',
  },
  {
    name: 'Hui Xu', role: 'Secondary PI',
    contribution: 'Reviewed experimental data and project progress, advised on the project framework and research direction, and provided vectors for Gateway cloning.',
  },
];

export const studentContributions: AttributionEntry[] = [
  {
    name: 'Hongyi Wang', role: 'Student Leader',
    contribution: 'Coordinated team tasks and project design, analyzed experimental data, reviewed literature, and participated in research and interviews. Wrote Wiki content and Safety and Check-In Forms, communicated with iGEM HQ, and assembled and tested hardware and recorded its demonstration video.',
  },
  {
    name: 'Xin Xiong', role: 'Student Leader',
    contribution: 'Led and coordinated the dry-lab team, including modeling and hardware development. Guided the analysis of modeling results and hardware tests, contributed to dry-lab Wiki implementation, and helped write, review, and visualize the modeling and hardware work.',
  },
  {
    name: 'Kaiting Wei', role: 'Student Leader',
    contribution: 'Conducted literature research, designed questionnaires, and analyzed external feedback to inform the project. Wrote and organized Human Practices materials and the Education and Cooperation sections, created event posters, and contributed to the team logo and graphic design.',
  },
  {
    name: 'Linjintao Chen',
    contribution: 'Provided guidance for dry-lab work, collected data, and participated in Human Practices activities.',
  },
  {
    name: 'Zhutian Mao',
    contribution: 'Contributed to DunaTerp’s carotenoid and β-ionone module design, literature research, feasibility assessment, plasmid construction, and experimental planning. Coordinated experimental and competition tasks, developed protocols, reviewed progress, drafted and revised Wiki content, and supported laboratory safety.',
  },
  {
    name: 'Yongyuan Mi',
    contribution: 'Participated in project coordination, drafted the Safety Form, contributed to selected Human Practices activities and hardware construction, and reviewed and revised Wiki content.',
  },
  {
    name: 'Furong Yang',
    contribution: 'Contributed to the biosafety module design, reviewed literature on kill switches and salt-regulated responses in Dunaliella salina, and constructed p1302-mazF. Developed experimental protocols and coordinated the module’s experimental planning and execution.',
  },
  {
    name: 'Qingying Zhao',
    contribution: 'Contributed to functional-module design and literature research on downstream metabolic pathways and genetic modification of Dunaliella salina. Identified candidate signal peptides and pathway genes, performed in-silico plasmid construction, and coordinated experimental methods, progress, and Wiki writing.',
  },
  {
    name: 'Tianyu Zhou',
    contribution: 'Managed dry-lab modeling work, coordinated the hardware project, and guided construction of the team Wiki.',
  },
  {
    name: 'Jiaxuan Chen',
    contribution: 'Designed the bioreactor, performed computational fluid dynamics simulations of its internal chamber, and procured hardware components.',
  },
  {
    name: 'Jiayu Cheng',
    contribution: 'Analyzed CPP2146 domains, conserved residues, and structures using sequence alignment, zinc-coordination modeling, and FoldX. Built the initial Python biosafety model, coordinated protein-modeling and biosafety tasks, prepared scientific figures, and developed and wrote the initial Protein section of the Wiki.',
  },
  {
    name: 'Hengyu Dai',
    contribution: 'Participated in vector construction, microalgal cultivation, and positive-transformant identification for Dunaliella salina engineering. Recorded procedures and raw data, organized supporting materials, and wrote and revised the corresponding Wiki Notebook content.',
  },
  {
    name: 'Yihan Dai',
    contribution: 'Designed primers and constructed p1302-bar-Pip-mazF and p2301-Pdca1-EGFP, performed chassis transformation, and contributed to algal cultivation and growth-curve analysis. Organized biosafety records and protocols in Benchling, coordinated experimental tasks, wrote the Biosafety Design and Results sections, and contributed to safety documentation.',
  },
  {
    name: 'Yuheng Gao',
    contribution: 'Participated in experiments for β-ionone and β-citraurin biosynthesis, curated experimental data, and maintained laboratory records and protocols. Wrote Notebook and Parts documentation, registered related biological parts, contributed to public outreach, and supported parts safety screening and laboratory biosafety practices.',
  },
  {
    name: 'Zhiyan Ge',
    contribution: 'Developed engineering models for the flat-panel airlift photobioreactor and built the browser-based PBR simulation tool and supporting code. Wrote the Hardware Modeling documentation and integrated Hardware Modeling and Hardware Design content, figures, equations, navigation, and the interactive widget into the Wiki.',
  },
  {
    name: 'Lecheng Guo',
    contribution: 'Analyzed CPP2146–DNA models and screened LCYB variants using AF3 and Vina, following Zhe Yu’s mutation designs and preparing FoldX inputs for Jiayu Cheng. Refined Cheng’s initial biosafety model and documented calibration limits; contributed analysis scripts, figures, interactive viewers, and Wiki content.',
  },
  {
    name: 'Hengwei Liang',
    contribution: 'Assisted with bacterial culture, gel electrophoresis, and DNA concentration measurements for the astaxanthin and crocetin work. Documented selected experiments and wrote and revised the Astaxanthin and Crocetin section of the Wiki Notebook.',
  },
  {
    name: 'Keyu Liu',
    contribution: 'Performed metabolomics-related modeling and analysis, developed the associated code and figures, and wrote and built the Metabolomics page. Integrated kill-switch content into the Engineering and Experiments pages and contributed to their writing and presentation.',
  },
  {
    name: 'Yuyang Lu',
    contribution: 'Analyzed experimental data, reviewed literature, and discussed the project with experts. Participated in wet-lab experiments, research, and interviews, wrote Wiki content, and contributed to Check-In Forms and laboratory safety.',
  },
  {
    name: 'Yujia Peng',
    contribution: 'Designed and conducted kill-switch experiments involving vector construction, algal transformation, and OD680 growth assays. Organized records and raw data, performed growth-curve processing and statistical analysis, generated figures in GraphPad Prism, and wrote the module’s background, methods, results, and discussion.',
  },
  {
    name: 'Hao Wang',
    contribution: 'Participated in plasmid and gene-construct assembly, recorded experimental procedures and results with safety considerations, and wrote safety-related Wiki and Parts documentation.',
  },
  {
    name: 'Jianye Wang',
    contribution: 'Designed primers and expression vectors, performed chassis transformation and RT-qPCR validation, and curated sequencing data and metadata. Developed protocols and vector maps, analyzed mass-spectrometry and qPCR results, wrote CPP2146, astaxanthin, and crocetin results, and supported safety documentation and deliverable uploads.',
  },
  {
    name: 'Xinyu Wang',
    contribution: 'Designed and analyzed a public-perception survey, interviewed enterprise experts, and prepared regulatory interview questions. Led a children’s eco-bottle workshop, presented at inter-team exchanges, wrote science-communication articles, co-authored an education practice handbook, and coordinated ACMA activities and external interviews.',
  },
  {
    name: 'Yinuo Wang',
    contribution: 'Analyzed Dunaliella salina RNA-seq data, linked transcriptomic evidence to LCYB-focused mathematical modeling, and wrote the Transcriptomics and Mathematical Modeling sections. Co-designed and built the Wiki’s visual system, interactive homepage, navigation, and content components; integrated team materials, coordinated revisions, tested interfaces, and supported deployment.',
  },
  {
    name: 'Ziqi Wang',
    contribution: 'Designed and verified CitCCD4 and CCD1 constructs, performed molecular cloning and Dunaliella transformation, and analyzed PCR, sequencing, and LC-MS/GC-MS data. Maintained experimental records, protocols, vector maps, and metadata; contributed to outreach, risk assessment, safety documentation, and Wiki writing for β-citraurin and β-ionone synthesis.',
  },
  {
    name: 'Yusen Wu',
    contribution: 'Curated MS, qPCR, sequencing, and plasmid records; quantified carotenoids and analyzed RT-qPCR data. Constructed vectors, transformed and cultured Dunaliella salina, and verified constructs and analytical conclusions. Coordinated tasks, produced scientific figures, and wrote Results, part descriptions, reports, and bilingual Wiki content.',
  },
  {
    name: 'Yanping Yang',
    contribution: 'Participated in plasmid construction and Dunaliella salina transformation, organized daily laboratory records, produced videos, and contributed to mascot and team-logo design.',
  },
  {
    name: 'Zhe Yu',
    contribution: 'Performed LCYB molecular docking and CPP2146–DNA docking, and designed pocket mutations and transcription-factor variants. Developed Wiki structures, interactive scripts, and interface changes; wrote the Protein docking analyses, introductory narrative and dialogue, and dry-lab reports, and refined scientific visualizations.',
  },
  {
    name: 'Ziyang Zhou',
    contribution: 'Constructed and verified five pCAMBIA1302-based vectors for CCD1 and CitCCD4 pathways, investigated amplification and promoter-loss problems, rebuilt constructs, and transformed Dunaliella salina. Prepared metabolomics samples, interpreted the datasets, and curated records in Benchling. Wrote the Engineering page’s Design-Build-Test-Learn account and contributed to science communication and the Safety Form.',
  },
];

export const acknowledgements: AttributionEntry[] = [
  {
    name: 'Yao Song', role: 'Advisor',
    contribution: 'Reviewed experimental data and advised on experimental planning and revision, including Dunaliella salina cultivation, passaging, and plasmid transformation.',
  },
];

export const attributions: WikiPage = {
  title: 'The people behind our work',
  eyebrow: 'Attributions',
  heroImage: 'https://static.igem.wiki/teams/6212/wiki/team/scu-china-2026.webp',
  intro: '',
  status: 'team-draft',
  sections: [
    { title: 'Team PI', body: '', blocks: [{ kind: 'attribution-list', entries: principalInvestigators }] },
    { title: 'Students in Team Roster', body: '', blocks: [{ kind: 'attribution-list', entries: studentContributions }] },
    { title: 'Acknowledgement', body: '', blocks: [{ kind: 'attribution-list', entries: acknowledgements }] },
    {
      title: 'Software and Resources',
      body: 'Public datasets, literature, software, and design resources are credited alongside the work that uses them. The project’s software and asset notices remain part of this attribution record.',
      blocks: [
        { kind: 'paragraph', text: 'The active homepage uses the repository’s original Canvas pixel world, extended with fictional NPC guides and educational games. The characters do not represent team members or stakeholder testimony. Stardew Valley is a stylistic reference; no game assets, characters, music or dialogue are redistributed.' },
        { kind: 'paragraph', text: 'The scroll-constrained route, Dunaliella geometry, scientific landmarks, text and interface are project-specific; no Folio models, artwork, audio or textures are redistributed. Full notice: THIRD_PARTY_NOTICES.md in the Wiki repository.' },
        { kind: 'paragraph', text: 'The Transcriptomics and Mathematical Modeling pages render equations and fonts locally with KaTeX 0.16.22, licensed under MIT. Source and licence notice: THIRD_PARTY_NOTICES.md in the Wiki repository.' },
      ],
    },
    {
      title: 'Official Attributions Form',
      body: '',
      blocks: [{ kind: 'official-attributions' }],
    },
  ],
};
