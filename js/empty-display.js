let symbol='λ';
export const emptySymbol=()=>symbol;
export function setEmptySymbol(value){symbol=value==='ε'?'ε':'λ';return symbol;}
export function displayWord(value){return value==null||value===''||value==='λ'||value==='ε'?symbol:String(value);}
// Only use on formal notation, never on document names, notes or identifiers.
// Named-token variables and quoted terminals remain literal, including λ/ε.
export function displayNotation(value){return String(value??'').replace(/(⟨[^⟩]*⟩|"(?:\\.|[^"\\])*")|[λε]/g,(match,literal)=>literal||symbol);}
export const displaySymbolSet=set=>JSON.stringify([...set].map(value=>value===''?symbol:value));
