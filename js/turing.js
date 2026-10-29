export function tapeMoveChoices(move='R',allowStay=true){return{value:!allowStay&&move==='S'?'R':move,options:[['L','Left'],['R','Right'],...(allowStay?[['S','Stay']]:[])]};}

// TMSimulator.matches: wildcard on every tape; negation on single-tape machines.
export const tapeSymbol=value=>['', '□', 'λ', 'ε'].includes(value??'')?'':String(value);
export function validateTapeRead(value,tapes=1){
 const read=tapeSymbol(value);
 if(read.length<=1)return read;
 if(tapes===1&&/^([^,}!],)*[^,}!]\}[^,}!~□]$/.test(read))return read;
 if(tapes===1&&read[0]==='!'&&read.length===2)return read;
 throw Error('Read one symbol, blank, or ~ for any symbol'+(tapes===1?', or !a to exclude a symbol.':'. Negated reads require one tape.'));
}
export function matchesTapeRead(value,symbol,tapes=1){
 const read=validateTapeRead(value,tapes),actual=tapeSymbol(symbol);
 if(read.includes('}'))return read.split('}')[0].split(',').some(c=>tapeSymbol(c)===actual);
 return read==='~'||(read.length===2&&read[0]==='!'?actual!==tapeSymbol(read[1]):read===actual);
}

// Original assignment spelling is a,b}x; bindings are used in write fields.
export function captureTapeRead(read,symbol,bindings={}){
 const result={...bindings};
 if(String(read).includes('}')){const [choices,name]=read.split('}');
  if(choices.split(',').some(c=>Object.hasOwn(bindings,c)))throw Error('A bound variable cannot appear on the left of an assignment.');
  result[name]=tapeSymbol(symbol);
 }
 return result;
}
export function resolveTapeWrite(write,symbol,bindings={},tapes=1){
 if(write==='~')return tapeSymbol(symbol);
 return tapes===1&&Object.hasOwn(bindings,write)?bindings[write]:tapeSymbol(write);
}
