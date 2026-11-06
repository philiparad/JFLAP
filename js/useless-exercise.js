import {requireCFG,variable,parseGrammar,grammarText} from './grammar.js';
import {parseSymbolSet,formatSymbolSet} from './grammar-exercises.js';
const key=p=>JSON.stringify([p.left,p.right]);
export class UselessExercise {
 constructor(grammar){if(grammar.format==='tokens-v1')throw Error('This exercise requires single-letter variables.');if(!grammar.productions?.length)throw Error('Enter a grammar first.');requireCFG(grammar.productions);this.source=structuredClone(grammar);this.start=grammar.productions[0].left;this.generating=new Set();this.rounds=[];let added;
 do{added=[...new Set(grammar.productions.filter(p=>[...p.right].every(c=>!variable(c)||this.generating.has(c))).map(p=>p.left))].filter(v=>!this.generating.has(v));if(added.length){this.rounds.push(added);added.forEach(v=>this.generating.add(v));}}while(added.length);
 this.productive=grammar.productions.filter(p=>this.generating.has(p.left)&&[...p.right].every(c=>!variable(c)||this.generating.has(c)));this.reachable=new Set([this.start]);const queue=[this.start];for(let i=0;i<queue.length;i++)for(const p of this.productive)if(p.left===queue[i])for(const c of p.right)if(variable(c)&&!this.reachable.has(c)){this.reachable.add(c);queue.push(c);}
 this.expected=[...new Map(this.productive.filter(p=>this.reachable.has(p.left)).map(p=>[key(p),p])).values()];this.reset();}
 reset(){this.answers={generating:'',reachable:''};this.productionAnswer='';}
 check(kind){if(!['generating','reachable'].includes(kind))throw Error('Choose a variable set.');try{const actual=parseSymbolSet(this.answers[kind]),expected=this[kind],missing=[...expected].filter(v=>!actual.has(v)),extra=[...actual].filter(v=>!expected.has(v));return{correct:!missing.length&&!extra.length,missing,extra};}catch(e){return{correct:false,error:e.message};}}
 fill(kind){this.answers[kind]=formatSymbolSet(this[kind]);}
 ready(){return ['generating','reachable'].every(k=>this.check(k).correct);}
 checkProductions(){if(!this.ready())throw Error('Correct both variable sets first.');try{const actual=this.productionAnswer.trim()?parseGrammar(this.productionAnswer):[],have=new Set(actual.map(key)),want=new Set(this.expected.map(key));return{correct:[...want].every(k=>have.has(k))&&[...have].every(k=>want.has(k)),missing:this.expected.filter(p=>!have.has(key(p))),extra:actual.filter(p=>!want.has(key(p)))};}catch(e){return{correct:false,error:e.message};}}
 fillProductions(){if(!this.ready())throw Error('Correct both variable sets first.');this.productionAnswer=grammarText(this.expected);}
 export(){if(!this.checkProductions().correct)throw Error('Correct the remaining productions first.');let productions=structuredClone(this.expected);if(!productions.length){const terminal=this.source.productions.flatMap(p=>[...p.right]).find(c=>!variable(c)&&!['λ','ε','!'].includes(c))||'a';productions=[{left:this.start,right:terminal+this.start}];}return{type:'grammar',name:this.source.name+' · useful productions',productions};}
}
