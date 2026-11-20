import {mountConversionGraph} from './conversion-graph.js';

export function mountPartitionEditor(host,{exercise,session,graphMarkup,symbol,commit,stable}) {
    const id=session.minNode, node=exercise.nodes[id], leaf=!node.children.length;
    host.innerHTML=`<h4>Children of the selected partition</h4><p data-instructions></p>
        <div class="actions" data-groups role="group" aria-label="Proposed child groups"></div>
        <div class="actions" data-tools></div><div data-machine></div><p role="status"></p>`;
    const get=name=>host.querySelector('[data-'+name+']'), status=host.querySelector('[role=status]');
    function control(label,action){
        const b=document.createElement('button');
        b.textContent=label;
        b.onclick=()=>{try{action();}catch(error){status.textContent=error.message;}};
        return b;
    }
    const check=control('Check node',()=>{
        const result=exercise.checkNode(id,symbol());
        if(result.correct && leaf && node.children.length)commit(result.message);
        else status.textContent=result.message;
    });
    if(!leaf || stable){
        get('instructions').textContent=leaf?'This leaf belongs to the stable partition.':'Select a leaf in the tree to edit its proposed children.';
        get('tools').append(check);
        return;
    }
    get('instructions').textContent='Choose a child group, then click states in the working DFA to assign them. Click a member again to remove it. Check node compares your groups on the selected symbol.';
    let active=session.minChild??0;
    function draw(focusState) {
        const groups=exercise.childGroups(id);
        active=Math.min(Math.max(0,active),Math.max(0,groups.length-1));
        session.minChild=active;
        get('groups').replaceChildren(...groups.map((group,index)=>{
            const b=control('Child '+(index+1)+' · {'+group.join(', ')+'}',()=>{
                active=index;draw();get('groups').children[index].focus();
            });
            b.setAttribute('aria-pressed',String(index===active));
            return b;
        }));
        remove.disabled=groups.length===0;
        const svg=mountConversionGraph(get('machine'),graphMarkup(exercise.source,groups[active]||[],null,[]),{
            label:'Working DFA partition membership',
            onState:stateId=>{
                try {
                    exercise.toggleMember(id,active,stateId);
                    status.textContent='Child '+(active+1)+' now contains {'+exercise.childGroups(id)[active].join(', ')+'}.';
                    draw(stateId);
                }catch(error){status.textContent=error.message;}
            }
        });
        for(const el of svg.querySelectorAll('[data-state]')){
            const stateId=Number(el.dataset.state);
            if(!node.ids.includes(stateId)){
                el.classList.add('outside-partition');
                el.setAttribute('aria-disabled','true');
                el.removeAttribute('tabindex');
            } else el.setAttribute('aria-pressed',String((groups[active]||[]).includes(stateId)));
        }
        if(focusState!==undefined)svg.querySelector('[data-state="'+focusState+'"]')?.focus();
    }
    const add=control('Add child group',()=>{exercise.addChild(id);active=exercise.childGroups(id).length-1;status.textContent='Child group added.';draw();});
    const remove=control('Remove child group',()=>{exercise.removeChild(id,active);status.textContent='Child group removed.';draw();});
    get('tools').append(add,remove,check);
    draw();
}
