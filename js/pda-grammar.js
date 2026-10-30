import {machine,state,edge,empty,validate} from './automata.js';
import {V,T,tokenGrammar} from './token-grammar.js';

// Normalize to one pop and at most two pushes, with a fresh protected bottom.
// Internal states have no competing transitions, preserving atomic stack edits.
export function normalizePDA(input,acceptance='final'){
 validate(input);if(input.type!=='pda')throw Error('Choose a pushdown automaton.');
 if(!['final','empty'].includes(acceptance))throw Error('Choose final-state or empty-stack acceptance.');
 const m=machine('pda');m.name=input.name+' · normalized';const start=state(m),map=new Map();
 for(const s of input.states){const n=state(m);n.name=s.name;map.set(s.id,n.id);}
 const drain=state(m);const alphabet=new Set(['Z',...input.transitions.flatMap(t=>[...empty(t.pop),...empty(t.push)])]);
 let bottom='⊥';while(alphabet.has(bottom))bottom=String.fromCharCode(bottom.charCodeAt(0)+1);alphabet.add(bottom);
 const one=(from,to,read,pop,push)=>{
  if(push.length<=2){edge(m,from,to,read,{pop,push});return;}
  let at=from;for(let i=push.length-2;i>=0;i--){const dest=i===0?to:state(m).id;edge(m,at,dest,i===push.length-2?read:'',{pop:i===push.length-2?pop:push[i+1],push:push.slice(i,i+2)});at=dest;}
 };
 one(start.id,map.get(input.states.find(s=>s.initial).id),'','Z','Z'+bottom);
 for(const t of input.transitions){const pop=empty(t.pop),push=empty(t.push),read=empty(t.read);let at=map.get(t.from);
  if(!pop){for(const a of alphabet)one(at,map.get(t.to),read,a,push+a);continue;}
  for(let i=0;i<pop.length-1;i++){const dest=state(m).id;one(at,dest,i===0?read:'',pop[i],'');at=dest;}
  one(at,map.get(t.to),pop.length===1?read:'',pop.at(-1),push);
 }
 if(acceptance==='final'){
  for(const s of input.states.filter(s=>s.final))for(const a of alphabet)one(map.get(s.id),drain.id,'',a,'');
  for(const a of alphabet)one(drain.id,drain.id,'',a,'');
 }else for(const s of input.states)one(map.get(s.id),drain.id,'',bottom,'');
 return {machine:m,start:start.id,drain:drain.id,bottom,acceptance};
}

export function pdaToGrammar(input,{acceptance='final',maxProductions=50000}={}){
 const normalized=normalizePDA(input,acceptance),m=normalized.machine,rules=[],legend={};
 const triple=(p,a,q)=>{const name=JSON.stringify([p,a,q]);legend[name]={from:p,stack:a,to:q};return V(name);};
 const add=(left,right)=>{if(rules.length>=maxProductions)throw Error('PDA conversion exceeds '+maxProductions+' productions. Reduce the machine or stack operations.');rules.push({left:[left],right});};
 add(V('Start'),[triple(normalized.start,'Z',normalized.drain)]);
 for(const t of m.transitions){const prefix=[...t.read].map(T),push=[...t.push];
  if(!push.length)add(triple(t.from,t.pop,t.to),prefix);
  else if(push.length===1)for(const q of m.states)add(triple(t.from,t.pop,q.id),[...prefix,triple(t.to,push[0],q.id)]);
  else for(const middle of m.states)for(const q of m.states)add(triple(t.from,t.pop,q.id),[...prefix,triple(t.to,push[0],middle.id),triple(middle.id,push[1],q.id)]);
 }
 // Remove non-generating and unreachable variables before presenting the result.
 const productive=new Set();let changed=true;
 while(changed){changed=false;for(const r of rules)if(!productive.has(r.left[0].name)&&r.right.every(s=>s.kind==='terminal'||productive.has(s.name))){productive.add(r.left[0].name);changed=true;}}
 const useful=rules.filter(r=>productive.has(r.left[0].name)&&r.right.every(s=>s.kind==='terminal'||productive.has(s.name)));
 const reachable=new Set(['Start']);changed=true;while(changed){changed=false;for(const r of useful)if(reachable.has(r.left[0].name))for(const s of r.right)if(s.kind==='variable'&&!reachable.has(s.name)){reachable.add(s.name);changed=true;}}
 const unique=new Map(useful.filter(r=>reachable.has(r.left[0].name)).map(r=>[JSON.stringify(r),r]));
 const productions=[...unique.values()];if(!productions.length)productions.push({left:[V('Start')],right:[V('NoDerivation')]});
 const grammar=tokenGrammar(productions,input.name+' · CFG');
 grammar.conversion={kind:'pda-to-cfg',acceptance,bottom:normalized.bottom,generated:rules.length,retained:productions.length,states:m.states.map(s=>({id:s.id,name:s.name})),legend:Object.fromEntries(Object.entries(legend).filter(([name])=>reachable.has(name)))};
 return grammar;
}
