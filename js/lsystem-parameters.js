// Names and defaults from the original renderer help; picker behavior from
// LSystemInputPane.setEditing and ParameterTableModel.getParameters.
export const drawingParameters=[
 ['angle','15','Turn, pitch and roll angle in degrees'],
 ['angleIncrement','15','Compatibility alias for angle'],
 ['color','black','Line color: original name or RGB/HSB triple'],
 ['distance','15','Length of a drawing or movement step'],
 ['hueChange','10','Hue change in degrees'],
 ['lineIncrement','1','Amount added to or removed from line width'],
 ['lineWidth','1','Line width in pixels'],
 ['polygonColor','red','Polygon fill: original name or RGB/HSB triple']
];
export function parameterRows(text){return text.split(/\r?\n/).filter(s=>s.trim()).map(line=>{const i=line.indexOf('=');if(i<1||!line.slice(0,i).trim())throw Error('Use name = value for parameters.');return[line.slice(0,i).trim(),line.slice(i+1).trim()];});}
export function parameterValues(rows){return Object.fromEntries(rows.filter(([name])=>name.trim()).map(([name,value])=>[name.trim(),value.trim()]));}
export function pickParameter(rows,name){if(!drawingParameters.some(p=>p[0]===name))throw Error('Unknown drawing parameter.');let index=rows.findIndex(row=>row[0]===name);if(index<0){index=rows.length;rows.push([name,'']);}return index;}

export function mountParameterTable(host,text){
 let rows=parameterRows(text.value);
 const intro=document.createElement('p');intro.className='hint';intro.textContent='Names are case-sensitive. The last duplicate row takes effect. Blank names are ignored. Apply changes before saving.';
 const controls=document.createElement('div');controls.className='row';
 const picker=document.createElement('select');picker.setAttribute('aria-label','Recognized drawing parameter');
 picker.add(new Option('Choose a parameter…',''));for(const [name] of drawingParameters)picker.add(new Option(name,name));
 const add=document.createElement('button');add.type='button';add.textContent='Add custom parameter';controls.append(picker,add);
 const hint=document.createElement('p');hint.className='hint';hint.setAttribute('aria-live','polite');
 const table=document.createElement('table');table.className='ls-parameter-table';table.setAttribute('aria-label','Drawing parameters');
 const head=table.createTHead().insertRow();for(const title of ['Name','Value','']){const th=document.createElement('th');th.textContent=title;head.append(th);}
 const body=table.createTBody();host.append(controls,hint,table,intro);
 function sync(){text.value=rows.filter(([name])=>name.trim()).map(([name,value])=>name+' = '+value).join('\n');text.setCustomValidity('');}
 function draw(focus=-1,column=1){body.replaceChildren();rows.forEach((row,index)=>{const tr=body.insertRow();row.forEach((value,col)=>{const input=document.createElement('input');input.value=value;input.setAttribute('aria-label',`Parameter ${index+1} ${col?'value':'name'}`);input.oninput=()=>{row[col]=input.value;sync();};input.onfocus=()=>{const known=drawingParameters.find(p=>p[0]===row[0]);hint.textContent=known?`${known[2]}. Default when omitted: ${known[1]}.`: 'Custom parameters can be used in drawing expressions.';};tr.insertCell().append(input);});const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove parameter ${index+1}`);remove.onclick=()=>{rows.splice(index,1);sync();draw();};tr.insertCell().append(remove);});if(focus>=0)body.rows[focus].cells[column].querySelector('input').focus();}
 picker.onchange=()=>{if(!picker.value)return;const index=pickParameter(rows,picker.value);sync();draw(index);picker.value='';};
 add.onclick=()=>{rows.push(['','']);draw(rows.length-1,0);};
 text.addEventListener('input',()=>{try{rows=parameterRows(text.value);text.setCustomValidity('');picker.disabled=add.disabled=false;hint.textContent='';draw();}catch(e){text.setCustomValidity(e.message);hint.textContent=e.message;picker.disabled=add.disabled=true;body.querySelectorAll('input,button').forEach(el=>el.disabled=true);}});
 draw();
}
