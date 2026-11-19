// The companion list remains usable when several edges share endpoints.
export function mountConversionGraph(host, markup, {label, onState, onTransition} = {}) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'diagram-small conversion-graph');
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', label || 'Conversion diagram');
    svg.innerHTML = markup;
    host.replaceChildren(svg);
    const bounds = svg.getBBox();
    svg.setAttribute('viewBox', [bounds.x - 32, bounds.y - 32,
        Math.max(1, bounds.width) + 64, Math.max(1, bounds.height) + 64].join(' '));
    for (const [name, handler] of [['state', onState], ['transition', onTransition]]) {
        if (!handler) continue;
        for (const group of svg.querySelectorAll('[data-' + name + ']')) {
            const id = Number(group.dataset[name]);
            group.setAttribute('role', 'button');
            group.setAttribute('tabindex', '0');
            group.setAttribute('aria-label', (name === 'state' ? 'State ' : 'Transition ') + id);
            group.style.cursor = 'pointer';
            group.onclick = () => handler(id);
            group.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handler(id);
                }
            };
        }
    }
    return svg;
}
