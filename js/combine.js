import {clone} from './automata.js';

const supported=new Set(['fa','pda','mealy','moore','turing','turingbb']);
export function machineFamily(m) {
    if(!supported.has(m?.type))return null;
    return m.type==='turingbb'?'turing':m.type;
}

function checkTapes(machine, count) {
    const tapes=machine.tapes??1;
    if(!Number.isInteger(tapes)||tapes<1||tapes>5||tapes!==count)
        throw Error('Both Turing machines and their building blocks must have the same tape count (1–5).');
    for(const state of machine.states)if(state.block)checkTapes(state.block,count);
}

export function combineMachines(first, second) {
    const family=machineFamily(first);
    if(!family||family!==machineFamily(second))throw Error('Choose two automata of the same machine family.');
    if(family==='turing'){
        const count=first.tapes??1;
        checkTapes(first,count);
        checkTapes(second,count);
    }
    const result=clone(first), appended=clone(second);
    if(family==='turing' && (first.type==='turingbb'||second.type==='turingbb'))result.type='turingbb';
    const nextId=list=>list.reduce((max,item)=>Math.max(max,item.id??-1),-1)+1;
    let nextState=nextId(result.states), nextTransition=nextId(result.transitions);
    const right=result.states.reduce((bound,s)=>Math.max(bound,s.x),-Infinity);
    const left=appended.states.reduce((bound,s)=>Math.min(bound,s.x),Infinity);
    const offset=Math.max(350,right-left+120);
    const mapping=new Map();
    for(const state of appended.states){
        if(mapping.has(state.id))throw Error('The appended machine contains a duplicate state ID.');
        mapping.set(state.id,nextState);
        result.states.push({...state,id:nextState++,x:state.x+offset,initial:false});
    }
    for(const t of appended.transitions){
        if(!mapping.has(t.from)||!mapping.has(t.to))throw Error('An appended transition refers to a missing state.');
        result.transitions.push({...t,id:nextTransition++,from:mapping.get(t.from),to:mapping.get(t.to)});
    }
    result.notes??=[];
    for(const note of appended.notes||[])result.notes.push({...note,x:note.x+offset});
    result.name=(first.name||'Untitled')+' · combined';
    return result;
}
