"""Relabel the archived vector figure without changing molecular geometry."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT/'public/figures/dry-lab/tf2146-structure.svg'
OUTPUT = ROOT/'public/figures/dry-lab/cpp2146-structure.svg'
SVG = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', SVG[1:-1])
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
tree = ET.parse(SOURCE)
root = tree.getroot()
header = next(node for node in root.iter() if node.get('id') == 'text_1')
old_label = header.find(SVG+'g')
x, y = re.search(r'translate\(([-.\d]+) ([-.\d]+)\)', old_label.get('transform')).groups()
geometry_before = [ET.tostring(node) for node in root.iter(SVG+'path') if not any(node is item for item in header.iter())]
header.clear()
header.set('id', 'text_1')
text = ET.SubElement(header, SVG+'text', {'x': x, 'y': y, 'fill': '#173f35', 'font-family': 'Arial, DejaVu Sans, sans-serif', 'font-size': '15', 'font-weight': '700'})
text.text = 'CPP2146 · CXC-RICH N-TERMINAL STRUCTURE'
for node in root.iter():
    if node.tag.endswith('title') and node.text:
        node.text = node.text.replace('TF2146', 'CPP2146')
geometry_after = [ET.tostring(node) for node in root.iter(SVG+'path')]
assert geometry_before == geometry_after, 'Structure geometry changed'
serialized = ET.tostring(root, encoding='utf-8', xml_declaration=True)
OUTPUT.write_bytes(b'\n'.join(line.rstrip() for line in serialized.splitlines()) + b'\n')
print(f'Wrote {OUTPUT.name}; molecular geometry unchanged')
