const count=(w,c)=>[...w].filter(x=>x===c).length,rev=w=>[...w].reverse().join('');
const blocks=(w,re,fn)=>{const m=re.exec(w);return !!m&&fn(...m.slice(1).map(s=>s.length));};
const ab=w=>/^[ab]*$/.test(w),abc=w=>/^[abc]*$/.test(w);
const entry=(id,label,test,sample,cf=false)=>({id,label,test,sample,cf});
export const languages=[
 entry('AnEven','aⁿ, n even',w=>/^a*$/.test(w)&&w.length%2===0,n=>'a'.repeat(n*2)),
 entry('NaNb','w ∈ {a,b}*, #a(w) < #b(w)',w=>ab(w)&&count(w,'a')<count(w,'b'),n=>'a'.repeat(n)+'b'.repeat(n+1)),
 entry('AB2n','(ab)²ⁿ, n ≥ 1',w=>/^(ab)+$/.test(w)&&w.length%4===0,n=>'ab'.repeat(n*2)),
 entry('ABnAk','(ab)ⁿaᵏ, n > k ≥ 0',w=>{const m=/^((?:ab)*)(a*)$/.exec(w);return!!m&&m[1].length/2>m[2].length;},n=>'ab'.repeat(n+1)+'a'.repeat(n)),
 entry('AnBn','aⁿbⁿ, n ≥ 0',w=>blocks(w,/^(a*)(b*)$/,(a,b)=>a===b),n=>'a'.repeat(n)+'b'.repeat(n)),
 entry('Palindrome','wwᴿ, w ∈ {a,b}*',w=>ab(w)&&w.length%2===0&&w===rev(w),n=>'a'.repeat(n)+'bb'+'a'.repeat(n)),
 entry('BBABAnAn','bba(ba)ⁿaⁿ⁻¹',w=>{const m=/^bba((?:ba)+)(a*)$/.exec(w);return!!m&&m[1].length/2===m[2].length+1;},n=>'bba'+'ba'.repeat(n)+'a'.repeat(n-1)),
 entry('B5W','b⁵w, 2#a(w) = 3#b(w)',w=>w.startsWith('bbbbb')&&ab(w)&&2*count(w.slice(5),'a')===3*count(w.slice(5),'b'),n=>'b'.repeat(5+2*n)+'a'.repeat(3*n)),
 entry('BkABnBAn','bᵏ(ab)ⁿ(ba)ⁿ, k ≥ 4, n ≥ 1',w=>{const m=/^(b{4,})((?:ab)+)((?:ba)+)$/.exec(w);return!!m&&m[2].length===m[3].length;},n=>'bbbb'+'ab'.repeat(n)+'ba'.repeat(n)),
 entry('AnBk','aⁿbᵏ, n odd or k even',w=>blocks(w,/^(a*)(b*)$/,(a,b)=>a%2===1||b%2===0),n=>'a'.repeat(n*2+1)+'b'.repeat(n*2)),
 entry('AnBkCnk','aⁿbᵏcⁿ⁺ᵏ',w=>blocks(w,/^(a*)(b*)(c*)$/,(a,b,c)=>a+b===c),n=>'a'.repeat(n)+'b'.repeat(n)+'c'.repeat(n*2)),
 entry('AnBlAk','aⁿbˡaᵏ, n > 5, l > 3, k ≤ l',w=>blocks(w,/^(a*)(b*)(a*)$/,(a,b,c)=>a>5&&b>3&&c<=b),n=>'aaaaaa'+'b'.repeat(Math.max(4,n))+'a'.repeat(Math.max(4,n))),
 entry('B5Wmod','b⁵w, (2#a(w) + 5#b(w)) mod 3 = 0',w=>w.startsWith('bbbbb')&&ab(w)&&(2*count(w.slice(5),'a')+5*count(w.slice(5),'b'))%3===0,n=>'bbbbb'+'aba'.repeat(n)),
 entry('AnBnCF','aⁿbⁿ, n ≥ 0',w=>blocks(w,/^(a*)(b*)$/,(a,b)=>a===b),n=>'a'.repeat(n)+'b'.repeat(n),true),
 entry('AnBnCn','aⁿbⁿcⁿ',w=>blocks(w,/^(a*)(b*)(c*)$/,(a,b,c)=>a===b&&b===c),n=>'a'.repeat(n)+'b'.repeat(n)+'c'.repeat(n),true),
 entry('AkBnCnDj','aᵏbⁿcⁿdʲ, j ≠ k',w=>blocks(w,/^(a*)(b*)(c*)(d*)$/,(a,b,c,d)=>a!==d&&b===c),n=>'a'.repeat(n)+'b'.repeat(n)+'c'.repeat(n)+'d'.repeat(n+1),true),
 entry('AnBjAnBj','aⁿbʲaⁿbʲ',w=>ab(w)&&w.length%2===0&&w.slice(0,w.length/2)===w.slice(w.length/2)&&/^a*b*$/.test(w.slice(0,w.length/2)),n=>('a'.repeat(n)+'b'.repeat(n)).repeat(2),true),
 entry('AiBjCk','aⁱbʲcᵏ, i > j and i > k',w=>blocks(w,/^(a*)(b*)(c*)$/,(a,b,c)=>a>b&&a>c),n=>'a'.repeat(n+1)+'b'.repeat(n)+'c'.repeat(n),true),
 entry('NagNbeNc','w ∈ {a,b,c}*, #a > #b = #c',w=>abc(w)&&count(w,'a')>count(w,'b')&&count(w,'b')===count(w,'c'),n=>'a'.repeat(n+1)+'b'.repeat(n)+'c'.repeat(n),true),
 entry('NaNbNc','w ∈ {a,b,c}*, #a < #b < #c',w=>abc(w)&&count(w,'a')<count(w,'b')&&count(w,'b')<count(w,'c'),n=>'a'.repeat(n)+'b'.repeat(n+1)+'c'.repeat(n+2),true),
 entry('WW','ww, w ∈ {a,b}*',w=>ab(w)&&w.length%2===0&&w.slice(0,w.length/2)===w.slice(w.length/2),n=>('a'.repeat(n)+'b'.repeat(n)).repeat(2),true),
 entry('WW1WrEquals','ww₁wᴿ, |w| = |w₁|',w=>ab(w)&&w.length%3===0&&w.slice(0,w.length/3)===rev(w.slice(2*w.length/3)),n=>'a'.repeat(n)+'b'.repeat(n)+'a'.repeat(n),true),
 entry('WW1WrGrtrThanEq','ww₁wᴿ, |w₁| ≥ 5',w=>ab(w)&&w.length>=5,n=>'a'.repeat(Math.max(n,6)),true),
 entry('W1BnW2','w₁bⁿw₂, #a(w₁) < #a(w₂), #a(w₁) < n',w=>{if(!ab(w))return false;for(let i=0;i<w.length;i++)for(let j=i+1;j<=w.length&&/^b+$/.test(w.slice(i,j));j++)if(count(w.slice(0,i),'a')<count(w.slice(j),'a')&&count(w.slice(0,i),'a')<j-i)return true;return false;},n=>'a'.repeat(n)+'b'.repeat(n+1)+'a'.repeat(n+1),true),
 entry('W1CW2CW3CW4','w₁cw₂cw₃cw₄, w₁=w₂ or w₃=w₄; nonempty wᵢ',w=>{const a=w.split('c');return a.length===4&&a.every(x=>x.length>0&&ab(x))&&(a[0]===a[1]||a[2]===a[3]);},n=>('a'.repeat(n)+'b'.repeat(n)+'c').repeat(2)+'acb',true),
 entry('W1VVrW2','w₁vvᴿw₂, #a(w₁)=#a(w₂), |v| ≥ 3',w=>{if(!ab(w))return false;for(let i=0;i<w.length;i++)for(let n=3;i+2*n<=w.length;n++)if(w.slice(i,i+n)===rev(w.slice(i+n,i+2*n))&&count(w.slice(0,i),'a')===count(w.slice(i+2*n),'a'))return true;return false;},n=>'a'.repeat(n)+'abbaab'+'baabba'+'a'.repeat(n),true)
];
export function pump(language,word,parts,m,i,cf=false){if(!Number.isInteger(m)||m<1||!Number.isInteger(i)||i<0||i>100)throw Error('Use a positive integer pumping length and exponent 0–100.');if(parts.join('')!==word)throw Error('The pieces must concatenate to the witness word.');if(word.length<m)throw Error('The witness must have length at least m.');if(!language.test(word))throw Error('The witness is not in the chosen language.');if(cf){if(parts.length!==5||!parts[1].length&&!parts[3].length||parts[1].length+parts[2].length+parts[3].length>m)throw Error('Require |vxy| ≤ m and |vy| > 0.');}else if(parts.length!==3||!parts[1].length||parts[0].length+parts[1].length>m)throw Error('Require |xy| ≤ m and |y| > 0.');const result=cf?parts[0]+parts[1].repeat(i)+parts[2]+parts[3].repeat(i)+parts[4]:parts[0]+parts[1].repeat(i)+parts[2];if(result.length>10000)throw Error('Pumped word exceeds 10,000 characters.');return{word:result,belongs:language.test(result)};}
export function findSplit(language,w,m,cf){if(w.length>120||m>20)throw Error('Computer split search supports words up to 120 symbols and m up to 20.');let best=null;const test=parts=>{if([0,2,3,4].every(i=>pump(language,w,parts,m,i,cf).belongs)){best=parts;return true;}return false;};if(!cf){for(let a=0;a<Math.min(m,w.length);a++)for(let b=a+1;b<=Math.min(m,w.length);b++)if(test([w.slice(0,a),w.slice(a,b),w.slice(b)]))return best;}else for(let a=0;a<w.length;a++)for(let d=a+1;d<=Math.min(a+m,w.length);d++)for(let b=a;b<=d;b++)for(let c=b;c<=d;c++)if(b>a||d>c)if(test([w.slice(0,a),w.slice(a,b),w.slice(b,c),w.slice(c,d),w.slice(d)]))return best;return null;}
