import {CFGPDAExercise} from '../js/cfg-pda-exercise.js';
import {GrammarFAExercise} from '../js/grammar-fa-exercise.js';
import {FAGrammarExercise} from '../js/fa-grammar-exercise.js';
import {RegexConstruction,parseRegexTree} from '../js/regex-construction.js';
import {RegexElimination} from '../js/regex-elimination.js';
import {MinimizationExercise} from '../js/minimization-exercise.js';
import {SubsetExercise} from '../js/subset-exercise.js';
import {LRItemsExercise} from '../js/lr-items.js';
import {FirstFollowExercise,LLTableExercise,LRTableExercise,parseSymbolSet} from '../js/grammar-exercises.js';
import {derivationGraph,layoutDerivationGraph} from '../js/derivation-graph.js';
import {derivationTree,lrParseTree,cykParseTree,layoutParseTree} from '../js/parse-tree.js';
import {turingToGrammar,deriveTuringGrammar} from '../js/turing-grammar.js';
import {pdaToGrammar,normalizePDA} from '../js/pda-grammar.js';
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
 const old=example('grammar'),m=fromLegacyGrammar(old);for(const word of ['', 'ab','aabb','abb']){const s=new TokenDerivationSearch(m,word);while(s.status==='running')s.chunk(100);equal(s.status,word==='abb'?'rejected':'accepted');}
 const manual=new TokenManualDerivation(tokenGrammar([{left:[V('long start')],right:[V('item'),V('item')]},{left:[V('item')],right:[]}])) ;manual.apply(0,0);equal(manual.occurrences(1),[0,1]);manual.apply(1,1);equal(manual.word,[V('item')]);manual.undo();equal(manual.word,[V('item'),V('item')]);
});
test('Token grammar input validation rejects malformed token files',()=>{
 let error=false;try{deserialize(JSON.stringify({type:'grammar',format:'tokens-v1',productions:[{left:[],right:[]}]}));}catch{error=true;}assert(error);
});

const tokenAccepts=(m,word)=>{const s=new TokenDerivationSearch(m,word,{limit:50000});while(s.status==='running')s.chunk(1000);return s.status;};
test('PDA to CFG preserves balanced language in both acceptance modes',()=>{
 const pda=example('pda');for(const acceptance of ['final','empty']){const g=pdaToGrammar(pda,{acceptance});for(const word of words('ab',4))equal(tokenAccepts(g,word),simulate(pda,word,{acceptance}).status);}
});
test('PDA normalization supports no-pop, multi-pop, long pushes and multi-symbol input',()=>{
 const m=A.machine('pda');A.state(m);A.state(m);A.state(m).final=true;
 A.edge(m,0,1,'ab',{pop:'',push:'ABC'});A.edge(m,1,2,'c',{pop:'ABCZ',push:''});
 const n=normalizePDA(m);assert(n.machine.transitions.every(t=>t.pop.length===1&&t.push.length<=2));
 const g=pdaToGrammar(m);for(const w of ['','abc','ab','abbc','ac'])equal(tokenAccepts(g,w),simulate(m,w).status);
});
test('PDA conversion handles empty stack recovery and empty language',()=>{
 const m=A.machine('pda');A.state(m);A.state(m);A.state(m).final=true;
 A.edge(m,0,1,'',{pop:'Z',push:''});A.edge(m,1,2,'A',{pop:'',push:''});
 for(const acceptance of ['empty','final']){const g=pdaToGrammar(m,{acceptance});for(const w of ['','A','AA'])equal(tokenAccepts(g,w),simulate(m,w,{acceptance}).status);}
 m.states.forEach(s=>s.final=false);equal(tokenAccepts(pdaToGrammar(m),'A'),'rejected');
});
test('PDA conversion has explicit construction bounds',()=>{
 let error=false;try{pdaToGrammar(example('pda'),{maxProductions:2});}catch(e){error=e.message.includes('productions');}assert(error);
});

test('Turing grammar preserves input while the machine overwrites its tape',()=>{
 const m=example('turing'),g=turingToGrammar(m,{alphabet:['1']});
 for(const word of ['','1','11','111']){const r=deriveTuringGrammar(g,word);equal(r.status,simulate(m,word).status);equal(r.status,'accepted');
  let form=[V('Start')];for(const row of r.rows){const p=g.productions[row.rule];equal(form.slice(row.position,row.position+p.left.length),p.left);form=[...form.slice(0,row.position),...p.right,...form.slice(row.position+p.left.length)];}equal(form,[...word].map(T));
 }
});
test('Turing grammar supports left boundary expansion, Stay and nondeterminism',()=>{
 const m=A.machine('turing');for(let i=0;i<4;i++)A.state(m);m.states[3].final=true;
 A.edge(m,0,1,['a'],{read:['a'],write:['b'],move:['L']});A.edge(m,1,2,[''],{read:[''],write:['x'],move:['R']});A.edge(m,2,3,['b'],{read:['b'],write:[''],move:['S']});
 A.edge(m,0,2,['a'],{read:['a'],write:['a'],move:['S']});
 const g=turingToGrammar(m,{alphabet:['a','b']});for(const word of words('ab',2))equal(deriveTuringGrammar(g,word).status,simulate(m,word).status);
});
test('Turing grammar supports wildcard, negation and unchanged writes',()=>{
 const m=A.machine('turing');A.state(m);A.state(m).final=true;A.edge(m,0,1,['!a'],{read:['!a'],write:['~'],move:['S']});
 const g=turingToGrammar(m,{alphabet:['a','b']});for(const word of ['','a','b','ba'])equal(deriveTuringGrammar(g,word).status,simulate(m,word).status);
 equal(deriveTuringGrammar(g,'c').reason,'outside-alphabet');equal(deriveTuringGrammar(deserialize(JSON.stringify(g)),'b').status,'accepted');
});
test('Turing grammar rejects unsupported structures and reports bounded search',()=>{
 const m=A.machine('turing');A.state(m);A.edge(m,0,0,['~'],{read:['~'],write:['~'],move:['R']});const g=turingToGrammar(m,{alphabet:['a']});equal(deriveTuringGrammar(g,'a',{limit:10}).status,'limit');
 m.tapes=2;let error=false;try{turingToGrammar(m,{alphabet:['a']});}catch{error=true;}assert(error);
 m.tapes=1;m.transitions[0].read=['a}x'];error=false;try{turingToGrammar(m,{alphabet:['a']});}catch{error=true;}assert(error);
});

const treeYield=n=>n.children.length?n.children.map(treeYield).join(''):n.kind==='epsilon'?'':n.label;
test('CFG derivation tree preserves repeated occurrences and epsilon leaves',()=>{
 const p=G.parseGrammar('S -> AA\nA -> a | λ');const r=G.derive(p,'a'),tree=derivationTree(p,r.rows);equal(tree.label,'S');equal(treeYield(tree),'a');assert(JSON.stringify(tree).includes('epsilon'));
 const normal=layoutParseTree(tree),inverted=layoutParseTree(tree,true);for(const n of normal.nodes){const inv=inverted.nodes.find(x=>x.id===n.id);equal(n.x,inv.x);equal(n.y+inv.y,normal.height);}
});
test('LL and SLR parser traces build trees with the accepted terminal yield',()=>{
 const p=G.parseGrammar('S -> aSb | λ');for(const word of ['', 'ab','aabb']){equal(treeYield(derivationTree(p,G.llParse(p,word).rows)),word);equal(treeYield(lrParseTree(p,G.lrParse(p,word).rows)),word);}
});
test('CYK charts reconstruct a CNF tree including empty input',()=>{
 const p=G.parseGrammar('S -> aSb | λ');for(const word of ['', 'ab','aabb'])equal(treeYield(cykParseTree(G.cyk(p,word),word)),word);equal(cykParseTree(G.cyk(p,'aab'),'aab'),null);
});
test('Multi-parent unrestricted rewrites are not misrepresented as CFG trees',()=>{
 equal(derivationTree([{left:'S',right:'AB'},{left:'AB',right:'a'}],[{word:'AB',action:'S → AB',position:0},{word:'a',action:'AB → a',position:0}]),null);
});

test('Unrestricted graph groups two-parent replacements and preserves context',()=>{
 const p=G.parseGrammar('S -> xABy\nAB -> c');const graph=derivationGraph(p,G.derive(p,'xcy').rows);
 equal(graph.rewrites[1].parents.length,2);equal(graph.rewrites[1].children.length,1);equal(graph.final.map(s=>s.name).join(''),'xcy');equal(graph.edges.filter(e=>e.step===1).length,2);
 const layout=layoutDerivationGraph(graph);assert(layout.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));
});
test('Unrestricted graph handles deletion without treating epsilon as a future symbol',()=>{
 const p=G.parseGrammar('S -> ABA\nB -> λ\nAA -> a');const rows=[{action:'S → ABA',position:0},{action:'B → λ',position:1},{action:'AA → a',position:0}];
 const graph=derivationGraph(p,rows);equal(graph.layers[2].map(n=>n.symbol.name),['A','λ','A']);equal(graph.rewrites[2].parents.length,2);equal(graph.final,[T('a')]);
});
test('Unrestricted graph supports named tokens and rejects mismatched occurrences',()=>{
 const m=tokenGrammar([{left:[V('Start')],right:[V('long A'),V('long B')]},{left:[V('long A'),V('long B')],right:[T('x')]}]);
 const graph=derivationGraph(m.productions,[{rule:0,position:0,action:'expand'},{rule:1,position:0,action:'replace pair'}]);equal(graph.final,[T('x')]);
 let failed=false;try{derivationGraph(m.productions,[{rule:1,position:0}]);}catch{failed=true;}assert(failed);
});

test('LL trace cells and tree nodes correspond to actual parser steps',()=>{
 const p=G.parseGrammar('S -> aSb | λ'),r=G.llParse(p,'ab'),tree=derivationTree(p,r.rows),nodes=layoutParseTree(tree).nodes;
 r.rows.forEach((row,i)=>{if(row.action.startsWith('Match ')){assert(!row.tableCell);assert(nodes.some(n=>n.kind==='terminal'&&n.steps.includes(i)));}else{equal(row.tableCell,{row:row.stack.at(-1),column:row.input[0]});assert(r.table.table[row.tableCell.row+','+row.tableCell.column]);assert(nodes.some(n=>n.steps.includes(i)));}});
});
test('SLR trace cells and tree nodes include shifts, reductions and acceptance',()=>{
 const p=G.parseGrammar('S -> aSb | λ'),r=G.lrParse(p,'ab'),nodes=layoutParseTree(lrParseTree(p,r.rows)).nodes;
 r.rows.forEach((row,i)=>{equal(row.tableCell,{row:row.stack.split(' ').at(-1),column:row.input[0]});assert(r.table.table[row.tableCell.row+','+row.tableCell.column].includes(row.action));assert(nodes.some(n=>n.steps.includes(i)));});
});

test('FIRST/FOLLOW exercise validates nullable chains and selected assistance',()=>{
 const ex=new FirstFollowExercise(G.parseGrammar('S -> AB\nA -> a | λ\nB -> b | λ'));
 ex.answers['first:S']='b, λ, a, a';assert(ex.check('first:S').correct);ex.answers['follow:A']='b';equal(ex.check('follow:A').missing,['$']);ex.fill('follow:A');assert(ex.check('follow:A').correct);equal(ex.answers['first:A'],'');
 for(const c of ex.cells)ex.fill(c.key);assert(ex.checkAll().every(r=>r.correct));ex.reset();assert(ex.checkAll().some(r=>!r.correct));
});
test('Set exercises distinguish empty set, epsilon, punctuation and malformed input',()=>{
 equal([...parseSymbolSet('∅')],[]);equal([...parseSymbolSet('λ')],['']);equal([...parseSymbolSet('[",", "$", "ε"]')],[',','$','']);
 const ex=new FirstFollowExercise(G.parseGrammar('S -> a'));ex.answers['first:S']='["ab"]';assert(ex.check('first:S').error);ex.answers['first:S']='a, b';equal(ex.check('first:S').extra,['b']);
});

test('LL exercise validates nullable entries and advances one incorrect cell at a time',()=>{
 const ex=new LLTableExercise(G.parseGrammar('S -> aSb | λ'));equal(ex.expected('S,a'),[1]);equal(ex.expected('S,$'),[2]);equal(ex.expected('S,b'),[2]);const key=ex.step();equal(key,'S,a');assert(ex.check(key).correct);assert(!ex.check('S,$').correct);ex.fillAll();assert(ex.checkAll().every(r=>r.correct));equal(ex.step(),null);ex.reset();assert(!ex.check('S,a').correct);
});
test('LL exercise preserves conflicts and validates all alternatives',()=>{
 const ex=new LLTableExercise(G.parseGrammar('S -> aA | aB\nA -> b\nB -> c'));equal(ex.expected('S,a'),[1,2]);ex.answers['S,a']='2, 1, 1';assert(ex.check('S,a').correct);ex.answers['S,a']='1';equal(ex.check('S,a').missing,[2]);ex.answers['S,a']='99';assert(ex.check('S,a').error);ex.answers['S,a']='1x';assert(ex.check('S,a').error);ex.fillAll();assert(ex.data.conflicts.includes('S,a'));assert(ex.checkAll().every(r=>r.correct));
});

test('LR table exercise checks action/goto entries and parses only a completed table',()=>{
 const ex=new LRTableExercise(G.parseGrammar('S -> aSb | λ'));let blocked=false;try{ex.parse('ab');}catch{blocked=true;}assert(blocked);ex.fillAll();assert(ex.checkAll().every(r=>r.correct));equal(ex.parse('aabb').status,'accepted');equal(ex.parse('aab').status,'rejected');ex.answers[ex.cells[0].key]='bad';assert(ex.check(ex.cells[0].key).error);
});
test('LR conflict choices are explicit and select the recorded parser action',()=>{
 const ex=new LRTableExercise(G.parseGrammar('S -> SS | a'));assert(ex.data.conflicts.length);ex.fillAll();let blocked=false;try{ex.parse('aaa');}catch{blocked=true;}assert(blocked);
 const conflict=ex.data.conflicts[0];ex.resolve(conflict,ex.expected(conflict).find(v=>v.startsWith('s')));const shift=ex.parse('aaa');equal(shift.status,'accepted');assert(shift.rows.filter(r=>r.tableCell.row+','+r.tableCell.column===conflict).every(r=>r.action===ex.choices[conflict]));
 ex.resolve(conflict,ex.expected(conflict).find(v=>v.startsWith('r')));const reduce=ex.parse('aaa');equal(reduce.status,'accepted');assert(JSON.stringify(shift.rows)!==JSON.stringify(reduce.rows));ex.reset();equal(ex.choices,{});
});

test('LR item construction closes nullable recursive items and computes goto',()=>{
 const ex=new LRItemsExercise(G.parseGrammar('S -> A\nA -> aA | λ'));ex.answers[0]='0:0';ex.closeState(0);assert(ex.checkState(0).correct);assert(ex.parse(ex.answers[0]).some(([r,d])=>r===3&&d===0));const target=ex.doGoto(0,'a');assert(target!==null);assert(ex.checkState(target).correct);equal(ex.goto(ex.data.sets[0],'z'),[]);ex.fillAll();assert(ex.check().correct);
});
test('LR construction detects malformed items, missing and extra edges and resets',()=>{
 const ex=new LRItemsExercise(G.parseGrammar('S -> a'));ex.answers[0]='1:2';assert(ex.checkState(0).error);ex.answers[0]='bad';assert(ex.checkState(0).error);ex.fillAll();ex.connect(0,'a','0');assert(!ex.check().correct);ex.connect(1,'a','0');assert(ex.check().extra.length);let count=0;while(!ex.check().correct&&count++<30)ex.step();assert(ex.check().correct);ex.reset();assert(!ex.check().correct);equal(ex.edges,{});let blocked=false;try{ex.doGoto(0,'a');}catch{blocked=true;}assert(blocked);
});


test('Guided subset construction checks closures and exports an equivalent DFA',()=>{
 const m=A.machine();for(let i=0;i<3;i++)A.state(m);m.states[2].final=true;A.edge(m,0,1,'');A.edge(m,1,2,'a');A.edge(m,2,1,'');A.edge(m,0,0,'b');const ex=new SubsetExercise(m);equal(ex.subsets[0],[0,1]);let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);equal(ex.submit(0,'a','2').missing,[1]);equal(ex.subsets.length,1);assert(ex.submit(0,'a','2, 1, 2').correct);assert(ex.output.states[1].final);ex.finish();assert(A.equivalent(m,ex.export()).equal);equal(ex.jobs(),[]);ex.reset();equal(ex.subsets.length,1);assert(ex.jobs().length);
});
test('Guided subsets handle empty targets, normalization and empty alphabets',()=>{
 const m=A.machine();A.state(m);A.state(m).final=true;A.edge(m,0,1,'ab');const ex=new SubsetExercise(m);assert(ex.source.states.length===3);ex.finish();assert(A.equivalent(m,ex.export()).equal);assert(ex.done.size>ex.output.transitions.length);const empty=A.machine();A.state(empty).final=true;const done=new SubsetExercise(empty);equal(done.jobs(),[]);assert(done.export().states[0].final);let invalid=false;try{ex.parse('999');}catch{invalid=true;}assert(invalid);
});


test('Guided minimization checks splits, preserves equivalent states and builds result',()=>{
 const m=A.machine();for(let i=0;i<4;i++)A.state(m);m.states[3].final=true;for(const [from,a,b] of [[0,1,2],[1,1,3],[2,1,3],[3,3,3]]){A.edge(m,from,a,'a');A.edge(m,from,b,'b');}const ex=new MinimizationExercise(m);let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);assert(!ex.split(0,'b','0|1|2'));assert(!ex.split(0,'b','0|1,1,2'));assert(ex.split(0,'b','2,1|0'));equal(ex.groups().length,3);equal(ex.jobs(),[]);assert(ex.undo());equal(ex.groups().length,2);ex.finish();ex.beginResult();assert(!ex.connect(0,'a','999'));blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);ex.completeResult();const out=ex.export();equal(out.states.length,3);assert(A.equivalent(m,out).equal);assert(ex.nodes[1].children.length===2);ex.reset();assert(ex.result===null);equal(ex.history,[]);
});
test('Guided minimization handles empty alphabet, all-final and trap states',()=>{
 const m=A.machine();A.state(m).final=true;const empty=new MinimizationExercise(m);empty.completeResult();equal(empty.export().states.length,1);assert(empty.export().states[0].final);A.edge(m,0,0,'a');const universal=new MinimizationExercise(m);universal.completeResult();equal(universal.export().states.length,1);A.state(m).final=true;A.edge(m,0,1,'b');const trap=new MinimizationExercise(m);trap.finish();trap.completeResult();assert(A.equivalent(m,trap.export()).equal);assert(trap.source.states.some(s=>s.label==='∅'));
});


test('Interactive regex elimination preserves language for different orders and undo',()=>{
 const m=example('fa'),forward=new RegexElimination(m),reverse=new RegexElimination(m);const original=JSON.stringify(reverse.graph());const id=reverse.candidates().at(-1);reverse.eliminate(id);assert(!reverse.active.includes(id));assert(reverse.undo());equal(JSON.stringify(reverse.graph()),original);forward.finish();for(const id of [...reverse.candidates()].reverse())reverse.eliminate(id);assert(A.equivalent(m,A.regexToFA(forward.expression())).equal);assert(A.equivalent(m,A.regexToFA(reverse.expression())).equal);assert(JSON.stringify(forward.order)!==JSON.stringify(reverse.order));equal(reverse.export().expression,reverse.expression());reverse.reset();equal(reverse.order,[]);
});
test('Regex elimination supports epsilon, empty language and atomic expression bounds',()=>{
 const m=A.machine();A.state(m).final=true;A.edge(m,0,0,'a');const ex=new RegexElimination(m);let protectedState=false;try{ex.eliminate(ex.start);}catch{protectedState=true;}assert(protectedState);ex.finish();assert(A.equivalent(m,A.regexToFA(ex.expression())).equal);m.states[0].final=false;const empty=new RegexElimination(m);empty.finish();equal(empty.expression(),'∅');const bounded=new RegexElimination(example('fa'),{maxExpression:1});const before=JSON.stringify(bounded.graph());let limited=false;try{bounded.eliminate(bounded.candidates()[0]);}catch{limited=true;}assert(limited);equal(JSON.stringify(bounded.graph()),before);equal(bounded.order,[]);
});


test('Interactive regex decomposition preserves language in either expansion order',()=>{
 for(const expression of ['(a+b)*abb','a(b+c)','(ab)*','λ','∅','(∅+a)*','a+','']){const ex=new RegexConstruction(expression);while(ex.pending().length)ex.expand(ex.pending().at(-1).id);const out=ex.export();assert(out.transitions.every(t=>!t.expressionNode));assert(A.equivalent(A.regexToFA(expression),out).equal,expression);const sequential=new RegexConstruction(expression);sequential.finish();assert(A.equivalent(out,sequential.export()).equal);}
});
test('Regex construction blocks premature export, restores undo and validates syntax',()=>{
 const ex=new RegexConstruction('a+b');let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);const before=JSON.stringify(ex.model);ex.step();equal(ex.pending().length,2);assert(ex.undo());equal(JSON.stringify(ex.model),before);ex.finish();assert(!ex.pending().length);ex.reset();equal(ex.steps,[]);equal(ex.pending().length,1);for(const text of ['(a','a)','*a']){let invalid=false;try{parseRegexTree(text);}catch{invalid=true;}assert(invalid,text);}
});


test('Guided FA grammar checks every production and preserves epsilon and uppercase terminals',()=>{
 const m=A.machine();A.state(m);A.state(m).final=true;A.edge(m,0,0,'');A.edge(m,0,1,'A');const ex=new FAGrammarExercise(m);let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);ex.answers.edge0={left:'Q0',terminal:'a',target:'Q0'};equal(ex.check('edge0').wrong,['terminal']);ex.finish();const grammar=ex.export();equal(tokenAccepts(grammar,'A'),'accepted');equal(tokenAccepts(grammar,''),'rejected');equal(tokenAccepts(grammar,'AA'),'rejected');ex.answers.edge0.target='Q9';blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);ex.reset();equal(ex.checked.size,0);
});
test('Guided FA grammar preserves empty languages, many variables and normalized words',()=>{
 const m=A.machine();for(let i=0;i<30;i++)A.state(m);m.states[29].final=true;const empty=new FAGrammarExercise(m);empty.finish();equal(tokenAccepts(empty.export(),''),'rejected');A.edge(m,0,29,'ab');const ex=new FAGrammarExercise(m);ex.finish();equal(tokenAccepts(ex.export(),'ab'),'accepted');equal(tokenAccepts(ex.export(),'a'),'rejected');const noRules=A.machine();A.state(noRules);equal(tokenAccepts(new FAGrammarExercise(noRules).export(),''),'rejected');
});


test('Guided grammar to FA checks paths and preserves right-linear languages',()=>{
 const g={type:'grammar',name:'Right linear',productions:G.parseGrammar('S -> abA | λ\nA -> cA | b')},ex=new GrammarFAExercise(g);let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);ex.answers['0']={from:'0',read:'ab',to:String(ex.final)};equal(ex.check('0').wrong,['to']);ex.finish();const out=ex.export();assert(out.transitions.every(t=>[...t.read].length<=1));assert(A.equivalent(out,G.grammarToFA(g.productions)).equal);equal(simulate(out,'abccb').status,'accepted');equal(simulate(out,'abcc').status,'rejected');ex.answers['0'].read='x';assert(!ex.check('0').correct);assert(ex.graph().transitions.length<out.transitions.length);ex.reset();equal(ex.graph().transitions.length,0);
});
test('Guided grammar FA supports named variables, uppercase literals and unit cycles',()=>{
 const g=tokenGrammar([{left:[V('Start')],right:[V('Next')]},{left:[V('Next')],right:[V('Start')]},{left:[V('Next')],right:[T('A'),T('['),T('a'),T(']')]}]);const ex=new GrammarFAExercise(g);ex.finish();equal(simulate(ex.export(),'A[a]').status,'accepted');equal(simulate(ex.export(),'Aa').status,'rejected');let invalid=false;try{new GrammarFAExercise({type:'grammar',productions:G.parseGrammar('S -> aSb | λ')});}catch{invalid=true;}assert(invalid);
});


test('Guided LL PDA validates stack fields and accepts the source grammar language',()=>{
 const ex=new CFGPDAExercise({type:'grammar',name:'LL',productions:G.parseGrammar('S -> aA | λ\nA -> b | λ')});let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);ex.fill('2');ex.answers['2'].push='Aa';assert(!ex.check('2').correct);ex.finish();const m=ex.export();for(const word of ['', 'a','ab'])equal(simulate(m,word).status,'accepted');for(const word of ['b','aa','aba'])equal(simulate(m,word).status,'rejected');assert(ex.graph().transitions.every(t=>typeof t.pop==='string'));ex.reset();equal(ex.graph().transitions.length,0);
});
test('Guided LL PDA protects its bottom marker from grammar variable Z',()=>{
 const ex=new CFGPDAExercise({type:'grammar',name:'Z grammar',productions:G.parseGrammar('S -> a\nZ -> bZ | λ')});ex.finish();const m=ex.export();equal(simulate(m,'a').status,'accepted');equal(simulate(m,'ab').status,'rejected');assert(ex.bottom!=='Z');let invalid=false;try{new CFGPDAExercise({productions:G.parseGrammar('AB -> a')});}catch{invalid=true;}assert(invalid);
});


test('Guided LR PDA checks reversed reductions and shifts in separate construction mode',()=>{
 const grammar={type:'grammar',name:'Bottom up',productions:G.parseGrammar('S -> aA\nA -> b')},ex=new CFGPDAExercise(grammar,'lr');equal(ex.jobs[2].expected.pop,'Aa');equal(ex.jobs[2].expected.push,'S');ex.fill('2');ex.answers['2'].pop='aA';assert(!ex.check('2').correct);ex.finish();const m=ex.export();equal(simulate(m,'ab').status,'accepted');for(const word of ['', 'a','ba','abb'])equal(simulate(m,word).status,'rejected');assert(m.transitions.some(t=>t.read==='a'&&t.pop===''&&t.push==='a'));equal(m.transitions[1].pop,'S'+ex.bottom);const ll=new CFGPDAExercise(grammar);equal(ll.checked.size,0);equal(ll.jobs[2].expected.pop,'S');
});
test('Guided LR PDA handles empty productions and protects the bottom marker',()=>{
 const ex=new CFGPDAExercise({type:'grammar',name:'Empty',productions:G.parseGrammar('S -> Z\nZ -> λ')},'lr');ex.finish();equal(ex.jobs[3].expected.pop,'');equal(ex.jobs[3].expected.push,'Z');equal(simulate(ex.export(),'').status,'accepted');ex.reset();equal(ex.graph().transitions.length,0);
});

document.querySelector('#summary').textContent=`${passed} passed · ${failed} failed`;document.title=`${failed?'FAIL':'PASS'} — JFLAP regression tests`;

