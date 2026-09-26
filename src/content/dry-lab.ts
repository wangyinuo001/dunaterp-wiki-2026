import type { WikiPage, WikiSection } from '../site-data';
import type { ContentBlock } from './types';
import tables from './dry-lab-tables.json';

const p = (text: string): ContentBlock => ({ kind: 'paragraph', text });
const h = (text: string): ContentBlock => ({ kind: 'heading', text });
const eq = (label: string, text: string): ContentBlock => ({ kind: 'equation', label, text });
const code = (label: string, text: string): ContentBlock => ({ kind: 'code', label, text });
const fig = (name: string, alt: string, caption: string): ContentBlock => ({ kind: 'figure', src: `/figures/dry-lab/${name}.png`, alt, caption });
const table = (id: keyof typeof tables, caption: string, collapsed = false): ContentBlock => ({ kind: 'table', caption, ...tables[id], collapsed });
const customTable = (caption: string, columns: string[], rows: string[][]): ContentBlock => ({ kind: 'table', caption, columns, rows });
const links = (...entries: [string, string][]): ContentBlock => ({ kind: 'links', links: entries.map(([label, href]) => ({ label, href })) });
const section = (title: string, ...blocks: ContentBlock[]): WikiSection => ({ title, body: '', blocks });

export const dryLabNavigation = [
  ['Transcriptomics', '/transcriptomics'],
  ['Metabolomics', '/metabolomics'],
  ['Protein', '/protein'],
  ['Mathematical Modeling', '/model'],
  ['Hardware', '/hardware'],
] as const;

export const transcriptomics: WikiPage = {
  title: 'Transcriptomics', eyebrow: 'Dry Lab / Transcriptomics', status: 'team-draft',
  intro: 'LCYB was selected from its position at the lycopene-to-β-carotene branch. Public light-intensity data then show how carotenoid-pathway transcripts respond and rank transcription-factor homologs by their expression association with that pathway.',
  sections: [
    section('Data and comparison design',
      p('The project’s LCYB modeling target comes from pathway structure. GSE120965 provides published light-intensity expression evidence, while project-strain validation forms a separate experimental evidence layer.'),
      p('GSE120965 contains three light intensities—150, 600 and 1500 µmol photons m⁻² s⁻¹—with three biological replicates per condition. GEO provides Readcount and FPKM matrices together with a unigene FASTA file. FPKM values from all nine samples were used to explore light responses and expression patterns; the FASTA sequences were used for pathway and transcription-factor annotation. Readcounts were used for the published 600/150 comparison and for the nine-sample DESeq fit and variance-stabilizing transformation used in coexpression analysis.'),
      links(['GSE120965 · expression matrices and sequences', 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE120965']),
      customTable('Light-intensity experiment', ['PPFD (µmol photons m⁻² s⁻¹)', 'Samples', 'Biological replicates', 'Condition'], [
        ['150','LL1, LL2, LL3','3','low'], ['600','ML1, ML2, ML3','3','medium'], ['1500','HL1, HL2, HL3','3','high'],
      ]),
      p('The three-condition analysis compares 600/150, 1500/150 and 1500/600. The comparison with the paper uses LL1–LL3 and ML1–ML3 only. In each label, the first condition is compared with the second. Count-based fold changes and differences in mean log expression retain the definitions of their respective statistical models.'),
    ),
    section('Expression filtering and sample structure',
      p('The original matrix contains 76,875 expression features. Keeping features with FPKM ≥ 1 in at least three samples leaves 36,411 features. This retains transcripts expressed mainly in one light-intensity group while reducing the contribution of consistently near-zero features.'),
      p('For sample-scale estimation, 0.5 was added to FPKM to give finite logarithms at zero. The geometric mean of each feature across nine samples defines a reference; the median ratio of a sample to that reference defines its scale factor. The pseudocount 0.5 is used only for estimating the scale factor. Normalized FPKM is the original FPKM divided by that factor.'),
      eq('Sample-scale correction', String.raw`\begin{aligned}G_g&=\exp\!\left(\frac{1}{9}\sum_j\ln(F_{gj}+0.5)\right)\\s_j&=\operatorname{median}_g\!\left(\frac{F_{gj}+0.5}{G_g}\right)\\x_{gj}&=\log_2\!\left(\frac{F_{gj}}{s_j}+1\right)\end{aligned}`),
      p('Here F_gj is FPKM for feature g in sample j, s_j is the sample-scale factor, and x_gj is the value used for exploratory tests and plots. This adds a sample-composition correction to the uploaded FPKM before modeling log-expression variance.'),
      customTable('Sample-scale factors', ['Sample', 'Factor'], [['LL1','1.0712'],['LL2','1.0566'],['LL3','1.0034'],['ML1','1.0658'],['ML2','1.1239'],['ML3','1.0694'],['HL1','0.9310'],['HL2','0.8982'],['HL3','0.9307']]),
      p('The factors range from 0.8982 to 1.1239. Expression distributions were inspected after normalization. PCA used the 5,000 retained features with the highest variance, centered each feature, and preserved the differences in feature variance. PC1 and PC2 explain 35.45% and 14.96% of variance, respectively.'),
      fig('06_expression_qc','Sample-scale factors, normalized expression distributions and PCA for nine biological samples.', 'Figure 1. A: median-of-ratios scale factors; the dashed line marks 1. B: distributions of log₂(FPKMₙ + 1), with quartile boxes, median lines and whiskers extending to observations within 1.5 interquartile ranges. C: PCA, with one point per biological sample. PPFD is in µmol photons m⁻² s⁻¹. The axis percentages give explained variance.'),
      p('The sample structure supports condition-wise comparisons. Variation among replicates enters the downstream variance estimate.'),
      code('Expression filtering and transformation', 'expressed = (fpkm >= 1.0).sum(axis=1) >= 3\nfiltered = fpkm.loc[expressed]\nsize_factors = pd.Series(\n    median_of_ratios_factors(filtered.to_numpy() + 0.5),\n    index=filtered.columns,\n)\nlog_matrix = np.log2(filtered.div(size_factors, axis=1) + 1.0)'),
    ),
    section('Differential expression',
      p('Each exploratory comparison uses two groups of three samples. For every feature, the difference between mean log expression, the within-group residual sum of squares and a residual variance with four degrees of freedom were calculated. Empirical Bayes estimation supplies a prior variance s₀² and prior degrees of freedom d₀, shrinking individual variances toward this prior.'),
      eq('Moderated t statistic', String.raw`\begin{aligned}\Delta_g&=\bar{x}_{g,a}-\bar{x}_{g,b}\\s^2_{g,\mathrm{post}}&=\frac{d_0s_0^2+4s_g^2}{d_0+4}\\t_g&=\frac{\Delta_g}{\sqrt{s^2_{g,\mathrm{post}}(1/3+1/3)}}\end{aligned}`),
      p('Two-sided P values use a t distribution with d₀ + 4 degrees of freedom. Priors were fitted separately for the three comparisons, giving d₀ ≈ 1.4817, 1.4344 and 1.4592. Benjamini–Hochberg adjustment was applied within each comparison across all tested features. The exploratory code column log2FC stores Δ_g, the difference in mean log₂(normalized FPKM + 1); the +1 transformation affects fold interpretation at low expression.'),
      customTable('Exploratory differential-expression counts: FDR < 0.05 and |Δ_g| ≥ 1', ['Comparison', 'Upregulated', 'Downregulated', 'Total'], [['600/150','1,990','1,022','3,012'],['1500/150','2,088','1,789','3,877'],['1500/600','4,384','5,183','9,567']]),
      p('The union contains 11,583 features. The counting unit is a Trinity expression feature; several transcripts can correspond to one gene. Individual expression patterns and functional annotations provide the basis for subsequent candidate ranking.'),
      fig('07_differential_expression','Three volcano plots with identical axes for the light-intensity comparisons.', 'Figure 2. Each point is a tested feature. The x-axis is the difference in mean log expression; the y-axis is −log₁₀(FDR). Rose and blue mark upregulated and downregulated features meeting both thresholds. Horizontal and vertical lines indicate FDR = 0.05 and Δ = ±1. CRTISO has Δ = +4.0265 and FDR = 0.000997 in 1500/600.'),
      p('The annotated CRTISO transcript increases in the high-light group, connecting the global response to a specific carotenoid-pathway transcript.'),
    ),
    section('Light-response modules',
      p('For the 11,583 differential features, mean log expression was calculated in each of the three conditions and standardized within each feature. The population standard deviation (ddof = 0) was used. Features with nonzero between-condition standard deviation entered shape clustering.'),
      eq('Within-feature standardization', String.raw`\begin{aligned}\mathbf a_g&=(\bar x_{g,150},\bar x_{g,600},\bar x_{g,1500})\\z_{g,c}&=\frac{a_{g,c}-\operatorname{mean}(\mathbf a_g)}{\operatorname{sd}(\mathbf a_g)}\end{aligned}`),
      p('K-means compared k = 4–8 using k-means++ initialization, Euclidean distance, 40 initializations and at most 200 iterations per fit. Silhouette scores were calculated on the same 3,000-feature subsample. The random seed for model selection and bootstrap analyses was 20260826. The scores for k = 4, 5, 6, 7 and 8 were 0.5273, 0.5489, 0.5303, 0.5160 and 0.5162. Module labels were reordered by centroid shape after selecting k = 5.'),
      fig('08_response_modules','Five light-response module profiles and silhouette scores for choosing k.', 'Figure 3. A–E: average member Z-scores, with shaded 10th–90th percentiles of the member distribution. The x-axis contains three measured light intensities; lines connect these discrete conditions. F: silhouette scores across the tested k values.'),
      customTable('Selected response modules', ['Module', 'Features', 'Centroid expression order'], [['M1','991','150 > 600 > 1500'],['M2','1,578','600 > 1500 > 150'],['M3','4,023','600 > 150 > 1500'],['M4','1,708','1500 > 600 > 150'],['M5','3,283','1500 > 150 > 600']]),
      p('Module annotation used Bardawil reference proteins. All uploaded transcripts were aligned with DIAMOND blastx and filtered at E-value ≤ 10⁻⁵, identity ≥ 30% and query coverage ≥ 30%. Query coverage was 100 × (|qend − qstart| + 1) / qlen on either strand. In total, 31,869 transcripts matched 10,752 reference proteins; 14,676 alignments were on the reverse strand. The expressed enrichment background contained 9,906 reference proteins.'),
      p('Reference proteins were the enrichment counting unit. Each protein was assigned to the module of its most highly expressed responsive transcript. Hypergeometric tests were performed for 436 Pfam families having at least five background members, with all 436 P values adjusted together within each module and P = 1 for zero overlap. Of 2,180 module–family tests, 33 reached FDR < 0.05: 2, 1, 27, 2 and 1 in M1–M5. These modules describe response shapes; pathway annotation identifies the enzymes represented among those responses.'),
      links(['DIAMOND alignment fields','https://github.com/bbuchfink/diamond/wiki/3.-Command-line-options'],['Benjamini–Hochberg adjustment','https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.false_discovery_control.html']),
    ),
    section('Carotenoid-pathway annotation',
      p('Trinity identifiers were annotated through protein homology. Primary-hit names identified carotenoid-pathway enzymes, and differential expression retained light-responsive transcripts. Li et al. (2019) report the 600/150 comparison from the same dataset and provide the pathway list used for comparison.'),
      links(['Li et al., 2019 · Phycological Research','https://doi.org/10.1111/pre.12379'],['Swiss-Prot release 2018_08','https://ftp.uniprot.org/pub/databases/uniprot/previous_releases/release-2018_08/knowledgebase/'],['UniSave entry history','https://www.uniprot.org/help/entry_history']),
      p('Reference proteins combined the official Swiss-Prot 2018_08 archive with historical Dunaliella entries restored through UniSave. The paper submission date, 12 October 2018, defined the time boundary. A search by genus taxid 3044 and creation date recovered 480 early entries still retrievable today; each was restored to its last available version on or before 11 October 2018, retaining historical names and sequences. The archive was checked against the publisher’s MD5, and historical records retained version identifiers, original text and SHA-256 checksums. Deleted UniProt records and the paper’s original Nr database remain outside this reconstructed reference set.'),
      p('All 76,875 uploaded Trinity sequences entered DIAMOND 2.2.5 blastx. Each database used sensitive mode, E-value ≤ 10⁻⁵, identity ≥ 20%, reference coverage ≥ 15% and at most ten targets per query. Hits were merged and a primary hit selected by descending bit score, then E-value and reference identifier. Primary-hit names identified PSY, PDS, ZDS, LCYB, CBR, carotene globule protein and D27. Both historical names “phytoene desaturase” and “15-cis-phytoene desaturase” were classified as PDS. Pathway annotations from weaker hits were retained in the annotation audit.'),
      p('These broad thresholds admit partial and more distant homologs for comparison with the published pathway list. TF annotation uses E-value < 10⁻⁵ and identity ≥ 30%, with reference and transcript coverage recorded for each match.'),
      h('Count-based pathway selection'),
      p('The paper and GEO sample-processing record specify DESeq 1.10.1, Benjamini–Hochberg adjustment and padj < 0.05. The uploaded Readcounts were reanalyzed using LL1–LL3 and ML1–ML3, retaining all 76,875 features. The six columns contain 135,644 fractional counts. R round was used to round to the nearest integer, with ties to even and a maximum change of 0.5 per count. This is an explicit recalculation setting because the publication does not describe fractional-count conversion.'),
      links(['GEO sample-processing record','https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM3423032']),
      p('DESeq estimateSizeFactors supplied count-scale factors; estimateDispersions used the version defaults pooled, maximum and parametric; nbinomTest compared 600/150. The analysis yielded 9,375 differential features at padj < 0.05, compared with 9,374 reported in the paper. DESeq was fixed to archived version 1.10.1. The publication’s original database version, dispersion options and Table 2 inclusion rule require the original analysis records for exact matching.'),
      p('The six-sample count comparison and the nine-sample FPKM exploration use their own inputs, scale factors and variance models.'),
    ),
    section('Pathway results and published genes',
      p('The paper’s Table 2 lists 16 carotenoid-related Trinity transcripts for the 600/150 comparison. Historical protein annotation and the count-based DESeq analysis recover all 16. The table below follows those published identifiers in their original order.'),
      eq('Count-based fold change', String.raw`\mathrm{fold}_{g,600/150}=\frac{\operatorname{mean}_{j\in ML}(C_{gj}/s_j^{\mathrm{count}})}{\operatorname{mean}_{j\in LL}(C_{gj}/s_j^{\mathrm{count}})}`),
      p('C denotes rounded counts. Size factors use features positive in all six samples. Fold changes and adjusted P values come from the same DESeq fit. All 16 published identifiers reach padj < 0.05 with matching directions. Pearson r between the two log₂-fold columns is 0.999996; median and maximum absolute differences are 0.001946 and 0.010124. For LCYB Cluster-5009.34218, recalculated fold = 1.46387 and padj = 1.12742 × 10⁻¹⁰, compared with published values of 1.46 and 1.13 × 10⁻¹⁰.'),
      fig('01_gene_recovery','Published versus recalculated fold changes for the 16 shared Trinity identifiers.', 'Figure 4. A: published (open) and recalculated (filled) log₂-fold changes by identifier. Labels abbreviate the Cluster-5009. prefix. B: the same values plotted against each other, with y = x as a dashed reference. CGP denotes carotene globule protein. The displayed identifiers are the 16 shared with the published Table 2.'),
      table('RECOVERY','Published Table 2 and DESeq recalculation'),
      p('PSY, both LCYB transcripts, and the listed CBR, CGP and D27 transcripts increase in 600/150, while two PDS and one ZDS transcript decrease. Different positions in the carotenoid pathway respond in different directions.'),
      table('CANDIDATES','DESeq expression changes for the 16 published pathway transcripts',true),
      p('Trinity transcripts remain the expression-analysis unit, while protein alignment supplies functional evidence. Reference versions affect primary-hit names: historical annotation assigns CGP, CGP and PDS to Cluster-5009.18393, Cluster-5009.25866 and Cluster-5009.39420, respectively. The published-gene comparison uses the historical references and primary-hit rule described above.'),
      h('LCYB pathway role and light response'),
      p('LCYB (lycopene β-cyclase) catalyzes lycopene cyclization into the β-carotene branch, connecting the lycopene precursor pool to β-carotene and its downstream products. This pathway position makes LCYB the project’s regulatory and modeling target.'),
      p('In the GSE120965 600/150 comparison, both LCYB expression features increase significantly: Cluster-5009.34218 increases 1.46-fold (padj = 1.13 × 10⁻¹⁰), while Cluster-5009.36796 increases 3.29-fold (padj = 3.57 × 10⁻⁶). Cluster-5009.34218 follows the three-condition order 600 > 1500 > 150 and is assigned to response module M2. These results establish a significant transcriptional response of LCYB to light intensity, with its highest observed transcript level at the medium-light condition. The kinetic model carries this expression-layer response to β-carotene formation, and pigment measurements determine the product-level effect.'),
    ),
    section('Transcription-factor annotation and ranking',
      h('Pathway references and expression background'),
      p('Pathway references were assembled from PSY, PDS, ZDS, CRTISO, LCYB, LCYE and BCH annotations. Historical primary-hit annotations and enzyme-reference alignments were merged by Trinity identifier. Transcripts required usable expression data and padj < 0.05 in at least one light comparison. Thirteen references cover six enzyme classes; BCH did not meet this differential-expression criterion.'),
      customTable('Thirteen pathway references; identifiers share the Cluster-5009. prefix', ['Enzyme','Identifier suffixes'], [['CRTISO','33436'],['LCYB','34218, 36796'],['LCYE','32344'],['PDS','31297, 35653, 39420, 39826'],['PSY','23903, 45875'],['ZDS','11812, 34471, 6157']]),
      p('For this analysis, all nine Readcount columns were rounded with R round, normalized with DESeq 1.10.1 and fitted across LL, ML and HL with pooled, maximum, parametric dispersion estimation. All three pairwise tests use this nine-sample model and BH adjustment. The expression matrix uses getVarianceStabilizedData. The earlier FPKM ≥ 1 in at least three samples rule defines the expressed background; removing nonfinite and constant values leaves 36,411 transcripts. The six-sample fit remains specific to the published comparison.'),
      h('TF homologs'),
      p('All assembled transcripts were aligned against PlantTFDB Dunaliella salina proteins with DIAMOND blastx in sensitive mode, retaining targets with E-value < 10⁻⁵. Local matches required identity ≥ 30%. The strongest hit was selected by bit score, E-value and reference identifier; tied strongest hits involving several families retain all family names. This yielded 505 TF-homologous transcripts, of which 333 had usable expression data.'),
      links(['PlantTFDB reference proteins','https://planttfdb.gao-lab.org/']),
      p('Family labels describe reference-protein homology. Alignment length, identity, reference coverage and transcript coverage remain attached to each record, together with the reference CDS and protein identifiers. Multiple expressed fragments matching one protein remain separate ranked transcript features.'),
      h('Joint pathway coexpression'),
      p('The calculation follows the Mutual Rank definition and multi-reference logit aggregation described by ATTED-II. MutRank provides an example of combining coexpression retrieval with differential expression, functional annotation and domain evidence. Here, the rankings are calculated from the nine-sample expression matrix.'),
      links(['ATTED-II Mutual Rank','https://atted.jp/static/help/mr.shtml'],['ATTED-II multi-reference aggregation','https://doi.org/10.1093/pcp/pcx191'],['MutRank','https://doi.org/10.7717/peerj.10264']),
      p('Pearson correlation was calculated for every candidate–reference pair. Both directional ranks were calculated against the entire expressed background, excluding self-comparisons, with correlations ranked from highest to lowest and ties assigned average ranks. Mutual Rank is the geometric mean of the two directional ranks.'),
      eq('Mutual Rank and pathway aggregation', String.raw`\begin{aligned}MR_{ij}&=\sqrt{R_{i\to j}R_{j\to i}}\\S_i&=\sum_jw_j\ln\!\left(\frac{MR_{ij}}{N-MR_{ij}}\right)\\MR_i^*&=\frac{N}{1+\exp(-S_i)}\end{aligned}`),
      p('N is the expressed-background size. Each enzyme class receives equal total weight, split equally among its reference transcripts. Smaller integrated MR indicates a stronger same-direction association with the reference set. Candidates are sorted by increasing integrated MR, with exact ties broken by identifier. Family labels do not enter the score. Inverse integrated MR uses the opposite correlation order and is reported separately. Correlation and MR are dimensionless. Coexpression supplies candidate priority; binding and functional evidence determine promoter interaction and regulatory direction.'),
      h('Ranked transcripts'),
      p('C2H2 homolog Cluster-5009.32526 ranks first (integrated MR 9996.9), C2H2 homolog Cluster-5009.43049 second (10299.5), and NF-YC homolog Cluster-5009.41188 third (10828.8). Across nine leave-one-sample-out recalculations, their rank ranges are 1–2, 1–4 and 1–4. The first two match the same reference protein with reference coverage of 11.55% and 7.87%, respectively.'),
      p('The pathway enzymes have different light-response profiles. Correlations of the leading candidates with individual references include both positive and negative values. The integrated MR summarizes association with the whole reference set; sequence coverage accompanies the expression ranking.'),
      table('TF_RANKING','All 333 TF-homologous transcripts, ordered by integrated MR',true),
      p('Inverse rank is calculated from reverse correlation ranks using the same MR and weighting rules. Lower inverse ranks indicate stronger opposite-direction coexpression. Reference coverage is the percentage of the reference protein spanned by the local alignment.'),
      p('The highest joint ranks belong to C2H2 and NF-YC homologous fragments. Their ranks prioritize follow-up, while promoter binding and regulatory direction remain to be measured. The full annotation table retains every reference-family label alongside its alignment coverage.'),
    ),
  ],
};

export const modeling: WikiPage = {
  title: 'Mathematical Modeling', eyebrow: 'Dry Lab / Model', status: 'team-draft',
  intro: 'The model defines how a regulatory factor can alter LCYB transcription and propagate that change to β-carotene. It is a five-state, dimensional mechanism whose numerical output is generated from explicit project measurements.',
  sections: [
    section('Modeling question',
      p('LCYB catalyzes the conversion of lycopene to the β-carotene branch. The modeling question is therefore how a change in a regulatory factor reaches LCYB transcription, active enzyme and the β-carotene pool.'),
      p('The core model stops at β-carotene. Product-specific downstream kinetics remain in the metabolomics workstream, where their own enzyme parameters and measurements can be used.'),
      fig('14_regulatory_model','Five-state regulatory model linking an active regulatory factor, promoter occupancy, LCYB transcript, active LCYB and beta-carotene.', 'Figure 1. The five dynamic states are active regulatory factor T, LCYB transcript m, active LCYB E, lycopene L and β-carotene B. Promoter occupancy θ and the two reaction rates are algebraic functions. Colors distinguish regulatory, expression and metabolic layers.'),
    ),
    section('Promoter occupancy and transcription',
      p('A one-site equilibrium model connects active regulatory-factor concentration T and the dissociation constant Kd to promoter occupancy θ. Transcription is the occupancy-weighted average of the unbound and bound promoter rates.'),
      links(['Bintu et al. · promoter occupancy models','https://pubmed.ncbi.nlm.nih.gov/15797194/'],['Published D. bardawil lcyb promoter · KX218393','https://pubmed.ncbi.nlm.nih.gov/27657551/']),
      eq('Promoter input', String.raw`\theta=\frac{T}{K_d+T},\qquad u_{\mathrm{LCYB}}=u_{\mathrm{unbound}}(1-\theta)+u_{\mathrm{bound}}\theta`),
      p('When u_bound is larger than u_unbound, binding activates LCYB transcription; the reverse ordering represents repression. Regulator production, degradation and growth dilution determine T, while Kd describes binding affinity.'),
    ),
    section('Five differential equations',
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
      p('Every right-hand side has the unit of its state per day. The caller supplies every biological parameter and initial value; the solver validates finiteness, nonnegativity and positive binding or Michaelis constants.'),
    ),
    section('Evidence and parameter status',
      p('Lan et al. measured LCYB overexpression, LCYB light responses and pigment content in D. salina. Each observation is retained with its original experimental comparison as evidence for the LCYB-to-β-carotene link; complete regulatory calibration uses a matched project time course.'),
      p('Mialoundama et al. measured recombinant pepper LCYB activity and an apparent lycopene Km. These values can define a cross-species prior range for q_LCYB and Km,LCYB. Project-specific regulator concentration, Kd, bound and unbound transcription rates, degradation rates, substrate supply and β-carotene removal remain model inputs to be measured.'),
      links(['Lan et al., 2022','https://doi.org/10.4014/jmb.2208.08044'],['Mialoundama et al., 2010','https://doi.org/10.1104/pp.110.155440']),
      customTable('Parameter evidence and units', ['Parameter','Meaning','Unit','Source'], [
        ['sT','Regulatory-factor production','µmol L⁻¹ d⁻¹','Project measurement'],
        ['δT','Regulatory-factor degradation','d⁻¹','Decay experiment or half-life'],
        ['Kd','Regulator–promoter dissociation constant','µmol L⁻¹','Binding experiment'],
        ['uunbound, ubound','Unbound and bound promoter transcription','nmol transcript L⁻¹ d⁻¹','Promoter reporter experiment'],
        ['δm','LCYB RNA degradation','d⁻¹','RNA half-life'],
        ['ktl','Active-enzyme formation per transcript','mg nmol⁻¹ d⁻¹','Protein abundance and translation rate'],
        ['δE','Active-LCYB degradation','d⁻¹','Protein half-life'],
        ['vsupply','Lycopene supply','µmol L⁻¹ d⁻¹','Metabolite time course or flux estimate'],
        ['qLCYB','Maximum rate per active LCYB','µmol mg⁻¹ d⁻¹','Dunaliella assay; plant LCYB prior range'],
        ['Km,LCYB','LCYB Michaelis constant for lycopene','µmol L⁻¹','Enzyme assay'],
        ['kL, kB','First-order pool losses','d⁻¹','Metabolite time course'],
        ['Vout, Km,out','β-carotene outflow capacity and constant','µmol L⁻¹ d⁻¹; µmol L⁻¹','Metabolomics workstream'],
        ['μ','Growth dilution','d⁻¹','Growth curve'],
      ]),
    ),
    section('What the model establishes',
      p('The equations specify the complete causal route requested for design: regulator production and stability change T; T and Kd determine promoter occupancy; occupancy changes LCYB transcription; translation changes active LCYB; LCYB then changes the lycopene-to-β-carotene flux.'),
      eq('Steady-state regulatory chain', String.raw`T^*=\frac{s_T}{\delta_T+\mu},\quad m^*=\frac{u_{\mathrm{LCYB}}(T^*)}{\delta_m+\mu},\quad E^*=\frac{k_{\mathrm{tl}}m^*}{\delta_E+\mu}`),
      p('With a stated parameter set, the implementation returns conditional trajectories for T, m, E, L and B and compares defined regulator variants. A matched project time course supplies the parameter set for an absolute project-yield prediction.'),
      fig('15_regulatory_response','Promoter occupancy and steady-state transfer from regulatory input to LCYB transcript and active enzyme.', 'Figure 2. A: promoter occupancy as a function of T/Kd; occupancy is 50% when T = Kd. B: the bound-to-unbound transcription ratio and T/Kd jointly determine the steady-state expression transfer. Color gives m*/m*unbound = E*/E*unbound; values above 1 represent activation and values below 1 represent repression. Both axes are parameter ratios fixed by the equations, while absolute trajectories use the measured parameters listed above.'),
      h('Quantitative findings'),
      p('Promoter occupancy rises from 10% to 90% as T/Kd rises from 1/9 to 9, an 81-fold span in effective regulator concentration relative to binding affinity. Half occupancy occurs at T = Kd. Writing r = u_bound/u_unbound, the steady-state LCYB transcript and active-enzyme fold relative to an unbound promoter is 1 + (r − 1)θ. At half occupancy this becomes (1 + r)/2: 1.50-fold for r = 2, 2.50-fold for r = 4, and 0.75-fold for r = 0.5. At T = 10Kd, where occupancy is 90.9%, the corresponding folds are 1.91, 3.73 and 0.55.'),
      p('The largest occupancy response occurs around T ≈ Kd. In the saturated T ≫ Kd regime, expression approaches the ceiling or floor set by r. With lycopene and enzyme-kinetic parameters held fixed, the instantaneous LCYB flux changes in the same proportion as active LCYB; the absolute β-carotene pool additionally depends on substrate supply, Michaelis constants, downstream outflow and loss.'),
      eq('Core implementation', String.raw`\begin{aligned}
\theta&=\frac{T}{K_d+T}\\
u_{\mathrm{LCYB}}&=u_{\mathrm{unbound}}(1-\theta)+u_{\mathrm{bound}}\theta\\
v_{\mathrm{LCYB}}&=q_{\mathrm{LCYB}}E\frac{L}{K_{m,\mathrm{LCYB}}+L}\\[4pt]
\frac{dT}{dt}&=s_T-(\delta_T+\mu)T\\
\frac{dm}{dt}&=u_{\mathrm{LCYB}}-(\delta_m+\mu)m\\
\frac{dE}{dt}&=k_{\mathrm{tl}}m-(\delta_E+\mu)E\\
\frac{dL}{dt}&=v_{\mathrm{supply}}-v_{\mathrm{LCYB}}-(k_L+\mu)L\\
\frac{dB}{dt}&=v_{\mathrm{LCYB}}-v_{\mathrm{out}}-(k_B+\mu)B
\end{aligned}`),
    ),
    section('Interface with metabolomics',
      p('The downstream metabolomics model begins at the β-carotene input flux. The interface therefore passes the LCYB rate directly to that model while leaving its product-specific equations and parameters unchanged.'),
      eq('Shared boundary', String.raw`v_{\mathrm{in,BCAR}}(t)=v_{\mathrm{LCYB}}(t)`),
      p('Numerical coupling uses the downstream Vmax, Km, loss constants and initial concentrations from that workstream. The shared boundary assigns each parameter to the measurements that define it.'),
    ),
  ],
};

export const dryLabIndex: WikiPage = {
  title: 'Dry Lab', eyebrow: 'Project / Dry Lab', intro: '', status: 'team-draft',
  sections: [section('Chapters', links(...dryLabNavigation.map(([label, href]): [string,string] => [label,href])))],
};

export const emptyDryLabPage = (title: string): WikiPage => ({ title, eyebrow: `Dry Lab / ${title}`, intro: '', status: 'structure-only', sections: [] });

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

export const hardware: WikiPage = {
  title: 'Hardware',
  eyebrow: 'Dry Lab / Hardware',
  status: 'team-draft',
  intro:
    'We developed a flat-panel airlift photobioreactor with symmetric double-sided illumination, together with a reduced-order engineering model to explore how reactor design and operating conditions may influence cultivation and production.',
  sections: [
    section(
      'Photobioreactor Design for DunaTerp',
      p(
        'The performance of a photosynthetic production system depends not only on the engineered cells, but also on the physical environment in which they grow. For Dunaliella salina, light delivery, biomass self-shading, mixing, cultivation strategy, and energy consumption are closely connected.',
      ),
      p(
        'Our hardware modeling consists of five connected components: optical transport, cultivation dynamics, two-stage optimization, light–dark cycling, and scale-up with energy consumption.',
      ),
    ),

    section(
      'Optical Transport',
      p(
        'As biomass accumulates, cells absorb and scatter incident light. This creates an uneven light environment inside the reactor: regions near the illuminated surfaces receive stronger light, while deeper regions can become increasingly light-limited. To describe this effect, we modeled light propagation across the flat-panel reactor under symmetric illumination from both transparent faces.',
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
\end{bmatrix}\\[4pt]
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
          ['I_F', 'Incident irradiance at the front face', 'µmol photons m⁻² s⁻¹'],
          ['I_B', 'Incident irradiance at the rear face', 'µmol photons m⁻² s⁻¹'],
          [
            'I₀',
            'Per-face incident irradiance under symmetric double-sided illumination',
            'µmol photons m⁻² s⁻¹',
          ],
          ['X', 'Biomass concentration', 'g L⁻¹'],
          ['k_a', 'Biomass-specific absorption coefficient', 'm² kg⁻¹'],
          ['k_s', 'Biomass-specific scattering coefficient', 'm² kg⁻¹'],
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
        'Figure 1. Simulated optical field under symmetric double-sided illumination. Increasing biomass concentration strengthens self-shading and reduces irradiance in the central region of the reactor.',
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
\end{bmatrix}\\[5pt]
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
          ['μ_max', 'Maximum specific growth rate', 'd⁻¹'],
          ['k_d', 'Biomass decay / maintenance-loss constant', 'd⁻¹'],
          ['Y_X/N', 'Biomass yield on limiting nutrient', 'g biomass g⁻¹ nutrient'],
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
          ['k_p', 'Product degradation constant', 'd⁻¹'],
          ['K_N', 'Nutrient half-saturation parameter', 'g L⁻¹'],
          ['K_I', 'Light-saturation parameter', 'µmol photons m⁻² s⁻¹'],
          ['K_inh', 'Photoinhibition parameter', 'µmol photons m⁻² s⁻¹'],
          ['I_opt', 'Predicted optimum irradiance for growth', 'µmol photons m⁻² s⁻¹'],
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
\end{cases}\\[5pt]
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
            'I_g',
            'Per-face irradiance during the growth stage',
            'µmol photons m⁻² s⁻¹',
          ],
          [
            'I_p',
            'Per-face irradiance during the production stage',
            'µmol photons m⁻² s⁻¹',
          ],
          [
            'β_g',
            'Non-growth-associated production coefficient during the growth stage',
            'mg product g⁻¹ biomass d⁻¹',
          ],
          [
            'β_p',
            'Non-growth-associated production coefficient during the production stage',
            'mg product g⁻¹ biomass d⁻¹',
          ],
          ['t_s', 'Switching time from growth to production stage', 'd'],
          ['T', 'Total cultivation time', 'd'],
          ['Q_P', 'Volumetric product productivity', 'mg L⁻¹ d⁻¹'],
          ['P(T)', 'Final product concentration', 'mg L⁻¹'],
        ],
      ),

      p(
        'We explored different combinations of growth-stage illumination and switching time to examine their effects on predicted productivity.',
      ),

      hardwareFig(
        'C_productivity_heatmap_double_sided',
        'Heat map of predicted product productivity across growth-stage irradiance and switching time under double-sided illumination.',
        'Figure 2. Predicted productivity across different combinations of growth-stage per-face irradiance and switching time.',
      ),

      p(
        'The heat map shows that productivity depends on the combined effect of illumination and cultivation timing rather than on either parameter alone. To make the overall design space easier to understand, we also visualized the same response as a three-dimensional surface.',
      ),

      hardwareFig(
        'D_3D_product_surface_double_sided',
        'Three-dimensional response surface showing predicted productivity as a function of growth-stage irradiance and switching time.',
        'Figure 3. Three-dimensional representation of the predicted productivity landscape.',
      ),

      p(
        'Together, these simulations allow cultivation conditions to be treated as an engineering design space instead of selecting operating parameters independently.',
      ),
    ),

    section(
      'Light–Dark Cycling',
      p(
        'Cells inside an airlift photobioreactor continuously move through different regions of the reactor. Gas-driven circulation can carry cells from bright regions near illuminated surfaces into darker internal regions and then back again. As a result, individual cells experience changing light conditions rather than a constant irradiance.',
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
          ['t_cycle', 'Time for one representative circulation cycle', 's'],
          ['L_loop', 'Representative circulation-path length', 'm'],
          ['Ū', 'Mean liquid velocity', 'm s⁻¹'],
          ['φ_L', 'Fraction of the circulation cycle spent in bright regions', 'dimensionless'],
          ['t_L', 'Residence time in the bright region per cycle', 's'],
          ['t_D', 'Residence time in the dark region per cycle', 's'],
          ['I_L', 'Representative irradiance in the bright region', 'µmol photons m⁻² s⁻¹'],
          ['I_D', 'Representative irradiance in the dark region', 'µmol photons m⁻² s⁻¹'],
          ['f_I,cycle', 'Effective light-response factor over one circulation cycle', 'dimensionless'],
          ['μ_cycle', 'Effective specific growth rate under light–dark cycling', 'd⁻¹'],
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
          ['V_m', 'Working volume of one flat-panel module', 'm³'],
          ['A', 'Large-face area of one module', 'm²'],
          ['L', 'Panel thickness / optical path length', 'm'],
          ['A_ill', 'Total illuminated area of one module', 'm²'],
          ['V_T', 'Target total working volume', 'm³'],
          ['n', 'Required number of modules', 'dimensionless'],
          ['Q_g,T', 'Total gas volumetric flow after numbering-up', 'm³ s⁻¹'],
          ['Q_g,m', 'Gas volumetric flow for one module', 'm³ s⁻¹'],
          ['E_LED', 'LED energy consumption', 'model-dependent energy unit'],
          ['η_LED', 'LED photon efficacy', 'µmol photons J⁻¹'],
          ['η_R', 'Downstream recovery fraction', 'dimensionless'],
          ['M_annual', 'Annual recovered product mass', 'kg year⁻¹'],
          ['t_turn', 'Turnaround time between cultivation batches', 'd'],
          ['p', 'Product selling price', 'USD kg⁻¹'],
          ['Π', 'Annual operating profit', 'USD year⁻¹'],
          ['OPEX', 'Annual operating expenditure', 'USD year⁻¹'],
          ['CAPEX', 'Capital expenditure', 'USD'],
          ['ROI', 'Return on investment', 'year⁻¹'],
          ['T_payback', 'Simple payback time', 'year'],
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
        'The model is therefore primarily used to explore engineering relationships, compare operating scenarios, identify influential parameters, and visualize trade-offs between light, growth, productivity, and energy consumption. Future experimental measurements could be used to further calibrate and validate the model.',
      ),
    ),
  ],
};