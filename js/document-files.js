import {serialize,deserialize,download} from './files.js';

const requiresJSON=m=>m.format==='tokens-v1';
const fileTypes=format=>[{description:format==='json'?'JFLAP JSON model':'JFLAP XML model',accept:format==='json'?{'application/json':['.json']}:{'application/xml':['.jff','.xml']}}];
const encode=(m,format)=>format==='json'?JSON.stringify(m,null,2):serialize(m);

// Handles belong to open documents, never to serialized models or browser backups.
export class DocumentFiles {
 constructor(host=globalThis,downloadFile=download){this.host=host;this.downloadFile=downloadFile;this.entries=new WeakMap();}
 get canSave(){return this.host.isSecureContext!==false&&typeof this.host.showSaveFilePicker==='function';}
 get canOpen(){return this.host.isSecureContext!==false&&typeof this.host.showOpenFilePicker==='function';}
 entry(m){if(!this.entries.has(m))this.entries.set(m,{handle:null,format:requiresJSON(m)?'json':'xml',busy:false});return this.entries.get(m);}
 format(m){return requiresJSON(m)?'json':this.entry(m).format;}
 filename(m){return (m.name||'Untitled')+(this.format(m)==='json'?'.json':'.jff');}
 handleName(m){return this.entry(m).handle?.name||'';}
 transfer(oldModel,newModel){
  const entry=this.entries.get(oldModel);if(entry)this.entries.set(newModel,entry);
  for(const state of oldModel.states||[]){const next=newModel.states?.find(s=>s.id===state.id);if(state.block&&next?.block)this.transfer(state.block,next.block);}
 }
 async read(file,handle=null){
  if(file.size>5*1024*1024)throw Error('Choose a model smaller than 5 MB.');
  const text=await file.text(),m=deserialize(text,file.name.replace(/\.[^.]+$/,''));
  this.entries.set(m,{handle,format:text.trim().startsWith('{')?'json':'xml',busy:false});return m;
 }
 async open(){
  if(!this.canOpen)return null;
  let handles;
  try{handles=await this.host.showOpenFilePicker({multiple:true,types:[...fileTypes('xml'),...fileTypes('json')]});}
  catch(e){if(e.name==='AbortError')return [];throw e;}
  const models=[];for(const handle of handles)models.push(await this.read(await handle.getFile(),handle));return models;
 }
 downloadCopy(m){
  const format=this.format(m);this.downloadFile(encode(m,format),this.filename(m),format==='json'?'application/json':'application/xml');
  return {status:'downloaded',name:this.filename(m)};
 }
 async save(m,{as=false}={}){
  const entry=this.entry(m);if(entry.busy)throw Error('A save for this document is already in progress.');
  entry.busy=true;
  try{
   if(!this.canSave)return this.downloadCopy(m);
   const format=this.format(m);let handle=entry.handle;
   if(as||!handle||format!==entry.format){
    try{handle=await this.host.showSaveFilePicker({suggestedName:this.filename(m),types:fileTypes(format)});}
    catch(e){if(e.name==='AbortError')return {status:'cancelled'};throw e;}
   }
   const contents=encode(m,format);let stream;
   try{stream=await handle.createWritable();await stream.write(contents);await stream.close();}
   catch(e){try{await stream?.abort();}catch{}throw Error('The file could not be saved. Your document is still open. Try Save As or Download copy. '+e.message);}
   // A cancelled/failed Save As must leave the previous association intact.
   entry.handle=handle;entry.format=format;
   return {status:'saved',name:handle.name};
  }finally{entry.busy=false;}
 }
}
