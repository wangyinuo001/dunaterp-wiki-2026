import { createContext } from 'react';
import type { DocumentTextRun } from './content/types';

export const CitationNumbers = createContext<ReadonlyMap<number, number>>(new Map());

/** Remap authored reference numbers while preserving surrounding Word runs. */
export function remapCitationRuns(runs: DocumentTextRun[], numbers: ReadonlyMap<number, number>): DocumentTextRun[] {
  if (!numbers.size) return runs;
  const text = runs.map(run => run.text).join('');
  const replacements = Array.from(text.matchAll(/\[(\d+)\]/g)).flatMap(match => {
    const number = numbers.get(Number(match[1]));
    return number === undefined ? [] : [{ start: match.index, end: match.index + match[0].length, text: `[${number}]` }];
  });
  const result: DocumentTextRun[] = [];
  let offset = 0;
  for (const run of runs) {
    const start = offset;
    const end = start + run.text.length;
    offset = end;
    const hrefMatch = run.href?.match(/^#reference-(\d+)$/);
    const hrefNumber = hrefMatch ? numbers.get(Number(hrefMatch[1])) : undefined;
    const attributes = hrefNumber === undefined ? run : { ...run, href: `#reference-${hrefNumber}` };
    let cursor = start;
    for (const replacement of replacements.filter(item => item.start < end && item.end > start)) {
      if (cursor < replacement.start) result.push({ ...attributes, text: text.slice(cursor, replacement.start) });
      if (replacement.start >= start) result.push({ ...attributes, text: replacement.text, href: `#reference-${replacement.text.slice(1, -1)}` });
      cursor = Math.min(end, replacement.end);
    }
    if (cursor < end) result.push({ ...attributes, text: text.slice(cursor, end) });
  }
  return result;
}
