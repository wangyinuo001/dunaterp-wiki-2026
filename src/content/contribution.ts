import type { WikiPage, WikiSection } from '../site-data';

const section = (title: string, items: string[], links: [string, string][]): WikiSection => ({
  title,
  body: '',
  blocks: [
    { kind: 'document-list', ordered: true, items: items.map(text => [{ text }]) },
    { kind: 'links', links: links.map(([label, href]) => ({ label: `Learn More · ${label}`, href })) },
  ],
});

export const contribution: WikiPage = {
  title: 'Contribution',
  eyebrow: 'Contribution',
  intro: 'We share experimental protocols, biological parts, modeling frameworks and Human Practices resources to support future teams working with Dunaliella salina and other photosynthetic chassis.',
  status: 'team-draft',
  sections: [
    section('Experiment', [
      'We provide experimental protocols for engineering Dunaliella salina, covering molecular cloning, osmotic transformation, selection and screening. These procedures offer future teams a practical starting point for working with this non-model photosynthetic chassis.',
      'We document methods for transgene characterization and carotenoid-product screening, including genomic DNA analysis, qPCR, pigment extraction and thin-layer chromatography. Together, these methods connect construct introduction with molecular and product-level evaluation.',
      'We share troubleshooting experience from plasmid instability, algal clone isolation and pigment separation. Our engineering records explain how changing the plasmid-propagation strain, introducing solid-medium screening and adjusting extraction and chromatography conditions helped resolve these problems.',
    ], [
      ['Experiments', '/experiments'],
      ['Engineering', '/engineering'],
    ]),
    section('Parts', [
      'We propose a modular carotenoid-derived terpenoid platform built around the native β-carotene pool of D. salina. By documenting promoter choices, chloroplast targeting and downstream enzyme constructs, we provide design references for extending this chassis beyond β-carotene accumulation.',
      'We propose a salt-responsive MazE–MazF containment circuit and report initial characterization of its toxin-expression and salt-responsive promoter modules. This work provides a design reference for connecting environmental salinity with biological containment in engineered microalgae.',
      'We organize 11 Basic Parts and 5 Composite Parts, including regulatory elements, coding sequences, a chloroplast transit peptide, a vector backbone and expression constructs. Their descriptions and Registry links provide an accessible reference for future chassis engineering.',
    ], [
      ['Parts', '/parts'],
      ['Design', '/design'],
    ]),
    section('Modeling', [
      'We provide a sequence-supported transcriptomics workflow and a structure-based candidate-screening framework for carotenoid engineering. These analyses connect light-responsive transcripts with LCYB and CPP2146 design questions, helping future teams select targets and define the functional measurements needed to evaluate them.',
      'We develop a multiscale modeling framework linking transcriptional regulation, LCYB activity, β-carotene supply and downstream product allocation. Dynamic modeling and flux balance analysis offer complementary ways to compare product routes, examine metabolic trade-offs and prioritize experimental measurements.',
      'We develop a quantitative assessment framework for salt-responsive containment, distinguishing growth inhibition, conditional killing and cell washout. Sensitivity analysis identifies how response delay, effective mortality and environmental salinity affect predicted containment performance.',
      'We connect optical transport, cultivation dynamics, light–dark cycling and energy analysis with photobioreactor design. This framework translates biological requirements into reactor geometry and operating conditions, providing a reference for evaluating photosynthetic cultivation systems.',
    ], [
      ['Dry Lab', '/dry-lab'],
      ['Mathematical Modeling', '/model'],
      ['Hardware', '/hardware'],
    ]),
    section('Human Practices', [
      "We built an evidence-based stakeholder research framework for DunaTerp by integrating a 230-response public questionnaire, consultations with microalgae enterprises, food-safety regulatory departments, and academic experts. This process identified the key challenges facing microalgae-based terpene production: public concerns about product safety and ecological risks, uncertainty in regulatory pathways for products derived from engineered microalgae, and the need to demonstrate practical advantages over established yeast, bacterial, and algal production systems.",
      "We refined the project’s application positioning and industrial evaluation criteria through engagement with microalgae-producing enterprises. We also recognized that producing multiple terpenes does not necessarily create greater commercial value, and therefore proposed prioritizing one target compound with a defined downstream application and feasible separation route.",
      "We promoted a focused and responsible iterative design strategy through academic and regulatory consultation. Expert feedback encouraged us to clarify the distinctive value of Dunaliella salina. Regulatory discussions also prompted us to assess each target product according to its production chassis, genetic modification, purification process, and intended use.",
      "We strengthened public engagement, inclusive science education, and the long-term inheritance of synthetic-biology knowledge. Based on public concerns and information needs, we organized a terrarium-building outreach activity for children, participated in a high-school science festival, and continued developing the Sichuan University Microbial Application Design Competition (ACMA). Meanwhile, our “iGEM Student Society” WeChat Official Account documented outreach activities, competition experiences, and accessible scientific explanations.",
    ], [
      ['Integrated Human Practices', '/integrated-human-practices'],
      ['Education', '/education'],
      ['Collaboration', '/collaboration'],
    ]),
  ],
};
