const points=m=>[...m.states,...(m.notes||[])];
function bounds(items){let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(const p of items){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Graph coordinates must be finite.');minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}return {minX,maxX,minY,maxY};}
export function transformGraph(source,operation,angle=180){
 if(!['horizontal','vertical','diagonal-down','diagonal-up','rotate','fit'].includes(operation))throw Error('Unknown graph transformation.');
 if(operation==='rotate'&&(!Number.isFinite(angle)))throw Error('Enter a finite rotation angle.');
 const m=structuredClone(source),items=points(m);if(!items.length)return m;const b=bounds(items),cx=operation==='rotate'?items.reduce((n,p)=>n+p.x/items.length,0):b.minX/2+b.maxX/2,cy=operation==='rotate'?items.reduce((n,p)=>n+p.y/items.length,0):b.minY/2+b.maxY/2;
 const radians=(angle%360)*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians),scale=operation==='fit'?Math.min(700/Math.max(1,b.maxX-b.minX),300/Math.max(1,b.maxY-b.minY)):1;
 for(const p of items){const x=p.x-cx,y=p.y-cy;let nx=x,ny=y;
  if(operation==='horizontal')ny=-y;else if(operation==='vertical')nx=-x;else if(operation==='diagonal-down'){nx=y;ny=x;}else if(operation==='diagonal-up'){nx=-y;ny=-x;}else if(operation==='rotate'){nx=c*x-s*y;ny=s*x+c*y;}else{nx=x*scale;ny=y*scale;}
  p.x=(operation==='fit'?450:cx)+nx;p.y=(operation==='fit'?280:cy)+ny;
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Graph transformation exceeds numerical limits.');
 }
 const reflected=operation!=='fit'&&operation!=='rotate';
 for(const t of m.transitions){if(t.from===t.to)continue;const peers=source.transitions.filter(e=>e.from===t.from&&e.to===t.to),index=peers.findIndex(e=>e.id===t.id),reverse=source.transitions.some(e=>e.from===t.to&&e.to===t.from);const bend=t.bend??((index-(peers.length-1)/2)*35+(reverse?38:0));if(!Number.isFinite(bend))throw Error('Transition curvature must be finite.');t.bend=bend*(reflected?-1:scale);}
 return m;
}
