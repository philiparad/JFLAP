import {requireCFG,variable,parseGrammar,grammarText} from './grammar.js';
import {parseSymbolSet,formatSymbolSet} from './grammar-exercises.js';
const key=p=>JSON.stringify([p.left,p.right]);
export class UnitExercise {
 constructor(grammar){if(grammar.format==='tokens-v1')throw Error('This exercise requires single-letter variables.');if(!grammar.productions?.length)throw Error('Enter a grammar first.');requireCFG(grammar.productions);this.source=structuredClone(grammar);this.start=grammar.productions[0].left;this.variables=[...new Set(grammar.productions.flatMap(p=>[p.left,...[...p.right].filter(variable)]))];this.edges=grammar.productions.filter(p=>variable(p.right));this.dependencies={};this.expected=[];
 for(const v of this.variables){const reached=new Set([v]),queue=[v];for(let i=0;i<queue.length;i++)for(const p of this.edges)if(p.left===queue[i]&&!reached.has(p.right)){reached.add(p.right);queue.push(p.right);}this.dependencies[v]=reached;for(const p of grammar.productions)if(reached.has(p.left)&&!variable(p.right))this.expected.push({left:v,right:p.right});}this.expected=[...new Map(this.expected.map(p=>[key(p),p])).values()];this.reset();}
 reset(){this.answers=Object.fromEntries(this.variables.map(v=>[v,'']));this.productionAnswer='';}
 check(v){try{const actual=parseSymbolSet(this.answers[v]),expected=this.dependencies[v],missing=[...expected].filter(x=>!actual.has(x)),extra=[...actual].filter(x=>!expected.has(x));return{correct:!missing.length&&!extra.length,missing,extra};}catch(e){return{correct:false,error:e.message};}}
 fill(v){this.answers[v]=formatSymbolSet(this.dependencies[v]);}
 fillAll(){this.variables.forEach(v=>this.fill(v));}
 ready(){return this.variables.every(v=>this.check(v).correct);}
 checkProductions(){if(!this.ready())throw Error('Complete the unit-dependency sets first.');try{const actual=this.productionAnswer.trim()?parseGrammar(this.productionAnswer):[],have=new Set(actual.map(key)),want=new Set(this.expected.map(key));return{correct:[...want].every(k=>have.has(k))&&[...have].every(k=>want.has(k)),missing:this.expected.filter(p=>!have.has(key(p))),extra:actual.filter(p=>!want.has(key(p)))};}catch(e){return{correct:false,error:e.message};}}
 fillProductions(){if(!this.ready())throw Error('Complete the unit-dependency sets first.');this.productionAnswer=grammarText(this.expected);}
 export(){if(!this.checkProductions().correct)throw Error('Correct the replacement productions first.');let productions=structuredClone(this.expected);if(!productions.some(p=>p.left===this.start)){const terminal=this.source.productions.flatMap(p=>[...p.right]).find(c=>!variable(c)&&!['λ','ε','!'].includes(c))||'a';productions=[{left:this.start,right:terminal+this.start}];}return{type:'grammar',name:this.source.name+' · without unit rules',productions};}
}
