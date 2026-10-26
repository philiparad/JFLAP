// Space-delimited symbols, simultaneous rewriting, context rules, 3-D turtle.
export function expand(axiom,rules,depth,random=Math.random){let word=axiom.trim().split(/\s+/).filter(Boolean);for(let d=0;d<depth;d++){const next=[];for(let i=0;i<word.length;i++){const matches=rules.filter(r=>{const lhs=r.left.trim().split(/\s+/);if(lhs.length===1)return lhs[0]===word[i];const focus=Number(lhs.shift());return Number.isInteger(focus)&&lhs.every((s,j)=>word[i-focus+j]===s);});const rule=matches[Math.floor(random()*matches.length)];next.push(...(rule?rule.right.trim().split(/\s+/).filter(Boolean):[word[i]]));if(next.length>200000)throw Error('Expansion exceeds 200,000 symbols. Reduce the depth.');}word=next;}return word;}
export function arithmetic(source,vars){const tokens=String(source).match(/\d*\.?\d+(?:e[+-]?\d+)?|[A-Za-z_]\w*|[()+\-*/^]/gi)||[];if(tokens.join('')!==String(source).replace(/\s/g,''))throw Error('Invalid mathematical expression: '+source);let i=0;
 function primary(){const t=tokens[i++];if(t==='('){const n=add();if(tokens[i++]!==')')throw Error('Unclosed expression.');return n;}if(t==='+')return primary();if(t==='-')return-primary();if(t===undefined)throw Error('Incomplete expression.');return /^\d|^\./.test(t)?Number(t):Number(vars[t]||0);}
 function power(){let n=primary();if(tokens[i]==='^'){i++;n=n**power();}return n;}
 function mult(){let n=power();while(['*','/'].includes(tokens[i])){const t=tokens[i++],b=power();n=t==='*'?n*b:n/b;}return n;}
 function add(){let n=mult();while(['+','-'].includes(tokens[i])){const t=tokens[i++],b=mult();n=t==='+'?n+b:n-b;}return n;}
 const n=add();if(i!==tokens.length||!Number.isFinite(n))throw Error('Invalid numerical result.');return n;
}
const mul=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((s,v,k)=>s+v*b[k][j],0)));
function rotate(axis,deg){const c=Math.cos(deg*Math.PI/180),s=Math.sin(deg*Math.PI/180);return axis===0?[[1,0,0],[0,c,-s],[0,s,c]]:axis===1?[[c,0,s],[0,1,0],[-s,0,c]]:[[c,-s,0],[s,c,0],[0,0,1]];}
export function turtle(word,parameters={},view=[0,0,0]){let p={distance:15,angle:15,lineWidth:1,lineIncrement:1,hueChange:10,color:'black',polygonColor:'red',...parameters};if(parameters.angleIncrement!==undefined)p.angle=parameters.angleIncrement;let loc=[0,0,0],basis=[[1,0,0],[0,1,0],[0,0,1]],stack=[],polygon=null,shapes=[];const camera=mul(mul(rotate(0,view[0]),rotate(1,view[1])),rotate(2,view[2])),project=v=>camera.map(row=>row.reduce((s,c,i)=>s+c*v[i],0)).slice(0,2),num=v=>arithmetic(v,p);
 for(const token of word){const assignment=/^(\w+)=(.+)$/.exec(token);if(assignment){const [,name,value]=assignment;p[name]=name.toLowerCase().includes('color')?value:num(value);continue;}const match=/^(##|@@|.)(?:\((.*)\))?$/.exec(token);if(!match)continue;const[,c,arg]=match;const value=arg===undefined?null:num(arg);if(c==='g'||c==='f'){const old=[...loc];loc=loc.map((v,i)=>v+basis[i][1]*(value??num(p.distance)));if(c==='g'){if(polygon)polygon.push(project(loc));else shapes.push({points:[project(old),project(loc)],color:p.color,width:Math.max(0,num(p.lineWidth))});}}
 else if('+-&^/*%'.includes(c)){const axis='+- %'.includes(c)?2:'&^'.includes(c)?0:1;const sign='-^*'.includes(c)?-1:1;basis=mul(basis,rotate(axis,c==='%'?180:sign*(value??num(p.angle))));}
 else if(c==='[')stack.push(JSON.parse(JSON.stringify({loc,basis,p})));
 else if(c===']'&&stack.length)({loc,basis,p}=stack.pop());
 else if(c==='!')p.lineWidth=Math.max(0,num(p.lineWidth)+(value??num(p.lineIncrement)));
 else if(c==='~')p.lineWidth=Math.max(0,num(p.lineWidth)-(value??num(p.lineIncrement)));
 else if(c==='{')polygon=[project(loc)];else if(c==='}'&&polygon){shapes.push({points:polygon,color:p.polygonColor,polygon:true});polygon=null;}
 else if(['#','@','##','@@'].includes(c)){const name=c.length===2?'polygonColor':'color',h=Number(p[name+'Hue']||0)+(c[0]==='#'?1:-1)*(value??num(p.hueChange));p[name+'Hue']=h;p[name]=`hsl(${h} 70% 45%)`;}}
 return shapes;
}
