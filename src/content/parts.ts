import type { WikiPage } from '../site-data';
import type { ContentBlock, DocumentTextRun } from './types';

const REGISTRY = 'https://registry.igem.org/parts/';

/** Registry slugs are lower-case and use a hyphen between the BBa prefix and the id. */
const registrySlug = (partNo: string) => partNo.toLowerCase().replace(/_/g, '-');

const escapeForPattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Split plain text into runs so that selected gene and protein names render in
 * italics, following the 2025 wiki convention. Species names are handled
 * separately by the shared scientific-name formatter.
 */
function runs(text: string, italics: readonly string[] = []): DocumentTextRun[] {
  if (!italics.length) return [{ text }];
  const alternatives = [...italics].sort((a, b) => b.length - a.length).map(escapeForPattern);
  const pattern = new RegExp(`(${alternatives.join('|')})`, 'g');
  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => (italics.includes(part) ? { text: part, italic: true } : { text: part }));
}

/** A single Registry part, with the names that should be italicised. */
type Part = {
  no: string;
  name: string;
  nameItalics?: readonly string[];
  description: string;
  descriptionItalics?: readonly string[];
};

function partTable(caption: string, parts: readonly Part[]): ContentBlock {
  return {
    kind: 'table',
    caption,
    columns: ['Parts No.', 'Parts Name', 'Description'],
    rows: parts.map((part) => [part.no, part.name, part.description]),
    cellRuns: parts.map((part) => [
      [{ text: part.no, href: `${REGISTRY}${registrySlug(part.no)}` }],
      runs(part.name, part.nameItalics),
      runs(part.description, part.descriptionItalics),
    ]),
  };
}

// CPP2146 is our most important basic part and is therefore listed first.
// Parts carried over from earlier teams (the highlighted p35S) are listed
// without the (new) marker, following the 2025 SCU-China wiki convention.
const basicParts: readonly Part[] = [
  {
    no: 'BBa_262SH6PN',
    name: 'CPP2146(new)(Awards)',
    nameItalics: ['CPP2146'],
    description:
      "CPP2146 is the \"tunable switch\" of the Dunaliella salina platform - a member of the CPP family of transcription factors, which can alter the metabolic flow of the MEP pathway, thereby increasing the accumulation of β-carotene.",
    descriptionItalics: ['CPP2146'],
  },
  {
    no: 'BBa_K3500002',
    name: 'p35S',
    description:
      'CaMV 35S promoter is a well-established constitutive promoter widely used in plant genetic engineering to drive transcription of downstream heterologous coding sequences.',
  },
  {
    no: 'BBa_26EJ70BX',
    name: 'pRBCS2(new)',
    description:
      'pRBCS2 is a transcriptional regulatory fragment derived from the rbcS2 gene of Dunaliella tertiolecta. It comprises the upstream promoter region and the adjacent 5′ untranslated region (5′ UTR) and is intended to drive transcription of downstream coding sequences.',
    descriptionItalics: ['rbcS2'],
  },
  {
    no: 'BBa_2697BHS2',
    name: 'CCD1(new)',
    nameItalics: ['CCD1'],
    description:
      'Encodes Arabidopsis thaliana CCD1, a carotenoid cleavage dioxygenase with activity towards β-carotene, zeaxanthin, lutein and all-trans-violaxanthin. Cleavage of β-carotene at the C9–C10 and C9′–C10′ double bonds yields two molecules of β-ionone and one C14 dialdehyde. The coding sequence was codon-optimized for Dunaliella salina and is used in this project to investigate β-ionone biosynthesis.',
    descriptionItalics: ['CCD1'],
  },
  {
    no: 'BBa_261OJ38D',
    name: 'CitCCD4(new)',
    nameItalics: ['CitCCD4'],
    description:
      'Encodes carotenoid cleavage dioxygenase CitCCD4 from Citrus unshiu, which cleaves zeaxanthin and β-cryptoxanthin at the C7–C8 or C7′–C8′ double bond to form C30 apocarotenoids. Zeaxanthin yields β-citraurin, whereas β-cryptoxanthin can yield β-citraurin or all-trans-β-apo-8′-carotenal, depending on the cleavage site. The coding sequence was codon-optimized for Dunaliella salina and is used in this project to investigate β-citraurin biosynthesis.',
    descriptionItalics: ['CitCCD4'],
  },
  {
    no: 'BBa_265TD6LS',
    name: 'DtRBCS2 Chloroplast Transit Peptide(new)',
    description:
      'Encodes the N-terminal 48 amino acids of Dunaliella tertiolecta RbcS2 and is used as a candidate chloroplast transit peptide. It is intended to be fused to CCD1 to test chloroplast targeting of the nuclear-encoded enzyme and its potential to improve access to carotenoid substrates in Dunaliella salina.',
    descriptionItalics: ['CCD1'],
  },
  {
    no: 'BBa_26QLEIH2',
    name: 'pCAMBIA1302(new)',
    description:
      'pCAMBIA1302 is a circular binary vector for plant transformation and heterologous gene expression. It carries T-DNA borders, bacterial replication elements, kanamycin and hygromycin resistance markers, and a CaMV 35S-driven mGFP5 reporter followed by the NOS terminator. In this project, it serves as the vector backbone for constructing CCD1 and CitCCD4 expression modules intended for β-ionone and β-citraurin biosynthesis in Dunaliella salina, respectively.',
    descriptionItalics: ['CCD1', 'CitCCD4'],
  },
  {
    no: 'BBa_26A1VMDJ',
    name: 'PDCA1 salt-responsive promoter(new)',
    description:
      'An endogenous Dunaliella salina promoter used as a salinity-responsive transcriptional control element. The project design uses it to drive reporter or MazE expression under high-salinity conditions; its response is to be characterized experimentally.',
    descriptionItalics: ['MazE'],
  },
  {
    no: 'BBa_26S2808C',
    name: 'Pip weak promoter(new)',
    description:
      'A weak promoter annotated in the project design as Pip. It is intended to drive low-level MazF expression in the salinity-responsive toxin–antitoxin design. Its promoter activity and exact functional boundaries should be confirmed experimentally.',
    descriptionItalics: ['MazF'],
  },
  {
    no: 'BBa_26GM5HSQ',
    name: 'GjALDH2C3(new)',
    nameItalics: ['GjALDH2C3'],
    description:
      'Encodes aldehyde dehydrogenase ALDH2C3; oxidizes crocetin dialdehyde produced by CCD4a into crocetin. Codon-optimized for expression in Dunaliella salina.',
    descriptionItalics: ['ALDH2C3', 'CCD4a'],
  },
  {
    no: 'BBa_26O3OC9Q',
    name: 'GjCCD4a(new)',
    nameItalics: ['GjCCD4a'],
    description:
      'Encodes carotenoid cleavage dioxygenase 4a (CCD4a); cleaves β-carotene/zeaxanthin at the 7/8 and 7′/8′ positions to yield crocetin dialdehyde. Codon-optimized for expression in Dunaliella salina.',
    descriptionItalics: ['CCD4a'],
  },
  {
    no: 'BBa_26RSNHS8',
    name: 'GFP reporter CDS(new)',
    nameItalics: ['GFP'],
    description:
      'Encodes a green fluorescent protein reporter. When placed downstream of PDCA1, fluorescence is intended to provide a readout of promoter activity under different salinity conditions.',
  },
  {
    no: 'BBa_26RZZF2O',
    name: 'HpBKT(new)',
    nameItalics: ['HpBKT'],
    description:
      'Encodes β-carotene ketolase (BKT); introduces keto groups at the C4/C4′ positions of β-carotene via echinenone to canthaxanthin, providing the ketolation step required for astaxanthin. Codon-optimized for expression in Dunaliella salina.',
    descriptionItalics: ['BKT'],
  },
  {
    no: 'BBa_26FN67DL',
    name: 'MazE antitoxin CDS(new)',
    nameItalics: ['MazE'],
    description:
      'Encodes the MazE antitoxin component of the MazEF system. MazE is expected to bind and inhibit MazF, allowing the project to test whether inducible antitoxin expression can mitigate MazF-associated growth inhibition.',
    descriptionItalics: ['MazE', 'MazF'],
  },
  {
    no: 'BBa_26VRE9P8',
    name: 'MazF toxin CDS(new)',
    nameItalics: ['MazF'],
    description:
      'Encodes the MazF toxin component of the MazEF toxin–antitoxin system. When expressed, MazF is expected to inhibit cell growth through its RNA-cleavage activity. In this project, the sequence is used to test toxin expression and the proposed salinity-responsive containment design.',
    descriptionItalics: ['MazF'],
  },
];

const compositeParts: readonly Part[] = [
  {
    no: 'BBa_261RCD6J',
    name: 'pRBCS2-CCD1',
    nameItalics: ['CCD1'],
    description:
      'Combines the Dunaliella tertiolecta rbcS2 promoter with CCD1 for investigating β-ionone biosynthesis from β-carotene in Dunaliella salina. It provides a comparison for the corresponding CaMV 35S-driven module and the transit peptide–CCD1 fusion module, allowing assessment of promoter choice and chloroplast-targeting design in the project.',
    descriptionItalics: ['CCD1', 'rbcS2'],
  },
  {
    no: 'BBa_26HXFBCU',
    name: 'pRBCS2-CitCCD4',
    nameItalics: ['CitCCD4'],
    description:
      'Combines the Dunaliella tertiolecta rbcS2 promoter with CitCCD4 for investigating β-citraurin biosynthesis from zeaxanthin or β-cryptoxanthin in Dunaliella salina. It is intended for comparison with the corresponding CaMV 35S-driven module to assess the effects of promoter choice on CitCCD4 expression.',
    descriptionItalics: ['CitCCD4', 'rbcS2'],
  },
  {
    no: 'BBa_267QXDD3',
    name: 'pRBCS2-transit peptide-CCD1',
    nameItalics: ['CCD1'],
    description:
      'Combines the Dunaliella tertiolecta rbcS2 promoter with CCD1 fused to an N-terminal RbcS2-derived candidate chloroplast transit peptide. It is designed for nuclear expression in Dunaliella salina, aiming to direct CCD1 to chloroplasts and improve access to β-carotene for β-ionone biosynthesis. Comparison with the module lacking this peptide is intended to assess the contribution of the targeting design.',
    descriptionItalics: ['CCD1', 'rbcS2'],
  },
  {
    no: 'BBa_2682BGY8',
    name: 'p35S-CCD1',
    nameItalics: ['CCD1'],
    description:
      'Combines the CaMV 35S promoter from pCAMBIA1302 with CCD1 for investigating β-ionone biosynthesis from β-carotene in Dunaliella salina. It serves as the 35S-based comparison for the rbcS2 promoter-driven CCD1 module, enabling assessment of promoter-dependent differences in expression.',
    descriptionItalics: ['CCD1', 'rbcS2'],
  },
  {
    no: 'BBa_26LDQ026',
    name: 'p35S-CitCCD4',
    nameItalics: ['CitCCD4'],
    description:
      'Combines the CaMV 35S promoter from pCAMBIA1302 with CitCCD4 for investigating β-citraurin biosynthesis from zeaxanthin or β-cryptoxanthin in Dunaliella salina. It serves as the 35S-based comparison for the rbcS2 promoter-driven CitCCD4 module, enabling assessment of promoter-dependent differences in expression.',
    descriptionItalics: ['CitCCD4', 'rbcS2'],
  },
  {
    no: 'BBa_26S6WZ68',
    name: 'p35S-HpBKT expression cassette',
    nameItalics: ['HpBKT'],
    description:
      'Expression cassette driving codon-optimized HpBKT under CaMV 35S in Dunaliella salina; establishes the ketolation branch (β-carotene → echinenone → canthaxanthin) toward astaxanthin.',
    descriptionItalics: ['HpBKT'],
  },
  {
    no: 'BBa_26I2L0YL',
    name: 'pRBCS2-Transit Peptide-GjCCD4a',
    nameItalics: ['GjCCD4a'],
    description:
      'This composite part contains the DtRBCS2 promoter (pRBCS2) and the codon-optimized GjCCD4a CDS for Dunaliella salina. The promoter originates from the rbcS2 regulatory region of Dunaliella tertiolecta. GjCCD4a, a carotenoid cleavage dioxygenase 4a, cleaves β-carotene and zeaxanthin at 7/8 and 7′/8′ sites to generate crocetin dialdehyde. This construct aims to produce crocetin dialdehyde in D. salina; its performance will be compared with the CaMV 35S-driven construct to assess promoter effects.',
    descriptionItalics: ['GjCCD4a', 'rbcS2'],
  },
  {
    no: 'BBa_267AW913',
    name: 'PDCA1–MazE–NOS–Pip–MazF–NOS combined region',
    nameItalics: ['MazE', 'MazF'],
    description:
      'A combined antitoxin and toxin expression region designed to evaluate the MazE–MazF safety module in Dunaliella salina.',
    descriptionItalics: ['MazE', 'MazF'],
  },
  {
    no: 'BBa_260SUBTI',
    name: 'pRBCS2-Transit Peptide-HpBKT',
    nameItalics: ['HpBKT'],
    description:
      'This composite part contains the DtRBCS2 promoter (pRBCS2) and the codon-optimized HpBKT CDS for Dunaliella salina. The promoter originates from the rbcS2 regulatory region of Dunaliella tertiolecta. HpBKT is a β-carotene ketolase, which adds keto groups at the C4/C4′ positions of β-carotene via echinenone to form canthaxanthin, catalyzing the ketolation step for astaxanthin biosynthesis. This construct is designed for astaxanthin synthesis in D. salina and will be compared with the CaMV 35S-driven construct to evaluate promoter effects.',
    descriptionItalics: ['HpBKT', 'rbcS2'],
  },
  {
    no: 'BBa_26ICM4JI',
    name: 'p35S-GjALDH2C3 expression cassette',
    nameItalics: ['GjALDH2C3'],
    description:
      'Expression cassette driving codon-optimized GjALDH2C3 under CaMV 35S in Dunaliella salina; completes the crocetin branch by oxidizing crocetin dialdehyde into crocetin.',
    descriptionItalics: ['GjALDH2C3'],
  },
  {
    no: 'BBa_26EJZ5NP',
    name: 'Pip–MazF–NOS toxin-expression cassette',
    nameItalics: ['MazF'],
    description:
      'An expression cassette designed to express MazF from the weak Pip promoter in Dunaliella salina.',
    descriptionItalics: ['MazF'],
  },
  {
    no: 'BBa_26CX0X03',
    name: 'pRBCS2-Transit Peptide-GjALDH2C3',
    nameItalics: ['GjALDH2C3'],
    description:
      'This composite part contains the DtRBCS2 promoter (pRBCS2) and the codon-optimized GjALDH2C3 CDS for Dunaliella salina. The promoter originates from the rbcS2 regulatory region of Dunaliella tertiolecta. GjALDH2C3 is an aldehyde dehydrogenase that oxidizes crocetin dialdehyde (the product of CCD4a) into crocetin. This construct is designed for crocetin synthesis in D. salina and will be compared with the CaMV 35S-driven construct to evaluate promoter effects.',
    descriptionItalics: ['GjALDH2C3', 'CCD4a', 'rbcS2'],
  },
  {
    no: 'BBa_26Q0FV6C',
    name: 'CaMV35S–MazF–NOS toxin-expression cassette',
    nameItalics: ['MazF'],
    description:
      'A toxin-expression cassette consisting of the CaMV 35S promoter, the MazF coding sequence and the NOS terminator. It is designed to express MazF in Dunaliella salina for characterization of the toxin component and the proposed containment system.',
    descriptionItalics: ['MazF'],
  },
  {
    no: 'BBa_26JX4ZRS',
    name: 'pRBCS2-Transit Peptide-GjALDH2C3',
    nameItalics: ['GjALDH2C3'],
    description:
      'This composite part contains the DtRBCS2 promoter (pRBCS2) and the codon-optimized GjALDH2C3 CDS for Dunaliella salina. The promoter originates from the rbcS2 regulatory region of Dunaliella tertiolecta. GjALDH2C3 is an aldehyde dehydrogenase that oxidizes crocetin dialdehyde (the product of CCD4a) into crocetin. This construct is designed for crocetin synthesis in D. salina and will be compared with the CaMV 35S-driven construct to evaluate promoter effects.',
    descriptionItalics: ['GjALDH2C3', 'CCD4a', 'rbcS2'],
  },
  {
    no: 'BBa_266DMPNU',
    name: 'PDCA1–EGFP–NOS salinity-response reporter cassette',
    description:
      'A reporter cassette designed to measure PDCA1 promoter activity in Dunaliella salina under different salinity conditions.',
  },
  {
    no: 'BBa_26DQ7VQA',
    name: 'PDCA1–MazE–NOS antitoxin-expression cassette',
    nameItalics: ['MazE'],
    description:
      'An expression cassette designed to express the MazE antitoxin under control of the PDCA1 promoter in Dunaliella salina.',
    descriptionItalics: ['MazE'],
  },
  {
    no: 'BBa_26Q3ZPVE',
    name: 'p35S-GjCCD4a expression cassette',
    nameItalics: ['GjCCD4a'],
    description:
      'Expression cassette driving codon-optimized GjCCD4a under the CaMV 35S promoter in Dunaliella salina; initiates the crocetin branch by cleaving β-carotene/zeaxanthin to crocetin dialdehyde.',
    descriptionItalics: ['GjCCD4a'],
  },
];

// Every composite part below was registered by the team this year, so the (new)
// marker is applied to the whole table, following the 2025 SCU-China convention.
const compositePartsWithMarker: readonly Part[] = compositeParts.map((part) => ({
  ...part,
  name: `${part.name}(new)`,
}));

export const parts: WikiPage = {
  title: 'Parts',
  eyebrow: 'Parts',
  intro: "DunaTerp's Registry record brings together the regulatory elements, coding sequences, targeting element, vector and composite expression constructs used across the project. Each Part number below links directly to its official iGEM Registry record.",
  status: 'review-ready',
  sections: [
    {
      title: 'Overview',
      body:
        'DunaTerp used 15 basic parts and 17 composite parts in this year\'s work, among which 14 basic parts and 17 composite parts were newly registered. The basic parts provide transcriptional control, protein coding sequences, chloroplast targeting and the vector backbone; the composite parts combine these elements into the expression constructs assembled for our *Dunaliella salina* platform.\n\nAmong the basic parts, CPP2146 is the project\'s central component. It belongs to the CPP family of transcription factors and acts as a tunable switch on the MEP pathway, redirecting metabolic flux to increase β-carotene accumulation in *Dunaliella salina*.',
      blocks: [
        { kind: 'links', links: [
          { label: 'Open the official SCU-China (2026) Registry record', href: 'https://registry.igem.org/organisations/b53d8950-5efe-4d5a-89b8-294aa00758ab' },
        ] },
      ],
    },
    {
      title: 'Basic Parts',
      body: 'The building blocks of our platform provide transcriptional control, protein coding sequences, chloroplast targeting and the vector backbone. CPP2146, our most important basic part, is listed first.',
      blocks: [partTable('Basic Parts · SCU-China 2026', basicParts)],
    },
    {
      title: 'Composite Parts',
      body: 'These expression constructs combine promoters and coding sequences, with a chloroplast transit peptide included in several chloroplast-targeting variants.',
      blocks: [partTable('Composite Parts · SCU-China 2026', compositePartsWithMarker)],
    },
  ],
};