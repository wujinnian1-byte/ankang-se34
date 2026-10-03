"""Reproducible static mirror of the public reference; no analytics or form forwarding."""
from pathlib import Path
from urllib.parse import urlsplit, urljoin, unquote
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup
import re, json, hashlib, subprocess, threading, html

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
CACHE = ROOT / '.cache'
BASE = 'https://www.aguaserrana.pt'
for path in [OUT / 'assets', CACHE]: path.mkdir(parents=True, exist_ok=True)
MAPPING = {}
LOCK = threading.Lock()
FAILURES = []
CSS_URL = r'''url\(\s*((?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|(?:\\.|[^)])*))\s*\)'''

def clean_css_url(value):
    return re.sub(r'\\(.)', r'\1', value.strip("\"' "))

ASSET_HOSTS = {'cdn.prod.website-files.com', 'uploads-ssl.webflow.com', 'assets.website-files.com', 'd3e54v103j8qbb.cloudfront.net', 'ajax.googleapis.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.gstatic.com', 'fonts.googleapis.com'}
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

def fetch(url):
    key = hashlib.sha256(url.encode()).hexdigest()
    cached = CACHE / key
    if not cached.exists():
        result = subprocess.run(['curl','-fsSL','--retry','2','--connect-timeout','15','--max-time','120','-A',UA,url,'-o',str(cached)],capture_output=True)
        if result.returncode: raise RuntimeError(url + ': ' + result.stderr.decode()[-200:])
    return cached.read_bytes()

def route_path(url):
    p = urlsplit(url).path.rstrip('/') or '/'
    return p

pages = {}
queue = ['/']
while queue:
    route = queue.pop(0)
    if route in pages: continue
    raw = fetch(BASE + route).decode('utf-8')
    pages[route] = raw
    soup = BeautifulSoup(raw,'html.parser')
    for a in soup.find_all('a',href=True):
        u = urljoin(BASE+route, a['href'])
        p = urlsplit(u)
        if p.netloc in ('www.aguaserrana.pt','aguaserrana.pt') and not re.search(r'\.[a-zA-Z0-9]{2,6}$',p.path):
            nr = route_path(u)
            if nr not in pages and nr not in queue: queue.append(nr)
    print('Page:',route,flush=True)

# Fetch all rendered resources, responsive variants, inline backgrounds, and animation data.
def extract_urls(text):
    urls = set()
    for u in re.findall(r'https?://[^\s<>"\'\\,]+', html.unescape(text)):
        # CSS strings use quoted URLs; parentheses within asset names are intentional.
        if urlsplit(u).netloc in ASSET_HOSTS and urlsplit(u).path not in ('','/'):
            urls.add(u.rstrip(';'))
    return urls

def asset_path(url):
    base = unquote(urlsplit(url).path.rsplit('/',1)[-1])
    base = re.sub(r'[^a-zA-Z0-9._-]','_',base)[:180] or 'resource'
    if urlsplit(url).netloc == 'fonts.googleapis.com': base='google-fonts.css'
    return '/assets/' + hashlib.sha256(url.encode()).hexdigest()[:10] + '-' + base

def download_asset(url):
    local = asset_path(url)
    data = fetch(url)
    (OUT / local.lstrip('/')).write_bytes(data)
    with LOCK: MAPPING[url] = local
    extra = set()
    if local.endswith(('.css','.json')):
        text = data.decode('utf-8')
        if local.endswith('.css'):
            for match in re.findall(CSS_URL,text):
                match=clean_css_url(match)
                if not match.startswith('data:'): extra.add(urljoin(url,match))
        else: extra.update(extract_urls(text))
    return extra

urls = set().union(*(extract_urls(s) for s in pages.values()))
urls = {u for u in urls if 'webfont/1.6.26' not in u and 'dat-gui' not in u}
urls.add('https://fonts.googleapis.com/css?family=Lato:100,100italic,300,300italic,400,400italic,700,700italic,900,900italic%7CPoppins:300,400,500,600,800%7CLexend+Zetta:400,600,700,800&display=swap')
seen = set()
while urls:
    batch=sorted(urls-seen)
    if not batch: break
    seen.update(batch)
    print('Downloading',len(batch),'assets',flush=True)
    urls=set()
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures={pool.submit(download_asset,u):u for u in batch}
        for i, future in enumerate(as_completed(futures),1):
            try: urls.update(future.result())
            except Exception as e: FAILURES.append(str(e));print('FAILED',e,flush=True)
            if i%30==0: print('Assets',i,'/',len(batch),flush=True)

# Rebase relative and absolute CSS references without touching data URIs.
for url, local in list(MAPPING.items()):
    file=OUT/local.lstrip('/')
    if local.endswith('.css'):
        text=file.read_text()
        def css_url(m):
            raw=clean_css_url(m.group(1))
            resolved=urljoin(url,raw)
            return 'url("'+MAPPING.get(resolved,raw)+'")'
        text=re.sub(CSS_URL,css_url,text)
        file.write_text(text)
    elif local.endswith('.json'):
        text=file.read_text()
        for remote,target in sorted(MAPPING.items(),key=lambda x:-len(x[0])): text=text.replace(remote,target)
        file.write_text(text)

font_css = next(v for k,v in MAPPING.items() if urlsplit(k).netloc=='fonts.googleapis.com')
for route, raw in pages.items():
    soup=BeautifulSoup(raw,'html.parser')
    soup.html['lang']='pt'
    # Keep Webflow interaction IDs, while removing the original analytics connection.
    for script in list(soup.find_all('script')):
        src=script.get('src','')
        text=script.string or ''
        if 'googletagmanager' in src or 'webfont/1.6.26' in src or 'dat-gui' in src or 'WebFont.load' in text or "gtag('" in text:
            script.decompose()
    for link in list(soup.find_all('link',rel='preconnect')): link.decompose()
    link=soup.new_tag('link',rel='stylesheet',href=font_css)
    soup.head.append(link)
    for tag in soup.find_all('a',href=True):
        u=urljoin(BASE+route,tag['href'])
        p=urlsplit(u)
        if p.netloc in ('www.aguaserrana.pt','aguaserrana.pt','serranawebsite.webflow.io'):
            tag['href']=route_path(u)+('#'+p.fragment if p.fragment else '')
    for form in soup.find_all('form'):
        form['action']='#'
        form['data-replica-form']='true'
        form['aria-label']=form.get('data-name','Formulário')
    # Use direct video embeds, preserving the native lightbox UI.
    for script in soup.find_all('script',class_='w-json'):
        try:
            obj=json.loads(script.string)
            for item in obj.get('items',[]):
                match=re.search(r'(?:v=|embed/)([a-zA-Z0-9_-]{11})',item.get('url',''))
                if match:
                    item['html']='<iframe src="https://www.youtube-nocookie.com/embed/'+match[1]+'?autoplay=1" width="940" height="528" title="Água Serrana" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
            script.string=json.dumps(obj,ensure_ascii=False)
        except (ValueError,TypeError): pass
    text=str(soup)
    for remote,target in sorted(MAPPING.items(),key=lambda x:-len(x[0])):
        text=text.replace(remote,target).replace(html.escape(remote,quote=True),target)
    text=text.replace('</head>','<script defer src="/replica.js"></script><link rel="stylesheet" href="/replica.css"/></head>')
    # Local output follows clean route paths and works with plain static servers.
    dest=OUT / route.strip('/') / 'index.html' if route!='/' else OUT/'index.html'
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(text)

(ROOT/'asset-manifest.json').write_text(json.dumps({'source':BASE,'pages':list(pages),'assets':MAPPING,'failures':FAILURES},ensure_ascii=False,indent=2))
print(json.dumps({'pages':list(pages),'asset_count':len(MAPPING),'failures':FAILURES,'megabytes':round(sum(x.stat().st_size for x in OUT.rglob('*') if x.is_file())/1024/1024,2)},ensure_ascii=False),flush=True)
if FAILURES: raise SystemExit(1)
