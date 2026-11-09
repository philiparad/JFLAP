import {regularStrategies} from './regular-pumping.js';
import {languages,pump} from './pumping.js';

// Regular opponents use the original per-exercise policies. Context-free policies
// remain bounded until Task 51; a round is never a language proof.
const exponents=[0,2,3,4,5,6,7,8,9,10,11,12];
export class PumpingGame {
 constructor(language,mode='human-first',random=Math.random) {
  this.language=languages.find(l=>l.id===language);
  if(!this.language||!['human-first','computer-first'].includes(mode))throw Error('Choose a language and turn order.');
  this.mode=mode;this.cf=this.language.cf;this.strategy=this.cf?null:regularStrategies[language];this.range=this.strategy?.range||[1,20];this.random=random;this.phase='length';this.moves=[];this.result=null;this.attempts=[];
 }
 get actor(){return (['length','split'].includes(this.phase)?this.mode==='human-first':this.mode!=='human-first')?'human':'computer';}
 require(phase,actor){if(this.phase!==phase||this.actor!==actor)throw Error('That move is not available on this turn.');}
 record(phase,value){this.moves.push({actor:this.actor,phase,value});}
 chooseLength(m,actor='human') {
  this.require('length',actor);
  if(!Number.isInteger(m)||m<this.range[0]||m>this.range[1])throw Error(`Choose an integer pumping length from ${this.range[0]} to ${this.range[1]}.`);
  this.record('length',m);this.m=m;this.phase='word';
 }
 chooseWord(word,actor='human') {
  this.require('word',actor);
  if(typeof word!=='string'||word.length<this.m||word.length>120||!this.language.test(word))throw Error('Use a word in the language, at least m and at most 120 symbols long.');
  this.record('word',word);this.word=word;this.phase='split';
 }
 chooseSplit(parts,actor='human') {
  this.require('split',actor);
  if(!Array.isArray(parts)||parts.some(p=>typeof p!=='string'))throw Error('Enter each part of the word.');
  pump(this.language,this.word,parts,this.m,1,this.cf);
  this.record('split',[...parts]);this.parts=[...parts];this.phase='exponent';
 }
 chooseExponent(i,actor='human') {
  this.require('exponent',actor);
  if(!exponents.includes(i))throw Error('Choose exponent 0 or an integer from 2 to 12.');
  const result=pump(this.language,this.word,this.parts,this.m,i,this.cf);
  this.record('exponent',i);this.i=i;
  const defender=this.mode==='human-first'?'human':'computer';
  this.result={...result,winner:result.belongs?defender:(defender==='human'?'computer':'human')};this.attempts.push({...this.result,parts:[...this.parts],i});this.phase='complete';
 }
 retry(){if(this.phase!=='complete')throw Error('Finish the attempt first.');this.result=null;this.phase=this.mode==='human-first'?'split':'exponent';}
 computerMove() {
  if(this.phase==='complete'||this.actor!=='computer')throw Error('It is not the computer’s turn.');
  if(this.phase==='length')this.chooseLength(this.strategy?this.strategy.chooseM(this.random):3,'computer');
  else if(this.phase==='word')this.chooseWord(this.strategy?this.strategy.word(this.m,this.random):this.language.sample(this.m),'computer');
  else if(this.phase==='split')this.chooseSplit(this.computerSplit(),'computer');
  else if(this.strategy)this.chooseExponent(this.strategy.exponent(this.word,this.parts,this.m,this.random),'computer');
  else this.chooseExponent(exponents.find(i=>!pump(this.language,this.word,this.parts,this.m,i,this.cf).belongs)??2,'computer');
 }
 computerSplit() {
  if(this.strategy)return this.strategy.split(this.word,this.m,this.random);
  const w=this.word,m=this.m;let fallback=null,budget=5000;
  const survives=parts=>{fallback??=parts;return [0,2,3,4].every(i=>pump(this.language,w,parts,m,i,this.cf).belongs);};
  if(!this.cf){for(let a=0;a<Math.min(m,w.length);a++)for(let b=a+1;b<=Math.min(m,w.length);b++){const parts=[w.slice(0,a),w.slice(a,b),w.slice(b)];if(survives(parts))return parts;}}
  else for(let a=0;a<w.length;a++)for(let d=a+1;d<=Math.min(a+m,w.length);d++)for(let b=a;b<=d;b++)for(let c=b;c<=d;c++)if(b>a||d>c){const parts=[w.slice(0,a),w.slice(a,b),w.slice(b,c),w.slice(c,d),w.slice(d)];if(survives(parts))return parts;if(--budget===0)return fallback;}
  return fallback;
 }
}
