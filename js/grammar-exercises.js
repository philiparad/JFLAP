import {firstFollow} from './grammar.js';
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
