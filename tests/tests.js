import {parseLSystemColor,lsystemPalette,shiftLSystemHue,hueIncrement} from '../js/lsystem-colors.js';
import {cfStrategies} from '../js/cf-pumping.js';
import {regularStrategies} from '../js/regular-pumping.js';
import {PumpingGame} from '../js/pumping-game.js';
import {testDocumentFiles} from './document-files.js';
import {CNFExercise} from '../js/cnf-exercise.js';
import {UselessExercise} from '../js/useless-exercise.js';
import {UnitExercise} from '../js/unit-exercise.js';
import {LambdaExercise} from '../js/lambda-exercise.js';
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


test('Lambda exercise checks chained nullable sets and repeated omission alternatives',()=>{
 const ex=new LambdaExercise({type:'grammar',name:'Nullable',productions:G.parseGrammar('S -> AAB\nA -> λ | a\nB -> C\nC -> λ | b')});ex.setAnswer='A';assert(!ex.checkSet().correct);ex.fillSet();equal([...ex.nullable].sort(),['A','B','C','S']);ex.fillProductions();assert(ex.checkProductions().correct);assert(ex.expected.some(p=>p.left==='S'&&p.right==='AB'));assert(ex.expected.some(p=>p.left==='S'&&!p.right));assert(ex.expected.filter(p=>p.left==='S'&&p.right==='AB').length===1);ex.productionAnswer+='\nS -> x';assert(!ex.checkProductions().correct);ex.fillProductions();const result=ex.export();for(const word of ['', 'a','aa','b','ab','aab'])equal(tokenAccepts(fromLegacyGrammar(result),word),'accepted');equal(tokenAccepts(fromLegacyGrammar(result),'ba'),'rejected');ex.reset();assert(!ex.setChecked);
});
test('Lambda exercise handles empty nullable sets and rejects premature export',()=>{
 const ex=new LambdaExercise({type:'grammar',name:'No lambda',productions:G.parseGrammar('S -> a')});let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);ex.setAnswer='∅';assert(ex.checkSet().correct);ex.productionAnswer='S -> a';assert(ex.checkProductions().correct);equal(ex.export().productions,[{left:'S',right:'a'}]);ex.setAnswer='S';assert(!ex.checkSet().correct);
});


test('Unit exercise handles transitive cycles, epsilon and checked replacements',()=>{
 const ex=new UnitExercise({type:'grammar',name:'Units',productions:G.parseGrammar('S -> A\nA -> B | a\nB -> S | λ')});ex.answers.S='A,B';equal(ex.check('S').missing,['S']);ex.fillAll();assert(ex.ready());ex.fillProductions();assert(ex.checkProductions().correct);ex.productionAnswer+='\nS -> A';assert(!ex.checkProductions().correct);ex.fillProductions();const out=ex.export();assert(out.productions.every(p=>!G.variable(p.right)));equal(tokenAccepts(fromLegacyGrammar(out),''),'accepted');equal(tokenAccepts(fromLegacyGrammar(out),'a'),'accepted');equal(tokenAccepts(fromLegacyGrammar(out),'aa'),'rejected');ex.reset();assert(!ex.ready());
});
test('Unit removal keeps an unproductive start from becoming an unrelated variable',()=>{
 const ex=new UnitExercise({type:'grammar',name:'Empty start',productions:G.parseGrammar('S -> B\nA -> a')});ex.fillAll();equal([...ex.dependencies.S],['S','B']);ex.fillProductions();const out=ex.export();equal(out.productions[0].left,'S');assert(out.productions.every(p=>!G.variable(p.right)));equal(tokenAccepts(fromLegacyGrammar(out),''),'rejected');equal(tokenAccepts(fromLegacyGrammar(out),'a'),'rejected');
});


test('Useful-variable exercise computes reachability after productive pruning',()=>{
 const ex=new UselessExercise({type:'grammar',name:'Useful',productions:G.parseGrammar('S -> a | AB\nA -> b\nB -> B\nC -> c')});equal([...ex.generating].sort(),['A','C','S']);equal([...ex.reachable],['S']);ex.answers.reachable='S,A,B';equal(ex.check('reachable').extra,['A','B']);ex.fill('generating');ex.fill('reachable');ex.fillProductions();assert(ex.checkProductions().correct);equal(ex.expected,[{left:'S',right:'a'}]);ex.productionAnswer+='\nA -> b';assert(!ex.checkProductions().correct);ex.fillProductions();equal(tokenAccepts(fromLegacyGrammar(ex.export()),'a'),'accepted');equal(tokenAccepts(fromLegacyGrammar(ex.export()),'b'),'rejected');
});
test('Useful-variable exercise handles epsilon, cycles and an empty start language',()=>{
 const nullable=new UselessExercise({type:'grammar',name:'Nullable',productions:G.parseGrammar('S -> A\nA -> λ | S\nB -> b')});nullable.fill('generating');nullable.fill('reachable');nullable.fillProductions();equal(tokenAccepts(fromLegacyGrammar(nullable.export()),''),'accepted');assert(!nullable.expected.some(p=>p.left==='B'));const empty=new UselessExercise({type:'grammar',name:'Empty',productions:G.parseGrammar('S -> S\nA -> a')});empty.fill('generating');empty.fill('reachable');empty.fillProductions();equal(empty.productionAnswer,'');equal(empty.export().productions[0].left,'S');equal(tokenAccepts(fromLegacyGrammar(empty.export()),'a'),'rejected');empty.reset();assert(!empty.ready());
});


test('CNF exercise replaces terminals, splits rules and restores undo without changing language',()=>{
 const g={type:'grammar',name:'CNF',productions:G.parseGrammar('S -> abc | aBb\nB -> b | λ')},ex=new CNFExercise(g);let blocked=false;try{ex.export();}catch{blocked=true;}assert(blocked);const before=JSON.stringify(ex.productions);let collision=false;try{ex.replaceTerminal('a','S');}catch{collision=true;}assert(collision);ex.replaceTerminal('a','X');assert(ex.productions.some(p=>p.left==='X'&&p.right==='a'));assert(ex.undo());equal(JSON.stringify(ex.productions),before);ex.finish();assert(ex.ready());const out=ex.export();for(const word of ['abc','ab','abb'])equal(tokenAccepts(fromLegacyGrammar(out),word),'accepted');for(const word of ['', 'a','ac','abbb'])equal(tokenAccepts(fromLegacyGrammar(out),word),'rejected');ex.reset();assert(!ex.ready());
});
test('CNF exercise isolates nullable start and represents an empty language in binary form',()=>{
 const ex=new CNFExercise({type:'grammar',name:'Nullable start',productions:G.parseGrammar('S -> aS | λ')});assert(ex.start!=='S');ex.finish();assert(ex.ready());const out=ex.export();equal(tokenAccepts(fromLegacyGrammar(out),''),'accepted');equal(tokenAccepts(fromLegacyGrammar(out),'aaa'),'accepted');const dead=new CNFExercise({type:'grammar',name:'Empty',productions:G.parseGrammar('S -> S')});assert(dead.emptyLanguage);assert(dead.ready());assert(dead.export().productions.every(p=>p.right.length===2));
});

const originalBlocks=await (await fetch('./fixtures/original-blocks.jff')).text();
test('Original JFLAP block tags and shared references import, execute and round trip',()=>{
 const m=deserialize(originalBlocks),a=m.states.find(s=>s.id===0),b=m.states.find(s=>s.id===1);
 equal(a.x,0);equal(a.name,'Rewrite & first');equal(a.blockTag,'Rewrite');equal(b.blockTag,'Rewrite');equal(a.block.states.length,2);assert(!m.states.find(s=>s.id===2).block);
 assert(a.block!==b.block);equal(m.transitions[0].write,['~']);equal(m.transitions[0].move,['S']);assert(m.transitions[0].blockTransition);
 for(const machine of [m,deserialize(serialize(m))]){const r=simulate(machine,'a');equal(r.status,'accepted');equal(r.config.tapes[0]['0'],'b');equal(r.config.heads,[0]);equal(simulate(machine,'x').status,'rejected');}
 const xml=serialize(m),doc=new DOMParser().parseFromString(xml,'application/xml');equal(doc.getElementsByTagName('Rewrite').length,1);assert(xml.includes('block="true"'));equal(deserialize(xml).states[0].blockTag,'Rewrite');
});
test('Edited instances of a shared block export independent definitions',()=>{
 const m=deserialize(originalBlocks);m.states[1].block.transitions[0].write=['c'];const out=deserialize(serialize(m));
 equal(out.states[0].block.transitions[0].write,['b']);equal(out.states[1].block.transitions[0].write,['c']);assert(out.states[0].blockTag!==out.states[1].blockTag);
 m.transitions[0].write=['d'];m.transitions[0].move=['R'];const edited=deserialize(serialize(m));assert(!edited.transitions[0].blockTransition);equal(edited.transitions[0].write,['d']);equal(edited.transitions[0].move,['R']);
});
test('Nested inline files migrate to named block XML with labels and notes',()=>{
 const leaf=A.machine('turing');leaf.tapes=2;A.state(leaf).label='leaf & label';A.state(leaf).final=true;A.edge(leaf,0,1,['a','b'],{write:['x','y'],move:['S','S']});leaf.notes=[{text:'nested <note>',x:0,y:1}];
 const middle=A.machine('turing');middle.tapes=2;A.state(middle).block=leaf;A.state(middle).final=true;A.edge(middle,0,1,['x','y'],{write:['~','~'],move:['S','S'],blockTransition:true});
 const m=A.machine('turing');m.tapes=2;A.state(m).block=middle;A.state(m).final=true;A.edge(m,0,1,['x','y'],{write:['~','~'],move:['S','S'],blockTransition:true});
 const xml=serialize(m),out=deserialize(xml);equal(out.type,'turingbb');equal(out.states[0].block.states[0].block.notes,leaf.notes);equal(out.states[0].block.states[0].block.states[0].label,'leaf & label');equal(simulate(out,['a','b']).status,'accepted');
 const legacy='<structure><type>turing</type><automaton><state id="0"><initial/><automaton><state id="7"><initial/></state></automaton></state></automaton></structure>';
 equal(deserialize(serialize(deserialize(legacy))).states[0].block.states[0].id,7);
});
test('Missing, duplicate, cyclic and invalid-tape block files fail explicitly',()=>{
 const invalid=[originalBlocks.replace('<tag>Rewrite</tag>','<tag>Missing</tag>'),originalBlocks.replace('</structure>','<Rewrite/></structure>'),originalBlocks.replace('<tag>EmptyStart</tag>','<tag>Rewrite</tag>'),originalBlocks.replace('<type>turingbb</type>','<type>turingbb</type><tapes>1.5</tapes>'),originalBlocks.replace('<read>b</read>','<read tape="2">b</read>'),originalBlocks.replace('<read>b</read>','<read>b</read><read>b</read>')];
 for(const xml of invalid){let rejected=false;try{deserialize(xml);}catch{rejected=true;}assert(rejected);}
 const m=A.machine('turing');A.state(m).block=m;let rejected=false;try{serialize(m);}catch{rejected=true;}assert(rejected);
});

const gameRejects=fn=>{let rejected=false;try{fn();}catch{rejected=true;}assert(rejected);};
test('Pumping games enforce actor and phase without mutating invalid moves',()=>{
 const g=new PumpingGame('AnEven');gameRejects(()=>g.chooseWord('aaaa'));gameRejects(()=>g.computerMove());
 for(const m of [0,-1,1.5,21,NaN])gameRejects(()=>g.chooseLength(m));equal(g.moves,[]);
 g.chooseLength(3);gameRejects(()=>g.chooseWord('aaaa'));equal(g.phase,'word');g.computerMove();equal(g.word,'aaaa');
 for(const parts of [['','',g.word],['aaaa','a','a'],['','a','a']])gameRejects(()=>g.chooseSplit(parts));equal(g.phase,'split');
 g.chooseSplit(['','aa','aa']);g.computerMove();equal(g.phase,'complete');equal(g.result.winner,'human');
 gameRejects(()=>g.computerMove());gameRejects(()=>g.chooseExponent(0));g.retry();equal(g.phase,'split');g.chooseSplit(['','a','aaa']);g.computerMove();equal(g.result.winner,'computer');equal(g.attempts.length,2);
});
test('Computer-first regular game validates witness/exponent and retry',()=>{
 const g=new PumpingGame('AnBn','computer-first',()=>0);g.computerMove();equal(g.m,4);
 for(const w of ['', 'aab', 'a'.repeat(121)])gameRejects(()=>g.chooseWord(w));equal(g.phase,'word');
 g.chooseWord('aaabbb');g.computerMove();equal(g.phase,'exponent');
 for(const i of [1,-1,13,2.5,NaN])gameRejects(()=>g.chooseExponent(i));equal(g.phase,'exponent');
 g.chooseExponent(0);equal(g.result.winner,'human');g.retry();g.chooseExponent(2);equal(g.attempts.length,2);
});
test('Context-free games enforce window/nonempty constraints and both round outcomes',()=>{
 const g=new PumpingGame('AnBnCF','human-first',()=>0);g.chooseLength(4);g.computerMove();
 gameRejects(()=>g.chooseSplit(['','aaa','','bbb','']));gameRejects(()=>g.chooseSplit(['aaa','','','','bbb']));
 g.chooseSplit(['aaa','a','','b','bbb']);g.computerMove();equal(g.result.winner,'human');
 g.retry();g.chooseSplit(['','a','','','aaabbbb']);g.computerMove();equal(g.result.winner,'computer');
 const c=new PumpingGame('AnBnCn','computer-first',()=>0);c.computerMove();c.chooseWord('aaabbbccc');c.computerMove();c.chooseExponent(0);equal(c.result.winner,'human');
});
test('Every pumping language completes both turn orders with legal computer moves',()=>{
 for(const language of languages){
  const h=new PumpingGame(language.id);h.chooseLength(Math.max(3,h.range[0]));h.computerMove();
  h.chooseSplit(h.cf?['',h.word[0],'','',h.word.slice(1)]:['',h.word[0],h.word.slice(1)]);h.computerMove();equal(h.phase,'complete');
  const c=new PumpingGame(language.id,'computer-first',()=>0);c.computerMove();c.chooseWord(language.sample(c.m));c.computerMove();c.chooseExponent(2);equal(c.phase,'complete');
 }
});

const regularFixture=await (await fetch('fixtures/regular-pumping.json')).json();
for(const language of languages.filter(l=>!l.cf))test('Original Java regular opponent fixture: '+language.id,()=>{
 const strategy=regularStrategies[language.id],records=regularFixture.records.filter(r=>r.id===language.id);assert(records.length>0);
 for(const r of records){
  const random=()=>r.random;let actual;
  if(r.kind==='range')actual=strategy.range;
  if(r.kind==='length')actual=strategy.chooseM(random);
  if(r.kind==='word'){actual=strategy.word(r.m,random);assert(language.test(actual),'Invalid original witness '+language.id);}
  if(r.kind==='split'){actual=strategy.split(r.word,r.m,random);pump(language,r.word,actual,r.m,1);}
  if(r.kind==='exponent'){actual=strategy.exponent(r.word,r.parts,r.m,random);equal(pump(language,r.word,r.parts,r.m,actual).belongs,r.belongs);}
  equal(actual,r.kind==='range'?r.range:r.kind==='split'?r.parts:r.value);
 }
 assert(strategy.explanation.length>40);
});
test('Regular games use original ranges and policies at both range boundaries',()=>{
 for(const language of languages.filter(l=>!l.cf))for(const fraction of [0,.49,.99]){
  const strategy=regularStrategies[language.id],random=()=>fraction;
  for(const m of strategy.range){
   const h=new PumpingGame(language.id,'human-first',random);gameRejects(()=>h.chooseLength(strategy.range[0]-1));gameRejects(()=>h.chooseLength(strategy.range[1]+1));
   h.chooseLength(m);h.computerMove();equal(h.word,strategy.word(m,random));h.chooseSplit(['',h.word[0],h.word.slice(1)]);h.computerMove();equal(h.i,strategy.exponent(h.word,h.parts,m,random));
  }
  const c=new PumpingGame(language.id,'computer-first',random);c.computerMove();equal(c.m,strategy.chooseM(random));c.chooseWord(strategy.word(c.m,random));c.computerMove();equal(c.parts,strategy.split(c.word,c.m,random));c.chooseExponent(0);equal(c.phase,'complete');
 }
});

const cfFixture=await (await fetch('fixtures/cf-pumping.json')).json();
for(const language of languages.filter(l=>l.cf))test('Original Java context-free opponent fixture: '+language.id,()=>{
 const strategy=cfStrategies[language.id],records=cfFixture.records.filter(r=>r.id===language.id);assert(records.length>0);
 for(const r of records){
  const random=()=>r.random;let actual,expected=r.value;
  if(r.kind==='range'){actual=strategy.range;expected=r.range;}
  if(r.kind==='length')actual=strategy.chooseM(random);
  if(r.kind==='word'){actual=strategy.word(r.m,random);equal(language.test(actual),r.belongs);}
  if(r.kind==='split'){actual=strategy.split(r.word,r.m,random);expected=r.valid?r.parts:null;if(actual)pump(language,r.word,actual,r.m,1,true);}
  if(r.kind==='exponent'){actual=strategy.exponent(r.word,r.parts,r.m,random);equal(pump(language,r.word,r.parts,r.m,actual,true).belongs,r.belongs);}
  if(r.kind==='membership'){actual=language.test(r.word);expected=r.belongs;}
  equal(actual,expected);
 }
 assert(strategy.explanation.length>40);
});
test('Rejected original CF split proposals preserve turn and allow retry',()=>{
 const rejected=cfFixture.records.filter(r=>r.kind==='split'&&!r.valid);assert(rejected.length>0);
 for(const r of rejected){const game=new PumpingGame(r.id,'computer-first',()=>0);game.chooseLength(r.m,'computer');game.chooseWord(r.word);game.random=()=>r.random;gameRejects(()=>game.computerMove());equal(game.phase,'split');equal(game.moves.length,2);game.random=()=>0;game.computerMove();equal(game.phase,'exponent');}
});
test('CF games use original policies at range endpoints and report membership honestly',()=>{
 for(const language of languages.filter(l=>l.cf))for(const fraction of [0,.49,.99]){
  const strategy=cfStrategies[language.id],random=()=>fraction;
  for(const m of strategy.range){const game=new PumpingGame(language.id,'human-first',random);gameRejects(()=>game.chooseLength(strategy.range[0]-1));gameRejects(()=>game.chooseLength(strategy.range[1]+1));game.chooseLength(m);game.computerMove();equal(game.word,strategy.word(m,random));game.chooseSplit(['',game.word[0],'','',game.word.slice(1)]);game.computerMove();equal(game.i,strategy.exponent(game.word,game.parts,m,random));equal(game.phase,'complete');}
 }
});

test('Pumping snapshots preserve every phase, retries and history without random replay',()=>{
 for(const id of ['AnEven','AnBnCF'])for(const mode of ['human-first','computer-first']){
  let game=new PumpingGame(id,mode,()=>0);
  const restore=()=>{const snapshot=game.snapshot(),copy=PumpingGame.fromSnapshot(JSON.parse(JSON.stringify(snapshot)),()=>{throw Error('Restoration must not draw randomness');});equal(copy.snapshot(),snapshot);equal(copy.attempts,game.attempts);equal(copy.result,game.result);game=PumpingGame.fromSnapshot(snapshot,()=>0);};
  restore();game.chooseLength(game.range[0],game.actor);restore();game.chooseWord(game.strategy.word(game.m,()=>0),game.actor);restore();
  game.chooseSplit(game.strategy.split(game.word,game.m,()=>0),game.actor);restore();game.chooseExponent(2,game.actor);restore();game.retry();restore();
  if(game.phase==='split')game.chooseSplit(game.parts,game.actor);game.chooseExponent(0,game.actor);restore();equal(game.attempts.length,2);
  game.legacyAttempts=['Won <original>','Failed & retry'];restore();
 }
});
test('Pumping snapshot validation rejects false phases, actors and invalid moves',()=>{
 const good=new PumpingGame('AnEven').snapshot();
 for(const patch of [{version:2},{phase:'complete'},{mode:'unknown'},{language:'unknown'},{moves:[{actor:'computer',phase:'length',value:3}]},{moves:[{actor:'human',phase:'length',value:0}]},{legacyAttempts:[{}]}])gameRejects(()=>PumpingGame.fromSnapshot({...good,...patch}));
 const game=new PumpingGame('AnEven');game.chooseLength(3);const snapshot=game.snapshot();snapshot.moves[0].value=9;equal(game.m,3);equal(game.moves[0].value,3);
});

test('All pumping exercises round-trip XML and JSON with exact game history',()=>{
 for(const language of languages)for(const mode of ['human-first','computer-first']){
  const game=new PumpingGame(language.id,mode,()=>0),model={type:language.cf?'pumpingcf':'pumpingreg',language:language.id,name:'Saved <game> & "title"'};
  const check=()=>{model.game=game.snapshot();const copy=deserialize(serialize(model));for(const key of Object.keys(model))equal(copy[key],model[key]);equal(deserialize(JSON.stringify(model)),model);equal(PumpingGame.fromSnapshot(copy.game).phase,game.phase);};
  check();game.chooseLength(game.range[0],game.actor);check();game.chooseWord(game.strategy.word(game.m,()=>0),game.actor);check();game.chooseSplit(game.strategy.split(game.word,game.m,()=>0),game.actor);check();game.chooseExponent(2,game.actor);check();game.retry();check();
 }
});
test('Pumping XML preserves unstarted models, imported cases and legacy attempts',()=>{
 for(const type of ['pumpingreg','pumpingcf']){const m=blank(type);equal(deserialize(serialize(m)),m);}
 const game=new PumpingGame('AnBnCF');game.chooseLength(4);game.chooseWord('aaaabbbb','computer');game.chooseSplit(['aaa','a','','b','bbb']);game.chooseExponent(2,'computer');game.legacyAttempts=['Won & <old>'];game.legacyAttemptOffset=1;
 const model={type:'pumpingcf',language:'AnBnCF',name:'Case history',game:game.snapshot(),pumpingCases:[{lengths:[3,1,0,1],i:2}]},xml=serialize(model);for(const key of Object.keys(model))equal(deserialize(xml)[key],model[key]);assert((xml.match(/<attempt>/g)||[]).length===1);
 equal(deserialize(JSON.stringify({type:'pumpingcf',language:'AnBn',name:'Legacy'})).language,'AnBnCF');
});
test('Pumping file validation rejects malformed and conflicting saved state',()=>{
 const game=new PumpingGame('AnEven');game.chooseLength(3);const model={type:'pumpingreg',language:'AnEven',name:'Validation',game:game.snapshot()},xml=serialize(model);
 for(const bad of [xml.replace('<m>3</m>','<m>4</m>'),xml.replace('<m>3</m>','<m>3.5</m>'),xml.replace('<m>3</m>','<m>3</m><m>3</m>'),xml.replace('<first_player>Human</first_player>','<first_player>Unknown</first_player>'),xml.replace('<web-game>','<web-game>{'),JSON.stringify({...model,type:'pumpingcf'}),JSON.stringify({...model,game:{...model.game,phase:'complete'}}),JSON.stringify({...model,pumpingCases:[{lengths:[0,1,0,0],i:2}]})])gameRejects(()=>deserialize(bad));
});

const colorFixture=await (await fetch('fixtures/lsystem-colors.json')).json();
test('L-system original palette and numeric colors match Java observations',()=>{
 equal(Object.keys(lsystemPalette).sort(),colorFixture.palette);
 for(const record of colorFixture.records){
  if(record.rgb&&!record.input.includes('NaN'))equal(parseLSystemColor(record.input),record.rgb);
  else gameRejects(()=>parseLSystemColor(record.input));
 }
});
test('L-system drawing and polygons resolve color commands, assignments and branch restoration',()=>{
 const shapes=turtle(['g','[','color=0.5,1,1','g',']','g','polygonColor(brown)','{','g','+','g','+','g','}'],{color:'dukeBlue'});
 equal(shapes.map(s=>s.color),['rgb(0, 0, 156)','rgb(0, 255, 255)','rgb(0, 0, 156)','rgb(129, 0, 0)']);assert(shapes[3].polygon);
 equal(turtle(['color(255,127.9,0)','g'],{color:'purple'})[0].color,'rgb(255, 127, 0)');
 equal(turtle(['g'],{color:'0,0,0.5'})[0].color,'rgb(128, 128, 128)');
});
test('Malformed L-system colors report errors instead of silently becoming browser black',()=>{
 for(const value of ['DukeBlue','forestgreen','1,2','256,0,0','-1,0,0','0,1,no','NaN,0,0','Infinity,0,0']){
  gameRejects(()=>turtle(['g'],{color:value}));gameRejects(()=>turtle(['color('+value+')','g']));gameRejects(()=>turtle(['polygonColor='+value,'{','g','}']));
 }
});
test('L-system original color parameters survive XML round trips and example rendering',()=>{
 const model={type:'lsystem',name:'Color test',axiom:'g',productions:[],parameters:{color:'dukeBlue',polygonColor:'0.5,0.75,0.8'}},copy=deserialize(serialize(model));equal(copy.parameters,model.parameters);equal(turtle(['g'],copy.parameters)[0].color,'rgb(0, 0, 156)');assert(turtle(expand(example('lsystem').axiom,example('lsystem').productions,1),example('lsystem').parameters).length>0);
});

const hueFixture=await (await fetch('fixtures/lsystem-hues.json')).json();
test('L-system hue shifts match original sequences with a corrected wrap boundary',()=>{
 for(const record of hueFixture.records){
  const expectedSteps=record.color==='dukeBlue'&&record.angle===100000&&record.useDefault?[[0,156,104],[104,156,0],[156,0,0],[104,0,156],[0,104,156]]:record.steps;
  let rgb=parseLSystemColor(record.color);const angle=record.useDefault?hueIncrement(record.angle):record.angle;
  for(const expected of expectedSteps){rgb=shiftLSystemHue(rgb,angle);equal(rgb,expected);}
  const command=record.useDefault?'#':'#('+record.angle+')',shapes=turtle(Array(5).fill([command,'g']).flat(),{color:record.color,hueChange:record.angle});
  equal(shapes.map(s=>s.color),expectedSteps.map(rgb=>'rgb('+rgb.join(', ')+')'));
 }
});
test('Hue shifts preserve achromatic colors and independently restore branch colors and increments',()=>{
 for(const color of ['black','white','gray','0,0,0.5'])for(const command of ['#','@','##','@@']){
  const shapes=turtle([command,'g','{','g','+','g','}'],{color,polygonColor:color});equal(shapes.map(s=>s.color),Array(2).fill('rgb('+parseLSystemColor(color).join(', ')+')'));
 }
 const shapes=turtle(['#','g','[','hueChange=60','#','g',']','@','g','color(blue)','@','g'],{color:'red',hueChange:120});
 equal(shapes.map(s=>s.color),['rgb(0, 255, 0)','rgb(0, 255, 255)','rgb(255, 0, 0)','rgb(0, 255, 0)']);
 const polygon=turtle(['hueChange(120)','##','{','g','+','g','}','@@(120)','{','g','+','g','}'],{polygonColor:'red'});equal(polygon.map(s=>s.color),['rgb(0, 255, 0)','rgb(255, 0, 0)']);
});
test('Hue expressions wrap and malformed angles fail explicitly',()=>{
 equal(turtle(['#(angle*3)','g'],{color:'red',angle:120})[0].color,'rgb(255, 0, 0)');
 equal(turtle(['@(-120)','g'],{color:'red'})[0].color,'rgb(0, 255, 0)');
 for(const angle of [Infinity,NaN])gameRejects(()=>shiftLSystemHue([128,64,96],angle));
 gameRejects(()=>turtle(['#(1/0)','g'],{color:'red'}));
});

for(const result of await testDocumentFiles())test(result.name,()=>{if(result.error)throw result.error;});

document.querySelector('#summary').textContent=`${passed} passed · ${failed} failed`;document.title=`${failed?'FAIL':'PASS'} — JFLAP regression tests`;

