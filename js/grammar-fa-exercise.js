import {machine,state,edge,layout,clone,empty} from './automata.js';
import {fromLegacyGrammar,validateTokenGrammar,tokenText} from './token-grammar.js';
export class GrammarFAExercise {
 constructor(input){this.grammar=input.format==='tokens-v1'?clone(validateTokenGrammar(input)):fromLegacyGrammar(input);const rules=this.grammar.productions;
  if(rules.some(p=>p.left.length!==1||p.left[0].kind!=='variable'||p.right.some((s,i)=>s.kind==='variable'&&i!==p.right.length-1)))throw Error('Use a right-linear grammar: one left variable, followed by terminals and at most one final variable on the right.');
  if(rules.some(p=>p.right.some(s=>s.kind==='terminal'&&['λ','ε','!'].includes(s.name))))throw Error('Literal λ, ε and ! terminals cannot be represented by the current automaton format.');
  this.variables=[...new Set(rules.flatMap(p=>[p.left[0].name,...p.right.filter(s=>s.kind==='variable').map(s=>s.name)]))];this.final=this.variables.length;
  this.jobs=rules.map((p,index)=>({key:String(index),description:tokenText(p.left)+' → '+tokenText(p.right),expected:{from:String(this.variables.indexOf(p.left[0].name)),read:p.right.filter(s=>s.kind==='terminal').map(s=>s.name).join(''),to:String(p.right.at(-1)?.kind==='variable'?this.variables.indexOf(p.right.at(-1).name):this.final)}}));this.reset();
 }
 reset(){this.answers=Object.fromEntries(this.jobs.map(j=>[j.key,{from:'',read:'',to:''}]));this.checked=new Set();}
 check(key){const j=this.jobs.find(j=>j.key===key);if(!j)throw Error('Select a production.');const a=this.answers[key],wrong=['from','read','to'].filter(k=>(k==='read'?empty(a[k]):a[k].trim())!==j.expected[k]);if(wrong.length)this.checked.delete(key);else this.checked.add(key);return{correct:!wrong.length,wrong};}
 fill(key){const j=this.jobs.find(j=>j.key===key);if(!j)throw Error('Select a production.');this.answers[key]={...j.expected};this.check(key);}
 step(){const j=this.jobs.find(j=>!this.checked.has(j.key));if(!j)return null;this.fill(j.key);return j.key;}
 finish(){for(const j of this.jobs)this.fill(j.key);}
 graph(){const out=machine();out.name=this.grammar.name+' · guided FA';for(const name of this.variables)state(out).name=name;state(out).name='Accept';out.states[this.final].final=true;for(const j of this.jobs){if(!this.checked.has(j.key)||!this.check(j.key).correct)continue;const e=j.expected,chars=[...e.read];let from=Number(e.from);if(!chars.length)edge(out,from,Number(e.to),'');for(let i=0;i<chars.length;i++){const to=i===chars.length-1?Number(e.to):state(out).id;edge(out,from,to,chars[i]);from=to;}}return layout(out);}
 export(){if(this.jobs.some(j=>!this.checked.has(j.key)||!this.check(j.key).correct))throw Error('Check every production transition before exporting.');return this.graph();}
}
