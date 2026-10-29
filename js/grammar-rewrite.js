export class ManualDerivation {
 constructor(productions){
  if(!productions.length||productions.some(p=>!p.left))throw Error('Provide productions with nonempty left sides.');
  this.productions=productions.map(p=>({...p}));this.rows=[{word:productions[0].left,action:'Start'}];
 }
 get word(){return this.rows.at(-1).word;}
 occurrences(rule){const p=this.productions[rule];if(!p)return[];const positions=[];for(let i=0;i<=this.word.length-p.left.length;i++)if(this.word.slice(i,i+p.left.length)===p.left)positions.push(i);return positions;}
 apply(rule,position){
  const p=this.productions[rule];if(!p||!this.occurrences(rule).includes(position))throw Error('Choose an occurrence of the production left side.');
  const word=this.word.slice(0,position)+p.right+this.word.slice(position+p.left.length);
  if(word.length>10000)throw Error('Manual derivations are limited to 10,000 symbols per form.');
  this.rows.push({word,action:p.left+' → '+(p.right||'λ'),position,rule});return word;
 }
 undo(){if(this.rows.length>1)this.rows.pop();return this.word;}
 reset(){this.rows.length=1;}
}
