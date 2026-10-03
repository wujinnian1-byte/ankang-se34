from pathlib import Path
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
import re,json,subprocess
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
errors=[]
manifest=json.loads((root/'asset-manifest.json').read_text())
for page in dist.rglob('*.html'):
    soup=BeautifulSoup(page.read_text(),'html.parser')
    for el in soup.find_all(True):
        for attr in ['src','href','data-src','poster','data-poster-url']:
            ref=el.get(attr,'')
            if not ref or not ref.startswith('/') or ref.startswith('//'): continue
            path=dist/unquote(urlsplit(ref).path).lstrip('/')
            if not path.is_file() and not (path/'index.html').is_file(): errors.append(f'{page.relative_to(dist)}: missing {ref}')
        if el.name=='form' and el.get('data-replica-form')!='true': errors.append('Unsafe form: '+str(page))
    if 'googletagmanager.com' in page.read_text(): errors.append('Analytics remain: '+str(page))
for css in dist.rglob('*.css'):
    for ref in re.findall(r'url\(["\']?([^\)"\']+)',css.read_text()):
        if ref.startswith('/') and not (dist/unquote(urlsplit(ref).path).lstrip('/')).is_file(): errors.append(f'{css.name}: missing {ref}')
for js in dist.rglob('*.js'):
    result=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
    if result.returncode: errors.append(f'{js.name}: {result.stderr}')
print(json.dumps({'pages':manifest['pages'],'assets':len(manifest['assets']),'errors':errors},ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
