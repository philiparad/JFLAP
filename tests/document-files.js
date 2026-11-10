import {PumpingGame} from '../js/pumping-game.js';
import {deserialize} from '../js/files.js';
import {DocumentFiles} from '../js/document-files.js';
import {example} from '../js/examples.js';

export async function testDocumentFiles(){
 const results=[],assert=(v,message='Assertion failed')=>{if(!v)throw Error(message);};
 const run=async(name,fn)=>{try{await fn();results.push({name});}catch(error){results.push({name,error});}};
 function handle(name,fail=''){
  return {name,writes:[],aborts:0,async createWritable(){
   if(fail==='permission')throw new DOMException('Permission denied','NotAllowedError');const h=this;let contents;
   return {async write(text){if(fail==='write')throw Error('Disk full');contents=text;},async close(){if(fail==='close')throw Error('Close failed');h.writes.push(contents);},async abort(){h.aborts++;}};
  }};
 }
 await run('Save reuses its file, Save As changes it only after a successful write',async()=>{
  const first=handle('first.jff'),second=handle('second.jff');let calls=0,next=first;
  const files=new DocumentFiles({showSaveFilePicker:async()=>{calls++;return next;}}),m=example('fa');
  assert((await files.save(m)).status==='saved');m.states[0].name='changed';await files.save(m);assert(calls===1&&first.writes.length===2);
  next=second;await files.save(m,{as:true});await files.save(m);assert(calls===2&&second.writes.length===2&&first.writes.length===2);
 });
 await run('Picker cancellation preserves the old association and does not download',async()=>{
  const h=handle('old.jff');let cancel=false,downloads=0;
  const files=new DocumentFiles({showSaveFilePicker:async()=>{if(cancel)throw new DOMException('Cancelled','AbortError');return h;}},()=>downloads++),m=example('fa');
  await files.save(m);cancel=true;assert((await files.save(m,{as:true})).status==='cancelled');assert(files.handleName(m)==='old.jff');await files.save(m);assert(h.writes.length===2&&downloads===0);
 });
 await run('Permission, write and close failures keep associations and abort failed streams',async()=>{
  const old=handle('old.jff');let next=old;const files=new DocumentFiles({showSaveFilePicker:async()=>next}),m=example('fa');await files.save(m);
  for(const kind of ['permission','write','close']){next=handle('failed.jff',kind);let rejected=false;try{await files.save(m,{as:true});}catch(e){rejected=e.message.includes('still open');}assert(rejected);assert(files.handleName(m)==='old.jff');assert(next.writes.length===0);assert(next.aborts===(kind==='permission'?0:1));}
  await files.save(m);assert(old.writes.length===2);
 });
 await run('Unavailable picker uses an explicit unassociated download, without mutating models',async()=>{
  const copies=[],files=new DocumentFiles({},(...args)=>copies.push(args)),m=example('fa'),before=JSON.stringify(m);
  assert((await files.save(m)).status==='downloaded');assert(!files.handleName(m));assert(copies[0][1].endsWith('.jff'));assert(JSON.stringify(m)===before);
 });
 await run('File opening retains the actual handle and preserves JSON format',async()=>{
  const m=example('fa'),h=handle('input.json');h.getFile=async()=>new File([JSON.stringify(m)],h.name);
  const files=new DocumentFiles({showOpenFilePicker:async()=>[h],showSaveFilePicker:async()=>{throw Error('Unexpected picker');}});
  const [opened]=await files.open();await files.save(opened);assert(JSON.parse(h.writes[0]).type==='fa');assert(files.handleName(opened)==='input.json');assert(files.format(opened)==='json');
 });
 await run('Undo replacements retain the association; independent documents do not share it',async()=>{
  const first=handle('one.jff'),second=handle('two.jff');let next=first;
  const files=new DocumentFiles({showSaveFilePicker:async()=>next}),m=example('fa');await files.save(m);
  const replacement=structuredClone(m);files.transfer(m,replacement);await files.save(replacement);assert(first.writes.length===2);
  next=second;await files.save(example('fa'));assert(second.writes.length===1&&first.writes.length===2);
 });
 await run('Concurrent saves cannot race the same document, including during undo replacement',async()=>{
  let release;const h=handle('one.jff'),files=new DocumentFiles({showSaveFilePicker:()=>new Promise(r=>release=()=>r(h))}),m=example('fa');
  const pending=files.save(m),replacement=structuredClone(m);files.transfer(m,replacement);let blocked=false;
  try{await files.save(replacement);}catch(e){blocked=e.message.includes('in progress');}assert(blocked);release();await pending;assert(files.handleName(replacement)==='one.jff');
 });
 await run('Open cancellation and invalid models do not create writable document associations',async()=>{
  const files=new DocumentFiles({showOpenFilePicker:async()=>{throw new DOMException('Cancelled','AbortError');}});assert((await files.open()).length===0);
  let rejected=false;try{await files.read(new File(['<broken>'],'bad.jff'),handle('bad.jff'));}catch{rejected=true;}assert(rejected);
 });
 await run('New pumping games save linked XML with resumable progress',async()=>{
  const h=handle('game.jff'),files=new DocumentFiles({showSaveFilePicker:async()=>h}),game=new PumpingGame('AnEven'),model={type:'pumpingreg',language:'AnEven',name:'Game'};
  game.chooseLength(3);model.game=game.snapshot();await files.save(model);assert(files.format(model)==='xml'&&h.writes[0].includes('<web-game>'));assert(deserialize(h.writes[0]).game.phase==='word');
  game.chooseWord('aaaa','computer');model.game=game.snapshot();await files.save(model);assert(h.writes.length===2&&deserialize(h.writes[1]).game.phase==='split');
 });
 return results;
}
