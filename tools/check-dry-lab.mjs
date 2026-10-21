import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { pages, navigation, pageOrder } = await server.ssrLoadModule('/src/site-data.ts');
  const { ArticleBlocks } = await server.ssrLoadModule('/src/ArticleBlocks.tsx');
  const items = navigation.find(g => g.label === 'Dry Lab').items;
  assert.deepEqual(items, [
    ['Overview', '/dry-lab'],
    ['Transcriptomics', '/transcriptomics'],
    ['Mathematical Modeling', '/model'],
    ['Metabolomics', '/metabolomics'],
    ['Protein', '/protein'],
    ['Safety', '/safety-and-security'],
    ['Hardware Modeling', '/hardware'],
    ['Hardware Design', '/hardware-design'],
  ]);
  assert.equal(new Set(pageOrder).size, pageOrder.length);
  for (const [, href] of items) assert(pages[href.slice(1)], `Missing route ${href}`);
  for (const slug of ['metabolomics','protein','hardware','hardware-design','safety-and-security']) {
    assert(pages[slug].sections.length > 0, `Missing content: ${slug}`);
    assert(pages[slug].intro, `Missing introduction: ${slug}`);
  }
  const transcriptomicsText = JSON.stringify(pages.transcriptomics);
  assert(!/K-means|module M[1-5]|moderated t|peak_at_600|trough_at_600|FPKM ≥ 1|TF_RANKING|integrated MR/i.test(transcriptomicsText), 'Retired exploratory statistics remain in the active transcriptomics page');
  assert(transcriptomicsText.includes('168 h') && transcriptomicsText.includes('three biological replicates each'), 'Biological sample design must be explicit');
  assert(transcriptomicsText.includes('76,875 rows') && transcriptomicsText.includes('20 transcript features'), 'Input assembly and pathway annotation scope must be explicit');
  assert(transcriptomicsText.includes('DIAMOND blastx') && transcriptomicsText.includes('subject coverage >= 15%') && transcriptomicsText.includes('reciprocal-best-hit'), 'Transcript annotation algorithm must be explicit');
  assert(transcriptomicsText.includes('DESeq 1.10.1') && transcriptomicsText.includes('median-of-ratios') && transcriptomicsText.includes('nbinomTest') && transcriptomicsText.includes('28.97%'), 'Count-based replicate-aware model and count conversion must be explicit');
  assert(transcriptomicsText.includes('600 → 1500') && transcriptomicsText.includes('Benjamini–Hochberg') && transcriptomicsText.includes('76,875 deposited transcript rows'), 'All three planned contrasts and multiple-testing procedure must be explicit');
  assert(transcriptomicsText.includes('transcript abundance—not enzyme activity or β-carotene flux') && transcriptomicsText.includes('necessary validation'), 'Transcriptomics conclusion must distinguish expression evidence from flux and state the validation need');
  assert(!transcriptomicsText.includes('TF2146'), 'TF2146 should not be introduced in the transcriptomics section');
  const pathwaySection = pages.transcriptomics.sections.find(section => section.title === 'THE REACTIONS');
  assert(pathwaySection?.blocks.some(block => block.kind === 'figure' && block.src.endsWith('carotenoid-route.svg')), 'Biological pathway map is missing');
  const workflowSection = pages.transcriptomics.sections.find(section => section.title === 'THE DATASET');
  assert(workflowSection?.blocks.some(block => block.kind === 'figure' && block.src.endsWith('transcriptomics-workflow.svg')), 'Transcriptomics workflow figure is missing');
  const responseSection = pages.transcriptomics.sections.find(section => section.title === 'TRANSCRIPT-LEVEL RESPONSE');
  assert(responseSection?.blocks.some(block => block.kind === 'figure' && block.src.endsWith('transcriptomics-sample-expression.svg')), 'Replicate-level expression plot is missing');
  assert(responseSection?.blocks.some(block => block.kind === 'figure' && block.src.endsWith('transcriptomics-deseq-volcano.svg')), 'Genome-wide DESeq contrast plots are missing');
  assert(responseSection?.blocks.some(block => block.kind === 'figure' && block.src.endsWith('transcriptomics-pathway-effects.svg')), 'Pathway-ordered transcript effect plot is missing');
  const examplesTable = responseSection?.blocks.find(block => block.kind === 'table');
  assert(examplesTable && examplesTable.rows.length === 6, 'The selected examples should include pathway steps and both LCYB transcript copies');
  assert(examplesTable.rows.some(row => row[0].includes('Cluster-5009.34218 · LCYB')) && examplesTable.rows.some(row => row[0].includes('Cluster-5009.36796 · LCYB')), 'Both LCYB copies must remain distinct');
  let figures = 0;
  let tables = 0;
  for (const slug of ['dry-lab','transcriptomics','model','protein','safety-and-security']) {
    const page = pages[slug];
    assert(!/[\u3400-\u9fff]/u.test(JSON.stringify(page)), `Non-English content: ${slug}`);
    for (const section of page.sections) {
      for (const block of section.blocks ?? []) {
        const figureBlocks = block.kind === 'figure' ? [block] : block.kind === 'figure-row' || block.kind === 'figure-grid' ? block.figures : [];
        for (const figure of figureBlocks) {
          figures++;
          assert(fs.existsSync(path.join('public', figure.src)), `Missing ${figure.src}`);
          assert(figure.alt && figure.caption);
        }
        if (block.kind === 'table') {
          tables++;
          assert(block.rows.every(row => row.length === block.columns.length), block.caption);
        }
        if (block.kind === 'chapter-grid') for (const item of block.items) assert(pages[item.href.split('#')[0].slice(1)], item.href);
        if (block.kind === 'links') for (const link of block.links) {
          if (link.href.startsWith('/')) assert(pages[link.href.slice(1)], link.href);
          else assert.equal(new URL(link.href).protocol, 'https:');
        }
      }
      const html = renderToStaticMarkup(React.createElement(MemoryRouter, null,
        React.createElement(ArticleBlocks, { blocks: section.blocks ?? [] })));
      assert(!html.includes('undefined'), section.title);
      assert(!html.includes('src="/figures/'), 'Figure omitted deployment base');
      assert(!html.includes('research-equation-error'), `Equation failed to render: ${section.title}`);
    }
  }
  const proteinText = JSON.stringify(pages.protein);
  for (const stale of ['−10.790','−10.473','0.140 ± 0.010','37–68','122–154']) assert(!proteinText.includes(stale), `Obsolete protein content: ${stale}`);
  assert(proteinText.includes('TSO1') && proteinText.includes('pDCA1'), 'Both DNA studies must remain explicit');
  assert(proteinText.includes('32–72') && proteinText.includes('117–158'), 'Complete CXC boundaries required');
  const structure = JSON.parse(fs.readFileSync('src/content/structures/lycopene-wt.json','utf8'));
  assert.equal(structure.identity.cid, 446925);
  assert.equal(structure.ligand.length,40); assert.equal(structure.bonds.length,39);
  const connected = new Set([0]);
  for(let i=0;i<40;i++) for(const [a,b] of structure.bonds) { if(connected.has(a)) connected.add(b); if(connected.has(b)) connected.add(a); }
  assert.equal(connected.size,40, 'Lycopene must be one connected, acyclic heavy-atom graph');
  const renderSources = JSON.parse(fs.readFileSync('docs/reviews/lycopene-render-provenance.json','utf8')).sources;
  for(const [file,hash] of Object.entries(structure.sha256)) assert.equal(hash,renderSources[`wt/${file}`], '3D and static render inputs must match');
  const data = JSON.parse(fs.readFileSync('src/content/dry-lab-tables.json','utf8'));
  assert.equal(data.RECOVERY.rows.length,16);
  for (const obsolete of ['PARAMETERS','FIT','ENDPOINTS','ELASTICITY','ROBUSTNESS','BOUNDS']) {
    assert(!data[obsolete], `Obsolete model table remains: ${obsolete}`);
  }
  const ode = pages.model.sections.flatMap(s=>s.blocks ?? []).find(b=>b.kind==='equation' && b.label==='Regulatory LCYB model');
  assert.equal((ode.text.match(/\\frac\{d/g) ?? []).length,5);
  assert.deepEqual(pages.model.sections.map(section => section.title), [
    'Biological question and model scope','Promoter-to-enzyme transfer','Five-state dynamic model',
    'Parameterisation and numerical method','Scenario results','Sensitivity and downstream handoff','Conclusions and experimental validation',
  ]);
  const modelText = JSON.stringify(pages.model);
  assert(modelText.includes('fourth-order Runge–Kutta') && modelText.includes('Δt = 0.01 d') && modelText.includes('±10%'), 'Model solver and sensitivity procedure must be explicit');
  assert(modelText.includes('illustrative parameter set') && modelText.includes('project-specific calibration'), 'Model scenarios must lead into project-specific calibration');
  assert(modelText.includes('Scenario diagnostics and numerical reliability') && modelText.includes('Panel B measures') && modelText.includes('Panel C tests'), 'Fig. 1 must report endpoint, response-time and convergence diagnostics');
  for (const name of ['14_regulatory_model','15_regulatory_response','16_regulatory_dynamics','17_regulatory_sweep','18_regulatory_sensitivity']) {
    assert(modelText.includes(name), `Missing regulatory model figure: ${name}`);
  }
  const modelScenarioData = JSON.parse(fs.readFileSync('public/data/regulatory-model-scenarios.json','utf8'));
  assert.equal(modelScenarioData.solver.method, 'fixed-step classical RK4');
  assert.equal(modelScenarioData.solver.step_days, 0.01);
  assert.equal(modelScenarioData.sensitivity.length, 12);
  assert(!/day-7|2\.0988|10\.9518|Car09|nine-state|FBA/i.test(JSON.stringify(pages.model)), 'Obsolete quantitative claim remains');
  for (const slug of ['transcriptomics','model','protein']) {
    const captions = pages[slug].sections.flatMap(s => s.blocks ?? []).flatMap(block => block.kind === 'figure' ? [block.caption] : block.kind === 'figure-row' || block.kind === 'figure-grid' ? block.figures.map(figure => figure.caption) : []);
    captions.forEach((caption, i) => assert(caption.startsWith('Fig. ' + (i + 1) + ' '), 'Figure numbering in ' + slug + ': ' + caption));
  }
  assert(modelText.includes('CPP2146') && !/TF2146/i.test(modelText), 'Use the confirmed CPP2146 name in modeling');
  assert(!pages.transcriptomics.sections.some(section => section.title.startsWith('CPP')), 'CPP-only chapter remains');
  for (const oldFigure of ['branch-allocation.png','light-intensity-pca.png','dry-lab/02_tf_candidates.png']) {
    assert(!fs.existsSync(path.join('public/figures', oldFigure)), 'Obsolete figure remains: ' + oldFigure);
  }
  const provenance = JSON.parse(fs.readFileSync('src/content/dry-lab-provenance.json','utf8'));
  for (const [file, hash] of Object.entries(provenance.figure_sha256)) {
    assert.equal(createHash('sha256').update(fs.readFileSync(`public/figures/dry-lab/${file}`)).digest('hex'), hash);
  }
  assert.equal(figures,18);
  const workflow = fs.readFileSync('.github/workflows/pages.yml','utf8');
  for(const slug of ['dry-lab','transcriptomics','metabolomics','protein','model','hardware','hardware-design']) assert(workflow.includes(`            ${slug} \\`));
  console.log(`Dry Lab checks passed: complete eight-entry navigation, populated protein and safety pages, ${figures} figures, ${tables} tables, three explicit transcriptomics contrasts and 5 core ODEs.`);
} finally {
  await server.close();
}
