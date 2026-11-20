import {determinize,alphabet,machine,state,edge,layout,clone} from './automata.js';
const canonical=groups=>groups.map(g=>[...g].sort((a,b)=>a-b).join(',')).sort().join('|');
export class MinimizationExercise {
 constructor(input){if(input.type!=='fa')throw Error('Select a finite automaton.');this.source=determinize(input,true);this.alphabet=alphabet(this.source);
 this.destinations=new Map(this.source.states.map(s=>[s.id,new Map()]));
 for(const t of this.source.transitions)this.destinations.get(t.from).set(t.read,t.to);
 this.reset();}
 reset(){const ids=this.source.states.map(s=>s.id);this.nodes=[{ids,children:[],reason:'All reachable DFA states'}];this.leaves=[];for(const final of [false,true]){const group=this.source.states.filter(s=>s.final===final).map(s=>s.id);if(group.length){this.nodes[0].children.push(this.nodes.length);this.leaves.push(this.nodes.length);this.nodes.push({ids:group,children:[],reason:final?'Final':'Nonfinal'});}}this.history=[];this.drafts={};this.result=null;}
 groups(){return this.leaves.map(id=>this.nodes[id].ids);}
 target(id,symbol){return this.destinations.get(id).get(symbol);}
 expected(index,symbol){if(!this.groups()[index]||!this.alphabet.includes(symbol))throw Error('Choose a partition and alphabet symbol.');const groups=this.groups(),byTarget=new Map();for(const id of groups[index]){const target=groups.findIndex(g=>g.includes(this.target(id,symbol)));if(!byTarget.has(target))byTarget.set(target,[]);byTarget.get(target).push(id);}return [...byTarget.values()];}
 jobs(){return this.groups().flatMap((_,index)=>this.alphabet.filter(symbol=>this.expected(index,symbol).length>1).map(symbol=>({index,symbol})));}
 split(index,symbol,text){const expected=this.expected(index,symbol);if(expected.length<2)throw Error('This symbol does not distinguish states in the selected partition.');const groups=text.split('|').map(part=>{if(!/^\s*\d+(?:[\s,]+\d+)*\s*$/.test(part))throw Error('Separate state IDs with commas and groups with |.');return part.trim().split(/[\s,]+/).map(Number);});if(canonical(groups)!==canonical(expected))return false;
 this.remember();this.applySplit(this.leaves[index],expected,'on '+symbol);return true;}
 applySplit(id,groups,reason) {
    const children=groups.map(ids=>{
        this.nodes.push({ids,children:[],reason});
        return this.nodes.length-1;
    });
    delete this.drafts[id];
    this.nodes[id].children=children;
    this.leaves.splice(this.leaves.indexOf(id),1,...children);
    this.result=null;
    return children;
 }
 completeSubtree(root) {
    if(!this.nodes[root])throw Error('Select a partition-tree node.');
    const partitionBy=(ids,key)=>{
        const buckets=new Map();
        for(const id of ids){const value=key(id);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(id);}
        return [...buckets.values()];
    };
    // Outside groups can distinguish destinations. Refine a private partition to
    // learn those distinctions without changing any node outside this subtree.
    const levels=[];
    let groups=this.groups();
    while(true){
        const classes=new Map(groups.flatMap((group,i)=>group.map(id=>[id,i])));
        levels.push(classes);
        const next=groups.flatMap(group=>partitionBy(group,id=>this.alphabet.map(c=>classes.get(this.target(id,c))).join(',')));
        if(next.length===groups.length)break;
        groups=next;
    }
    const pending=[root];
    let count=0;
    while(pending.length){
        const id=pending.pop(), node=this.nodes[id];
        if(node.children.length){pending.push(...node.children);continue;}
        let split=null;
        for(const [round,classes] of levels.entries()){
            for(const symbol of this.alphabet){
                const parts=partitionBy(node.ids,s=>classes.get(this.target(s,symbol)));
                if(parts.length>1){split={parts,reason:'on '+symbol+(round?' (destination refinement round '+round+')':'')};break;}
            }
            if(split)break;
        }
        if(!split)continue;
        if(!count)this.remember();
        pending.push(...this.applySplit(id,split.parts,split.reason));
        count++;
    }
    return count;
 }
 remember(){this.history.push(clone({nodes:this.nodes,leaves:this.leaves,drafts:this.drafts,result:this.result}));}
 childGroups(id) {
    if(!this.leaves.includes(id))throw Error('Choose a leaf to edit its children.');
    return this.drafts[id] || [[],[]];
 }
 editChildren(id, edit) {
    const groups=clone(this.childGroups(id));
    edit(groups);
    this.remember();
    this.drafts[id]=groups;
 }
 addChild(id){this.editChildren(id,groups=>groups.push([]));}
 removeChild(id,index){
    this.editChildren(id,groups=>{if(!groups[index])throw Error('Select a child group.');groups.splice(index,1);});
 }
 toggleMember(id,index,stateId){
    this.editChildren(id,groups=>{
        if(!groups[index])throw Error('Add or select a child group first.');
        if(!this.nodes[id].ids.includes(stateId))throw Error('This state belongs to a different partition.');
        const remove=groups[index].includes(stateId);
        groups.forEach(group=>{const old=group.indexOf(stateId);if(old>=0)group.splice(old,1);});
        if(!remove){groups[index].push(stateId);groups[index].sort((a,b)=>a-b);}
    });
 }
 checkNode(id,symbol) {
    if(!this.nodes[id])throw Error('Choose a partition.');
    const node=this.nodes[id];
    if(node.children.length)return {correct:true,message:'These children form a checked partition.'};
    const index=this.leaves.indexOf(id);
    if(!this.alphabet.length)return {correct:!this.drafts[id],message:'The alphabet is empty. No split is needed.'};
    const expected=this.expected(index,symbol);
    if(expected.length===1){
        if(!this.drafts[id] && this.alphabet.every(c=>this.expected(index,c).length===1))
            return {correct:true,message:'No symbol splits this node in the current partition.'};
        return {correct:false,message:'This symbol does not distinguish these states in the current partition.'};
    }
    const groups=this.childGroups(id);
    if(groups.length<2||groups.some(g=>!g.length))return {correct:false,message:'Create at least two nonempty child groups.'};
    const members=groups.flat();
    if(canonical([members])!==canonical([node.ids]))return {correct:false,message:'Place every state of the selected partition in a child group.'};
    if(canonical(groups)!==canonical(expected))return {correct:false,message:'States in each child must reach the same current partition on the selected symbol.'};
    this.remember();this.applySplit(id,expected,'on '+symbol);
    return {correct:true,message:'Correct split added to the partition tree.'};
 }
 step(){const job=this.jobs()[0];if(!job)return null;this.split(job.index,job.symbol,this.expected(job.index,job.symbol).map(g=>g.join(',')).join('|'));return job;}
 finish(){while(this.step());}
 undo(){const previous=this.history.pop();if(previous){this.nodes=previous.nodes;this.leaves=previous.leaves;this.drafts=previous.drafts;this.result=previous.result;}return !!previous;}
 beginResult(){if(this.jobs().length)throw Error('Refine the partitions until none can split.');if(this.result)return this.result;const out=machine();out.name=this.source.name+' · guided minimum';this.groups().forEach(ids=>{const s=state(out);s.initial=ids.some(id=>this.source.states[id].initial);s.final=this.source.states[ids[0]].final;s.label=ids.join(', ');});this.result=layout(out);return this.result;}
 resultJobs(){if(!this.result)return[];return this.groups().flatMap((_,from)=>this.alphabet.filter(symbol=>!this.result.transitions.some(t=>t.from===from&&t.read===symbol)).map(symbol=>({from,symbol})));}
 expectedTarget(from,symbol){if(!this.groups()[from]||!this.alphabet.includes(symbol))throw Error('Choose a result state and symbol.');const destination=this.target(this.groups()[from][0],symbol);return this.groups().findIndex(g=>g.includes(destination));}
 connect(from,symbol,target){this.beginResult();if(String(this.expectedTarget(from,symbol))!==String(target))return false;if(!this.result.transitions.some(t=>t.from===from&&t.read===symbol))edge(this.result,from,Number(target),symbol);return true;}
 completeResult(){this.beginResult();for(const {from,symbol} of this.resultJobs())this.connect(from,symbol,this.expectedTarget(from,symbol));}
 export(){this.beginResult();if(this.resultJobs().length)throw Error('Complete the result transitions before exporting.');return clone(this.result);}
}
