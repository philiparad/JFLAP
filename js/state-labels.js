const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function stateTitle(state){
 return '<title>'+escape(state.name)+(state.label?': '+escape(state.label):'')+'</title>';
}

export function setStateLabelVisibility(visible){
 let style=document.getElementById('state-label-visibility');
 if(!style){style=document.createElement('style');style.id='state-label-visibility';document.head.append(style);}
 // A stylesheet updates live and cached graphs without resetting their operations.
 // Image exports copy this rule along with the rest of the drawing styles.
 style.textContent='.state .label{display:'+(visible?'inline':'none')+'}';
 return !!visible;
}

export function clearStateLabels(machine){
 let count=0;
 for(const state of machine.states||[])if(state.label){state.label='';count++;}
 return count;
}
