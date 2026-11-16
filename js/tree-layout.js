// Root priorities follow JFLAP TreeLayoutAlgorithm's two comparators.
// Stable sibling order replaces its desktop-specific VertexChain alignment.
export function treeLayout(source,kind='degree'){
 if(!['degree','hierarchy'].includes(kind))throw Error('Choose degree or hierarchy tree layout.');
 const m=structuredClone(source),ids=m.states.map(s=>s.id),order=new Map(ids.map((id,i)=>[id,i]));
 if(order.size!==ids.length)throw Error('State identifiers must be unique.');
 const adjacent=new Map(ids.map(id=>[id,new Set()])),incoming=new Map(ids.map(id=>[id,new Set()]));
 for(const t of m.transitions){if(!order.has(t.from)||!order.has(t.to))throw Error('Transition endpoint is missing.');adjacent.get(t.from).add(t.to);incoming.get(t.to).add(t.from);if(kind==='degree')adjacent.get(t.to).add(t.from);}
 const priority=id=>kind==='degree'?-adjacent.get(id).size:incoming.get(id).size-(incoming.get(id).has(id)?1:0);
 const ranked=[...ids].sort((a,b)=>priority(a)-priority(b)||order.get(a)-order.get(b)),rank=new Map(ranked.map((id,i)=>[id,i]));
 const seen=new Set(),levels=[];
 for(const root of ranked){if(seen.has(root))continue;seen.add(root);const queue=[[root,0]];for(let i=0;i<queue.length;i++){const [id,depth]=queue[i];(levels[depth]??=[]).push(id);const children=[...adjacent.get(id)].sort((a,b)=>rank.get(b)-rank.get(a));for(const child of children){if(seen.has(child))continue;seen.add(child);queue.push([child,depth+1]);}}}
 const positions=new Map();levels.forEach((row,depth)=>row.forEach((id,index)=>positions.set(id,{x:450+(index-(row.length-1)/2)*150,y:140+depth*140})));
 for(const state of m.states)Object.assign(state,positions.get(state.id));
 return m;
}
