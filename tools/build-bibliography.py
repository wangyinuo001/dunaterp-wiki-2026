"""Build NLM references from the reviewed bibliographic metadata snapshot."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sentence(text):
    text=text.rstrip(' .')
    return text if text.endswith(('?','!'))else text+'.'
def pages(text):
    match=re.fullmatch(r'([A-Za-z]*)(\d+)[–-]([A-Za-z]*)(\d+)',text)
    if not match or match[1]!=match[3]or len(match[2])!=len(match[4]):return text.replace('–','-')
    start,end=match[2],match[4];cut=0
    while cut<min(len(start),len(end))-1 and start[cut]==end[cut]:cut+=1
    return match[1]+start+'-'+(end[cut:]if cut else match[3]+end)
def format_entry(entry):
    authors=sentence(', '.join(entry['authors']))
    links=[]
    if entry['kind']=='report':
        return {'text':f"{authors} {sentence(entry['title'])} {entry['year']}. {entry.get('notes','')}".strip(),'links':[]}
    if entry['kind']=='article':
        issue='('+entry['issue']+')'if entry.get('issue')else''
        volume=';'+entry['volume']+issue if entry.get('volume')else''
        location=':'+pages(entry['pages'])if entry.get('pages')else''
        text=f"{authors} {sentence(entry['title'])} {sentence(entry['journalAbbr'])} {entry['year']}{volume}{location}."
        if entry.get('doi'):links=[{'prefix':'doi:','label':entry['doi'],'href':'https://doi.org/'+entry['doi']}]
    else:
        medium='dataset'if entry['kind']=='dataset'else'Internet'
        site=entry.get('site','')
        publication=(site+'; 'if site else'')+entry['year']
        text=f"{authors} {entry['title']} [{medium}]. {publication} [cited {entry['cited']}]."
        if entry.get('notes'):text+=' '+entry['notes']
        if entry.get('url'):links=[{'prefix':'Available from:','label':entry['url'],'href':entry['url']}]
    return {'text':text,'links':links}
def main():
    source=json.loads((ROOT/'docs/bibliography-sources.json').read_text(encoding='utf8'))
    entries={key:format_entry(entry)for key,entry in source['records'].items()}
    (ROOT/'src/content/bibliography.generated.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(f'Formatted {len(entries)} references in NLM style')
if __name__=='__main__':main()
