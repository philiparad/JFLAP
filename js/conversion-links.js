import {mountConversionGraph} from './conversion-graph.js';

export function mountConversionLinks(panel, {exercise, session, graphMarkup, sourceGraph, inputSelector, fieldAttribute, onSelect}) {
    const box = document.createElement('section');
    const graphHost = document.createElement('div'), status = document.createElement('p');
    const remaining = document.createElement('button');
    remaining.textContent = 'Show unfinished';
    status.setAttribute('role','status');
    box.append(remaining, status, graphHost);
    const table = panel.querySelector('table');
    (table.closest('.scroll') || table).before(box);
    const rows = new Map();
    let selection = new Set([session.selected]), showingRemaining = false;
    const activate = (keys, build = false) => {
        showingRemaining = false;
        selection = new Set(keys);
        if (keys.length) {
            session.selected = keys[0];
            onSelect();
        }
        if (build) {
            for (const key of keys) {
                exercise.fill(key);
                const {inputs, result} = rows.get(key);
                inputs.forEach(el=>{ el.value=exercise.answers[key][el.getAttribute(fieldAttribute)]; });
                result.textContent='Correct';
            }
        }
        draw();
    };
    const byKey = new Map();
    for (const input of panel.querySelectorAll(inputSelector)) {
        const key = input.getAttribute(inputSelector.slice(1,-1));
        if (!byKey.has(key)) byKey.set(key,[]);
        byKey.get(key).push(input);
    }
    for (const job of exercise.jobs) {
        const inputs = byKey.get(job.key) || [];
        if (!inputs.length) continue;
        const row=inputs[0].closest('tr'), heading=row.querySelector('th'), pick=document.createElement('button');
        pick.textContent=heading.textContent;
        pick.title=sourceGraph?'Show the source of this production':'Build the path for this row';
        heading.replaceChildren(pick);
        rows.set(job.key,{row,inputs,result:row.lastElementChild,pick});
        pick.onclick=()=>activate([job.key],!sourceGraph);
        row.addEventListener('focusin',e=>{ if(e.target.matches('input'))activate([job.key]); });
    }
    function draw() {
        const {graph,links}=exercise.linkGraph();
        const unfinished=exercise.jobs.filter(j=>!exercise.checked.has(j.key)).map(j=>j.key);
        if(showingRemaining)selection=new Set(unfinished);
        const states=new Set(), edges=new Set();
        for(const key of selection) {
            const entry=links.get(key);
            entry?.states.forEach(id=>states.add(id));
            entry?.edges.forEach(id=>edges.add(id));
        }
        for(const [key,{row,pick}] of rows) {
            row.classList.toggle('conversion-selected',selection.has(key));
            pick.setAttribute('aria-pressed',String(selection.has(key)));
        }
        const pickGraph=(kind,id)=>{
            const keys=[...links].filter(([,entry])=>entry[kind].includes(id)).map(([key])=>key);
            activate(keys,sourceGraph);
        };
        mountConversionGraph(graphHost, graphMarkup(graph,[...states],null,[...edges]), {
            label:sourceGraph?'Source automaton':'Constructed automaton',
            onState:id=>pickGraph('states',id),onTransition:id=>pickGraph('edges',id)
        });
        const selected=exercise.jobs.filter(j=>selection.has(j.key)).map(j=>j.description);
        status.textContent=unfinished.length+' of '+exercise.jobs.length+' unfinished. '+(showingRemaining?'Unfinished rows: ':'Selected: ')+(selected.join(' · ')||'none');
    }
    remaining.onclick=()=>{showingRemaining=true;draw();};
    draw();
    return draw;
}
