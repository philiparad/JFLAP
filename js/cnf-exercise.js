import {requireCFG,variable,removeLambda,removeUnit,removeUseless} from './grammar.js';
const copy=x=>structuredClone(x);
export class CNFExercise {
 constructor(grammar){if(grammar.format==='tokens-v1')throw Error('This exercise requires single-letter variables.');if(!grammar.productions?.length)throw Error('Enter a grammar first.');requireCFG(grammar.productions);this.source=copy(grammar);let p=copy(grammar.productions);this.start=p[0].left;const used=new Set(p.flatMap(r=>[...r.left,...r.right].filter(variable)));this.originalVariables=[...used];
 if(p.some(r=>r.right.includes(this.start))){const start=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find(v=>!used.has(v));if(!start)throw Error('No fresh single-letter variable is available for the start symbol.');p.unshift({left:start,right:this.start});this.start=start;used.add(start);}
 this.preparation=[{label:'Start isolated when needed',productions:copy(p)}];p=removeLambda(p);this.preparation.push({label:'Lambda productions removed (empty word preserved)',productions:copy(p)});p=removeUnit(p);this.preparation.push({label:'Unit productions removed',productions:copy(p)});p=p.length?removeUseless(p):[];this.preparation.push({label:'Useless productions removed',productions:copy(p)});
 this.emptyLanguage=!p.some(r=>r.left===this.start);if(this.emptyLanguage){const v=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find(v=>v!==this.start);p=[{left:this.start,right:v+v},{left:v,right:v+v}];}p.sort((a,b)=>(b.left===this.start)-(a.left===this.start));this.prepared=p;this.reset();}
 reset(){this.productions=copy(this.prepared);this.history=[];this.steps=[];}
 used(){return new Set([...this.originalVariables,...this.productions.flatMap(p=>[...p.left,...p.right].filter(variable))]);}
 fresh(){const v=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find(v=>!this.used().has(v));if(!v)throw Error('No unused single-letter variables remain.');return v;}
 validateName(name){if(!variable(name)||this.used().has(name))throw Error('Choose an unused single uppercase variable.');}
 terminals(){return [...new Set(this.productions.filter(p=>p.right.length>=2).flatMap(p=>[...p.right].filter(c=>!variable(c))))];}
 longRules(){return this.productions.map((p,index)=>({...p,index})).filter(p=>p.right.length>2);}
 save(){this.history.push(copy({productions:this.productions,steps:this.steps}));}
 replaceTerminal(terminal,name){this.validateName(name);if(!this.terminals().includes(terminal))throw Error('Choose a terminal in a compound right side.');this.save();this.productions=this.productions.map(p=>({...p,right:p.right.length>=2?[...p.right].map(c=>c===terminal?name:c).join(''):p.right}));this.productions.push({left:name,right:terminal});this.steps.push('Replace terminal '+JSON.stringify(terminal)+' with '+name+' in compound right sides.');}
 split(index,name){this.validateName(name);if(this.terminals().length)throw Error('Replace terminals in compound right sides first.');const p=this.productions[index];if(!p||p.right.length<=2)throw Error('Choose a right side with more than two variables.');this.save();this.productions.splice(index,1,{left:p.left,right:p.right[0]+name},{left:name,right:p.right.slice(1)});this.steps.push('Split '+p.left+' → '+p.right+' using '+name+'.');}
 step(){if(this.terminals().length){this.replaceTerminal(this.terminals()[0],this.fresh());return true;}if(this.longRules().length){this.split(this.longRules()[0].index,this.fresh());return true;}return false;}
 finish(){while(this.step());}
 undo(){const saved=this.history.pop();if(!saved)return false;Object.assign(this,saved);return true;}
 ready(){return this.productions.every(p=>(p.right.length===1&&!variable(p.right))||(p.right.length===2&&[...p.right].every(variable))||(!p.right&&p.left===this.start))&&!this.productions.some(p=>p.right.includes(this.start));}
 export(){if(!this.ready())throw Error('Finish terminal replacement and binarization before exporting.');return{type:'grammar',name:this.source.name+' · guided CNF',productions:copy(this.productions).sort((a,b)=>(b.left===this.start)-(a.left===this.start))};}
}
