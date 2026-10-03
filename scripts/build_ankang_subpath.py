"""Build an isolated /ankang/ deployment without changing local preview URLs."""
from pathlib import Path
import re, shutil
root=Path(__file__).resolve().parents[1]
out=root/'output/ankang-site'
shutil.copytree(root/'dist',out,dirs_exist_ok=True)
names=['assets','brand','experiences','integration','agua-serrana','contactos','politica-de-privacidade','projeto','sobre-nos','replica.css','replica.js']
pattern=re.compile(r'(?<![\w./:\\-])/(?:'+ '|'.join(re.escape(x) for x in names)+r')(?=[/\s?"\x27`\\)#]|$)')
changed=0
for p in out.rglob('*'):
 if p.suffix.lower() not in {'.html','.css','.js','.json','.gltf','.svg','.txt','.xml'}:continue
 s=p.read_text()
 t=pattern.sub(lambda m:'/ankang'+m.group(),s)
 t=t.replace('href="/"','href="/ankang/"')
 if t!=s:p.write_text(t);changed+=1
print('Built /ankang/ deployment:',changed,'text files adapted')
