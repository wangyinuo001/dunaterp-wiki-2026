import type { WikiReference } from './content/types';
import { formatReference, referenceKey } from './bibliography';
import { renderInlineText } from './inline-text';

export function ReferenceList({ references }: { references: WikiReference[] }) {
  return <div className="reference-list">{references.map((reference, index) => {
    const entry = formatReference(reference);
    const destination = entry.links[0]?.href;
    return <p id={`reference-${index + 1}`} key={referenceKey(reference)}>
      <span className="reference-number">[{index + 1}]</span>
      <span className="reference-content">
        {renderInlineText(entry.beforeTitle)}
        {destination ? <a href={destination} target="_blank" rel="noreferrer">{renderInlineText(entry.title)}</a> : renderInlineText(entry.title)}
        {renderInlineText(entry.afterTitle)}
      </span>
    </p>;
  })}</div>;
}
