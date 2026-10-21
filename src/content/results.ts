import type { WikiPage } from '../site-data';
import type { ContentBlock } from './types';
import biosafetyFigures from './results-figures.json';
import { refs } from './references';

const paragraph = (text: string): ContentBlock => ({ kind: 'paragraph', text });
const heading = (text: string): ContentBlock => ({ kind: 'heading', text });
const links = (...items: [string, string][]): ContentBlock => ({ kind: 'links', links: items.map(([label, href]) => ({ label, href })) });
const figure = (index: number): ContentBlock => biosafetyFigures[index - 1] as ContentBlock;
const construction = (...indices: number[]): ContentBlock => ({
  kind: 'details', summary: 'View plasmid construction and verification',
  blocks: indices.map(figure),
});

export const results: WikiPage = {
  title: 'Results',
  eyebrow: 'Results',
  intro: 'Experimental observations, computational predictions and the measurements still needed to evaluate DunaTerp.',
  status: 'review-ready',
  references: [
    { label: 'SCU-China (2026). Biosafety-Results. Team experimental report supplied for this Results page. Figures 4-1–4-11; construction, growth assays and current circuit status.' },
    { label: 'SCU-China (2026). Engineering. Team records of CPP2146, CCD1, BKT and CitCCD4 construction and characterisation.', href: '/engineering' },
    refs.transcriptomeDataset, refs.li2019, refs.fachet2020, refs.alphafold3,
    refs.dca1, refs.mazf,
  ],
  sections: [
    {
      title: 'Results at a glance', body: 'DunaTerp combines a carotenoid regulatory module, downstream product routes and a proposed salt-responsive containment circuit in *Dunaliella salina*. Our current evidence supports several individual modules. Product identity, productivity and the complete containment phenotype require further validation. The overview below separates experimental observations from computational predictions and work in progress.',
      blocks: [
        { kind: 'table', caption: 'Evidence across the DunaTerp platform', columns: ['Module', 'Evidence available', 'Conclusion and scope'], rows: [
          ['CPP2146 regulation', 'Repeated RT-qPCR and LC-MS/MS', 'Transcriptional changes and altered carotenoid composition; improved absolute β-carotene supply remains unproven.'],
          ['Downstream products', 'Construct verification, TLC and metabolomic screening', 'Candidate product-associated signals; product confirmation and quantitative yields remain incomplete.'],
          ['CaMV 35S–mazF', 'Construction records and 10-day OD680 curves', 'Strong growth inhibition relative to WT and empty-vector controls.'],
          ['Pip–mazF', 'Construction records and 6-day OD680 curves', 'Growth inhibition relative to WT in the supplied Results experiment.'],
          ['PDCA1–EGFP', 'Construction records and reported green fluorescence', 'Qualitative reporter expression; a quantitative salt-response curve is pending.'],
          ['Complete containment circuit', 'PDCA1–mazE construction in progress', 'Co-transformation, antitoxin rescue and salt-dependent survival remain to be tested.'],
          ['Computational analyses', 'Transcript reanalysis, flux models, structural screening and dynamic models', 'Conditional predictions that guide experiments; they do not establish measured productivity or clearance.'],
        ] },
        paragraph('The biosafety results below use the supplied Biosafety-Results report and its original figures [1]. The regulatory and product summaries draw on the team’s Engineering records [2]. Experimental curves are reproduced as supplied; approximate values are descriptive and are not newly fitted measurements.'),
        links(['Experimental methods', '/experiments'], ['Engineering cycles and detailed records', '/engineering'], ['Laboratory notebook', '/lab-notebook']),
      ],
    },
    {
      title: 'CPP2146 changes transcription and carotenoid composition',
      body: 'After replacing one repeated CaMV 35S promoter with the endogenous RBCS2 promoter, we obtained a sequence-verified CPP2146 expression construct. Repeated RT-qPCR after RNA-extraction optimisation showed higher expression of the tested carotenoid-pathway genes in the CPP2146 line than in WT [2].',
      blocks: [
        { kind: 'figure', src: '/figures/wet-lab/engineering-total/engineering-total-06-a111fa7f10e7.webp', width: 1126, height: 975, alt: 'Team LC-MS/MS comparison of carotenoids in CPP2146-expressing and wild-type algae.', caption: 'Fig. R1. LC-MS/MS analysis of carotenoids in CPP2146-expressing and WT algae. Source: team Engineering records, original Fig. 6.' },
        paragraph('LC-MS/MS showed a smaller total carotenoid pool in the CPP2146 line, together with a larger relative proportion of β-carotene. These observations support altered carotenoid composition. A larger proportion within a smaller pool does not establish greater absolute β-carotene content or increased metabolic flux.'),
        paragraph('The first RT-qPCR run gave the opposite trend, and suspected RNA degradation was identified during workflow review. Repeating extraction changed the observed result, but did not independently prove the cause of the discrepancy. Direct promoter recognition also remains a hypothesis. Absolute pigment content, biomass-normalised productivity, independent lines and an empty-vector control are needed to evaluate precursor improvement.'),
        links(['Read the CPP2146 engineering cycles', '/engineering#section-1'], ['Regulatory and structural hypotheses', '/protein']),
      ],
    },
    {
      title: 'Progress across the four product routes',
      body: 'The four target routes have different levels of experimental support. Construction and screening results identify what to test next; none of the evidence summarised here provides a validated production titre for the complete platform [2].',
      blocks: [
        heading('β-Ionone'),
        paragraph('The CCD1 constructs passed sequence verification after amplification and primer optimisation. TLC did not demonstrate β-ionone production. Widely targeted UPLC-MS/MS detected 1,510 metabolites; β-ionone signals in the two CCD1 lines were 1.34- and 1.04-fold relative to WT, while several non-volatile C18 apocarotenoid cleavage products increased 2.1- to 4.5-fold. These changes are consistent with altered carotenoid cleavage, but do not directly establish β-ionone production or its yield. Volatile losses are a possible explanation for weak detection, rather than a demonstrated cause.'),
        paragraph('Headspace GC-MS with an authentic standard and recovery controls is the next priority for direct β-ionone identification and quantification.'),
        heading('Crocetin'),
        paragraph('The crocetin route is included in our Design and metabolic-network analyses. No dedicated crocetin production measurement is available in the experimental records used for this page. Feasibility in a model remains separate from experimental product detection.'),
        heading('Astaxanthin'),
        paragraph('Sequence-verified BKT expression constructs and separately maintained algal lines were obtained. Promoter replacement and chloroplast targeting were followed by candidate TLC bands near the expected migration position. These are preliminary screening observations; authentic-standard chromatography and mass-spectral confirmation are still needed to identify and quantify astaxanthin.'),
        { kind: 'figure', src: '/figures/wet-lab/engineering-total/engineering-total-17-c88cf64c8ee5.webp', width: 1428, height: 674, alt: 'TLC screening of the chloroplast-targeted BKT module under visible and ultraviolet light.', caption: 'Fig. R2. TLC screening after BKT chloroplast targeting. Left: visible light; right: UV. Candidate bands require further chemical confirmation. Source: team Engineering records, original Fig. 17.' },
        heading('β-Citraurin'),
        paragraph('After extraction and solvent optimisation, the CitCCD4 line showed a new TLC spot at the expected position that was absent from WT. This supports a candidate product-associated change. TLC migration alone is insufficient for definitive chemical identification, and quantitative productivity has not been established.'),
        { kind: 'figure', src: '/figures/wet-lab/engineering-total/engineering-total-23-a8bbdfa5a53c.webp', width: 866, height: 845, alt: 'Optimised TLC comparison with WT on the left and a new spot in the CitCCD4 line on the right.', caption: 'Fig. R3. TLC under optimised conditions. Left: WT; right: CitCCD4. The additional spot is a screening result. Source: team Engineering records, original Fig. 23.' },
        links(['Product-route design', '/design'], ['Construction, screening and unsuccessful attempts', '/engineering']),
      ],
    },
    {
      title: 'CaMV 35S–MazF strongly inhibits algal growth',
      tocTitle: 'Strong-promoter MazF',
      body: 'MazF is the toxin component of the mazEF system and has documented mRNA endonuclease activity in its bacterial context [8]. We tested its effect in the algal chassis using p1302-CaMV 35S-mazF. Colony PCR and sequencing were reported to confirm construct assembly [1].',
      blocks: [
        construction(1, 2, 3),
        heading('Ten-day growth assay'),
        paragraph('Following transformation and hygromycin selection, MazF transformants were compared with untransformed WT and empty-vector (EV) controls in growth medium containing 0.5 M NaCl. OD680 was monitored for ten days. WT and EV reached approximately 0.36 and 0.28, respectively, while the MazF line remained near its initial low optical density, approximately 0.05–0.08.'),
        figure(4),
        paragraph('The curve supports sustained inhibition of net culture growth by strong-promoter MazF expression. OD680 is an optical-density readout, so this experiment alone cannot distinguish growth arrest from cell death or establish a survival fraction. The result supports testing MazF as a containment effector, while also exposing a growth burden that the final circuit must control.'),
        paragraph('The supplied figure includes error bars and significance symbols, but the Results report does not specify replicate definitions, error-bar meaning or the statistical test. We retain the original plot and do not assign new p-values or infer a killing percentage.'),
      ],
    },
    {
      title: 'Pip–MazF retains growth-inhibitory activity',
      tocTitle: 'Weak-promoter MazF',
      body: 'To test a weaker toxin-expression design, we assembled Pip and mazF into the pCAMBIA1302-Bar backbone. Colony PCR and sequencing were reported to verify the p1302-Bar-Pip-mazF construct. Algal transformants were selected using glufosinate and compared with WT in a six-day growth assay [1].',
      blocks: [
        construction(8, 9, 10),
        heading('Six-day growth assay'),
        figure(11),
        paragraph('In the supplied Results experiment, WT reached OD680 ≈ 0.24 on day 6. The Pip-mazF group showed a transient decrease and partial rebound before ending near its starting optical density, approximately 0.05. This supports sustained growth inhibition in the absence of the antitoxin. It does not by itself show irreversible killing, quantify promoter strength or establish controllable switching.'),
        paragraph('This curve is reported as a separate experiment from the ten-day CaMV 35S assay. Different durations and control groups prevent a direct quantitative comparison of promoter performance. A matched comparison and an empty-vector control for the Pip construct would strengthen that assessment.'),
        paragraph('The original Results plot is retained. Replicate definitions, error-bar meaning and the statistical basis of its symbols are not specified in the supplied report; no new inferential statistics are claimed here.'),
      ],
    },
    {
      title: 'PDCA1 drives qualitative reporter expression',
      tocTitle: 'PDCA1 reporter',
      body: 'PDCA1 was chosen as the salt-responsive input based on published promoter characterisation [7]. We assembled PDCA1 and EGFP into the pCAMBIA2301 backbone. Colony PCR and sequencing were reported to confirm the reporter construct [1].',
      blocks: [
        construction(5, 6, 7),
        paragraph('Following transformation into *D. salina*, distinct green fluorescence was reported under fluorescence microscopy. This is qualitative evidence that the reporter construct can drive downstream expression in the host. The supplied Results package contains construction figures, but no microscopy panel or quantitative fluorescence dataset.'),
        paragraph('A fluorescence-versus-salinity response curve, with WT background, matched imaging conditions and cell-density normalisation, is still needed to establish the switch’s dynamic range, response time and residual low-salt activity. We therefore do not infer a measured high-salt/low-salt fold change from this report.'),
      ],
    },
    {
      title: 'The complete salt-responsive circuit remains to be tested',
      tocTitle: 'Complete circuit status',
      body: 'The intended circuit couples weak basal toxin expression from Pip–mazF to salt-responsive antitoxin expression from PDCA1–mazE. Under the proposed logic, high salinity permits antitoxin rescue; lower salinity reduces rescue and allows toxin activity. This is the design hypothesis, rather than a demonstrated integrated phenotype.',
      blocks: [
        paragraph('According to the supplied Results report, the PDCA1–mazE antitoxin plasmid is under construction. Co-transformation, dual-positive line characterisation and the complete salt-dependent growth and survival phenotype remain future work [1]. Individual toxin and reporter observations do not establish that the combined circuit works.'),
        { kind: 'table', caption: 'Evidence required for integrated containment', columns: ['Question', 'Current evidence', 'Next measurement'], rows: [
          ['Can MazE rescue the toxin burden?', 'Not demonstrated for the coupled circuit', 'Matched toxin-only and toxin-plus-antitoxin lines at production salinity'],
          ['Does salinity control the coupled phenotype?', 'Reporter expression is qualitative', 'Time-resolved reporter and viability measurements across salt conditions'],
          ['Does low salinity cause irreversible loss of viability?', 'Growth inhibition in toxin-only assays', 'Direct viable-cell measurements and regrowth after recovery'],
          ['Does the circuit remain functional over time?', 'No long-term integrated dataset supplied', 'Serial-propagation and escape-frequency measurements'],
        ] },
        links(['Biosafety design', '/design'], ['Containment model and assumptions', '/safety-and-security']),
      ],
    },
    {
      title: 'Computational results guide the next experiments',
      tocTitle: 'Computational evidence',
      body: 'Our dry-lab analyses connect environmental response, precursor allocation, structural hypotheses and containment scenarios. Each prediction is interpreted within its model assumptions and kept separate from engineered-strain measurements.',
      blocks: [
        heading('Transcript and metabolic-network analyses'),
        paragraph('Reanalysis of public light-response transcript data shows that carotenoid-pathway transcripts do not respond as one coordinated block [3] [4]. LCYB-assigned contigs have different response profiles. Transcript abundance alone does not establish LCYB protein activity or increased β-carotene flux.'),
        paragraph('The metabolic network, based on a published carbon-core reconstruction [5], supports all four product routes under tested constraints. Conditional maximum flux ranks β-ionone above β-citraurin, astaxanthin and crocetin. High-light, low-nitrate scenarios give stronger model support, and sensitivity analysis highlights the β-carotene entry split. These are model-dependent flux potentials, rather than measured titres.'),
        heading('Structural and regulatory models'),
        paragraph('F404Y had a slightly more favourable mean lycopene docking score than WT, but the small difference relative to seed variation does not demonstrate improved binding or catalysis. The CPP2146–DNA model is likewise a structural hypothesis; AlphaFold 3 predicts a complex [6], without demonstrating native promoter recognition. The regulatory model identifies matched transcript, protein and pigment measurements needed for calibration.'),
        heading('Containment scenarios'),
        paragraph('The salt-response model predicts the largest reduction in cell concentration only when an explicit conditional killing term is enabled. In the retained-cell baseline, predicted T90 and T99 are 8.3 h and 13.2 h. These times are simulation outputs, not experimentally measured clearance rates. Delay, mortality assumptions and receiving-water salinity strongly affect the prediction.'),
        links(['Transcriptomics', '/transcriptomics'], ['Metabolic-network analysis', '/metabolomics'], ['Protein screening', '/protein'], ['Regulatory model', '/model'], ['Containment model', '/safety-and-security']),
      ],
    },
    {
      title: 'Analysis and lessons learned',
      body: 'The strongest current conclusions concern individual components: construction of expression modules, changes in carotenoid composition, preliminary product-associated signals and toxin-associated growth inhibition. The complete platform’s productivity and containment performance have not yet been established.',
      blocks: [
        paragraph('Construction difficulties led us to reduce repeated promoter sequences, revise primers and improve plasmid propagation. An inconsistent RT-qPCR result led to renewed RNA extraction and a more cautious interpretation. Unsuccessful TLC detection and diffuse pigment spots prompted changes in analytical strategy. These steps improved what could be measured, while leaving product identity and assay recovery as explicit questions.'),
        paragraph('Several distinctions matter for interpreting the project: a larger β-carotene proportion need not mean a larger absolute pool; a TLC spot need not establish chemical identity; green reporter fluorescence need not establish a quantified salt response; and a flat OD680 curve need not demonstrate death. These limits determine the follow-up measurements rather than being treated as proof of failure or success.'),
        paragraph('Together, the observations support continued development of a modular algal platform. Claims of improved yield, industrial readiness, environmental clearance or a validated suicide switch require evidence beyond the records presented here.'),
      ],
    },
    {
      title: 'Future work',
      body: 'Our next experiments focus on closing the gaps between component-level observations and whole-system performance.',
      items: [
        'Measure absolute β-carotene content and productivity with consistent biomass normalisation, independent CPP2146 lines and appropriate vector controls; test direct promoter interaction separately.',
        'Confirm target-product identity using authentic standards and orthogonal analytical evidence, quantify titres and recovery, and use headspace analysis for volatile β-ionone.',
        'Complete PDCA1–mazE construction, demonstrate antitoxin rescue and measure the coupled circuit under controlled salinity changes using viability and recovery assays alongside OD680.',
        'Report biological and technical replicate definitions, raw measurements, uncertainty and statistical methods, then use matched experimental datasets to calibrate the regulatory and containment models.',
        'Evaluate production burden, genetic stability and escape frequency before assessing scale-up or real-world application.',
      ],
      blocks: [links(['Project goals and intended application', '/project-description'], ['Methods for further characterisation', '/experiments'], ['Hardware design and cultivation context', '/hardware-design'])],
    },
  ],
};
