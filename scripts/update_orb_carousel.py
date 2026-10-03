"""Install the readable carousel module without changing other Fizzi components."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'design-source/orb-carousel-module.js').read_text()
prefix = 'const ORB_CAROUSEL_MODULE = '
assert source.count(prefix) == 1
module = source.split(prefix, 1)[1].strip().removesuffix(';')
assert module.startswith('function(')
chunk = root / 'dist/experiences/fizzi/_next/static/chunks/942-919c3dfdb19288ef.js'
text = chunk.read_text()
start = text.index(',91:function(') + 1
end = text.index(',9090:function(', start)
chunk.write_text(text[:start] + '91:' + module + text[end:])
print('Updated Fizzi carousel module 91 only.')
