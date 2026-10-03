"""Outline the bottle's static lettering as SVG paths; no runtime font dependency."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT=Path(__file__).parent
SERIF=TTFont('/System/Library/Fonts/Supplemental/Times New Roman.ttf')
SANS=TTFont('/System/Library/Fonts/Supplemental/Arial.ttf')
CHINESE=TTFont('/System/Library/Fonts/Supplemental/Songti.ttc',fontNumber=0)

def text_path(text,font,size,baseline,center,fill,tracking=0):
    glyphs=font.getGlyphSet();cmap=font.getBestCmap();scale=size/font['head'].unitsPerEm
    widths=[font['hmtx'][cmap[ord(c)]][0]*scale for c in text]
    left=center-(sum(widths)+tracking*(len(text)-1))/2
    pen=SVGPathPen(glyphs)
    for c,w in zip(text,widths):
        glyphs[cmap[ord(c)]].draw(TransformPen(pen,(scale,0,0,-scale,left,baseline)))
        left+=w+tracking
    return '<path fill="'+fill+'" d="'+pen.getCommands()+'"/>'

def save(name,width,height,paths):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'+''.join(paths)+'</svg>')

save('badge-se34.svg',512,512,[text_path('Se',SERIF,214,269,256,'#f0f3f6'),text_path('34',SERIF,106,382,256,'#e7edf3')])
save('wordmark-se34.svg',1024,672,[text_path('SE·34',SERIF,221,267,512,'#3c484f',35),text_path('安康硒谷',CHINESE,58,438,512,'#40515b',20),text_path('NATURAL MINERAL WATER',SANS,30,531,512,'#52616a',9)])
print('Outlined SVG decals saved.')
