import {lrTable} from './grammar.js';
const normalized=items=>[...new Map(items.map(i=>[i.join(':'),i])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
export class LRItemsExercise {
 constructor(productions){this.data=lrTable(productions);this.symbols=[...new Set(this.data.rules.flatMap(r=>[...r.right]))];this.reset();}
 reset(){this.answers=this.data.sets.map(()=>'');this.edges={};}
 parse(text){return normalized(text.trim()?text.trim().split(/[\s,]+/).map(token=>{if(!/^\d+:\d+$/.test(token))throw Error('Use rule:dot pairs, for example 0:0 1:0.');const [r,d]=token.split(':').map(Number);if(!this.data.rules[r]||d>this.data.rules[r].right.length)throw Error('Rule number or dot position is outside the grammar.');return[r,d];}):[]);}
 format(items){return normalized(items).map(i=>i.join(':')).join(' ');}
 closure(items){const out=this.parse(this.format(items));for(let i=0;i<out.length;i++){const [r,d]=out[i],symbol=this.data.rules[r].right[d];this.data.rules.forEach((rule,j)=>{if(rule.left===symbol&&!out.some(([n,k])=>n===j&&k===0))out.push([j,0]);});}return normalized(out);}
 goto(items,symbol){return this.closure(items.filter(([r,d])=>this.data.rules[r].right[d]===symbol).map(([r,d])=>[r,d+1]));}
 checkState(id){try{const actual=this.parse(this.answers[id]),expected=this.data.sets[id];return{correct:this.format(actual)===this.format(expected),missing:expected.filter(i=>!actual.some(j=>i.join(':')===j.join(':'))),extra:actual.filter(i=>!expected.some(j=>i.join(':')===j.join(':')))};}catch(e){return{correct:false,error:e.message};}}
 closeState(id){this.answers[id]=this.format(this.closure(this.parse(this.answers[id])));}
 fillState(id){this.answers[id]=this.format(this.data.sets[id]);}
 connect(from,symbol,target){if(!this.symbols.includes(symbol)||!this.data.sets[from])throw Error('Choose a state and grammar symbol.');const key=from+','+symbol;if(target===''){delete this.edges[key];return;}if(!/^\d+$/.test(String(target))||!this.data.sets[Number(target)])throw Error('Target must be an existing state number.');this.edges[key]=Number(target);}
 doGoto(from,symbol){if(!this.checkState(from).correct)throw Error('Complete the source item set before using goto assistance.');const items=this.goto(this.parse(this.answers[from]),symbol);if(!items.length){this.connect(from,symbol,'');return null;}const target=this.data.sets.findIndex(set=>this.format(set)===this.format(items));this.connect(from,symbol,String(target));this.answers[target]=this.format(items);return target;}
 check(){const states=this.answers.map((_,i)=>this.checkState(i));const missing=this.data.transitions.filter(t=>this.edges[t.from+','+t.symbol]!==t.to);const extra=Object.entries(this.edges).filter(([key,to])=>!this.data.transitions.some(t=>t.from+','+t.symbol===key&&t.to===to));return{correct:states.every(s=>s.correct)&&!missing.length&&!extra.length,states,missing,extra};}
 step(){const state=this.answers.findIndex((_,i)=>!this.checkState(i).correct);if(state>=0){this.fillState(state);return 'Filled state '+state;}const result=this.check();if(result.extra.length){delete this.edges[result.extra[0][0]];return 'Removed incorrect transition';}if(result.missing.length){const t=result.missing[0];this.connect(t.from,t.symbol,String(t.to));return 'Added transition '+t.from+' on '+t.symbol+' to '+t.to;}return 'Construction is correct.';}
 fillAll(){this.answers.forEach((_,i)=>this.fillState(i));this.edges={};for(const t of this.data.transitions)this.connect(t.from,t.symbol,String(t.to));}
 itemText([r,d]){const rule=this.data.rules[r];return rule.left+' → '+rule.right.slice(0,d)+'•'+rule.right.slice(d);}
}
