import {cfgToPDA} from './grammar.js';
import {clone,empty} from './automata.js';
export class CFGPDAExercise {
 constructor(grammar,mode='ll'){if(!['ll','lr'].includes(mode))throw Error('Choose LL or LR construction.');this.mode=mode;if(grammar.format==='tokens-v1')throw Error('This exercise currently requires single-letter grammar variables.');if(!grammar.productions?.length)throw Error('Enter a grammar first.');this.template=cfgToPDA(grammar.productions,mode);this.template.name=grammar.name+' · guided '+mode.toUpperCase()+' PDA';const used=grammar.productions.map(p=>p.left+p.right).join('');let code=0x22a5;while(used.includes(String.fromCharCode(code)))code++;this.bottom=String.fromCharCode(code);this.template.transitions[0].push=(mode==='ll'?grammar.productions[0].left:'')+this.bottom;this.template.transitions[1].pop=(mode==='lr'?grammar.productions[0].left:'')+this.bottom;
 this.jobs=this.template.transitions.map((t,i)=>({key:String(i),description:i===0?'Initialize stack':i===1?'Accept after grammar is consumed':i<grammar.productions.length+2?(mode==='ll'?'Expand ':'Reduce ')+grammar.productions[i-2].left+' → '+(grammar.productions[i-2].right||'λ'):(mode==='ll'?'Match terminal ':'Shift terminal ')+t.read,expected:Object.fromEntries(['from','to','read','pop','push'].map(k=>[k,String(t[k])]))}));this.reset();}
 reset(){this.answers=Object.fromEntries(this.jobs.map(j=>[j.key,{from:'',to:'',read:'',pop:'',push:''}]));this.checked=new Set();}
 check(key){const j=this.jobs.find(j=>j.key===key);if(!j)throw Error('Select a transition.');const wrong=Object.keys(j.expected).filter(k=>(['from','to'].includes(k)?this.answers[key][k].trim():empty(this.answers[key][k]))!==j.expected[k]);if(wrong.length)this.checked.delete(key);else this.checked.add(key);return{correct:!wrong.length,wrong};}
 fill(key){const j=this.jobs.find(j=>j.key===key);if(!j)throw Error('Select a transition.');this.answers[key]={...j.expected};this.check(key);}
 step(){const j=this.jobs.find(j=>!this.checked.has(j.key));if(!j)return null;this.fill(j.key);return j.key;}
 finish(){for(const j of this.jobs)this.fill(j.key);}
 graph(){const m=clone(this.template);m.transitions=m.transitions.filter((t,i)=>this.checked.has(String(i))&&this.check(String(i)).correct);return m;}
 export(){if(this.jobs.some(j=>!this.checked.has(j.key)||!this.check(j.key).correct))throw Error('Check every transition before exporting.');return this.graph();}
}
