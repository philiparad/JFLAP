// Original JFLAP 7.1 pumping.cf policies. Random draws are injectable for replay.
const integer=(min,max,random)=>min+Math.floor(random()*(max-min+1));
const coin=(_w,_parts,_m,random=Math.random)=>random()<.5?0:2;
const count=(w,c)=>[...w].filter(x=>x===c).length;
const pieces=(w,m,u,v,x,y)=>{
 if(v+x+y>m||v+y<1)return null; // Original setDecomposition rejects this proposal.
 if([u,v,x,y].some(n=>n<0)||u+v+x+y>w.length)throw Error('The original opponent proposed an out-of-bounds split.');
 return [w.slice(0,u),w.slice(u,u+v),w.slice(u+v,u+v+x),w.slice(u+v+x,u+v+x+y),w.slice(u+v+x+y)];
};
const randomSplit=(w,m,random=Math.random)=>{
 const u=integer(0,w.length-1,random),v=integer(0,Math.min(w.length-u,m),random);
 if(v===w.length-u)return pieces(w,m,u,v,0,0);
 const x=integer(0,Math.min(w.length-u-v-1,m-1),random),y=integer(v>0?0:1,Math.min(w.length-u-v-x,m-x),random);
 return pieces(w,m,u,v,x,y);
};
const strategy=(range,word,split,exponent,explanation)=>({range,chooseM:(random=Math.random)=>integer(range[0],range[1],random),word,split,exponent,explanation});
const abc=m=>'a'.repeat(m+1)+'b'.repeat(m)+'c'.repeat(m);
const aExponent=(_w,p)=>p[1].includes('a')||p[3].includes('a')?0:2;
const duplicate=(w,i)=>w.slice(0,i)+w[i]+w.slice(i);
function repeatedSplit(w,m,random){
 const half=Math.floor(w.length/2);
 if(m>half)return pieces(w,m,0,1,half-1,1);
 for(let a=half-m+1;a<half;a++)for(let b=0;b<a;b++){
  const x=half-a+b-1;
  if(w[a]===w[b]&&duplicate(w.slice(0,half),a)===duplicate(w.slice(0,half),b)&&x<=m-2)return pieces(w,m,a,1,x,1);
 }
 return randomSplit(w,m,random);
}
function bRunLanguage(w){
 if(!/^[ab]*$/.test(w))return false;
 for(let i=0;i<w.length;i++)if(w[i]==='b'){
  let end=i;while(w[end]==='b')end++;
  const left=count(w.slice(0,i),'a'),right=count(w.slice(end),'a');
  if(left<right&&left<end-i)return true;i=end;
 }
 return false;
}
function fourPartsSplit(w,m,random){
 const words=w.split('c');
 if(words.length!==4)throw Error('The original strategy requires four c-separated words.');
 const possibility=(a,b,offset)=>{
  if(a.length===1&&b.length===1)return null;
  if(a.length===1)return [offset+a.length+1,1,0,0];
  if(b.length===1||a!==b)return [offset,1,0,0];
  if(m>=b.length+2)return [offset,1,a.length,1];
  for(let i=b.length-m+2;i<b.length;i++)for(let j=0;j<i;j++){
   const x=b.length-i+j;
   if(b[i]===b[j]&&duplicate(b,i)===duplicate(b,j)&&x<=m-2)return [offset+i,1,x,1];
  }
  return null;
 };
 const chosen=possibility(words[0],words[1],0)||possibility(words[2],words[3],words[0].length+words[1].length+2);
 return chosen?pieces(w,m,...chosen):randomSplit(w,m,random);
}
function palindromeSpan(w){
 for(let end=w.length-1;end>=5;end--)for(let start=0;start<=end-5;start++){
  if((end-start)%2!==1)continue;
  const part=w.slice(start,end+1);
  if(part===[...part].reverse().join('')&&count(w.slice(0,start),'a')===count(w.slice(end+1),'a'))return [start,end];
 }
 return null;
}
function embeddedPalindromeSplit(w,m){
 const span=palindromeSpan(w);if(!span)throw Error('The original strategy requires a balanced embedded palindrome.');
 const [start,end]=span,left=w.slice(0,start),right=w.slice(end+1);
 if(end-start>5||(!left.includes('b')&&!right.includes('b')))return pieces(w,m,start+Math.floor((end-start)/2),1,0,1);
 return pieces(w,m,left.includes('b')?left.indexOf('b'):end+1+right.indexOf('b'),1,0,0);
}
export const cfStrategies={
 AnBnCF:strategy([4,11],m=>'a'.repeat(m)+'b'.repeat(m),(w,m)=>pieces(w,m,w.length/2-1,1,0,1),()=>2,
  'Choose one a and the adjacent b across the central boundary. Pumping both equally preserves a^n b^n. The computer witness is a^m b^m and the challenger tests exponent 2.'),
 AnBnCn:strategy([3,11],m=>'a'.repeat(m)+'b'.repeat(m)+'c'.repeat(m),randomSplit,coin,
  'The witness a^m b^m c^m separates three equal blocks. A window of at most m symbols cannot reach all three blocks, so a nonempty pump changes some counts without changing all three. The opponent chooses exponent 0 or 2 and uses the original random split against your witness.'),
 AkBnCnDj:strategy([3,5],m=>'a'.repeat(m)+'b'.repeat(m)+'c'.repeat(m)+'d'.repeat(m+1),(w,m,r)=>{
  if(w.includes('b')&&w.includes('c'))return pieces(w,m,w.indexOf('c')-1,1,0,1);
  if(w.includes('a')&&w.includes('d'))return pieces(w,m,w.indexOf('d')-1,1,0,1);
  return randomSplit(w,m,r);
 },(_w,p)=>count(p[1]+p[3],'a')===1?2:0,
  'The witness is a^m b^m c^m d^(m+1). The challenger doubles when v and y contain exactly one a, otherwise removes them. The defender pairs adjacent b/c symbols when present, otherwise adjacent a/d symbols, then uses the original random split.'),
 AnBjAnBj:strategy([3,5],m=>('a'.repeat(m)+'b'.repeat(m)).repeat(2),(w,m)=>pieces(w,m,w.includes('a')?0:w.indexOf('b'),1,Math.min(w.length/2-1,m-2),1),()=>0,
  'The witness repeats a^m b^m twice. Removing a nonempty bounded window disrupts the repeated blocks. The defender chooses two single symbols separated by the smaller of half the word minus one and m minus two.'),
 AiBjCk:strategy([3,7],abc,(w,m,r)=>count(w,'a')>count(w,'b')+1&&count(w,'a')>count(w,'c')+1?pieces(w,m,0,1,0,0):randomSplit(w,m,r),aExponent,
  'The witness has m+1 a symbols and m each of b and c. If v or y contains a, the challenger removes them; otherwise doubles them. Against your witness the defender pumps the first symbol when both count gaps exceed one, otherwise uses the original random split.'),
 NagNbeNc:strategy([3,7],abc,(w,m,r)=>count(w,'a')>count(w,'b')+1?pieces(w,m,0,1,0,0):randomSplit(w,m,r),aExponent,
  'The witness has m+1 a symbols and m each of b and c. The challenger removes a-containing pump parts and doubles the others. If the a count exceeds the b count by more than one, the original defender selects the first symbol; otherwise it chooses a random split.'),
 NaNbNc:strategy([3,6],m=>'a'.repeat(m)+'b'.repeat(m+1)+'c'.repeat(m+2),(w,m,r)=>{
  if(count(w,'c')>count(w,'b')+1)return pieces(w,m,w.indexOf('c'),1,0,0);
  if(count(w,'b')>count(w,'a')+1)return pieces(w,m,w.indexOf('b'),1,0,0);
  return randomSplit(w,m,r);
 },(_w,p)=>count(p[1]+p[3],'c')>0?0:2,
  'The witness has successive counts m, m+1, m+2. The challenger removes pump parts containing c and doubles the others. The defender selects a c or b when the corresponding count gap exceeds one, otherwise uses the original random split.'),
 WW:strategy([3,6],m=>('a'.repeat(m)+'b'.repeat(m)).repeat(2),repeatedSplit,()=>0,
  'The witness repeats a^m b^m. The challenger removes v and y. The defender seeks matching single-symbol insertions in the two copies that fit inside m, then uses the original random split if no such pair is found.'),
 WW1WrEquals:strategy([3,10],m=>'a'.repeat(m)+'b'.repeat(m)+'a'.repeat(m),(w,m)=>pieces(w,m,0,1,0,0),coin,
  'The witness is a^m b^m a^m, with equal outer and middle lengths. The challenger tests exponent 0 or 2. The original defender chooses the first symbol as v with x and y empty; this policy need not protect every supplied word.'),
 WW1WrGrtrThanEq:strategy([1,7],m=>'a'.repeat(m)+'babab'+'a'.repeat(m),(w,m)=>pieces(w,m,Math.floor(w.length/2),1,0,0),coin,
  'The witness is a^m babab a^m. The original defender pumps one symbol at the center; the challenger chooses 0 or 2. The membership condition permits empty outer words, so every a/b word of length at least five belongs, and short-word boundary outcomes remain visible.'),
 W1BnW2:strategy([2,10],m=>'a'.repeat(m)+'b'.repeat(m+1)+'a'.repeat(m+1),(w,m,r)=>{
  for(let i=w.length-1;i>=0;i--)if(bRunLanguage(w.slice(0,i)+w.slice(i+1)))return pieces(w,m,i,1,0,0);
  return randomSplit(w,m,r);
 },(_w,p,m)=>p[0].length<m?2:0,
  'The witness is a^m b^(m+1) a^(m+1). The challenger doubles when u is shorter than m and otherwise removes the pump parts. The defender scans from the right for a single-symbol deletion that keeps membership, falling back to the original random split.'),
 W1CW2CW3CW4:strategy([2,7],m=>('a'.repeat(m)+'b'.repeat(m)+'c').repeat(2)+'acb',fourPartsSplit,()=>0,
  'The implemented language requires four nonempty words with w1 = w2 or w3 = w4. Some original descriptions say unequal, but the original membership method tests equality. The opponent removes v and y, choosing a one-symbol or synchronized pair split where available before a random fallback.'),
 W1VVrW2:strategy([2,15],m=>'ab'.repeat(Math.floor(m/2))+'abbbba'+'ab'.repeat(Math.floor(m/2)),embeddedPalindromeSplit,()=>3,
  'The witness surrounds abbbba with equal ab prefixes and suffixes. The challenger uses exponent 3. The defender finds an even palindrome of length at least six with balanced outer a counts, then pumps its central pair or an outer b according to the original policy.')
};
