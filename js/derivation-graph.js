import {tokenText} from './token-grammar.js';
const symbols=side=>Array.isArray(side)?side:[...side].map(name=>({kind:/^[A-Z]$/.test(name)?'variable':'terminal',name}));
const label=side=>Array.isArray(side)?tokenText(side):side||'λ';
const equal=(a,b)=>a.kind===b.kind&&a.name===b.name;

// Every layer is a sentential form. A rewrite junction joins every consumed
// symbol to every produced symbol without suggesting independent replacements.
export function derivationGraph(productions,rows){
 if(!productions?.length||!rows.length)return null;
 const nodes=[],edges=[],layers=[],rewrites=[];
 const make=(symbol,layer,index)=>{if(nodes.length>=2000)throw Error('Derivation graph display is limited to 2,000 symbols.');const n={id:nodes.length,symbol:{...symbol},layer,index};nodes.push(n);return n;};
 let frontier=symbols(productions[0].left).map((s,i)=>make(s,0,i));layers.push([...frontier]);
 for(const [step,row] of rows.entries()){
  const p=Number.isInteger(row.rule)?productions[row.rule]:productions.find(p=>label(p.left)+' → '+label(p.right)===row.action);
  if(!p||!Number.isInteger(row.position))return null;
  const left=symbols(p.left),right=symbols(p.right),pos=row.position;
  if(pos<0||pos+left.length>frontier.length||!left.every((s,i)=>equal(s,frontier[pos+i].symbol)))throw Error('Derivation step does not match the selected occurrence.');
  const before=frontier,after=[];
  for(let i=0;i<pos;i++){const n=make(before[i].symbol,step+1,after.length);after.push(n);edges.push({from:before[i].id,to:n.id,kind:'unchanged',step});}
  const created=right.map(s=>{const n=make(s,step+1,after.length);after.push(n);return n;});
  const output=created.length?created:[make({kind:'epsilon',name:'λ'},step+1,pos)];
  for(let i=pos+left.length;i<before.length;i++){const n=make(before[i].symbol,step+1,after.length+(created.length?0:1));after.push(n);edges.push({from:before[i].id,to:n.id,kind:'unchanged',step});}
  rewrites.push({step,parents:before.slice(pos,pos+left.length).map(n=>n.id),children:output.map(n=>n.id),action:row.action,position:pos});
  frontier=after;layers.push(created.length?[...after]:[...after.slice(0,pos),...output,...after.slice(pos)]);
 }
 return {nodes,edges,layers,rewrites,final:frontier.map(n=>n.symbol)};
}
export function layoutDerivationGraph(graph){
 const width=Math.max(350,...graph.layers.map(layer=>layer.length*100+100));
 const nodes=graph.layers.flatMap((layer,level)=>layer.map((n,i)=>({...n,x:(width-(layer.length-1)*100)/2+i*100,y:45+level*120})));
 const map=new Map(nodes.map(n=>[n.id,n]));
 const rewrites=graph.rewrites.map(r=>({...r,x:r.parents.reduce((sum,id)=>sum+map.get(id).x,0)/r.parents.length,y:105+r.step*120}));
 return {nodes,edges:graph.edges,rewrites,width,height:90+(graph.layers.length-1)*120};
}
