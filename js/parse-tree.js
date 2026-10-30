import {tokenText} from './token-grammar.js';
const tokens=side=>Array.isArray(side)?side:[...side].map(name=>({kind:/^[A-Z]$/.test(name)?'variable':'terminal',name}));
const text=side=>Array.isArray(side)?tokenText(side):side||'λ';
function builder(){let serial=0;return symbol=>{if(serial>=2000)throw Error('Tree display is limited to 2,000 nodes.');return {id:serial++,label:symbol.name,kind:symbol.kind,children:[]};};}
export function derivationTree(productions,rows){
 if(!productions.length||!productions.every(p=>tokens(p.left).length===1&&tokens(p.left)[0].kind==='variable'))return null;
 const node=builder(),root=node(tokens(productions[0].left)[0]),frontier=[root];let used=0;
 for(const row of rows){
  const p=productions.find(p=>text(p.left)+' → '+text(p.right)===row.action);if(!p)continue;
  const position=row.position??frontier.findIndex(n=>n.kind==='variable');
  const target=frontier[position];if(!target||target.kind!=='variable'||target.label!==tokens(p.left)[0].name)return null;
  const children=tokens(p.right).map(node);target.children=children.length?children:[node({kind:'epsilon',name:'λ'})];target.step=used++;
  frontier.splice(position,1,...children);
 }
 return used?root:null;
}
export function lrParseTree(productions,rows){
 const node=builder(),stack=[];
 for(const row of rows){if(/^s\d+$/.test(row.action))stack.push(node({kind:'terminal',name:row.input[0]}));
  else if(/^r\d+$/.test(row.action)){const p=productions[+row.action.slice(1)];if(!p)return null;const size=tokens(p.right).length;if(stack.length<size)return null;const parent=node(tokens(p.left)[0]);parent.children=size?stack.splice(stack.length-size,size):[node({kind:'epsilon',name:'λ'})];stack.push(parent);}
 }
 return stack.length===1?stack[0]:null;
}
export function cykParseTree(result,input){
 if(result.status!=='accepted'||!result.grammar.length)return null;
 const node=builder(),rules=result.grammar;
 if(!input){const root=node({kind:'variable',name:rules[0].left});root.children=[node({kind:'epsilon',name:'λ'})];return root;}
 function visit(name,start,length){const root=node({kind:'variable',name});
  if(length===1){if(!rules.some(p=>p.left===name&&p.right===input[start]))return null;root.children=[node({kind:'terminal',name:input[start]})];return root;}
  for(const p of rules.filter(p=>p.left===name&&p.right.length===2))for(let split=1;split<length;split++)if(result.cells[split-1][start].includes(p.right[0])&&result.cells[length-split-1][start+split].includes(p.right[1])){root.children=[visit(p.right[0],start,split),visit(p.right[1],start+split,length-split)];return root;}
  return null;
 }
 return visit(rules[0].left,0,input.length);
}
export function layoutParseTree(root,inverted=false){
 let leaves=0,depth=0;const nodes=[],edges=[];
 function visit(n,level){depth=Math.max(depth,level);const children=n.children.map(c=>visit(c,level+1));const item={...n,x:children.length?children.reduce((sum,c)=>sum+c.x,0)/children.length:50+leaves++*95,y:45+level*85};nodes.push(item);for(const child of children)edges.push({from:n.id,to:child.id});return item;}
 visit(root,0);const height=90+depth*85;if(inverted)for(const n of nodes)n.y=height-n.y;
 return {nodes,edges,width:Math.max(300,leaves*95+5),height};
}
