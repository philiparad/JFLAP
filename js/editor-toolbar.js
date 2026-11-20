export function mountEditorToolbar(frame, slot) {
    const bar=frame.querySelector('[data-tools]'), commands=document.createElement('div');
    commands.className='palette-commands';
    const handle=document.createElement('button'), toggle=document.createElement('button');
    handle.textContent='Move toolbar';
    handle.title='Drag to move, or use the arrow keys. Escape reattaches the toolbar.';
    toggle.setAttribute('aria-controls',bar.id);
    slot.setAttribute('aria-controls',bar.id);
    commands.append(handle,toggle);
    frame.append(commands);
    let enabled=false, detached=false, x=0, y=0, drag=null;
    function place(left,top) {
        const rect=frame.getBoundingClientRect();
        x=Math.max(4,Math.min(left,window.innerWidth-rect.width-4));
        y=Math.max(4,Math.min(top,window.innerHeight-rect.height-4));
        frame.style.left=x+'px';
        frame.style.top=y+'px';
    }
    function sync() {
        const floating=enabled && detached;
        frame.classList.toggle('editor-palette',enabled);
        frame.classList.toggle('floating',floating);
        commands.hidden=!enabled;
        handle.hidden=slot.hidden=!floating;
        toggle.textContent=floating?'Reattach toolbar':'Detach toolbar';
        toggle.setAttribute('aria-pressed',String(floating));
        if(floating)place(x,y);
        else {frame.style.removeProperty('left');frame.style.removeProperty('top');drag=null;}
    }
    function dock(){
        detached=false;
        sync();
        toggle.focus();
    }
    slot.onclick=dock;
    toggle.onclick=()=>{
        if(detached){dock();return;}
        const rect=frame.getBoundingClientRect();
        detached=true;
        x=rect.left;y=rect.top;
        sync();
        handle.focus();
    };
    handle.onpointerdown=e=>{
        if(e.button!==0)return;
        drag={id:e.pointerId,dx:e.clientX-x,dy:e.clientY-y};
        handle.setPointerCapture(e.pointerId);
    };
    handle.onpointermove=e=>{if(drag?.id===e.pointerId)place(e.clientX-drag.dx,e.clientY-drag.dy);};
    handle.onlostpointercapture=()=>{drag=null;};
    handle.onpointerup=e=>{if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);drag=null;};
    const move={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    frame.addEventListener('keydown',e=>{
        if(!enabled||!detached)return;
        if(e.key==='Escape'){e.preventDefault();dock();return;}
        if(e.target!==handle||!move[e.key])return;
        e.preventDefault();
        const [dx,dy]=move[e.key], step=e.shiftKey?48:12;
        place(x+dx*step,y+dy*step);
    });
    const resize=()=>{if(enabled&&detached)place(x,y);};
    const observer=new ResizeObserver(resize);
    observer.observe(frame);
    window.addEventListener('resize',resize);
    sync();
    return {
        setEditor(active){enabled=active;sync();},
        dispose(){observer.disconnect();window.removeEventListener('resize',resize);}
    };
}
