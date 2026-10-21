import { assetUrl as resolveAsset } from './asset-url';
import { lazy, Suspense, useContext } from 'react';
import { CitationNumbers } from './citation-numbers';
import { Link } from 'react-router-dom';
import katex from 'katex';
import type { ContentBlock } from './content/types';
import { renderInlineText } from './inline-text';
import { DocumentText } from './DocumentText';
import type { DocumentTextRun } from './content/types';
import { PBRWidget } from './PBRWidget';
import { SafetyOverview, SafetyResults } from './SafetyEvidence';
import { WetLabMethod, WetLabOverview } from './WetLabProtocol';
import 'katex/dist/katex.min.css';
import './article-blocks.css';

const DockingViewer = lazy(() => import('./DockingViewer').then(module => ({ default: module.DockingViewer })));


function renderTableCell(text: string) {
  return text.split(/(\$[^$]+\$)/g).map((part, index) => {
    if (!part.startsWith("$") || !part.endsWith("$")) return renderInlineText(part, index);
    try {
      const html = katex.renderToString(part.slice(1, -1), { displayMode: false, throwOnError: true, trust: false });
      return <span className="research-table-math" key={`${index}-${part}`} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return part;
    }
  });
}

function DataTable({ block }: { block: Extract<ContentBlock, { kind: 'table' }> }) {
  const content = <div className="research-table-scroll" role="region" aria-label={block.caption} tabIndex={0}>
    <table>{block.caption && <caption>{renderInlineText(block.caption)}</caption>}<thead><tr>{block.columns.map((name, index) => <th key={name} scope="col">{block.columnRuns?.[index] ? <DocumentText runs={block.columnRuns[index]} /> : renderInlineText(name)}</th>)}</tr></thead>
      <tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => {
        const runs = block.cellRuns?.[i]?.[j];
        const value = runs ? <DocumentText runs={runs} /> : /^https?:\/\//.test(cell) ? <a href={cell}>Reference ↗</a> : renderTableCell(cell);
        return j === 0 ? <th scope="row" key={j}>{value}</th> : <td key={j}>{value}</td>;
      })}</tr>)}</tbody>
    </table>
  </div>;
  return block.collapsed ? <details className="research-table-details"><summary>{block.caption} <span>({block.rows.length} rows)</span></summary>{content}</details> : content;
}

function renderEquation(text: string): string | null {
  try {
    // KaTeX's default \jot is fixed. Give multi-line displays a modest shared gap,
    // while respecting any larger, formula-specific spacing in the source.
    const spacedText = text.replace(
      /\\\\(?:\s*\[(\d+(?:\.\d+)?)pt\])?/g,
      (_lineBreak, authoredGap?: string) => `\\\\[${authoredGap && Number(authoredGap) > 4 ? authoredGap : 4}pt]`,
    );
    return katex.renderToString(spacedText, { displayMode: true, throwOnError: true, trust: false });
  } catch {
    return null;
  }
}

function Equation({ block }: { block: Extract<ContentBlock, { kind: 'equation' }> }) {
  const html = renderEquation(block.text);
  if (html === null) return <div className="research-equation research-equation-error" role="region" aria-label={block.label} tabIndex={0}><pre>{block.text}</pre></div>;
  return <div className="research-equation" role="region" aria-label={block.label} tabIndex={0} dangerouslySetInnerHTML={{ __html: html }} />;
}

function ResearchFigure({ figure, compact = false }: { figure: { src: string; alt: string; caption: string; captionRuns?: DocumentTextRun[]; width?: number; height?: number; rotation?: 90 }; compact?: boolean }) {
  const rotated = figure.rotation === 90 && figure.width && figure.height;
  const picture = <img src={resolveAsset(figure.src)} alt={figure.alt} width={figure.width} height={figure.height} loading="lazy" decoding="async" style={rotated ? { width: `${figure.width! / figure.height! * 100}%` } : undefined} />;
  return <figure className={`feature-figure research-figure${compact ? ' research-figure--compact' : ''}${rotated ? ' research-figure--rotated' : ''}`}>
    <a href={resolveAsset(figure.src)} aria-label={`Open full-size figure: ${figure.alt}`}>{rotated ? <span className="research-figure-rotated" style={{ aspectRatio: `${figure.height} / ${figure.width}` }}>{picture}</span> : picture}</a>
    {figure.caption && <figcaption>{figure.captionRuns ? <DocumentText runs={figure.captionRuns} /> : renderInlineText(figure.caption)}</figcaption>}
  </figure>;
}

function ProtocolPdf({ block }: { block: Extract<ContentBlock, { kind: 'pdf' }> }) {
  const src = resolveAsset(block.src);
  return <div className="protocol-pdf">
    <div className="protocol-pdf__actions">
      <a href={src} target="_blank" rel="noreferrer">Open PDF ↗</a>
      <a href={resolveAsset(block.downloadSrc)} download>{block.downloadLabel ?? 'Download original DOCX'} ↧</a>
    </div>
    <iframe src={`${src}#view=FitH`} title={block.label} loading="lazy" />
  </div>;
}

export function ArticleBlocks({ blocks, referenceNumbers = new Map<string, number>(), sectionId }: { blocks: ContentBlock[]; referenceNumbers?: Map<string, number>; sectionId?: string }) {
  const citationNumbers = useContext(CitationNumbers);
  return <div className="research-blocks">{blocks.map((block, i) => {
    switch (block.kind) {
      case 'paragraph': return <p key={i}>{renderCitations(block.text, referenceNumbers, citationNumbers)}</p>;
      case 'document-paragraph': return <p className="document-paragraph" id={block.id} key={i}><DocumentText runs={block.runs} /></p>;
      case 'document-heading': {
        const Heading = block.level === 4 ? 'h4' : 'h3';
        return <Heading id={sectionId ? `${sectionId}-heading-${i + 1}` : undefined} tabIndex={sectionId ? -1 : undefined} key={i}><DocumentText runs={block.runs} /></Heading>;
      }
      case 'document-list': return block.ordered
        ? <ol key={i}>{block.items.map((runs, index) => <li key={index}><DocumentText runs={runs} /></li>)}</ol>
        : <ul key={i}>{block.items.map((runs, index) => <li key={index}><DocumentText runs={runs} /></li>)}</ul>;
      case 'details': return <details className="research-details" open={block.open} key={i}>
        <summary>{renderInlineText(block.summary)}</summary>
        <ArticleBlocks blocks={block.blocks} referenceNumbers={referenceNumbers} />
      </details>;
      case 'heading': return <h3 id={sectionId ? `${sectionId}-heading-${i + 1}` : undefined} tabIndex={sectionId ? -1 : undefined} key={i}>{renderInlineText(block.text)}</h3>;
      case 'equation': return <Equation key={i} block={block} />;
      case 'code': return <div className="research-code" key={i}><p>{block.label}</p><pre tabIndex={0}><code>{block.text}</code></pre></div>;
      case 'figure': return <ResearchFigure key={i} figure={block} />;
      case 'figure-grid': return <div key={i}><div className={`research-figure-grid${block.className ? ` ${block.className}` : ''}`}>{block.figures.map((figure) => <ResearchFigure key={figure.src} figure={figure} compact />)}</div>{block.caption && <p className="research-shared-caption">{block.captionRuns ? <DocumentText runs={block.captionRuns} /> : renderInlineText(block.caption)}</p>}</div>;
      case 'member-grid': return <ul className="team-roster" key={i}>{block.members.map((member) => {
        const name = `${member.givenName} ${member.familyName}`;
        return <li className="team-member" key={member.src}>
          <img src={resolveAsset(member.src)} alt={`Portrait of ${name}`} width={720} height={900} loading="lazy" decoding="async" />
          <div className="team-member__caption"><h3>{name}</h3><p>{member.major}</p></div>
        </li>;
      })}</ul>;
      case 'chapter-grid': return <div className="research-chapter-grid" key={i}>{block.items.map((item) => <Link className="research-chapter-card" to={item.href} key={item.href}><span>{item.index}</span><div><h3>{renderInlineText(item.title)}</h3><p>{renderInlineText(item.text)}</p></div><b aria-hidden="true">↗</b></Link>)}</div>;
      case 'table': return <DataTable key={i} block={block} />;
      case 'links': return <ul className="research-links" key={i}>{block.links.map(({label,href}) => {
        if (href.startsWith('/')) return <li key={href}><Link to={href}>{renderInlineText(label)} ↗</Link></li>;
        const reference = referenceNumbers.get(href);
        return <li key={href}>{reference
          ? <a href={`#reference-${reference}`}>{renderInlineText(label)} <sup>[{reference}]</sup></a>
          : <a href={href} target="_blank" rel="noreferrer">{renderInlineText(label)} ↗</a>}</li>;
      })}</ul>;
      case 'attribution-list': return <ul className="attribution-list" key={i}>{block.entries.map((entry) => <li key={entry.name}>
        <p><strong>{entry.name}</strong>{entry.role && <span className="attribution-role">{entry.role}</span>}</p>
        <p>{renderInlineText(entry.contribution || 'Contribution details will be added after team confirmation.')}</p>
      </li>)}</ul>;
      case 'official-attributions': return <div className="official-attributions" key={i}>
        <p><a href="https://teams.igem.org/wiki/6212/attributions" target="_blank" rel="noreferrer">Open the official iGEM Attributions Form ↗</a></p>
        <iframe src="https://teams.igem.org/wiki/6212/attributions" title="SCU-China 2026 official iGEM Attributions Form" loading="lazy" />
      </div>;
      // Build-time, escaped markup generated only from the supplied local DOCX files.
      // Native headings, lists and tables inherit article styles; no embedded document.
      case 'wet-lab-overview': return <WetLabOverview key={i} />;
      case 'wet-lab-method': return <WetLabMethod key={i} block={block} />;
      case 'download': return <p className="protocol-download" key={i}><a href={resolveAsset(block.src)} download>{renderInlineText(block.label)} ↧</a></p>;
      case 'pdf': return <ProtocolPdf key={i} block={block} />;
      case 'docking-viewer': return <Suspense key={i} fallback={<p>Loading 3D docking view…</p>}><DockingViewer /></Suspense>;
      case 'pbr-widget': return <PBRWidget key={i} />;
      case 'safety-overview': return <SafetyOverview key={i} />;
      case 'safety-results': return <SafetyResults key={i} />;
    }
  })}</div>;
}

function renderCitations(text: string, referenceNumbers: Map<string, number>, citationNumbers: ReadonlyMap<number, number>) {
  if (referenceNumbers.size === 0) return renderInlineText(text);
  const parts = text.split(/\[(\d+)\]/g);
  return parts.map((part, index) => {
    if (index % 2 === 0) return renderInlineText(part, index);
    const number = citationNumbers.get(Number(part)) ?? Number(part);
    return number > 0 && number <= referenceNumbers.size
      ? <a className="inline-citation" href={`#reference-${number}`} key={`${index}-${number}`}>[{number}]</a>
      : `[${part}]`;
  });
}
