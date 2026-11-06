import {requireCFG,removeLambda,parseGrammar,grammarText} from './grammar.js';
import {parseSymbolSet,formatSymbolSet} from './grammar-exercises.js';
const key=p=>JSON.stringify([p.left,p.right]);
export class LambdaExercise {
 constructor(grammar){if(grammar.format==='tokens-v1')throw Error('This exercise requires single-letter variables.');if(!grammar.productions?.length)throw Error('Enter a grammar first.');requireCFG(grammar.productions);this.source=structuredClone(grammar);this.start=grammar.productions[0].left;this.nullable=new Set();this.rounds=[];let added;do{added=[...new Set(grammar.productions.filter(p=>[...p.right].every(c=>this.nullable.has(c))).map(p=>p.left))].filter(v=>!this.nullable.has(v));if(added.length){this.rounds.push(added);added.forEach(v=>this.nullable.add(v));}}while(added.length);this.expected=removeLambda(grammar.productions);this.reset();}
 reset(){this.setAnswer='';this.productionAnswer='';this.setChecked=false;}
 checkSet(){try{const actual=parseSymbolSet(this.setAnswer),missing=[...this.nullable].filter(v=>!actual.has(v)),extra=[...actual].filter(v=>!this.nullable.has(v));this.setChecked=!missing.length&&!extra.length;return{correct:this.setChecked,missing,extra};}catch(e){this.setChecked=false;return{correct:false,error:e.message};}}
 fillSet(){this.setAnswer=formatSymbolSet(this.nullable);return this.checkSet();}
 checkProductions(){if(!this.setChecked||!this.checkSet().correct)throw Error('Check the nullable-variable set first.');try{const actual=this.productionAnswer.trim()?parseGrammar(this.productionAnswer):[],have=new Set(actual.map(key)),want=new Set(this.expected.map(key));return{correct:[...want].every(k=>have.has(k))&&[...have].every(k=>want.has(k)),missing:this.expected.filter(p=>!have.has(key(p))),extra:actual.filter(p=>!want.has(key(p)))};}catch(e){return{correct:false,error:e.message};}}
 fillProductions(){if(!this.setChecked||!this.checkSet().correct)throw Error('Check the nullable-variable set first.');this.productionAnswer=grammarText(this.expected);}
 export(){const result=this.checkProductions();if(!result.correct)throw Error('Correct the transformed productions before exporting.');const productions=this.expected.length?structuredClone(this.expected):[{left:this.start,right:this.start}];return{type:'grammar',name:this.source.name+' · without lambda',productions};}
}
