import {V,T,tokenGrammar,fromLegacyGrammar,compileTokenGrammar,TokenDerivationSearch,TokenManualDerivation} from '../js/token-grammar.js';
import {ManualDerivation} from '../js/grammar-rewrite.js';
import {tapeMoveChoices,matchesTapeRead,validateTapeRead} from '../js/turing.js';
import {parseInputs,runBatch,batchCSV,parseGrammarBatch} from '../js/batch.js';
import * as A from '../js/automata.js';
import * as G from '../js/grammar.js';
import {simulate,Runner,next,initial} from '../js/simulation.js';
import {serialize,deserialize} from '../js/files.js';
import {example,blank} from '../js/examples.js';
import {expand,turtle,arithmetic} from '../js/lsystem.js';
import {languages,pump,findSplit} from '../js/pumping.js';
let passed=0,failed=0;const results=document.querySelector('#results');
const assert=(v,m='Assertion failed')=>{if(!v)throw Error(m);};const equal=(a,b)=>assert(JSON.stringify(a)===JSON.stringify(b),JSON.stringify(a)+' != '+JSON.stringify(b));
function test(name,fn){const li=document.createElement('li');try{fn();li.textContent='PASS · '+name;passed++;}catch(e){li.textContent='FAIL · '+name+' — '+e.message;li.className='fail';failed++;console.error(name,e);}results.append(li);}
const words=(alphabet,n)=>{let all=[''],layer=[''];for(let i=0;i<n;i++){layer=layer.flatMap(w=>[...alphabet].map(c=>w+c));all.push(...layer);}return all;};
test('NFA accepts exactly binary strings ending in 01 through length 7',()=>{const m=example('fa');for(const w of words('01',7))equal(simulate(m,w).status,w.endsWith('01')?'accepted':'rejected');});
test('Subset construction preserves language through length 7',()=>{const m=example('fa'),d=A.determinize(m);for(const w of words('01',7))equal(simulate(d,w).status,simulate(m,w).status);});
test('Minimization produces 3-state suffix recognizer',()=>{const m=A.minimize(example('fa'));equal(m.states.length,3);assert(A.equivalent(m,example('fa')).equal);});
test('Equivalence returns distinguishing word including empty word',()=>{const a=A.regexToFA('a*'),b=A.regexToFA('aa*');const r=A.equivalent(a,b);assert(!r.equal);equal(r.witness,'');});
test('Multi-character labels are split correctly',()=>{const m=A.machine();A.state(m);A.state(m).final=true;A.edge(m,0,1,'abc');equal(simulate(A.determinize(m),'abc').status,'accepted');equal(simulate(m,'ab').status,'rejected');});
test('Character-range transitions survive determinization',()=>{const m=A.machine();A.state(m);A.state(m).final=true;A.edge(m,0,1,'[0-9]');equal(simulate(m,'7').status,'accepted');assert(A.equivalent(m,A.determinize(m)).equal);});
test('Epsilon cycles terminate',()=>{const m=A.machine();A.state(m);A.state(m).final=true;A.edge(m,0,0,'');A.edge(m,0,1,'');equal(simulate(m,'').status,'accepted');equal(simulate(m,'a').status,'rejected');});
test('Regex Thompson construction handles union concatenation star',()=>{const m=A.regexToFA('(a+b)*ab');for(const w of words('ab',6))equal(simulate(m,w).status,w.endsWith('ab')?'accepted':'rejected');});
test('Empty language and empty word remain distinct',()=>{equal(simulate(A.regexToFA('∅'),'').status,'rejected');equal(simulate(A.regexToFA('λ'),'').status,'accepted');});
test('FA → regex → FA round trip',()=>{const m=example('fa');assert(A.equivalent(m,A.regexToFA(A.faToRegex(m).expression)).equal);});
test('PDA accepts aⁿbⁿ and rejects malformed strings',()=>{const m=example('pda');for(const w of words('ab',5))equal(simulate(m,w).status,/^(a*)b*$/.test(w)&&[...w].filter(c=>c==='a').length*2===w.length?'accepted':'rejected');});
test('PDA empty-stack acceptance consumes all input',()=>{const m=example('pda');equal(simulate(m,'aabb',{acceptance:'empty'}).status,'accepted');equal(simulate(m,'aabbb',{acceptance:'empty'}).status,'rejected');});
test('Mealy transducer output',()=>equal(simulate(example('mealy'),'0101').outputs,['1010']));
test('Moore output includes initial-state output',()=>equal(simulate(example('moore'),'101').outputs,['0110']));
test('Turing machine unary increment and output from head',()=>{const r=simulate(example('turing'),'111');equal(r.status,'accepted');equal(r.outputs,[['1']]);equal(Object.values(r.config.tapes[0]).join(''),'1111');});
test('Two-tape Turing machine advances both heads',()=>{const r=simulate(example('multitape'),['11','11']);equal(r.status,'accepted');equal(r.config.heads,[2,2]);equal(r.outputs,[['1','1']]);});
test('Turing tape supports negative positions',()=>{const m=A.machine('turing');A.state(m);A.state(m);A.state(m).final=true;A.edge(m,0,1,[''],{write:['x'],move:['L']});A.edge(m,1,2,[''],{write:['y'],move:['S']});const r=simulate(m,'');equal(r.config.tapes[0]['-1'],'y');});
test('Halting acceptance differs from final-state acceptance',()=>{const m=A.machine('turing');A.state(m);equal(simulate(m,'',{acceptance:'final'}).status,'rejected');equal(simulate(m,'',{acceptance:'halt'}).status,'accepted');});
test('Infinite growth returns limit, not rejected',()=>{const m=A.machine('turing');A.state(m);A.edge(m,0,0,[''],{write:[''],move:['R']});equal(simulate(m,'',{limit:25}).status,'limit');});
test('Nested Turing blocks return on halt',()=>{const m=A.machine('turing');const q=A.state(m);A.state(m).final=true;q.block=A.machine('turing');A.state(q.block);A.state(q.block);A.edge(q.block,0,1,[''],{write:['x'],move:['S']});A.edge(m,0,1,['x'],{write:['x'],move:['S']});equal(simulate(m,'').status,'accepted');});
const p=G.parseGrammar('S -> aSb | λ');
test('Grammar classification recognizes CFG and right-linear grammar',()=>{equal(G.classify(p),'Context-free');equal(G.classify(G.parseGrammar('S -> aS | b')),'Regular (right-linear)');});
test('FIRST/FOLLOW nullable recursion',()=>{const ff=G.firstFollow(p);assert(ff.first.S.has('')&&ff.first.S.has('a'));assert(ff.follow.S.has('b')&&ff.follow.S.has('$'));});
test('LL parser accepts and rejects correctly',()=>{equal(G.llParse(p,'aabb').status,'accepted');equal(G.llParse(p,'aab').status,'rejected');equal(G.llParse(p,'').status,'accepted');});
test('SLR parser accepts and rejects correctly',()=>{equal(G.lrParse(p,'aaabbb').status,'accepted');equal(G.lrParse(p,'abb').status,'rejected');equal(G.lrParse(p,'').status,'accepted');});
test('Ambiguous grammar exposes parsing conflicts',()=>{const q=G.parseGrammar('S -> SS | a');assert(G.llTable(q).conflicts.length);assert(G.lrTable(q).conflicts.length);});
test('Brute derivation supports unrestricted left sides',()=>{const q=G.parseGrammar('S -> AB\nAB -> ab');equal(G.derive(q,'ab').status,'accepted');});
test('CNF + CYK preserves balanced grammar through length 5',()=>{for(const w of words('ab',5))equal(G.cyk(p,w).status,G.llParse(p,w).status);});
test('CNF preserves terminal-only grammar',()=>{const q=G.parseGrammar('S -> a');equal(G.cyk(q,'a').status,'accepted');equal(G.cyk(q,'').status,'rejected');});
test('Unit and useless removal',()=>{const q=G.parseGrammar('S -> A\nA -> a\nB -> b\nC -> C');equal(G.grammarText(G.removeUseless(G.removeUnit(q))),'S → a');});
test('FA → grammar → FA preserves language',()=>{const m=example('fa');assert(A.equivalent(m,G.grammarToFA(G.faToGrammar(m))).equal);});
test('CFG → top-down PDA',()=>{const m=G.cfgToPDA(p);for(const w of ['','ab','aabb'])equal(simulate(m,w,{limit:3000}).status,'accepted');for(const w of ['aab','ba'])assert(simulate(m,w,{limit:500}).status!=='accepted');});
test('CFG → bottom-up PDA',()=>equal(simulate(G.cfgToPDA(p,'lr'),'aabb',{limit:3000}).status,'accepted'));
for(const type of ['fa','pda','mealy','moore','turing','multitape','grammar','re','lsystem'])test(type+' JFLAP XML round trip',()=>{const m=example(type),r=deserialize(serialize(m));equal(r.type,m.type);if(m.states){equal(r.states.length,m.states.length);equal(r.transitions.map(t=>[t.from,t.to,t.read]),m.transitions.map(t=>[t.from,t.to,t.read]));}else if(m.productions)equal(r.productions,m.productions);else equal(r.expression,m.expression);});
test('Nested building block XML round trip',()=>{const m=example('turing');m.states[0].block=example('turing');equal(deserialize(serialize(m)).states[0].block.states.length,2);});
test('Malformed XML is rejected',()=>{let caught=false;try{deserialize('<structure>');}catch{caught=true;}assert(caught);});
test('XML text is escaped',()=>{const m=example('fa');m.states[0].name='<img onerror="x">';equal(deserialize(serialize(m)).states[0].name,m.states[0].name);});
test('L-system rewriting is simultaneous',()=>equal(expand('A',[{left:'A',right:'A B'},{left:'B',right:'A'}],3),['A','B','A','A','B']));
test('L-system context rule',()=>equal(expand('a X b',[{left:'1 a X b',right:'g'}],1),['a','g','b']));
test('L-system branch restores turtle position',()=>{const s=turtle(['g','[','+','g',']','g'],{angle:90,distance:10});equal(s.length,3);equal(s[2].points,[[0,10],[0,20]]);});
test('Turtle numeric expressions use variables safely',()=>equal(arithmetic('3+(8+foo)/2',{foo:100}),57));
test('Pumping regular counterexample',()=>{const l=languages.find(l=>l.id==='AnBn');equal(pump(l,'aaabbb',['a','a','abbb'],3,0).belongs,false);});
test('Pumping context-free matching pair',()=>{const l=languages.find(l=>l.id==='AnBnCF');assert(pump(l,'aaabbb',['aa','a','','b','bb'],3,4,true).belongs);});
test('All pumping-language sample generators produce members',()=>{for(const l of languages)assert(l.test(l.sample(4)),l.id);});
test('Computer finds even-length unary decomposition',()=>{const l=languages[0],parts=findSplit(l,'aaaaaa',3,false);assert(parts);assert(pump(l,'aaaaaa',parts,3,0).belongs);});
test('Empty nested block returns without losing its parent configuration',()=>{const m=A.machine('turing'),s=A.state(m);A.state(m).final=true;s.block=A.machine('turing');A.state(s.block);A.edge(m,0,1,[''],{write:[''],move:['S']});equal(simulate(m,'').status,'accepted');});
test('Diagnostics supports multi-tape machines without treating blanks as lambda',()=>{const d=A.diagnostics(example('multitape'));equal(d.lambda,[]);equal(d.nondeterministic,[]);});

test('Freezing all configurations pauses; thaw resumes without advancing frozen input',()=>{const r=new Runner(example('fa'),'01');const c=r.frontier[0];r.control([c],'freeze');equal(r.status,'paused');r.step();equal(r.frontier[0].pos,0);r.control([c],'thaw');equal(r.run().status,'accepted');});
test('Removing one nondeterministic branch preserves the other',()=>{const m=A.machine();A.state(m);A.state(m);A.state(m).final=true;A.edge(m,0,1,'a');A.edge(m,0,2,'a');const r=new Runner(m,'a');r.step();r.control([r.frontier.find(c=>c.state===1)],'remove');equal(r.status,'accepted');r.control([...r.frontier],'remove');equal(r.status,'exhausted');});
test('Frozen branch remains while an active branch advances',()=>{const m=A.machine();A.state(m);A.state(m);A.state(m).final=true;A.edge(m,0,0,'a');A.edge(m,0,1,'a');A.edge(m,1,2,'b');A.edge(m,0,0,'b');const r=new Runner(m,'ab');r.step();const c=r.frontier.find(c=>c.state===0);r.control([c],'freeze');r.step();assert(r.frontier.includes(c));equal(c.pos,1);equal(r.status,'accepted');});
test('Halting configurations cannot be frozen',()=>{const r=new Runner(example('fa'),'01');r.run();r.control([...r.frontier],'freeze');assert(r.accepted.every(c=>!c.frozen));});

test('Resuming in the middle of branching preserves accepting siblings',()=>{const m=A.machine();A.state(m);for(let i=0;i<6;i++){A.state(m).final=i===5;A.edge(m,0,i+1,'a');}const r=new Runner(m,'a',{limit:2});equal(r.run().status,'limit');while(r.status==='limit'){r.resume(2);r.run();}equal(r.status,'accepted');equal(r.frontier.length,6);equal(r.count,7);});
test('Repeated continuation matches uninterrupted PDA run',()=>{const m=example('pda'),r=new Runner(m,'aaaabbbb',{limit:2});r.run();let n=0;while(r.status==='limit'&&n++<100){r.resume(2);r.run();}equal(r.status,simulate(m,'aaaabbbb').status);equal(r.accepted[0].trace,simulate(m,'aaaabbbb').config.trace);});
test('Limit does not allow configuration edits to corrupt pending work',()=>{const r=new Runner(example('fa'),'01',{limit:1});r.run();let error=false;try{r.control(r.frontier,'remove');}catch{error=true;}assert(error);r.resume(100);equal(r.run().status,'accepted');});

test('Keep looking finds a longer accepting computation and then exhausts',()=>{const m=A.machine();A.state(m);A.state(m).final=true;A.state(m);A.state(m).final=true;A.edge(m,0,1,'a');A.edge(m,0,2,'a');A.edge(m,2,3,'');const r=new Runner(m,'a',{tracePaths:true});equal(r.run().config.state,1);r.keepLooking();equal(r.accepted[0].state,3);equal(r.status,'accepted');r.keepLooking();equal(r.status,'exhausted');});
test('Trace enumeration preserves merged nondeterministic histories',()=>{const m=A.machine();for(let i=0;i<5;i++)A.state(m);m.states[4].final=true;A.edge(m,0,1,'');A.edge(m,0,2,'');A.edge(m,1,3,'');A.edge(m,2,3,'');A.edge(m,3,4,'a');const r=new Runner(m,'a',{tracePaths:true});r.run();equal(r.accepted.length,2);assert(r.accepted[0].trace[1].state!==r.accepted[1].trace[1].state);});
test('Trace enumeration suppresses repeated configurations on epsilon cycles',()=>{const m=A.machine();A.state(m);A.state(m).final=true;A.edge(m,0,0,'');A.edge(m,0,1,'a');const r=new Runner(m,'a',{tracePaths:true});equal(r.run().status,'accepted');r.keepLooking();equal(r.status,'exhausted');});

test('FA closure mode expands initial and post-input epsilon closures',()=>{const m=A.machine();for(let i=0;i<4;i++)A.state(m);m.states[3].final=true;A.edge(m,0,1,'');A.edge(m,1,2,'a');A.edge(m,2,3,'');const r=new Runner(m,'a',{stepMode:'closure'});equal(r.frontier.map(c=>c.state),[0,1]);equal(r.steps,0);r.step();equal(r.status,'accepted');equal(r.steps,1);equal(r.accepted[0].trace.map(c=>c.state),[0,1,2]);});
test('Closure FA language matches ordinary simulation with epsilon cycles',()=>{const m=A.regexToFA('(a+b)*ab');for(const w of words('ab',5))equal(simulate(m,w,{stepMode:'closure'}).status,simulate(m,w).status);});
test('Initial closure can resume after a limit without dropping states',()=>{const m=A.machine();for(let i=0;i<8;i++)A.state(m);m.states[7].final=true;for(let i=0;i<7;i++)A.edge(m,i,i+1,'');const r=new Runner(m,'',{stepMode:'closure',limit:2});equal(r.status,'limit');while(r.status==='limit'){r.resume(2);r.run();}equal(r.status,'accepted');equal(r.steps,0);equal(r.frontier.length,8);});

test('PDA closure mode preserves stack-distinct configurations',()=>{const m=A.machine('pda');A.state(m);A.state(m);A.state(m).final=true;A.edge(m,0,1,'',{pop:'Z',push:'A'});A.edge(m,0,1,'',{pop:'Z',push:'B'});A.edge(m,1,2,'a',{pop:'B',push:''});const r=new Runner(m,'a',{stepMode:'closure'});equal(r.frontier.filter(c=>c.state===1).map(c=>c.stack),['A','B']);equal(r.run().status,'accepted');});
test('PDA closure and state stepping agree on bounded sample language',()=>{for(const w of words('ab',5))equal(simulate(example('pda'),w,{stepMode:'closure'}).status,simulate(example('pda'),w).status);});
test('Infinite epsilon stack growth pauses and resumes without rejection',()=>{const m=A.machine('pda');A.state(m);A.edge(m,0,0,'',{pop:'',push:'A'});const r=new Runner(m,'',{stepMode:'closure',limit:10});equal(r.status,'limit');equal(r.count,10);r.resume(5);r.run();equal(r.status,'limit');equal(r.count,15);});
test('Acceptance discovered inside an unfinished epsilon closure is retained',()=>{const m=A.machine('pda');A.state(m).final=true;A.edge(m,0,0,'',{pop:'',push:'A'});equal(simulate(m,'',{stepMode:'closure',limit:10}).status,'accepted');});

test('Input files normalize BOM and Windows line endings without losing blanks',()=>{equal(parseInputs('\uFEFFa\r\n\r\nb\r\n'),['a','','b','']);});
test('Input file parser preserves tape separators and whitespace',()=>{equal(parseInputs('a|b\n |11'),['a|b',' |11']);});

test('Multi-machine matrix distinguishes languages on shared inputs',()=>{const a=A.regexToFA('a*'),b=A.regexToFA('aa*');equal(runBatch([a,b],['','a','b']).map(r=>r.results.map(c=>c.status)),[['accepted','rejected'],['accepted','accepted'],['rejected','rejected']]);});
test('Batch isolates malformed machines and refuses mixed types',()=>{const a=example('fa'),b=A.machine();equal(runBatch([a,b],['01'])[0].results.map(r=>r.status),['accepted','error']);let failed=false;try{runBatch([a,example('pda')],['']);}catch{failed=true;}assert(failed);});
test('Batch CSV quotes machine names and preserves inconclusive outcomes',()=>{const m=example('fa');m.name='A,"B"';const rows=runBatch([m],['01'],{limit:1});assert(batchCSV([m],rows).includes('"A,""B"""'));assert(batchCSV([m],rows).includes('"limit"'));});

test('Grammar batch parsing preserves each input result and derivation',()=>{const p=G.parseGrammar('S -> aSb | λ');const rows=parseGrammarBatch(p,['λ','ab','aabb','aab']);equal(rows.map(r=>r.status),['accepted','accepted','accepted','limit']);equal(rows[2].rows.at(-1).word,'aabb');equal(parseGrammarBatch(G.parseGrammar('S -> ab'),['aab'])[0].status,'rejected');});
test('Grammar batch retains limits and unrestricted productions',()=>{const p=G.parseGrammar('S -> AB\nAB -> ab');equal(parseGrammarBatch(p,['ab'])[0].status,'accepted');equal(parseGrammarBatch(p,['ab'],1)[0].status,'limit');});

test('CYK batch includes empty input and per-input charts',()=>{const p=G.parseGrammar('S -> aSb | λ');const rows=parseGrammarBatch(p,['λ','ab','aabb','aab'],15000,'cyk');equal(rows.map(r=>r.status),['accepted','accepted','accepted','rejected']);equal(rows[0].cells,[]);equal(rows[2].cells.length,4);assert(rows[2].cells[3][0].includes(rows[2].grammar[0].left));});
test('CYK batch reports unsupported unrestricted grammar explicitly',()=>{const p=G.parseGrammar('S -> AB\nAB -> ab');const rows=parseGrammarBatch(p,['ab'],15000,'cyk');equal(rows[0].status,'error');assert(rows[0].error.includes('single uppercase'));});

test('New multi-tape machines support all 1–5 tape counts and XML simulation',()=>{for(let n=1;n<=5;n++){const m=blank('multitape',n);A.state(m);A.state(m).final=true;A.edge(m,0,1,Array(n).fill('a'),{write:Array(n).fill('b'),move:Array(n).fill('S')});const copy=deserialize(serialize(m));equal(copy.tapes,n);equal(simulate(copy,Array(n).fill('a')).outputs,[Array(n).fill('b')]);}});
test('Invalid new tape counts are rejected',()=>{for(const n of [0,6,1.5,NaN]){let failed=false;try{blank('multitape',n);}catch{failed=true;}assert(failed);}});

test('Stay preference changes editor choices without changing existing transitions',()=>{const m=example('turing'),old=A.clone(m.transitions);equal(tapeMoveChoices('S',false),{value:'R',options:[['L','Left'],['R','Right']]});assert(tapeMoveChoices('S',true).options.some(o=>o[0]==='S'));equal(m.transitions,old);equal(simulate(m,'111',{allowStay:false}).status,'accepted');});

test('Turing read patterns match wildcard, negation, blanks and literals',()=>{
 for(const c of ['', 'a', '!', '*'])assert(matchesTapeRead('~',c));
 assert(!matchesTapeRead('!a','a'));assert(matchesTapeRead('!a','b'));assert(matchesTapeRead('!a',''));
 assert(!matchesTapeRead('!□',''));assert(matchesTapeRead('!□','a'));
 assert(matchesTapeRead('□',''));assert(matchesTapeRead('!','!'));assert(!matchesTapeRead('*','a'));
 let rejected=false;try{validateTapeRead('!a',2);}catch{rejected=true;}assert(rejected);
});
test('Turing wildcard and negation execute and round-trip',()=>{
 const m=A.machine('turing');A.state(m);A.state(m).final=true;
 A.edge(m,0,1,['!a'],{read:['!a'],write:['!'],move:['S']});
 equal(simulate(m,'a').status,'rejected');equal(simulate(m,'b').status,'accepted');
 equal(simulate(m,'').config.tapes[0][0],'!');
 const copy=deserialize(serialize(m));equal(copy.transitions[0].read,['!a']);equal(simulate(copy,'b').status,'accepted');
 m.tapes=2;m.transitions[0].read=['~','b'];m.transitions[0].write=['','x'];m.transitions[0].move=['S','S'];
 equal(simulate(m,['','b']).status,'accepted');equal(simulate(m,['a','c']).status,'rejected');
});

test('Turing captures a symbol and reuses it after moving',()=>{
 const m=A.machine('turing');A.state(m);A.state(m);A.state(m).final=true;
 A.edge(m,0,1,['a,b}x'],{read:['a,b}x'],write:['~'],move:['R']});
 A.edge(m,1,2,[''],{read:[''],write:['x'],move:['S']});
 for(const word of ['a','b']){const r=simulate(deserialize(serialize(m)),word);equal(r.status,'accepted');equal(r.config.tapes[0][1],word);equal(r.config.bindings,{x:word});}
 equal(simulate(m,'c').status,'rejected');
});
test('Turing capture branches and runner restart keep bindings isolated',()=>{
 const m=A.machine('turing');A.state(m);A.state(m).final=true;
 A.edge(m,0,1,['a}x'],{read:['a}x'],write:['x'],move:['S']});
 A.edge(m,0,1,['a}y'],{read:['a}y'],write:['y'],move:['S']});
 const root=initial(m,'a'),branches=next(m,root,'a');equal(branches.length,2);equal(root.bindings,{});
 equal(branches[0].bindings,{x:'a'});equal(branches[1].bindings,{y:'a'});
 branches[0].bindings.x='b';equal(branches[1].bindings,{y:'a'});equal(initial(m,'b').bindings,{});
});
test('Turing blank capture and multi-tape unchanged writes',()=>{
 const m=A.machine('turing');A.state(m);A.state(m).final=true;
 A.edge(m,0,1,['□}x'],{read:['□}x'],write:['x'],move:['S']});equal(simulate(m,'').config.tapes,[{}]);
 m.tapes=2;m.transitions[0].read=['~','~'];m.transitions[0].write=['~','~'];m.transitions[0].move=['S','R'];
 equal(simulate(m,['a','b']).config.tapes,[{0:'a'},{0:'b'}]);
 let rejected=false;try{validateTapeRead('a,b}x',2);}catch{rejected=true;}assert(rejected);
});

test('Incremental grammar search preserves derivation across pause and resume',()=>{
 const p=G.parseGrammar('S -> aSb | λ'),s=new G.DerivationSearch(p,'aabb');s.chunk(1);s.pause();const before=s.result();s.chunk(100);equal(s.result(),before);s.resume();while(s.status==='running')s.chunk(1);equal(s.status,'accepted');equal(s.rows,G.derive(p,'aabb').rows);
});
test('Grammar count limit resumes without dropping pending candidates',()=>{
 const p=G.parseGrammar('S -> aS | λ'),s=new G.DerivationSearch(p,'aaa',{limit:2});s.chunk(100);equal(s.status,'limit');for(let i=0;i<10&&s.status==='limit';i++){s.resume(2);while(s.status==='running')s.chunk(2);}equal(s.status,'accepted');equal(s.rows,G.derive(p,'aaa').rows);
});
test('Grammar length limits can expand and cancellation is terminal',()=>{
 const p=G.parseGrammar('S -> aS | λ'),s=new G.DerivationSearch(p,'aaaa',{maxLength:2});while(s.status==='running')s.chunk(10);equal(s.result().reason,'length');s.resume();while(s.status==='running')s.chunk(10);equal(s.status,'accepted');
 const c=new G.DerivationSearch(p,'b');c.chunk(2);c.cancel();const before=c.result();c.resume();c.chunk(20);equal(c.result(),before);equal(c.status,'cancelled');
});
test('Incremental grammar search reports finite rejection and owns its grammar snapshot',()=>{
 const p=G.parseGrammar('S -> a'),s=new G.DerivationSearch(p,'b');p[0].right='b';while(s.status==='running')s.chunk(1);equal(s.status,'rejected');
});

test('Manual derivation selects occurrence and supports undo and restart',()=>{
 const s=new ManualDerivation(G.parseGrammar('S -> AA\nA -> a | λ'));s.apply(0,0);equal(s.occurrences(1),[0,1]);equal(s.apply(1,1),'Aa');equal(s.apply(2,0),'a');equal(s.undo(),'Aa');equal(s.undo(),'AA');s.reset();equal(s.word,'S');s.undo();equal(s.rows.length,1);
});
test('Manual derivation supports overlapping unrestricted rewrites and empty result',()=>{
 const s=new ManualDerivation([{left:'AAA',right:'AAA'},{left:'AA',right:'b'},{left:'Ab',right:''}]);equal(s.occurrences(1),[0,1]);equal(s.apply(1,1),'Ab');equal(s.apply(2,0),'');
 let error=false;try{s.apply(1,0);}catch{error=true;}assert(error);equal(s.rows.length,3);
});

test('Named grammar variables and uppercase terminals have distinct identities',()=>{
 const m=tokenGrammar([{left:[V('q0,Z,q1')],right:[T('A'),V('A')]},{left:[V('A')],right:[T('b')]}]);
 const s=new TokenDerivationSearch(m,'Ab');while(s.status==='running')s.chunk(10);equal(s.status,'accepted');assert(s.result().rows[0].word.includes('⟨A⟩'));
 const bad=new TokenDerivationSearch(m,'ab');while(bad.status==='running')bad.chunk(10);equal(bad.status,'rejected');
});
test('Generated grammars support more than 26 variables and preserve JSON',()=>{
 const rules=Array.from({length:40},(_,i)=>({left:[V('state '+i)],right:i===39?[T('x')]:[V('state '+(i+1))]})),m=tokenGrammar(rules),copy=deserialize(JSON.stringify(m));equal(copy,m);
 const s=new TokenDerivationSearch(copy,'x');while(s.status==='running')s.chunk(5);equal(s.status,'accepted');equal(s.result().rows.length,40);
 let error=false;try{serialize(m);}catch{error=true;}assert(error);
});
test('Token grammar migration preserves legacy language and manual positions',()=>{
 const old=example('grammar'),m=fromLegacyGrammar(old);for(const word of ['', 'ab','aabb','abb']){const s=new TokenDerivationSearch(m,word);while(s.status==='running')s.chunk(100);equal(s.status,G.derive(old.productions,word).status);}
 const manual=new TokenManualDerivation(tokenGrammar([{left:[V('long start')],right:[V('item'),V('item')]},{left:[V('item')],right:[]}])) ;manual.apply(0,0);equal(manual.occurrences(1),[0,1]);manual.apply(1,1);equal(manual.word,[V('item')]);manual.undo();equal(manual.word,[V('item'),V('item')]);
});
test('Token grammar input validation rejects malformed token files',()=>{
 let error=false;try{deserialize(JSON.stringify({type:'grammar',format:'tokens-v1',productions:[{left:[],right:[]}]}));}catch{error=true;}assert(error);
});
document.querySelector('#summary').textContent=`${passed} passed · ${failed} failed`;document.title=`${failed?'FAIL':'PASS'} — JFLAP regression tests`;

