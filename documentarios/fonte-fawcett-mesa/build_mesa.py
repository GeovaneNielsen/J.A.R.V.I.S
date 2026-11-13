import re,json,sys
sys.path.insert(0,'.')
from texto import BLOCOS
src=open('../arte/folha.html').read()
js=src[src.index('<script>')+8:src.index('function sheet(')]
doc=open('doc.js').read()
def grab(start,endmark):
    i=doc.index(start); j=doc.index(endmark,i); return doc[i:j]
ext = grab('const BR =','function brazil(') + grab('function fawcett(','const jungleBg')
ext = ext.replace('fill = INKD','fill = "#1b1b22"')
TL=json.load(open('timeline.json'))
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>body{{margin:0;background:#000}}#wrap{{position:relative;width:1920px;height:1080px;overflow:hidden}}#wrap>*,#cam>*{{position:absolute;inset:0}}#persiana{{inset:auto;left:-340px;top:-360px;width:2600px;height:1800px;transform-origin:1300px 900px}}#sun{{background:radial-gradient(ellipse at 15% 0%,rgba(255,214,150,.55),rgba(255,214,150,0) 60%);mix-blend-mode:soft-light}}</style></head><body><div id="wrap"><div id="cam"><img id="bg" src="mesa_bg.png"><div id="stage"></div></div><img id="persiana" src="mesa_blinds.png"><div id="sun"></div><img id="ov0" src="mesa_ov0.png"><img id="ov1" src="mesa_ov1.png" style="display:none"><img id="ov2" src="mesa_ov2.png" style="display:none"></div><script>
{js}
{open('mesa.js').read()}
{ext}
const TL={json.dumps(TL)};
const BLOCOS={json.dumps(BLOCOS,ensure_ascii=False)};
{open('mesa_beats.js').read()}
{open('mesa_main.js').read()}
</script></body></html>'''
open('mesa.html','w').write(html)
# prep page for background/overlay images
prep=f'''<!doctype html><html><head><meta charset="utf-8"><style>body{{margin:0;background:transparent}}</style></head><body><div id="stage"></div><script>
{js}
{open('mesa.js').read()}
{ext}
window.mk=(kind,g)=>{{ let s;
 if(kind==='bg') s=deskBase()+`<g filter="url(#soft)" opacity=".85">${{card(230,180,1.1,-14,520,360,lines(40,60,420,8,34,5))}}${{PROPS.magnifier().replace('<g filter="url(#shadow)">','<g transform="translate(1720 960) scale(.9) translate(-900 -600)">')}}${{card(1780,140,.9,12,360,260,'')}}</g>`;
 else if(kind==='blinds') {{ document.getElementById('stage').innerHTML=`<svg viewBox="-340 -360 2600 1800" width="2600" height="1800" xmlns="http://www.w3.org/2000/svg">${{DEFS}}${{deskTop('blinds')}}</svg>`; return; }}
 else s=DEFS.replace('seed="3"','seed="'+(3+g*11)+'"')+deskTop('ov');
 document.getElementById('stage').innerHTML=`<svg viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">${{s}}</svg>`; }};
</script></body></html>'''
open('mesa_prep.html','w').write(prep)
