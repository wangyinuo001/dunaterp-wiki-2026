import type { WikiPage, WikiSection } from '../site-data';
import type { ContentBlock } from './types';
import { refs } from './references';

const p = (text: string): ContentBlock => ({ kind: 'paragraph', text });
const eq = (label: string, text: string): ContentBlock => ({ kind: 'equation', label, text });
const fig = (name: string, alt: string, caption: string): ContentBlock => ({ kind: 'figure', src: `/figures/dry-lab/${name}.png`, alt, caption });
const customTable = (caption: string, columns: string[], rows: string[][]): ContentBlock => ({ kind: 'table', caption, columns, rows });
const math = String.raw;
const links = (...entries: [string, string][]): ContentBlock => ({ kind: 'links', links: entries.map(([label, href]) => ({ label, href })) });
const section = (title: string, ...blocks: ContentBlock[]): WikiSection => ({ title, body: '', blocks });

export const dryLabNavigation = [
  ['Overview', '/dry-lab'],
  ['Transcriptomics', '/transcriptomics'],
  ['Mathematical Modeling', '/model'],
  ['Metabolomics', '/metabolomics'],
  ['Protein', '/protein'],
  ['Safety', '/safety-and-security'],
  ['Hardware Modeling', '/hardware'],
  ['Hardware Design', '/hardware-design'],
] as const;

export const dryLabMenuGroups = [
  { label: 'Modeling', items: [dryLabNavigation[1], dryLabNavigation[2], dryLabNavigation[3], dryLabNavigation[4], dryLabNavigation[5]] },
  { label: 'Hardware', items: [dryLabNavigation[6], dryLabNavigation[7]] },
] as const;

export const transcriptomics: WikiPage = {
  title: 'Transcriptomics', eyebrow: 'Dry Lab / Transcriptomics', status: 'team-draft',
  intro: 'The multiscale chain begins with its environmental input: light. We matched public Dunaliella salina transcripts to carotenoid-enzyme sequences and compared nine light-acclimation samples with a replicate-aware count model. This first layer identifies LCYB as the shared control point that the molecular and dynamic models examine next.',
  references: [refs.transcriptomeDataset, refs.li2019, refs.grabherr2011, refs.diamond2015, refs.deseq2010],
  sections: [
    section('THE REACTIONS',
      p('The route gives the analysis its order. PSY commits geranylgeranyl diphosphate to phytoene; PDS, Z-ISO, ZDS and CRTISO convert phytoene toward lycopene. At lycopene, LCYB feeds the β-carotene branch and LCYE feeds the competing α-carotene branch. We therefore annotate transcripts by enzyme first, then read the expression changes at their position in this route.'),
      { kind: 'figure', src: '/figures/dry-lab/carotenoid-route.svg', alt: 'Carotenoid pathway from MEP-derived precursors through phytoene and lycopene, branching at LCYB to beta-carotene and at LCYE to alpha-carotene.', caption: 'Fig. 1 Carotenoid pathway and the LCYB branch' },
      p('The question is not whether one statistical cluster can represent the pathway. It is which sequence-supported enzyme transcripts change between the measured light conditions, and whether different copies assigned to the same enzyme show the same response.'),
    ),
    section('THE DATASET',
      p('GSE120965 contains nine cultures: three biological replicates each at 150, 600 and 1500 µmol photons m⁻² s⁻¹, sampled after 168 h of light acclimation [1] [2]. In the published upstream pipeline, adapters, poly-N reads and low-quality reads were removed; Trinity assembled the clean reads, and the longest transcript in each Trinity subcomponent was retained as a unigene [3]. We use that deposited unigene FASTA and GEO Readcount matrix. Their transcript identifiers match across all 76,875 rows, so the analysis below starts from the public processed files rather than claiming to reassemble the reads.'),
      customTable('Light-acclimation design', ['Condition', 'GEO sample IDs', 'Independent cultures'], [
        ['150 · low (LL)','LL1, LL2, LL3','3'], ['600 · medium (ML)','ML1, ML2, ML3','3'], ['1500 · high (HL)','HL1, HL2, HL3','3'],
      ]),
      { kind: 'figure', src: '/figures/dry-lab/transcriptomics-workflow.svg', alt: 'Analysis workflow: public sample design branches into sequence annotation and count-based differential expression, then transcript identifiers are joined for pathway interpretation.', caption: 'Fig. 2 Transcriptomics analysis workflow' },
    ),
    section('SEQUENCE ANNOTATION',
      p('The FASTA contains nucleotide contigs, not named genes. We translate each contig in all six reading frames with DIAMOND blastx [4] and search two protein references: archived Swiss-Prot and the recoverable 2018 Dunaliella protein set. A hit enters the primary-annotation pass at E ≤ 10⁻⁵, ≥20% identity and ≥15% subject-protein coverage. We rank qualifying hits by bit score, then use E-value and subject ID as stable tie-breaks; only after choosing the top hit do we classify its protein name as an enzyme family. This keeps a weaker pathway hit from displacing a stronger non-pathway match just because we hoped to see that enzyme.'),
      { kind: 'code', label: 'Primary sequence-annotation rule · pseudocode', text: String.raw`for each Trinity transcript:
    hits = DIAMOND blastx(transcript, archived protein references, E <= 1e-5)
    hits = keep hits with identity >= 20% and subject coverage >= 15%
    primary = sort hits by bitscore descending, E-value ascending, subject ID
    annotation = classify protein name(primary) as enzyme family, or unresolved
    save (Trinity ID, annotation, reference hit, scores)

independently:
    forward = DIAMOND blastx(transcriptome, curated pathway proteins)
    reverse = TBLASTN(curated pathway proteins, transcriptome)
    retain a curated match only when both searches select the same pair,
    E < 1e-5, identity >= 30%, and reverse-search protein coverage >= 30%` },
      p('The second, reciprocal-best-hit pass is an independent check against curated pathway proteins: the transcript must select a protein in the forward search, and that same protein must select the transcript in the reverse search. The reverse TBLASTN alignment must cover at least 30% of the reference protein. We merge agreeing enzyme-family labels but keep the original Trinity ID and annotation source. Differential-expression values do not decide which transcript gets an enzyme name.'),
      p('This sequence-first union yields 20 transcript features assigned to nine enzyme families in the carotenoid route. Several families have multiple contigs. We keep those copies separate because they may represent paralogs, isoforms or fragmented de novo assemblies; they are not averaged into one “gene” measurement.'),
    ),
    section('DIFFERENTIAL EXPRESSION',
      p('We test the GEO Readcount matrix rather than FPKM: a count model needs the replicate-level count variation. In this matrix, 200,439 of 691,875 sample-by-transcript entries (28.97%) are fractional estimates, so the rerun converts them with base R round() (nearest integer, ties to even) before fitting DESeq 1.10.1 [5]. The same nine samples and the same count matrix are used for all three pairwise contrasts; no expression-derived clustering or fold-change preselection is used.'),
      eq('Library-size normalization', String.raw`s_j = \operatorname{median}_{i\in I_{+}}\left(\frac{K_{ij}}{\left(\prod_{j'=1}^{m} K_{ij'}\right)^{1/m}}\right),\qquad K^{*}_{ij}=\frac{K_{ij}}{s_j}`),
      p('For transcript i in sample j, Kᵢⱼ is the rounded read count and sⱼ is the DESeq median-of-ratios size factor. I₊ contains transcripts with a positive count in every sample, so their geometric mean is defined; the median ratio then estimates how deeply each sample was sequenced. This adjusts library depth without treating FPKM as count data.'),
      eq('Replicate-aware count model', String.raw`K_{ij}\sim\operatorname{NB}(\mu_{ij},\alpha_i),\qquad \mu_{ij}=s_jq_{ij}`),
      p('DESeq estimates a dispersion αᵢ for each transcript, with the pooled/maximum, parametric fit used in this rerun to stabilize estimates across the nine samples. The negative-binomial test compares the fitted expression levels for each planned pair. The reported fold change is condition B relative to condition A; Benjamini–Hochberg adjusts the P values across the transcript rows in that contrast.'),
      customTable('Planned contrasts · second condition divided by first', ['Contrast', 'Biological comparison', 'Interpretation of positive log₂FC'], [
        ['LL → ML · 150 → 600','Intermediate light vs low light','Higher at 600'],
        ['LL → HL · 150 → 1500','High light vs low light','Higher at 1500'],
        ['ML → HL · 600 → 1500','High light vs intermediate light','Higher at 1500'],
      ]),
      { kind: 'code', label: 'Count-model steps · DESeq 1.10.1', text: String.raw`counts <- round(read_count_matrix[, c("LL1","LL2","LL3",
                                        "ML1","ML2","ML3",
                                        "HL1","HL2","HL3")])
group <- factor(rep(c("LL","ML","HL"), each = 3))
cds <- newCountDataSet(counts, group)
cds <- estimateSizeFactors(cds)
cds <- estimateDispersions(cds, method = "pooled",
                            sharingMode = "maximum",
                            fitType = "parametric")
for (pair in list(c("LL","ML"), c("LL","HL"), c("ML","HL"))) {
    result <- nbinomTest(cds, pair[1], pair[2])
    # log2FoldChange is pair[2] / pair[1]; padj is BH-adjusted
}` },
      p('The tested universe is the 76,875 deposited transcript rows; there is no low-count prefilter or minimum-fold-change cutoff in this rerun. The fractional-to-integer conversion and the dispersion options are explicit analysis settings, so the result is a transparent rerun of the public matrix—not a claim that every undocumented setting from the original paper has been recovered.'),
    ),
    section('TRANSCRIPT-LEVEL RESPONSE',
      p('The first view keeps all three biological replicates visible for six sequence-annotated examples. Counts are divided by the DESeq size factors and shown as log₂(normalized count + 1); points are samples, not technical repeats. The panels use separate y-scales because transcript abundance differs by orders of magnitude.'),
      { kind: 'figure', src: '/figures/dry-lab/transcriptomics-sample-expression.svg', alt: 'Six small-multiple plots of normalized read counts for CRTISO, two LCYB contigs, LCYE, PDS and ZEP across three light conditions, with each biological replicate shown.', caption: 'Fig. 3 Replicate-level expression of six carotenoid transcripts' },
      p('The volcano panels show the count-model results across the transcriptome for each planned contrast. Each point is one Trinity transcript; color marks q < 0.05 after Benjamini–Hochberg correction. These genome-wide plots show where the count model detects a response, but they do not rank pathway importance.'),
      { kind: 'figure', src: '/figures/dry-lab/transcriptomics-deseq-volcano.svg', alt: 'Three volcano plots from DESeq 1.10.1 comparing 600 versus 150, 1500 versus 150 and 1500 versus 600 light conditions across Trinity transcripts.', caption: 'Fig. 4 Differential expression across three light contrasts' },
      p('For pathway interpretation, we return to the sequence-defined enzyme set and retain its biochemical order rather than clustering rows by expression. Each cell below shows the transcript’s log₂ fold change; a dark dot marks q < 0.05. Repeated transcript IDs under one enzyme label are kept as separate sequence features.'),
      { kind: 'figure', src: '/figures/dry-lab/transcriptomics-pathway-effects.svg', alt: 'Heatmap of all 20 sequence-annotated carotenoid pathway transcripts across three DESeq contrasts, grouped in biochemical enzyme order, with fold changes printed and significant contrasts marked.', caption: 'Fig. 5 Light responses of carotenoid-pathway transcripts' },
      customTable('Examples that shape the model question', ['Transcript · enzyme assignment', '600 vs 150 · log₂FC; q', '1500 vs 150 · log₂FC; q', '1500 vs 600 · log₂FC; q'], [
        ['Cluster-5009.34218 · LCYB','+0.576; 1.30 × 10⁻¹³','+0.261; 3.10 × 10⁻³','−0.315; 1.11 × 10⁻⁴'],
        ['Cluster-5009.36796 · LCYB','+1.746; 9.38 × 10⁻⁶','−0.310; 0.901','−2.056; 8.48 × 10⁻⁸'],
        ['Cluster-5009.32344 · LCYE','+0.036; 1','+0.582; 1.37 × 10⁻⁷','+0.546; 5.10 × 10⁻⁷'],
        ['Cluster-5009.33436 · CRTISO','−2.342; 6.40 × 10⁻³¹','+2.353; 2.58 × 10⁻³⁶','+4.696; 2.81 × 10⁻¹¹¹'],
        ['Cluster-5009.39420 · PDS','−0.506; 2.29 × 10⁻³','−0.544; 8.51 × 10⁻⁴','−0.038; 1'],
        ['Cluster-5009.41790 · ZEP','+0.419; 4.57 × 10⁻⁵','−0.780; 3.49 × 10⁻¹⁵','−1.199; 2.04 × 10⁻³⁶'],
      ]),
      p('The two LCYB contigs do not tell the same story: Cluster-5009.34218 is higher at 600 than 150 and remains modestly above 150 at 1500, while Cluster-5009.36796 rises at 600 and drops at 1500. CRTISO and ZEP also change direction across the ordered light conditions. This is why we do not force the data into one monotonic trend or average all copies of an enzyme into a single value.'),
    ),
    section('FROM EXPRESSION TO MODEL',
      p('Across the three light conditions, carotenoid-pathway transcripts respond individually, and the two LCYB-assigned contigs change differently as irradiance rises. These data describe transcript abundance—not enzyme activity or β-carotene flux; matched protein, pigment and flux measurements provide the necessary validation. LCYB therefore becomes the shared control point for the next layer, where protein analysis examines enzyme-side substitutions and regulator–DNA recognition before both effects enter the dynamic model.'),
      links(['GSE120965 · sample design, expression matrix and Trinity assembly','https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE120965'],['Li et al., 2019 · photoacclimation and transcriptome study','https://doi.org/10.1111/pre.12379'],['Next · Protein design and DNA recognition','/protein']),
    ),
  ],
};
export const metabolomics: WikiPage = {
  title: 'Metabolic Flow Analysis', eyebrow: 'Modeling / Metabolic Flow', status: 'team-draft',
  intro: 'The regulatory model delivers β-carotene formation as the input to this layer. Here, a constraint-based chassis model and a local branch model follow how that shared β-carotene pool is allocated among astaxanthin, β-ionone, β-citraurin and crocetin, revealing the environmental conditions and branch points that most strongly shape product choice.',
  references: [refs.fachet2020, refs.orth2010, refs.lan2022, refs.mialoundama2010],
  sections: [
    section('Introduction',
      p('DunaTerp treats β-carotene as a shared metabolic hub rather than a single endpoint. The metabolic analysis therefore asks four connected questions: can the reconstructed D. salina network carry each engineered product route, how do environmental constraints change attainable flux, what chassis cost accompanies stronger production, and which branch points should be prioritized for intervention?'),
      p('The analysis follows a reproducible sequence: validate the chassis network under published scenarios, add the four product routes, define a flux-balance objective, compare production and trade-offs, test LCYB- and zeaxanthin-associated nodes, and finally use a local ODE model to examine time-dependent redistribution.'),
      { kind: 'chapter-grid', items: [
        { index: '01', title: 'Validate the chassis', text: 'Reconstruct the D. salina network and confirm feasible solutions across the published A–H scenarios.', href: '/metabolomics#section-2' },
        { index: '02', title: 'Integrate four routes', text: 'Add product-specific reactions and sinks to one shared β-carotene-centred platform model.', href: '/metabolomics#section-4' },
        { index: '03', title: 'Compare allocation', text: 'Quantify product support, environmental effects, chassis cost and branch-point leverage.', href: '/metabolomics#section-5' },
        { index: '04', title: 'Resolve dynamics', text: 'Use local Michaelis–Menten kinetics and sensitivity analysis to prioritize measurements.', href: '/metabolomics#section-8' },
      ] },
    ),
    section('Chassis model construction and validation',
      p('The Dunaliella salina metabolic network was reconstructed and then validated under the eight A-H scenarios reported in the published carbon-core reconstruction [1]. The analysis unified the definitions of light conditions, nitrogen-source conditions and objective functions, and confirmed that the model could be solved stably under a conservative interpretation of those scenarios.'),
      p('All eight A-H scenarios yielded stable feasible solutions. This established a computable metabolic chassis that provides a consistent foundation for the later product, environment and branch-point analyses.'),
    ),
    section('Method: constrained flux balance analysis',
      p('Flux balance analysis assumes that internal metabolite pools are at quasi-steady state over the optimization interval [2]. The stoichiometric matrix S links metabolites to reaction fluxes v; lower and upper bounds encode the environmental and reaction constraints. For each question, a stated objective c is optimized without changing the underlying mass-balance rule.'),
      eq('FBA problem', String.raw`\begin{aligned}\max_{v}\quad &c^{\mathsf T}v\\[2pt]\text{subject to}\quad &Sv=0\\&v_{\min}\le v\le v_{\max}\end{aligned}`),
      p('Product sink flux is used when comparing maximum product support. Cal01 is retained as a carbon-fixation proxy when testing the cost of product formation. These outputs are conditional model optima, not measured titres.'),
    ),
    section('Integration of four target product pathways',
      p('The core network was extended with four project-relevant target pathways: astaxanthin, beta-ionone, beta-citraurin and crocetin. For each branch, the corresponding metabolites, reaction steps and product sink reactions were added so that pathway performance could be tracked and compared quantitatively within one shared model.'),
      p('After individual validation, all four pathways remained feasible when the corresponding product reaction was used as the objective. This marks the transition from a chassis-only model to a platform model that can compare different production routes rather than merely demonstrating that the network runs.'),
    ),
    section('Product-production simulation and chassis cost',
      p('After pathway integration, the model was used to compare the maximum potential of each target product. Cal01 was used as a proxy for carbon fixation so that product output could be evaluated against chassis metabolic cost.'),
      p('This analysis asks which pathway is most easily favored for flux redirection, which pathway imposes the least burden on the chassis, and at what point increased product output begins to compete strongly with core chassis function. Within the current framework, the ranking is consistently beta-ionone > beta-citraurin > astaxanthin > crocetin. Most pathways retain substantial output under low-to-moderate constraints, while product flux declines clearly only when the carbon-fixation requirement is forced into a high range.'),
      fig('platform_product_tradeoffs_H', 'Trade-off comparison of four target products in scenario H, showing that beta-ionone has the highest yield, followed by beta-citraurin, astaxanthin and crocetin under different Cal01 constraints.', 'Fig. 1 Product-yield trade-offs under Cal01 constraints'),
      fig('astaxanthin_tradeoff_F_H', 'Relationship between astaxanthin production and Cal01 constraint in scenarios F and H, showing that maximum astaxanthin production decreases as carbon-fixation demand increases.', 'Fig. 2 Astaxanthin production in scenarios F and H'),
    ),
    section('Environmental scenario comparison',
      p('To test whether the product ranking depended on one specific condition, the four pathways were compared across all eight A-H scenarios. This provides a unified view of how light and nitrogen conditions shape the maximum attainable product fluxes.'),
      p('The platform is most favorable for redirecting flux toward target-product synthesis under high-light and low-nitrate conditions, with scenarios D and H performing best. At the same time, the relative ranking of the four products remains consistent across all scenarios, indicating that the ranking reflects a stable platform tendency rather than an isolated result from one environment.'),
      fig('platform_environment_map_heatmap', 'Heatmap of maximum production potential for four target products across scenarios A-H, showing that high-light and low-nitrate conditions are most favorable and that beta-ionone remains the best-performing product.', 'Fig. 3 Product potential across environmental scenarios'),
    ),
    section('Key-node and flux-redistribution analysis',
      p('Beyond final product comparison, the analysis also focused on key nodes in the carotenoid backbone, especially Car09, the LCYB-related node, and Car10, the zeaxanthin-producing node. Forced-flux analysis was used to test how increasing these nodes affects proxies for carbon fixation, chlorophyll and membrane lipids.'),
      p('Increasing Car09 or Car10 does not immediately impose severe metabolic stress on the chassis in the low-to-moderate range, but the burden becomes clearer at higher forcing levels. Zeaxanthin was then examined as a branch-point metabolite by sequentially blocking the three major engineered outlets Car26, Car23 and Car17. The additional zeaxanthin is not split evenly across all downstream branches; instead, it follows the leakage priority Car26 > Car23 > Car17.'),
      fig('lcyb_car09_forced_analysis_H', 'Forced-flux analysis of Car09 in scenario H, showing that increasing the LCYB-related node begins to reduce chassis metabolic performance at high forcing levels.', 'Fig. 4 LCYB-related Car09 forced-flux analysis'),
      fig('zeaxanthin_car10_forced_proxies_H', 'Relationship between forced Car10 flux and multiple chassis proxy indicators in scenario H, showing that stronger zeaxanthin production leads to noticeable metabolic burden mainly at high forcing levels.', 'Fig. 5 Chassis responses to forced Car10 flux'),
      fig('zeaxanthin_car10_rerouting_H', 'Downstream rerouting of zeaxanthin in scenario H, showing that under different outlet-blocking conditions, zeaxanthin is preferentially redirected to Car26, then Car23 and then Car17.', 'Fig. 6 Zeaxanthin rerouting among downstream branches'),
    ),
    section('Dynamic branch model',
      p('To move beyond steady-state FBA, a local ODE model was constructed around the branch β-carotene -> zeaxanthin -> four target products. The model includes the BCAR, ZEA and VIO pools together with the four target product pools, and uses a simplified Michaelis-Menten formulation to describe the main branching processes.'),
      p('The first ODE version reproduces the same broad trend seen in the FBA analyses: beta-ionone is more easily favored, while zeaxanthin occupies a central branching position. This allows the analysis to begin asking how flux is redistributed over time rather than only whether a steady state exists.'),
      eq('Local branch kinetics', String.raw`v_i(S)=V_{\max,i}\frac{S}{K_{m,i}+S},\qquad \frac{dS}{dt}=v_{\mathrm{in}}-\sum_i v_i(S)-k_SS`),
      { kind: 'figure-grid', figures: [
        { src: '/figures/dry-lab/carotenoid_branch_ode_v1_baseline_pools.png', alt: 'Time-course plot of key metabolite pools in the ODE baseline scenario.', caption: 'Fig. 7 Baseline metabolite-pool trajectories' },
        { src: '/figures/dry-lab/carotenoid_branch_ode_v1_baseline_fluxes.png', alt: 'Time-course plot of key reaction fluxes in the ODE baseline scenario.', caption: 'Fig. 8 Baseline reaction-flux trajectories' },
      ] },
      fig('carotenoid_branch_ode_v1_scenario_products', 'Comparison of final accumulated levels of the four target products across different ODE perturbation scenarios, showing how parameter changes alter astaxanthin, beta-ionone, beta-citraurin and crocetin outputs.', 'Fig. 9 Product accumulation under ODE perturbations'),
    ),
    section('Sensitivity analysis and dynamic results',
      p('A local sensitivity analysis was then applied to the first ODE version to identify which control parameters matter most. We perturbed the β-carotene-to-zeaxanthin and β-carotene-to-β-ionone entry rates, followed by the three zeaxanthin-to-product branch rates.'),
      p('The strongest control layer over the overall product pattern lies mainly at the β-carotene entry-point split, especially BCAR -> BION and BCAR -> ZEA. These two entry parameters influence the global outcome more strongly than the single downstream branch parameters ZEA -> ASTA, ZEA -> CITR and ZEA -> CROC. In practice, this means that changing the entry-point branching nodes is likely to be more effective than only fine-tuning the terminal branches when the goal is to reshape overall platform allocation.'),
      fig('carotenoid_branch_ode_v1_sensitivity_heatmap', 'ODE parameter sensitivity heatmap showing the relative effects of key parameter changes on Peak ZEA, astaxanthin, beta-ionone, beta-citraurin and crocetin.', 'Fig. 10 ODE parameter-sensitivity heatmap'),
      fig('carotenoid_branch_ode_v1_sensitivity_ranking', 'Ranking plot of key parameter influence in the ODE model, showing that entry-point branching parameters are more important than downstream single-branch parameters for determining the overall product pattern.', 'Fig. 11 Ranking of ODE parameter influence'),
    ),
    section('Conclusions and experimental guidance',
      p('The metabolomics work now forms a comparatively complete workflow: reconstruction of the Dunaliella salina chassis network, integration of multi-product pathways, scenario-feasibility validation, product-potential comparison, environmental adaptation analysis, key-node mechanistic analysis, and finally local dynamic modeling with sensitivity analysis.'),
      p('The conditional results prioritize three measurements for wet-lab feedback: product formation under the D/H-like light and nitrate regimes, the cost of increasing LCYB- and zeaxanthin-associated flux, and kinetic measurements at the BCAR→BION versus BCAR→ZEA entry split. Those data can replace nominal bounds and Vmax/Km values, turning the present scenario model into a calibrated project model.'),
      p('The same results define the handoff to the bioprocess scale. Hardware Modeling receives the preferred light–nitrogen window, the need to preserve β-carotene supply and the branch-allocation targets, then asks which reactor geometry and operating schedule can sustain those conditions.'),
      links(['Continue to Hardware Modeling','/hardware']),
    ),
  ],
};

export const modeling: WikiPage = {
  title: 'Mathematical Modeling', eyebrow: 'Dry Lab / Model', status: 'team-draft',
  intro: 'Transcriptomics identifies LCYB as the light-responsive control point, while protein analysis supplies two molecular levers on that node: LCYB enzyme design and CPP2146–DNA recognition. This page connects those inputs through a five-state dynamic model of promoter occupancy, LCYB transcript, active enzyme, lycopene conversion and β-carotene formation. Its output is the time-dependent β-carotene input passed to the downstream allocation model.',
  references: [refs.bintu2005, refs.liang2017, refs.lan2022, refs.mialoundama2010],
  sections: [
    section('Biological question and model scope',
      p('LCYB catalyzes the cyclisation of lycopene toward β-carotene, placing it at the connection between transcriptional regulation and carotenoid redistribution. The central question is therefore causal: when the regulatory input changes, how much of that signal reaches LCYB transcript, how much reaches active enzyme, and how much finally appears as β-carotene?'),
      p('The model follows five dynamic states: active regulatory factor T, LCYB transcript m, active LCYB enzyme E, lycopene L and β-carotene B. Promoter occupancy θ links T to transcription. LCYB then links gene expression to lycopene consumption and β-carotene formation. The resulting LCYB flux becomes the input boundary for the downstream product-route model, so the two modeling levels connect through one explicit quantity.'),
      p('Figure 1 summarizes three complementary checks. Panel A measures how strongly the day-12 signal survives at each layer. Panel B measures the time required for each state to complete 90% of its day-12 change. Panel C tests whether the reported endpoint remains stable as the RK4 integration step is reduced.'),
      p('The endpoint pattern immediately reveals signal compression. Under high input, T rises 99.83-fold, while m rises 2.93-fold, E rises 2.77-fold, LCYB flux rises 1.42-fold and B rises 2.02-fold. At the same time, L falls to 0.23 of its initial level. The promoter therefore absorbs most of the input range, and the depletion of lycopene limits the extra flux that can be created by the larger enzyme pool.'),
      p('The timing panel adds a second layer to this interpretation. T completes 90% of its response in 4.3 days, whereas enzyme and metabolite states require approximately 7.0–10.1 days. The regulatory signal is established first; protein turnover and pool rebalancing then determine when the metabolic response becomes visible. Panel C confirms that the selected 0.01-day integration step resolves this trajectory with an endpoint error far below the biological changes being compared. The analysis uses the illustrative parameter set defined below, which provides the starting structure for project-specific calibration.'),
      fig('14_regulatory_model','Diagnostic summary of the illustrative LCYB model scenarios, including day-12 fold changes, time to 90% of the simulated response, and RK4 step-size convergence for the beta-carotene endpoint.', 'Fig. 1 Scenario diagnostics and numerical reliability'),
    ),
    section('Promoter-to-enzyme transfer',
      p('The first step converts regulator abundance into promoter occupancy. A one-site equilibrium model assigns occupancy from the ratio T/Kd [1]. At T/Kd = 0.1, 1 and 10, the promoter is occupied by 9.1%, 50.0% and 90.9%, respectively. This ratio gives the three simulated inputs a direct biochemical interpretation: low input samples the responsive lower limb, intermediate input sits at the midpoint, and high input approaches saturation.'),
      links(['Bintu et al. · promoter occupancy models','https://doi.org/10.1016/j.gde.2005.02.007'],['Liang et al. · published D. bardawil lcyb promoter','https://doi.org/10.1111/1462-2920.13539']),
      eq('Promoter input', String.raw`\theta=\frac{T}{K_d+T},\qquad u_{\mathrm{LCYB}}(T)=u_{\mathrm{unbound}}(1-\theta)+u_{\mathrm{bound}}\theta`),
      p('Transcription is the occupancy-weighted average of the unbound and bound promoter rates. With the illustrative rates used here, u_bound is four times u_unbound. The transcription rate is therefore 0.40 at zero occupancy, 1.00 at half occupancy and approaches 1.60 nmol transcript L⁻¹ d⁻¹ near full occupancy. The largest change occurs around T ≈ Kd, where the slope of the transfer curve is steepest.'),
      p('Figure 2 shows how promoter architecture sets both the direction and the ceiling of the response. A bound-to-unbound rate ratio below one produces repression, while ratios above one produce activation. Every curve flattens at high T/Kd because the promoter has few unoccupied sites left. The same saturation is inherited by steady-state transcript and enzyme abundance, explaining why a 100-fold regulator range becomes a much smaller expression range.'),
      p('The published D. bardawil LCYB promoter supplies sequence and regulatory context for this model [2]. Project reporter assays across a CPP2146 concentration series can estimate Kd, u_unbound and u_bound together, placing the transfer curve on an experimentally determined scale.'),
      fig('15_regulatory_response','Promoter occupancy across regulator-to-affinity ratios and the corresponding steady-state transcript and enzyme response for repressing and activating bound-promoter rates.', 'Fig. 2 Promoter occupancy and steady-state expression transfer'),
    ),
    section('Five-state dynamic model',
      p('The five equations turn the static transfer curve into a timed causal chain. Each state has an input term and a loss term. Growth dilution μ acts on all five states, while molecular degradation or metabolic removal adds a state-specific loss. This shared structure makes the response time of each layer traceable to its own turnover rate and to the upstream states that feed it.'),
      eq('Regulatory LCYB model', String.raw`\begin{aligned}
\frac{dT}{dt}&=s_T-(\delta_T+\mu)T\\
\frac{dm}{dt}&=u_{\mathrm{LCYB}}-(\delta_m+\mu)m\\
\frac{dE}{dt}&=k_{\mathrm{tl}}m-(\delta_E+\mu)E\\
\frac{dL}{dt}&=v_{\mathrm{supply}}-v_{\mathrm{LCYB}}-(k_L+\mu)L\\
\frac{dB}{dt}&=v_{\mathrm{LCYB}}-v_{\mathrm{out}}-(k_B+\mu)B
\end{aligned}`),
      eq('Metabolic rates', String.raw`v_{\mathrm{LCYB}}=q_{\mathrm{LCYB}}E\frac{L}{K_{m,\mathrm{LCYB}}+L},\qquad v_{\mathrm{out}}=V_{\mathrm{out}}\frac{B}{K_{m,\mathrm{out}}+B}`),
      customTable('State variables; time is measured in days', ['State','Quantity','Unit'], [
        ['T','Active regulatory factor','µmol L⁻¹'],
        ['m','LCYB transcript','nmol transcript L⁻¹'],
        ['E','Active LCYB','mg L⁻¹'],
        ['L','Lycopene','µmol L⁻¹'],
        ['B','β-carotene','µmol L⁻¹'],
      ]),
      p('The first equation sets T from regulator production and turnover. T determines θ and the LCYB transcription rate in the second equation. Transcript then drives enzyme synthesis in the third equation. With the illustrative losses, the intrinsic 90% response time is about 4.3 days for T and 8.9 days for E; the cascade adds the upstream delay to the enzyme response.'),
      p('The final two equations connect regulation to metabolism. LCYB flux increases with E, but its Michaelis term also requires L. As E rises, lycopene is consumed more rapidly, L falls and the substrate term L/(Km,LCYB + L) decreases. This creates a built-in metabolic brake on LCYB flux. β-carotene accumulates only while LCYB inflow exceeds its saturable downstream outflow, first-order loss and growth dilution. Its final level therefore records the balance of production, substrate availability and removal over time.'),
    ),
    section('Parameterisation and numerical method',
      p('The parameters fall into four experimentally meaningful groups. The regulatory group contains sT, δT, Kd and the two promoter rates. The expression group contains RNA loss, translation and enzyme loss. The metabolic group contains lycopene supply, LCYB catalytic capacity, substrate affinity and β-carotene removal. The growth rate μ couples cell physiology to every balance through dilution.'),
      p('Lan et al. provide LCYB overexpression, light-response and pigment measurements in D. salina [3], while Mialoundama et al. provide recombinant LCYB activity and an apparent lycopene-affinity constant [4]. These studies establish biologically plausible process scales. The table then maps every parameter to the project measurement that will update it, keeping literature-supported structure and strain-specific calibration as consecutive stages of the same workflow.'),
      links(['Lan et al., 2022','https://doi.org/10.4014/jmb.2208.08044'],['Mialoundama et al., 2010','https://doi.org/10.1104/pp.110.155440']),
      { kind: 'table', collapsed: true, caption: 'Illustrative parameter set, units and evidence needed', columns: ['Parameter','Illustrative value','Unit','Evidence needed'], rows: [
        [math`$s_T$`,'0.053; 0.530; 5.300','µmol L⁻¹ d⁻¹','Project measurement'],
        [math`$\delta_T$`,'0.45','d⁻¹','Decay experiment or half-life'],
        [math`$K_d$`,'1.00','µmol L⁻¹','Binding experiment'],
        [math`$u_{\mathrm{unbound}},\;u_{\mathrm{bound}}$`,'0.40; 1.60','nmol transcript L⁻¹ d⁻¹','Promoter reporter experiment'],
        [math`$\delta_m$`,'0.65','d⁻¹','RNA half-life'],
        [math`$k_{\mathrm{tl}}$`,'0.55','mg nmol⁻¹ d⁻¹','Protein abundance and translation rate'],
        [math`$\delta_E$`,'0.18','d⁻¹','Protein half-life'],
        [math`$v_{\mathrm{supply}}$`,'0.80','µmol L⁻¹ d⁻¹','Metabolite time course or flux estimate'],
        [math`$q_{\mathrm{LCYB}}$`,'0.50','µmol mg⁻¹ d⁻¹','Dunaliella assay; plant LCYB prior range'],
        [math`$K_{m,\mathrm{LCYB}}$`,'0.70','µmol L⁻¹','Enzyme assay'],
        [math`$k_L,\;k_B$`,'0.08; 0.06','d⁻¹','Metabolite time course'],
        [math`$V_{\mathrm{out}},\;K_{m,\mathrm{out}}$`,'0.55; 0.50','µmol L⁻¹ d⁻¹; µmol L⁻¹','Metabolomics workstream'],
        [math`$\mu$`,'0.08','d⁻¹','Growth curve'],
      ] },
      p('The simulation begins by integrating the low-input condition to equilibrium. That equilibrium supplies one common initial state for every comparison. At day zero, sT is assigned its low, intermediate or high value; all other parameters remain fixed. The five balances are then integrated for 12 days with a fourth-order Runge–Kutta solver using Δt = 0.01 d. This design isolates the consequences of regulator input because the scenarios share the same starting pools and kinetic assumptions.'),
      p('Numerical convergence is checked against a Δt = 0.002 d reference calculation. Even a 0.5-day step changes the intermediate-input B(12 d) endpoint by only 1.11 × 10⁻⁴%, and the reported 0.01-day step reduces the difference further. The selected time step therefore provides a stable numerical basis for comparing biological mechanisms and parameter sensitivities.'),
      { kind: 'code', label: 'Numerical experiment · reproducible pseudocode', text: String.raw`parameters = illustrative_parameter_set
y0 = integrate_to_equilibrium(low_regulator_input)

for input in [low, intermediate, high]:
    y[0] = y0
    for t from 0 to 12 days in steps of 0.01 day:
        theta = T / (Kd + T)
        calculate transcription, LCYB flux and beta-carotene outflow
        advance [T, m, E, L, B] with classical RK4
    normalize each trajectory to y0

for each parameter:
    sensitivity = central_log_difference(output at +10%, output at -10%)` },
      customTable('Regulator-input scenarios · illustrative values only', ['Scenario', math`$s_T$ (µmol L⁻¹ d⁻¹)`, math`$T^*/K_d$`, 'Purpose'], [
        ['Low input','0.053','0.10','Common initial equilibrium'],
        ['Intermediate input','0.530','1.00','Half-occupied promoter regime'],
        ['High input','5.300','10.00','Near-saturated promoter regime'],
      ]),
      { kind: 'download', src: '/data/regulatory-model-scenarios.json', label: 'Download the model parameters, solver settings and sensitivity results (JSON)' },
    ),
    section('Scenario results',
      p('Figure 3 follows the signal through the five states and LCYB flux. T responds first and approaches its new level monotonically. Promoter occupancy converts that large input shift into a smaller transcriptional change. Transcript begins moving immediately, while active enzyme accumulates more slowly because it depends on the transcript history and has a lower turnover rate.'),
      p('The metabolic states then reveal where expression gain is spent. Rising E accelerates lycopene conversion, so LCYB flux initially increases. The same reaction draws down L, causing the substrate-saturation term to decrease. Flux therefore reaches a peak and then relaxes toward a lower plateau even while E continues to rise. β-carotene integrates this changing inflow and approaches a new balance as downstream removal and dilution catch up.'),
      fig('16_regulatory_dynamics','Six-panel time-course comparison of active regulator, LCYB transcript, active enzyme, lycopene, beta-carotene and LCYB flux after low, intermediate and high regulator-input steps from a common low-input equilibrium.', 'Fig. 3 Dynamic response to three regulator-input scenarios'),
      customTable('Day-12 model response · relative to the low-input equilibrium', ['Scenario', 'Regulator T', 'Transcript m', 'Active enzyme E', 'Lycopene L', 'β-carotene B', 'LCYB flux'], [
        ['Low input','1.00','1.00','1.00','1.00','1.00','1.00'],
        ['Intermediate input','9.98','1.96','1.86','0.44','1.74','1.36'],
        ['High input','99.83','2.93','2.77','0.23','2.02','1.42'],
      ]),
      p('The day-12 values quantify attenuation at each link. Moving from low to intermediate input raises T from 1.00 to 9.98, m to 1.96, E to 1.86, flux to 1.36 and B to 1.74, while L falls to 0.44. Moving again from intermediate to high multiplies T by another ten, yet flux increases only from 1.36 to 1.42 and B from 1.74 to 2.02. Most of the additional regulatory input is therefore absorbed by promoter saturation and substrate depletion.'),
      p('The response times also change along the chain. Under intermediate input, T, m, E, L and B reach 90% of their day-12 changes at approximately 4.3, 5.5, 9.6, 10.1 and 9.7 days. Under high input, the corresponding values are 4.3, 4.0, 9.0, 7.9 and 7.0 days. A stronger input moves the promoter through its responsive range earlier, while enzyme turnover remains the slow stage that delays the downstream response.'),
      p('Figure 4 extends the three selected inputs into a continuous steady-state sweep. Transcript and active enzyme rise sigmoidally around T*/Kd = 1 and then approach their ceilings. LCYB flux flattens earlier than enzyme because declining lycopene availability offsets part of the catalytic gain. β-carotene retains a broader response than instantaneous flux because it is a pool that accumulates the difference between inflow and outflow. Together, the curves identify the intermediate regime around T*/Kd = 1 as the most informative range for promoter calibration and control experiments.'),
      fig('17_regulatory_sweep','Four steady-state response curves showing LCYB transcript, active enzyme, LCYB flux and beta-carotene across regulator abundance relative to promoter affinity.', 'Fig. 4 Steady-state propagation from regulator to β-carotene'),
    ),
    section('Sensitivity and downstream handoff',
      p('The local sensitivity analysis starts from the intermediate-input scenario, where promoter occupancy is close to one half. Each parameter is perturbed by ±10%, the system is integrated from the same low-input equilibrium, and the normalized central log-difference is calculated at day 12. A sensitivity of +1 means that a small percentage increase in the parameter produces approximately the same percentage increase in B; a negative value means that B moves in the opposite direction.'),
      eq('Normalized local sensitivity', String.raw`S_p^{B}=\frac{\ln B(1.1p)-\ln B(0.9p)}{\ln(1.1p)-\ln(0.9p)}`),
      fig('18_regulatory_sensitivity','Horizontal bar chart of normalized local sensitivities of the day-12 beta-carotene pool to regulatory, expression, kinetic, substrate-supply, downstream-capacity and growth-dilution parameters.', 'Fig. 5 Local sensitivity of the β-carotene pool'),
      p('Lycopene supply is the strongest positive control, with S = +1.34. A 10% increase around the baseline therefore produces roughly a 13% increase in the day-12 β-carotene pool. Downstream removal capacity is the strongest opposing control at S = −1.02, followed by growth dilution at S = −0.71. These three terms determine whether additional carbon reaches B, leaves the pool or is diluted by biomass formation.'),
      p('LCYB catalytic capacity and translation have similar positive sensitivities of +0.58 and +0.57. RNA loss contributes −0.47, bound-promoter transcription contributes +0.44 and enzyme loss contributes −0.34. Regulator production and binding affinity have smaller magnitudes of approximately ±0.17 at this operating point because promoter saturation has already compressed their effect. The control structure therefore shifts from regulation toward precursor supply, enzyme capacity and pool removal as the signal moves downstream.'),
      p('This ranking sets a practical measurement order. First, paired lycopene and β-carotene time courses constrain precursor supply and pool removal. Second, growth curves separate metabolic loss from dilution. Third, LCYB protein abundance and activity connect transcript to catalytic capacity. Finally, CPP2146 abundance and promoter binding place the regulatory transfer curve on the correct concentration scale. Measuring these blocks in this order progressively resolves the parameters with the largest influence on B.'),
      p('The LCYB rate forms the handoff to the metabolic-flow model through vin,BCAR(t) = vLCYB(t). Each downstream product route can then use the same upstream β-carotene supply while retaining its own reaction parameters. This shared boundary preserves the time-dependent effect of promoter control and allows downstream route comparisons to begin from a common, mechanistically derived input.'),
      eq('Shared boundary', String.raw`v_{\mathrm{in,BCAR}}(t)=v_{\mathrm{LCYB}}(t)`),
      links(['Continue to the metabolic-flow analysis','/metabolomics']),
    ),
    section('Conclusions and experimental validation',
      p('The model resolves the regulatory-to-metabolic response into three stages. First, promoter occupancy compresses the regulator range into a smaller transcriptional range. Second, transcript and enzyme turnover delay the response by several days. Third, lycopene availability and β-carotene removal determine how much of the enzyme change remains in the pigment pool. The high-input scenario captures all three effects: a 99.83-fold regulator level becomes a 2.77-fold enzyme level, a 1.42-fold LCYB flux and a 2.02-fold β-carotene pool.'),
      p('The strongest leverage point in the current scenario is precursor supply, followed by downstream removal, growth dilution and LCYB capacity. This result connects model interpretation to engineering decisions: promoter strengthening is most useful while T is near Kd; once occupancy approaches saturation, improving lycopene supply or retaining β-carotene produces a larger modeled effect.'),
      p('Matched measurements of CPP2146 abundance, LCYB transcript, LCYB protein or activity, lycopene and β-carotene will calibrate the complete causal chain. A regulator-input series centered on T/Kd ≈ 1 defines the promoter transfer curve, while dense sampling over the first ten days resolves the predicted delays between RNA, enzyme and pigment. Joint fitting of these measurements will place uncertainty intervals around the response and sensitivity results.'),
      customTable('Measurements that close the model loop', ['Measurement','Model quantity informed','Why it matters'], [
        ['CPP2146 abundance and promoter-binding assay',math`$T,\;K_d$`,'Sets the regulatory input and promoter occupancy'],
        ['LCYB transcript time course',math`$m,\;u_{\mathrm{LCYB}}$`,'Tests the predicted transcriptional response'],
        ['LCYB protein or enzyme assay',math`$E,\;q_{\mathrm{LCYB}}$`,'Connects transcript abundance to catalytic capacity'],
        ['Lycopene and β-carotene time course',math`$L,\;B$`,'Tests substrate conversion and estimates the shared product-model input'],
      ]),
      p('Together, the model converts the project’s regulatory concept into a quantitative engineering strategy. CPP2146 controls entry into the response, LCYB connects that response to carotenoid conversion, and precursor supply determines how much regulatory gain reaches β-carotene. This framework links transcriptomics, wet-lab validation and downstream product modeling around one shared mechanism, giving DunaTerp a clear route from regulatory design to measurable metabolic performance.'),
    ),
  ],
};

export const dryLabIndex: WikiPage = {
  title: 'From Photons to Products', eyebrow: 'A Multiscale Model of DunaTerp', status: 'team-draft',
  intro: 'We built one multiscale model of DunaTerp, following the system from environmental input and molecular regulation to metabolic allocation, reactor operation and biological containment. Light initiates the chain; LCYB and CPP2146 define its molecular control; regulatory dynamics carry the signal into the β-carotene pool; metabolic analysis distributes that pool among four products; and reactor design supplies the light and salinity conditions that sustain the whole system.',
  sections: [
    section('One system, six connected scales',
      p('DunaTerp does not treat transcriptomics, protein analysis, mathematical modeling, metabolic-flow analysis, hardware and safety as parallel exercises. Each layer resolves one uncertainty in the same production system, and its output becomes a constraint or parameter for the next layer. The chain begins with the light environment experienced by D. salina and ends with a reactor whose measured light and salinity can be fed back into the biological models.'),
      p('The central connector is LCYB. Light-responsive transcript data identify it as a pathway control point; protein analysis examines how its catalytic behaviour and CPP2146-mediated regulation might be changed; the dynamic model calculates how that control reaches β-carotene; and the metabolic model follows how the shared β-carotene pool is divided among four target products. Hardware then asks how to maintain the light, mixing and nutrient conditions assumed by those models.'),
      p('Safety surrounds this chain rather than appearing as an unrelated final module. The same high-salinity environment used for cultivation defines the proposed containment boundary, so reactor operation and the salt-responsive safeguard must be evaluated together. This structure turns six analyses into one testable engineering story, with explicit measurements connecting every scale.'),
    ),
    section('Environmental signal — light reveals the control point',
      p('We begin with nine light-acclimated cultures: three biological replicates at 150, 600 and 1500 µmol photons m⁻² s⁻¹. Sequence-first annotation places 20 recovered transcript features across nine carotenoid-enzyme families, while a replicate-aware negative-binomial model tests all three light contrasts without averaging different transcript copies into one gene-level value.'),
      p('The result is not a single monotonic “high light” response. The two LCYB-assigned contigs change differently as irradiance rises, and other pathway transcripts also reverse direction between conditions. This identifies LCYB as a biologically motivated control point while preserving the distinction between transcript abundance and actual enzyme activity. The next layer must therefore test both the enzyme and the regulator that controls its expression.'),
      links(['See the transcriptomics analysis', '/transcriptomics']),
    ),
    section('Molecular control — two levers act on LCYB',
      p('The protein layer examines two ways to control the same node. On the catalytic side, stability prediction, structure comparison, docking and molecular-dynamics descriptors are used to narrow LCYB substitutions that may change lycopene conversion. On the regulatory side, CPP2146–DNA modeling identifies a candidate recognition interface and promoter region that can be tested through binding and native-promoter experiments.'),
      p('These are not two separate protein projects. CPP2146–DNA recognition determines the regulatory input to LCYB expression, whereas LCYB abundance and catalytic capacity determine how efficiently lycopene is converted toward β-carotene. The selected sites and structural measurements therefore enter the regulatory model as two molecular levers acting on one shared control point.'),
      links(['See the protein and DNA analysis', '/protein']),
    ),
    section('Regulatory dynamics — the signal reaches β-carotene',
      p('The dynamic model follows the signal through promoter occupancy, LCYB transcript, active enzyme, lycopene conversion and β-carotene formation. Separating these states reveals where a regulatory change is delayed, attenuated or saturated, and prevents promoter response, enzyme accumulation and metabolite formation from being treated as one instantaneous step.'),
      p('Parameter sweeps and sensitivity analysis then identify which quantities most strongly control response magnitude and timing. The important handoff is the modeled LCYB conversion rate: vLCYB(t) becomes the time-dependent input to the downstream β-carotene allocation model, so regulatory design is connected quantitatively to product formation rather than ending at gene expression.'),
      links(['See the mathematical model', '/model']),
    ),
    section('Cellular metabolism — β-carotene is allocated to four products',
      p('A reconstructed D. salina network extends the shared β-carotene pool toward astaxanthin, β-ionone, β-citraurin and crocetin. Constraint-based analysis first checks whether all four routes remain feasible across the published light–nitrogen scenarios, then compares their attainable production against a carbon-fixation proxy so that product support and chassis cost are evaluated together.'),
      p('Within the current conditional model, product support ranks β-ionone above β-citraurin, astaxanthin and crocetin, while local branch analysis shows that the shared β-carotene entry split has greater leverage than isolated terminal reactions. The output is therefore not simply four predicted yields: it is a prioritized set of branch measurements and a light–nitrogen operating window passed to the reactor layer.'),
      links(['See the metabolic-flow analysis', '/metabolomics']),
    ),
    section('Bioprocess scale — reactor operation sustains the modeled state',
      p('The flat-panel airlift photobioreactor translates the biological operating window into geometry and control. Optical modeling calculates how biomass self-shading changes internal irradiance; cultivation dynamics connect that light field to growth, nutrient use and product formation; and two-stage simulations examine how illumination and switching time jointly affect productivity.'),
      p('Light–dark cycling, scale-up and energy analysis then turn biological performance into engineering trade-offs. A short optical path, transparent PMMA walls, a serpentine chamber and bubble-driven circulation are therefore not separate hardware features: together they maintain the upstream model assumptions while defining measurable quantities—internal irradiance, biomass, salinity and product concentration—for the next design cycle.'),
      links(['See the reactor model', '/hardware'], ['See the reactor design', '/hardware-design']),
    ),
    section('Containment boundary — safety surrounds the production chain',
      p('Safety is a boundary around the complete system rather than its final step. The salt-responsive model follows the same salinity drop under retained-cell and water-exchange environments, and compares three mechanisms: no effective switch, growth inhibition alone and conditional killing. This separates physical removal, reduced growth and active loss of viability instead of combining them into one clearance curve.'),
      p('The strongest modeled reduction in cell concentration appears only when the circuit adds an explicit killing effect after salinity falls. Response delay, killing strength, receiving-water exchange and residual growth therefore become design requirements shared by the strain and the reactor. The model does not merely label the system safe; it defines what must be measured before the containment concept can be accepted.'),
      links(['See the safety model', '/safety-and-security']),
    ),
    section('Closing the loop from operation back to signal',
      p('The chain closes when reactor measurements become inputs for the next biological iteration. Internal irradiance and salinity update the environmental boundary; matched LCYB RNA, active enzyme, lycopene and β-carotene measurements calibrate the regulatory dynamics; and product titres refine the four branch constraints. Each experiment is therefore assigned to a specific uncertainty in the model rather than added as an isolated validation step.'),
      p('From photons to products is the complete causal story: photons set the signal, CPP2146 and LCYB shape molecular control, regulatory dynamics determine β-carotene supply, cellular metabolism allocates four products, hardware maintains the operating state, and containment constrains every stage. The value of the framework is not the number of modeling techniques it contains, but the explicit transfer of evidence from one scale to the next.'),
    ),
  ],
};

const hardwareFig = (
  name: string,
  alt: string,
  caption: string,
): ContentBlock => ({
  kind: 'figure',
  src: `/figures/hardware/${name}.png`,
  alt,
  caption,
});

const hardwareDesignFig = (
  filename: string,
  alt: string,
  caption: string,
): ContentBlock => ({
  kind: 'figure',
  src: `/figures/hardware-design/${filename}`,
  alt,
  caption,
});

export const hardware: WikiPage = {
  title: 'Hardware Modeling',
  eyebrow: 'Dry Lab / Hardware Modeling',
  status: 'team-draft',
  references: [refs.posten2009, refs.carvalho2011],
  intro:
    'The metabolic layer defines the light and nutrient conditions that support product allocation. Hardware Modeling translates those requirements into optical path, internal irradiance, mixing, cultivation timing and energy demand, producing an operating envelope that Hardware Design can implement and that feeds measured light and salinity back to the biological models.',
  sections: [
    section(
      'Photobioreactor Design for DunaTerp',
      p(
        'The performance of a photosynthetic production system depends not only on the engineered cells, but also on the physical environment in which they grow. For Dunaliella salina, light delivery, biomass self-shading, mixing, cultivation strategy, and energy consumption are closely connected [1] [2].',
      ),
      p(
        'Our hardware modeling consists of five connected components: optical transport, cultivation dynamics, two-stage optimization, light–dark cycling, and scale-up with energy consumption.',
      ),
    ),

    section(
      'Optical Transport',
      p(
        'As biomass accumulates, cells absorb and scatter incident light. This creates an uneven light environment inside the reactor: regions near the illuminated surfaces receive stronger light, while deeper regions can become increasingly light-limited [2]. To describe this effect, we modeled light propagation across the flat-panel reactor under symmetric illumination from both transparent faces.',
      ),

      eq(
        'Optical transport under symmetric double-sided illumination',
        String.raw`\begin{aligned}
\frac{d}{dz}
\begin{bmatrix}
I^+(z,t)\\
I^-(z,t)
\end{bmatrix}
&=
X(t)
\begin{bmatrix}
-(k_a+b k_s) & b k_s\\
-b k_s & k_a+b k_s
\end{bmatrix}
\begin{bmatrix}
I^+(z,t)\\
I^-(z,t)
\end{bmatrix}\\[10pt]
I^+(0,t)&=I_F(t),\qquad
I^-(L,t)=I_B(t)\\[4pt]
I_F(t)&=I_B(t)=I_0(t)\\[4pt]
G(z,t)&=I^+(z,t)+I^-(z,t)\\[4pt]
\bar I(t)&=\frac{1}{L}\int_0^L G(z,t)\,dz
\end{aligned}`,
      ),

      customTable(
        'Variables used in the optical transport model',
        ['Symbol', 'Meaning', 'Unit'],
        [
          ['I⁺', 'Forward photon flux inside the flat panel', 'µmol photons m⁻² s⁻¹'],
          ['I⁻', 'Backward photon flux inside the flat panel', 'µmol photons m⁻² s⁻¹'],
          [math`$I_F$`, 'Incident irradiance at the front face', 'µmol photons m⁻² s⁻¹'],
          [math`$I_B$`, 'Incident irradiance at the rear face', 'µmol photons m⁻² s⁻¹'],
          [
            'I₀',
            'Per-face incident irradiance under symmetric double-sided illumination',
            'µmol photons m⁻² s⁻¹',
          ],
          ['X', 'Biomass concentration', 'g L⁻¹'],
          [math`$k_a$`, 'Biomass-specific absorption coefficient', 'm² kg⁻¹'],
          [math`$k_s$`, 'Biomass-specific scattering coefficient', 'm² kg⁻¹'],
          ['b', 'Fraction of scattered light redirected backward', 'dimensionless'],
          ['G', 'Total local irradiance', 'µmol photons m⁻² s⁻¹'],
          ['L', 'Reactor optical path / panel thickness', 'm'],
          ['Ī', 'Average irradiance across the optical path', 'µmol photons m⁻² s⁻¹'],
        ],
      ),

      p(
        'The model calculates the spatial light distribution inside the reactor and allows us to examine how biomass concentration and reactor geometry affect internal illumination.',
      ),

      hardwareFig(
        'A_optical_field_heatmap_double_sided',
        'Simulated light field across a flat-panel photobioreactor under symmetric double-sided illumination at different biomass concentrations.',
        'Fig. 1 Simulated optical field under double-sided illumination',
      ),

      p(
        'The optical field remains approximately symmetric because both large faces receive the same incident irradiance. As biomass increases, however, the centre of the reactor becomes progressively darker. This shows why increasing external illumination alone cannot fully eliminate internal light limitation and why maintaining a short optical path is important for our photobioreactor design.',
      ),
    ),

    section(
      'Cultivation Dynamics',
      p(
        'We next connected the calculated light environment to biomass growth, nutrient consumption, and product formation. The cultivation module describes the dynamic changes of biomass, nutrient availability, and product concentration over time.',
      ),

      eq(
        'Cultivation dynamics',
        String.raw`\begin{aligned}
\frac{d}{dt}
\begin{bmatrix}
X\\
N\\
P
\end{bmatrix}
&=
\begin{bmatrix}
(\mu-k_d)X\\
-\mu X/Y_{X/N}\\
(\alpha\mu+\beta(t))X-k_pP
\end{bmatrix}\\[10pt]
\mu(t)
&=
\mu_{\max}
\frac{g_I(\bar I(t))}{g_I(I_{\mathrm{opt}})}
\frac{N(t)}{K_N+N(t)}\\[4pt]
g_I(I)
&=
\frac{I}{K_I+I+I^2/K_{\mathrm{inh}}}\\[4pt]
I_{\mathrm{opt}}
&=
\sqrt{K_IK_{\mathrm{inh}}}
\end{aligned}`,
      ),

      customTable(
        'Variables used in the cultivation model',
        ['Symbol', 'Meaning', 'Unit'],
        [
          ['X', 'Biomass concentration', 'g L⁻¹'],
          ['N', 'Limiting nutrient concentration', 'g L⁻¹'],
          ['P', 'Target-product concentration', 'mg L⁻¹'],
          ['μ', 'Actual specific growth rate', 'd⁻¹'],
          [math`$\mu_{\max}$`, 'Maximum specific growth rate', 'd⁻¹'],
          [math`$k_d$`, 'Biomass decay / maintenance-loss constant', 'd⁻¹'],
          [math`$Y_{X/N}$`, 'Biomass yield on limiting nutrient', 'g biomass g⁻¹ nutrient'],
          [
            'α',
            'Growth-associated production coefficient',
            'mg product g⁻¹ biomass',
          ],
          [
            'β',
            'Non-growth-associated production coefficient',
            'mg product g⁻¹ biomass d⁻¹',
          ],
          [math`$k_p$`, 'Product degradation constant', 'd⁻¹'],
          [math`$K_N$`, 'Nutrient half-saturation parameter', 'g L⁻¹'],
          [math`$K_I$`, 'Light-saturation parameter', 'µmol photons m⁻² s⁻¹'],
          [math`$K_{\mathrm{inh}}$`, 'Photoinhibition parameter', 'µmol photons m⁻² s⁻¹'],
          [math`$I_{\mathrm{opt}}$`, 'Predicted optimum irradiance for growth', 'µmol photons m⁻² s⁻¹'],
        ],
      ),

      p(
        'The model includes both light limitation and photoinhibition, so stronger illumination does not necessarily correspond to faster predicted growth. This module therefore links the physical light environment generated by the reactor directly to the biological response of the culture.',
      ),
    ),

    section(
      'Two-Stage Cultivation Strategy',
      p(
        'Conditions that favour rapid biomass accumulation may not be identical to those that favour product formation. We therefore explored a two-stage cultivation strategy. The first stage focuses on biomass growth, while the second represents a production-oriented condition.',
      ),

      eq(
        'Two-stage cultivation and productivity optimization',
        String.raw`\begin{aligned}
\big[I_F(t),I_B(t),\beta(t)\big]
&=
\begin{cases}
[I_g,I_g,\beta_g], & 0\le t<t_s\\
[I_p,I_p,\beta_p], & t_s\le t\le T
\end{cases}\\[10pt]
Q_P(I_g,t_s)
&=
\frac{P(T;I_g,t_s)}{T}\\[4pt]
(I_g^*,t_s^*)
&=
\underset{I_g,t_s}{\arg\max}\;Q_P(I_g,t_s)
\end{aligned}`,
      ),

      customTable(
        'Variables used in the two-stage cultivation model',
        ['Symbol', 'Meaning', 'Unit'],
        [
          [
            math`$I_g$`,
            'Per-face irradiance during the growth stage',
            'µmol photons m⁻² s⁻¹',
          ],
          [
            math`$I_p$`,
            'Per-face irradiance during the production stage',
            'µmol photons m⁻² s⁻¹',
          ],
          [
            math`$\beta_g$`,
            'Non-growth-associated production coefficient during the growth stage',
            'mg product g⁻¹ biomass d⁻¹',
          ],
          [
            math`$\beta_p$`,
            'Non-growth-associated production coefficient during the production stage',
            'mg product g⁻¹ biomass d⁻¹',
          ],
          [math`$t_s$`, 'Switching time from growth to production stage', 'd'],
          ['T', 'Total cultivation time', 'd'],
          [math`$Q_P$`, 'Volumetric product productivity', 'mg L⁻¹ d⁻¹'],
          [math`$P(T)$`, 'Final product concentration', 'mg L⁻¹'],
        ],
      ),

      p(
        'We explored different combinations of growth-stage illumination and switching time to examine their effects on predicted productivity.',
      ),

      hardwareFig(
        'C_productivity_heatmap_double_sided',
        'Heat map of predicted product productivity across growth-stage irradiance and switching time under double-sided illumination.',
        'Fig. 2 Productivity across irradiance and switching time',
      ),

      p(
        'The heat map shows that productivity depends on the combined effect of illumination and cultivation timing rather than on either parameter alone. To make the overall design space easier to understand, we also visualized the same response as a three-dimensional surface.',
      ),

      hardwareFig(
        'D_3D_product_surface_double_sided',
        'Three-dimensional response surface showing predicted productivity as a function of growth-stage irradiance and switching time.',
        'Fig. 3 Predicted productivity landscape',
      ),

      p(
        'Together, these simulations allow cultivation conditions to be treated as an engineering design space instead of selecting operating parameters independently.',
      ),
    ),

    section(
      'Light–Dark Cycling',
      p(
        'Cells inside an airlift photobioreactor continuously move through different regions of the reactor. Gas-driven circulation can carry cells from bright regions near illuminated surfaces into darker internal regions and then back again. As a result, individual cells experience changing light conditions rather than a constant irradiance [1].',
      ),

      eq(
        'Reduced-order light–dark cycling',
        String.raw`\begin{aligned}
t_{\mathrm{cycle}}
&=
\frac{L_{\mathrm{loop}}}{\bar U}\\[4pt]
t_L
&=
\phi_Lt_{\mathrm{cycle}}\\[4pt]
t_D
&=
(1-\phi_L)t_{\mathrm{cycle}}\\[4pt]
f_{I,\mathrm{cycle}}
&=
\phi_Lf_I(I_L)
+
(1-\phi_L)f_I(I_D)\\[4pt]
\mu_{\mathrm{cycle}}
&=
\mu_{\max}
f_{I,\mathrm{cycle}}
\frac{N}{K_N+N}
\end{aligned}`,
      ),

      customTable(
        'Variables used in the light–dark cycling model',
        ['Symbol', 'Meaning', 'Unit'],
        [
          [math`$t_{\mathrm{cycle}}$`, 'Time for one representative circulation cycle', 's'],
          [math`$L_{\mathrm{loop}}$`, 'Representative circulation-path length', 'm'],
          ['Ū', 'Mean liquid velocity', 'm s⁻¹'],
          [math`$\phi_L$`, 'Fraction of the circulation cycle spent in bright regions', 'dimensionless'],
          [math`$t_L$`, 'Residence time in the bright region per cycle', 's'],
          [math`$t_D$`, 'Residence time in the dark region per cycle', 's'],
          [math`$I_L$`, 'Representative irradiance in the bright region', 'µmol photons m⁻² s⁻¹'],
          [math`$I_D$`, 'Representative irradiance in the dark region', 'µmol photons m⁻² s⁻¹'],
          [math`$f_{I,\mathrm{cycle}}$`, 'Effective light-response factor over one circulation cycle', 'dimensionless'],
          [math`$\mu_{\mathrm{cycle}}$`, 'Effective specific growth rate under light–dark cycling', 'd⁻¹'],
        ],
      ),

      p(
        'This reduced representation connects reactor hydrodynamics to cellular light exposure without requiring a full CFD simulation. In our design, mixing therefore contributes not only to gas and nutrient transfer, but also to light management.',
      ),
    ),

    section(
      'Scale-Up and Energy Consumption',
      p(
        'Simply increasing photobioreactor thickness can increase the optical path and worsen self-shading. We therefore considered numbering-up as the main scale-up strategy, increasing total production capacity by operating multiple similar flat-panel modules while maintaining the optical characteristics of each module.',
      ),

      eq(
        'Scale-up, energy consumption and simplified economic outputs',
        String.raw`\begin{aligned}
V_m
&=
AL\\[4pt]
\frac{A_{\mathrm{ill}}}{V_m}
&=
\frac{2}{L}\\[4pt]
n
&=
\left\lceil
\frac{V_T}{AL}
\right\rceil\\[4pt]
Q_{g,T}
&=
nQ_{g,m}\\[4pt]
E_{\mathrm{LED}}
&=
\frac{2nA}{\eta_{\mathrm{LED}}}
\Big[
I_gt_s+I_p(T-t_s)
\Big]\\[4pt]
M_{\mathrm{annual}}
&=
\eta_RP(T)V_T
\frac{365}{T+t_{\mathrm{turn}}}\\[4pt]
\Pi
&=
pM_{\mathrm{annual}}-OPEX\\[4pt]
ROI
&=
\frac{\Pi}{CAPEX}\\[4pt]
T_{\mathrm{payback}}
&=
\frac{CAPEX}{\Pi}
\end{aligned}`,
      ),

      customTable(
        'Variables used in scale-up and consumption estimates',
        ['Symbol', 'Meaning', 'Unit'],
        [
          [math`$V_m$`, 'Working volume of one flat-panel module', 'm³'],
          ['A', 'Large-face area of one module', 'm²'],
          ['L', 'Panel thickness / optical path length', 'm'],
          [math`$A_{\mathrm{ill}}$`, 'Total illuminated area of one module', 'm²'],
          [math`$V_T$`, 'Target total working volume', 'm³'],
          ['n', 'Required number of modules', 'dimensionless'],
          [math`$Q_{g,T}$`, 'Total gas volumetric flow after numbering-up', 'm³ s⁻¹'],
          [math`$Q_{g,m}$`, 'Gas volumetric flow for one module', 'm³ s⁻¹'],
          [math`$E_{\mathrm{LED}}$`, 'LED energy consumption', 'model-dependent energy unit'],
          [math`$\eta_{\mathrm{LED}}$`, 'LED photon efficacy', 'µmol photons J⁻¹'],
          [math`$\eta_R$`, 'Downstream recovery fraction', 'dimensionless'],
          [math`$M_{\mathrm{annual}}$`, 'Annual recovered product mass', 'kg year⁻¹'],
          [math`$t_{\mathrm{turn}}$`, 'Turnaround time between cultivation batches', 'd'],
          ['p', 'Product selling price', 'USD kg⁻¹'],
          ['Π', 'Annual operating profit', 'USD year⁻¹'],
          ['OPEX', 'Annual operating expenditure', 'USD year⁻¹'],
          ['CAPEX', 'Capital expenditure', 'USD'],
          ['ROI', 'Return on investment', 'year⁻¹'],
          [math`$T_{\mathrm{payback}}$`, 'Simple payback time', 'year'],
        ],
      ),

      p(
        'This part of the model highlights the trade-off between biological performance and engineering cost. Higher illumination may improve cultivation under some conditions, but it also increases electricity consumption. Therefore, the condition producing the highest biological output is not necessarily the most attractive engineering condition.',
      ),
    ),

    section(
      'Interactive Hardware Design Tool',
      p(
        'To make the model easier to explore, we developed an interactive browser-based PBR tool. Users can modify key reactor and cultivation parameters and immediately observe how the predicted system response changes.',
      ),
      { kind: 'pbr-widget' },
      p(
        'The tool runs directly in the browser without requiring a Python backend. Instead of presenting only one fixed parameter set, the interactive interface allows users to explore how different assumptions affect the predicted reactor behaviour.',
      ),
    ),

    section(
      'Scope and Limitations',
      p(
        'Our model is intended as a reduced-order engineering framework for scenario exploration, rather than a fully experimentally calibrated digital twin.',
      ),
      p(
        'The optical module simplifies radiative transport, while the circulation module represents hydrodynamics using characteristic parameters rather than full CFD.',
      ),
      p(
        'Most kinetic, product, and economic parameters in the current implementation are illustrative nominal values rather than direct measurements from the final engineered strain.',
      ),
      p(
        'These relationships define the operating envelope passed to Hardware Design: optical path, per-face irradiance, mixing intensity, cultivation timing and energy demand. Once the reactor is operated, measured internal irradiance, biomass and salinity return to the transcriptomic and regulatory layers as updated environmental inputs, closing the multiscale loop.',
      ),
      links(['Continue to Hardware Design','/hardware-design'], ['Return to the environmental input','/transcriptomics']),
    ),
  ],
};
export const hardwareDesign: WikiPage = {
  title: 'Hardware Design',
  eyebrow: 'Dry Lab / Hardware Design',
  status: 'team-draft',
  references: [refs.posten2009, refs.carvalho2011],
  intro:
    'Hardware Modeling identifies the optical and operating conditions required by the biological system. This page turns those outputs into a flat-panel airlift photobioreactor centered on a short optical path, a serpentine culture chamber and bubble-driven circulation of the culture medium.',
  sections: [
    section(
      'Reactor Architecture and Working Principle',
      p(
        'For photosynthetic Dunaliella, reactor design should account for light availability, inorganic carbon supply, gas exchange, culture mixing, and the compatibility of materials and seals with saline media [1] [2]. For light supply, individual cells experience light according to both external illumination and their movement through the culture. We therefore designed the reactor to promote mixing through bubble-driven circulation and facilitate cell movement between well-lit regions near the transparent walls and darker regions within the culture, with the aim of creating light–dark exposure patterns that may benefit cultivation.',
      ),
      p(
        'The reactor consists of two transparent PMMA plates designed for CNC machining. The transparent walls allow external illumination and observation of the interior, while the split construction provides access for cleaning and maintenance. The chamber integrates three functional regions: a bottom pressure-equalization and gas-distribution region, a central culture zone, and a top gas–liquid separation region. Silicone gaskets are incorporated at the plate interface, and polymer bulkhead fittings connect the gas and liquid lines.',
      ),
      p(
        'For the central culture zone, the serpentine geometry guides circulation driven by rising gas bubbles. Gas introduced through the bottom distribution region transfers momentum to the surrounding culture medium, while internal flow-guiding structures direct the resulting liquid motion and are intended to establish local recirculation. This arrangement is designed to promote mixing without a separate mechanical impeller. At the top, an enlarged gas–liquid separation region provides space for gas disengagement and discharge, integrating gas introduction, bubble-driven circulation, and gas release within a single reactor body.',
      ),
    ),

    section(
      'Single-Unit Concept — Initial Geometry for CFD',
      p(
        'Our design process began with a simplified single-unit model developed in CATIA for preliminary CFD analysis. The geometry contained a single curved flow-guiding section, allowing us to investigate how rising bubbles interact with the surrounding liquid and internal walls. This stage focused on the basic hydrodynamic concept: using gas-driven liquid motion to promote circulation and mixing without a mechanical impeller. The simplified model provided a starting point for developing a larger serpentine culture chamber.',
      ),
      hardwareDesignFig(
        'First_Generation_Flat_Panel_Airlift_Reactor_Single_Unit.JPG',
        'Simplified single-unit flat-panel airlift reactor geometry developed for preliminary CFD analysis.',
        'Fig. 1 First-generation single-unit reactor concept',
      ),
    ),

    section(
      'Initial Prototype — Piled Cultivation Chamber',
      p(
        'The initial full-panel prototype extended the single-unit concept into a series of connected flow-guiding sections. Developed in SolidWorks, this version established the reactor’s main functional layout: a bottom pressure-equalization and gas-distribution region, a central serpentine culture chamber, and a top gas–liquid separation region. The internal geometry was intended to guide bubble-driven liquid motion through the culture chamber while providing space for gas distribution and release. This iteration connected the preliminary flow concept with the overall architecture of a flat-panel photobioreactor.',
      ),
      hardwareDesignFig(
        'Reactor_V1_Initial_Prototype.JPG',
        'Initial full-panel prototype showing the connected serpentine cultivation chamber and functional reactor regions.',
        'Fig. 2 Reactor V1 initial prototype',
      ),
    ),

    section(
      'Laboratory Prototype — Assembly and Sealing',
      p(
        'The laboratory prototype translated the functional layout into a two-part split design, with complementary plates enclosing the culture chamber. Fastening holes and internal support locations were incorporated, and silicone gaskets were introduced to seal the mating surfaces. These features were intended to support secure assembly while allowing the chamber to be opened for cleaning, inspection, and component replacement. This stage shifted the design focus toward practical laboratory use, particularly the integration of the flow geometry with fastening, sealing, and fluid connections.',
      ),
      hardwareDesignFig(
        'Reactor_V2_Lab_Prototype.JPG',
        'Laboratory prototype showing the split-plate construction, fastening layout, and sealing features.',
        'Fig. 3 Reactor V2 laboratory prototype',
      ),
    ),

    section(
      'Production Design — Fastening Refinement and Wall-Thickness Optimization',
      p(
        'The final design refined the split-plate reactor for CNC machining from transparent PMMA. AI-assisted design exploration was used to refine the screw layout, considering fastening distribution, sealing support, and clearance around the culture channels and connection ports. Material-removal pockets on the outer surfaces were introduced to reduce the thickness of PMMA in consideration of both optical transmission and the mounting requirements of bulkhead fittings. The connection features were also adapted to existing polymer bulkhead fittings. As shown in the drawing, the culture-facing side of Plate A retains the serpentine flow-guiding geometry, bringing the circulation concept together with the requirements of fabrication and assembly.',
      ),
      hardwareDesignFig(
        'Reactor_V3_Plate_A_Culture_Facing_Side_Vertical.JPG',
        'Final Plate A design showing the culture-facing serpentine geometry, fastening layout, and machining refinements.',
        'Fig. 4 Reactor V3 production design',
      ),
    ),
    section(
      'Operating Envelope and Biological Feedback',
      p('The final reactor design implements the model outputs as physical controls: panel thickness sets the optical path, double-sided illumination sets the boundary irradiance, and bubble-driven circulation repeatedly moves cells through the internal light field. Salinity control maintains the production environment and also defines the boundary used by the containment model.'),
      p('During operation, internal irradiance, biomass concentration, salinity and product formation can be measured together. Those measurements return to the transcriptomic, regulatory and metabolic layers, allowing the next design cycle to update the signal input, β-carotene supply and four-product allocation with reactor-specific data.'),
      links(['Return to Transcriptomics','/transcriptomics'], ['See the containment boundary','/safety-and-security']),
    ),
  ],
};
