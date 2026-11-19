// Original graph colors from JFLAP 7.1 ColorChooserAction$1 through $6.
const records=[
 ['workbench','Workbench','#f5df94','#a9dfb9','#16856b','#52665b','#dc8d2d','#176b56'],
 ['original','Original','#ffff96','#64c8c8','#5f5f5f','#000000','#ff0000','#50614c'],
 ['blue','Blue','#e1ffff','#91dbe3','#747880','#747880','#566178','#245e80'],
 ['green','Green','#baffb8','#7ce678','#dba0a1','#dba0a1','#c26767','#28652f'],
 ['orange','Orange','#ffbe79','#cc7b2a','#6e6356','#6e6356','#615e54','#875014'],
 ['purple','Purple','#e6e6fa','#988dfc','#00005e','#00005e','#6495ed','#61479c'],
 ['pink','Pink','#ffd6db','#faadb2','#747880','#747880','#c7b9c0','#923d61']
];
export const palettes=Object.freeze(records.map(([id,label,state,highlight,transition,arrow,arrowHighlight,accent])=>Object.freeze({id,label,state,highlight,transition,arrow,arrowHighlight,accent})));
export function palette(id){return palettes.find(p=>p.id===id)||palettes[0];}
function tint(hex,white){return '#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-white)+255*white).toString(16).padStart(2,'0')).join('');}
export function paletteCSS(id){
 const p=palette(id),colors={
  '--green':p.accent,'--muted':p.accent,
  '--line':tint(p.accent,0.8),'--page':tint(p.accent,0.96),'--surface':tint(p.accent,0.93),
  '--soft':tint(p.accent,0.84),'--header-muted':tint(p.accent,0.72),
  '--state-fill':p.state,'--state-highlight':p.highlight,'--transition-tool':p.transition,
  '--arrow':p.arrow,'--arrow-highlight':p.arrowHighlight
 };
 // Darken with multiplication, not negative white mixing, to keep RGB channels valid.
 for(const key of ['--ink','--header'])colors[key]='#'+[1,3,5].map(i=>Math.round(parseInt(p.accent.slice(i,i+2),16)*(key==='--ink'?0.35:0.6)).toString(16).padStart(2,'0')).join('');
 return ':root{'+Object.entries(colors).map(([key,value])=>key+':'+value).join(';')+'}';
}
export function applyPalette(id){
 const p=palette(id);let style=document.getElementById('interface-palette');
 if(!style){style=document.createElement('style');style.id='interface-palette';document.head.append(style);}
 style.textContent=paletteCSS(p.id);document.documentElement.dataset.palette=p.id;return p.id;
}
