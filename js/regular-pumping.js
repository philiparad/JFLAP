// Port of pumping.reg.* and the RegularPumpingLemma defaults in JFLAP 7.1.
// Random functions are injectable so original branch choices can be replayed.
const integer=(min,max,random)=>min+Math.floor(random()*(max-min+1));
const coin=(random=Math.random)=>random()<0.5?0:2;
const pieces=(w,x,y)=>[w.slice(0,x),w.slice(x,x+y),w.slice(x+y)];
const randomSplit=(w,m,random=Math.random)=>{const x=integer(0,m-1,random);return pieces(w,x,m-x);};
const coinExponent=(_w,_parts,_m,random=Math.random)=>coin(random);
const strategy=(range,word,split,exponent,explanation)=>({
 range,chooseM:(random=Math.random)=>integer(range[0],range[1],random),
 word,split,exponent,explanation
});

export const regularStrategies={
 AnEven:strategy([2,18],m=>'a'.repeat(m+m%2),w=>pieces(w,0,2),coinExponent,
  'An even-length a word can be pumped by choosing y = aa. Adding or removing two a symbols preserves even length. The opponent chooses exponent 0 or 2.'),
 NaNb:strategy([2,17],m=>'a'.repeat(m)+'b'.repeat(m+1),(w,m)=>pieces(w,Math.min(m-1,w.indexOf('b')),1),()=>2,
  'The witness is a^m b^(m+1). Any legal y consists of a symbols; doubling y makes the number of a symbols at least the number of b symbols. Against your witness the computer chooses one symbol at the first b, or at position m−1 if that b is too late.'),
 AB2n:strategy([4,10],m=>'ab'.repeat(m+m%2),w=>pieces(w,0,4),coinExponent,
  'The computer chooses an even number of ab pairs and pumps the first abab. Adding or removing two pairs preserves the pair parity. The language requires at least one pair, so pumping away an entire four-symbol witness is a boundary exception; the displayed membership result still decides the attempt.'),
 ABnAk:strategy([2,11],m=>'ab'.repeat(m+1)+'a'.repeat(m),w=>pieces(w,0,2),()=>0,
  'The witness is (ab)^(m+1)a^m. Removing any legal nonempty y either disrupts the ab prefix or leaves too few ab pairs for the trailing a symbols. Against your witness the computer chooses the first ab and tests exponent 0.'),
 AnBn:strategy([4,18],m=>'a'.repeat(m)+'b'.repeat(m),randomSplit,coinExponent,
  'The witness is a^m b^m. Every legal y is a nonempty run of a symbols, so exponent 0 or 2 changes the a count without changing the b count. Against your witness the original opponent chooses a random x and lets xy cover the first m symbols.'),
 Palindrome:strategy([2,10],m=>'a'.repeat(m)+'bb'+'a'.repeat(m),(w,m)=>pieces(w,Math.min(Math.floor(w.length/2)-1,m-2),2),coinExponent,
  'The witness is a^m bb a^m. A legal y changes only the initial a run, breaking symmetry when removed or doubled. Against your witness the opponent places a two-symbol y near the center when the pumping-length constraint permits.'),
 BBABAnAn:strategy([5,10],m=>'bba'+'ba'.repeat(m)+'a'.repeat(m-1),w=>pieces(w,1,2),coinExponent,
  'The witness is bba(ba)^m a^(m−1). A legal pumped segment lies in the prefix; removing or doubling it disrupts the required prefix or the relation between ba pairs and trailing a symbols. The computer decomposition uses x = b and y = ba.'),
 B5W:strategy([6,10],m=>'bbbbb'+'b'.repeat(2*(m-5))+'a'.repeat(3*(m-5)),(w,m)=>{
  let end=5,count=0;
  while(count<3&&end<w.length){if(w[end]==='a')count++;end++;}
  if(count<3)throw Error('This strategy requires three a symbols after the five-b prefix.');
  return pieces(w,Math.min(end-5,m-5),5);
 },coinExponent,
  'After the five-b prefix, the witness has 2(m−5) b symbols and 3(m−5) a symbols. A legal y contains only b symbols; changing its count breaks the 2#a = 3#b condition or removes the required prefix. The computer locates the third a after the prefix and chooses a five-symbol y within the m bound.'),
 BkABnBAn:strategy([4,15],m=>'bbbb'+'ab'.repeat(Math.floor(m/2))+'ba'.repeat(Math.floor(m/2)),(w,m,random=Math.random)=>{
  const k=w.indexOf('a'),middle=k+Math.floor((w.length-k)/2)-2;
  if(k>4)return pieces(w,0,1);
  if(middle+4<=m)return pieces(w,middle,4);
  return randomSplit(w,m,random);
 },()=>0,
  'The witness has four initial b symbols followed by equal ab and ba blocks. Removing a legal y breaks the prefix or the block relation. Against your witness, the computer removes an excess initial b when possible, otherwise chooses the central four symbols if they fit within m, or uses the original random-prefix split.'),
 AnBk:strategy([3,10],m=>m%2===0?'a'.repeat(m-2)+'bb':'a'+'b'.repeat(m),(w)=>{
  const firstB=w.indexOf('b');return pieces(w,firstB===-1||firstB>=2?0:firstB,2);
 },coinExponent,
  'A valid decomposition chooses aa or bb. Pumping two identical symbols preserves the relevant parity: the a count remains odd or the b count remains even. The opponent chooses exponent 0 or 2.'),
 AnBkCnk:strategy([2,9],m=>'a'.repeat(m)+'b'.repeat(m)+'c'.repeat(2*m),randomSplit,coinExponent,
  'The witness is a^m b^m c^(2m). Any legal y consists of a symbols, so removing or doubling it changes #a + #b without changing #c. Against your witness the computer uses a random split whose xy covers the first m symbols.'),
 AnBlAk:strategy([2,15],m=>'aaaaaa'+'b'.repeat(Math.max(4,m))+'a'.repeat(Math.max(4,m)),(w,m)=>{
  const firstB=w.indexOf('b');return pieces(w,firstB>6?0:Math.min(firstB,m-1),1);
 },()=>0,
  'The witness has six initial a symbols and equal b and trailing-a blocks of length max(4,m). Removing a legal y leaves at most five initial a symbols, too few b symbols for the trailing a block, or both. Against your witness the computer first removes an excess leading a, otherwise one symbol near the first b.'),
 B5Wmod:strategy([8,20],(m,random=Math.random)=>{
  let word='bbbbb';do{word+=coin(random)===2?'a':'b';}while(word.length<m||(word.length-5)%3!==0);return word;
 },w=>pieces(w,5,3),()=>0,
  'Both symbol weights, 2 for a and 5 for b, are congruent modulo 3. After the fixed five-b prefix, the computer generates a random suffix whose length is divisible by three, then chooses its first three symbols as y. Pumping that block preserves the modular condition.')
};
