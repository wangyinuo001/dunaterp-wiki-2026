"""Import the team's consolidated Engineering DOCX without rewriting its text.

Usage: python tools/import-engineering-total.py path/to/source.docx
The Word run styles (including explicit off values) are resolved before import.
Images are extracted losslessly; captions and tables retain their source order.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
REL = '{http://schemas.openxmlformats.org/package/2006/relationships}'
MODULE_STARTS = {0, 60, 110, 189, 257}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def props(node):
    result = {}
    if node is not None:
        for key, name in [('i', 'italic'), ('b', 'bold'), ('vertAlign', 'verticalAlign')]:
            item = node.find(W + key)
            if item is not None:
                value = item.get(W + 'val', 'true')
                result[name] = value not in ('0', 'false', 'off') if key != 'vertAlign' else value
    return result


def main(source: Path):
    review = source.parent / 'review'
    upload = review / 'upload'
    upload.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((ROOT / 'docs/igem-cdn-assets.json').read_text(encoding='utf-8'))
    known = {m[k]: m for m in manifest for k in ('sha256', 'sourceSha256') if k in m}
    archive = ZipFile(source)
    document = ET.fromstring(archive.read('word/document.xml'))
    assert not list(document.iter(W + 'ins')) and not list(document.iter(W + 'del')), 'Review tracked changes first'
    body = document.find(W + 'body')
    styles = ET.fromstring(archive.read('word/styles.xml'))
    style_index = {s.get(W + 'styleId'): s for s in styles.findall(W + 'style')}
    default_p = next((k for k, s in style_index.items() if s.get(W+'default') == '1' and s.get(W+'type') == 'paragraph'), None)
    defaults = props(styles.find(W + 'docDefaults/' + W + 'rPrDefault/' + W + 'rPr'))
    relationships = {r.get('Id'): r for r in ET.fromstring(archive.read('word/_rels/document.xml.rels'))}

    def style_props(key, seen=None):
        seen = set() if seen is None else seen
        if key not in style_index or key in seen:
            return {}
        seen.add(key)
        style = style_index[key]
        base = style.find(W + 'basedOn')
        return {**(style_props(base.get(W+'val'), seen) if base is not None else {}), **props(style.find(W+'rPr'))}

    def runs(p):
        pstyle = p.find(W+'pPr/'+W+'pStyle')
        base = {**defaults, **style_props(pstyle.get(W+'val') if pstyle is not None else default_p)}
        result = []

        def visit(container, href=None):
            for child in container:
                if child.tag == W+'hyperlink':
                    relation = relationships.get(child.get(R+'id'))
                    target = relation.get('Target') if relation is not None else None
                    if target and not re.match(r'^(https?://|mailto:)', target):
                        target = None
                    visit(child, target)
                elif child.tag == W+'r':
                    text = ''.join((n.text or '') if n.tag == W+'t' else '\t' if n.tag == W+'tab' else '\n' if n.tag in (W+'br', W+'cr') else '' for n in child)
                    if not text:
                        continue
                    rstyle = child.find(W+'rPr/'+W+'rStyle')
                    formatting = {**base, **(style_props(rstyle.get(W+'val')) if rstyle is not None else {}), **props(child.find(W+'rPr'))}
                    formatting = {k: v for k, v in formatting.items() if v is True or (k == 'verticalAlign' and v in ('subscript', 'superscript'))}
                    if href:
                        formatting['href'] = href
                    if result and {k:v for k,v in result[-1].items() if k != 'text'} == formatting:
                        result[-1]['text'] += text
                    else:
                        result.append({'text': text, **formatting})
                elif child.tag not in (W+'pPr', W+'del'):
                    visit(child, href)
        visit(p)
        return result

    assets = []
    source_units = []
    sections = []
    section = None
    last_figure = None
    figure_number = 0

    for index, node in enumerate(body):
        if node.tag == W+'tbl':
            cells = [[[r for p in c.findall(W+'p') for r in runs(p)] for c in row.findall(W+'tc')] for row in node.findall(W+'tr')]
            grid = [[''.join(r['text'] for r in c) for c in row] for row in cells]
            block = {'kind': 'table', 'caption': '', 'columns': grid[0], 'rows': grid[1:], 'columnRuns': cells[0], 'cellRuns': cells[1:]}
            section['blocks'].append(block)
            source_units.append({'bodyIndex': index, 'type': 'table', 'cells': cells})
            last_figure = None
            continue
        if node.tag != W+'p':
            continue
        paragraph = runs(node)
        text = ''.join(r['text'] for r in paragraph)
        if text:
            source_units.append({'bodyIndex': index, 'type': 'paragraph', 'runs': paragraph})
        if index in MODULE_STARTS:
            section = {'title': text, 'titleRuns': paragraph, 'body': '', 'blocks': []}
            sections.append(section)
            last_figure = None
            continue
        image_nodes = list(node.iter(A+'blip'))
        if image_nodes:
            figure_number += 1
            figures = []
            for panel, blip in enumerate(image_nodes):
                rel = relationships[blip.get(R+'embed')]
                member = str(PurePosixPath('word') / rel.get('Target'))
                data = archive.read(member)
                image = Image.open(io.BytesIO(data))
                source_hash = digest(data)
                src_rect = node.find('.//'+A+'srcRect') if len(image_nodes) == 1 else None
                crop = {side: int(src_rect.get(side, '0')) for side in ('l','t','r','b')} if src_rect is not None else None
                if crop:
                    width, height = image.size
                    image = image.crop((round(width*crop['l']/100000), round(height*crop['t']/100000), round(width*(1-crop['r']/100000)), round(height*(1-crop['b']/100000))))
                existing = known.get(source_hash) if not crop else None
                if existing:
                    public_path = '/' + existing['source']
                    url = existing['url']
                    destination = ROOT/'public'/existing['source']
                    # Local aliases point to the existing converted image.
                    local = json.loads((ROOT/'src/content/local-assets.json').read_text(encoding='utf-8')).get(existing['source'], existing['source'])
                    if not (ROOT/'public'/local).exists():
                        destination.parent.mkdir(parents=True, exist_ok=True)
                        if destination.suffix == '.webp':
                            image.save(destination, format='WEBP', lossless=True, method=6)
                        else:
                            destination.write_bytes(data)
                    output_hash = existing['sha256']
                    output_bytes = existing['bytes']
                    upload_file = None
                else:
                    output = io.BytesIO()
                    image.save(output, format='WEBP', lossless=True, method=6)
                    converted = output.getvalue()
                    output_hash = digest(converted)
                    name = f'engineering-total-{figure_number:02d}' + (f'-{panel+1}' if len(image_nodes)>1 else '') + f'-{output_hash[:12]}.webp'
                    public_path = '/figures/wet-lab/engineering-total/'+name
                    destination = ROOT/'public'/public_path.lstrip('/')
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    destination.write_bytes(converted)
                    (upload/name).write_bytes(converted)
                    output_bytes = len(converted)
                    upload_file = str(upload/name)
                    url = known.get(output_hash, {}).get('url')
                figures.append({'src': public_path, 'alt': f'Engineering Figure {figure_number}' + (f', panel {panel+1}' if len(image_nodes)>1 else ''), 'caption': '', 'width': image.width, 'height': image.height})
                assets.append({'figure': figure_number, 'bodyIndex': index, 'source': member, 'sourceSha256': source_hash, 'output': public_path, 'sha256': output_hash, 'bytes': output_bytes, 'width': image.width, 'height': image.height, 'crop': crop, 'url': url, 'uploadFile': upload_file})
            block = {'kind': 'figure-grid', 'figures': figures, 'caption': ''} if len(figures)>1 else {'kind': 'figure', **figures[0]}
            # Team-requested display orientation; keep the source image unchanged.
            if figure_number == 15:
                block['rotation'] = 90
            section['blocks'].append(block)
            last_figure = block
        if not text:
            continue
        caption = re.match(r'^(?:Fig\.?|Figure)\s*\d+', text)
        continuation = text.startswith('The left picture is under natural light,')
        if (caption or continuation) and last_figure is not None:
            if last_figure.get('caption'):
                last_figure['caption'] += '\n' + text
                last_figure['captionRuns'] += [{'text': '\n'}, *paragraph]
            else:
                last_figure['caption'] = text
                last_figure['captionRuns'] = list(paragraph)
                if last_figure['kind'] == 'figure':
                    last_figure['alt'] = text
            continue
        is_cycle = text.startswith('Cycle ')
        is_step = text in ('Design', 'Build', 'Test', 'Learn')
        if is_cycle or is_step:
            level = 4 if is_step or (is_cycle and ' — ' in text and not text.endswith(' — Design')) else 3
            section['blocks'].append({'kind': 'document-heading', 'text': text, 'runs': paragraph, 'level': level})
        else:
            section['blocks'].append({'kind': 'document-paragraph', 'runs': paragraph})
        last_figure = None

    assert len(sections) == 5 and figure_number == 35 and len(assets) == 36
    page = {'title': 'Engineering', 'eyebrow': 'Engineering', 'intro': '', 'status': 'review-ready', 'sections': sections}

    def characters(text_runs):
        return [(c, bool(r.get('italic')), bool(r.get('bold')), r.get('verticalAlign'), r.get('href'))
                for r in text_runs for c in r['text'] if not c.isspace()]

    expected = []
    for unit in source_units:
        if unit['type'] == 'paragraph':
            expected += characters(unit['runs'])
        else:
            for row in unit['cells']:
                for cell in row:
                    expected += characters(cell)
    imported = []
    for module in sections:
        imported += characters(module['titleRuns'])
        for block in module['blocks']:
            if block['kind'] in ('document-paragraph', 'document-heading'):
                imported += characters(block['runs'])
            elif block['kind'] in ('figure', 'figure-grid'):
                imported += characters(block['captionRuns'])
            elif block['kind'] == 'table':
                for row in [block['columnRuns'], *block['cellRuns']]:
                    for cell in row:
                        imported += characters(cell)
    assert imported == expected, 'Imported text or character formatting differs from Word'
    raw = ''.join(t.text or '' for t in document.iter(W+'t'))
    assert ''.join(raw.split()) == ''.join(c[0] for c in expected), 'Unmapped Word text'
    fidelity = {'textAndFormattingMatch': True, 'sourceUnits': len(source_units), 'charactersVerified': len(imported),
                'italicCharacters': sum(c[1] for c in imported), 'subscriptCharacters': sum(c[3] == 'subscript' for c in imported)}
    # Approved during the 2026-10-21 Wiki consistency review, after verifying
    # the unmodified import against Word. Keep the original subscript runs.
    serialized = json.dumps(page, ensure_ascii=False)
    serialized = serialized.replace('Fig. 1The atlas', 'Fig. 1 The atlas')
    serialized = serialized.replace('and OOD"', 'and OD"')
    page = json.loads(serialized)
    revisions = json.loads((ROOT/'tools/engineering-revisions.json').read_text(encoding='utf-8'))
    for revision in revisions:
        matches = [block for module in page['sections'] for block in module['blocks']
                   if block['kind'] == 'document-paragraph' and ''.join(run['text'] for run in block['runs']) == revision['old']]
        assert len(matches) == 1 and len(matches[0]['runs']) == 1, 'Engineering revision target changed'
        matches[0]['runs'][0]['text'] = revision['new']
    fidelity['revisedParagraphs'] = len(revisions)
    fidelity['approvedCorrections'] = ['Fig. 1The → Fig. 1 The', 'OOD680 → OD680 (680 remains subscript)']
    output = ROOT/'src/content/engineering.generated.json'
    output.write_text(json.dumps(page, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    provenance = {'sourceFile': source.name, 'sourceSha256': digest(source.read_bytes()), 'modules': len(sections), 'figures': figure_number, 'imagePanels': len(assets), 'fidelity': fidelity, 'assets': [{k:v for k,v in asset.items() if k != 'uploadFile'} for asset in assets]}
    (ROOT/'docs/engineering-total-sources.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (review/'source-units.json').write_text(json.dumps(source_units, ensure_ascii=False, indent=2), encoding='utf-8')
    (review/'assets.json').write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'modules': len(sections), 'figures': figure_number, 'panels': len(assets), 'newAssets': sum(a['url'] is None for a in assets), 'sourceUnits': len(source_units)}, indent=2))


if __name__ == '__main__':
    main(Path(sys.argv[1]))
