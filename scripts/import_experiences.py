"""Import captured builds into isolated local namespaces, including embedded Flight data."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
import re,json,shutil,hashlib,html
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
for brand,domain in [('baikal','baikal430.ru'),('fizzi','fizzi-demo.vercel.app')]:
    archive=Path('/private/tmp/'+brand+'-reference-assets')
    raw=json.loads((archive/'manifest.json').read_text())
    entries=raw if isinstance(raw,list) else [{'url':u,'path':p} for u,p in raw.items()]
    base='/experiences/'+brand
    mapping={}
    files={}
    for entry in entries:
        url=entry['url'];src=Path(entry['path']);parts=urlsplit(url)
        if not src.exists():continue
        if parts.netloc==domain and parts.path in ('/','/en','/en/'):
            local=base+'/index.html'
        elif parts.netloc==domain and parts.path.rstrip('/')=='/en/where-to-buy':
            local=base+'/where-to-buy/index.html'
        elif parts.netloc==domain and not parts.query:
            local=base+unquote(parts.path)
        elif parts.netloc==domain and parts.path not in ('/_next/image','/api/listing/'):
            local=base+unquote(parts.path)
        else:
            filename=re.sub('[^a-zA-Z0-9._-]','_',unquote(parts.path.rsplit('/',1)[-1])) or 'data.json'
            local=base+'/external/'+hashlib.sha256(url.encode()).hexdigest()[:10]+'-'+filename
        mapping[url]=local
        files[local]=src
    # Root-relative optimized images have distinct query-dependent names.
    replacements={}
    for remote,local in mapping.items():
        replacements[remote]=local
        parts=urlsplit(remote)
        if parts.netloc==domain:
            tail=parts.path+('?' + parts.query if parts.query else '')
            if tail not in ('/','/en','/en/where-to-buy'):
                replacements[tail]=local
    variants={}
    for old,new in replacements.items():
        for alias in {old,html.escape(old,quote=True),old.replace('&','\\u0026')}: variants[alias]=new
    pattern=re.compile('|'.join(('(?<![A-Za-z0-9_/])' if k.startswith('/') else '')+re.escape(k) for k in sorted(variants,key=len,reverse=True)))
    def rewrite(text):
        text=pattern.sub(lambda m:variants[m.group(0)],text)
        for path in (['/_next/','/images/','/fonts/','/favicon/'] if brand=='baikal' else ['/_next/','/hdr/','/fonts/']):
            text=re.sub(r'(?<![\w/])'+re.escape(path),base+path,text)
        return text
    for local,src in files.items():
        dest=DIST/local.lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True)
        if src.suffix.lower() in ('.html','.css','.js','.json','.gltf','.svg') or local.endswith('.html'):
            try:text=src.read_text()
            except UnicodeDecodeError:shutil.copyfile(src,dest);continue
            text=rewrite(text)
            if local.endswith('.html'):
                # Insert before runtime, without reserializing React's SSR markup.
                text=text.replace('<html ',f'<html data-brand="{brand}" ',1)
                text=text.replace('<head>', '<head><script src="/integration/bridge.js"></script>',1)
                # Disable only tracking scripts. Layout and product runtime remain local.
                text=re.sub(r'<noscript>.*?mc\.yandex.*?</noscript>','',text,flags=re.S)
                text=text.replace('https://static.cdn.prismic.io/prismic.js?new=true&amp;repo=fizzi-demo','/integration/noop.js')
                text=text.replace('https://static.cdn.prismic.io/prismic.js?new=true&repo=fizzi-demo','/integration/noop.js')
            # Disable injected tracking and editorial preview integrations.
            text=text.replace('https://mc.yandex.ru/metrika/tag.js','/integration/noop.js')
            text=text.replace('https://px.adhigh.net/t.js','/integration/noop.js')
            text=text.replace('https://static.cdn.prismic.io/prismic.js','/integration/noop.js')
            dest.write_text(text)
        else:shutil.copyfile(src,dest)
    (ROOT/(brand+'-asset-manifest.json')).write_text(json.dumps(mapping,ensure_ascii=False,indent=2))
    print(brand,len(mapping),'URL mappings',len(files),'files')
(DIST/'integration/noop.js').write_text('/* External analytics and editorial toolbar intentionally disabled. */')
