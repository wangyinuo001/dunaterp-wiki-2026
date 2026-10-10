import type { WikiPage } from '../site-data';
import type { ContentBlock } from './types';

const p = (text: string): ContentBlock => ({ kind: 'paragraph', text });
const table = (caption: string, columns: string[], rows: string[][], collapsed = false): ContentBlock => ({ kind: 'table', caption, columns, rows, collapsed });
const tf2146Architecture: ContentBlock = {
  kind: 'figure',
  src: 'figures/protein/tf2146-domain-architecture.svg',
  alt: 'Sequence-derived architecture of the 457-residue TF2146 candidate, locating both CXC domains, S208, the predicted NLS and predicted disordered regions.',
  caption: 'Figure 6. Sequence-derived TF2146 domain architecture. Residue ranges locate sequence features on the 457-residue candidate; this schematic is not an atomic-resolution structure.',
};

export const tf2146Sections: WikiPage['sections'] = [
  { title: 'TF2146: a DNA-recognition hypothesis', body: '', blocks: [
    p('A second line of work examined whether TF2146 could recognize candidate sequences in the pDCA1 DNA element, and whether changing those sequences might disrupt the interaction. TF2146 is our shorthand for the 457-residue candidate Gene.80461::F01_cb4882_c5/f1p0/2146.'),
    tf2146Architecture,
    { kind: 'figure', src: 'figures/dry-lab/tf2146-structure.svg', alt: 'Predicted AlphaFold 3 C-alpha trace of TF2146 residues 32–158, with CXC1 and CXC2 highlighted.', caption: 'Figure 7. Residues 32–158 of chain A from the project AlphaFold 3 protein–DNA complex, shown without DNA. CXC1 (32–72) and CXC2 (117–158) are highlighted; flanking regions are omitted for clarity. This is a model-derived structural hypothesis, not an experimentally determined structure.' },
    { kind: 'figure', src: 'figures/dry-lab/protein-dna-docking.png', alt: 'Predicted TF2146 protein and DNA complex used to inspect a candidate recognition interface.', caption: 'Figure 8. TF2146 structure hypothesis shown with the modeled DNA duplex. This is a computational complex used to inspect candidate contacts, not an experimentally determined structure or a binding measurement.' },
    p('The candidate is 457 aa (48.03 kDa; predicted pI 8.60; GRAVY −0.345). The reported comparison to a 550-aa reference gave 55.8% global identity, 85.0% identity across non-gap positions and 96.0% identity across residues 1–176. These sequence metrics support candidate prioritisation, not functional orthology by themselves.'),
    p('Sequence and structural analysis identified two CXC regions, at residues 32–72 and 117–158, consistent with a CPP/CRC-like DNA-binding hypothesis. In the annotated pDCA1 sequence, we found three regions labelled as CPP-family recognition motif-like sites. Together, these observations gave us a reason to test possible recognition; they did not establish a target sequence or a regulatory effect.'),
    table('Sequence-derived features used in construct design', ['Feature', 'Candidate coordinates', 'Evidence and design implication'], [
      ['CXC1', '32–72', 'Nine conserved cysteines; retain the complete region when testing the first CXC domain.'],
      ['CXC2', '117–158', 'Second CXC region with nine conserved cysteines; test separately from CXC1.'],
      ['S208', '208', 'Highest-priority predicted phosphosite, immediately before the NLS and in a predicted flexible region.'],
      ['Predicted NLS', '209–217 · PPHKRARTA', 'cNLS Mapper and LOCALIZER predictions agree; score 13. This predicts localisation, not direct DNA recognition.'],
      ['S21 and S108', '21; 108', 'Lower-priority phosphosite candidates; S21 is near predicted N-terminal processing and S108 precedes CXC2.'],
      ['Predicted signal peptide', 'N-terminal; cleavage near 19–20', 'SignalP predicts a cleavable signal; compare mature-protein constructs and verify localisation experimentally.'],
      ['Predicted disorder', '129 aa total · 28.2%', 'Flexible regions flank structured features; truncation effects require folding and expression controls.'],
    ]),
    table('Three candidate sequence regions', ['Candidate', 'Annotated coordinates · 1-based', 'Sequence · 5′→3′'], [
      ['Site 1', '57–64', 'CTTGTAAA'],
      ['Site 2', '1160–1167', 'TTTGCAAA'],
      ['Site 3', '1170–1177', 'CTTCAAAT'],
    ]),
    p('Coordinates refer to the annotated DNA record, not distance from a measured transcription start site. Site 1 was modeled in a 32 bp window (45–76); adjacent sites 2 and 3 were modeled together in a 40 bp window (1151–1190). These are three candidate regions, not three experimentally established binding interfaces.'),
    p('The construct plan uses the complete CXC regions rather than narrower conserved cores. Its lead truncation spans residues 21–230, retaining both annotated CXC regions, S208 and the complete NLS while starting after the predicted signal-peptide cleavage region. One slide labels this construct “CXC1-NLS-trunc”, but the stated coordinates also include CXC2; we therefore identify it by its coordinates rather than calling it CXC1-only. Full-length WT (1–457), CXC1-only, CXC2-only and domain-deletion constructs provide distinct controls.'),
    table('Planned TF2146 construct and mutation panel', ['Design group', 'Variants in the project plan', 'Question'], [
      ['Core protein controls', 'Full-length WT; ΔSP / residues 21–230 dual-CXC/NLS region; CXC1-only; CXC2-only', 'Separate full-length context, proposed minimal unit and individual-domain contributions.'],
      ['CXC structural integrity', 'ΔCXC1, ΔCXC2, ΔCXC1+2; nine conserved Cys→Ala substitutions in each CXC region', 'Test whether the zinc-coordinating architecture is required, with folding and expression controls.'],
      ['Phosphosite controls', 'S208A/D; S21A/D; S108A/D', 'Compare non-phosphorylatable and phosphomimetic hypotheses; substitutions do not reproduce phosphorylation.'],
      ['NLS perturbations', 'ΔNLS (209–217); H211A, K212A, R213A, R215A; KRAR→AAAA', 'Separate NLS integrity, basic side-chain contributions and localisation from interface effects.'],
      ['Follow-up point mutants', 'Y48F, Y133F, K212Q; then K212Q/R213Q and T198–S201→A', 'Prioritise aromatic recognition and graded NLS-charge tests before expanding the phosphosite series.'],
    ]),
    p('The presentation labels a 15-construct experimental panel while also listing broader Cys-to-Ala and phosphosite series. We retain 15 as the stated panel total rather than summing every proposed series. The recommended first batch is Y48F, Y133F and K212Q; K212Q/R213Q and the T198–S201 alanine segment are follow-up designs. The full T198–S201 glutamate block was not recommended as a first-pass phosphomimetic.'),
  ] },
  { title: 'Testing the candidate DNA sequences', body: '', blocks: [
    p('We prepared eight AlphaFold 3 comparisons, each containing TF2146 and two complementary DNA strands. For site 1, we compared the original sequence, a core-motif mutant and a dinucleotide-shuffled control. For the adjacent pair, we compared the original sequence, each single-site mutant, the double mutant and a shuffled control.'),
    p('Core mutations preserved the base composition of the eight-base motif. Shuffled controls preserved window length, GC fraction, dinucleotide counts and strand endpoints while excluding the original candidate motifs and their reverse complements. The question was whether changing the candidate sequence consistently weakened the predicted protein–DNA interface.'),
    table('DNA-sequence comparison · best reported protein–DNA chain-pair ipTM', ['DNA window', 'Sequence condition', 'ipTM'], [
      ['Site 1', 'Original', '0.54'], ['Site 1', 'Core mutant', '0.50'], ['Site 1', 'Dinucleotide shuffle', '0.44'],
      ['Sites 2 + 3', 'Original', '0.29'], ['Sites 2 + 3', 'Site 2 mutant', '0.44'], ['Sites 2 + 3', 'Site 3 mutant', '0.41'], ['Sites 2 + 3', 'Double mutant', '0.42'], ['Sites 2 + 3', 'Dinucleotide shuffle', '0.17'],
    ]),
    p('These are the best interface-confidence values reported for each task, not binding measurements or independent replicate means. The tasks used different random seeds, so sequence changes and sampling differences are confounded. ipTM expresses confidence in modeled chain arrangements; it is not an affinity score.'),
    p('For site 1, the original-sequence models placed the CXC regions near the candidate motif. After core mutation, predicted contacts shifted toward flanking DNA rather than disappearing. The shuffled control had lower confidence, but this comparison was insufficient to establish sequence-specific recognition or successful disruption.'),
    p('For sites 2 and 3, the original sequence had lower interface confidence than the single and double mutants. Models could instead contact a remaining motif or an alternative region. The pattern did not support the expectation that intact motifs would give a consistently stronger interface, or that changing them would reliably remove it.'),
  ] },
  { title: 'What the protein-variant screen adds', body: '', blocks: [
    p('A separate screen varied the protein rather than the DNA motifs. Its saved analysis covered 27 completed tasks, with five models per task, including protein-only baselines and complexes with the two original DNA windows. This addressed whether the CXC regions or nearby residues might contribute to the predicted interface.'),
    table('Selected protein-screen observations', ['Comparison', 'Saved result', 'Interpretation'], [
      ['WT with site 1', 'Interface ipTM 0.52; 28 stable contact residues', 'Exploratory interface baseline'],
      ['ΔCXC2 with site 1', 'Interface ipTM 0.37; 14 stable contact residues', 'Reduced modeled interface; a domain-dependence hypothesis'],
      ['Double CXC deletion, either window', 'Interface ipTM 0.05; no stable contact residues', 'Loss of modeled contacts; folding effects remain a possible confounder'],
      ['S208D with site 1', 'Interface ipTM 0.26', 'A candidate structural effect; not evidence of actual phosphorylation or regulation'],
    ], true),
    p('These interface ipTM values are medians across five models in a separate screen; stable contact residues recur in at least three models. They should not be pooled with the best-model values above. CXC deletion gave a computational signal worth retaining, but this screen lacked shuffled-DNA controls and explicit Zn. A changed fold or nonspecific DNA contact can affect the result. It therefore does not validate the proposed motif edits as a way to disrupt recognition.'),
  ] },
  { title: 'Structure-guided docking across TF2146 constructs', body: '', blocks: [
    p('A separate HDOCK 2.4.1 analysis compared four AlphaFold 3-derived protein architectures against a GC-rich, promoter-related B-form DNA substrate. This is distinct from the eight AlphaFold 3 sequence-comparison tasks and the 27-task protein-variant screen above. HDOCK scores are raw model-ranking outputs, not measured binding energies or affinities; scores from different protein architectures are especially difficult to compare directly.'),
    table('Four protein architectures in the docking comparison', ['Model', 'Protein input', 'Reported HDOCK score', 'Reading'], [
      ['M1', 'CXC1 region', '−302.55', 'Strong modeled interface; reported as 96.6% of the full-length score.'],
      ['M2', 'CXC2 region', '−167.22', 'Weaker modeled interface; reported as 53.4% of the full-length score.'],
      ['M3', 'CXC1–NLS truncation', 'approximately −290', 'Intermediate-to-strong truncated construct; compare with matched construct controls.'],
      ['M4', 'Full-length protein, residues 1–457', '−313.20', 'Most favorable reported score in this model set; may combine CXC1-led binding with auxiliary contributions.'],
    ]),
    p('The model-level ranking is consistent with CXC1 as the primary modeled DNA-contact architecture, CXC2 as a weaker potential auxiliary domain, and the full-length protein as the strongest-scoring model. Because the inputs differ in length and domain composition, this is a hypothesis for experimental prioritisation, not a quantitative measure of domain synergy. The approximately −290 M3 architecture score and the −190/−181 Zn-containing isolated-CXC scores below are separate model conditions in the presentation, not a directly comparable repeat.'),
    table('Reported 15-entry HDOCK construct screen', ['Construct or model', 'Score', 'Deck comparison / interpretation'], [
      ['M4 full length', '−313.20', 'Full-length reference model.'],
      ['S208A', '−313.21', 'Δ score −0.01 vs M4; unchanged at the reported precision.'],
      ['S208D', '−313.21', 'Δ score −0.01 vs M4; docking does not distinguish this from S208A.'],
      ['H211A', '−313.21', 'Near-identical to M4.'],
      ['K212A', '−313.22', 'Near-identical to M4.'],
      ['R213A', '−313.21', 'Near-identical to M4.'],
      ['R215A', '−312.11', 'Slightly less favorable; −9.56 relative to truncated WT in the distribution slide.'],
      ['WT CXC1–NLS truncation', '−302.55', 'Reference for the truncated-model comparisons.'],
      ['K212A/R213A/R215A', '−302.92', 'Only −0.37 vs truncated WT; predicted interface shifts from a CXC1-like to CXC2-like mode.'],
      ['CXC1 Cys-less', '−299.84', '+2.71 vs truncated WT; +13.36 vs full-length M4 in the separate summary.'],
      ['CXC2 Cys→Ala series', '−272.82', '+29.73 vs truncated WT; weaker modeled interface after this CXC2-series perturbation.'],
      ['ΔNLS (209–217)', '−256.23', '+46.32 vs truncated WT; the separate full-length comparison reports +56.97 vs M4.'],
      ['M3 CXC1 + Zn', '−190.03', '+112.5 vs truncated WT; separate domain-level docking condition.'],
      ['M3 CXC2 + Zn', '−181.15', '+121.4 vs truncated WT; separate domain-level docking condition.'],
      ['M2 CXC2 truncation', '−167.22', '+135.33 vs truncated WT; weakest score in the reported set.'],
    ]),
    table('Separate six-variant HDOCK Top-1 screen', ['Variant', 'Top-1 score', 'Confidence', 'Ligand RMSD (Å)', 'Reported reading'], [
      ['Y48F', '−190.21', '0.6909', '112.89', 'Weakest score and largest pose displacement in this set.'],
      ['Y133F', '−219.56', '0.8008', '76.34', 'More favorable score than Y48F, but the pose remains highly displaced.'],
      ['K212Q', '−220.60', '0.8041', '60.76', 'Most favorable reported group; still a prediction, not a binding measurement.'],
      ['K212Q/R213Q', '−220.60', '0.8041', '60.76', 'All three reported fields exactly match K212Q.'],
      ['T198–S201→A (4A)', '−220.60', '0.8041', '60.76', 'All three reported fields exactly match K212Q.'],
      ['T198–S201→E (4E)', '−220.60', '0.8041', '60.76', 'All three reported fields exactly match K212Q.'],
    ]),
    p('The strongest signal in this screen is the large score shift associated with removing the NLS or perturbing CXC cysteines, while S208A/D barely changes the reported full-length score. This suggests that the NLS region and intact CXC architecture may contribute to the modeled interface; it does not show that S208 phosphorylation changes DNA binding. Several point-mutant rows have identical or nearly identical scores, confidence and RMSD in the presentation, potentially reflecting reused coordinates or insufficiently distinct models. Those entries need input and pose auditing before mechanistic interpretation.'),
    p('The slides describe the DNA input inconsistently: the overview says 20 bp, while the detailed design slide gives a 25-bp CPP/TSO1-derived duplex and a 24-bp promoter-region control. The 25-bp design is documented separately in the TSO1-derived DNA section below. Until the HDOCK input files resolve this discrepancy, these lengths should not be presented as one confirmed substrate setup.'),
    p('The most informative follow-up is a matched binding assay across full-length WT, CXC1–NLS truncation, ΔNLS, CXC1 Cys-less, S208A/D and a sequence-matched DNA control. Verify protein expression/folding and localisation, include zinc-aware conditions for CXC constructs, and repeat docking from independently generated structures before treating the score ranking as a mechanistic result.'),
  ] },
  { title: 'TF2146: what we can conclude', body: '', blocks: [
    p('The analysis narrowed the problem from three motif-like regions to a testable site 1 hypothesis. We examined sequence controls and protein variants, and found that plausible-looking contacts alone were insufficient: motif mutation could relocate the predicted interface, and the adjacent-site comparisons did not follow the expected pattern.'),
    p('Across sequence-focused AlphaFold 3 comparisons, the protein-variant screen and the separate HDOCK construct ranking, the evidence supports testable hypotheses about CXC1, the NLS and candidate DNA regions, but does not establish sequence-specific binding or prove that the proposed motif edits disrupt recognition. The computational workflows use different inputs and scores and should not be pooled. Any effect on pDCA1 activity remains unverified.'),
    p('The next useful comparison is a direct binding assay with the original, core-mutant and shuffled site 1 sequences, followed by a reporter comparison to test regulatory output. Protein expression and folding controls would be needed when interpreting CXC deletion variants. Binding and regulation are distinct outcomes, and each needs its own evidence.'),
  ], note: 'Current conclusion: the computational evidence does not support effective disruption of TF2146–DNA binding by the proposed motif changes.' },
];
