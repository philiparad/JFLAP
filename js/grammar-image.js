import {graphImageSVG} from './image-export.js';
import {tokenText} from './token-grammar.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// SVG text keeps grammar exports independent of HTML/foreignObject raster support.
export function grammarImageSVG(model,{size=16,emptySymbol='λ'}={}){
 size=Math.max(10,Math.min(32,Number(size)||16));
 const side=value=>Array.isArray(value)?(value.length?tokenText(value):emptySymbol):(value||emptySymbol);
 const rows=model.productions.map(p=>[side(p.left),side(p.right)]),canvas=document.createElement('canvas'),context=canvas.getContext('2d');
 context.font=size+'px monospace';
 const measure=text=>context.measureText(text).width;
 const left=Math.max(measure('Left side')+24,100,...rows.map(r=>measure(r[0])+24)),right=Math.max(measure('Right side')+24,160,...rows.map(r=>measure(r[1])+24)),rowHeight=Math.ceil(size*1.8),width=left+right+50;
 const label=(x,y,text)=>`<text x="${x}" y="${y}" xml:space="preserve">${escape(text)}</text>`;
 let markup=`<g font-family="monospace" font-size="${size}" fill="#203b37">${label(0,0,model.name||'Grammar')}<rect y="${rowHeight}" width="${width}" height="${rowHeight*(rows.length+1)}" fill="white" stroke="#9aaba0"/>`;
 markup+=`<g font-weight="bold">${label(12,rowHeight*1.7,'Left side')}${label(left+10,rowHeight*1.7,'→')}${label(left+62,rowHeight*1.7,'Right side')}</g>`;
 for(const [i,row] of rows.entries()){
  const y=(i+2)*rowHeight;
  markup+=`<rect y="${y}" width="${width}" height="${rowHeight}" fill="${i%2?'#f0f4ef':'white'}"/>${label(12,y+rowHeight*.7,row[0])}${label(left+10,y+rowHeight*.7,'→')}${label(left+62,y+rowHeight*.7,row[1])}`;
 }
 return graphImageSVG(markup+'</g>','',{naturalSize:true});
}

export function parseDiagramImageSVG(svg,css=''){
 if(!svg||svg.localName!=='svg')throw Error('Create a parse tree or derivation graph before exporting its image.');
 // Measure the entire drawing, including content outside its scroll viewport.
 // The drawing is copied; orientation, active-step classes and model stay intact.
 return graphImageSVG(svg.innerHTML,css,{naturalSize:true});
}
