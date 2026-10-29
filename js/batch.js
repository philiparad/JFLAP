import {simulate} from './simulation.js';
import {empty} from './automata.js';
import {derive,cyk} from './grammar.js';
// Empty lines are intentional empty-word test cases, including a final blank line.
export function parseInputs(text){return String(text).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split('\n');}
export function runBatch(models,inputs,options={}){
 if(!models.length)throw Error('Select at least one machine.');
 if(new Set(models.map(m=>m.type)).size!==1)throw Error('Select machines of the same type.');
 return inputs.map(input=>({input,results:models.map(m=>{try{return simulate(m,m.type.startsWith('turing')?input.split('|'):empty(input),options);}catch(e){return{status:'error',error:e.message};}})}));
}
export function batchCSV(models,rows){const cells=[['input','machine','status','output','error'],...rows.flatMap(row=>row.results.map((r,i)=>[row.input,models[i].name,r.status,JSON.stringify(r.outputs||[]),r.error||'']))];return cells.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');}
export function parseGrammarBatch(productions,inputs,limit=15000,method='derive'){
 if(!['derive','cyk'].includes(method))throw Error('Unknown grammar batch method.');
 return inputs.map(input=>{try{return{input,method,...(method==='cyk'?cyk(productions,empty(input)):derive(productions,empty(input),limit))};}catch(e){return{input,method,status:'error',error:e.message};}});
}
