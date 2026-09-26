import { Link } from 'react-router-dom';
import katex from 'katex';
import type { ContentBlock } from './content/types';
import { PBRWidget } from './PBRWidget';
import 'katex/dist/katex.min.css';
import './article-blocks.css';

function resolveAsset(src: string) {
  if (/^(?:https?:|data:|blob:|\/\/)/i.test(src)) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;
}

function DataTable({ block }: { block: Extract<ContentBlock, { kind: 'table' }> }) {
  const content = <div className="research-table-scroll" role="region" aria-label={block.caption} tabIndex={0}>
    <table><caption>{block.caption}</caption><thead><tr>{block.columns.map((name) => <th key={name} scope="col">{name}</th>)}</tr></thead>
      <tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => {
        const value = /^https?:\/\//.test(cell) ? <a href={cell}>Reference ↗</a> : cell;
        return j === 0 ? <th scope="row" key={j}>{value}</th> : <td key={j}>{value}</td>;
      })}</tr>)}</tbody>
    </table>
  </div>;
  return block.collapsed ? <details className="research-table-details"><summary>{block.caption} <span>({block.rows.length} rows)</span></summary>{content}</details> : content;
}

function renderEquation(text: string): string | null {
  try {
    return katex.renderToString(text, { displayMode: true, throwOnError: true, trust: false });
  } catch {
    return null;
  }
}

function Equation({ block }: { block: Extract<ContentBlock, { kind: 'equation' }> }) {
  const html = renderEquation(block.text);
  if (html === null) return <div className="research-equation research-equation-error" role="region" aria-label={block.label} tabIndex={0}><pre>{block.text}</pre></div>;
  return <div className="research-equation" role="region" aria-label={block.label} tabIndex={0} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ArticleBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return <div className="research-blocks">{blocks.map((block, i) => {
    switch (block.kind) {
      case 'paragraph': return <p key={i}>{block.text}</p>;
      case 'heading': return <h3 key={i}>{block.text}</h3>;
      case 'equation': return <Equation key={i} block={block} />;
      case 'code': return <div className="research-code" key={i}><p>{block.label}</p><pre tabIndex={0}><code>{block.text}</code></pre></div>;
      case 'figure': return <figure className="feature-figure research-figure" key={i}><a href={resolveAsset(block.src)} aria-label={`Open full-size figure: ${block.alt}`}><img src={resolveAsset(block.src)} alt={block.alt} loading="lazy" decoding="async" /></a><figcaption>{block.caption}<span className="figure-credit">Team analysis figure · CC BY 4.0</span></figcaption></figure>;
      case 'table': return <DataTable key={i} block={block} />;
      case 'links': return <ul className="research-links" key={i}>{block.links.map(({label,href}) => <li key={href}>{href.startsWith('/') ? <Link to={href}>{label} ↗</Link> : <a href={href}>{label} ↗</a>}</li>)}</ul>;
      case 'pbr-widget': return <PBRWidget key={i} />;
    }
  })}</div>;
}
