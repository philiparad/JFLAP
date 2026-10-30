// Explicit token identities keep generated names such as [q0,Z,q1] atomic.
// Legacy grammars remain character-based and are not rewritten on import.
import {DerivationSearch} from './grammar-search.js';
import {ManualDerivation} from './grammar-rewrite.js';
export const V=name=>({kind:'variable',name:String(name)});
export const T=name=>({kind:'terminal',name:String(name)});
const identity=s=>JSON.stringify([s.kind,s.name]);
export function validateTokenGrammar(m){
 if(m.type!=='grammar'||m.format!=='tokens-v1'||!Array.isArray(m.productions)||!m.productions.length)throw Error('Invalid token grammar.');
 for(const p of m.productions){
  if(!Array.isArray(p.left)||!p.left.length||!Array.isArray(p.right))throw Error('Production sides must be token arrays; the left side cannot be empty.');
  for(const s of [...p.left,...p.right])if(!s||!['variable','terminal'].includes(s.kind)||typeof s.name!=='string'||!s.name.length||(s.kind==='terminal'&&[...s.name].length!==1))throw Error('Use named variables and single-symbol terminals.');
  if(!p.left.some(s=>s.kind==='variable'))throw Error('A production left side must contain a variable.');
 }
 if(m.productions[0].left.length!==1||m.productions[0].left[0].kind!=='variable')throw Error('The first production must define a single start variable.');
 return m;
}
export function tokenGrammar(productions,name='Generated grammar'){
 return validateTokenGrammar({type:'grammar',format:'tokens-v1',name,productions:structuredClone(productions)});
}
export function fromLegacyGrammar(m){
 return tokenGrammar(m.productions.map(p=>({left:[...p.left].map(c=>/^[A-Z]$/.test(c)?V(c):T(c)),right:[...p.right].map(c=>/^[A-Z]$/.test(c)?V(c):T(c))})),m.name);
}
export const tokenText=side=>side.map(s=>s.kind==='variable'?'⟨'+s.name+'⟩':JSON.stringify(s.name)).join(' ')||'λ';
export const tokenGrammarText=m=>m.productions.map(p=>tokenText(p.left)+' → '+tokenText(p.right)).join('\n');
export function compileTokenGrammar(m){
 validateTokenGrammar(m);const symbols=[],codes=new Map();
 const encode=s=>{const key=identity(s);if(!codes.has(key)){if(symbols.length>=6400)throw Error('Grammar exceeds 6,400 distinct symbols.');const code=String.fromCharCode(0xE000+symbols.length);symbols.push({...s});codes.set(key,code);}return codes.get(key);};
 const productions=m.productions.map(p=>({left:p.left.map(encode).join(''),right:p.right.map(encode).join('')}));
 const decode=word=>[...word].map(c=>{const symbol=symbols[c.charCodeAt(0)-0xE000];if(!symbol)throw Error('Unknown encoded symbol.');return {...symbol};});
 return {productions,decode,symbols,encodeInput:input=>[...input].map(c=>encode(T(c))).join('')};
}
export class TokenDerivationSearch {
 constructor(m,input,options={}){
  this.codec=compileTokenGrammar(m);const encoded=this.codec.encodeInput(input),cfg=m.productions.every(p=>p.left.length===1&&p.left[0].kind==='variable');
  const terminal=c=>this.codec.symbols[c.charCodeAt(0)-0xE000].kind==='terminal';
  const prune=cfg?word=>{
   const letters=[...word];if(letters.filter(terminal).length>encoded.length)return true;
   let prefix='',suffix='';for(const c of letters){if(!terminal(c))break;prefix+=c;}
   for(let i=letters.length-1;i>=0&&terminal(letters[i]);i--)suffix=letters[i]+suffix;
   return !encoded.startsWith(prefix)||!encoded.endsWith(suffix);
  }:null;
  this.search=new DerivationSearch(this.codec.productions,encoded,{...options,prune});this.productions=structuredClone(m.productions);
 }
 get status(){return this.search.status;}
 chunk(budget){this.search.chunk(budget);return this.result();}
 pause(){this.search.pause();}resume(additional){this.search.resume(additional);}cancel(){this.search.cancel();}
 result(){const r=this.search.result();return {...r,rows:r.rows.map(row=>({...row,word:tokenText(this.codec.decode(row.word)),action:this.decodeAction(row.action)}))};}
 decodeAction(action){const [left,right]=action.split(' → ');return tokenText(this.codec.decode(left))+' → '+(right==='λ'?'λ':tokenText(this.codec.decode(right)));}
}
export class TokenManualDerivation {
 constructor(m){this.codec=compileTokenGrammar(m);this.session=new ManualDerivation(this.codec.productions);}
 get word(){return this.codec.decode(this.session.word);}
 get rows(){return this.session.rows.map(row=>({...row,word:this.codec.decode(row.word)}));}
 occurrences(rule){return this.session.occurrences(rule);}
 apply(rule,position){this.session.apply(rule,position);return this.word;}
 undo(){this.session.undo();return this.word;}reset(){this.session.reset();}
}
