export function tapeMoveChoices(move='R',allowStay=true){return{value:!allowStay&&move==='S'?'R':move,options:[['L','Left'],['R','Right'],...(allowStay?[['S','Stay']]:[])]};}
