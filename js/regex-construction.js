import {machine,state,layout,clone,empty} from './automata.js';
export function parseRegexTree(expression){
 const src=[...expression.replace(/\s/g,'')];if(src.length>500)throw Error('Interactive construction supports expressions up to 500 symbols.');let pos=0;
 const atom=()=>{let node;const c=src[pos++];if(c==='('){node=union();if(src[pos++]!==')')throw Error('Missing closing parenthesis.');}else if(c===undefined||[')', '+','*'].includes(c))throw Error('Expected a symbol at position '+pos);else node=c==='∅'?{kind:'empty'}:empty(c)===''?{kind:'epsilon'}:{kind:'symbol',value:c};while(src[pos]==='*'){pos++;node={kind:'star',child:node};}return node;};
 const concat=()=>{const nodes=[];while(pos<src.length&&![')', '+'].includes(src[pos]))nodes.push(atom());return nodes.length?nodes.reduce((left,right)=>({kind:'concat',left,right})):{kind:'epsilon'};};
 const union=()=>{let left=concat();while(src[pos]==='+'){pos++;left={kind:'union',left,right:concat()};}return left;};
 const root=union();if(pos!==src.length)throw Error('Unexpected closing parenthesis.');return root;
}
export const regexTreeText=n=>n.kind==='symbol'?n.value:n.kind==='epsilon'?'λ':n.kind==='empty'?'∅':n.kind==='star'?`(${regexTreeText(n.child)})*`:`(${regexTreeText(n.left)}${n.kind==='union'?'+':''}${regexTreeText(n.right)})`;
export class RegexConstruction {
 constructor(expression){this.expression=expression;this.root=parseRegexTree(expression);this.reset();}
 reset(){this.model=machine();this.model.name=(this.expression||'λ')+' · guided NFA';state(this.model);state(this.model).final=true;this.nextEdge=0;this.history=[];this.steps=[];this.add(0,1,this.root);layout(this.model);}
 add(from,to,node=null){this.model.transitions.push({id:this.nextEdge++,from,to,read:node?regexTreeText(node):'',...(node?{expressionNode:node}:{})});}
 pending(){return this.model.transitions.filter(t=>t.expressionNode);}
 expand(id){const t=this.pending().find(t=>t.id===id);if(!t)throw Error('Select an unfinished expression edge.');this.history.push(clone({model:this.model,nextEdge:this.nextEdge,steps:this.steps}));this.model.transitions=this.model.transitions.filter(e=>e!==t);const n=t.expressionNode;
 if(n.kind==='symbol')this.model.transitions.push({id:this.nextEdge++,from:t.from,to:t.to,read:n.value});
 else if(n.kind==='epsilon')this.add(t.from,t.to);
 else if(n.kind==='union'){this.add(t.from,t.to,n.left);this.add(t.from,t.to,n.right);}
 else if(n.kind==='concat'){const middle=state(this.model).id;this.add(t.from,middle,n.left);this.add(middle,t.to,n.right);}
 else if(n.kind==='star'){const start=state(this.model).id,end=state(this.model).id;this.add(t.from,t.to);this.add(t.from,start);this.add(start,end,n.child);this.add(end,start);this.add(end,t.to);}
 this.steps.push({kind:n.kind,expression:regexTreeText(n),from:t.from,to:t.to});layout(this.model);return n.kind;
 }
 step(){const t=this.pending()[0];return t?this.expand(t.id):null;}
 finish(){while(this.pending().length)this.step();}
 undo(){const previous=this.history.pop();if(!previous)return false;Object.assign(this,previous);return true;}
 export(){if(this.pending().length)throw Error('Resolve every expression edge before exporting the NFA.');return clone(this.model);}
}
