// Exact java.awt.Color constants plus JFLAP 7.1 Turtle.COLORS.
const constants={white:[255,255,255],lightGray:[192,192,192],gray:[128,128,128],darkGray:[64,64,64],black:[0,0,0],red:[255,0,0],pink:[255,175,175],orange:[255,200,0],yellow:[255,255,0],green:[0,255,0],magenta:[255,0,255],cyan:[0,255,255],blue:[0,0,255]};
export const lsystemPalette=Object.freeze({...constants,...Object.fromEntries(Object.entries(constants).map(([name,value])=>[name.replace(/[A-Z]/g,c=>'_'+c).toUpperCase(),value])),dukeBlue:[0,0,156],brown:[129,0,0],oliveDrab:[114,93,0],darkOliveGreen:[109,111,0],orangeRed:[252,118,0],maroon:[190,0,0],forestGreen:[0,127,0],purple:[209,0,255],springGreen:[193,255,157],violetRed:[210,0,205],goldenrod:[255,214,0],darkOliveGreen2:[10,127,0]});
const f=Math.fround;
function javaFloat(text){
 const s=text.trim();
 if(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?[fd]?$/i.test(s))return f(Number(s.replace(/[fd]$/i,'')));
 const hex=/^([+-]?)0x([\da-f]*\.?[\da-f]+|[\da-f]+\.?)p([+-]?\d+)[fd]?$/i.exec(s);
 if(!hex)return NaN;
 const [whole,fraction='']=hex[2].split('.');let value=parseInt(whole||'0',16);
 for(let i=0;i<fraction.length;i++)value+=parseInt(fraction[i],16)*16**(-i-1);
 return f((hex[1]==='-'?-1:1)*value*2**Number(hex[3]));
}
function hsb(h,s,b){
 if(s===0){const gray=Math.trunc(f(f(b*255)+.5));return [gray,gray,gray];}
 const sector=f(f(h-Math.floor(h))*6),fraction=f(sector-Math.floor(sector));
 const p=f(b*f(1-s)),q=f(b*f(1-f(s*fraction))),t=f(b*f(1-f(s*f(1-fraction))));
 // Float rounding can reach sector 6 at the seam; wrap to red, not Java's black fallthrough.
 const rgb=[[b,t,p],[q,b,p],[p,b,t],[p,q,b],[t,p,b],[b,p,q]][Math.trunc(sector)%6];
 return rgb.map(c=>Math.trunc(f(f(c*255)+.5)));
}
export function parseLSystemColor(value){
 const source=String(value);
 if(Object.hasOwn(lsystemPalette,source))return [...lsystemPalette[source]];
 // java.util.StringTokenizer skips empty comma fields and consumes three tokens.
 const tokens=source.split(',').filter(s=>s!=='');
 const values=tokens.slice(0,3).map(javaFloat);
 if(values.length!==3||values.some(v=>!Number.isFinite(v)||v<0||v>255))throw Error('Invalid L-system color: '+source+'. Use an original color name or three RGB/HSB values.');
 return values.every(v=>v<=1)?hsb(...values):values.map(Math.trunc);
}
export const lsystemColorCSS=value=>'rgb('+parseLSystemColor(value).join(', ')+')';
export const rgbCSS=rgb=>'rgb('+rgb.join(', ')+')';
// Java Color.RGBtoHSB uses float32 intermediates and derives each shift from
// the current quantized RGB color, rather than accumulating a separate hue.
export function shiftLSystemHue(rgb,degrees){
 if(!Number.isFinite(degrees)||!Number.isFinite(f(degrees)))throw Error('Hue change must be a finite angle.');
 const [r,g,b]=rgb,max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min;
 if(delta===0)return [...rgb];
 const brightness=f(max/255),saturation=f(delta/max);
 const rc=f((max-r)/delta),gc=f((max-g)/delta),bc=f((max-b)/delta);
 let hue=r===max?f(bc-gc):g===max?f(f(2+rc)-bc):f(f(4+gc)-rc);
 hue=f(hue/6);if(hue<0)hue=f(hue+1);
 return hsb(f(hue+f(f(degrees)/360)),saturation,brightness);
}
export function hueIncrement(degrees){
 if(!Number.isFinite(degrees))throw Error('Hue change must be a finite angle.');
 let remainder=degrees%360;
 if(Math.abs(remainder)>180)remainder-=Math.sign(remainder)*360;
 else if(Math.abs(remainder)===180&&Math.abs(Math.trunc(degrees/360)%2)===1)remainder=-remainder;
 return remainder;
}
