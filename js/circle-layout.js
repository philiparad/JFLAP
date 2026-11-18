export const randomLayouts=['circle','spiral','random','degree','hierarchy','two-circle','gem'];
export function chooseLayout(random=Math.random){const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Random source must return a value from 0 up to 1.');return randomLayouts[Math.floor(value*randomLayouts.length)];}

export function twoCircleLayout(source){
 const m=structuredClone(source),ids=m.states.map(s=>s.id),neighbors=new Map(ids.map(id=>[id,new Set()]));
 if(neighbors.size!==ids.length)throw Error('State identifiers must be unique.');
 for(const t of m.transitions){if(!neighbors.has(t.from)||!neighbors.has(t.to))throw Error('Transition endpoint is missing.');neighbors.get(t.from).add(t.to);neighbors.get(t.to).add(t.from);}
 let inner=ids.filter(id=>neighbors.get(id).size>2),outer=ids.filter(id=>neighbors.get(id).size<=2);
 if(!inner.length){inner=outer;outer=[];}else{let changed=true;while(changed){changed=false;for(let i=0;i<outer.length;i++){if(inner.filter(id=>neighbors.get(outer[i]).has(id)).length<2)continue;inner.push(outer[i]);outer.splice(i,1);changed=true;}}}
 const rank=new Map(inner.map((id,i)=>[id,i])),original=new Map(ids.map((id,i)=>[id,i]));
 const anchor=id=>{let result=inner.length;for(const n of neighbors.get(id))if(rank.has(n))result=Math.min(result,rank.get(n));return result;};
 outer.sort((a,b)=>anchor(a)-anchor(b)||original.get(a)-original.get(b));
 const innerRadius=inner.length<=1?0:Math.max(100,inner.length*15),outerRadius=Math.max(innerRadius+130,outer.length*15),positions=new Map();
 for(const [ring,radius] of [[inner,innerRadius],[outer,outerRadius]])ring.forEach((id,i)=>{const angle=-Math.PI/2+i*2*Math.PI/ring.length;positions.set(id,{x:450+radius*Math.cos(angle),y:280+radius*Math.sin(angle)});});
 for(const s of m.states)Object.assign(s,positions.get(s.id));return m;
}
