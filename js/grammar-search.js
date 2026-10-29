// Incremental breadth-first derivation search. Each chunk has a bounded amount
// of work; pending candidates survive pause and configuration limits.
export class DerivationSearch {
 constructor(productions,input,{limit=15000,maxLength=Math.max(20,input.length*3+6)}={}){
  if(!productions.length||productions.some(p=>!p.left))throw Error('Provide productions with nonempty left sides.');
  this.productions=productions.map(p=>({...p}));this.input=input;this.limit=limit;this.maxLength=maxLength;
  this.queue=[{word:productions[0].left,parent:null}];this.seen=new Set([this.queue[0].word]);
  this.head=0;this.work=0;this.deferred=[];this.status='running';this.rows=[];this.cursor=null;this.pending=null;
 }
 *children(c){for(const p of this.productions)for(let i=0;i<=c.word.length-p.left.length;i++){
  yield c.word.slice(i,i+p.left.length)===p.left?{word:c.word.slice(0,i)+p.right+c.word.slice(i+p.left.length),parent:c,action:p.left+' → '+(p.right||'λ'),position:i}:null;
 }}
 accept(c){this.status='accepted';this.rows=[];for(let n=c;n.parent;n=n.parent)this.rows.push({word:n.word,action:n.action,position:n.position});this.rows.reverse();}
 chunk(budget=250){
  if(!Number.isInteger(budget)||budget<1)throw Error('Work budget must be positive.');
  for(let n=0;n<budget&&this.status==='running';n++,this.work++){
   if(!this.cursor){
    if(this.head>=this.queue.length){this.status=this.deferred.length?'limit':'rejected';this.reason=this.deferred.length?'length':null;break;}
    const c=this.queue[this.head++];if(c.word===this.input){this.accept(c);break;}this.cursor=this.children(c);
   }
   this.pending??=this.cursor.next();
   if(this.pending.done){this.cursor=null;this.pending=null;continue;}
   const c=this.pending.value;
   if(!c||this.seen.has(c.word)){this.pending=null;continue;}
   if(c.word.length>this.maxLength){this.deferred.push(c);this.pending=null;continue;}
   if(this.queue.length>=this.limit){this.status='limit';this.reason='count';break;}
   this.seen.add(c.word);this.queue.push(c);this.pending=null;
  }
  return this.result();
 }
 pause(){if(this.status==='running')this.status='paused';}
 resume(additional=15000){
  if(this.status==='paused'){this.status='running';return;}
  if(this.status!=='limit')return;
  if(!Number.isInteger(additional)||additional<1)throw Error('Additional search budget must be positive.');
  this.limit+=additional;
  if(this.reason==='length'){this.maxLength=Math.max(this.maxLength+10,this.maxLength*2);this.cursor=this.deferred[Symbol.iterator]();this.deferred=[];}
  this.status='running';this.reason=null;
 }
 cancel(){if(['running','paused','limit'].includes(this.status))this.status='cancelled';}
 result(){return {status:this.status,rows:this.rows,count:this.queue.length,expanded:this.head,work:this.work,reason:this.reason,maxLength:this.maxLength};}
}
