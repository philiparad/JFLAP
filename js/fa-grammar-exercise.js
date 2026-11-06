import {validate,normalizeFA,empty} from './automata.js';
import {V,T,tokenGrammar} from './token-grammar.js';
export class FAGrammarExercise {
 constructor(input){validate(input);if(input.type!=='fa')throw Error('Select a finite automaton.');this.source=normalizeFA(input);this.jobs=[...this.source.transitions.map((t,i)=>({key:'edge'+i,description:`Transition ${t.from} —${t.read||'λ'}→ ${t.to}`,expected:{left:'Q'+t.from,terminal:t.read,target:'Q'+t.to}})),...this.source.states.filter(s=>s.final).map(s=>({key:'final'+s.id,description:'Final state '+s.id,expected:{left:'Q'+s.id,terminal:'',target:''}}))];this.reset();}
 reset(){this.answers=Object.fromEntries(this.jobs.map(j=>[j.key,{left:'',terminal:'',target:''}]));this.checked=new Set();}
 check(key){const job=this.jobs.find(j=>j.key===key);if(!job)throw Error('Select a production.');const a=this.answers[key],e=job.expected;const wrong=['left','terminal','target'].filter(k=>(k==='terminal'?empty(a[k]):a[k].trim())!==e[k]);if(wrong.length)this.checked.delete(key);else this.checked.add(key);return{correct:!wrong.length,wrong};}
 fill(key){const job=this.jobs.find(j=>j.key===key);if(!job)throw Error('Select a production.');this.answers[key]={...job.expected};this.check(key);}
 step(){const job=this.jobs.find(j=>!this.checked.has(j.key));if(!job)return null;this.fill(job.key);return job.key;}
 finish(){for(const j of this.jobs)this.fill(j.key);}
 export(){if(this.jobs.some(j=>!this.checked.has(j.key)||!this.check(j.key).correct))throw Error('Check every production before exporting.');const productions=[{left:[V('Start')],right:[V('Q'+this.source.states.find(s=>s.initial).id)]}];for(const j of this.jobs){const a=j.expected;productions.push({left:[V(a.left)],right:[...(a.terminal?[T(a.terminal)]:[]),...(a.target?[V(a.target)]:[])]});}const unique=[...new Map(productions.map(p=>[JSON.stringify(p),p])).values()];return tokenGrammar(unique,this.source.name+' · guided grammar');}
}
