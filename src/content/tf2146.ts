import type { WikiPage } from '../site-data';
import type { ContentBlock } from './types';

const p = (text: string): ContentBlock => ({ kind: 'paragraph', text });
const table = (caption: string, columns: string[], rows: string[][], collapsed = false): ContentBlock => ({ kind: 'table', caption, columns, rows, collapsed });

export const tf2146Sections: WikiPage['sections'] = [
  { title: 'CPP2146: a DNA-recognition hypothesis', body: '', blocks: [
    p('A second line of work examined whether CPP2146 could recognize candidate sequences in the pDCA1 DNA element, and whether changing those sequences might disrupt the interaction. CPP2146 is our shorthand for the 457-residue candidate Gene.80461::F01_cb4882_c5/f1p0/2146.'),
    p('Sequence and structural analysis identified two CXC regions, at residues 32–72 and 117–158, consistent with a CPP/CRC-like DNA-binding hypothesis. In the annotated pDCA1 sequence, we found three regions labelled as CPP-family recognition motif-like sites. Together, these observations gave us a reason to test possible recognition; they did not establish a target sequence or a regulatory effect.'),
    { kind: 'figure', src: '/figures/dry-lab/cpp2146-structure.svg', alt: 'Predicted AlphaFold 3 C-alpha trace of CPP2146 residues 32–158, with CXC1 and CXC2 highlighted.', caption: 'Fig. 6 Predicted CPP2146 structure with CXC domains' },
    { kind: 'figure', src: '/figures/dry-lab/protein-dna-docking.png', alt: 'Predicted CPP2146 protein and DNA complex used to inspect a candidate recognition interface.', caption: 'Fig. 7 Predicted CPP2146–DNA complex' },
    table('Three candidate sequence regions', ['Candidate', 'Annotated coordinates · 1-based', 'Sequence · 5′→3′'], [
      ['Site 1', '57–64', 'CTTGTAAA'],
      ['Site 2', '1160–1167', 'TTTGCAAA'],
      ['Site 3', '1170–1177', 'CTTCAAAT'],
    ]),
    p('Coordinates refer to the annotated DNA record, not distance from a measured transcription start site. Site 1 was modeled in a 32 bp window (45–76); adjacent sites 2 and 3 were modeled together in a 40 bp window (1151–1190). These are three candidate regions, not three experimentally established binding interfaces.'),
  ] },
  { title: 'Testing the candidate DNA sequences', body: '', blocks: [
    p('We prepared eight AlphaFold 3 comparisons, each containing CPP2146 and two complementary DNA strands. For site 1, we compared the original sequence, a core-motif mutant and a dinucleotide-shuffled control. For the adjacent pair, we compared the original sequence, each single-site mutant, the double mutant and a shuffled control.'),
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
  { title: 'CPP2146: what we can conclude', body: '', blocks: [
    p('The analysis narrowed the problem from three motif-like regions to a testable site 1 hypothesis. We examined sequence controls and protein variants, and found that plausible-looking contacts alone were insufficient: motif mutation could relocate the predicted interface, and the adjacent-site comparisons did not follow the expected pattern.'),
    p('The current computational evidence does not support effective disruption of CPP2146–DNA binding by the proposed DNA motif changes. Sequence-specific binding and any effect on pDCA1 activity remain unverified.'),
    p('The next useful comparison is a direct binding assay with the original, core-mutant and shuffled site 1 sequences, followed by a reporter comparison to test regulatory output. Protein expression and folding controls would be needed when interpreting CXC deletion variants. Binding and regulation are distinct outcomes, and each needs its own evidence.'),
  ], note: 'Current conclusion: the computational evidence does not support effective disruption of CPP2146–DNA binding by the proposed motif changes.' },
];
