from pathlib import Path
from bs4 import BeautifulSoup
import re,json,shutil,html
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';CACHE=ROOT/'.cache/unbranded'
# Save exact imported text before personalizing; repeated runs always start from this snapshot.
paths=[D/'experiences/serrana/index.html', *list((D/'experiences/baikal').rglob('*.html')), *list((D/'experiences/fizzi').rglob('*.html')), *list((D/'experiences/baikal/_next').rglob('*.js')), *list((D/'experiences/fizzi/_next').rglob('*.js'))]
for p in paths:
 c=CACHE/p.relative_to(D);c.parent.mkdir(parents=True,exist_ok=True)
 if not c.exists():shutil.copyfile(p,c)
brand='安康硒谷'
S={
'Serrana':'安康硒谷','Água Serrana':'安康硒谷','Água 安康硒谷':'安康硒谷',
'Sobre nós':'品牌故事','Sobre Nós':'品牌故事','Produtos':'瓶身作品','Sustentabilidade':'设计理念','Contactos':'联系品牌',
'Do coração da Serra do Caramulo':'一瓶来自安康的山水',
'A Água Serrana é uma água natural que nasce do coração da Serra do Caramulo. Com uma paisagem deslumbrante, é impossível não se obter uma água pura e cristalina.':'从秦巴山水到汉江之滨，安康硒谷把对这片土地的想象，收进一只修长通透的玻璃瓶。',
'Sem qualquer tratamento químico e com qualidades únicas, a Água Serrana é hipossalina, isto é, uma água pouco mineralizada.':'银色瓶盖映照天光，瓶底山峰与水纹交叠。Se·34 标记，让每一次举起都看见安康。',
'Descubra a singularidade desta água tão natural!':'山水的灵感，握在手中。','Descobrir':'探索作品','O SEGREDO DA NATUREZA':'让自然的力量与你相遇',
'newsletter':'品牌灵感','Sacie a sede de conhecimento e fique a par de todas as novidades.':'关于安康硒谷的新灵感，与你分享。',
'Concordo com a ':'我已阅读并同意','Política de Privacidade':'隐私说明','Subscrever':'订阅消息','Aguarde por favor...':'请稍候…',
'2022 © Água Serrana. Todos os Direitos Reservados.':'© 2026 安康硒谷 · SE·34','História':'品牌故事','Serra do Caramulo':'秦巴山水','Certificações':'瓶身细节','Qualidade':'设计语言',
'Oops! Something went wrong while submitting the form.':'暂未连接消息服务，请稍后再试。'
}
B={
'BAIKALSEA Company':'安康硒谷','BAIKAL 430':'安康硒谷','BAIKAL430':'SE·34','Uniqueness':'瓶身美学','Sources':'山水灵感','Contacts':'品牌故事','Where to buy':'探索作品',
'Relict water from a depth of the Lake Baikal | BAIKAL430':'安康硒谷 · 山水之境',
'BAIKAL430 is relict water from Lake Baikal at a depth of 430 meters. This unique layer has remained pristine, embodying the strength and unwavering tranquility of the great lake.':'安康硒谷 SE·34 瓶身设计，银色、玻璃与山水灵感相遇。',
'Relict water&nbsp;from a depth&nbsp;of the Lake Baikal':'一瓶山水，<br>一座安康',
'Water <br>created by nature millions years ago':'把山水<br>收进一只玻璃瓶',
'Power <br>obtained from the depths':'山水有形<br>灵感无界',
'We take water in places where nothing can affect its composition':'以秦巴山水为灵感，让透明的瓶身盛下天光与山色。',
'Water is extracted<br>from a depth of&nbsp;':'硒元素<br>标识灵感',
'Ultra-light mineralization':'让自然的力量与你相遇','Oxygen saturation':'山水意象','Main composition, mg/l':'瓶身设计语言','0.12 g/l':'SE·34','up to':'安康硒谷',
'Convenience in every package':'一瓶，融入每种日常',
'BAIKAL430 is offered in a variety of packaging formats to ensure that you can always have water you trust.':'安康硒谷 SE·34，把山水之美带到身边。在路上，在餐桌，也在每一个想停留的瞬间。',
'0.45 L':'随行之美','0.85 L':'日常之美','Easy to carry along':'把山水带在身边','To satisfy thirst <br>throughout the day':'让每次举杯<br>都有风景','To satisfy thirst throughout the day':'让每次举杯都有风景',
'Packaging options':'设计细节','Ideal for travel and exercise':'修长的流线轮廓','A little more to share':'银色的流线瓶盖','5 L':'山水瓶底','9 L':'Se·34 印记','For use at home and trips to the countryside cottage':'秦巴群峰与汉江水纹','For office use':'以硒元素符号为灵感',
'✦ maintain fluid balance':'✦ 山水在侧','For those who choose stability':'把从容，留给日常',
'BAIKAL430 is for those who strive for inner peace and confidence in any circumstances':'一瓶来自安康的灵感。把片刻清澈，留在属于自己的生活里。',
'✦ gallery':'✦ 生活场景 · AI 创意影像','Buy Online':'探索瓶身','Find a Store':'品牌故事','About the company':'认识安康硒谷',
'All production processes are specially set up in such a way as to keep the Baikal ecosystem intact':'以安康的自然、文化与生活为灵感，让瓶身成为可以握住的山水。',
'BAIKALSEA<sup>&reg;</sup> Company is a Russian producer of Baikal water in the premium segment. The Company is adhering to core principles of transparency and respect for nature':'安康硒谷<br>让自然的力量<br>与你相遇',
'By using this website, you consent to the use of <a href=\'#\'>cookies.</a>':'本页仅在本机保存浏览偏好。','Agree':'知道了','Reject':'关闭'
}
F={
'Fizzi - Soda for Gutsy People':'安康硒谷 · 活力之境','Live Gutsy':'LIVE PURE','Soda Perfected':'安康硒谷 · SE·34',
'3-5g sugar. 9g fiber. 5 delicious flavors.':'秦巴山水 · 汉江之滨 · 山水安康','Shop Now':'探索系列',
'Try all five flavors':'Six shades of nature',
'Our soda is made with real fruit juice and a touch of cane sugar. We never use artificial sweeteners or high fructose corn syrup. Try all five flavors and find your favorite!':'六种配色，六种安康灵感。以山水的青、汉江的蓝、日光的金和生活的鲜明，呈现同一只瓶的不同表情。',
'Dive into better health':'DIVE INTO NATURE','Choose Your Flavor':'选择你的山水','Previous flavor':'上一款设计','Next flavor':'下一款设计',
'Black Cherry':'秦巴 · 山之灵','Lemon Lime':'汉江 · 水之灵','Grape':'紫阳 · 茶之灵','Watermelon':'汉调 · 文化之灵','Strawberry Lemonade':'安康 · 和顺安康','12 cans - $35.99':'SE·34 · 安康硒谷设计系列',
'Gut-Friendly Goodness':'把山水，收进瓶身',
'Our soda is packed with prebiotics and 1 billion probiotics, giving your gut the love it deserves. Say goodbye to bloating and hello to a happy, healthy digestive system with every sip.':'瓶底以起伏山峰与流动水纹为灵感。光线穿过玻璃，秦巴与汉江的意象也有了新的表达。',
'Light Calories, Big Flavor':'一抹银色，映照天光',
'Indulge in bold, refreshing taste without the guilt. At just 20 calories per can, you can enjoy all the flavor you crave with none of the compromise.':'流线型银色瓶盖，与通透瓶身相互呼应。简洁的轮廓，让材质、光线与握持的感受成为主角。',
'Naturally Refreshing':'一眼，就记住安康',
'Made with only the best natural ingredients, our soda is free from artificial sweeteners and flavors. It’s a crisp, clean taste that feels as good as it tastes, giving you a boost of real, natural refreshment.':'圆形 Se·34 标识与修长瓶身构成鲜明的记忆点。从细节出发，让关于安康的故事有形可见。',
'Soda':'Water','that makes you':'inspired by','Smile':'ANKANG','Fizzi':'安康硒谷','All Fizzi can flavors':'安康硒谷 SE·34 瓶身系列'
}
def replace_text(text,table):
    # Handle original HTML, JS string content, and nested Flight-serialized string forms.
    variants={}
    for old,new in table.items():
        pairs=[(old,new),(html.escape(old,quote=False),html.escape(new,quote=False))]
        a,b=old,new
        for i in range(3):
            a=json.dumps(a,ensure_ascii=False)[1:-1];b=json.dumps(b,ensure_ascii=False)[1:-1]
            pairs.append((a,b))
            pairs.append((a.replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026'),b))
        variants.update(pairs)
    pattern=re.compile('|'.join(re.escape(k) for k in sorted(variants,key=len,reverse=True)))
    return pattern.sub(lambda m:variants[m.group(0)],text)
for p in paths:
    text=(CACHE/p.relative_to(D)).read_text()
    brandkey=p.relative_to(D).parts[1]
    text=replace_text(text, {'serrana':S,'baikal':B,'fizzi':F}[brandkey])
    if brandkey=='baikal' and p.suffix=='.js':
        text=text.replace('function a(e){let{pixelId:', 'function a(e){return null;let{pixelId:')
        text=re.sub(r'return r\.path\+"\?url=".*?\(n\.startsWith\("/experiences/baikal/_next/static/media/"\),""\)', 'return n', text)
    if brandkey=='fizzi' and p.suffix=='.js':
        text=text.replace('let r=new URL(e);','let r=new URL(e,location.origin);')
        text=text.replace('return t.path+"?url="+encodeURIComponent(r)+"&w="+n+"&q="+(a||75)','return r')
    if p.suffix=='.html':
        text=text.replace('</head>','<link rel="stylesheet" href="/brand/personalize.css"><script defer src="/brand/personalize.js"></script></head>')
        text=text.replace('<html ', '<html lang="zh-CN" ',1) if 'lang=' not in text[:400] else re.sub('lang="[^"]+"','lang="zh-CN"',text,count=1)
        if brandkey=='serrana':
            soup=BeautifulSoup(text,'html.parser')
            for el in soup.select('img'):
                if 'new_bottle' in el.get('src',''):
                    el['src']='/brand/se34-bottle.png';el.attrs.pop('srcset',None);el['alt']='安康硒谷 SE·34 玻璃瓶'
                if 'serrana-logo' in el.get('src','') or 'Group_21' in el.get('src',''):el['src']='/brand/wordmark.svg'
                if 'type.svg' in el.get('src',''):el['src']='/brand/hero-type.svg'
            for a in soup.select('a[href]'):
                if any(h in a['href'] for h in ('facebook.com','linkedin.com','instagram.com','avitamina.pt')):a.decompose()
            for el in soup.select('.div-block-13,.div-block-12,.footer-lottie,.youtube,.background-video-2,.lightbox-link'):el.decompose()
            for el in soup.select('.video-cover'):
                el['src']='/brand/lifestyle-3.png';el.attrs.pop('srcset',None)
            text=str(soup)
        else:
            # All product cutouts are bound through both SSR and embedded component props.
            manifest=json.loads((ROOT/(brandkey+'-asset-manifest.json')).read_text())
            if brandkey=='baikal':
                for remote,local in sorted(manifest.items(),key=lambda x:-len(x[0])):
                    if 'formats-card-image-' in remote and ('image-1' in remote or 'image-2' in remote):text=text.replace(local,'/brand/se34-bottle.png')
            if brandkey=='fizzi':
                for remote,local in manifest.items():
                    if 'all-cans-bunched' in remote:text=text.replace(local,'/brand/se34-bottle.png')
    p.write_text(text)
# Update shared top-level identity.
p=D/'index.html';s=p.read_text();s=re.sub(r'<title>.*?</title>','<title>安康硒谷 · SE·34｜一瓶山水安康</title>',s)
s=s.replace('SERRANA','山水之境').replace('BAIKAL 430','瓶身之境').replace('FIZZI','活力之境').replace('Água Serrana','安康硒谷 · 山水之境').replace('Fizzi','安康硒谷 · 活力之境').replace('三个品牌','安康硒谷三段')
p.write_text(s)
print('Personalized 3 experiences:',len(paths),'text files')
