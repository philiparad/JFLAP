import {serializePumping,deserializePumping,validatePumpingModel} from './pumping-files.js';
import {validateTokenGrammar} from './token-grammar.js';
import {machine,empty} from './automata.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const tag=(n,s,a='')=>`<${n}${a}>${esc(s)}</${n}>`;
export function serialize(m){
 if(m.type?.startsWith('pumping'))return serializePumping(m);
 if(m.format==='tokens-v1')throw Error('Named-variable grammars use JSON. JFLAP XML assumes single-character variables.');
 const tm=m.type.startsWith('turing'),blockFormat=tm&&(m.type==='turingbb'||m.states.some(s=>s.block||s.blockTag));
 const definitions=new Map(),names=new Map(),queue=[],visiting=new Set();let sequence=0;
 function register(state){
  const inner=state.block,signature=inner?JSON.stringify(inner,function(key,value){return key==='name'&&Array.isArray(this.states)?undefined:value;}):'empty';
  let name=state.blockTag;
  if(!name||!/^[\p{L}_][\p{L}\p{N}_.-]*$/u.test(name)||['structure','automaton','state','block','transition','type','tapes','note','tag'].includes(name))name='Machine'+(++sequence);
  const base=name;let suffix=1;
  while(names.has(name)&&names.get(name)!==signature)name=base+'_'+suffix++;
  if(!names.has(name)){names.set(name,signature);queue.push({name,inner});}
  return name;
 }
 function checkTree(current,depth=0){
  if(depth>64||visiting.has(current))throw Error('Cyclic or excessively deep Turing building blocks cannot be saved.');
  visiting.add(current);
  if(tm&&(current.tapes||1)!==(m.tapes||1))throw Error('Nested Turing blocks must use the same number of tapes.');
  for(const s of current.states||[])if(s.block)checkTree(s.block,depth+1);
  visiting.delete(current);
 }
 if(tm)checkTree(m);
 function fields(current){
  const states=current.states.map(s=>{
   const kind=blockFormat?'block':'state';
   return `<${kind} id="${s.id}" name="${esc(s.name)}">`+(blockFormat?tag('tag',register(s)):'')+tag('x',s.x)+tag('y',s.y)+(s.label?tag('label',s.label):'')+(s.initial?'<initial/>':'')+(s.final?'<final/>':'')+(current.type==='moore'?tag('output',s.output):'')+`</${kind}>`;
  }).join('');
  const transitions=current.transitions.map(t=>{
   const read=Array.isArray(t.read)?t.read:[t.read],write=Array.isArray(t.write)?t.write:[t.write],move=Array.isArray(t.move)?t.move:[t.move];
   // Edited block edges become ordinary edges if their writes/moves changed.
   const block=tm&&t.blockTransition&&read.every((_,i)=>write[i]==='~'&&move[i]==='S');
   const labels=tm?read.map((r,i)=>tag('read',r,` tape="${i+1}"`)+(block?'':tag('write',write[i],` tape="${i+1}"`)+tag('move',move[i]||'R',` tape="${i+1}"`))).join(''):tag('read',t.read)+(current.type==='pda'?tag('pop',t.pop)+tag('push',t.push):current.type==='mealy'?tag('transout',t.output):'');
   return '<transition'+(block?' block="true"':'')+'>'+tag('from',t.from)+tag('to',t.to)+labels+'</transition>';
  }).join('');
  return states+transitions+(current.notes||[]).map(n=>'<note>'+tag('text',n.text)+tag('x',n.x)+tag('y',n.y)+'</note>').join('');
 }
 function automaton(current){
  const body=fields(current);
  for(let i=0;i<queue.length;i++){const {name,inner}=queue[i];definitions.set(name,inner?fields(inner):'');}
  return '<automaton>'+body+[...definitions].map(([name,content])=>`<${name}>${content}</${name}>`).join('')+'</automaton>';
 }
 let body;if(m.type==='grammar')body=m.productions.map(p=>'<production>'+tag('left',p.left)+tag('right',p.right)+'</production>').join('');else if(m.type==='re')body=tag('expression',m.expression);else if(m.type==='lsystem')body=tag('axiom',m.axiom)+m.productions.map(p=>'<production>'+tag('left',p.left)+tag('right',p.right)+'</production>').join('')+Object.entries(m.parameters).map(([n,v])=>'<parameter>'+tag('name',n)+tag('value',v)+'</parameter>').join('');else body=(tm&&(!blockFormat||(m.tapes||1)>1)?tag('tapes',m.tapes||1):'')+automaton(m);
 return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with JFLAP Web -->\n<structure>'+tag('type',blockFormat?'turingbb':m.type)+body+'</structure>';
}
export function deserialize(text,name='Imported'){if(text.trim().startsWith('{')){const m=JSON.parse(text);if(!m.type)throw Error('Missing model type.');if(m.format==='tokens-v1')validateTokenGrammar(m);if(m.type.startsWith('pumping'))validatePumpingModel(m);return m;}const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw Error('Invalid XML document.');const root=doc.documentElement,child=(e,n)=>[...e.children].find(c=>c.tagName===n),value=(e,n)=>child(e,n)?.textContent||'',type=value(root,'type');if(!type)throw Error('Missing JFLAP structure type.');const productions=e=>[...e.children].filter(c=>c.tagName==='production').map(c=>({left:value(c,'left'),right:value(c,'right')}));
 if(['regular pumping lemma','context-free pumping lemma'].includes(type))return deserializePumping(root,name);
 if(type==='grammar')return{type,name,productions:productions(root)};if(type==='re')return{type,name,expression:value(root,'expression')};if(type==='lsystem')return{type,name,axiom:value(root,'axiom'),productions:productions(root),parameters:Object.fromEntries([...root.children].filter(c=>c.tagName==='parameter').map(c=>[value(c,'name'),value(c,'value')]))};
 if(!['fa','pda','mealy','moore','turing','turingbb'].includes(type))throw Error('Unsupported JFLAP document type: '+type);
 const tapes=Number(value(root,'tapes')||1),tm=type.startsWith('turing'),stack=new Set();let stateCount=0;
 if(tm&&(!Number.isInteger(tapes)||tapes<1||tapes>5))throw Error('Use 1–5 tapes.');
 function parseAutomaton(element,depth=0){
  if(!element)throw Error('Missing automaton.');
  if(depth>64||stack.has(element))throw Error('Cyclic or excessively deep Turing block reference.');
  stack.add(element);
  const m=machine(type);m.name=name;m.tapes=tapes;
  m.states=[...element.children].filter(c=>['state','block'].includes(c.tagName)).map(c=>{
   if(++stateCount>20000)throw Error('Turing block expansion exceeds 20,000 states.');
   const s={id:Number(c.getAttribute('id')),name:c.getAttribute('name')||'q'+c.getAttribute('id'),x:Number(value(c,'x')||180),y:Number(value(c,'y')||180),initial:!!child(c,'initial'),final:!!child(c,'final'),label:value(c,'label'),output:value(c,'output')};
   const ref=value(c,'tag'),inline=child(c,'automaton');
   if(tm&&ref){
    if(inline)throw Error('A Turing block cannot have both a tag reference and an inline automaton.');
    const matches=[...root.getElementsByTagName(ref)];
    if(matches.length!==1)throw Error((matches.length?'Ambiguous':'Missing')+' Turing block definition: '+ref);
    const inner=parseAutomaton(matches[0],depth+1);s.blockTag=ref;
    // Original leaf blocks refer to empty machines; they perform no nested call.
    if(inner.states.length)s.block=inner;
   }else if(inline)s.block=parseAutomaton(inline,depth+1);
   return s;
  });
  m.transitions=[...element.children].filter(c=>c.tagName==='transition').map((c,id)=>{
   const t={id,from:Number(value(c,'from')),to:Number(value(c,'to')),read:value(c,'read')};
   if(type==='pda'){t.pop=value(c,'pop');t.push=value(c,'push');}if(type==='mealy')t.output=value(c,'transout');
   if(tm){
    const block=c.getAttribute('block')==='true';if(block)t.blockTransition=true;
    for(const key of ['read','write','move']){
     const entries=[...c.children].filter(e=>e.tagName===key),seen=new Set();
     for(const e of entries){const tape=Number(e.getAttribute('tape')||1);if(!Number.isInteger(tape)||tape<1||tape>tapes||seen.has(tape))throw Error('Invalid or duplicate Turing tape index.');seen.add(tape);}
     t[key]=Array.from({length:tapes},(_,i)=>block&&key!=='read'?(key==='write'?'~':'S'):(entries.find(e=>Number(e.getAttribute('tape')||1)===i+1)?.textContent||(key==='move'?'R':'')));
    }
   }
   return t;
  });
  m.notes=[...element.children].filter(c=>c.tagName==='note').map(c=>({text:value(c,'text'),x:Number(value(c,'x')),y:Number(value(c,'y'))}));
  const ids=m.states.map(s=>s.id);if(new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||id<0)||m.transitions.some(t=>!ids.includes(t.from)||!ids.includes(t.to)))throw Error('Invalid state identifiers or transition endpoints.');
  stack.delete(element);return m;
 }
 return parseAutomaton(child(root,'automaton'));
}
export function download(text,name,mime='text/plain'){const url=URL.createObjectURL(new Blob([text],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
