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
    ['Metabolomics', '/metabolomics'],
    ['Protein', '/protein'],
    ['Mathematical Modeling', '/model'],
    ['Hardware Modeling', '/hardware'],
    ['Hardware Design', '/hardware-design'],
  ]);
  assert.equal(new Set(pageOrder).size, pageOrder.length);
  for (const [, href] of items) assert(pages[href.slice(1)], `Missing route ${href}`);
  for (const slug of ['metabolomics','protein','hardware','hardware-design','safety-and-security']) {
    assert(pages[slug].sections.length > 0, `Missing content: ${slug}`);
    assert(pages[slug].intro, `Missing introduction: ${slug}`);
  }
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
  const lcybDockingBlocks = pages.protein.sections.find(section => section.title === 'Docking with lycopene').blocks;
  const lcybViewRow = lcybDockingBlocks.find(block => block.kind === 'figure-row');
  assert.equal(lcybViewRow?.figures.length, 2, 'Two LCYB close-up views should share a two-column row');
  assert(lcybDockingBlocks.some(block => block.kind === 'docking-viewer'), 'Manual LCYB 3D viewer remains independent of the static figure row');
  const tfIntroBlocks = pages.protein.sections.find(section => section.title === 'TF2146: a DNA-recognition hypothesis').blocks;
  assert.equal(tfIntroBlocks[1].kind, 'figure');
  assert(tfIntroBlocks[1].src.endsWith('tf2146-domain-architecture.svg'), 'TF2146 domain map should appear at the beginning of its introduction');
  const dnaDockingBlocks = pages.protein.sections.find(section => section.title === 'Parallel study: a TSO1-derived DNA duplex').blocks;
  assert(tfIntroBlocks.some(block => block.kind === 'figure' && block.src.endsWith('protein-dna-docking.png')));
  const structure = JSON.parse(fs.readFileSync('src/content/structures/lycopene-wt.json','utf8'));
  assert.equal(structure.identity.cid, 446925);
  assert.equal(structure.ligand.length,40); assert.equal(structure.bonds.length,39);
  const connected = new Set([0]);
  for(let i=0;i<40;i++) for(const [a,b] of structure.bonds) { if(connected.has(a)) connected.add(b); if(connected.has(b)) connected.add(a); }
  assert.equal(connected.size,40, 'Lycopene must be one connected, acyclic heavy-atom graph');
  const renderSources = JSON.parse(fs.readFileSync('docs/reviews/lycopene-render-provenance.json','utf8')).sources;
  for(const [file,hash] of Object.entries(structure.sha256)) assert.equal(hash,renderSources[`wt/${file}`], '3D and static render inputs must match');
  const data = JSON.parse(fs.readFileSync('src/content/dry-lab-tables.json','utf8'));
  assert.equal(data.TF_RANKING.rows.length,333);
  data.TF_RANKING.rows.forEach((row,i)=>assert.equal(Number(row[0]), i+1));
  assert.equal(data.RECOVERY.rows.length,16);
  for (const obsolete of ['PARAMETERS','FIT','ENDPOINTS','ELASTICITY','ROBUSTNESS','BOUNDS']) {
    assert(!data[obsolete], `Obsolete model table remains: ${obsolete}`);
  }
  const ode = pages.model.sections.flatMap(s=>s.blocks ?? []).find(b=>b.kind==='equation' && b.label==='Regulatory LCYB model');
  assert.equal((ode.text.match(/\\frac\{d/g) ?? []).length,5);
  assert.deepEqual(pages.model.sections.map(section => section.title), [
    'Modeling question','Promoter occupancy and transcription','Five differential equations',
    'Evidence and parameter status','What the model establishes','Interface with metabolomics',
  ]);
  assert(!/day-7|2\.0988|10\.9518|Car09|nine-state|FBA/i.test(JSON.stringify(pages.model)), 'Obsolete quantitative claim remains');
  for (const slug of ['transcriptomics','model','protein']) {
  const captions = pages[slug].sections.flatMap(s => s.blocks ?? []).flatMap(block => block.kind === 'figure' ? [block.caption] : block.kind === 'figure-row' || block.kind === 'figure-grid' ? block.figures.map(figure => figure.caption) : []);
    captions.forEach((caption, i) => assert(caption.startsWith('Figure ' + (i + 1) + '.'), 'Figure numbering in ' + slug + ': ' + caption));
  }
  assert(!pages.model.sections.some(section => /CPP/i.test(JSON.stringify(section))), 'Unverified CPP regulator remains in modeling');
  assert(!pages.transcriptomics.sections.some(section => section.title.startsWith('CPP')), 'CPP-only chapter remains');
  for (const oldFigure of ['branch-allocation.png','light-intensity-pca.png','dry-lab/02_tf_candidates.png']) {
    assert(!fs.existsSync(path.join('public/figures', oldFigure)), 'Obsolete figure remains: ' + oldFigure);
  }
  const provenance = JSON.parse(fs.readFileSync('src/content/dry-lab-provenance.json','utf8'));
  for (const [file, hash] of Object.entries(provenance.figure_sha256)) {
    assert.equal(createHash('sha256').update(fs.readFileSync(`public/figures/dry-lab/${file}`)).digest('hex'), hash);
  }
  assert.equal(figures,15);
  const workflow = fs.readFileSync('.github/workflows/pages.yml','utf8');
  for(const slug of ['dry-lab','transcriptomics','metabolomics','protein','model','hardware','hardware-design']) assert(workflow.includes(`            ${slug} \\`));
  console.log(`Dry Lab checks passed: complete seven-entry navigation, populated protein and safety pages, ${figures} figures, ${tables} tables, 333 ranked transcripts and 5 core ODEs.`);
} finally {
  await server.close();
}
