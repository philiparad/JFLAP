// JFLAP 7.1 GEM force rules, with explicit browser work bounds.
export const GEM_LIMITS=Object.freeze({states:2000,pairChecks:2000000,sweeps:120});
export function gemLayout(source,random=Math.random){
 const m=structuredClone(source),states=m.states,n=states.length;
 if(n>GEM_LIMITS.states)throw Error('GEM layout supports up to 2,000 states.');
 const index=new Map(states.map((s,i)=>[s.id,i])),neighbors=states.map(()=>new Set());
 if(index.size!==n)throw Error('State identifiers must be unique.');
 for(const s of states)if(!Number.isFinite(s.x)||!Number.isFinite(s.y))throw Error('State coordinates must be finite.');
 for(const t of m.transitions){if(!index.has(t.from)||!index.has(t.to))throw Error('Transition endpoint is missing.');const a=index.get(t.from),b=index.get(t.to);neighbors[a].add(b);neighbors[b].add(a);}
 if(!n)return m;
 const draw=()=>{const v=random();if(!Number.isFinite(v)||v<0||v>=1)throw Error('Random source must return a value from 0 up to 1.');return v;};
 // Normalize before forces: avoids overflow even for extreme imported coordinates.
 const magnitude=Math.max(1,...states.flatMap(s=>[Math.abs(s.x),Math.abs(s.y)]));
 const xs=states.map(s=>s.x/magnitude),ys=states.map(s=>s.y/magnitude);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const span=Math.max(maxX-minX,maxY-minY)||1;
 states.forEach((s,i)=>{s.x=450+(xs[i]-(minX+maxX)/2)*700/span;s.y=280+(ys[i]-(minY+maxY)/2)*700/span;});
 let sumX=states.reduce((a,s)=>a+s.x,0),sumY=states.reduce((a,s)=>a+s.y,0),bag=[];
 const updates=Math.min(GEM_LIMITS.sweeps*n,Math.floor(GEM_LIMITS.pairChecks/n));
 for(let step=0;step<updates;step++){
  if(!bag.length)bag=states.map((_,i)=>i);
  const pick=Math.floor(draw()*bag.length),i=bag[pick];bag[pick]=bag.at(-1);bag.pop();
  const s=states[i],degree=neighbors[i].size,mass=degree*(1+degree/2);
  let fx=(sumX/n-s.x)*0.0625*mass+draw()*10-5,fy=(sumY/n-s.y)*0.0625*mass+draw()*10-5;
  for(let j=0;j<n;j++){
   if(j===i)continue;
   const dx=s.x-states[j].x,dy=s.y-states[j].y,d2=dx*dx+dy*dy;
   if(d2){fx+=dx*10000/d2;fy+=dy*10000/d2;}
   if(neighbors[i].has(j)){fx-=dx*d2/(10000*mass);fy-=dy*d2/(10000*mass);}
  }
  const length=Math.hypot(fx,fy);
  if(length){const dx=3*fx/length,dy=3*fy/length;s.x+=dx;s.y+=dy;sumX+=dx;sumY+=dy;}
 }
 return m;
}
