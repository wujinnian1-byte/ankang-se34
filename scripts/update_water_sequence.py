"""Synchronize the water sequence and the adjoining Lead blackout only."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20261004-water-v4"
chunk_path = ROOT / "dist/experiences/baikal/_next/static/chunks/539-56c7674de5e8a087.js"
source = (ROOT / "design-source/water-sequence-module.js").read_text()
prefix = "const WATER_SEQUENCE_MODULE = "
assert source.count(prefix) == 1
module = source.split(prefix, 1)[1].strip().removesuffix(";")
assert module.startswith("function(e,t,r){") and module.endswith("}")
text = chunk_path.read_text()
pattern = re.compile(r",9814:(?:\(e,t,r\)=>|function\(e,t,r\))\{.*\}\}\]\);\s*$", re.S)
assert len(pattern.findall(text)) == 1, "Expected SectionSequence as the final module"
updated = pattern.sub(lambda _: ",9814:" + module + "}]);\n", text)

# Keep Lead's masks, text animations and header state untouched. Its existing
# blackout gets all-width timing and moves outside the video's clipping mask.
start = updated.index(',6138:')
end = updated.index(',6457:', start)
lead = updated[start:end]
old_gate = 'if(H.current&&j.current)return d.Ay.matchMedia().add("(min-width: 1280px)",()=>{O.current='
new_gate = 'if(H.current&&j.current)return d.Ay.matchMedia().add("all",()=>{O.current='
assert lead.count(old_gate) + lead.count(new_gate) == 1
lead = lead.replace(old_gate, new_gate)
lead = lead.replace('start:"75% bottom",end:"99% bottom",scrub:.5',
                    'start:"75% bottom",end:"99% bottom",scrub:!0')
# The original reverse-entry reset assumed desktop. E() is Lead's existing
# responsive fullscreen mask target, also used by its opening animation.
lead = lead.replace('maskSize:"150vw auto",direction:1', 'maskSize:()=>E(),direction:1')
blackout = '(0,o.jsx)("div",{className:(0,s.Ae)(n().rootTransition),ref:H})'
old_position = blackout + ',(0,o.jsx)(i,{...t'
if old_position in lead:
    assert lead.count(old_position) == 1 and lead.endswith(']})]})})}}')
    lead = lead.replace(old_position, '(0,o.jsx)(i,{...t')
    lead = lead[:-len(']})]})})}}')] + ']}) ,' + blackout + ']})})}}'
assert lead.count(blackout) == 1 and old_position not in lead
updated = updated[:start] + lead + updated[end:]
chunk_path.write_text(updated)

page_path = ROOT / "dist/experiences/baikal/index.html"
page = page_path.read_text()
fallback = (
    '<div class="SectionSequence_rootBgWrapper__mw41g">'
    '<canvas class="SectionSequence_rootCanvas__had7n" role="img" '
    'aria-label="SE·34 瓶身入水，随滚动先快后慢展示"></canvas>'
    '<div class="SectionSequence_rootLine__AcqkT"></div></div>'
)
def element_end(html, start):
    depth = 0
    for token in re.finditer(r'</?div\b[^>]*>', html[start:]):
        depth += -1 if token.group().startswith('</') else 1
        if depth == 0:
            return start + token.end()
    raise AssertionError('Unbalanced static div wrapper')

sequence_start = page.index('<section class="SectionSequence_root__oHi4Z">')
match = re.search(r'<div class="SectionSequence_root(?:MobileBg__Wvgdd|BgWrapper__mw41g)[^"]*">', page[sequence_start:])
assert match, 'Expected one sequence canvas or legacy fallback'
start = sequence_start + match.start()
page = page[:start] + fallback + page[element_end(page, start):]

lead_start = page.index('<section class="Lead_root__N97wS')
lead_end = page.index('</section>', lead_start) + len('</section>')
lead_html = page[lead_start:lead_end]
blackout_html = '<div class="Lead_rootTransition__wS_dK"></div>'
assert lead_html.count(blackout_html) == 1 and lead_html.endswith('</div></section>')
lead_html = lead_html.replace(blackout_html, '')
lead_html = lead_html[:-len('</div></section>')] + blackout_html + '</div></section>'
page = page[:lead_start] + lead_html + page[lead_end:]
page = re.sub(r'<link rel="stylesheet" href="/brand/water-entry\.css(?:\?[^"<>]*)?">', '', page)
page = re.sub(r'<script defer src="/brand/water-entry\.js(?:\?[^"<>]*)?"></script>', '', page)
injection = (
    f'<link rel="stylesheet" href="/brand/water-entry.css?v={VERSION}">'
)
assert page.count('</head>') == 1
page = page.replace('</head>', injection + '</head>')
page = re.sub(
    r'539-56c7674de5e8a087\.js(?:\?[^"\\<>\s]*)?',
    '539-56c7674de5e8a087.js?v=' + VERSION, page,
)
page = re.sub(r'(/integration/bridge\.js)(?:\?[^"<>]*)?(?=")', r'\1', page)
page_path.write_text(page)
journey_path = ROOT / "dist/index.html"
journey = journey_path.read_text()
journey, count = re.subn(r'(/experiences/baikal/\?v=)[^"<>]+', r'\g<1>' + VERSION, journey)
assert count == 2, "Expected the Baikal iframe and noscript link"
journey_path.write_text(journey)
print("Updated all-width SectionSequence and the adjoining Lead blackout; static canvas matches React.")
