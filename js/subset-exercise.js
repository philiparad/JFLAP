import {validate,normalizeFA,closure,alphabet,machine,state,edge,layout,clone} from './automata.js';
export class SubsetExercise {
 constructor(input){validate(input);if(input.type!=='fa')throw Error('Select a finite automaton.');this.source=normalizeFA(input);this.alphabet=alphabet(this.source);this.reset();}
 reset(){this.output=machine();this.output.name=this.source.name+' · guided DFA';this.subsets=[];this.done=new Set();this.add(closure(this.source,[this.source.states.find(s=>s.initial).id]));}
 add(ids){const key=ids.join(',');let id=this.subsets.findIndex(set=>set.join(',')===key);if(id>=0)return id;if(this.subsets.length>=2048)throw Error('Subset construction exceeded 2,048 states.');id=this.subsets.length;this.subsets.push(ids);const s=state(this.output);s.label=ids.join(', ')||'∅';s.final=ids.some(id=>this.source.states.find(s=>s.id===id).final);layout(this.output);return id;}
 jobs(){return this.subsets.flatMap((_,from)=>this.alphabet.filter(symbol=>!this.done.has(JSON.stringify([from,symbol]))).map(symbol=>({from,symbol})));}
 expected(from,symbol){if(!this.subsets[from]||!this.alphabet.includes(symbol))throw Error('Select a subset and alphabet symbol.');return closure(this.source,this.source.transitions.filter(t=>this.subsets[from].includes(t.from)&&t.read===symbol).map(t=>t.to));}
 parse(text){if(!text.trim()||text.trim()==='∅')return[];if(!/^\d+(?:[\s,]+\d+)*$/.test(text.trim()))throw Error('Enter source state IDs separated by commas, or ∅.');const ids=[...new Set(text.trim().split(/[\s,]+/).map(Number))].sort((a,b)=>a-b);if(ids.some(id=>!this.source.states.some(s=>s.id===id)))throw Error('Unknown source state ID.');return ids;}
 submit(from,symbol,text){const actual=this.parse(text),expected=this.expected(from,symbol),missing=expected.filter(id=>!actual.includes(id)),extra=actual.filter(id=>!expected.includes(id));if(missing.length||extra.length)return{correct:false,missing,extra};const key=JSON.stringify([from,symbol]);if(!this.done.has(key)){if(expected.length){const to=this.add(expected);edge(this.output,from,to,symbol);}this.done.add(key);}return{correct:true,empty:!expected.length};}
 step(){const job=this.jobs()[0];if(!job)return null;this.submit(job.from,job.symbol,this.expected(job.from,job.symbol).join(','));return job;}
 expand(from){for(const symbol of this.alphabet)this.submit(from,symbol,this.expected(from,symbol).join(','));}
 finish(){while(this.step());}
 export(){if(this.jobs().length)throw Error('Complete every subset transition before exporting.');return clone(layout(this.output));}
}
