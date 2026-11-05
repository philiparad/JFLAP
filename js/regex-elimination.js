import {validate,normalizeFA,clone,layout} from './automata.js';
const union=(a,b)=>!a?b:!b||a===b?a:`(${a}+${b})`;
const concat=(...terms)=>terms.some(t=>!t)?'':terms.filter(t=>t!=='λ').join('')||'λ';
export class RegexElimination {
 constructor(input,{maxExpression=200000,maxTotal=2000000}={}){validate(input);if(input.type!=='fa')throw Error('Select a finite automaton.');this.source=normalizeFA(input);if(this.source.states.length>100)throw Error('Interactive elimination supports at most 100 normalized states.');if(this.source.transitions.some(t=>/[+*()∅\s]/.test(t.read)))throw Error('This expression notation cannot represent literal regex operators or whitespace. Rename those input symbols first.');this.maxExpression=maxExpression;this.maxTotal=maxTotal;this.reset();}
 reset(){this.start=Math.max(...this.source.states.map(s=>s.id))+1;this.end=this.start+1;this.active=[this.start,...this.source.states.map(s=>s.id),this.end];this.labels={};this.history=[];this.changes=[];this.order=[];for(const t of this.source.transitions){const key=t.from+','+t.to;this.labels[key]=union(this.labels[key]||'',t.read||'λ');}this.labels[this.start+','+this.source.states.find(s=>s.initial).id]='λ';for(const s of this.source.states.filter(s=>s.final))this.labels[s.id+','+this.end]='λ';}
 candidates(){return this.active.filter(id=>id!==this.start&&id!==this.end);}
 get(i,j){return this.labels[i+','+j]||'';}
 eliminate(k){if(!this.candidates().includes(k))throw Error('Choose a remaining original state; Start and End are protected.');const rest=this.active.filter(id=>id!==k),next={},changes=[],loop=this.get(k,k),star=!loop||loop==='λ'?'λ':`(${loop})*`;let size=0;
 for(const i of rest)for(const j of rest){const before=this.get(i,j),via=concat(this.get(i,k),star,this.get(k,j)),after=union(before,via);if(after.length>this.maxExpression||(size+=after.length)>this.maxTotal)throw Error('Expression size limit reached. Undo or reset and try a different elimination order.');if(after)next[i+','+j]=after;if(after!==before)changes.push({from:i,to:j,before:before||'∅',via:via||'∅',after:after||'∅'});}
 this.history.push({active:this.active,labels:this.labels,changes:this.changes,order:this.order});this.active=rest;this.labels=next;this.changes=changes;this.order=[...this.order,k];return changes;
 }
 undo(){const previous=this.history.pop();if(!previous)return false;Object.assign(this,previous);return true;}
 finish(){for(const id of this.candidates())this.eliminate(id);}
 expression(){if(this.candidates().length)throw Error('Eliminate all original states before exporting the expression.');return this.get(this.start,this.end)||'∅';}
 name(id){return id===this.start?'Start':id===this.end?'End':this.source.states.find(s=>s.id===id)?.name||'q'+id;}
 graph(){const states=this.active.map(id=>({id,name:this.name(id),label:'',initial:id===this.start,final:id===this.end}));const transitions=Object.entries(this.labels).map(([key,read],id)=>{const [from,to]=key.split(',').map(Number);return{id,from,to,read};});return layout({type:'fa',name:'Generalized transition graph',states,transitions,notes:[]});}
 export(){return{type:'re',name:this.source.name+' · guided expression',expression:this.expression(),steps:clone(this.order.map(eliminated=>({eliminated})))};}
}
