import {PumpingGame} from './pumping-game.js';
import {languages} from './pumping.js';

// Exact getTitle() strings: the original XML factory identifies exercises by title.
export const pumpingTitles={
 "AnEven": "a^n : n is even",
 "NaNb": "w element_of {ab}* : na(w) < nb(w)",
 "AB2n": "(ab)^2n : n = 1,2,...",
 "ABnAk": "(ab)^n a^k : n > k, k >= 0",
 "AnBn": "a^n b^n : n >= 0",
 "Palindrome": "w w^R : w element_of {ab}*",
 "BBABAnAn": "bba(ba)^n a^(n-1)",
 "B5W": "b^5w: w element_of {ab}* : 2na(w) = 3nb(w)",
 "BkABnBAn": "b^k (ab)^n (ba)^n: k>=4, n = 1,2,...",
 "AnBk": "a^n b^k : n is odd or k is even",
 "AnBkCnk": "a^n b^k c^(n+k) : n >= 0, k >= 0",
 "AnBlAk": "a^n b^l a^k : n > 5, l > 3, k <= l",
 "B5Wmod": "b^5w: w element_of {ab}* : (2na(w) + 5nb(w)) % 3 = 0",
 "AnBnCF": "a^n b^n : n >= 0",
 "AnBnCn": "a^n b^n c^n",
 "AkBnCnDj": "a^k b^n c^n d^j : j != k",
 "AnBjAnBj": "a^n b^j a^n b^j : n >= 0, j >= 0",
 "AiBjCk": "a^i b^j c^k : i > j, i > k",
 "NagNbeNc": "w element_of {abc}* : na(w) > nb(w) = nc(w)",
 "NaNbNc": "w element_of {a, b, c}* : na(w) < nb(w) < nc(w)",
 "WW": "ww : w element_of {ab}*",
 "WW1WrEquals": "w w1 w^R : |w| = |w1|, w & w1 element_of {ab}*",
 "WW1WrGrtrThanEq": "w w1 w^R : |w1| >= 5, w & w1 element_of {ab}*",
 "W1BnW2": "w1 + b^n + w2 : na(w1) < na(w2) & na(w1) < n, w1 & w2 element_of {ab}*",
 "W1CW2CW3CW4": "w1cw2cw3cw4 : w1 = w2 or w3 = w4, wi element_of {ab}*, |wi| >= 5",
 "W1VVrW2": "w1 v v^R w2 : na(w1) = na(w2), |v|>=3, w1 & w2 element_of {ab}*"
};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const tag=(n,s)=>`<${n}>${esc(s)}</${n}>`;
const children=(e,n)=>[...e.children].filter(c=>c.tagName===n);
function one(e,n,required=true){const items=children(e,n);if(items.length>1||required&&!items.length)throw Error('Missing or duplicate pumping field: '+n);return items[0];}
function value(e,n,required=true){return one(e,n,required)?.textContent??'';}
function integer(e,n,min=-1,max=10000){const text=value(e,n);if(!/^-?\d+$/.test(text))throw Error('Invalid pumping integer: '+n);const result=Number(text);if(!Number.isSafeInteger(result)||result<min||result>max)throw Error('Invalid pumping integer: '+n);return result;}
const lengthNames=cf=>cf?['uLength','vLength','xLength','yLength']:['xLength','yLength'];
const caseNames=['caseULength','caseVLength','caseXLength','caseYLength'];
function caseData(model){
 const cases=model.pumpingCases??[];
 if(!Array.isArray(cases)||cases.length>10000||cases.some(c=>!c||!Array.isArray(c.lengths)||c.lengths.length!==4||c.lengths.some(n=>!Number.isSafeInteger(n)||n<0||n>10000)||!Number.isSafeInteger(c.i)||c.i< -1||c.i>100))throw Error('Invalid saved pumping cases.');
 if(model.type!=='pumpingcf'&&cases.length)throw Error('Regular pumping games cannot contain context-free cases.');
 return cases;
}
export function validatePumpingModel(model){
 if(!model||!['pumpingreg','pumpingcf'].includes(model.type))throw Error('Invalid pumping structure type.');
 if(model.type==='pumpingcf'&&model.language==='AnBn')model.language='AnBnCF';
 const language=languages.find(l=>l.id===model.language);
 if(!language||language.cf!==(model.type==='pumpingcf'))throw Error('Pumping language does not match its structure type.');
 if(model.game!==undefined&&model.game!==null){const game=PumpingGame.fromSnapshot(model.game);if(game.language.id!==model.language)throw Error('Saved pumping game language does not match the document.');model.game=game.snapshot();}
 caseData(model);return model;
}
function projection(model,game){
 const cf=model.type==='pumpingcf',hasParts=game&&['exponent','complete'].includes(game.phase),parts=hasParts?game.parts:null;
 const attempts=[...(game?.legacyAttempts||[]),...(game?.attempts||[]).slice(game?.legacyAttemptOffset||0).map(a=>`${a.winner==='human'?'Won':'Failed'}: i = ${a.i}; ${a.parts.map(p=>p||'λ').join(' | ')}`)];
 return {role:game?.mode==='computer-first'?'Computer':'Human',m:game?.m??-1,word:game?.word??'',i:game?.phase==='complete'?game.i:-1,lengths:parts?parts.slice(0,-1).map(p=>p.length):lengthNames(cf).map(()=>0),attempts};
}
export function serializePumping(model){
 validatePumpingModel(model);const game=model.game?PumpingGame.fromSnapshot(model.game):null,cf=model.type==='pumpingcf',p=projection(model,game);
 const body=tag('type',cf?'context-free pumping lemma':'regular pumping lemma')+tag('name',pumpingTitles[model.language])+tag('first_player',p.role)+tag('m',p.m)+tag('w',p.word)+tag('i',p.i)+lengthNames(cf).map((n,i)=>tag(n,p.lengths[i])).join('')+p.attempts.map(a=>tag('attempt',a)).join('')+caseData(model).map(c=>'<case>'+caseNames.map((n,i)=>tag(n,c.lengths[i])).join('')+tag('caseI',c.i)+'</case>').join('');
 // JSON text carries exact pending turns/retries/history; the original reader ignores it.
 return '<?xml version="1.0" encoding="UTF-8"?>\n<structure>'+body+tag('web-name',model.name||'Pumping game')+tag('web-game',JSON.stringify(game?game.snapshot():null))+'</structure>';
}
export function deserializePumping(root,name='Imported'){
 const type=value(root,'type'),cf=type==='context-free pumping lemma';if(!cf&&type!=='regular pumping lemma')throw Error('Unknown pumping XML type.');
 const title=value(root,'name'),language=languages.find(l=>l.cf===cf&&pumpingTitles[l.id]===title);if(!language)throw Error('Unknown pumping exercise title.');
 const role=value(root,'first_player');if(!['Human','Computer'].includes(role))throw Error('Unknown pumping first player.');
 const native={role,m:integer(root,'m'),word:value(root,'w'),i:integer(root,'i',-1,100),lengths:lengthNames(cf).map(n=>integer(root,n,0)),attempts:children(root,'attempt').map(e=>e.textContent)};
 if(native.attempts.length>10000||native.attempts.some(s=>s.length>10000))throw Error('Too many or oversized pumping attempts.');
 const model={type:cf?'pumpingcf':'pumpingreg',name:value(root,'web-name',false)||name,language:language.id};
 const cases=children(root,'case').map(e=>({lengths:caseNames.map(n=>integer(e,n,0)),i:integer(e,'caseI',-1,100)}));if(cases.length)model.pumpingCases=cases;
 const extension=one(root,'web-game',false);
 if(extension){
  let saved;try{saved=JSON.parse(extension.textContent);}catch{throw Error('Invalid saved pumping game extension.');}
  if(saved!==null)model.game=saved;validatePumpingModel(model);
  const game=model.game?PumpingGame.fromSnapshot(model.game):null;
  if(JSON.stringify(projection(model,game))!==JSON.stringify(native))throw Error('Saved pumping game conflicts with the original XML fields.');
  return model;
 }
 const game=new PumpingGame(language.id,role==='Human'?'human-first':'computer-first');
 if(native.m===-1){if(native.word||native.i!==-1||native.lengths.some(Boolean))throw Error('Pumping moves require a pumping length.');}
 else{
  game.chooseLength(native.m,game.actor);
  if(native.word){
   game.chooseWord(native.word,game.actor);
   if(native.lengths.some(Boolean)){
    let offset=0;const parts=native.lengths.map(n=>{const part=native.word.slice(offset,offset+n);if(part.length!==n)throw Error('Pumping split extends beyond the word.');offset+=n;return part;});parts.push(native.word.slice(offset));
    game.chooseSplit(parts,game.actor);
    if(native.i!==-1)game.chooseExponent(native.i,game.actor);
   }else if(native.i!==-1)throw Error('Pumping exponent requires a valid split.');
  }else if(native.i!==-1||native.lengths.some(Boolean))throw Error('Pumping split requires a witness word.');
 }
 game.legacyAttempts=[...native.attempts];game.legacyAttemptOffset=game.attempts.length;
 model.game=game.snapshot();return validatePumpingModel(model);
}
