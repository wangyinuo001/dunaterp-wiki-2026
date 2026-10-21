import type { WikiSection } from '../site-data';
import protocols from './wet-lab-protocols.json';

const methods = [
  { source: protocols[0].sections[0], id: 'cloning', phase: 'Build', short: 'Molecular cloning' },
  { source: protocols[0].sections[1], id: 'transformation', phase: 'Transform', short: 'Algal transformation' },
  { source: protocols[0].sections[2], id: 'dna-extraction', phase: 'Characterise', short: 'Genomic DNA extraction' },
  { source: protocols[1].sections[2], id: 'qpcr', phase: 'Characterise', short: 'RT-qPCR' },
  { source: protocols[1].sections[3], id: 'tlc', phase: 'Verify', short: 'Product verification' },
];

// The two shared methods are byte-identical in both source documents.
// Show them once; keep both original documents downloadable and fidelity-checked.
for (let i = 1; i < 3; i++) {
  if (protocols[0].sections[i].html !== protocols[1].sections[i - 1].html) {
    throw new Error('Wet-lab source methods differ: review before combining them.');
  }
}

export const wetLabSections: WikiSection[] = [
  { title: 'Experimental workflow', tocTitle: 'Workflow', eyebrow: 'Wet Lab', body: '', blocks: [{ kind: 'wet-lab-overview' }] },
  ...methods.map(({ source, id, phase, short }): WikiSection => {
    // Replace the duplicated Word outline with in-protocol links. Preserve all
    // authored introductions, procedures, reaction tables and conditions.
    const [introHtml, remainder] = source.html.split('<p>This section includes:</p>');
    const match = remainder?.match(/<h3>([\s\S]*?)<\/h3>([\s\S]*)$/);
    if (!match) throw new Error(`Unexpected source structure: ${source.title}`);
    const headings: { id: string; title: string }[] = [];
    const html = match[2].replace(/<h4>([\s\S]*?)<\/h4>/g, (_whole, content: string) => {
      const target = `method-${id}-${headings.length + 1}`;
      headings.push({ id: target, title: content.replace(/<[^>]+>/g, '').trim() });
      return `<h4 id="${target}" tabindex="-1">${content}</h4>`;
    });
    return {
      title: source.title, tocTitle: short, eyebrow: phase, body: '',
      blocks: [{ kind: 'wet-lab-method', id, introHtml, html, protocolTitle: match[1], headings }],
    };
  }),
  {
    title: 'Protocols & related work', tocTitle: 'Original protocols', body: '',
    blocks: [
      ...protocols.map(document => ({ kind: 'download' as const, src: document.file, label: `${document.label} — original protocol (DOCX)` })),
      { kind: 'paragraph', text: 'Sequence-supported transcript annotation and replicate-aware light comparisons identify LCYB as a branch point for further testing. The regulatory model then links LCYB transcript, active enzyme, lycopene and β-carotene, defining the matched measurements needed to test whether expression changes reach pathway flux.' },
      { kind: 'links', links: [{ label: 'Transcriptomics', href: '/transcriptomics' }, { label: 'Mathematical Modeling', href: '/mathematical-modeling' }] },
    ],
  },
];
