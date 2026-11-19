import {operationHelp} from '../js/context-help.js';

export async function testContextHelp(){
 const results=[],contexts=[];
 const check=(condition,message)=>{if(!condition)throw Error(message);};
 const run=async(name,fn)=>{try{await fn();results.push({name});}catch(error){results.push({name,error});}};
 for(const type of ['fa','pda','mealy','moore','turing','multitape','turingbb'])for(const operation of ['Editor','Simulate','Multiple Run','Inspect','Batch Test'])contexts.push({type,operation});
 contexts.push({type:'pda',operation:'PDA → CFG'});
 for(const operation of ['NFA → DFA','Minimize','FA → regex','FA → grammar'])contexts.push({type:'fa',operation});
 for(const operation of ['Editor','Manual Derivation','Transform','Remove λ','Remove unit','Remove useless','Build CNF','Build FA','Build PDA (LL)','Build PDA (LR)'])contexts.push({type:'grammar',operation});
 for(const parser of ['derive','llParse','lrParse','cyk'])contexts.push({type:'grammar',operation:'Parse',parser});
 for(const parser of ['derive','cyk'])contexts.push({type:'grammar',operation:'Multiple Parse',parser});
 for(const exercise of ['first','ll','lr','items'])contexts.push({type:'grammar',operation:'Exercises',exercise});
 for(const operation of ['Editor','Parse','Build FA','Build PDA (LL)','Build PDA (LR)'])contexts.push({type:'grammar',format:'tokens-v1',operation});
 for(const [type,operations] of [['re',['Editor','Test','Build NFA']],['lsystem',['Editor','Render']],['pumpingreg',['Editor']],['pumpingcf',['Editor']]])for(const operation of operations)contexts.push({type,operation});

 await run('Help covers every editor and supported operation with practical guidance',()=>{
  for(const context of contexts){const h=operationHelp(context);check(h.id!=='default','Missing help: '+JSON.stringify(context));check(h.title&&h.steps.length>=3&&h.reference&&h.guide,'Incomplete guidance');}
 });
 await run('Help follows parser, exercise and named-grammar context with a safe fallback',()=>{
  const resolve=(operation,options={})=>operationHelp({type:'grammar',operation,...options});
  check(resolve('Parse',{parser:'llParse'}).reference.endsWith('LLParsePane.html'),'LL parser route');
  check(resolve('Parse',{parser:'lrParse'}).reference.endsWith('LRParsePane.html'),'SLR parser route');
  check(resolve('Exercises',{exercise:'ll'}).id==='ll-table','LL exercise route');
  check(resolve('Exercises',{exercise:'lr'}).id==='lr-table','LR exercise route');
  check(resolve('Exercises',{exercise:'items'}).id==='items','Item exercise route');
  check(resolve('Parse',{format:'tokens-v1',parser:'llParse'}).id==='generated','Named grammar must not route to the single-character LL parser');
  check(resolve('Multiple Parse',{parser:'cyk'}).id==='multiple-cyk','Batch CYK route');
  for(const context of [{},{type:'unknown'},{type:'fa',operation:'missing'},{type:'grammar',operation:'Exercises',exercise:'unknown'}])check(operationHelp(context).id==='default','No fallback');
  const before=JSON.stringify(contexts);contexts.forEach(operationHelp);check(JSON.stringify(contexts)===before,'Help mutated operation context');
 });
 await run('All contextual help links resolve to bundled pages and existing guide anchors',async()=>{
  const links=new Set([operationHelp(),...contexts.map(operationHelp)].flatMap(h=>[h.reference,h.guide]));
  const pages=new Map();
  for(const url of links){check(url.startsWith('docs/'),'Unexpected external help destination');const [path,anchor]=url.split('#');if(!pages.has(path)){const response=await fetch('../'+path);check(response.ok,'Missing help file: '+path);pages.set(path,new DOMParser().parseFromString(await response.text(),'text/html'));}if(anchor)check(pages.get(path).getElementById(anchor),'Missing help anchor: '+url);}
 });
 return results;
}
