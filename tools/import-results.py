"""Import Results_总.docx verbatim into the shared Project article components.

Source wording, run emphasis, figure numbering and table order are retained.
Only delivery encoding and the crops already stored in Word are applied to images.
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

ROOT = Path(__file__).resolve().parents[1]
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
MODULES = {0: 'CPP2146', 43: 'β-Ionone', 98: 'Crocetin', 131: 'Astaxanthin', 157: 'β-Citraurin', 224: 'Biosafety'}
HEADINGS = {2, 10, 15, 21, 28, 34, 40, 44, 57, 62, 70, 79, 83, 93,
            100, 108, 112, 117, 123, 127, 133, 139, 143, 149, 153,
            158, 169, 174, 182, 192, 201, 216, 226, 244, 256}
SUBHEADINGS = {228, 236, 246, 254, 258, 271}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def props(node):
    result = {}
    if node is not None:
        for key, name in [('i', 'italic'), ('b', 'bold'), ('vertAlign', 'verticalAlign')]:
            value = node.find(W + key)
            if value is not None:
                raw = value.get(W + 'val', 'true')
                result[name] = raw not in ('0', 'false', 'off') if key != 'vertAlign' else raw
    return result


def main(source):
    archive = ZipFile(source)
    document = ET.fromstring(archive.read('word/document.xml'))
    assert not list(document.iter(W+'ins')) and not list(document.iter(W+'del')), 'Tracked changes need review'
    styles = ET.fromstring(archive.read('word/styles.xml'))
    style_index = {s.get(W+'styleId'): s for s in styles.findall(W+'style')}
    default_p = next((key for key, style in style_index.items() if style.get(W+'default') == '1' and style.get(W+'type') == 'paragraph'), None)
    defaults = props(styles.find(W+'docDefaults/'+W+'rPrDefault/'+W+'rPr'))
    relationships = {r.get('Id'): r for r in ET.fromstring(archive.read('word/_rels/document.xml.rels'))}

    def style_props(key, seen=None):
        seen = set() if seen is None else seen
        if key not in style_index or key in seen:
            return {}
        seen.add(key)
        style = style_index[key]
        base = style.find(W+'basedOn')
        return {**(style_props(base.get(W+'val'), seen) if base is not None else {}), **props(style.find(W+'rPr'))}

    def runs(paragraph):
        pstyle = paragraph.find(W+'pPr/'+W+'pStyle')
        base = {**defaults, **style_props(pstyle.get(W+'val') if pstyle is not None else default_p)}
        result = []

        def visit(container, href=None):
            for child in container:
                if child.tag == W+'hyperlink':
                    rel = relationships.get(child.get(R+'id'))
                    target = rel.get('Target') if rel is not None else None
                    visit(child, target if target and re.match(r'^(https?://|mailto:)', target) else None)
                elif child.tag == W+'r':
                    text = ''.join((n.text or '') if n.tag == W+'t' else '\t' if n.tag == W+'tab' else '\n' if n.tag in (W+'br', W+'cr') else '' for n in child)
                    if not text:
                        continue
                    rstyle = child.find(W+'rPr/'+W+'rStyle')
                    fmt = {**base, **(style_props(rstyle.get(W+'val')) if rstyle is not None else {}), **props(child.find(W+'rPr'))}
                    fmt = {k: v for k, v in fmt.items() if v is True or (k == 'verticalAlign' and v in ('subscript', 'superscript'))}
                    if href:
                        fmt['href'] = href
                    if result and {k: v for k, v in result[-1].items() if k != 'text'} == fmt:
                        result[-1]['text'] += text
                    else:
                        result.append({'text': text, **fmt})
                elif child.tag not in (W+'pPr', W+'del'):
                    visit(child, href)
        visit(paragraph)
        return result

    cdn = json.loads((ROOT/'docs/igem-cdn-assets.json').read_text(encoding='utf-8'))
    known = {entry[key]: entry for entry in cdn for key in ('sha256', 'sourceSha256') if key in entry}
    sections, units, assets = [], [], []
    section = None
    pending = []
    table_caption = None
    figure_count = 0
    upload = ROOT/'work/results-upload'
    upload.mkdir(parents=True, exist_ok=True)

    for index, node in enumerate(document.find(W+'body')):
        if node.tag == W+'tbl':
            assert not pending
            cells = [[[run for p in cell.findall(W+'p') for run in runs(p)] for cell in row.findall(W+'tc')] for row in node.findall(W+'tr')]
            text_rows = [[''.join(r['text'] for r in cell) for cell in row] for row in cells]
            caption_runs = table_caption or []
            section['blocks'].append({'kind': 'table', 'caption': ''.join(r['text'] for r in caption_runs), 'captionRuns': caption_runs,
                                      'columns': text_rows[0], 'rows': text_rows[1:], 'columnRuns': cells[0], 'cellRuns': cells[1:]})
            units.append({'bodyIndex': index, 'type': 'table', 'cells': cells})
            table_caption = None
            continue
        if node.tag != W+'p':
            continue
        paragraph = runs(node)
        text = ''.join(r['text'] for r in paragraph)
        if text:
            units.append({'bodyIndex': index, 'type': 'paragraph', 'runs': paragraph})
        if index in MODULES:
            assert not pending and table_caption is None
            section = {'title': text, 'titleRuns': paragraph, 'tocTitle': MODULES[index], 'body': '', 'blocks': []}
            sections.append(section)
            continue
        drawings = list(node.iter(A+'blip'))
        if drawings:
            for panel, blip in enumerate(drawings):
                member = str(PurePosixPath('word') / relationships[blip.get(R+'embed')].get('Target'))
                data = archive.read(member)
                image = Image.open(io.BytesIO(data))
                original = image.copy()
                rect = node.find('.//'+A+'srcRect') if len(drawings) == 1 else None
                crop = {side: int(rect.get(side, '0')) for side in ('l', 't', 'r', 'b')} if rect is not None else None
                if crop:
                    width, height = image.size
                    image = image.crop((round(width*crop['l']/100000), round(height*crop['t']/100000), round(width*(1-crop['r']/100000)), round(height*(1-crop['b']/100000))))
                encoded = io.BytesIO()
                image.save(encoded, format='WEBP', lossless=True, method=6)
                converted = encoded.getvalue()
                existing = known.get(sha(data)) if not crop else None
                existing = existing or known.get(sha(converted))
                name = f'results-{figure_count+1:02d}-{len(pending)+1}-{sha(converted)[:12]}.webp'
                key = existing['source'] if existing else 'figures/results/'+name
                destination = ROOT/'public'/key
                destination.parent.mkdir(parents=True, exist_ok=True)
                if not existing:
                    destination.write_bytes(converted)
                    (upload/name).write_bytes(converted)
                elif not destination.exists():
                    if destination.suffix == '.webp':
                        destination.write_bytes(converted)
                    else:
                        destination.write_bytes(data)
                assert Image.open(io.BytesIO(converted)).convert('RGBA').tobytes() == image.convert('RGBA').tobytes()
                figure = {'src': '/'+key, 'alt': f'Results Figure {figure_count+1}, panel {len(pending)+1}', 'caption': text,
                          'captionRuns': paragraph, 'width': image.width, 'height': image.height}
                pending.append(figure)
                assets.append({'figure': figure_count+1, 'bodyIndex': index, 'source': member, 'sourceSha256': sha(data),
                               'output': key, 'sha256': sha(destination.read_bytes()), 'bytes': destination.stat().st_size,
                               'originalWidth': original.width, 'originalHeight': original.height, 'width': image.width,
                               'height': image.height, 'crop': crop, 'url': existing['url'] if existing else None,
                               'pixelsMatchWordCrop': True})
            continue
        if not text:
            continue
        if re.match(r'^(?:Figure|Fig\.?)\s*\d+', text):
            assert pending, f'Caption without image at {index}'
            figure_count += 1
            assert int(re.search(r'\d+', text).group()) == figure_count
            if len(pending) == 1:
                block = {'kind': 'figure', **pending[0], 'caption': text, 'captionRuns': paragraph, 'alt': text}
            else:
                block = {'kind': 'figure-grid', 'figures': pending, 'caption': text, 'captionRuns': paragraph}
                if figure_count != 3:
                    block['className'] = 'results-figure-stack'
            section['blocks'].append(block)
            pending = []
            continue
        assert not pending, f'Uncaptioned image before paragraph {index}'
        if re.match(r'^Table\s*\d+', text):
            table_caption = paragraph
        elif index in HEADINGS or index in SUBHEADINGS:
            section['blocks'].append({'kind': 'document-heading', 'text': text, 'runs': paragraph, 'level': 4 if index in SUBHEADINGS else 3})
        elif index in (194, 195):
            if section['blocks'] and section['blocks'][-1]['kind'] == 'document-list':
                section['blocks'][-1]['items'].append(paragraph)
            else:
                section['blocks'].append({'kind': 'document-list', 'items': [paragraph]})
        else:
            section['blocks'].append({'kind': 'document-paragraph', 'runs': paragraph})

    assert not pending and table_caption is None
    assert len(sections) == 6 and figure_count == 42 and len(assets) == 46
    assert sum(b['kind'] == 'table' for s in sections for b in s['blocks']) == 10

    def chars(text_runs):
        return [(char, bool(run.get('italic')), bool(run.get('bold')), run.get('verticalAlign'), run.get('href'))
                for run in text_runs for char in run['text'] if not char.isspace()]

    expected, imported = [], []
    for unit in units:
        if unit['type'] == 'paragraph':
            expected += chars(unit['runs'])
        else:
            for row in unit['cells']:
                for cell in row:
                    expected += chars(cell)
    for module in sections:
        imported += chars(module['titleRuns'])
        for block in module['blocks']:
            if block['kind'] in ('document-paragraph', 'document-heading'):
                imported += chars(block['runs'])
            elif block['kind'] == 'document-list':
                for item in block['items']:
                    imported += chars(item)
            elif block['kind'] == 'table':
                imported += chars(block['captionRuns'])
                for row in [block['columnRuns'], *block['cellRuns']]:
                    for cell in row:
                        imported += chars(cell)
            else:
                if block['kind'] == 'figure-grid':
                    for panel in block['figures']:
                        imported += chars(panel['captionRuns'])
                imported += chars(block['captionRuns'])
    assert imported == expected, 'Document text/run-formatting fidelity check failed'
    raw = ''.join(t.text or '' for t in document.iter(W+'t'))
    assert ''.join(raw.split()) == ''.join(char[0] for char in expected), 'Unmapped Word text'

    page = {'title': 'Results', 'eyebrow': 'Results', 'intro': '', 'status': 'review-ready', 'references': [], 'sections': sections}
    (ROOT/'src/content/results.generated.json').write_text(json.dumps(page, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    manifest = {'sourceDocument': str(source), 'documentSha256': sha(source.read_bytes()), 'wordingChanged': False,
                'moduleOrder': list(MODULES.values()), 'figures': figure_count, 'imagePanels': len(assets), 'tables': 10,
                'fidelity': {'textAndFormattingMatch': True, 'sourceUnits': len(units), 'charactersVerified': len(imported),
                             'italicCharacters': sum(c[1] for c in imported), 'subscriptCharacters': sum(c[3] == 'subscript' for c in imported)},
                'assets': assets, 'sourceUnits': units}
    (ROOT/'docs/results-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    for filename in ('deploy-assets.json', 'local-assets.json'):
        target = ROOT/'src/content'/filename
        mapping = json.loads(target.read_text(encoding='utf-8'))
        for asset in assets:
            mapping[asset['output']] = (asset['url'] or asset['output']) if filename == 'deploy-assets.json' else asset['output']
        target.write_text(json.dumps(mapping, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'sections': len(sections), 'figures': figure_count, 'imagePanels': len(assets), 'tables': 10,
                      'charactersVerified': len(imported), 'pendingOfficialUploads': sum(not a['url'] for a in assets)}, ensure_ascii=False))


if __name__ == '__main__':
    main(Path(sys.argv[1]))
