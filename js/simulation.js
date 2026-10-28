import {clone,empty,labels,validate} from './automata.js';
const key=c=>JSON.stringify([c.state,c.pos,c.stack,c.tapes,c.heads,c.output,c.path,c.calls,c.entered]);
export function initial(m,input){validate(m);const s=m.states.find(s=>s.initial);const inputs=Array.isArray(input)?input:[input];return {state:s.id,pos:0,stack:'Z',tapes:Array.from({length:m.tapes||1},(_,i)=>Object.fromEntries([...inputs[i]||''].map((c,j)=>[j,c]))),heads:Array(m.tapes||1).fill(0),output:m.type==='moore'?s.output||'':'',path:[],calls:[],entered:false,trace:[]};}
function currentMachine(root,path){return path.reduce((m,id)=>m.states.find(s=>s.id===id).block,root);}
function tapeRead(t,h){return t[h]??'';}
export function next(root,c,input,options={}) {
 const m=currentMachine(root,c.path),s=m.states.find(s=>s.id===c.state),isTM=['turing','turingbb'].includes(root.type);let children=[];
 if(isTM&&s.block&&!c.entered){validate(s.block);return[{...clone(c),state:s.block.states.find(s=>s.initial).id,path:[...c.path,s.id],calls:[...c.calls,s.id],entered:false}];}
 if(isTM&&s.final&&!c.path.length&&!options.finalTransitions)return [];
 for(const t of m.transitions.filter(t=>t.from===c.state)){
  if(isTM){const reads=Array.isArray(t.read)?t.read:[t.read],writes=Array.isArray(t.write)?t.write:[t.write??''],moves=Array.isArray(t.move)?t.move:[t.move||'R'];
   if(!c.tapes.every((tape,i)=>empty(reads[i])===tapeRead(tape,c.heads[i])))continue;
   const n=clone({...c,trace:[]});n.state=t.to;n.entered=false;n.trace=[];n.tapes.forEach((tape,i)=>{const w=empty(writes[i]);if(w)tape[n.heads[i]]=w;else delete tape[n.heads[i]];n.heads[i]+=moves[i]==='L'?-1:moves[i]==='R'?1:0;});children.push(n);
  }else for(const read of labels(t.read)){
   if(!input.startsWith(read,c.pos))continue;
   if(m.type==='pda'&&!c.stack.startsWith(empty(t.pop)))continue;
   const n={...c,state:t.to,pos:c.pos+read.length,trace:[]};
   if(m.type==='pda')n.stack=empty(t.push)+c.stack.slice(empty(t.pop).length);
   if(m.type==='mealy')n.output+=t.output||'';
   if(m.type==='moore')n.output+=m.states.find(s=>s.id===t.to).output||'';
   children.push(n);
  }
 }
 if(isTM&&!children.length&&c.path.length){const n=clone({...c,trace:[]});n.state=n.calls.pop();n.path.pop();n.entered=true;n.trace=[];children.push(n);}
 return children;
}
export function accepting(m,c,input,options={},children=null){const s=m.states.find(s=>s.id===c.state);if(['turing','turingbb'].includes(m.type)){if(c.path.length||!s)return false;const mode=options.acceptance||'final';return ((mode==='final'||mode==='both')&&s.final)||((mode==='halt'||mode==='both')&&(children??next(m,c,input,options)).length===0);}if(c.pos!==input.length)return false;if(['mealy','moore'].includes(m.type))return true;return m.type==='pda'&&options.acceptance==='empty'?c.stack.length===0:s.final;}
export function tapeOutput(c){return c.tapes.map((t,i)=>{let h=c.heads[i],s='';while(t[h]!==undefined&&s.length<10000)s+=t[h++];return s;});}
const snapshot=c=>({state:c.state,pos:c.pos,stack:c.stack,output:c.output,heads:c.heads,tapes:c.tapes,path:c.path});
function traced(c,n){return {...n,trace:[...c.trace,snapshot(c)],ancestors:[...(c.ancestors||[key(c)]),key(n)]};}
function* epsilonClosure(m,seed,input,options){
 const queue=[seed],seen=new Set();
 for(let i=0;i<queue.length;i++){const c=queue[i],k=key(c);if(seen.has(k))continue;seen.add(k);yield c;
  for(const n of next(m,c,input,options))if(n.pos===c.pos&&!seen.has(key(n)))queue.push(traced(c,n));
 }
}
function* stepChildren(m,c,input,options,closureMode,initializing){
 if(initializing){yield* epsilonClosure(m,c,input,options);return;}
 for(const n of next(m,c,input,options)){
  if(closureMode&&n.pos===c.pos)continue;
  const child=traced(c,n);
  if(closureMode)yield* epsilonClosure(m,child,input,options);else yield child;
 }
}
export class Runner {
 constructor(m,input,options={}){this.m=clone(m);this.input=Array.isArray(input)?input[0]||'':input;this.options=options;const c=initial(m,input);this.frontier=[c];this.visited=new Set([key(c)]);this.steps=0;this.count=1;this.status='running';this.accepted=[];this.reported=new WeakSet();this.foundAcceptance=false;this.layers=[[c]];this.limit=options.limit||20000;this.closureMode=options.stepMode==='closure'&&m.type==='fa';this.initializing=this.closureMode;if(this.initializing)this.step();else this.inspect();}
 inspect(){this.accepted=[];for(const c of this.frontier)if(!this.reported.has(c)&&accepting(this.m,c,this.input,this.options))this.accepted.push(c);if(this.accepted.length){this.status='accepted';this.foundAcceptance=true;}else if(!this.frontier.length)this.status=this.foundAcceptance?'exhausted':'rejected';else if(this.frontier.every(c=>c.frozen))this.status='paused';else this.status='running';}
 step(){
  if(this.status!=='running')return this.status;
  this.pending??={source:[...this.frontier],index:0,child:0,children:null,frontier:this.initializing?[...this.frontier]:[],repeats:false};
  const p=this.pending;
  while(p.index<p.source.length){const c=p.source[p.index];
   if(c.frozen){p.frontier.push(c);p.index++;continue;}
   p.children??=stepChildren(this.m,c,this.input,this.options,this.closureMode,this.initializing);
   while(true){p.item??=p.children.next();if(p.item.done)break;
    const n=p.item.value,k=key(n);
    if(this.options.tracePaths?(c.ancestors||[key(c)]).includes(k):this.visited.has(k)){p.repeats=true;p.item=null;continue;}
    if(this.count>=this.limit){this.status='limit';return this.status;}
    this.visited.add(k);p.item=null;p.frontier.push(n);this.count++;
   }
   p.index++;p.child=0;p.children=null;p.item=null;
  }
  this.frontier=p.frontier;this.pending=null;if(!this.initializing)this.steps++;this.initializing=false;this.layers.push(this.frontier);if(this.layers.length>300)this.layers.shift();this.inspect();
  if(this.status==='rejected'&&p.repeats&&['turing','turingbb'].includes(this.m.type))this.status='loop';return this.status;
 }
 keepLooking(){
  if(this.status!=='accepted')return this.status;
  this.accepted.forEach(c=>this.reported.add(c));this.accepted=[];this.status='running';return this.run();
 }
 resume(additional=this.options.limit||20000){
  if(this.status!=='limit')return this.status;
  if(!Number.isFinite(additional)||additional<1)throw Error('Additional search budget must be positive.');
  this.limit=this.count+Math.floor(additional);this.status='running';return this.status;
 }
 control(configurations,action){
  if(this.pending)throw Error('Continue the pending step before changing configurations.');
  if(!['freeze','thaw','remove'].includes(action))throw Error('Unknown configuration action.');
  for(const c of configurations){if(!this.frontier.includes(c))continue;
   if(action==='remove')this.frontier=this.frontier.filter(x=>x!==c);
   else if(action==='thaw')c.frozen=false;
   else if(!accepting(this.m,c,this.input,this.options)&&next(this.m,c,this.input,this.options).length)c.frozen=true;
  }
  this.inspect();return this.status;
 }
 run(){while(this.status==='running')this.step();return {status:this.status,steps:this.steps,count:this.count,config:this.accepted[0]||this.frontier[0],trace:this.accepted[0]?.trace||[],outputs:this.accepted.map(c=>['turing','turingbb'].includes(this.m.type)?tapeOutput(c):c.output)};}
}
export function simulate(m,input,options={}){return new Runner(m,input,options).run();}
