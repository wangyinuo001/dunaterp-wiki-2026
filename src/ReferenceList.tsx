import type { WikiReference } from './content/types';
import { formatReference, referenceKey } from './bibliography';
import { renderInlineText } from './inline-text';

export function ReferenceList({ references }: { references: WikiReference[] }) {
  return <div className="reference-list">{references.map((reference, index) => {
    const entry = formatReference(reference);
    return <p id={`reference-${index + 1}`} key={referenceKey(reference)}>
      <span className="reference-number">[{index + 1}]</span>
      <span className="reference-content">{renderInlineText(entry.text)}{entry.links.map(link => <span key={link.href}> {link.prefix} <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>.</span>)}</span>
    </p>;
  })}</div>;
}
