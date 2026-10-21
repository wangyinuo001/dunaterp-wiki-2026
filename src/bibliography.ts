import type { WikiPage } from './site-data';
import type { ContentBlock, WikiReference } from './content/types';
import bibliography from './content/bibliography.generated.json';

export type FormattedReference = {
  text: string;
  beforeTitle: string;
  title: string;
  afterTitle: string;
  links: Array<{ prefix: string; label: string; href: string }>;
};

const entries: Record<string, FormattedReference> = bibliography;
export const referenceKey = (reference: WikiReference) => (reference.href || reference.label).replace(/\s+/g, ' ').trim();
export function formatReference(reference: WikiReference): FormattedReference {
  return entries[referenceKey(reference)] ?? { text: reference.label, beforeTitle: '', title: reference.label, afterTitle: '', links: [] };
}

function originalReferences(page: WikiPage): WikiReference[] {
  if (page.references) return page.references;
  const seen = new Set<string>();
  return page.sections.flatMap(section => (section.blocks ?? []).flatMap(block => block.kind === 'links'
    ? block.links.flatMap(link => {
      if (!/^https?:\/\//i.test(link.href) || seen.has(link.href)) return [];
      seen.add(link.href);
      return [{ ...link, kind: 'Web resource' as const }];
    }) : []));
}

export function pageBibliography(page: WikiPage) {
  const original = originalReferences(page);
  const order: number[] = [];
  const mention = (index: number) => {
    if (index >= 0 && index < original.length && !order.includes(index)) order.push(index);
  };
  const text = (value: string) => { for (const match of value.matchAll(/\[(\d+)\]/g)) mention(Number(match[1]) - 1); };
  const runs = (value: Array<{ text: string; href?: string }>) => {
    text(value.map(run => run.text).join(''));
    for (const run of value) if (run.href) mention(original.findIndex(reference => reference.href === run.href));
  };
  const visit = (blocks: ContentBlock[]) => {
    for (const block of blocks) switch (block.kind) {
      case 'paragraph': case 'heading': text(block.text); break;
      case 'document-paragraph': case 'document-heading': runs(block.runs); break;
      case 'document-list': block.items.forEach(runs); break;
      case 'details': text(block.summary); visit(block.blocks); break;
      case 'figure': text(block.caption); if (block.captionRuns) runs(block.captionRuns); break;
      case 'figure-grid': block.figures.forEach(figure => text(figure.caption)); if (block.caption) text(block.caption); if (block.captionRuns) runs(block.captionRuns); break;
      case 'table': if (block.caption) text(block.caption); block.columns.forEach(text); block.rows.flat().forEach(text); break;
      case 'links': block.links.forEach(link => mention(original.findIndex(reference => reference.href === link.href))); break;
    }
  };
  for (const section of page.sections) {
    text(section.title); text(section.body);
    if (section.blocks) visit(section.blocks);
    section.items?.forEach(text);
    if (section.note) text(section.note);
  }
  // Keep sources without an inline citation, including credits and background
  // reading, after cited sources rather than discarding the team's bibliography.
  original.forEach((_reference, index) => mention(index));
  const references: WikiReference[] = [];
  const citationNumbers = new Map<number, number>();
  const referenceNumbers = new Map<string, number>();
  const identities = new Map<string, number>();
  for (const index of order) {
    const reference = original[index];
    const identity = formatReference(reference).links.find(link => link.prefix === 'doi:')?.href ?? referenceKey(reference);
    let number = identities.get(identity);
    if (number === undefined) {
      references.push(reference);
      number = references.length;
      identities.set(identity, number);
    }
    citationNumbers.set(index + 1, number);
    referenceNumbers.set(reference.href ?? `#reference-${index + 1}`, number);
  }
  return { references, citationNumbers, referenceNumbers };
}
