#!/usr/bin/env python3
"""Build the icon set and the Open Graph image.

Needs Pillow, fontTools and the Switzer OTF (pass its path as the first argument;
download from fontshare.com, it is not checked in). Run from the repo root.
Outputs: images/favicon.svg, images/favicon-32.png, images/favicon-192.png,
images/apple-touch-icon.png, favicon.ico, images/og.jpg
"""
import sys
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

otf = sys.argv[1] if len(sys.argv) > 1 else 'Switzer-Bold.otf'
BLACK, WHITE = (1, 1, 1), (241, 241, 241)

# --- SVG favicon: black rounded tile, white "A" from the font outline -------
font = TTFont(otf)
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
g = glyph_set[cmap[ord('A')]]
pen = SVGPathPen(glyph_set)
g.draw(pen)
upm = font['head'].unitsPerEm
adv = g.width
bounds_pen_y0, bounds_pen_y1 = 0, font['OS/2'].sCapHeight
# scale glyph so the cap height fills ~56% of a 64px tile
tile = 64
scale = (tile * 0.56) / bounds_pen_y1
w = adv * scale
tx = (tile - w) / 2
ty = tile / 2 + (bounds_pen_y1 * scale) / 2
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {tile} {tile}">
<rect width="{tile}" height="{tile}" rx="12" fill="#010101"/>
<path transform="translate({tx:.2f} {ty:.2f}) scale({scale:.5f} -{scale:.5f})" fill="#f1f1f1" d="{pen.getCommands()}"/>
</svg>
'''
open('images/favicon.svg', 'w').write(svg)

# --- PNG icons ---------------------------------------------------------------
def tile_png(size, radius_ratio=0.19):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * radius_ratio), fill=BLACK + (255,))
    f = ImageFont.truetype(otf, int(size * 0.72))
    bbox = d.textbbox((0, 0), 'A', font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]), 'A', font=f, fill=WHITE + (255,))
    return im

tile_png(32).save('images/favicon-32.png')
tile_png(192).save('images/favicon-192.png')
# iOS rounds the corners itself: square tile
apple = Image.new('RGBA', (180, 180), BLACK + (255,))
d = ImageDraw.Draw(apple)
f = ImageFont.truetype(otf, 130)
bbox = d.textbbox((0, 0), 'A', font=f)
d.text(((180 - (bbox[2] - bbox[0])) / 2 - bbox[0], (180 - (bbox[3] - bbox[1])) / 2 - bbox[1]), 'A', font=f, fill=WHITE + (255,))
apple.convert('RGB').save('images/apple-touch-icon.png')
tile_png(32, 0).convert('RGBA').save('favicon.ico', sizes=[(16, 16), (32, 32)])

# --- Open Graph image 1200x630 ----------------------------------------------
og = Image.new('RGB', (1200, 630), BLACK)
art = Image.open('images/art/angel-and-demon.webp').convert('RGB')
art.thumbnail((10000, 630))
og.paste(art, (1200 - art.width - 24, 0))
d = ImageDraw.Draw(og)
big = ImageFont.truetype(otf, 118)
small = ImageFont.truetype(otf.replace('Bold', 'Regular'), 30)
d.text((56, 180), 'TAT.IT.TOO', font=big, fill=WHITE)
d.text((60, 330), 'Fine line and pet portrait tattoos', font=small, fill=WHITE)
d.text((60, 372), 'Sappe Sin Studio, Chicago', font=small, fill=(160, 160, 160))
og.save('images/og.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
print('icons and og image written')
