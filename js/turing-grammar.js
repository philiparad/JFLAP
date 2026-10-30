import {validate,clone} from './automata.js';
import {V,T,tokenGrammar,tokenText} from './token-grammar.js';
import {tapeSymbol,matchesTapeRead,resolveTapeWrite} from './turing.js';
const id=s=>JSON.stringify(s);
const same=(a,b)=>id(a)===id(b);
const cell=(original,tape)=>V('cell '+JSON.stringify([original,tape]));
const control=q=>V('state '+q);
const S=V('Start'),G=V('Generate'),L=V('Left boundary'),R=V('Right boundary'),CL=V('Clean left'),CR=V('Clean right');
const scalar=value=>Array.isArray(value)?value[0]:value;

export function turingToGrammar(m,{alphabet,maxProductions=50000}={}){
 validate(m);if(m.type!=='turing'||(m.tapes||1)!==1||m.states.some(s=>s.block))throw Error('Conversion requires a single-tape Turing machine without building blocks.');
 if(!Array.isArray(alphabet)||alphabet.some(c=>typeof c!=='string'||c.length!==1||!tapeSymbol(c)||c==='~'))throw Error('Specify an input alphabet of distinct single symbols, excluding blank and ~.');
 alphabet=[...new Set(alphabet)];const gamma=new Set(['',...alphabet]);
 for(const t of m.transitions){const read=tapeSymbol(scalar(t.read)),write=tapeSymbol(scalar(t.write)),move=scalar(t.move)||'R';
  if(read.includes('}')||write.length>1||!['L','R','S'].includes(move))throw Error('Expand variable assignments and use single-symbol writes with L, R or S moves before converting.');
  matchesTapeRead(read,'',1);if(read!=='~')gamma.add(read.startsWith('!')&&read.length===2?tapeSymbol(read[1]):read);if(write!=='~')gamma.add(write);
 }
 const originals=['',...alphabet],tape=[...gamma],rules=[];
 const add=(left,right,phase,extra={})=>{if(rules.length>=maxProductions)throw Error('Conversion exceeds '+maxProductions+' productions. Reduce the tape alphabet or machine.');rules.push({left,right,phase,...extra});};
 const initial=m.states.find(s=>s.initial).id;
 add([S],[L,control(initial),G,R],'initialize');
 for(const a of alphabet)add([G],[cell(a,a),G],'generate',{symbol:a});
 add([G],[],'generate-end');
 for(const s of m.states){
  if(s.final){add([control(s.id)],[CL],'accept');continue;}
  add([control(s.id),R],[control(s.id),cell('',''),R],'extend');
  for(const t of m.transitions.filter(t=>t.from===s.id))for(const a of tape){
   if(!matchesTapeRead(scalar(t.read),a,1))continue;
   const b=resolveTapeWrite(scalar(t.write),a),move=scalar(t.move)||'R';
   for(const x of originals){const before=[control(s.id),cell(x,a)];
    if(move==='S')add(before,[control(t.to),cell(x,b)],'step',{transition:t.id});
    else if(move==='R')add(before,[cell(x,b),control(t.to)],'step',{transition:t.id});
    else{
     for(const y of originals)for(const c of tape)add([cell(y,c),...before],[control(t.to),cell(y,c),cell(x,b)],'step',{transition:t.id});
     add([L,...before],[L,control(t.to),cell('',''),cell(x,b)],'step',{transition:t.id});
    }
   }
  }
 }
 for(const x of originals)for(const a of tape){const out=x?[T(x)]:[];add([cell(x,a),CL],[CL,...out],'cleanup');add([CR,cell(x,a)],[...out,CR],'cleanup');}
 add([L,CL],[CR],'cleanup');for(const a of alphabet)add([CR,T(a)],[T(a),CR],'cleanup');add([CR,R],[],'cleanup');
 const grammar=tokenGrammar(rules,m.name+' · unrestricted grammar');
 grammar.conversion={kind:'turing-to-grammar',acceptance:'final',alphabet,tapeAlphabet:tape,source:clone(m),construction:'paired-tape',productionCount:rules.length};return grammar;
}

function positions(word,left){const result=[];for(let i=0;i<=word.length-left.length;i++)if(left.every((s,j)=>same(s,word[i+j])))result.push(i);return result;}
function rewrite(word,p,pos){return [...word.slice(0,pos),...p.right,...word.slice(pos+p.left.length)];}

// Search actual grammar rewrites, fixing only the input-generation phase.
// Simulation phases preserve the original-input track; cleanup starts at a final
// control state. Every displayed row includes its production and occurrence.
export function deriveTuringGrammar(g,input,{limit=15000,maxSymbols=Math.max(50,input.length+20)}={}){
 if(g.conversion?.kind!=='turing-to-grammar')throw Error('Choose a converted Turing grammar.');
 if([...input].some(c=>!g.conversion.alphabet.includes(c)))return{status:'rejected',rows:[],count:0,reason:'outside-alphabet'};
 const rules=g.productions,initialRows=[];let word=[S];
 const apply=(p,pos,rows)=>{word=rewrite(word,p,pos);rows.push({word:tokenText(word),action:tokenText(p.left)+' → '+tokenText(p.right),position:pos,rule:rules.indexOf(p)});};
 apply(rules.find(p=>p.phase==='initialize'),0,initialRows);
 for(const c of input){const p=rules.find(p=>p.phase==='generate'&&p.symbol===c);apply(p,positions(word,p.left)[0],initialRows);}
 const end=rules.find(p=>p.phase==='generate-end');apply(end,positions(word,end.left)[0],initialRows);
 const queue=[{word,parent:null}],seen=new Set([id(word)]);let cutoff=false;
 const steps=rules.filter(p=>['step','extend'].includes(p.phase)),accepts=rules.filter(p=>p.phase==='accept'),cleanup=rules.filter(p=>p.phase==='cleanup');
 for(let head=0;head<queue.length;head++){
  const current=queue[head];
  const accept=accepts.find(p=>positions(current.word,p.left).length);
  if(accept){const path=[];for(let n=current;n.parent;n=n.parent)path.push(n);const rows=[...initialRows];for(const n of path.reverse())rows.push({word:tokenText(n.word),action:tokenText(n.rule.left)+' → '+tokenText(n.rule.right),position:n.position,rule:rules.indexOf(n.rule)});
   word=current.word;apply(accept,positions(word,accept.left)[0],rows);
   while(word.some(s=>s.kind==='variable')){const p=cleanup.find(p=>positions(word,p.left).length);if(!p)throw Error('Generated cleanup has no applicable production.');apply(p,positions(word,p.left)[0],rows);}
   if(word.map(s=>s.name).join('')!==input)throw Error('Generated derivation did not preserve the input.');
   return{status:'accepted',rows,count:queue.length};
  }
  for(const p of steps)for(const pos of positions(current.word,p.left)){const next=rewrite(current.word,p,pos),key=id(next);if(seen.has(key))continue;if(next.length>maxSymbols){cutoff=true;continue;}if(queue.length>=limit)return{status:'limit',rows:[],count:queue.length};seen.add(key);queue.push({word:next,parent:current,rule:p,position:pos});}
 }
 return{status:cutoff?'limit':'rejected',rows:[],count:queue.length};
}
