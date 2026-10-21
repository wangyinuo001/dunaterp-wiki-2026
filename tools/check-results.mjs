import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const page = JSON.parse(fs.readFileSync('src/content/results.generated.json', 'utf8'));
const source = JSON.parse(fs.readFileSync('docs/results-sources.json', 'utf8'));
const mapping = JSON.parse(fs.readFileSync('src/content/deploy-assets.json', 'utf8'));
const characters = runs => runs.flatMap(run => [...run.text].filter(char => !/\s/u.test(char)).map(char =>
  [char, !!run.italic, !!run.bold, run.verticalAlign ?? null, run.href ?? null]));
const expected = source.sourceUnits.flatMap(unit => unit.type === 'paragraph'
  ? characters(unit.runs) : unit.cells.flatMap(row => row.flatMap(characters)));
const imported = page.sections.flatMap(section => [
  ...characters(section.titleRuns),
  ...section.blocks.flatMap(block => {
    switch (block.kind) {
      case 'document-paragraph': case 'document-heading': return characters(block.runs);
      case 'document-list': return block.items.flatMap(characters);
      case 'table': return [...characters(block.captionRuns), ...[block.columnRuns, ...block.cellRuns].flatMap(row => row.flatMap(characters))];
      case 'figure': return characters(block.captionRuns);
      case 'figure-grid': return [...block.figures.flatMap(panel => characters(panel.captionRuns)), ...characters(block.captionRuns)];
      default: throw new Error(`Unexpected editorial block: ${block.kind}`);
    }
  }),
]);
assert.deepEqual(imported, expected, 'Results text or character formatting differs from the Word snapshot');
assert.equal(imported.length, source.fidelity.charactersVerified);
assert.deepEqual(page.sections.map(section => section.tocTitle), source.moduleOrder);
const blocks = page.sections.flatMap(section => section.blocks);
assert.equal(page.sections.length, 6);
assert.equal(blocks.filter(block => ['figure', 'figure-grid'].includes(block.kind)).length, 42);
assert.equal(blocks.filter(block => block.kind === 'table').length, 10);
const panels = blocks.flatMap(block => block.kind === 'figure' ? [block] : block.kind === 'figure-grid' ? block.figures : []);
assert.equal(panels.length, 46);
for (const asset of source.assets) {
  const bytes = fs.readFileSync(`public/${asset.output}`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.output);
  assert(mapping[asset.output], `Missing asset mapping: ${asset.output}`);
  assert.equal(mapping[asset.output], asset.url || asset.output);
  assert(asset.pixelsMatchWordCrop);
}
console.log(`Results fidelity passed: ${imported.length} characters with formatting, six modules, 42 figures / 46 panels, ten tables, verified image hashes.`);
