import {firstFollow,llTable,lrTable,lrParse,variable} from './grammar.js';
export function parseSymbolSet(value){
 const text=value.trim();if(!text||text==='∅')return new Set();
 let symbols;if(text.startsWith('[')){symbols=JSON.parse(text);if(!Array.isArray(symbols)||symbols.some(s=>typeof s!=='string'))throw Error('Use a JSON array of symbol strings.');}
 else symbols=[...text.replace(/[\s,]/g,'')];
 const result=new Set();for(let symbol of symbols){if(symbol==='λ'||symbol==='ε')symbol='';if(symbol.length>1)throw Error('Each set member must be one symbol or λ.');result.add(symbol);}return result;
}
export const formatSymbolSet=set=>JSON.stringify([...set].map(s=>s||'λ'));
export class FirstFollowExercise {
 constructor(productions){this.data=firstFollow(productions);this.cells=this.data.vars.flatMap(variable=>['first','follow'].map(kind=>({key:kind+':'+variable,kind,variable})));this.answers=Object.fromEntries(this.cells.map(c=>[c.key,'']));}
 expected(key){const c=this.cells.find(c=>c.key===key);if(!c)throw Error('Choose a FIRST or FOLLOW cell.');return this.data[c.kind][c.variable];}
 check(key){const expected=this.expected(key);try{const actual=parseSymbolSet(this.answers[key]);const missing=[...expected].filter(s=>!actual.has(s)),extra=[...actual].filter(s=>!expected.has(s));return{correct:!missing.length&&!extra.length,missing,extra};}catch(error){return{correct:false,error:error.message,missing:[],extra:[]};}}
 checkAll(){return this.cells.map(c=>({...c,...this.check(c.key)}));}
 fill(key){return this.answers[key]=formatSymbolSet(this.expected(key));}
 reset(){for(const c of this.cells)this.answers[c.key]='';}
}
export class LLTableExercise {
 constructor(productions){
  this.productions=productions.map(p=>({...p}));this.data=llTable(productions);
  this.columns=[...new Set(productions.flatMap(p=>[...p.right].filter(c=>!variable(c)))),'$'].filter((c,i,a)=>a.indexOf(c)===i);
  this.cells=this.data.vars.flatMap(row=>this.columns.map(column=>({key:row+','+column,row,column})));
  this.answers=Object.fromEntries(this.cells.map(c=>[c.key,'']));
 }
 expected(key){if(!this.cells.some(c=>c.key===key))throw Error('Select a table cell.');return (this.data.table[key]||[]).map(i=>i+1);}
 check(key){const expected=this.expected(key),text=this.answers[key].trim();
  if(text&&!/^\d+(?:[\s,]+\d+)*$/.test(text))return{correct:false,error:'Enter production numbers separated by commas, or leave an empty cell blank.'};
  const values=text?[...new Set(text.split(/[\s,]+/).map(Number))]:[];
  if(values.some(i=>i<1||i>this.productions.length))return{correct:false,error:'Production number is outside the grammar.'};
  return{correct:values.length===expected.length&&expected.every(i=>values.includes(i)),missing:expected.filter(i=>!values.includes(i)),extra:values.filter(i=>!expected.includes(i))};
 }
 checkAll(){return this.cells.map(c=>({...c,...this.check(c.key)}));}
 fill(key){return this.answers[key]=this.expected(key).join(', ');}
 step(){const cell=this.cells.find(c=>!this.check(c.key).correct);if(!cell)return null;this.fill(cell.key);return cell.key;}
 fillAll(){for(const c of this.cells)this.fill(c.key);}
 reset(){for(const c of this.cells)this.answers[c.key]='';}
}

export class LRTableExercise extends LLTableExercise {
 constructor(productions){
  super(productions);this.data=lrTable(productions);this.rows=this.data.sets.map((_,i)=>String(i));
  this.columns=[...new Set([...this.columns,...this.data.vars])];this.cells=this.rows.flatMap(row=>this.columns.map(column=>({key:row+','+column,row,column})));
  this.answers=Object.fromEntries(this.cells.map(c=>[c.key,'']));this.choices={};
 }
 expected(key){if(!this.cells.some(c=>c.key===key))throw Error('Select a table cell.');return this.data.table[key]||[];}
 check(key){const expected=this.expected(key),text=this.answers[key].trim(),values=text?[...new Set(text.split(/[\s,]+/))]:[];
  if(values.some(v=>!/^(s\d+|r\d+|acc|\d+)$/.test(v)))return{correct:false,error:'Use sN, rN, acc, or a goto state number; separate alternatives with commas.'};
  return{correct:values.length===expected.length&&expected.every(v=>values.includes(v)),missing:expected.filter(v=>!values.includes(v)),extra:values.filter(v=>!expected.includes(v))};
 }
 resolve(key,action){if(!this.data.conflicts.includes(key)||!this.expected(key).includes(action))throw Error('Choose an available action for a conflicting cell.');this.choices[key]=action;}
 parse(input){if(this.checkAll().some(r=>!r.correct))throw Error('Complete and check the table before parsing.');return lrParse(this.productions,input,this.choices);}
 reset(){super.reset();this.choices={};}
}
