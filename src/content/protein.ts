import { syntheticDnaSections } from './synthetic-dna';
import { tf2146Sections } from './tf2146';
import type { WikiPage } from '../site-data';
import type { ContentBlock } from './types';
import { refs } from './references';

const p = (text: string): ContentBlock => ({ kind: 'paragraph', text });
const table = (caption: string, columns: string[], rows: string[][], collapsed = false): ContentBlock => ({ kind: 'table', caption, columns, rows, collapsed });
const figures: Record<string, string> = { 'docking-seeds': 'figures/protein/docking-seeds.png', 'md-rmsd': 'figures/protein/md-rmsd.png', 'lcyb-lycopene': 'figures/protein/lcyb-lycopene.png', 'lcyb-lycopene_detail': 'figures/protein/lcyb-lycopene_detail.png', 'lcyb-lycopene-detail-alt': 'figures/protein/lcyb-lycopene-detail-alt.png' };
const fig = (name: string, alt: string, caption: string): ContentBlock => ({ kind: 'figure', src: figures[name], alt, caption });

export const protein: WikiPage = {
  title: 'Protein design and DNA recognition',
  eyebrow: 'Dry Lab / Protein',
  status: 'team-draft',
  intro: 'Transcriptomics identifies LCYB as the shared control point in the light response. This page examines two molecular levers on that same node: enzyme-side LCYB substitutions that may change lycopene conversion, and regulator-side CPP2146–DNA recognition that may change LCYB expression. The selected structural parameters and testable sites are then passed to the regulatory model.',
  references: [refs.pubchemLycopene, refs.alphafold3, refs.foldx, refs.vina, refs.gromacs, refs.gaff],
  sections: [
    { title: 'LCYB: the design question', body: '', blocks: [
      p('LCYB controls lycopene cyclisation, an important step in our carotenoid platform. We asked whether changes to side-chain polarity or size could improve substrate accommodation while preserving the protein fold. Each substitution was treated as a hypothesis with a possible cost: a change that improves one local interaction may disrupt another or reduce catalytic activity.'),
      p('Our assessment progressed from candidate design to structural screening, followed by a focused comparison of WT and F404Y with all-trans lycopene. Each tool addressed a different question. We used the combined evidence to decide whether a candidate was ready to be described as an improvement.'),
      table('What each stage contributes', ['Stage', 'Question', 'Scope completed'], [
        ['Design', 'What does the side-chain substitution change?', 'Ten single-site candidates'],
        ['FoldX / AlphaFold 3', 'Is there a predicted folding or structural penalty?', 'Stability screen and selected mutant structures'],
        ['AutoDock Vina', 'Does the docking score consistently favor the candidate?', 'WT and F404Y; three seeds each'],
        ['GROMACS', 'How do the docked complexes behave over a short trajectory?', 'WT and F404Y; one 5 ns trajectory each'],
      ]),
    ] },
    { title: 'Choosing the substitutions', body: '', blocks: [
      p('We considered conservative substitutions alongside larger perturbations. This lets us compare a modest chemical change with the risk of altering local packing. Residue names follow the project’s LCYB numbering; the dynamics construct retains residues 71–555.'),
      table('Candidate design rationale', ['Substitutions', 'Chemical change', 'Question and trade-off'], [
        ['Y159F, Y200F, Y322F', 'Remove a hydroxyl group while retaining an aromatic ring', 'Could reduced polarity be tolerated? Loss of a useful polar interaction could reduce function.'],
        ['F404Y / F404A', 'Add a hydroxyl group / remove most of the aromatic side chain', 'Compare a conservative polarity change with a larger packing perturbation.'],
        ['H259Q / H259N', 'Replace an imidazole with an amide', 'Probe local polarity while accepting the risk of losing histidine-dependent chemistry.'],
        ['M405L / M405W / M406A', 'Adjust hydrophobic side-chain size and shape', 'Explore packing changes; a larger side chain may obstruct space and a smaller one may leave a cavity.'],
      ]),
      p('These are chemical design hypotheses. The substitutions alone do not establish that the residues control substrate entry, catalysis or product release.'),
    ] },
    { title: 'Screening structural risk', body: '', blocks: [
      p('The FoldX screen [3] placed Y159F, M405L and F404Y among the lower-risk candidates, with reported mean ΔΔG values of −0.664, −0.327 and −0.155 kcal/mol. H259Q and Y200F were also retained for follow-up. In contrast, the larger positive estimates for F404A and M406A suggested a greater folding penalty.'),
      p('Here ΔΔG is the calculated mutant folding energy minus the WT value. A negative estimate favors stability within the FoldX model; it does not predict enzyme activity. The table records the available screening summary. The numerical result for Y322F is omitted pending verification of its underlying calculation package.'),
      table('FoldX screening summary · kcal/mol', ['Variant', 'Mean ΔΔG', 'Calculation SD', 'Screening interpretation'], [
        ['Y159F','−0.664','0.029','Retained'], ['M405L','−0.327','0.094','Retained'], ['F404Y','−0.155','0.060','Retained'],
        ['H259Q','0.007','0.022','Retained'], ['H259N','0.268','0.016','Secondary candidate'], ['Y200F','0.399','0.012','Retained'],
        ['M405W','1.362','0.174','Higher structural risk'], ['F404A','2.007','0.036','Deferred'], ['M406A','4.277','0.029','Deferred'], ['Y322F','Not reported','—','Source verification pending'],
      ], true),
      p('Selected AlphaFold 3 models [2] for WT, Y159F, Y200F, H259Q, F404Y and M405L had pTM values of 0.79–0.80 and no reported clash flag. This supported continuing the computational comparison. It did not establish improved folding stability or catalytic performance.'),
      p('F404Y offered a conservative aromatic substitution with an added hydroxyl group and a small FoldX penalty estimate in the favorable direction. We used it for a focused WT comparison to examine whether that design idea would receive further support.'),
    ] },
    { title: 'Docking with lycopene', body: '', blocks: [
      p('The ligand was all-trans lycopene, PubChem CID 446925 [1]. Its identity checks confirmed C40H56, 40 heavy atoms, 39 heavy-atom bonds, no rings and E geometry at all 11 stereochemically definable double bonds. WT and F404Y were docked with AutoDock Vina [4] using the same search settings and three shared random seeds.'),
      fig('docking-seeds', 'Three lycopene docking scores for WT and F404Y, with their means and seed-to-seed standard deviations.', 'Fig. 1 Lycopene docking scores for WT and F404Y LCYB'),
      { kind: 'docking-viewer' },
      fig('lcyb-lycopene', 'Coordinate-based overview of the WT LCYB C-alpha trace and selected lycopene docking pose.', 'Fig. 2 WT LCYB with the selected lycopene docking pose'),
      { kind: 'figure-grid', figures: [
        { src: figures['lcyb-lycopene_detail'], alt: 'Close-up of the corrected all-trans lycopene docking pose in WT LCYB.', caption: 'Fig. 3 Close-up of the selected WT docking pose' },
        { src: figures['lcyb-lycopene-detail-alt'], alt: 'Alternate orientation of the same WT lycopene docking pose.', caption: 'Fig. 4 Alternate view of the selected WT docking pose' },
      ] },
      table('Lycopene docking results', ['System', 'Mean ± seed SD (kcal/mol)', 'Seeds'], [
        ['WT','−9.434 ± 0.213','3'], ['F404Y','−9.701 ± 0.477','3'],
      ]),
      p('F404Y’s mean score was 0.267 kcal/mol more favorable, but its seed-to-seed variation was larger. This modest difference did not establish a clear docking advantage. The best-scoring pose for each system was checked for stereochemistry and used to start the dynamics comparison.'),
    ] },
    { title: 'A short dynamics comparison', body: '', blocks: [
      p('Each complex was simulated with GROMACS [5] for 5 ns in water, with 501 saved frames at 10 ps intervals. The trajectories completed without a LINCS warning or fatal error in the MD logs. The plots show the entire trajectory; the summary values use 1–5 ns. Excluding the first nanosecond from the average does not by itself demonstrate equilibration.'),
      fig('md-rmsd', 'WT and F404Y protein-backbone and protein-fitted lycopene RMSD time series from 0 to 5 ns.', 'Fig. 5 RMSD time series for WT and F404Y systems'),
      table('Trajectory means over 1–5 ns', ['Metric', 'WT', 'F404Y'], [
        ['Protein backbone RMSD (nm)','0.156','0.188'],
        ['Protein-fitted ligand RMSD (nm; includes H)','0.208','0.236'],
        ['Minimum protein–ligand distance (nm; includes H)','0.192','0.207'],
        ['Protein radius of gyration (nm)','2.358','2.356'],
        ['Temperature (K)','300.031','300.016'],
      ]),
      p('Both complexes maintained close contact during the short simulation. F404Y showed somewhat higher protein and ligand RMSD, while the protein radii of gyration were similar. These observations did not provide additional evidence that F404Y was superior. RMSD measures structural displacement; it is not a binding affinity or catalytic rate.'),
      p('We also examined the ligand geometry in every saved frame. All 11 checked double bonds remained on the trans side of the dihedral criterion, and no periodic-boundary fragmentation was observed. This supports displaying and inspecting these trajectories, while leaving the accuracy of the ligand force field as a separate question.'),
    ] },
    { title: 'LCYB: what we learned', body: '', blocks: [
      p('The screen helped us distinguish plausible substitutions from candidates with a larger predicted folding cost. It also showed why a favorable result from one tool should not decide the outcome: F404Y’s small docking-score improvement was not accompanied by evidence of better performance in the short dynamics comparison.'),
      p('We have therefore not selected a variant as a demonstrated improvement over WT. The available calculations support a shortlist for further evaluation, but they do not show that the mutations improve catalysis—or that every candidate lacks potential.'),
      p('The next decisions depend on ligand-parameter review and independent simulation repeats, together with functional measurements that compare expression, substrate conversion and product distribution against WT. Those measurements would determine whether a computationally tolerable substitution is useful to the project.'),
    ], note: 'Current conclusion: no clear, consistently supported advantage over WT has been established. The focused lycopene dynamics comparison covers F404Y only.' },
    { title: 'LCYB: methods and scope', body: '', blocks: [
      table('Docking and dynamics setup', ['Item', 'Setting'], [
        ['Docking engine','AutoDock Vina 1.2.7; exhaustiveness 32; nine modes'],
        ['Search box','Center (−0.040, 1.264, −4.120) Å; 46 × 46 × 46 Å'],
        ['Shared docking seeds','26092601, 26092602, 26092603'],
        ['MD system','Residues 71–555 in water; charged native termini; no ACE/NME caps'],
        ['Sampling','One 5 ns trajectory per system; saved every 10 ps'],
        ['Comparison window','1–5 ns for the reported means'],
      ], true),
      p('The short, single-trajectory comparison does not establish convergence or reproducibility across independent MD runs. It represents a water-phase construct and does not include a membrane environment.'),
      p('GAFF2 assignment [6] required attention to ce/cf atom types, high-penalty analogue dihedrals and default improper terms. The flagged high-penalty terms were traced to methyl-branch single bonds rather than C=C rotation axes. That finding clarifies the warning, but does not validate the torsional energy surface. Parameter review remains necessary before stronger energetic conclusions.'),
      { kind: 'links', links: [
        { label: 'Lycopene · PubChem CID 446925', href: 'https://pubchem.ncbi.nlm.nih.gov/compound/446925' },
        { label: 'AlphaFold 3 · Abramson et al. (2024)', href: 'https://doi.org/10.1038/s41586-024-07487-w' },
        { label: 'FoldX · Schymkowitz et al. (2005)', href: 'https://doi.org/10.1093/nar/gki387' },
        { label: 'AutoDock Vina · Eberhardt et al. (2021)', href: 'https://doi.org/10.1021/acs.jcim.1c00203' },
        { label: 'GROMACS · Abraham et al. (2015)', href: 'https://doi.org/10.1016/j.softx.2015.06.001' },
        { label: 'General AMBER force field · Wang et al. (2004)', href: 'https://doi.org/10.1002/jcc.20035' },
      ] },
    ] },
    ...tf2146Sections,
    ...syntheticDnaSections,
    { title: 'Two molecular levers, one LCYB control point', body: '', blocks: [
      p('The LCYB and CPP2146 analyses describe two parts of one control system. LCYB variants act at the catalytic layer by changing the enzyme that converts lycopene toward β-carotene. CPP2146 and its candidate DNA motif act at the regulatory layer by changing the promoter input that determines how much LCYB transcript and active enzyme can accumulate.'),
      p('These outputs enter the mathematical model through different parameters but converge on the same LCYB node. Promoter affinity and regulatory input shape occupancy and transcription, while LCYB abundance and catalytic capacity shape lycopene conversion. Modeling them together shows whether a proposed molecular change survives the complete path from DNA recognition to β-carotene supply.'),
      { kind: 'links', links: [{ label: 'Continue to Mathematical Modeling', href: '/model' }] },
    ] },
  ],
};
