export function mountLRDiagram(host, diagram, graphMarkup) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `<h3>Construct the LR(0) item diagram</h3>
        <p>Add nodes in any order. Move a node by dragging it or pressing its arrow keys. In Draw goto mode, drag from a node to another node or to an empty spot.</p>
        <div class="actions"><button data-add>Add node</button><button data-initial>Mark initial</button><button data-delete>Remove node</button>
        <label>Diagram tool <select data-mode><option>Move nodes</option><option>Draw goto</option></select></label></div>
        <svg class="diagram-small lr-board" role="group" aria-label="LR item diagram" style="width:100%;height:350px;touch-action:none"></svg>
        <div class="actions"><label>Selected node <select data-node></select></label>
        <label>Item <select data-item></select></label><button data-put>Add item</button><button data-drop>Remove item</button><button data-close>Apply closure</button></div>
        <pre aria-label="Items in selected node"></pre>
        <div class="actions"><label>Goto symbol <select data-symbol></select></label><label>Goto target <select data-target></select></label>
        <button data-connect>Draw link</button><button data-unlink>Remove link</button><button data-goto>Compute goto</button></div>
        <button data-check>Check diagram</button><p role="status"></p>`;
    host.replaceChildren(panel);
    const q = selector => panel.querySelector(selector), svg = q('svg'), graph = diagram.graph;
    const select = (attr, pairs, value) => {
        const control = q('[data-' + attr + ']');
        control.replaceChildren(...pairs.map(([id,label]) => new Option(label, id)));
        if (pairs.some(([id]) => String(id) === String(value))) control.value = String(value);
    };
    const allItems = diagram.items.data.rules.flatMap((r, i) => Array.from({length:r.right.length + 1},
        (_, d) => [i + ':' + d, diagram.items.itemText([i,d])]));
    select('item', allItems);
    select('symbol', diagram.items.symbols.map(s => [s,s]));
    let selected = diagram.selected ?? graph.states[0]?.id, drag = null;
    const status = msg => { q('[role=status]').textContent = msg; };
    const refreshGraph = () => {
        svg.innerHTML = graphMarkup(graph, [], {state:selected}, []);
        for (const g of svg.querySelectorAll('[data-state]')) {
            g.setAttribute('role','button');
            g.setAttribute('aria-label','Item node I' + g.dataset.state);
            g.setAttribute('tabindex','0');
        }
    };
    const refresh = () => {
        diagram.selected = selected;
        const nodes = graph.states.map(s => [s.id, s.name + (s.initial ? ' (initial)' : '')]);
        const target = q('[data-target]').value;
        select('node', nodes, selected);
        select('target', [['new','New node'], ...nodes], target);
        const node = graph.states.find(s => s.id === selected);
        q('pre').textContent = node ? node.items.map(i => diagram.items.itemText(i)).join('\n') || 'Empty item set' : 'Add a node to begin.';
        svg.setAttribute('viewBox', '0 0 ' + Math.max(780,...graph.states.map(s => s.x+80)) + ' ' + Math.max(310,...graph.states.map(s => s.y+80)));
        refreshGraph();
    };
    const act = fn => () => {
        try { status(''); fn(); refresh(); } catch (error) { status(error.message); }
    };
    const on = (name, fn) => { q('[data-' + name + ']').onclick = act(fn); };
    const symbol = () => q('[data-symbol]').value;
    const item = () => q('[data-item]').value.split(':').map(Number);
    const connect = (from, to, pos) => {
        diagram.node(from);
        if (!symbol()) throw Error('Choose a grammar symbol.');
        if (to === null) to = diagram.add(pos?.x, pos?.y).id;
        diagram.connect(from, symbol(), to);
        selected = to;
    };
    q('[data-node]').onchange = act(() => { selected = Number(q('[data-node]').value); });
    on('add', () => { selected = diagram.add().id; });
    on('delete', () => { diagram.remove(selected); selected = graph.states[0]?.id; });
    on('initial', () => diagram.initial(selected));
    on('put', () => { const n = diagram.node(selected); n.items = diagram.items.parse(diagram.items.format([...n.items,item()])); });
    on('drop', () => { const n = diagram.node(selected); n.items = n.items.filter(i => i.join(':') !== item().join(':')); });
    on('close', () => { const n = diagram.node(selected); n.items = diagram.items.closure(n.items); });
    on('connect', () => { const to = q('[data-target]').value; connect(selected, to === 'new' ? null : Number(to)); });
    on('unlink', () => { graph.transitions = graph.transitions.filter(t => t.from !== selected || t.read !== symbol()); });
    on('goto', () => { selected = diagram.goto(selected, symbol()); });
    on('check', () => { const result = diagram.check(); status(result.correct ? 'Construction is correct.' : result.errors.join(' ')); });
    const point = e => new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const hit = el => el?.closest?.('[data-state]')?.dataset.state;
    const place = (s,x,y) => { s.x = Math.max(70,x); s.y = Math.max(90,y); };
    svg.onpointerdown = e => {
        const id = hit(e.target);
        if (id === undefined || e.button !== 0) return;
        const n = diagram.node(Number(id)), p = point(e);
        selected = n.id;
        drag = {from:n.id, dx:n.x-p.x, dy:n.y-p.y, link:q('[data-mode]').value === 'Draw goto'};
        svg.setPointerCapture(e.pointerId);
    };
    svg.onpointermove = e => {
        if (!drag || drag.link) return;
        const p = point(e);
        place(diagram.node(drag.from),p.x+drag.dx,p.y+drag.dy);
        refreshGraph();
    };
    svg.onpointerup = e => {
        if (!drag) return;
        const start = drag; drag = null;
        if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId);
        act(() => {
            if (start.link) {
                const el = document.elementFromPoint(e.clientX,e.clientY);
                if (!svg.contains(el)) return;
                const id = hit(el), p = point(e);
                connect(start.from, id === undefined ? null : Number(id), {x:Math.max(70,p.x),y:Math.max(90,p.y)});
            }
        })();
    };
    svg.onpointercancel = () => { drag = null; refresh(); };
    svg.onkeydown = e => {
        const id = hit(e.target);
        if (id === undefined) return;
        const n = diagram.node(Number(id));
        const moves = {ArrowLeft:[-15,0],ArrowRight:[15,0],ArrowUp:[0,-15],ArrowDown:[0,15]};
        if (!(e.key in moves) && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        selected = n.id;
        if (moves[e.key]) place(n,n.x+moves[e.key][0],n.y+moves[e.key][1]);
        refresh();
        svg.querySelector('[data-state="' + n.id + '"]').focus();
    };
    refresh();
}
