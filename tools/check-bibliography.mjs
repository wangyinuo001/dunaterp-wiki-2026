import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { pages } = await server.ssrLoadModule('/src/site-data.ts');
  const { pageBibliography, formatReference, referenceKey } = await server.ssrLoadModule('/src/bibliography.ts');
  const { remapCitationRuns } = await server.ssrLoadModule('/src/citation-numbers.ts');
  const { ReferenceList } = await server.ssrLoadModule('/src/ReferenceList.tsx');
  const entries = JSON.parse(fs.readFileSync('src/content/bibliography.generated.json', 'utf8'));
  let total = 0;
  for (const [slug, page] of Object.entries(pages)) {
    const { references, citationNumbers } = pageBibliography(page);
    for (const reference of references) {
      assert(entries[referenceKey(reference)], `Unformatted reference in ${slug}: ${reference.label}`);
      const formatted = formatReference(reference);
      assert(formatted.text.length > 20 && !/undefined|\[object Object\]|\[J\]|\[EB\/OL\]|Available at:/.test(formatted.text), slug);
      assert.equal(formatted.beforeTitle + formatted.title + formatted.afterTitle, formatted.text, `${slug}: reference text changed`);
      assert(formatted.title.length > 0, `${slug}: missing title`);
      for (const link of formatted.links) assert(['http:', 'https:'].includes(new URL(link.href).protocol));
      const entryHtml = renderToStaticMarkup(React.createElement(ReferenceList, { references: [reference] }));
      const anchor = entryHtml.match(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/s);
      const plain = value => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
      assert.equal(plain(entryHtml), `[1]${formatted.text}`, `${slug}: visible bibliography text changed`);
      assert(!/https?:\/\/|doi:|Available from:/i.test(plain(entryHtml)), `${slug}: visible DOI or URL`);
      if (formatted.links.length) {
        assert(anchor, `${slug}: title link missing`);
        assert.equal(plain(anchor[1]), formatted.links[0].href, `${slug}: title destination changed`);
        assert.equal(plain(anchor[2]), formatted.title, `${slug}: linked text must be the title`);
        if (/Dunaliella salina/.test(formatted.title)) assert(/<em[^>]*>Dunaliella salina<\/em>/.test(anchor[2]), `${slug}: species italics lost in title`);
      } else assert.equal(anchor, null, `${slug}: unverified reference received a link`);
      total++;
    }
    for (const number of citationNumbers.values()) assert(number >= 1 && number <= references.length, slug);
    const html = renderToStaticMarkup(React.createElement(ReferenceList, { references }));
    assert.equal((html.match(/class="reference-number"/g) ?? []).length, references.length, slug);
  }
  const fixture = { sections: [{ title: '', body: 'First [3], then [1], and [3] again.', blocks: [] }], references: [
    { label: 'Source A', href: 'https://example.org/a' }, { label: 'Source B', href: 'https://example.org/b' }, { label: 'Source C', href: 'https://example.org/c' },
  ] };
  const reordered = pageBibliography(fixture);
  assert.deepEqual(reordered.references.map(reference => reference.label), ['Source C', 'Source A', 'Source B']);
  assert.deepEqual([...reordered.citationNumbers], [[3, 1], [1, 2], [2, 3]]);
  const split = [{ text: 'first [', bold: true }, { text: '3', verticalAlign: 'superscript' }, { text: '] after', italic: true }];
  const remapped = remapCitationRuns(split, reordered.citationNumbers);
  assert.equal(remapped.map(run => run.text).join(''), 'first [1] after');
  assert(remapped.some(run => run.text === '[1]' && run.href === '#reference-1'));
  assert(remapped.some(run => run.text === ' after' && run.italic));
  assert(pages.results?.sections.length > 0, 'Results page must be present');
  for (const [slug, page] of Object.entries(pages)) assert(!/TF2146/.test(JSON.stringify(page)), slug);
  const revision = JSON.parse(fs.readFileSync('docs/engineering-revision-sources.json', 'utf8'));
  for (const item of revision.matches) {
    const block = pages.engineering.sections[item.section - 1].blocks[item.block];
    assert.equal(block.runs.map(run => run.text).join(''), item.sourceParagraph, 'Engineering paragraph differs from the supplied revision');
  }
  console.log(`Bibliography checks pass: ${Object.keys(entries).length} sources, ${total} rendered entries; citation identity, order and split-run links verified.`);
} finally {
  await server.close();
}
