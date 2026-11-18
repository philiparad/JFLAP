export const imageTypes={png:'image/png',jpg:'image/jpeg',gif:'image/gif',bmp:'image/bmp'};
function validate(image){const {width,height,data}=image;if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>10000000||width>65535||height>65535||data.length!==width*height*4)throw Error('Invalid image dimensions or pixels.');}
function white(data,i,c){return Math.round((data[i+c]*data[i+3]+255*(255-data[i+3]))/255);}
export function encodeBMP(image){
 validate(image);const {width:w,height:h,data}=image,stride=(w*3+3)&~3,bytes=new Uint8Array(54+stride*h),v=new DataView(bytes.buffer);
 bytes.set([66,77]);v.setUint32(2,bytes.length,true);v.setUint32(10,54,true);v.setUint32(14,40,true);v.setInt32(18,w,true);v.setInt32(22,h,true);v.setUint16(26,1,true);v.setUint16(28,24,true);v.setUint32(34,stride*h,true);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const src=(y*w+x)*4,dst=54+(h-1-y)*stride+x*3;for(let c=0;c<3;c++)bytes[dst+c]=white(data,src,2-c);}
 return new Blob([bytes],{type:imageTypes.bmp});
}
export function encodeGIF(image){
 validate(image);const {width:w,height:h,data}=image,header=new Uint8Array(13+768+10),v=new DataView(header.buffer);
 header.set(new TextEncoder().encode('GIF89a'));v.setUint16(6,w,true);v.setUint16(8,h,true);header[10]=247;
 for(let i=0;i<256;i++){header[13+i*3]=Math.round((i>>5)*255/7);header[14+i*3]=Math.round(((i>>2)&7)*255/7);header[15+i*3]=(i&3)*85;}
 const start=781;header[start]=44;v.setUint16(start+5,w,true);v.setUint16(start+7,h,true);
 // Reset before the dictionary grows to 10-bit codes; literal LZW is larger,
 // but bounded, deterministic and interoperable without a client dependency.
 const packed=new Uint8Array(Math.ceil((w*h+Math.ceil(w*h/200)+1)*9/8));let pos=0,bits=0,buffer=0;
 const code=value=>{buffer|=value<<bits;bits+=9;while(bits>=8){packed[pos++]=buffer&255;buffer>>>=8;bits-=8;}};
 for(let p=0;p<w*h;p++){if(p%200===0)code(256);const i=p*4;code((Math.round(white(data,i,0)*7/255)<<5)|(Math.round(white(data,i,1)*7/255)<<2)|Math.round(white(data,i,2)*3/255));}code(257);if(bits)packed[pos++]=buffer&255;
 const parts=[header,new Uint8Array([8])];for(let i=0;i<pos;i+=255){const block=packed.subarray(i,Math.min(i+255,pos));parts.push(new Uint8Array([block.length]),block);}parts.push(new Uint8Array([0,59]));return new Blob(parts,{type:imageTypes.gif});
}
export async function rasterImage(svg,format){
 if(!imageTypes[format])throw Error('Unsupported image format.');
 const image=new Image(),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Could not render the graph image.'));image.src=url;});
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 if(!canvas.width||!canvas.height||canvas.width*canvas.height>10000000)throw Error('Image export is limited to 10 million pixels.');
 const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);
 if(format==='gif'||format==='bmp'){const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);return format==='gif'?encodeGIF(pixels):encodeBMP(pixels);}
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,imageTypes[format],0.92));if(!blob||blob.type!==imageTypes[format])throw Error('This browser cannot encode '+format.toUpperCase()+'.');return blob;
 }finally{URL.revokeObjectURL(url);}
}
export function graphImageSVG(markup,css){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','1000');svg.setAttribute('height','650');
 const style=document.createElementNS(svg.namespaceURI,'style');style.textContent=css;svg.append(style);const group=document.createElementNS(svg.namespaceURI,'g');group.innerHTML=markup;svg.append(group);
 svg.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden';document.body.append(svg);
 try{const b=group.getBBox(),box=b.width||b.height?[b.x-40,b.y-40,Math.max(1,b.width)+80,Math.max(1,b.height)+80]:[0,0,1000,650];if(!box.every(Number.isFinite))throw Error('Graph bounds are invalid.');svg.setAttribute('viewBox',box.join(' '));const background=document.createElementNS(svg.namespaceURI,'rect');for(const [key,value] of Object.entries({x:box[0],y:box[1],width:box[2],height:box[3],fill:'white'}))background.setAttribute(key,value);svg.insertBefore(background,group);svg.removeAttribute('style');return new XMLSerializer().serializeToString(svg);}finally{svg.remove();}
}
